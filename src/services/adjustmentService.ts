import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabaseClient';
import { loadLocalDb, saveLocalDb } from '../lib/localDb';
import { notifyDbChange } from '../lib/dbSync';
import { TeamPointAdjustment, AdjustmentType } from '../types/database';

export const adjustmentService = {
  async getAdjustments(): Promise<TeamPointAdjustment[]> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase
          .from('team_point_adjustments')
          .select('*, team:teams(*)')
          .order('created_at', { ascending: false });
        if (!error && data) return data as TeamPointAdjustment[];
      }
    }

    const db = loadLocalDb();
    return db.team_point_adjustments
      .map((adj) => ({
        ...adj,
        team: db.teams.find((t) => t.id === adj.team_id),
      }))
      .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
  },

  async addAdjustment(data: {
    team_id: string;
    points: number;
    adjustment_type: AdjustmentType;
    reason: string;
  }): Promise<TeamPointAdjustment> {
    if (!data.team_id) throw new Error('Please select a team.');
    if (!data.reason || !data.reason.trim()) throw new Error('A reason is mandatory for any bonus or penalty.');
    if (data.points <= 0) throw new Error('Points must be greater than zero.');

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data: inserted, error } = await supabase
          .from('team_point_adjustments')
          .insert({
            team_id: data.team_id,
            points: Math.abs(Number(data.points)),
            adjustment_type: data.adjustment_type,
            reason: data.reason.trim(),
          })
          .select('*, team:teams(*)')
          .single();
        if (error) throw new Error(error.message);
        notifyDbChange();
        return inserted as TeamPointAdjustment;
      }
    }

    const db = loadLocalDb();
    const newAdj: TeamPointAdjustment = {
      id: `adj-${Date.now()}`,
      team_id: data.team_id,
      points: Math.abs(Number(data.points)),
      adjustment_type: data.adjustment_type,
      reason: data.reason.trim(),
      created_at: new Date().toISOString(),
    };
    db.team_point_adjustments.unshift(newAdj);
    saveLocalDb(db);

    return {
      ...newAdj,
      team: db.teams.find((t) => t.id === data.team_id),
    };
  },

  async deleteAdjustment(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { error } = await supabase.from('team_point_adjustments').delete().eq('id', id);
        if (error) throw new Error(error.message);
        notifyDbChange();
        return;
      }
    }

    const db = loadLocalDb();
    db.team_point_adjustments = db.team_point_adjustments.filter((a) => a.id !== id);
    saveLocalDb(db);
  },
};
