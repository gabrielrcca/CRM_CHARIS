import { create } from 'zustand';
import { supabase } from '../services/supabase';
import type { User, Session } from '@supabase/supabase-js';
import type { Profile } from '../types/database';

interface AuthState {
    user: User | null;
    profile: Profile | null;
    session: Session | null;
    isLoading: boolean;
    error: string | null;

    initialize: () => Promise<void>;
    signIn: (email: string, password: string) => Promise<boolean>;
    signUp: (email: string, password: string, companyName: string) => Promise<boolean>;
    signOut: () => Promise<void>;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    profile: null,
    session: null,
    isLoading: true,
    error: null,

    initialize: async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
                // Verify role and get full profile
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                const allowedRoles = ['manager', 'commercial', 'consultant', 'crm_agent'];

                // Check access permissions
                const hasAccess = profile.role === 'admin' ||
                    (allowedRoles.includes(profile.role) && profile.has_crm_access === true);

                if (!profile || !hasAccess) {
                    await supabase.auth.signOut();
                    set({
                        session: null,
                        user: null,
                        profile: null,
                        isLoading: false,
                        error: 'Acesso bloqueado pelo administrador.'
                    });
                    return;
                }

                set({
                    session,
                    user: session.user,
                    profile: profile as Profile,
                    isLoading: false
                });
            } else {
                set({
                    session: null,
                    user: null,
                    profile: null,
                    isLoading: false
                });
            }

            // Listen for auth changes
            supabase.auth.onAuthStateChange(async (event, session) => {
                if (event === 'SIGNED_IN' && session) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();

                    const allowedRoles = ['manager', 'commercial', 'consultant', 'crm_agent'];

                    const hasAccess = profile.role === 'admin' ||
                        (allowedRoles.includes(profile.role) && profile.has_crm_access === true);

                    if (!profile || !hasAccess) {
                        await supabase.auth.signOut();
                        set({
                            session: null,
                            user: null,
                            profile: null,
                            error: 'Acesso bloqueado pelo administrador.'
                        });
                        return;
                    }

                    set({ session, user: session.user, profile: profile as Profile });
                } else if (event === 'SIGNED_OUT') {
                    set({ session: null, user: null, profile: null });
                }
            });
        } catch (err) {
            console.error('Auth initialization error:', err);
            set({ isLoading: false, error: 'Erro ao inicializar autenticação' });
        }
    },

    signIn: async (email, password) => {
        set({ isLoading: true, error: null });

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            // Verify role
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .single();

            const allowedRoles = ['manager', 'commercial', 'consultant', 'crm_agent'];

            const hasAccess = profile.role === 'admin' ||
                (allowedRoles.includes(profile.role) && profile.has_crm_access === true);

            if (!profile || !hasAccess) {
                await supabase.auth.signOut();
                set({
                    session: null,
                    user: null,
                    profile: null,
                    isLoading: false,
                    error: 'Acesso bloqueado. Contate seu gerente.'
                });
                return false;
            }

            set({
                session: data.session,
                user: data.user,
                profile: profile as Profile,
                isLoading: false
            });
            return true;
        } catch (err: any) {
            console.error('Sign in error:', err);
            set({
                isLoading: false,
                error: err.message === 'Invalid login credentials'
                    ? 'Email ou senha incorretos'
                    : 'Erro ao fazer login'
            });
            return false;
        }
    },

    signUp: async (email, password, companyName) => {
        set({ isLoading: true, error: null });

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        company_name: companyName,
                    }
                }
            });

            if (error) throw error;

            // Criar profile após signup
            if (data.user) {
                await supabase.from('profiles').insert({
                    id: data.user.id,
                    email: data.user.email,
                    company_name: companyName,
                    role: 'client',
                });
            }

            set({
                session: data.session,
                user: data.user,
                isLoading: false
            });
            return true;
        } catch (err: any) {
            console.error('Sign up error:', err);
            set({
                isLoading: false,
                error: err.message || 'Erro ao criar conta'
            });
            return false;
        }
    },

    signOut: async () => {
        set({ isLoading: true });
        try {
            await supabase.auth.signOut();
            set({ user: null, session: null, isLoading: false });
        } catch (err) {
            console.error('Sign out error:', err);
            set({ isLoading: false });
        }
    },

    clearError: () => set({ error: null }),
}));
