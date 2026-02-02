
import { useState, useEffect } from 'react';
import { X, Building2, Mail, Phone, DollarSign, MessageSquare, Calendar, Star, Trash2 } from 'lucide-react';
import { useLeadsStore } from '../../store/useLeadsStore';
import type { CrmLead } from '../../types/database';
import clsx from 'clsx';

interface LeadDetailModalProps {
    leadId: string | null;
    isOpen: boolean;
    onClose: () => void;
}

export const LeadDetailModal = ({ leadId, isOpen, onClose }: LeadDetailModalProps) => {
    const { leads, updateLead, deleteLead, fieldDefinitions, fetchFieldDefinitions } = useLeadsStore();
    const lead = leads.find(l => l.id === leadId);

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<CrmLead>>({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (lead) {
            setFormData(lead);
        }
        if (isOpen) {
            fetchFieldDefinitions();
        }
    }, [lead, isOpen, fetchFieldDefinitions]);

    if (!isOpen || !lead) return null;

    const handleSave = async () => {
        if (!leadId) return;
        setIsSaving(true);
        try {
            await updateLead(leadId, formData);
            setIsEditing(false);
        } catch (err) {
            console.error('Error updating lead:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!leadId) return;
        if (confirm('Tem certeza que deseja excluir este lead?')) {
            await deleteLead(leadId);
            onClose();
        }
    };

    const handleScoreChange = async (newScore: number) => {
        if (!leadId) return;
        setFormData({ ...formData, lead_score: newScore });
        await updateLead(leadId, { lead_score: newScore });
    };

    const renderCustomField = (field: any) => {
        const val = (formData.custom_fields as any)?.[field.key] || '';

        if (field.type === 'select') {
            return (
                <select
                    value={val}
                    onChange={(e) => setFormData({
                        ...formData,
                        custom_fields: { ...(formData.custom_fields || {}), [field.key]: e.target.value }
                    })}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-charis-gold/50"
                    disabled={!isEditing}
                >
                    <option value="">Selecione...</option>
                    {field.options?.map((opt: string) => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
            );
        }

        return (
            <input
                type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                value={val}
                onChange={(e) => setFormData({
                    ...formData,
                    custom_fields: { ...(formData.custom_fields || {}), [field.key]: e.target.value }
                })}
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-charis-gold/50"
                disabled={!isEditing}
            />
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white dark:bg-charis-card border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-charis-gold to-yellow-800 flex items-center justify-center text-charis-dark font-bold text-xl">
                            {lead.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-xl font-serif font-bold text-gray-900 dark:text-white leading-tight">{lead.name}</h2>
                            <p className="text-sm text-gray-500 uppercase tracking-widest">{lead.status}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-4 py-2 text-sm font-medium text-charis-dark bg-charis-gold rounded-lg hover:bg-yellow-600 transition-colors"
                            >
                                Editar
                            </button>
                        ) : (
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-4 py-2 text-sm font-medium text-charis-dark bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors"
                            >
                                {isSaving ? 'Salvando...' : 'Salvar'}
                            </button>
                        )}
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    {/* Key Metrics / Lead Score */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5">
                            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Star size={12} /> Lead Score</p>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        size={20}
                                        className={clsx(
                                            "cursor-pointer transition-colors",
                                            (formData.lead_score || 0) >= star ? "fill-charis-gold text-charis-gold" : "text-gray-300 dark:text-gray-700"
                                        )}
                                        onClick={() => handleScoreChange(star)}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5">
                            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><DollarSign size={12} /> Valor Potencial</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lead.value || 0)}
                            </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5">
                            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Calendar size={12} /> Criado em</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                            </p>
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-charis-gold uppercase tracking-wider">Informações de Contato</h3>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm">
                                    <Mail size={16} className="text-gray-400" />
                                    {isEditing ? (
                                        <input
                                            value={formData.email || ''}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="bg-transparent border-b border-gray-200 dark:border-white/10 w-full focus:border-charis-gold outline-none"
                                        />
                                    ) : (
                                        <span className="text-gray-800 dark:text-gray-300">{lead.email || 'Não informado'}</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Phone size={16} className="text-gray-400" />
                                    {isEditing ? (
                                        <input
                                            value={formData.phone || ''}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="bg-transparent border-b border-gray-200 dark:border-white/10 w-full focus:border-charis-gold outline-none"
                                        />
                                    ) : (
                                        <span className="text-gray-800 dark:text-gray-300">{lead.phone || 'Não informado'}</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Building2 size={16} className="text-gray-400" />
                                    {isEditing ? (
                                        <input
                                            value={formData.company || ''}
                                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                            className="bg-transparent border-b border-gray-200 dark:border-white/10 w-full focus:border-charis-gold outline-none"
                                        />
                                    ) : (
                                        <span className="text-gray-800 dark:text-gray-300">{lead.company || 'Pessoa Física'}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-charis-gold uppercase tracking-wider">Rastreamento</h3>
                            <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl space-y-2">
                                <p className="text-xs text-gray-500">Origem: <span className="text-gray-900 dark:text-white font-medium">{lead.source || 'Manual'}</span></p>
                                <p className="text-xs text-gray-500">Campanha: <span className="text-gray-900 dark:text-white font-medium">{lead.utm_campaign || '-'}</span></p>
                                <p className="text-xs text-gray-500">Conteúdo: <span className="text-gray-900 dark:text-white font-medium">{lead.utm_content || '-'}</span></p>
                            </div>
                        </div>
                    </div>

                    {/* Custom Fields */}
                    {fieldDefinitions.length > 0 && (
                        <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-white/5">
                            <h3 className="text-sm font-semibold text-charis-gold uppercase tracking-wider">Campos Personalizados</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                {fieldDefinitions.map((field) => (
                                    <div key={field.id} className="space-y-1">
                                        <label className="text-xs text-gray-500">{field.label}</label>
                                        {renderCustomField(field)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-white/5">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-charis-gold uppercase tracking-wider">Notas</h3>
                            <MessageSquare size={16} className="text-gray-400" />
                        </div>
                        <textarea
                            value={formData.notes || ''}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Adicione observações sobre a negociação..."
                            rows={4}
                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-charis-gold/50 resize-none"
                            disabled={!isEditing}
                        />
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-between items-center pt-8">
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-2 text-xs text-red-500 hover:text-red-400 transition-colors uppercase font-bold tracking-widest"
                        >
                            <Trash2 size={14} /> Excluir Lead
                        </button>
                        <p className="text-[10px] text-gray-500">ID: {lead.id}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
