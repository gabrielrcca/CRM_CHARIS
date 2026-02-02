import { Draggable } from '@hello-pangea/dnd';
import type { CrmLead } from '../../types';
import {
    Phone,
    MessageCircle,
    Instagram,
    Globe,
    Linkedin,
    Mail,
    ExternalLink,
    Star,
    Clock,
    Facebook,
    MessageSquare,
    Zap
} from 'lucide-react';

interface CardProps {
    lead: CrmLead;
    index: number;
    onClick: () => void;
}

export const Card = ({ lead, index, onClick }: CardProps) => {
    const getSourceIcon = (source: string | null) => {
        const s = source?.toLowerCase();
        if (s?.includes('facebook')) return <Facebook size={12} className="text-[#1877F2]" />;
        if (s?.includes('instagram')) return <Instagram size={12} className="text-[#E4405F]" />;
        if (s?.includes('google')) return <Globe size={12} className="text-[#4285F4]" />;
        if (s?.includes('linkedin')) return <Linkedin size={12} className="text-[#0A66C2]" />;
        if (s?.includes('whatsapp')) return <MessageSquare size={12} className="text-[#25D366]" />;
        if (s?.includes('email')) return <Mail size={12} className="text-charis-gold" />;
        return <Zap size={12} className="text-charis-gold" />;
    };

    const handleWhatsApp = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (lead.phone) {
            const cleanPhone = lead.phone.replace(/\D/g, '');
            window.open(`https://wa.me/55${cleanPhone}`, '_blank');
        }
    };

    const handleCall = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (lead.phone) {
            window.open(`tel:${lead.phone}`, '_blank');
        }
    };

    const getTimeAgo = (date: string) => {
        const now = new Date();
        const created = new Date(date);
        const diffInMs = now.getTime() - created.getTime();
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInDays > 0) return `${diffInDays}d`;
        if (diffInHours > 0) return `${diffInHours}h`;
        return 'Agora';
    };

    return (
        <Draggable draggableId={lead.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`
                        bg-white dark:bg-charis-navy/40 dark:backdrop-blur-md p-4 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm group cursor-pointer
                        hover:border-charis-gold/50 hover:shadow-xl hover:shadow-charis-gold/5 transition-all duration-300 mb-4 mx-1 relative
                        ${snapshot.isDragging ? 'rotate-2 scale-105 z-50 border-charis-gold shadow-2xl bg-white/90 dark:bg-charis-navy/80' : ''}
                    `}
                    onClick={onClick}
                >
                    {/* Urgency/Cold Indicator based on score */}
                    {(lead.lead_score || 0) >= 4 && (
                        <div className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-charis-gold opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-charis-gold"></span>
                        </div>
                    )}

                    <div className="flex justify-between items-start mb-3">
                        <div className="flex-1 min-w-0 pr-2">
                            <div className="flex items-center gap-1.5 mb-1">
                                {getSourceIcon(lead.source)}
                                <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-bold">
                                    {lead.source || 'Manual'}
                                </span>
                            </div>
                            <h4 className="font-bold text-gray-900 dark:text-white text-[15px] leading-tight group-hover:text-charis-gold transition-colors">
                                {lead.name}
                            </h4>
                        </div>

                        <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500">
                            <Clock size={10} />
                            <span className="text-[10px] whitespace-nowrap">{getTimeAgo(lead.created_at)}</span>
                        </div>
                    </div>

                    {/* Value - More Prominent */}
                    <div className="mb-3">
                        {lead.value && lead.value > 0 ? (
                            <div className="text-lg font-serif font-bold text-gray-900 dark:text-charis-gold leading-none">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lead.value)}
                            </div>
                        ) : (
                            <span className="text-xs text-gray-300 dark:text-gray-700 font-medium">Sem valor definido</span>
                        )}
                    </div>

                    <div className="flex items-center justify-between">
                        {/* Score (Stars) */}
                        <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    size={11}
                                    className={star <= (lead.lead_score || 0) ? "fill-charis-gold text-charis-gold" : "text-gray-200 dark:text-gray-800"}
                                />
                            ))}
                        </div>

                        {/* Communication Shortcuts */}
                        <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                            {lead.phone && (
                                <>
                                    <button
                                        onClick={handleWhatsApp}
                                        className="p-1.5 rounded-full bg-gray-50 dark:bg-white/5 hover:bg-green-500/10 hover:text-green-500 text-gray-500 dark:text-gray-400 transition-all active:scale-95"
                                        title="WhatsApp"
                                    >
                                        <MessageSquare size={13} />
                                    </button>
                                    <button
                                        onClick={handleCall}
                                        className="p-1.5 rounded-full bg-gray-50 dark:bg-white/5 hover:bg-charis-gold/10 hover:text-charis-gold text-gray-500 dark:text-gray-400 transition-all active:scale-95"
                                        title="Ligar"
                                    >
                                        <Phone size={13} />
                                    </button>
                                </>
                            )}
                            <button
                                onClick={(e) => { e.stopPropagation(); onClick(); }}
                                className="p-1.5 rounded-full bg-gray-50 dark:bg-white/5 hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-all active:scale-95"
                            >
                                <ExternalLink size={13} />
                            </button>
                        </div>
                    </div>

                    {/* Tags at bottom if exist */}
                    {lead.tags && lead.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-gray-100 dark:border-white/5">
                            {lead.tags.slice(0, 3).map((tag, i) => (
                                <span key={i} className="text-[9px] font-bold bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-md uppercase tracking-tighter">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </Draggable>
    );
};
