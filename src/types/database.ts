// Tipos gerados a partir do banco de dados Supabase
// Tabelas: crm_leads, crm_stages, crm_pipelines, crm_activities, profiles

export type LeadStatus = 'new' | 'contacted' | 'scheduled' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';

export interface Profile {
    id: string;
    email: string | null;
    role: 'manager' | 'commercial' | 'consultant' | 'client' | 'admin' | 'crm_agent';
    company_name: string | null;
    ad_account_id: string | null;
    parent_id: string | null; // ID do gestor se for sub-usuário
    has_crm_access?: boolean;
    created_at: string;
}

export interface CrmPipeline {
    id: string;
    client_id: string;
    name: string;
    is_default: boolean;
    created_at: string;
}

export interface CrmStage {
    id: string;
    pipeline_id: string;
    client_id: string;
    name: string;
    order: number;
    color: string | null;
    type: 'open' | 'won' | 'lost';
    created_at: string;
}

export interface CrmLead {
    id: string;
    client_id: string;
    stage_id: string | null;
    name: string;
    email: string | null;
    phone: string | null;
    company: string | null;
    source: string | null;
    value: number | null;
    status: LeadStatus;
    tags: string[] | null;
    notes: string | null;
    owner_id: string | null;
    // UTM Tracking
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
    utm_content: string | null;
    utm_term: string | null;
    click_id: string | null;
    conversion_path: object | null;
    created_at: string;
    updated_at: string;
}

export interface CrmActivity {
    id: string;
    client_id: string;
    lead_id: string;
    type: 'call' | 'email' | 'meeting' | 'note' | 'whatsapp';
    description: string | null;
    done_at: string;
    created_by: string | null;
}

// Insert/Update types (sem campos auto-gerados)
export type CrmLeadInsert = Omit<CrmLead, 'id' | 'created_at' | 'updated_at'>;
export type CrmLeadUpdate = Partial<CrmLeadInsert>;

export type CrmStageInsert = Omit<CrmStage, 'id' | 'created_at'>;
export type CrmPipelineInsert = Omit<CrmPipeline, 'id' | 'created_at'>;

// Database schema type for Supabase client
export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: Profile;
                Insert: Omit<Profile, 'created_at'>;
                Update: Partial<Profile>;
            };
            crm_pipelines: {
                Row: CrmPipeline;
                Insert: CrmPipelineInsert;
                Update: Partial<CrmPipelineInsert>;
            };
            crm_stages: {
                Row: CrmStage;
                Insert: CrmStageInsert;
                Update: Partial<CrmStageInsert>;
            };
            crm_leads: {
                Row: CrmLead;
                Insert: CrmLeadInsert;
                Update: CrmLeadUpdate;
            };
            crm_activities: {
                Row: CrmActivity;
                Insert: Omit<CrmActivity, 'id'>;
                Update: Partial<CrmActivity>;
            };
        };
    };
}

// UI Types (para o Kanban)
export interface KanbanColumn {
    id: string;
    title: string;
    color: string;
    stageId?: string; // Referência ao stage real no banco
}
