import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabaseClient';
import { loadLocalDb, saveLocalDb } from '../lib/localDb';
import { notifyDbChange } from '../lib/dbSync';
import { FestSettings } from '../types/database';

export const festService = {
  async getSettings(): Promise<FestSettings> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase
          .from('fest_settings')
          .select('*')
          .limit(1)
          .maybeSingle();
        if (!error && data) return data as FestSettings;
      }
    }
    const db = loadLocalDb();
    return db.fest_settings;
  },

  async updateSettings(settings: Partial<FestSettings>): Promise<FestSettings> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const current = await this.getSettings();
        const { data, error } = await supabase
          .from('fest_settings')
          .update({
            ...settings,
            updated_at: new Date().toISOString(),
          })
          .eq('id', current.id)
          .select()
          .single();
        if (error) throw new Error(error.message);
        if (data) {
          notifyDbChange();
          return data as FestSettings;
        }
      }
    }
    const db = loadLocalDb();
    db.fest_settings = {
      ...db.fest_settings,
      ...settings,
      updated_at: new Date().toISOString(),
    };
    saveLocalDb(db);
    return db.fest_settings;
  },
};
