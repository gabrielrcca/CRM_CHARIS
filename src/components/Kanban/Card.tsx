
import { Draggable } from '@hello-pangea/dnd';
import type { Lead } from '../../types';
import { Phone, MessageCircle, Instagram, Globe, User } from 'lucide-react';

interface CardProps {
    lead: Lead;
    index: number;
}

export const Card = ({ lead, index }: CardProps) => {
    const getSourceIcon = (source: string) => {
        switch (source) {
            case 'Meta': return <Instagram size={14} className="text-pink-500" />;
            case 'Google': return <Globe size={14} className="text-blue-500" />;
            default: return <User size={14} className="text-gray-500" />;
        }
    };

    return (
        <Draggable draggableId={lead.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`
            bg-charis-card p-4 rounded-xl border border-white/5 shadow-lg group
            hover:border-charis-gold/30 hover:shadow-xl transition-all mb-3 relative overflow-hidden
            ${snapshot.isDragging ? 'rotate-2 scale-105 z-50 border-charis-gold shadow-2xl' : ''}
          `}
                >
                    {/* Accent decoration */}
                    <div className="absolute top-0 left-0 w-1 h-full bg-charis-gold/50 group-hover:bg-charis-gold transition-colors"></div>

                    <div className="flex justify-between items-start mb-3 pl-2">
                        <div>
                            <h4 className="font-semibold text-white/90 text-sm">{lead.name}</h4>
                            <div className="flex items-center gap-1.5 mt-1">
                                {getSourceIcon(lead.source)}
                                <span className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">{lead.source}</span>
                            </div>
                        </div>

                        {lead.value && (
                            <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lead.value)}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/5 pl-2">
                        <span className="text-[10px] text-gray-600 block">
                            {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                        </span>

                        <div className="flex gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button className="p-1.5 rounded-full hover:bg-green-500/20 hover:text-green-500 text-gray-400 transition-colors">
                                <MessageCircle size={14} />
                            </button>
                            <button className="p-1.5 rounded-full hover:bg-blue-500/20 hover:text-blue-500 text-gray-400 transition-colors">
                                <Phone size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Draggable>
    );
};
