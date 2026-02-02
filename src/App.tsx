import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/Layout/AppLayout';
import { LoginScreen } from './components/Auth/LoginScreen';
import { DashboardPage } from './pages/DashboardPage';
import { LeadsPage } from './pages/LeadsPage';
import { SettingsPage } from './pages/SettingsPage';
import { useAuthStore } from './store/useAuthStore';
import { useLeadsStore } from './store/useLeadsStore';
import { Loader2 } from 'lucide-react';

function App() {
    const { user, profile, isLoading, initialize } = useAuthStore();
    const { setUserId, fetchLeads, initializeDefaultPipeline } = useLeadsStore();

    // Initialize auth on mount
    useEffect(() => {
        initialize();
    }, [initialize]);

    // When user/profile changes, update the leads store
    useEffect(() => {
        if (user && profile) {
            // Se for gestor, usa o próprio ID
            // Se for equipe, usa o ID do gestor (parent_id)
            const workspaceId = profile.parent_id || user.id;

            setUserId(workspaceId);
            initializeDefaultPipeline().then(() => {
                fetchLeads();
            });
        } else {
            setUserId(null); // Só limpa se não tiver user
        }
    }, [user, profile, setUserId, fetchLeads, initializeDefaultPipeline]);

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-charis-darker flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-charis-gold animate-spin" />
                    <p className="text-gray-400">Carregando CRM...</p>
                </div>
            </div>
        );
    }

    // Not authenticated - show login
    if (!user) {
        return <LoginScreen />;
    }

    // Authenticated - show app
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<AppLayout><DashboardPage /></AppLayout>} />
                <Route path="/leads" element={<AppLayout><LeadsPage /></AppLayout>} />
                <Route path="/settings" element={<AppLayout><SettingsPage /></AppLayout>} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
