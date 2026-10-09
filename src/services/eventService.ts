import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabaseClient';
import { loadLocalDb, saveLocalDb } from '../lib/localDb';
import { notifyDbChange } from '../lib/dbSync';
import { FestEvent, EventCategory, EventScoringRule, EventType, EventStatus, ResultStatus } from '../types/database';

export const eventService = {
  async getCategories(): Promise<EventCategory[]> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase.from('event_categories').select('*').order('name');
        if (!error && data) return data as EventCategory[];
      }
    }
    const db = loadLocalDb();
    return db.event_categories;
  },

  async createCategory(name: string, description?: string): Promise<EventCategory> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase
          .from('event_categories')
          .insert({ name: name.trim(), description: description?.trim() })
          .select()
          .single();
        if (error) throw new Error(error.message);
        notifyDbChange();
        return data as EventCategory;
      }
    }
    const db = loadLocalDb();
    if (db.event_categories.some((c) => c.name.toLowerCase() === name.trim().toLowerCase())) {
      throw new Error(`Category "${name}" already exists.`);
    }
    const newCat: EventCategory = {
      id: `cat-${Date.now()}`,
      name: name.trim(),
      description: description?.trim(),
      created_at: new Date().toISOString(),
    };
    db.event_categories.push(newCat);
    saveLocalDb(db);
    return newCat;
  },

  async updateCategory(id: string, name: string, description?: string): Promise<EventCategory> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase
          .from('event_categories')
          .update({ name: name.trim(), description: description?.trim() })
          .eq('id', id)
          .select()
          .single();
        if (error) throw new Error(error.message);
        notifyDbChange();
        return data as EventCategory;
      }
    }
    const db = loadLocalDb();
    const idx = db.event_categories.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Category not found');
    db.event_categories[idx] = {
      ...db.event_categories[idx],
      name: name.trim(),
      description: description?.trim(),
    };
    saveLocalDb(db);
    return db.event_categories[idx];
  },

  async deleteCategory(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { error } = await supabase.from('event_categories').delete().eq('id', id);
        if (error) throw new Error(error.message);
        notifyDbChange();
        return;
      }
    }
    const db = loadLocalDb();
    const inUse = db.events.some((e) => e.category_id === id);
    if (inUse) {
      throw new Error('Cannot delete category that is currently assigned to events.');
    }
    db.event_categories = db.event_categories.filter((c) => c.id !== id);
    saveLocalDb(db);
  },

  async getEvents(filters?: {
    search?: string;
    type?: EventType | 'all';
    categoryId?: string | 'all';
    status?: EventStatus | 'all';
    resultStatus?: ResultStatus | 'all';
  }): Promise<FestEvent[]> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        let query = supabase
          .from('events')
          .select(`
            *,
            category:event_categories(*),
            scoring_rules:event_scoring_rules(*),
            results:event_results(*, participant:participants(*), team:teams(*))
          `)
          .order('event_date', { ascending: true })
          .order('start_time', { ascending: true });

        if (filters?.type && filters.type !== 'all') {
          query = query.eq('event_type', filters.type);
        }
        if (filters?.categoryId && filters.categoryId !== 'all') {
          query = query.eq('category_id', filters.categoryId);
        }
        if (filters?.status && filters.status !== 'all') {
          query = query.eq('status', filters.status);
        }
        if (filters?.resultStatus && filters.resultStatus !== 'all') {
          query = query.eq('result_status', filters.resultStatus);
        }

        const { data, error } = await query;
        if (!error && data) {
          let list = data as FestEvent[];
          if (filters?.search) {
            const q = filters.search.toLowerCase();
            list = list.filter((e) => e.name.toLowerCase().includes(q) || e.venue?.toLowerCase().includes(q));
          }
          return list;
        }
      }
    }

    const db = loadLocalDb();
    let list = db.events.map((e) => {
      const category = db.event_categories.find((c) => c.id === e.category_id);
      const scoring_rules = db.event_scoring_rules
        .filter((sr) => sr.event_id === e.id)
        .sort((a, b) => a.sort_order - b.sort_order);

      const results = db.event_results
        .filter((r) => r.event_id === e.id)
        .map((r) => ({
          ...r,
          participant: db.participants.find((p) => p.id === r.participant_id),
          team: db.teams.find((t) => t.id === r.team_id),
          scoring_rule: db.event_scoring_rules.find((sr) => sr.id === r.scoring_rule_id),
        }));

      return {
        ...e,
        category,
        scoring_rules,
        results,
      };
    });

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter((e) => e.name.toLowerCase().includes(q) || e.venue?.toLowerCase().includes(q));
    }
    if (filters?.type && filters.type !== 'all') {
      list = list.filter((e) => e.event_type === filters.type);
    }
    if (filters?.categoryId && filters.categoryId !== 'all') {
      list = list.filter((e) => e.category_id === filters.categoryId);
    }
    if (filters?.status && filters.status !== 'all') {
      list = list.filter((e) => e.status === filters.status);
    }
    if (filters?.resultStatus && filters.resultStatus !== 'all') {
      list = list.filter((e) => e.result_status === filters.resultStatus);
    }

    return list.sort((a, b) => {
      if (a.event_date && b.event_date && a.event_date !== b.event_date) {
        return a.event_date.localeCompare(b.event_date);
      }
      return (a.start_time || '').localeCompare(b.start_time || '');
    });
  },

  async getEventById(id: string): Promise<FestEvent | null> {
    const list = await this.getEvents();
    const event = list.find((e) => e.id === id);
    if (!event) return null;

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data: epData } = await supabase
          .from('event_participants')
          .select('*, participant:participants(*, team:teams(*))')
          .eq('event_id', id);

        const { data: etaData } = await supabase
          .from('event_team_assignments')
          .select('*, team:teams(*)')
          .eq('event_id', id);

        const assigned_participants = (epData || [])
          .map((ep: any) => ep.participant)
          .filter(Boolean);

        const assigned_teams = (etaData || []).map((eta: any) => {
          const team = eta.team;
          const members = assigned_participants.filter((p: any) => p.team_id === eta.team_id);
          return {
            team_id: eta.team_id,
            team,
            assignment_mode: eta.assignment_mode,
            members,
          };
        });

        return {
          ...event,
          assigned_participants,
          assigned_teams,
        };
      }
    }

    // Fallback to local store
    const db = loadLocalDb();
    const assignedParticipantIds = db.event_participants
      .filter((ep) => ep.event_id === id)
      .map((ep) => ep.participant_id);

    const assigned_participants = db.participants
      .filter((p) => assignedParticipantIds.includes(p.id))
      .map((p) => ({
        ...p,
        team: db.teams.find((t) => t.id === p.team_id),
      }));

    const teamAssignments = db.event_team_assignments.filter((eta) => eta.event_id === id);
    const assigned_teams = teamAssignments.map((eta) => {
      const team = db.teams.find((t) => t.id === eta.team_id)!;
      let members: any[] = [];
      if (eta.assignment_mode === 'entire_team') {
        members = db.participants.filter((p) => p.team_id === team.id);
      } else {
        members = assigned_participants.filter((p) => p.team_id === team.id);
      }
      return {
        team_id: eta.team_id,
        team,
        assignment_mode: eta.assignment_mode,
        members,
      };
    });

    return {
      ...event,
      assigned_participants,
      assigned_teams,
    };
  },

  async createEvent(eventData: {
    name: string;
    event_type: EventType;
    category_id?: string;
    description?: string;
    event_date?: string;
    start_time?: string;
    end_time?: string;
    venue?: string;
    scoring_rules: { label: string; points: number; sort_order?: number }[];
  }): Promise<FestEvent> {
    if (!eventData.name?.trim()) throw new Error('Event Name is required.');

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data: newEv, error } = await supabase
          .from('events')
          .insert({
            name: eventData.name.trim(),
            event_type: eventData.event_type,
            category_id: eventData.category_id || null,
            description: eventData.description?.trim() || '',
            event_date: eventData.event_date || null,
            start_time: eventData.start_time || null,
            end_time: eventData.end_time || null,
            venue: eventData.venue?.trim() || '',
            status: 'upcoming',
            result_status: 'not_entered',
          })
          .select()
          .single();

        if (error) throw new Error(error.message);

        // Copy scoring rules into event_scoring_rules
        if (eventData.scoring_rules.length > 0) {
          const ruleRows = eventData.scoring_rules.map((sr, idx) => ({
            event_id: newEv.id,
            label: sr.label.trim(),
            points: Number(sr.points),
            sort_order: sr.sort_order ?? idx + 1,
          }));
          await supabase.from('event_scoring_rules').insert(ruleRows);
        }

        notifyDbChange();
        return this.getEventById(newEv.id) as Promise<FestEvent>;
      }
    }

    const db = loadLocalDb();
    const newEvent: FestEvent = {
      id: `ev-${Date.now()}`,
      name: eventData.name.trim(),
      event_type: eventData.event_type,
      category_id: eventData.category_id || null,
      description: eventData.description?.trim() || '',
      event_date: eventData.event_date || '',
      start_time: eventData.start_time || '',
      end_time: eventData.end_time || '',
      venue: eventData.venue?.trim() || '',
      status: 'upcoming',
      result_status: 'not_entered',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.events.push(newEvent);

    // Copy scoring rules
    eventData.scoring_rules.forEach((sr, idx) => {
      db.event_scoring_rules.push({
        id: `esr-${Date.now()}-${idx}`,
        event_id: newEvent.id,
        label: sr.label.trim(),
        points: Number(sr.points),
        sort_order: sr.sort_order ?? idx + 1,
        created_at: new Date().toISOString(),
      });
    });

    saveLocalDb(db);
    return this.getEventById(newEvent.id) as Promise<FestEvent>;
  },

  async updateEvent(
    id: string,
    eventData: Partial<FestEvent>,
    scoringRules?: { id?: string; label: string; points: number; sort_order?: number }[]
  ): Promise<FestEvent> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { error } = await supabase
          .from('events')
          .update({
            ...eventData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        if (error) throw new Error(error.message);

        if (scoringRules !== undefined) {
          await supabase.from('event_scoring_rules').delete().eq('event_id', id);
          if (scoringRules.length > 0) {
            const rows = scoringRules.map((sr, idx) => ({
              event_id: id,
              label: sr.label.trim(),
              points: Number(sr.points),
              sort_order: sr.sort_order ?? idx + 1,
            }));
            await supabase.from('event_scoring_rules').insert(rows);
          }
        }

        notifyDbChange();
        return this.getEventById(id) as Promise<FestEvent>;
      }
    }

    const db = loadLocalDb();
    const idx = db.events.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error('Event not found.');

    db.events[idx] = {
      ...db.events[idx],
      ...eventData,
      updated_at: new Date().toISOString(),
    };

    if (scoringRules !== undefined) {
      db.event_scoring_rules = db.event_scoring_rules.filter((sr) => sr.event_id !== id);
      scoringRules.forEach((sr, i) => {
        db.event_scoring_rules.push({
          id: sr.id || `esr-${Date.now()}-${i}`,
          event_id: id,
          label: sr.label.trim(),
          points: Number(sr.points),
          sort_order: sr.sort_order ?? i + 1,
          created_at: new Date().toISOString(),
        });
      });
    }

    saveLocalDb(db);
    return this.getEventById(id) as Promise<FestEvent>;
  },

  async deleteEvent(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { error } = await supabase.from('events').delete().eq('id', id);
        if (error) throw new Error(error.message);
        notifyDbChange();
        return;
      }
    }

    const db = loadLocalDb();
    db.events = db.events.filter((e) => e.id !== id);
    db.event_scoring_rules = db.event_scoring_rules.filter((sr) => sr.event_id !== id);
    db.event_participants = db.event_participants.filter((ep) => ep.event_id !== id);
    db.event_team_assignments = db.event_team_assignments.filter((eta) => eta.event_id !== id);
    db.event_results = db.event_results.filter((er) => er.event_id !== id);
    db.program_schedule = db.program_schedule.filter((sch) => sch.event_id !== id);
    saveLocalDb(db);
  },
};
