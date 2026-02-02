import { create } from 'zustand';
import { supabase } from '../services/supabase';
import type { CrmLead, CrmStage, LeadStatus, CrmFieldDefinition, CrmPipeline } from '../types/database';

interface LeadsState {
    // Data
    leads: CrmLead[];
    stages: CrmStage[];
    isLoading: boolean;
    error: string | null;
    userId: string | null;
    currentPipelineId: string | null;


    // Actions
    moveLead: (leadId: string, newStageId: string, newStatus?: LeadStatus) => Promise<void>;
    addLead: (lead: Partial<CrmLead>) => Promise<void>;
    updateLead: (leadId: string, updates: Partial<CrmLead>) => Promise<void>;
    deleteLead: (leadId: string) => Promise<void>;

    // Stage Actions
    addStage: (stage: Partial<CrmStage>) => Promise<void>;
    updateStage: (stageId: string, updates: Partial<CrmStage>) => Promise<void>;
    deleteStage: (stageId: string) => Promise<void>;
    reorderStages: (stages: CrmStage[]) => Promise<void>;

    // Custom Fields Actions
    fieldDefinitions: CrmFieldDefinition[];
    fetchFieldDefinitions: () => Promise<void>;
    addFieldDefinition: (field: Partial<CrmFieldDefinition>) => Promise<void>;
    deleteFieldDefinition: (fieldId: string) => Promise<void>;

    pipelines: CrmPipeline[];
    fetchPipelines: () => Promise<void>;
    addPipeline: (pipeline: Partial<CrmPipeline>) => Promise<CrmPipeline | null>;
    setCurrentPipeline: (pipelineId: string) => void;

    setUserId: (userId: string | null) => void;
    fetchLeads: () => Promise<void>;
    fetchStages: () => Promise<void>;
    initializeDefaultPipeline: () => Promise<void>;
    createPipelineFromTemplate: (template: { name: string, stages: { name: string, color: string, type: 'open' | 'won' | 'lost' }[] }) => Promise<void>;
}

// Cores padrão para os estágios
const DEFAULT_STAGE_COLORS: Record<string, string> = {
    'Lead novos': '#60A5FA',
    'Em tratativa': '#F59E0B',
    'Fechado': '#10B981',
    'Perdidos': '#EF4444',
};


