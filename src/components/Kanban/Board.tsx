
import { DragDropContext } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { Column } from './Column';
import { useLeadsStore } from '../../store/useLeadsStore';
import type { KanbanColumn, LeadStatus } from '../../types';

export const Board = () => {
    const { leads, moveLead } = useLeadsStore();

    const columns: KanbanColumn[] = [
        { id: 'new', title: 'Novos Leads', color: '#60A5FA' }, // Blue
        { id: 'contacted', title: 'Em Contato', color: '#F59E0B' }, // Amber
        { id: 'scheduled', title: 'Agendados', color: '#A855F7' }, // Purple
        { id: 'showed_up', title: 'Compareceram', color: '#EC4899' }, // Pink
        { id: 'closed', title: 'Fechamento', color: '#10B981' }, // Emerald
        { id: 'lost', title: 'Perdidos', color: '#EF4444' }, // Red
    ];

    const onDragEnd = (result: DropResult) => {
        const { destination, draggableId } = result;

        if (!destination) return;

        if (
            destination.droppableId === result.source.droppableId &&
            destination.index === result.source.index
        ) {
            return;
        }

        const newStatus = destination.droppableId as LeadStatus;
        moveLead(draggableId, newStatus);
    };

    return (
        <div className="h-full overflow-x-auto">
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex gap-6 h-full min-w-max pb-4">
                    {columns.map((column) => {
                        const columnLeads = leads.filter((lead) => lead.status === column.id);
                        return <Column key={column.id} column={column} leads={columnLeads} />;
                    })}
                </div>
            </DragDropContext>
        </div>
    );
};
