import React from 'react';
import { Sidebar } from './Sidebar';
import { Bell, Search } from 'lucide-react';

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex h-screen w-full bg-charis-darker text-white overflow-hidden">
            <Sidebar />

            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Top Header */}
                <header className="h-16 flex items-center justify-between px-8 border-b border-white/5 bg-charis-dark/50 backdrop-blur-sm z-40">
                    {/* Search Bar (Fake for now) */}
                    <div className="relative w-96 hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar leads, contatos ou empresas..."
                            className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:border-charis-gold/50 transition-colors"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-charis-gold rounded-full"></span>
                        </button>
                    </div>
                </header>

                {/* Main Content Scrollable Area */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {children}
                </main>
            </div>
        </div>
    );
};