export const useLeadsStore = create<LeadsState>((set, get) => ({
    leads: [],
    pipelines: [],
    stages: [],
    fieldDefinitions: [],
    isLoading: false,
    error: null,
    userId: null,
    currentPipelineId: null,


    setUserId: (userId) => set({ userId }),

    fetchStages: async () => {
        const { userId, currentPipelineId } = get();
        if (!userId) return;

        try {
            let query = supabase
                .from('crm_stages')
                .select('*')
                .eq('client_id', userId);

            if (currentPipelineId) {
                query = query.eq('pipeline_id', currentPipelineId);
            }

            const { data, error } = await query.order('order', { ascending: true });

            if (error) throw error;
            set({ stages: (data || []) as CrmStage[] });
        } catch (err) {
            console.error('Error fetching stages:', err);
            set({ error: 'Erro ao carregar estágios' });
        }
    },


    fetchLeads: async () => {
        const { userId } = get();
        if (!userId) return;

        set({ isLoading: true, error: null });

        try {
            const { data, error } = await supabase
                .from('crm_leads')
                .select('*')
                .eq('client_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            set({ leads: (data || []) as CrmLead[], isLoading: false });
        } catch (err) {
            console.error('Error fetching leads:', err);
            set({ error: 'Erro ao carregar leads', isLoading: false });
        }
    },

    moveLead: async (leadId, newStageId, newStatus) => {
        const { leads } = get();

        // Optimistic update
        set({
            leads: leads.map((lead) =>
                lead.id === leadId
                    ? { ...lead, stage_id: newStageId, status: newStatus || lead.status }
                    : lead
            ),
        });

        try {
            const updateData: Record<string, unknown> = { stage_id: newStageId };
            if (newStatus) updateData.status = newStatus;

            const { error } = await supabase
                .from('crm_leads')
                .update(updateData)
                .eq('id', leadId);

            if (error) throw error;
        } catch (err) {
            console.error('Error moving lead:', err);
            // Revert on error
            get().fetchLeads();
        }
    },

    addLead: async (lead) => {
        const { userId, fetchLeads } = get();
        if (!userId) return;

        try {
            const { currentPipelineId } = get();
            const { error } = await supabase.from('crm_leads').insert({
                ...lead,
                client_id: userId,
                pipeline_id: lead.pipeline_id || currentPipelineId,
            });


            if (error) throw error;
            await fetchLeads();
        } catch (err) {
            console.error('Error adding lead:', err);
            set({ error: 'Erro ao adicionar lead' });
        }
    },

    updateLead: async (leadId, updates) => {
        const { leads, fetchLeads } = get();

        // Optimistic update
        set({
            leads: leads.map((lead) =>
                lead.id === leadId ? { ...lead, ...updates } : lead
            ),
        });

        try {
            const { error } = await supabase
                .from('crm_leads')
                .update(updates)
                .eq('id', leadId);

            if (error) throw error;
        } catch (err) {
            console.error('Error updating lead:', err);
            await fetchLeads();
        }
    },

    deleteLead: async (leadId) => {
        const { leads, fetchLeads } = get();

        // Optimistic update
        set({ leads: leads.filter((lead) => lead.id !== leadId) });

        try {
            const { error } = await supabase
                .from('crm_leads')
                .delete()
                .eq('id', leadId);

            if (error) throw error;
        } catch (err) {
            console.error('Error deleting lead:', err);
            await fetchLeads();
        }
    },

    // --- Stage Actions ---

    addStage: async (stage) => {
        const { userId, fetchStages, stages } = get();
        if (!userId) return;

        try {
            // Se pipeline_id não fornecido, tentar pegar do primeiro stage existente
            let pipelineId = stage.pipeline_id;
            if (!pipelineId && stages.length > 0) {
                pipelineId = stages[0].pipeline_id;
            }

            // Se ainda não tiver pipelineId, buscar do banco
            if (!pipelineId) {
                const { data: pipeline } = await supabase
                    .from('crm_pipelines')
                    .select('id')
                    .eq('client_id', userId)
                    .single();
                if (pipeline) pipelineId = pipeline.id;
            }

            if (!pipelineId) throw new Error("Pipeline ID not found");

            // Tenta inserir ANTES das colunas de fechamento (Ganho/Perdido)
            let newOrder = stages.length;
            const closingStage = stages.find(s => s.type === 'won' || s.type === 'lost');

            if (closingStage) {
                newOrder = closingStage.order;
                // Shift orders of existing stages from this point forward
                const stagesToShift = stages.filter(s => s.order >= newOrder);
                for (const s of stagesToShift) {
                    await supabase.from('crm_stages').update({ order: s.order + 1 }).eq('id', s.id);
                }
            }

            const { error } = await supabase.from('crm_stages').insert({
                ...stage,
                client_id: userId,
                pipeline_id: pipelineId,
                order: newOrder,
                type: stage.type || 'open'
            });


            if (error) throw error;
            await fetchStages();
        } catch (err) {
            console.error('Error adding stage:', err);
            set({ error: 'Erro ao adicionar estágio' });
        }
    },

    updateStage: async (stageId, updates) => {
        const { stages, fetchStages } = get();

        // Optimistic
        set({
            stages: stages.map(s => s.id === stageId ? { ...s, ...updates } : s)
        });

        try {
            const { error } = await supabase
                .from('crm_stages')
                .update(updates)
                .eq('id', stageId);

            if (error) throw error;
            // No need to fetch if optimistic worked, but safety first for complex state
        } catch (err) {
            console.error('Error updating stage:', err);
            await fetchStages(); // Revert
        }
    },

    deleteStage: async (stageId) => {
        const { stages, fetchStages } = get();
        const stage = stages.find(s => s.id === stageId);

        if (stage && ['Lead novos', 'Em tratativa', 'Fechado', 'Perdidos'].includes(stage.name)) {
            set({ error: 'Etapas padrão não podem ser excluídas.' });
            return;
        }

        // Optimistic
        set({ stages: stages.filter(s => s.id !== stageId) });

        try {
            const { error } = await supabase
                .from('crm_stages')
                .delete()
                .eq('id', stageId);

            if (error) throw error;
        } catch (err) {
            console.error('Error deleting stage:', err);
            await fetchStages(); // Revert
            set({ error: 'Erro ao deletar estágio (verifique se há leads nele)' });
        }
    },

    reorderStages: async (newStages) => {
        set({ stages: newStages });

        try {
            // Update all stages orders
            // This can be heavy if many stages, but usually it's < 10.
            const updates = newStages.map((stage, index) => ({
                id: stage.id,
                order: index,
            }));

            // Supabase upsert doesn't work well for partial updates without all required fields unless configured.
            // Better loop updates or use RPC. For < 10 items, loop is fine (or Promise.all).

            const promises = updates.map(u =>
                supabase.from('crm_stages').update({ order: u.order }).eq('id', u.id)
            );

            await Promise.all(promises);

        } catch (err) {
            console.error('Error reordering stages:', err);
            get().fetchStages();
        }
    },


    // --- Custom Fields Actions ---

    fetchFieldDefinitions: async () => {
        const { userId } = get();
        if (!userId) return;

        try {
            const { data, error } = await supabase
                .from('crm_field_definitions')
                .select('*')
                .eq('client_id', userId)
                .order('order', { ascending: true });

            if (error) throw error;
            set({ fieldDefinitions: (data || []) as CrmFieldDefinition[] });
        } catch (err) {
            console.error('Error fetching field definitions:', err);
        }
    },

    addFieldDefinition: async (field) => {
        const { userId, fetchFieldDefinitions } = get();
        if (!userId) return;

        try {
            const { error } = await supabase
                .from('crm_field_definitions')
                .insert({
                    ...field,
                    client_id: userId
                });

            if (error) throw error;
            await fetchFieldDefinitions();
        } catch (err) {
            console.error('Error adding field definition:', err);
            set({ error: 'Erro ao adicionar campo personalizado' });
        }
    },

    deleteFieldDefinition: async (fieldId) => {
        const { fetchFieldDefinitions } = get();
        try {
            const { error } = await supabase
                .from('crm_field_definitions')
                .delete()
                .eq('id', fieldId);

            if (error) throw error;
            await fetchFieldDefinitions();
        } catch (err) {
            console.error('Error deleting field definition:', err);
            set({ error: 'Erro ao deletar campo personalizado' });
        }
    },

    fetchPipelines: async () => {
        const { userId } = get();
        if (!userId) return;

        try {
            const { data, error } = await supabase
                .from('crm_pipelines')
                .select('*')
                .eq('client_id', userId)
                .order('created_at', { ascending: true });

            if (error) throw error;

            const pipelines = (data || []) as CrmPipeline[];
            set({ pipelines });

            // Set default pipeline if none selected
            if (!get().currentPipelineId && pipelines.length > 0) {
                const defaultPipeline = pipelines.find(p => p.is_default) || pipelines[0];
                get().setCurrentPipeline(defaultPipeline.id);
            }
        } catch (err) {
            console.error('Error fetching pipelines:', err);
        }
    },

    addPipeline: async (pipeline) => {
        const { userId, fetchPipelines } = get();
        if (!userId) return null;

        try {
            const { data, error } = await supabase.from('crm_pipelines').insert({
                ...pipeline,
                client_id: userId
            }).select().single();

            if (error) throw error;
            await fetchPipelines();
            return data as CrmPipeline;
        } catch (err) {
            console.error('Error adding pipeline:', err);
            throw err;
        }
    },

    setCurrentPipeline: (pipelineId) => {
        set({ currentPipelineId: pipelineId });
        get().fetchStages();
        // We might want to filter leads by pipeline too later, or view all
    },

    // Cria pipeline e estágios padrão se não existirem
    initializeDefaultPipeline: async () => {
        const { userId, fetchPipelines } = get();
        if (!userId) return;

        await fetchPipelines();

        // Check if any pipeline exists after fetch
        const { pipelines } = get();
        if (pipelines.length === 0) {
            try {
                // 1. Create Default Pipeline
                const { data: newPipeline, error: pipelineError } = await supabase
                    .from('crm_pipelines')
                    .insert({
                        name: 'Funil de Vendas',
                        is_default: true,
                        client_id: userId
                    })
                    .select()
                    .single();

                if (pipelineError) throw pipelineError;

                // 2. Create Default Stages
                const stagesToCreate = Object.entries(DEFAULT_STAGE_COLORS).map(([name, color], index) => ({
                    pipeline_id: newPipeline.id,
                    client_id: userId,
                    name,
                    color,
                    order: index,
                    type: (name === 'Fechado' ? 'won' : name === 'Perdidos' ? 'lost' : 'open') as 'open' | 'won' | 'lost'
                }));

                const { error: stagesError } = await supabase
                    .from('crm_stages')
                    .insert(stagesToCreate);

                if (stagesError) throw stagesError;

                // Refresh
                await fetchPipelines();
            } catch (e) {
                console.error("Failed to create default pipeline", e);
            }
        }
    },

    createPipelineFromTemplate: async (template) => {
        const { userId, fetchPipelines } = get();
        if (!userId) return;

        try {
            // 1. Create Pipeline
            const { data: pipeline, error: pipelineError } = await supabase
                .from('crm_pipelines')
                .insert({
                    name: template.name,
                    client_id: userId,
                    is_default: false
                })
                .select()
                .single();

            if (pipelineError) throw pipelineError;

            // 2. Create Stages
            const stagesToInsert = template.stages.map((stage, index) => ({
                pipeline_id: pipeline.id,
                client_id: userId,
                name: stage.name,
                color: stage.color,
                type: stage.type,
                order: index
            }));

            const { error: stagesError } = await supabase
                .from('crm_stages')
                .insert(stagesToInsert);

            if (stagesError) throw stagesError;

            // 3. Refresh and Select
            await fetchPipelines();
            get().setCurrentPipeline(pipeline.id); // This will trigger fetchStages

        } catch (err) {
            console.error('Error creating pipeline template:', err);
            throw err;
        }
    }
}));
