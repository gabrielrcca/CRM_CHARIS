import { useState, useEffect } from 'react';
import { useLeadsStore } from '../../store/useLeadsStore';
import { X, Plus, Trash2, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import type { CrmStage } from '../../types/database';

interface PipelineConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PipelineConfigModal = ({ isOpen, onClose }: PipelineConfigModalProps) => {
    const { stages, addStage, updateStage, deleteStage, reorderStages } = useLeadsStore();
    const [localStages, setLocalStages] = useState<CrmStage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [newStageName, setNewStageName] = useState('');

    useEffect(() => {
        if (isOpen) {
            setLocalStages(stages); // Sync with store
        }
    }, [isOpen, stages]);

    const handleAddStage = async () => {
        if (!newStageName.trim()) return;
        setIsLoading(true);
        await addStage({ name: newStageName, color: '#6B7280' });
        setNewStageName('');
        setIsLoading(false);
    };

    const handleDeleteStage = async (id: string) => {
        if (confirm('Tem certeza? Leads neste estágio podem ficar órfãos.')) {
            await deleteStage(id);
        }
    };

    const handleMove = async (index: number, direction: 'up' | 'down') => {
        const newStages = [...localStages];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        if (targetIndex < 0 || targetIndex >= newStages.length) return;

        // Swap
        const temp = newStages[index];
        newStages[index] = newStages[targetIndex];
        newStages[targetIndex] = temp;

        setLocalStages(newStages);
        await reorderStages(newStages);
    };

    const handleColorChange = async (id: string, color: string) => {
        // Optimistic local update
        setLocalStages(prev => prev.map(s => s.id === id ? { ...s, color } : s));
        await updateStage(id, { color });
    };

    const handleNameChange = async (id: string, name: string) => {
        setLocalStages(prev => prev.map(s => s.id === id ? { ...s, name } : s));
    }

    const handleNameBlur = async (id: string, name: string) => {
        await updateStage(id, { name });
    }

    const handleTypeChange = async (id: string, type: 'open' | 'won' | 'lost') => {
        setLocalStages(prev => prev.map(s => s.id === id ? { ...s, type } : s));
        await updateStage(id, { type });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-charis-card border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-gray-200 dark:border-white/10 flex justify-between items-center">
                    <h2 className="text-xl font-serif font-bold text-gray-900 dark:text-white">Configurar Funil de Vendas</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-4">

                    {/* List Stages */}
                    <div className="space-y-3">
                        {localStages.map((stage, index) => (
                            <div key={stage.id} className="flex items-center gap-3 bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-200 dark:border-white/5 group hover:border-charis-gold/30 dark:hover:border-white/20 transition-all">

                                {/* Order Controls */}
                                <div className="flex flex-col gap-1">
                                    <button
                                        onClick={() => handleMove(index, 'up')}
                                        disabled={index === 0}
                                        className="text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white disabled:opacity-30"
                                    >
                                        <ArrowUp size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleMove(index, 'down')}
                                        disabled={index === localStages.length - 1}
                                        className="text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white disabled:opacity-30"
                                    >
                                        <ArrowDown size={14} />
                                    </button>
                                </div>

                                {/* Color Picker */}
                                <input
                                    type="color"
                                    value={stage.color || '#6B7280'}
                                    onChange={(e) => handleColorChange(stage.id, e.target.value)}
                                    className="w-8 h-8 rounded cursor-pointer bg-transparent border-none"
                                />

                                {/* Type Selector */}
                                <select
                                    value={stage.type || 'open'}
                                    onChange={(e) => handleTypeChange(stage.id, e.target.value as any)}
                                    className="bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded px-2 py-1 text-xs text-gray-700 dark:text-gray-300 focus:border-charis-gold outline-none"
                                    title="Tipo da etapa"
                                >
                                    <option value="open">Etapa</option>
                                    <option value="won">Venda (R$)</option>
                                    <option value="lost">Perdido</option>
                                </select>

                                {/* Name Input */}
                                <input
                                    type="text"
                                    value={stage.name}
                                    onChange={(e) => handleNameChange(stage.id, e.target.value)}
                                    onBlur={(e) => handleNameBlur(stage.id, e.target.value)}
                                    disabled={['Lead novos', 'Em tratativa', 'Fechado', 'Perdidos'].includes(stage.name)}
                                    className="flex-1 bg-transparent border border-transparent hover:border-gray-200 dark:hover:border-white/10 focus:border-charis-gold rounded px-2 py-1 text-gray-900 dark:text-white outline-none transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                                />

                                {/* Delete - Only for non-default stages */}
                                {!['Lead novos', 'Em tratativa', 'Fechado', 'Perdidos'].includes(stage.name) ? (
                                    <button
                                        onClick={() => handleDeleteStage(stage.id)}
                                        className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Excluir Estágio"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                ) : (
                                    <div className="w-9" /> /* Spacer if not deletable */
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Add New Stage */}
                    <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-white/10">
                        <input
                            type="text"
                            value={newStageName}
                            onChange={(e) => setNewStageName(e.target.value)}
                            placeholder="Nome da nova etapa..."
                            className="flex-1 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-charis-gold"
                            onKeyDown={(e) => e.key === 'Enter' && handleAddStage()}
                        />
                        <button
                            onClick={handleAddStage}
                            disabled={isLoading || !newStageName.trim()}
                            className="bg-charis-gold hover:bg-amber-500 text-charis-dark font-semibold px-6 py-3 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : <Plus size={20} />}
                            Adicionar
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};
