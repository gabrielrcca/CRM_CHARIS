import { create } from 'zustand';
import type { Lead, LeadStatus } from '../types';

interface LeadsState {
    leads: Lead[];
    moveLead: (leadId: string, newStatus: LeadStatus) => void;
    addLead: (lead: Lead) => void;
}

// Mock Data Initial State
const initialLeads: Lead[] = [
    { id: '1', name: 'Ana Silva', phone: '11999999999', source: 'Meta', status: 'new', createdAt: '2024-03-10', value: 5000 },
    { id: '2', name: 'Carlos Oliveira', phone: '11988888888', source: 'Google', status: 'new', createdAt: '2024-03-11' },
    { id: '3', name: 'Mariana Souza', phone: '21977777777', source: 'Indication', status: 'contacted', createdAt: '2024-03-09', tags: ['Interessado'] },
    { id: '4', name: 'Roberto Santos', phone: '31966666666', source: 'Meta', status: 'scheduled', createdAt: '2024-03-08', value: 12000 },
    { id: '5', name: 'Julia Lima', phone: '41955555555', source: 'Manual', status: 'showed_up', createdAt: '2024-03-05' },
    { id: '6', name: 'Empresa XYZ', phone: '51944444444', source: 'Google', status: 'closed', createdAt: '2024-02-20', value: 25000 },
];

export const useLeadsStore = create<LeadsState>((set) => ({
    leads: initialLeads,

    moveLead: (leadId, newStatus) => set((state) => ({
        leads: state.leads.map((lead) =>
            lead.id === leadId ? { ...lead, status: newStatus } : lead
        )
    })),

    addLead: (lead) => set((state) => ({
        leads: [...state.leads, lead]
    })),
}));
