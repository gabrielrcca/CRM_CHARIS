import { useState } from 'react';
import { X, Plus, Trash2, GripVertical, Check } from 'lucide-react';

interface StageDraft {
    id: string; // Temp ID for React keys
    name: string;
    color: string;
    type: 'open' | 'won' | 'lost';
    isLocked?: boolean;
}

interface CreatePipelineModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { name: string; stages: Omit<StageDraft, 'id'>[] }) => Promise<void>;
}

export const CreatePipelineModal = ({ isOpen, onClose, onSave }: CreatePipelineModalProps) => {
    const [name, setName] = useState('');
    const [stages, setStages] = useState<StageDraft[]>([
        { id: '1', name: 'Lead Novos', color: '#60A5FA', type: 'open', isLocked: true },
        { id: '2', name: 'Em Tratativa', color: '#F59E0B', type: 'open', isLocked: true },
        { id: '3', name: 'Fechado', color: '#10B981', type: 'won', isLocked: true },
        { id: '4', name: 'Perdidos', color: '#EF4444', type: 'lost', isLocked: true },
    ]);
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleAddStage = () => {
        const newStage: StageDraft = {
            id: Math.random().toString(36).substr(2, 9),
            name: 'Nova Etapa',
            color: '#9CA3AF',
            type: 'open',
            isLocked: false
        };

        // Insert before "Fechado" and "Perdidos" (the last 2)
        const insertIndex = stages.length - 2;
        const newStages = [...stages];
        newStages.splice(insertIndex, 0, newStage);
        setStages(newStages);
    };

    const handleRemoveStage = (id: string) => {
        const stage = stages.find(s => s.id === id);
        if (stage?.isLocked) return;
        setStages(stages.filter(s => s.id !== id));
    };

    const handleUpdateStage = (id: string, field: keyof StageDraft, value: any) => {
        const stage = stages.find(s => s.id === id);
        if (stage?.isLocked && (field === 'name' || field === 'type')) return; // Prevent renaming or changing type of locked stages
        setStages(stages.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    const handleSave = async () => {
        if (!name.trim()) {
            alert('Digite o nome do funil');
            return;
        }
        if (stages.length === 0) {
            alert('Adicione pelo menos uma etapa');
            return;
        }

        setIsLoading(true);
        try {
            await onSave({
                name,
                stages: stages.map(({ id, isLocked, ...rest }) => rest)
            });
            onClose();
            setName('');
            // Reset to default suggestion
            setStages([
                { id: '1', name: 'Lead Novos', color: '#60A5FA', type: 'open', isLocked: true },
                { id: '2', name: 'Em Tratativa', color: '#F59E0B', type: 'open', isLocked: true },
                { id: '3', name: 'Fechado', color: '#10B981', type: 'won', isLocked: true },
                { id: '4', name: 'Perdidos', color: '#EF4444', type: 'lost', isLocked: true },
            ]);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-charis-card w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                    <h2 className="text-xl font-bold font-serif text-gray-900 dark:text-white">Novo Funil de Vendas</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1 space-y-6">

                    {/* Pipeline Name */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                            Nome do Funil
                        </label>
                        <input
                            type="text"
                            placeholder="Ex: Funil de Implantes, Funil de Parcerias..."
                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-charis-gold transition-colors"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                        />
                    </div>

                    {/* Stages Configuration */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Etapas do Processo
                            </label>
                            <button
                                onClick={handleAddStage}
                                className="text-xs font-bold text-charis-gold hover:text-charis-gold-dark flex items-center gap-1"
                            >
                                <Plus size={14} /> ADICIONAR ETAPA (Meio do Funil)
                            </button>
                        </div>

                        <div className="space-y-2">
                            {stages.map((stage, index) => (
                                <div key={stage.id} className={`
                                    flex items-center gap-3 p-3 rounded-xl border transition-all group
                                    ${stage.isLocked
                                        ? 'bg-gray-100 dark:bg-white/5 border-transparent opacity-80'
                                        : 'bg-white dark:bg-black/20 border-gray-100 dark:border-white/10 hover:border-gray-200'}
                                `}>
                                    <div className={`text-gray-400 ${stage.isLocked ? 'cursor-not-allowed opacity-50' : 'cursor-move'}`}>
                                        <GripVertical size={16} />
                                    </div>

                                    {/* Color Picker (Simple Select for now) */}
                                    <input
                                        type="color"
                                        value={stage.color}
                                        onChange={(e) => handleUpdateStage(stage.id, 'color', e.target.value)}
                                        className="w-8 h-8 rounded cursor-pointer bg-transparent border-none p-0"
                                        title="Cor da Etapa"
                                    />

                                    <input
                                        type="text"
                                        value={stage.name}
                                        onChange={(e) => handleUpdateStage(stage.id, 'name', e.target.value)}
                                        className={`flex-1 bg-transparent border-none outline-none text-sm font-medium placeholder-gray-400 ${stage.isLocked ? 'text-gray-500 cursor-not-allowed' : 'text-gray-900 dark:text-white'
                                            }`}
                                        placeholder="Nome da etapa"
                                        disabled={stage.isLocked}
                                    />

                                    {stage.isLocked && (
                                        <span className="text-xs text-gray-400 px-2 italic">Fixo</span>
                                    )}

                                    {!stage.isLocked && (
                                        <select
                                            value={stage.type}
                                            onChange={(e) => handleUpdateStage(stage.id, 'type', e.target.value)}
                                            className="text-xs bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1 text-gray-600 dark:text-gray-300 outline-none cursor-pointer"
                                        >
                                            <option value="open">Em Aberto</option>
                                            <option value="won">Ganho</option>
                                            <option value="lost">Perdido</option>
                                        </select>
                                    )}

                                    <button
                                        onClick={() => handleRemoveStage(stage.id)}
                                        disabled={stage.isLocked}
                                        className={`p-1 transition-opacity ${stage.isLocked
                                                ? 'text-gray-300 cursor-not-allowed'
                                                : 'text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100'
                                            }`}
                                    >
                                        {stage.isLocked ? <div className="w-4" /> : <Trash2 size={16} />}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 dark:border-white/5 flex justify-end gap-3 bg-gray-50/50 dark:bg-white/5">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="px-6 py-2 text-sm font-bold text-charis-dark bg-charis-gold hover:bg-charis-gold-dark rounded-lg shadow-lg shadow-charis-gold/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <div className="w-4 h-4 border-2 border-charis-dark border-t-transparent rounded-full animate-spin" /> : <Check size={18} />}
                        Criar Funil
                    </button>
                </div>

            </div>
        </div>
    );
};
