import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabaseClient';
import { loadLocalDb, saveLocalDb } from '../lib/localDb';
import { notifyDbChange } from '../lib/dbSync';
import { ProgramScheduleItem } from '../types/database';

export const scheduleService = {
  async getSchedule(): Promise<ProgramScheduleItem[]> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase
          .from('program_schedule')
          .select('*, event:events(*)')
          .order('schedule_date', { ascending: true })
          .order('start_time', { ascending: true });
        if (!error && data) return data as ProgramScheduleItem[];
      }
    }

    const db = loadLocalDb();
    return db.program_schedule
      .map((item) => ({
        ...item,
        event: item.event_id ? db.events.find((e) => e.id === item.event_id) : undefined,
      }))
      .sort((a, b) => {
        if (a.schedule_date !== b.schedule_date) {
          return a.schedule_date.localeCompare(b.schedule_date);
        }
        return (a.start_time || '').localeCompare(b.start_time || '');
      });
  },

  async createScheduleItem(itemData: {
    title: string;
    description?: string;
    schedule_date: string;
    start_time?: string;
    end_time?: string;
    venue?: string;
    event_id?: string | null;
  }): Promise<ProgramScheduleItem> {
    if (!itemData.title?.trim()) throw new Error('Schedule Title is required.');
    if (!itemData.schedule_date) throw new Error('Date is required.');

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase
          .from('program_schedule')
          .insert({
            title: itemData.title.trim(),
            description: itemData.description?.trim() || '',
            schedule_date: itemData.schedule_date,
            start_time: itemData.start_time || null,
            end_time: itemData.end_time || null,
            venue: itemData.venue?.trim() || '',
            event_id: itemData.event_id || null,
          })
          .select('*, event:events(*)')
          .single();
        if (error) throw new Error(error.message);
        notifyDbChange();
        return data as ProgramScheduleItem;
      }
    }

    const db = loadLocalDb();
    const newItem: ProgramScheduleItem = {
      id: `sch-${Date.now()}`,
      title: itemData.title.trim(),
      description: itemData.description?.trim() || '',
      schedule_date: itemData.schedule_date,
      start_time: itemData.start_time || '',
      end_time: itemData.end_time || '',
      venue: itemData.venue?.trim() || '',
      event_id: itemData.event_id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.program_schedule.push(newItem);
    saveLocalDb(db);

    return {
      ...newItem,
      event: newItem.event_id ? db.events.find((e) => e.id === newItem.event_id) : undefined,
    };
  },

  async updateScheduleItem(
    id: string,
    itemData: Partial<{
      title: string;
      description: string;
      schedule_date: string;
      start_time: string;
      end_time: string;
      venue: string;
      event_id: string | null;
    }>
  ): Promise<ProgramScheduleItem> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase
          .from('program_schedule')
          .update({
            ...itemData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select('*, event:events(*)')
          .single();
        if (error) throw new Error(error.message);
        notifyDbChange();
        return data as ProgramScheduleItem;
      }
    }

    const db = loadLocalDb();
    const idx = db.program_schedule.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('Schedule item not found');

    db.program_schedule[idx] = {
      ...db.program_schedule[idx],
      ...itemData,
      updated_at: new Date().toISOString(),
    };
    saveLocalDb(db);

    return {
      ...db.program_schedule[idx],
      event: db.program_schedule[idx].event_id
        ? db.events.find((e) => e.id === db.program_schedule[idx].event_id)
        : undefined,
    };
  },

  async deleteScheduleItem(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { error } = await supabase.from('program_schedule').delete().eq('id', id);
        if (error) throw new Error(error.message);
        notifyDbChange();
        return;
      }
    }

    const db = loadLocalDb();
    db.program_schedule = db.program_schedule.filter((s) => s.id !== id);
    saveLocalDb(db);
  },
};
