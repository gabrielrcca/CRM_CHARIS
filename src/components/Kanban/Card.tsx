import { Draggable } from '@hello-pangea/dnd';
import type { CrmLead } from '../../types';
import { Phone, MessageCircle, Instagram, Globe, User, Linkedin, Mail, ExternalLink } from 'lucide-react';

interface CardProps {
    lead: CrmLead;
    index: number;
}

export const Card = ({ lead, index }: CardProps) => {
    const getSourceIcon = (source: string | null) => {
        switch (source?.toLowerCase()) {
            case 'facebook':
            case 'meta':
            case 'instagram':
                return <Instagram size={14} className="text-pink-500" />;
            case 'google':
                return <Globe size={14} className="text-blue-500" />;
            case 'linkedin':
                return <Linkedin size={14} className="text-sky-500" />;
            case 'email':
                return <Mail size={14} className="text-amber-500" />;
            default:
                return <User size={14} className="text-gray-500" />;
        }
    };

    const handleWhatsApp = () => {
        if (lead.phone) {
            const cleanPhone = lead.phone.replace(/\D/g, '');
            window.open(`https://wa.me/55${cleanPhone}`, '_blank');
        }
    };

    const handleCall = () => {
        if (lead.phone) {
            window.open(`tel:${lead.phone}`, '_blank');
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
            bg-white dark:bg-charis-card p-4 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-lg group
            hover:border-charis-gold/30 hover:shadow-md transition-all mb-3 relative overflow-hidden
            ${snapshot.isDragging ? 'rotate-2 scale-105 z-50 border-charis-gold shadow-2xl' : ''}
          `}
                >
                    {/* Accent decoration */}
                    <div className="absolute top-0 left-0 w-1 h-full bg-charis-gold/50 group-hover:bg-charis-gold transition-colors"></div>

                    <div className="flex justify-between items-start mb-3 pl-2">
                        <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 dark:text-white/90 text-sm truncate">{lead.name}</h4>
                            {lead.company && (
                                <p className="text-xs text-gray-500 truncate">{lead.company}</p>
                            )}
                            <div className="flex items-center gap-1.5 mt-1">
                                {getSourceIcon(lead.source)}
                                <span className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">
                                    {lead.source || 'Manual'}
                                </span>
                                {lead.utm_campaign && (
                                    <span className="text-[10px] text-gray-400 dark:text-gray-600 truncate max-w-[80px]" title={lead.utm_campaign}>
                                        • {lead.utm_campaign}
                                    </span>
                                )}
                            </div>
                        </div>

                        {lead.value && lead.value > 0 && (
                            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-400/20 flex-shrink-0">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lead.value)}
                            </span>
                        )}
                    </div>

                    {/* Tags */}
                    {lead.tags && lead.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3 pl-2">
                            {lead.tags.slice(0, 3).map((tag, i) => (
                                <span key={i} className="text-[10px] bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded">
                                    {tag}
                                </span>
                            ))}
                            {lead.tags.length > 3 && (
                                <span className="text-[10px] text-gray-400 dark:text-gray-500">+{lead.tags.length - 3}</span>
                            )}
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/5 pl-2">
                        <span className="text-[10px] text-gray-400 dark:text-gray-600 block">
                            {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                        </span>

                        <div className="flex gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                            {lead.phone && (
                                <>
                                    <button
                                        onClick={handleWhatsApp}
                                        className="p-1.5 rounded-full hover:bg-green-500/20 hover:text-green-500 text-gray-400 transition-colors"
                                        title="WhatsApp"
                                    >
                                        <MessageCircle size={14} />
                                    </button>
                                    <button
                                        onClick={handleCall}
                                        className="p-1.5 rounded-full hover:bg-blue-500/20 hover:text-blue-500 text-gray-400 transition-colors"
                                        title="Ligar"
                                    >
                                        <Phone size={14} />
                                    </button>
                                </>
                            )}
                            <button
                                className="p-1.5 rounded-full hover:bg-amber-500/20 hover:text-amber-500 text-gray-400 transition-colors"
                                title="Ver detalhes"
                            >
                                <ExternalLink size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Draggable>
    );
};
