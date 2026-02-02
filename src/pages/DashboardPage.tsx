import { useEffect } from 'react';
import { ArrowUpRight, Users, DollarSign, TrendingUp } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { useLeadsStore } from '../store/useLeadsStore';
import { useAuthStore } from '../store/useAuthStore';

export const DashboardPage = () => {
    const { leads, stages, fetchLeads, fetchStages, isLoading } = useLeadsStore();
    const { profile } = useAuthStore();

    useEffect(() => {
        fetchLeads();
        fetchStages();
    }, []);

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

    // Data for Pipeline Bar Chart
    const pipelineData = stages.map(stage => ({
        name: stage.name,
        count: leads.filter(l => l.stage_id === stage.id).length,
        value: leads.filter(l => l.stage_id === stage.id).reduce((acc, curr) => acc + (curr.value || 0), 0)
    }));

    // Data for Source Pie Chart
    const sourceCounts = leads.reduce((acc: any, lead) => {
        const source = lead.source || 'manual';
        acc[source] = (acc[source] || 0) + 1;
        return acc;
    }, {});

    const sourceData = Object.keys(sourceCounts).map(source => ({
        name: source === 'manual' ? 'Manual' : source.toUpperCase(),
        value: sourceCounts[source]
    }));

    const COLORS = ['#C9A87C', '#0A2342', '#C64128', '#10B981', '#60A5FA'];

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
        <div className="h-full overflow-y-auto p-6 md:p-8 custom-scrollbar">
            <div className="max-w-7xl mx-auto space-y-8 pb-12">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-2">Dashboard Geral</h1>
                        <p className="text-gray-500 dark:text-gray-400">Visão macro dos resultados da operação.</p>
                    </div>
                    {isLoading && (
                        <div className="flex items-center gap-2 text-charis-gold text-sm animate-pulse">
                            <TrendingUp size={16} className="animate-spin" />
                            Atualizando dados...
                        </div>
                    )}
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Pipeline Performance Bar Chart */}
                    <div className="lg:col-span-2 bg-white dark:bg-charis-card p-6 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none">
                        <h3 className="font-semibold mb-6 text-gray-900 dark:text-white">Pipeline por Etapa</h3>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={pipelineData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value}`}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0A2342', border: 'none', borderRadius: '8px', color: '#fff' }}
                                        itemStyle={{ color: '#C9A87C' }}
                                    />
                                    <Bar dataKey="count" fill="#C9A87C" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Source Distributions Pie Chart */}
                    <div className="bg-white dark:bg-charis-card p-6 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none">
                        <h3 className="font-semibold mb-6 text-gray-900 dark:text-white">Origem dos Leads</h3>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={sourceData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {sourceData.map((_entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                    {/* Recent Leads Activity */}
                    <div className="bg-white dark:bg-charis-card p-6 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none">
                        <h3 className="font-semibold mb-6 text-gray-900 dark:text-white">Últimos Leads Cadastrados</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-xs uppercase text-gray-400 dark:text-gray-500 border-b border-gray-200 dark:border-white/5">
                                    <tr>
                                        <th className="pb-3 font-medium">Lead</th>
                                        <th className="pb-3 font-medium">Etapa</th>
                                        <th className="pb-3 font-medium">Valor</th>
                                        <th className="pb-3 font-medium">Origem</th>
                                        <th className="pb-3 font-medium">Data</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                                    {leads.slice(0, 5).map((lead) => (
                                        <tr key={lead.id} className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                            <td className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-charis-navy/20 flex items-center justify-center text-charis-gold font-bold text-xs">
                                                        {lead.name.charAt(0)}
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{lead.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-4">
                                                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300">
                                                    {stages.find(s => s.id === lead.stage_id)?.name || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="py-4 text-sm text-emerald-500 font-medium">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lead.value || 0)}
                                            </td>
                                            <td className="py-4 text-sm text-gray-500 capitalize">{lead.source || 'Manual'}</td>
                                            <td className="py-4 text-xs text-gray-400">
                                                {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
