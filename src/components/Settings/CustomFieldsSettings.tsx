
import { useState, useEffect } from 'react';
import { Plus, Trash2, GripVertical, Type, Hash, Calendar, List, ToggleLeft } from 'lucide-react';
import { useLeadsStore } from '../../store/useLeadsStore';
import type { CrmFieldDefinition } from '../../types/database';

export const CustomFieldsSettings = () => {
    const { fieldDefinitions, fetchFieldDefinitions, addFieldDefinition, deleteFieldDefinition } = useLeadsStore();
    const [isAdding, setIsAdding] = useState(false);

    // New Field State
    const [newFieldLabel, setNewFieldLabel] = useState('');
    const [newFieldType, setNewFieldType] = useState<CrmFieldDefinition['type']>('text');
    const [newFieldOptions, setNewFieldOptions] = useState(''); // Comma separated for UI

    useEffect(() => {
        fetchFieldDefinitions();
    }, []);

    const handleAdd = async () => {
        if (!newFieldLabel) return;

        // Generate key from label (e.g., "Time de Futebol" -> "time_de_futebol")
        const key = newFieldLabel.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
            .replace(/[^a-z0-9]/g, "_");

        const fieldData: Partial<CrmFieldDefinition> = {
            label: newFieldLabel,
            key: key,
            type: newFieldType,
            required: false,
            order: fieldDefinitions.length,
            options: newFieldType === 'select' ? newFieldOptions.split(',').map(o => o.trim()).filter(o => o) : null
        };

        await addFieldDefinition(fieldData);

        // Reset
        setNewFieldLabel('');
        setNewFieldType('text');
        setNewFieldOptions('');
        setIsAdding(false);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza? Os dados preenchidos neste campo nos leads existentes não serão perdidos do banco, mas ficarão ocultos.')) {
            await deleteFieldDefinition(id);
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'text': return <Type size={16} />;
            case 'number': return <Hash size={16} />;
            case 'date': return <Calendar size={16} />;
            case 'select': return <List size={16} />;
            case 'boolean': return <ToggleLeft size={16} />;
            default: return <Type size={16} />;
        }
    };

    const getTypeName = (type: string) => {
        switch (type) {
            case 'text': return 'Texto';
            case 'number': return 'Número';
            case 'date': return 'Data';
            case 'select': return 'Seleção';
            case 'boolean': return 'Sim/Não';
            default: return type;
        }
    };

    return (
        <div className="bg-white dark:bg-charis-card rounded-2xl border border-gray-200 dark:border-white/5 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-lg font-serif font-bold text-gray-900 dark:text-white">Campos Personalizados</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Adicione campos extras para o perfil dos seus leads.</p>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-charis-gold text-charis-dark rounded-lg font-medium hover:bg-yellow-600 transition-colors"
                    >
                        <Plus size={18} />
                        Novo Campo
                    </button>
                )}
            </div>

            {/* List */}
            <div className="space-y-3 mb-6">
                {fieldDefinitions.length === 0 && !isAdding && (
                    <div className="text-center py-8 text-gray-400 dark:text-gray-600 border-2 border-dashed border-gray-200 dark:border-white/5 rounded-xl">
                        Nenhum campo personalizado criado.
                    </div>
                )}

                {fieldDefinitions.map((field) => (
                    <div key={field.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/5 group">
                        <GripVertical className="text-gray-400 cursor-grab" size={20} />
                        <div className="p-2 bg-white dark:bg-white/10 rounded-lg text-gray-500 dark:text-gray-300">
                            {getTypeIcon(field.type)}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-medium text-gray-900 dark:text-white">{field.label}</h3>
                            <p className="text-xs text-gray-500 font-mono">key: {field.key} • {getTypeName(field.type)}</p>
                        </div>
                        <button
                            onClick={() => handleDelete(field.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Add Form */}
            {isAdding && (
                <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-charis-gold/30 animate-in fade-in slide-in-from-top-2">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Novo Campo</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Nome do Campo</label>
                            <input
                                type="text"
                                value={newFieldLabel}
                                onChange={(e) => setNewFieldLabel(e.target.value)}
                                placeholder="Ex: Time de Futebol"
                                className="w-full bg-white dark:bg-charis-card border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-charis-gold"
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Tipo de Dado</label>
                            <select
                                value={newFieldType}
                                onChange={(e: any) => setNewFieldType(e.target.value)}
                                className="w-full bg-white dark:bg-charis-card border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-charis-gold"
                            >
                                <option value="text">Texto</option>
                                <option value="number">Número</option>
                                <option value="date">Data</option>
                                <option value="select">Lista de Opções</option>
                                <option value="boolean">Sim / Não</option>
                            </select>
                        </div>
                    </div>

                    {newFieldType === 'select' && (
                        <div className="mb-4">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Opções (separadas por vírgula)</label>
                            <input
                                type="text"
                                value={newFieldOptions}
                                onChange={(e) => setNewFieldOptions(e.target.value)}
                                placeholder="Opção A, Opção B, Opção C"
                                className="w-full bg-white dark:bg-charis-card border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-charis-gold"
                            />
                        </div>
                    )}

                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => setIsAdding(false)}
                            className="px-3 py-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleAdd}
                            disabled={!newFieldLabel}
                            className="px-4 py-2 bg-charis-gold text-charis-dark rounded-lg text-sm font-medium hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Salvar Campo
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
