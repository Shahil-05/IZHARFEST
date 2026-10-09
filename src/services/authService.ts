import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabaseClient';

export interface UserSession {
  user: {
    id: string;
    email: string;
    role: string;
  } | null;
  isAdmin: boolean;
}

const LOCAL_ADMIN_KEY = 'izhar_demo_admin_logged_in';

export const authService = {
  async getSession(): Promise<UserSession> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          // Check role in admin_profiles or user metadata
          const { data: profile } = await supabase
            .from('admin_profiles')
            .select('role')
            .eq('user_id', session.user.id)
            .maybeSingle();

          const role = profile?.role || 'admin';
          return {
            user: {
              id: session.user.id,
              email: session.user.email || 'admin@izharfest.academy',
              role,
            },
            isAdmin: true,
          };
        }
      }
    }

    // Check local fallback
    const isDemoLoggedIn = localStorage.getItem(LOCAL_ADMIN_KEY) === 'true';
    if (isDemoLoggedIn) {
      return {
        user: {
          id: 'admin-demo-id',
          email: 'admin@izharfest.academy',
          role: 'admin',
        },
        isAdmin: true,
      };
    }

    return { user: null, isAdmin: false };
  },

  async signIn(email: string, password: string): Promise<UserSession> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw new Error(error.message);

        if (data.session) {
          const { data: profile } = await supabase
            .from('admin_profiles')
            .select('role')
            .eq('user_id', data.session.user.id)
            .maybeSingle();

          const role = profile?.role || 'admin';
          return {
            user: {
              id: data.session.user.id,
              email: data.session.user.email || email,
              role,
            },
            isAdmin: true,
          };
        }
      }
    }

    // In local demo mode: allow demo credentials or any valid email
    if (email.trim() && password.trim()) {
      localStorage.setItem(LOCAL_ADMIN_KEY, 'true');
      return {
        user: {
          id: 'admin-demo-id',
          email: email.trim(),
          role: 'admin',
        },
        isAdmin: true,
      };
    }

    throw new Error('Please enter valid email and password.');
  },

  async signOut(): Promise<void> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
    }
    localStorage.removeItem(LOCAL_ADMIN_KEY);
  },
};
