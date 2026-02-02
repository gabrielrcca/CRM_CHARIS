import { useState, useEffect } from 'react';
import { Board } from '../components/Kanban/Board';
import { AddLeadModal } from '../components/Kanban/AddLeadModal';
import { Filter, UserPlus, RefreshCw, Search, Settings, LayoutDashboard } from 'lucide-react';
import { PipelineConfigModal } from '../components/Kanban/PipelineConfigModal';
import { LeadDetailModal } from '../components/Kanban/LeadDetailModal';
import { useLeadsStore } from '../store/useLeadsStore';

import { useAuthStore } from '../store/useAuthStore';

export const LeadsPage = () => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const {
        fetchLeads,
        leads,
        isLoading,
        pipelines,
        currentPipelineId,
        setCurrentPipeline,
        fetchPipelines
    } = useLeadsStore();

    useEffect(() => {
        fetchPipelines();
    }, []);
    const { profile } = useAuthStore();

    // Only Manager can edit pipeline settings
    const canConfigure = profile?.role === 'manager';

    const handleRefresh = () => {
        fetchLeads();
    };

    // Contadores rápidos
    const totalLeads = leads.length;
    const totalValue = leads.reduce((sum, lead) => sum + (lead.value || 0), 0);

    return (
        <div className="flex flex-col h-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 px-6 md:px-8 pt-6 md:pt-8">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-2">Pipeline de Vendas</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        {totalLeads} leads • Total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}
                    </p>
                </div>

                <div className="flex flex-wrap gap-3 items-center">
                    {pipelines.length > 1 && (
                        <div className="relative group">
                            <select
                                value={currentPipelineId || ''}
                                onChange={(e) => setCurrentPipeline(e.target.value)}
                                className="appearance-none bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg pl-4 pr-10 py-2 text-sm text-gray-800 dark:text-white font-medium focus:outline-none focus:border-charis-gold/50 min-w-[180px] cursor-pointer"
                            >
                                {pipelines.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            <LayoutDashboard className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                        </div>
                    )}

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
                        <input
                            type="text"
                            placeholder="Buscar leads..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-800 dark:text-white placeholder-gray-500 focus:outline-none focus:border-charis-gold/50 w-48 transition-colors"
                        />
                    </div>

                    <button
                        onClick={handleRefresh}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                        <span className="hidden sm:inline">Atualizar</span>
                    </button>

                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300 transition-colors">
                        <Filter size={18} />
                        <span className="hidden sm:inline">Filtrar</span>
                    </button>

                    {/* Config Button - Only Manager */}
                    {canConfigure && (
                        <button
                            onClick={() => setIsConfigOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300 transition-colors"
                            title="Configurar Funil"
                        >
                            <Settings size={18} />
                        </button>
                    )}

                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-charis-gold text-charis-dark font-semibold hover:bg-yellow-600 transition-colors"
                    >
                        <UserPlus size={18} />
                        <span>Novo Lead</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-x-auto overflow-y-hidden px-6 md:px-8 pb-4 custom-scrollbar">
                <Board onCardClick={(id) => setSelectedLeadId(id)} />
            </div>

            {/* Add Lead Modal */}
            <AddLeadModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
            />

            <PipelineConfigModal
                isOpen={isConfigOpen}
                onClose={() => setIsConfigOpen(false)}
            />

            <LeadDetailModal
                leadId={selectedLeadId}
                isOpen={!!selectedLeadId}
                onClose={() => setSelectedLeadId(null)}
            />
        </div>
    );
};
