
import { ArrowUpRight, Users, DollarSign, CalendarCheck, TrendingUp } from 'lucide-react';
import { useLeadsStore } from '../store/useLeadsStore';

export const DashboardPage = () => {
    const { leads } = useLeadsStore();

    const totalLeads = leads.length;
    const totalClosed = leads.filter(l => l.status === 'closed').length;
    const totalValue = leads.reduce((acc, curr) => acc + (curr.value || 0), 0);
    const conversionRate = totalLeads > 0 ? ((totalClosed / totalLeads) * 100).toFixed(1) : '0';

    const StatsCard = ({ title, value, subtext, icon: Icon, trend }: any) => (
        <div className="bg-charis-card p-6 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-charis-gold/20 transition-all">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-white/5 rounded-xl group-hover:bg-charis-gold/10 transition-colors">
                    <Icon className="text-charis-gold" size={24} />
                </div>
                {trend && (
                    <span className="flex items-center gap-1 text-emerald-500 text-sm font-medium bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                        <TrendingUp size={12} /> {trend}
                    </span>
                )}
            </div>
            <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
            <p className="text-3xl font-serif font-bold text-white mb-2">{value}</p>
            <p className="text-gray-500 text-xs">{subtext}</p>
        </div>
    );

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-serif font-bold text-white mb-2">Dashboard Geral</h1>
                <p className="text-gray-400">Visão macro dos resultados da operação.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total de Leads"
                    value={totalLeads}
                    subtext="Neste mês"
                    icon={Users}
                    trend="+12.5%"
                />
                <StatsCard
                    title="Vendas Realizadas"
                    value={totalClosed}
                    subtext="Contratos assinados"
                    icon={CalendarCheck}
                    trend="+5.2%"
                />
                <StatsCard
                    title="Receita Estimada"
                    value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}
                    subtext="Pipeline total"
                    icon={DollarSign}
                />
                <StatsCard
                    title="Taxa de Conversão"
                    value={`${conversionRate}%`}
                    subtext="Média da equipe"
                    icon={ArrowUpRight}
                    trend="+2.1%"
                />
            </div>

            {/* Chart Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-charis-card p-6 rounded-2xl border border-white/5 h-96 flex items-center justify-center">
                    <div className="text-center opacity-40">
                        <p>Gráfico de Desempenho (Implementar Recharts)</p>
                    </div>
                </div>
                <div className="bg-charis-card p-6 rounded-2xl border border-white/5 h-96">
                    <h3 className="font-semibold mb-4">Atividades Recentes</h3>
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex-shrink-0"></div>
                                <div>
                                    <p className="text-sm font-medium">Novo lead cadastrado</p>
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
