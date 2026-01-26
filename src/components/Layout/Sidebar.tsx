import { useState } from 'react';
import {
    LayoutDashboard,
    KanbanSquare,
    Users,
    Settings,
    MessageSquare,
    Menu,
    PieChart
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';

export const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const location = useLocation();

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: KanbanSquare, label: 'Pipeline (Leads)', path: '/leads' },
        { icon: Users, label: 'Contatos', path: '/contacts' },
        { icon: MessageSquare, label: 'Atendimentos', path: '/chats' },
        { icon: PieChart, label: 'Relatórios', path: '/reports' },
        { icon: Settings, label: 'Configurações', path: '/settings' },
    ];

    return (
        <aside
            className={clsx(
                "h-screen bg-charis-card border-r border-white/5 flex flex-col transition-all duration-300 relative z-50",
                isCollapsed ? "w-20" : "w-64"
            )}
        >
            {/* Header / Logo */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-white/5">
                {!isCollapsed && (
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-charis-gold flex items-center justify-center text-charis-dark font-bold font-serif">C</div>
                        <span className="font-serif text-lg tracking-wide text-white">CHARIS</span>
                    </div>
                )}
                {isCollapsed && (
                    <div className="w-full flex justify-center">
                        <div className="w-8 h-8 rounded-full bg-charis-gold flex items-center justify-center text-charis-dark font-bold font-serif">C</div>
                    </div>
                )}

                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={clsx(
                        "p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors absolute",
                        isCollapsed ? "-right-3 top-20 bg-charis-card border border-white/10 shadow-xl" : "right-4"
                    )}
                >
                    {isCollapsed ? <Menu size={16} /> : <Menu size={18} />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 space-y-1">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={clsx(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group",
                                isActive
                                    ? "bg-charis-gold text-charis-dark font-semibold shadow-[0_0_15px_-5px_#C9A87C]"
                                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <item.icon size={20} className={clsx(isActive ? "text-charis-dark" : "text-gray-500 group-hover:text-charis-gold")} />

                            {!isCollapsed && (
                                <span>{item.label}</span>
                            )}

                            {/* Tooltip for collapsed state */}
                            {isCollapsed && (
                                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                                    {item.label}
                                </div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer User Profile */}
            <div className="p-4 border-t border-white/5">
                <div className={clsx("flex items-center gap-3", isCollapsed && "justify-center")}>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-charis-gold to-yellow-800 flex-shrink-0"></div>
                    {!isCollapsed && (
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-white truncate">Admin User</p>
                            <p className="text-xs text-gray-500 truncate">admin@charis.com</p>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};
