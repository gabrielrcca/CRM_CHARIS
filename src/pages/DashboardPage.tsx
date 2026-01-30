
import { ArrowUpRight, Users, DollarSign, TrendingUp } from 'lucide-react';
import { useLeadsStore } from '../store/useLeadsStore';
import { useAuthStore } from '../store/useAuthStore';

export const DashboardPage = () => {
    const { leads, stages } = useLeadsStore();
    const { profile } = useAuthStore();

    // Identify sales stages
    const wonStageIds = stages.filter(s => s.type === 'won').map(s => s.id);
    const lostStageIds = stages.filter(s => s.type === 'lost').map(s => s.id);

    const totalLeads = leads.length;

    // Convertidos
    const closedLeads = leads.filter(l => l.stage_id && wonStageIds.includes(l.stage_id));
    const totalClosed = closedLeads.length;
    const totalRevenue = closedLeads.reduce((acc, curr) => acc + (curr.value || 0), 0);

    // Pipeline (Abertos)
    const openLeads = leads.filter(l =>
        l.stage_id && !wonStageIds.includes(l.stage_id) && !lostStageIds.includes(l.stage_id)
    );
    const pipelineValue = openLeads.reduce((acc, curr) => acc + (curr.value || 0), 0);

    const conversionRate = totalLeads > 0 ? ((totalClosed / totalLeads) * 100).toFixed(1) : '0';

    const StatsCard = ({ title, value, subtext, icon: Icon, trend }: any) => (
        <div className="bg-white dark:bg-charis-card p-6 rounded-2xl border border-gray-200 dark:border-white/5 relative overflow-hidden group hover:border-charis-gold/20 transition-all shadow-sm dark:shadow-none">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl group-hover:bg-charis-gold/10 transition-colors">
                    <Icon className="text-charis-gold" size={24} />
                </div>
                {trend && (
                    <span className="flex items-center gap-1 text-emerald-500 text-sm font-medium bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                        <TrendingUp size={12} /> {trend}
                    </span>
                )}
            </div>
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{title}</h3>
            <p className="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-2">{value}</p>
            <p className="text-gray-500 text-xs">{subtext}</p>
        </div>
    );

    const showFinancials = profile?.role !== 'consultant';

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-2">Dashboard Geral</h1>
                <p className="text-gray-500 dark:text-gray-400">Visão macro dos resultados da operação.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {showFinancials && (
                    <>
                        <StatsCard
                            title="Receita Confirmada"
                            value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue)}
                            subtext={`${totalClosed} vendas realizadas`}
                            icon={DollarSign}
                            trend={totalRevenue > 0 ? "+100%" : "0%"}
                        />
                        <StatsCard
                            title="Em Negociação"
                            value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pipelineValue)}
                            subtext="Potencial de fechamento"
                            icon={TrendingUp}
                        />
                    </>
                )}
                <StatsCard
                    title="Total de Leads"
                    value={totalLeads}
                    subtext="Base total"
                    icon={Users}
                />
                <StatsCard
                    title="Taxa de Conversão"
                    value={`${conversionRate}%`}
                    subtext="Eficiência de vendas"
                    icon={ArrowUpRight}
                />
            </div>

            {/* Chart Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-charis-card p-6 rounded-2xl border border-gray-200 dark:border-white/5 h-96 flex items-center justify-center shadow-sm dark:shadow-none">
                    <div className="text-center opacity-40 text-gray-400 dark:text-gray-500">
                        <p>Gráfico de Desempenho (Implementar Recharts)</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-charis-card p-6 rounded-2xl border border-gray-200 dark:border-white/5 h-96 shadow-sm dark:shadow-none">
                    <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Atividades Recentes</h3>
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
                                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/10 flex-shrink-0"></div>
                                <div>
                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Novo lead cadastrado</p>
                                    <p className="text-xs text-gray-500">Há {i * 15} minutos</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
