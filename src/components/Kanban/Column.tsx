
import { Droppable } from '@hello-pangea/dnd';
import type { KanbanColumn, Lead } from '../../types';
import { Card } from './Card';
import { MoreHorizontal, Plus } from 'lucide-react';

interface ColumnProps {
    column: KanbanColumn;
    leads: Lead[];
}

export const Column = ({ column, leads }: ColumnProps) => {
    return (
        <div className="flex flex-col h-full min-w-[320px] w-[320px]">
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-200">{column.title}</h3>
                    <span className="bg-white/10 text-gray-400 text-xs px-2 py-0.5 rounded-full font-medium">
                        {leads.length}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <button className="p-1 text-gray-500 hover:text-white transition-colors">
                        <Plus size={16} />
                    </button>
                    <button className="p-1 text-gray-500 hover:text-white transition-colors">
                        <MoreHorizontal size={16} />
                    </button>
                </div>
            </div>

            {/* Decorative Line */}
            <div
                className="h-1 w-full rounded-full mb-4 opacity-50"
                style={{ backgroundColor: column.color }}
            ></div>

            {/* Droppable Area */}
            <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`
                flex-1 overflow-y-auto px-1 scrollbar-none pb-20
                ${snapshot.isDraggingOver ? 'bg-white/[0.02] rounded-xl' : ''}
                transition-colors
            `}
                    >
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
