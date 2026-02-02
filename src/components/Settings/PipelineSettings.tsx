import { useState, useEffect } from 'react';
import { useLeadsStore } from '../../store/useLeadsStore';
import { Plus, Trash2, Edit2, Check, X, GripVertical, Layout } from 'lucide-react';
import { CreatePipelineModal } from './CreatePipelineModal';

export const PipelineSettings = () => {
    const {
        pipelines,
        fetchPipelines,
        addPipeline,
        stages,
        fetchStages,
        addStage,
        deleteStage,
        updateStage,
        setCurrentPipeline,
        currentPipelineId,
        createPipelineFromTemplate
    } = useLeadsStore();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [isAddingStage, setIsAddingStage] = useState(false);
    const [newStageName, setNewStageName] = useState('');

    useEffect(() => {
        fetchPipelines();
    }, []);

    const handlePipelineChange = (pipelineId: string) => {
        setCurrentPipeline(pipelineId);
    };



    const handleAddStage = async () => {
        if (!newStageName.trim() || !currentPipelineId) return;

        // Calculate next order
        const maxOrder = stages.length > 0 ? Math.max(...stages.map(s => s.order)) : -1;

        await addStage({
            name: newStageName,
            pipeline_id: currentPipelineId,
            order: maxOrder + 1,
            type: 'open',
            color: '#60A5FA' // Default blue
        });
        setNewStageName('');
        setIsAddingStage(false);
    };

    const handleDeleteStage = async (stageId: string) => {
        if (confirm('Tem certeza que deseja excluir esta etapa? Leads nela podem ficar órfãos.')) {
            await deleteStage(stageId);
        }
    };

    const handleSaveNewPipeline = async (data: { name: string, stages: any[] }) => {
        setIsLoading(true); // Assuming isLoading is still relevant for the modal's save operation
        try {
            await createPipelineFromTemplate(data);
            setIsCreateModalOpen(false); // Close modal on success
        } catch (error: any) {
            console.error(error);
            alert(`Erro ao criar funil: ${error.message || error}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-charis-card rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-charis-gold/10 rounded-lg">
                    <Layout className="text-charis-gold" size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-serif font-bold text-gray-900 dark:text-white">Funis de Vendas</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Crie pipelines diferentes para cada nicho (Clínica, Imobiliária, etc).</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Pipeline List */}
                <div className="border-r border-gray-100 dark:border-white/5 pr-6 space-y-4">

                    <div className="space-y-4">
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="w-full py-3 px-4 bg-charis-gold hover:bg-charis-gold-dark text-charis-dark font-bold rounded-xl shadow-lg shadow-charis-gold/20 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <Plus size={20} />
                            Criar Novo Funil
                        </button>

                        <div className="w-full h-px bg-gray-100 dark:bg-white/5 my-4"></div>

                        <div className="relative">
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
                                Editar Funil Existente
                            </label>
                            <select
                                value={currentPipelineId || ''}
                                onChange={(e) => handlePipelineChange(e.target.value)}
                                className="w-full appearance-none bg-gray-100 dark:bg-charis-dark/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-800 dark:text-white focus:outline-none focus:border-charis-gold transition-all cursor-pointer pr-10"
                            >
                                {pipelines.map(pipeline => (
                                    <option key={pipeline.id} value={pipeline.id} className="bg-white dark:bg-charis-dark text-gray-900 dark:text-white">
                                        {pipeline.name} {pipeline.is_default ? '(Padrão)' : ''}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-4 bottom-3 pointer-events-none text-gray-400">
                                <Plus size={16} className="rotate-45" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 px-1">
                            Selecione um funil acima para editar suas etapas.
                        </p>
                    </div>
                </div>

                {/* Right Column: Stage Management */}
                <div className="md:col-span-2 pl-2">
                    {currentPipelineId ? (
                        <>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-medium text-gray-900 dark:text-white">Etapas do Funil</h3>
                                <button
                                    onClick={() => setIsAddingStage(true)}
                                    className="flex items-center gap-2 text-sm text-charis-gold hover:text-charis-gold-dark font-medium"
                                >
                                    <Plus size={16} />
                                    Adicionar Etapa
                                </button>
                            </div>

                            <div className="space-y-3">
                                {stages.map((stage) => (
                                    <div key={stage.id} className="group flex items-center gap-3 p-3 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl hover:border-gray-300 dark:hover:border-white/20 transition-all">
                                        <div className="text-gray-400 cursor-move"><GripVertical size={16} /></div>
                                        <div
                                            className="w-4 h-4 rounded-full"
                                            style={{ backgroundColor: stage.color || '#ccc' }}
                                        />
                                        <div className="flex-1 font-medium text-gray-700 dark:text-gray-200">
                                            {stage.name}
                                        </div>
                                        <div className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-white/10 text-gray-500 capitalize">
                                            {stage.type === 'won' ? 'Ganhou' : stage.type === 'lost' ? 'Perdeu' : 'Aberto'}
                                        </div>
                                        <button
                                            onClick={() => handleDeleteStage(stage.id)}
                                            className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}

                                {isAddingStage && (
                                    <div className="flex gap-2 items-center p-3 animate-in fade-in slide-in-from-top-2">
                                        <div className="w-8" />
                                        <input
                                            type="text"
                                            placeholder="Nome da Etapa (ex: Agendado)"
                                            className="flex-1 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 outline-none focus:border-charis-gold"
                                            value={newStageName}
                                            onChange={(e) => setNewStageName(e.target.value)}
                                            autoFocus
                                        />
                                        <button onClick={handleAddStage} className="p-2 bg-charis-gold text-white rounded-lg hover:bg-charis-gold-dark"><Check size={16} /></button>
                                        <button onClick={() => setIsAddingStage(false)} className="p-2 text-gray-400 hover:text-gray-600"><X size={16} /></button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400">
                            Selecione um funil para editar suas etapas
                        </div>
                    )}
                </div>
            </div>

            <CreatePipelineModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSave={handleSaveNewPipeline}
            />
        </div>
    );
};
