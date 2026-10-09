import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabaseClient';
import { loadLocalDb, saveLocalDb } from '../lib/localDb';
import { notifyDbChange } from '../lib/dbSync';
import { ScoringTemplate, ScoringTemplateRule } from '../types/database';

export const scoringService = {
  async getTemplates(): Promise<ScoringTemplate[]> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase
          .from('scoring_templates')
          .select('*, rules:scoring_template_rules(*)')
          .order('name');
        if (!error && data) {
          return data.map((t: any) => ({
            ...t,
            rules: t.rules?.sort((a: any, b: any) => a.sort_order - b.sort_order) || [],
          }));
        }
      }
    }

    const db = loadLocalDb();
    return db.scoring_templates.map((t) => {
      const rules = db.scoring_template_rules
        .filter((r) => r.template_id === t.id)
        .sort((a, b) => a.sort_order - b.sort_order);
      return {
        ...t,
        rules,
      };
    });
  },

  async createTemplate(
    name: string,
    eventType: 'individual' | 'group' | 'all' = 'all',
    rules: { label: string; points: number; sort_order?: number }[] = []
  ): Promise<ScoringTemplate> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data: tpl, error } = await supabase
          .from('scoring_templates')
          .insert({ name: name.trim(), event_type: eventType })
          .select()
          .single();
        if (error) throw new Error(error.message);

        if (rules.length > 0) {
          const ruleRows = rules.map((r, i) => ({
            template_id: tpl.id,
            label: r.label.trim(),
            points: Number(r.points),
            sort_order: r.sort_order ?? i + 1,
          }));
          await supabase.from('scoring_template_rules').insert(ruleRows);
        }

        notifyDbChange();
        const templates = await this.getTemplates();
        return templates.find((t) => t.id === tpl.id)!;
      }
    }

    const db = loadLocalDb();
    const newTpl: ScoringTemplate = {
      id: `tpl-${Date.now()}`,
      name: name.trim(),
      event_type: eventType,
      created_at: new Date().toISOString(),
    };
    db.scoring_templates.push(newTpl);

    rules.forEach((r, i) => {
      db.scoring_template_rules.push({
        id: `str-${Date.now()}-${i}`,
        template_id: newTpl.id,
        label: r.label.trim(),
        points: Number(r.points),
        sort_order: r.sort_order ?? i + 1,
      });
    });

    saveLocalDb(db);
    const templates = await this.getTemplates();
    return templates.find((t) => t.id === newTpl.id)!;
  },

  async updateTemplate(
    id: string,
    name: string,
    eventType: 'individual' | 'group' | 'all',
    rules?: { id?: string; label: string; points: number; sort_order?: number }[]
  ): Promise<ScoringTemplate> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase
          .from('scoring_templates')
          .update({ name: name.trim(), event_type: eventType })
          .eq('id', id);

        if (rules !== undefined) {
          await supabase.from('scoring_template_rules').delete().eq('template_id', id);
          if (rules.length > 0) {
            const ruleRows = rules.map((r, i) => ({
              template_id: id,
              label: r.label.trim(),
              points: Number(r.points),
              sort_order: r.sort_order ?? i + 1,
            }));
            await supabase.from('scoring_template_rules').insert(ruleRows);
          }
        }
        notifyDbChange();
        const templates = await this.getTemplates();
        return templates.find((t) => t.id === id)!;
      }
    }

    const db = loadLocalDb();
    const idx = db.scoring_templates.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error('Template not found');

    db.scoring_templates[idx] = {
      ...db.scoring_templates[idx],
      name: name.trim(),
      event_type: eventType,
    };

    if (rules !== undefined) {
      db.scoring_template_rules = db.scoring_template_rules.filter((r) => r.template_id !== id);
      rules.forEach((r, i) => {
        db.scoring_template_rules.push({
          id: r.id || `str-${Date.now()}-${i}`,
          template_id: id,
          label: r.label.trim(),
          points: Number(r.points),
          sort_order: r.sort_order ?? i + 1,
        });
      });
    }

    saveLocalDb(db);
    const templates = await this.getTemplates();
    return templates.find((t) => t.id === id)!;
  },

  async deleteTemplate(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { error } = await supabase.from('scoring_templates').delete().eq('id', id);
        if (error) throw new Error(error.message);
        notifyDbChange();
        return;
      }
    }

    const db = loadLocalDb();
    db.scoring_templates = db.scoring_templates.filter((t) => t.id !== id);
    db.scoring_template_rules = db.scoring_template_rules.filter((r) => r.template_id !== id);
    saveLocalDb(db);
  },
};
