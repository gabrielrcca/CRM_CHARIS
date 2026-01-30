import { DragDropContext } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { Column } from './Column';
import { useLeadsStore } from '../../store/useLeadsStore';
import type { KanbanColumn, LeadStatus } from '../../types';
import { Loader2 } from 'lucide-react';

// Mapeamento removido: STAGE_TO_STATUS
// Stages agora são totalmente dinâmicos e baseados no ID do banco.

export const Board = () => {
    const { leads, stages, moveLead, isLoading } = useLeadsStore();

    // Converter stages do banco para colunas do Kanban
    // Se não houver stages carregados, o Kanban ficará vazio até que sejam criados (via inicialização ou modal)
    const columns: KanbanColumn[] = stages.map((stage) => ({
        id: stage.id,
        title: stage.name,
        color: stage.color || '#6B7280',
        stageId: stage.id,
    }));

    // Se stages estiver vazio e não estiver carregando, pode ser primeira vez.
    // Mas o store deve inicializar defaults. Vamos confiar no store.
    const displayColumns: KanbanColumn[] = columns;

    const onDragEnd = (result: DropResult) => {
        const { destination, draggableId } = result;

        if (!destination) return;

        if (
            destination.droppableId === result.source.droppableId &&
            destination.index === result.source.index
        ) {
            return;
        }

        // destination.droppableId já é o stage.id (definido em columns.map)
        const newStageId = destination.droppableId;

        // Não passamos status string, pois stages são dinâmicos. 
        // Backend deve assumir apenas stage_id ou manter status atual.
        moveLead(draggableId, newStageId);
    };

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-charis-gold animate-spin" />
                    <p className="text-gray-400 text-sm">Carregando leads...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-x-auto">
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex gap-6 h-full min-w-max pb-4">
                    {displayColumns.map((column) => {
                        const columnLeads = leads.filter((lead) => lead.stage_id === column.id);
                        return <Column key={column.id} column={column} leads={columnLeads} />;
                    })}
                </div>
            </DragDropContext>
        </div>
    );
};
