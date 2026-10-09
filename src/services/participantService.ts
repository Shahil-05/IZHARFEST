import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabaseClient';
import { loadLocalDb, saveLocalDb } from '../lib/localDb';
import { notifyDbChange } from '../lib/dbSync';
import { Participant, FestEvent } from '../types/database';

export const participantService = {
  async getParticipants(filters?: { teamId?: string; classBatch?: string; eventId?: string }): Promise<Participant[]> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        let query = supabase
          .from('participants')
          .select('*, team:teams(*), event_participants(event:events(*))')
          .order('participant_code');

        if (filters?.teamId) {
          query = query.eq('team_id', filters.teamId);
        }
        if (filters?.classBatch) {
          query = query.eq('class_batch', filters.classBatch);
        }

        const { data, error } = await query;
        if (!error && data) {
          let results = data.map((p: any) => ({
            id: p.id,
            participant_code: p.participant_code,
            name: p.name,
            class_batch: p.class_batch,
            team_id: p.team_id,
            created_at: p.created_at,
            updated_at: p.updated_at,
            team: p.team,
            events: p.event_participants?.map((ep: any) => ep.event).filter(Boolean) || [],
          }));

          if (filters?.eventId) {
            results = results.filter((p) => p.events?.some((e: any) => e.id === filters.eventId));
          }
          return results;
        }
      }
    }

    const db = loadLocalDb();
    let list = db.participants.map((p) => {
      const team = db.teams.find((t) => t.id === p.team_id);
      const assignedEventIds = db.event_participants
        .filter((ep) => ep.participant_id === p.id)
        .map((ep) => ep.event_id);
      const events = db.events.filter((e) => assignedEventIds.includes(e.id));
      return {
        ...p,
        team,
        events,
      };
    });

    if (filters?.teamId) {
      list = list.filter((p) => p.team_id === filters.teamId);
    }
    if (filters?.classBatch) {
      list = list.filter((p) => p.class_batch === filters.classBatch);
    }
    if (filters?.eventId) {
      list = list.filter((p) => p.events?.some((e) => e.id === filters.eventId));
    }

    return list.sort((a, b) => a.participant_code.localeCompare(b.participant_code));
  },

  async getParticipantById(id: string): Promise<Participant | null> {
    const list = await this.getParticipants();
    return list.find((p) => p.id === id) || null;
  },

  async createParticipant(
    participantData: {
      participant_code: string;
      name: string;
      class_batch: string;
      team_id: string;
    },
    assignedEventIds: string[] = []
  ): Promise<Participant> {
    const code = participantData.participant_code.trim().toUpperCase();
    const name = participantData.name.trim();
    const classBatch = participantData.class_batch.trim();

    if (!code) throw new Error('Participant ID / Code is required.');
    if (!name) throw new Error('Participant Name is required.');
    if (!classBatch) throw new Error('Class / Batch is required.');
    if (!participantData.team_id) throw new Error('Team selection is required.');

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        // Check uniqueness
        const { data: existing } = await supabase
          .from('participants')
          .select('id')
          .eq('participant_code', code)
          .maybeSingle();

        if (existing) throw new Error(`Participant ID "${code}" already exists.`);

        const { data, error } = await supabase
          .from('participants')
          .insert({
            participant_code: code,
            name,
            class_batch: classBatch,
            team_id: participantData.team_id,
          })
          .select()
          .single();

        if (error) throw new Error(error.message);
        const newPart = data as Participant;

        // Assign events
        if (assignedEventIds.length > 0) {
          const epRows = assignedEventIds.map((eventId) => ({
            event_id: eventId,
            participant_id: newPart.id,
          }));
          await supabase.from('event_participants').insert(epRows);
        }

        notifyDbChange();
        return this.getParticipantById(newPart.id) as Promise<Participant>;
      }
    }

    const db = loadLocalDb();
    if (db.participants.some((p) => p.participant_code.toUpperCase() === code)) {
      throw new Error(`Participant ID "${code}" already exists.`);
    }

    const newParticipant: Participant = {
      id: `p-${Date.now()}`,
      participant_code: code,
      name,
      class_batch: classBatch,
      team_id: participantData.team_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.participants.push(newParticipant);

    // Synchronize event assignments in shared event_participants
    assignedEventIds.forEach((eventId) => {
      db.event_participants.push({
        id: `ep-${Date.now()}-${Math.random()}`,
        event_id: eventId,
        participant_id: newParticipant.id,
        created_at: new Date().toISOString(),
      });
    });

    saveLocalDb(db);
    return this.getParticipantById(newParticipant.id) as Promise<Participant>;
  },

  async updateParticipant(
    id: string,
    participantData: Partial<{
      participant_code: string;
      name: string;
      class_batch: string;
      team_id: string;
    }>,
    assignedEventIds?: string[]
  ): Promise<Participant> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const updatePayload: any = {
          updated_at: new Date().toISOString(),
        };
        if (participantData.participant_code) updatePayload.participant_code = participantData.participant_code.trim().toUpperCase();
        if (participantData.name) updatePayload.name = participantData.name.trim();
        if (participantData.class_batch) updatePayload.class_batch = participantData.class_batch.trim();
        if (participantData.team_id) updatePayload.team_id = participantData.team_id;

        const { error } = await supabase
          .from('participants')
          .update(updatePayload)
          .eq('id', id);

        if (error) throw new Error(error.message);

        if (assignedEventIds !== undefined) {
          // Sync shared event_participants
          await supabase.from('event_participants').delete().eq('participant_id', id);
          if (assignedEventIds.length > 0) {
            const rows = assignedEventIds.map((eid) => ({
              event_id: eid,
              participant_id: id,
            }));
            await supabase.from('event_participants').insert(rows);
          }
        }

        notifyDbChange();
        return this.getParticipantById(id) as Promise<Participant>;
      }
    }

    const db = loadLocalDb();
    const idx = db.participants.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Participant not found.');

    if (
      participantData.participant_code &&
      participantData.participant_code.toUpperCase() !== db.participants[idx].participant_code.toUpperCase()
    ) {
      const conflict = db.participants.some(
        (p) => p.id !== id && p.participant_code.toUpperCase() === participantData.participant_code?.trim().toUpperCase()
      );
      if (conflict) {
        throw new Error(`Participant ID "${participantData.participant_code}" already exists.`);
      }
    }

    db.participants[idx] = {
      ...db.participants[idx],
      ...participantData,
      participant_code: participantData.participant_code
        ? participantData.participant_code.trim().toUpperCase()
        : db.participants[idx].participant_code,
      updated_at: new Date().toISOString(),
    };

    if (assignedEventIds !== undefined) {
      // Remove all current assignments for this participant
      db.event_participants = db.event_participants.filter((ep) => ep.participant_id !== id);
      // Re-add selected
      assignedEventIds.forEach((eventId) => {
        db.event_participants.push({
          id: `ep-${Date.now()}-${Math.random()}`,
          event_id: eventId,
          participant_id: id,
          created_at: new Date().toISOString(),
        });
      });
    }

    saveLocalDb(db);
    return this.getParticipantById(id) as Promise<Participant>;
  },

  async deleteParticipant(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        // Check if has published results
        const { data: results } = await supabase
          .from('event_results')
          .select('id')
          .eq('participant_id', id);

        if (results && results.length > 0) {
          throw new Error('Cannot delete participant with existing event results. Remove results first.');
        }

        const { error } = await supabase.from('participants').delete().eq('id', id);
        if (error) throw new Error(error.message);
        notifyDbChange();
        return;
      }
    }

    const db = loadLocalDb();
    const hasResults = db.event_results.some((r) => r.participant_id === id);
    if (hasResults) {
      throw new Error('Cannot delete participant with existing event results. Remove results first.');
    }

    db.participants = db.participants.filter((p) => p.id !== id);
    db.team_leaders = db.team_leaders.filter((tl) => tl.participant_id !== id);
    db.event_participants = db.event_participants.filter((ep) => ep.participant_id !== id);
    saveLocalDb(db);
  },
};
