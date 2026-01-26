export type LeadStatus = 'new' | 'contacted' | 'scheduled' | 'showed_up' | 'closed' | 'lost';

export interface Lead {
    id: string;
    name: string;
    phone: string;
    email?: string;
    source: 'Meta' | 'Google' | 'Manual' | 'Indication';
    status: LeadStatus;
    value?: number;
    createdAt: string;
    avatar?: string;
    tags?: string[];
}

export interface KanbanColumn {
    id: LeadStatus;
    title: string;
    color: string; // Hex for the accent border
}
