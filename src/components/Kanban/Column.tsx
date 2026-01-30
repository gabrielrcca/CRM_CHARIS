import { Droppable } from '@hello-pangea/dnd';
import type { KanbanColumn, CrmLead } from '../../types';
import { Card } from './Card';
import { MoreHorizontal, Plus } from 'lucide-react';

interface ColumnProps {
    column: KanbanColumn;
    leads: CrmLead[];
}

export const Column = ({ column, leads }: ColumnProps) => {
    // Calcular valor total da coluna
    const totalValue = leads.reduce((sum, lead) => sum + (lead.value || 0), 0);

    return (
        <div className="flex flex-col h-full min-w-[320px] w-[320px]">
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-700 dark:text-gray-200">{column.title}</h3>
                    <span className="bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-400 text-xs px-2 py-0.5 rounded-full font-medium">
                        {leads.length}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <button className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <Plus size={16} />
                    </button>
                    <button className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <MoreHorizontal size={16} />
                    </button>
                </div>
            </div>

            {/* Decorative Line */}
            <div
                className="h-1 w-full rounded-full mb-2 opacity-50"
                style={{ backgroundColor: column.color }}
            ></div>

            {/* Total Value Indicator */}
            {totalValue > 0 && (
                <div className="text-xs text-gray-500 mb-3 px-1">
                    Total: <span className="text-emerald-500 dark:text-emerald-400 font-medium">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}
                    </span>
                </div>
            )}

            {/* Droppable Area */}
            <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`
                flex-1 overflow-y-auto px-1 scrollbar-none pb-20
                ${snapshot.isDraggingOver ? 'bg-gray-100 dark:bg-white/[0.02] rounded-xl' : ''}
                transition-colors
            `}
                    >
                        {leads.length === 0 && !snapshot.isDraggingOver && (
                            <div className="text-center py-8 text-gray-600 text-sm">
                                Nenhum lead nesta etapa
                            </div>
                        )}
                        {leads.map((lead, index) => (
                            <Card key={lead.id} lead={lead} index={index} />
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    );
};
