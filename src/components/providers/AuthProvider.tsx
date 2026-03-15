import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { AuthPage } from '../features/AuthPage';

interface SupaUser {
    id: string;
    email?: string;
}

interface SupaSession {
    access_token: string;
    user: SupaUser;
}

interface AuthContextType {
    user: SupaUser | null;
    session: SupaSession | null;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<SupaUser | null>(null);
    const [session, setSession] = useState<SupaSession | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch original session
        supabase.auth.getSession().then(({ data: { session: s } }) => {
            if (s) {
                setSession({ access_token: s.access_token, user: { id: s.user.id, email: s.user.email } });
                setUser({ id: s.user.id, email: s.user.email });
            }
            setLoading(false);
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
            if (s) {
                setSession({ access_token: s.access_token, user: { id: s.user.id, email: s.user.email } });
                setUser({ id: s.user.id, email: s.user.email });
            } else {
                setSession(null);
                setUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!user) {
        return <AuthPage />;
    }

    return (
        <AuthContext.Provider value={{ user, session, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
