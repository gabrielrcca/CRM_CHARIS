import React from 'react';
import { Sidebar } from './Sidebar';
import { Bell, Search } from 'lucide-react';

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex h-screen w-full bg-gray-50 dark:bg-charis-darker text-gray-900 dark:text-white overflow-hidden transition-colors duration-300">
            <Sidebar />

            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Top Header */}
                <header className="h-16 flex items-center justify-between px-8 border-b border-gray-200 dark:border-white/5 bg-white/80 dark:bg-charis-dark/50 backdrop-blur-sm z-40 transition-colors duration-300">
                    {/* Search Bar (Fake for now) */}
                    <div className="relative w-96 hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar leads, contatos ou empresas..."
                            className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full pl-10 pr-4 py-1.5 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:border-charis-gold/50 transition-colors placeholder-gray-500"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-charis-gold rounded-full"></span>
                        </button>
                    </div>
                </header>

                {/* Main Content Scrollable Area */}
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};
