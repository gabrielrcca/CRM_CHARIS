import { create } from 'zustand';
import { supabase } from '../services/supabase';
import type { CrmLead, CrmStage, LeadStatus } from '../types/database';

interface LeadsState {
    // Data
    leads: CrmLead[];
    stages: CrmStage[];
    isLoading: boolean;
    error: string | null;
    userId: string | null;

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

    setUserId: (userId: string | null) => void;
    fetchLeads: () => Promise<void>;
    fetchStages: () => Promise<void>;
    initializeDefaultPipeline: () => Promise<void>;
}

// Cores padrão para os estágios
const DEFAULT_STAGE_COLORS: Record<string, string> = {
    'Novos Leads': '#60A5FA',
    'Em Contato': '#F59E0B',
    'Agendados': '#A855F7',
    'Proposta': '#EC4899',
    'Negociação': '#14B8A6',
    'Fechamento': '#10B981',
    'Perdidos': '#EF4444',
};

export const useLeadsStore = create<LeadsState>((set, get) => ({
    leads: [],
    stages: [],
    isLoading: false,
    error: null,
    userId: null,

    setUserId: (userId) => set({ userId }),

    fetchStages: async () => {
        const { userId } = get();
        if (!userId) return;

        try {
            const { data, error } = await supabase
                .from('crm_stages')
                .select('*')
                .eq('client_id', userId)
                .order('order', { ascending: true }); // Fixed: position -> order

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
            const { error } = await supabase.from('crm_leads').insert({
                ...lead,
                client_id: userId,
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

            const newOrder = stages.length > 0 ? Math.max(...stages.map(s => s.order || 0)) + 1 : 0;

            const { error } = await supabase.from('crm_stages').insert({
                ...stage,
                client_id: userId,
                pipeline_id: pipelineId,
                order: newOrder
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


    // Cria pipeline e estágios padrão se não existirem
    initializeDefaultPipeline: async () => {
        const { userId, fetchStages } = get();
        if (!userId) return;

        try {
            // Verificar se já existe um pipeline
            const { data: existingPipelines } = await supabase
                .from('crm_pipelines')
                .select('id')
                .eq('client_id', userId)
                .limit(1);

            if (existingPipelines && existingPipelines.length > 0) {
                // Já existe, só buscar os stages
                await fetchStages();
                return;
            }

            // Criar pipeline padrão
            const { data: newPipeline, error: pipelineError } = await supabase
                .from('crm_pipelines')
                .insert({
                    client_id: userId,
                    name: 'Funil de Vendas',
                    is_default: true,
                })
                .select()
                .single();

            if (pipelineError) throw pipelineError;

            // Criar estágios padrão
            const defaultStages = [
                { name: 'Novos Leads', order: 0 },
                { name: 'Em Contato', order: 1 },
                { name: 'Agendados', order: 2 },
                { name: 'Proposta', order: 3 },
                { name: 'Negociação', order: 4 },
                { name: 'Fechamento', order: 5 },
                { name: 'Perdidos', order: 6 },
            ];

            const stagesToInsert = defaultStages.map((stage) => ({
                pipeline_id: newPipeline.id,
                client_id: userId,
                name: stage.name,
                order: stage.order, // Fixed: position -> order
                color: DEFAULT_STAGE_COLORS[stage.name] || '#6B7280',
            }));

            const { error: stagesError } = await supabase
                .from('crm_stages')
                .insert(stagesToInsert);

            if (stagesError) throw stagesError;

            await fetchStages();
        } catch (err) {
            console.error('Error initializing pipeline:', err);
            set({ error: 'Erro ao inicializar funil' });
        }
    },
}));
