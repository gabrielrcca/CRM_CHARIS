
import { Board } from '../components/Kanban/Board';
import { Filter, UserPlus } from 'lucide-react';

export const LeadsPage = () => {
    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-white mb-2">Pipeline de Vendas</h1>
                    <p className="text-gray-400">Gerencie seus leads e oportunidades.</p>
                </div>

                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-gray-300 transition-colors">
                        <Filter size={18} />
                        <span>Filtrar</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-charis-gold text-charis-dark font-semibold hover:bg-yellow-600 transition-colors">
                        <UserPlus size={18} />
                        <span>Novo Lead</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                <Board />
            </div>
        </div>
    );
};
