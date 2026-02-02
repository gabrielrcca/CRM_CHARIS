import { useState } from 'react';
import {
    LayoutDashboard,
    KanbanSquare,
    Settings,
    Menu,
    LogOut,
    Sun,
    Moon
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { useAuthStore } from '../../store/useAuthStore';
import { useTheme } from '../../hooks/useTheme';

export const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const location = useLocation();
    const { user, signOut } = useAuthStore();
    const { theme, toggleTheme } = useTheme();

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: KanbanSquare, label: 'Pipeline (Leads)', path: '/leads' },
        { icon: Settings, label: 'Configurações', path: '/settings' },
    ];

    const handleLogout = async () => {
        await signOut();
    };

    return (
        <aside
            className={clsx(
                "h-screen bg-white dark:bg-charis-card border-r border-gray-200 dark:border-white/5 flex flex-col transition-all duration-300 relative z-50",
                isCollapsed ? "w-20" : "w-64"
            )}
        >
            {/* Header / Logo */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-white/5">
                {!isCollapsed && (
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-charis-gold flex items-center justify-center text-charis-dark font-bold font-serif">C</div>
                        <span className="font-serif text-lg tracking-wide text-gray-900 dark:text-white">CHARIS</span>
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
                        "p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors absolute",
                        isCollapsed ? "-right-3 top-20 bg-white dark:bg-charis-card border border-gray-200 dark:border-white/10 shadow-xl" : "right-4"
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
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative",
                                isActive
                                    ? "bg-charis-gold text-charis-dark font-semibold shadow-md"
                                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                            )}
                        >
                            <item.icon size={20} className={clsx(isActive ? "text-charis-dark" : "text-gray-400 dark:text-gray-500 group-hover:text-charis-gold")} />

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
            <div className="p-4 border-t border-gray-200 dark:border-white/5 space-y-2">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className={clsx(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors",
                        isCollapsed && "justify-center"
                    )}
                    title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    {!isCollapsed && <span className="text-sm">{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>}
                </button>

                <div className={clsx("flex items-center gap-3 pt-2", isCollapsed && "justify-center")}>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-charis-gold to-yellow-800 flex-shrink-0 flex items-center justify-center text-charis-dark font-bold text-sm">
                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    {!isCollapsed && (
                        <div className="overflow-hidden flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {user?.email?.split('@')[0] || 'Usuário'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                    )}
                </div>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className={clsx(
                        "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10 transition-colors",
                        isCollapsed && "justify-center"
                    )}
                >
                    <LogOut size={18} />
                    {!isCollapsed && <span className="text-sm">Sair</span>}
                </button>
            </div>
        </aside>
    );
};
