import { useState } from 'react';
import { X, User, Building2, Mail, Phone, DollarSign, Tag, MessageSquare } from 'lucide-react';
import { useLeadsStore } from '../../store/useLeadsStore';
import type { LeadStatus } from '../../types';

interface AddLeadModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultStageId?: string;
}

export const AddLeadModal = ({ isOpen, onClose, defaultStageId }: AddLeadModalProps) => {
    const { addLead, stages, userId } = useLeadsStore();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        value: '',
        source: 'manual',
        notes: '',
        tags: '',
    });
    const [selectedStageId, setSelectedStageId] = useState(defaultStageId || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) return;

        setIsSubmitting(true);

        try {
            const stageId = selectedStageId || stages[0]?.id;

            await addLead({
                client_id: userId,
                name: formData.name,
                email: formData.email || null,
                phone: formData.phone || null,
                company: formData.company || null,
                value: formData.value ? parseFloat(formData.value) : null,
                source: formData.source,
                notes: formData.notes || null,
                tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : null,
                stage_id: stageId || null,
                status: 'new' as LeadStatus,
                owner_id: null,
                utm_source: null,
                utm_medium: null,
                utm_campaign: null,
                utm_content: null,
                utm_term: null,
                click_id: null,
                conversion_path: null,
            });

            // Reset form
            setFormData({
                name: '',
                email: '',
                phone: '',
                company: '',
                value: '',
                source: 'manual',
                notes: '',
                tags: '',
            });
            onClose();
        } catch (err) {
            console.error('Error adding lead:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white dark:bg-charis-card border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-lg mx-4 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/10">
                    <h2 className="text-xl font-serif font-bold text-gray-900 dark:text-white">Novo Lead</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Nome *
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Nome do lead"
                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-charis-gold/50 transition-all"
                                required
                            />
                        </div>
                    </div>

                    {/* Company */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Empresa
                        </label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="text"
                                value={formData.company}
                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                placeholder="Nome da empresa"
                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-charis-gold/50 transition-all"
                            />
                        </div>
                    </div>

                    {/* Email & Phone Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="email@exemplo.com"
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-charis-gold/50 transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Telefone
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="(11) 99999-9999"
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-charis-gold/50 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Value & Source Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Valor Potencial
                            </label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    type="number"
                                    value={formData.value}
                                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                    placeholder="0,00"
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-charis-gold/50 transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Origem
                            </label>
                            <select
                                value={formData.source}
                                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-charis-gold/50 transition-all"
                            >
                                <option value="manual">Manual</option>
                                <option value="facebook">Facebook/Meta</option>
                                <option value="google">Google Ads</option>
                                <option value="instagram">Instagram</option>
                                <option value="linkedin">LinkedIn</option>
                                <option value="indication">Indicação</option>
                                <option value="website">Site</option>
                            </select>
                        </div>
                    </div>

                    {/* Stage */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Etapa do Funil
                        </label>
                        <select
                            value={selectedStageId}
                            onChange={(e) => setSelectedStageId(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-charis-gold/50 transition-all"
                        >
                            {stages.map((stage) => (
                                <option key={stage.id} value={stage.id}>
                                    {stage.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Tags (separadas por vírgula)
                        </label>
                        <div className="relative">
                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="text"
                                value={formData.tags}
                                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                placeholder="VIP, Urgente, Black Friday"
                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-charis-gold/50 transition-all"
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Observações
                        </label>
                        <div className="relative">
                            <MessageSquare className="absolute left-3 top-3 text-gray-500" size={18} />
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Anotações sobre o lead..."
                                rows={3}
                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-charis-gold/50 transition-all resize-none"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !formData.name}
                            className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-charis-gold to-amber-500 text-charis-dark font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {isSubmitting ? 'Salvando...' : 'Adicionar Lead'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
