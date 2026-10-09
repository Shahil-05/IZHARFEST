import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Configuration keys in localStorage or env
const STORAGE_KEY_URL = 'izhar_supabase_url';
const STORAGE_KEY_ANON = 'izhar_supabase_anon_key';

export function getSupabaseCredentials(): { url: string; anonKey: string; isConfigured: boolean } {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

  const storedUrl = localStorage.getItem(STORAGE_KEY_URL) || '';
  const storedKey = localStorage.getItem(STORAGE_KEY_ANON) || '';

  const url = storedUrl || envUrl;
  const anonKey = storedKey || envKey;

  const isConfigured = Boolean(
    url &&
    anonKey &&
    !url.includes('your-supabase-project') &&
    url.startsWith('https://')
  );

  return { url, anonKey, isConfigured };
}

export function saveSupabaseCredentials(url: string, anonKey: string) {
  if (url) localStorage.setItem(STORAGE_KEY_URL, url.trim());
  if (anonKey) localStorage.setItem(STORAGE_KEY_ANON, anonKey.trim());
  // Reload client instance
  initClient();
}

export function clearSupabaseCredentials() {
  localStorage.removeItem(STORAGE_KEY_URL);
  localStorage.removeItem(STORAGE_KEY_ANON);
  supabaseInstance = null;
}

let supabaseInstance: SupabaseClient | null = null;

import { notifyDbChange } from './dbSync';

function initClient(): SupabaseClient | null {
  const { url, anonKey, isConfigured } = getSupabaseCredentials();
  if (isConfigured) {
    try {
      supabaseInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });

      try {
        supabaseInstance
          .channel('izhar-realtime-sync')
          .on('postgres_changes', { event: '*', schema: 'public' }, () => {
            notifyDbChange();
          })
          .subscribe();
      } catch {
        // Realtime optional fallback
      }

      return supabaseInstance;
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      supabaseInstance = null;
    }
  }
  return null;
}

export function getSupabaseClient(): SupabaseClient | null {
  if (!supabaseInstance) {
    initClient();
  }
  return supabaseInstance;
}

export const isSupabaseConfigured = (): boolean => {
  return getSupabaseCredentials().isConfigured;
};
