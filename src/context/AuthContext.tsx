import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, UserSession } from '../services/authService';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabaseClient';

interface AuthContextType {
  session: UserSession;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: { user: null, isAdmin: false },
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<UserSession>({ user: null, isAdmin: false });
  const [loading, setLoading] = useState(true);

  const refreshSession = async () => {
    try {
      const sess = await authService.getSession();
      setSession(sess);
    } catch (err) {
      console.error('Session fetch error', err);
      setSession({ user: null, isAdmin: false });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
          refreshSession();
        });
        return () => subscription.unsubscribe();
      }
    }
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const newSession = await authService.signIn(email, pass);
      setSession(newSession);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.signOut();
      setSession({ user: null, isAdmin: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ session, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
