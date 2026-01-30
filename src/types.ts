// Este arquivo mantém compatibilidade com imports antigos
// Os tipos reais estão em ./types/database.ts

export type {
    LeadStatus,
    CrmLead,
    CrmStage,
    CrmPipeline,
    CrmActivity,
    KanbanColumn,
    Profile,
    Database
} from './types/database';

// Alias para compatibilidade com código antigo
export type Lead = import('./types/database').CrmLead;
