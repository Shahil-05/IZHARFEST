import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabaseClient';
import { loadLocalDb, saveLocalDb } from '../lib/localDb';
import { notifyDbChange } from '../lib/dbSync';
import { EventResult, ResultStatus } from '../types/database';

export interface ResultInputItem {
  id?: string;
  participant_id?: string | null;
  team_id: string;
  scoring_rule_id?: string | null;
  result_label: string;
  points: number;
}

export const resultService = {
  // Get all results for an event
  async getEventResults(eventId: string): Promise<EventResult[]> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase
          .from('event_results')
          .select('*, participant:participants(*), team:teams(*), scoring_rule:event_scoring_rules(*)')
          .eq('event_id', eventId);
        if (!error && data) return data as EventResult[];
      }
    }

    const db = loadLocalDb();
    return db.event_results
      .filter((r) => r.event_id === eventId)
      .map((r) => ({
        ...r,
        participant: db.participants.find((p) => p.id === r.participant_id),
        team: db.teams.find((t) => t.id === r.team_id),
        scoring_rule: db.event_scoring_rules.find((sr) => sr.id === r.scoring_rule_id),
      }));
  },

  // Save results (as Draft or Published)
  async saveResults(
    eventId: string,
    results: ResultInputItem[],
    targetStatus: ResultStatus
  ): Promise<void> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        // Clear previous results for this event
        await supabase.from('event_results').delete().eq('event_id', eventId);

        // Insert new results
        if (results.length > 0) {
          const rows = results.map((r) => ({
            event_id: eventId,
            participant_id: r.participant_id || null,
            team_id: r.team_id,
            scoring_rule_id: r.scoring_rule_id || null,
            result_label: r.result_label.trim(),
            points: Number(r.points),
          }));
          const { error } = await supabase.from('event_results').insert(rows);
          if (error) throw new Error(error.message);
        }

        // Update event result_status and event status if published
        const updatePayload: any = {
          result_status: targetStatus,
          updated_at: new Date().toISOString(),
        };
        if (targetStatus === 'published') {
          updatePayload.status = 'completed';
        }

        const { error: evErr } = await supabase
          .from('events')
          .update(updatePayload)
          .eq('id', eventId);
        if (evErr) throw new Error(evErr.message);

        notifyDbChange();
        return;
      }
    }

    const db = loadLocalDb();

    // Remove existing results for this event
    db.event_results = db.event_results.filter((r) => r.event_id !== eventId);

    // Add new results
    results.forEach((r, idx) => {
      db.event_results.push({
        id: r.id || `res-${Date.now()}-${idx}`,
        event_id: eventId,
        participant_id: r.participant_id || null,
        team_id: r.team_id,
        scoring_rule_id: r.scoring_rule_id || null,
        result_label: r.result_label.trim(),
        points: Number(r.points),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    });

    // Update event status
    const evIdx = db.events.findIndex((e) => e.id === eventId);
    if (evIdx !== -1) {
      db.events[evIdx].result_status = targetStatus;
      if (targetStatus === 'published') {
        db.events[evIdx].status = 'completed';
      }
      db.events[evIdx].updated_at = new Date().toISOString();
    }

    saveLocalDb(db);
  },

  // Void / Clear results
  async voidResults(eventId: string): Promise<void> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from('event_results').delete().eq('event_id', eventId);
        await supabase.from('events').update({ result_status: 'not_entered' }).eq('id', eventId);
        return;
      }
    }

    const db = loadLocalDb();
    db.event_results = db.event_results.filter((r) => r.event_id !== eventId);
    const evIdx = db.events.findIndex((e) => e.id === eventId);
    if (evIdx !== -1) {
      db.events[evIdx].result_status = 'not_entered';
      db.events[evIdx].updated_at = new Date().toISOString();
    }
    saveLocalDb(db);
  },
};
