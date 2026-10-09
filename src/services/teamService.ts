import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabaseClient';
import { loadLocalDb, saveLocalDb } from '../lib/localDb';
import { notifyDbChange } from '../lib/dbSync';
import { Team, Participant } from '../types/database';

export const teamService = {
  async getTeams(): Promise<Team[]> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data: teams, error } = await supabase
          .from('teams')
          .select('*, team_leaders(participant_id, participants(*))')
          .order('name');
        if (!error && teams) {
          // fetch member counts
          const { data: participants } = await supabase.from('participants').select('id, team_id');
          const countMap: Record<string, number> = {};
          participants?.forEach((p) => {
            countMap[p.team_id] = (countMap[p.team_id] || 0) + 1;
          });

          return teams.map((t: any) => ({
            id: t.id,
            name: t.name,
            flag_color: t.flag_color,
            theme_accent: t.theme_accent,
            created_at: t.created_at,
            leaders: t.team_leaders?.map((tl: any) => tl.participants).filter(Boolean) || [],
            member_count: countMap[t.id] || 0,
          }));
        }
      }
    }

    const db = loadLocalDb();
    return db.teams.map((t) => {
      const leaderParticipantIds = db.team_leaders
        .filter((tl) => tl.team_id === t.id)
        .map((tl) => tl.participant_id);
      const leaders = db.participants.filter((p) => leaderParticipantIds.includes(p.id));
      const member_count = db.participants.filter((p) => p.team_id === t.id).length;
      return {
        ...t,
        leaders,
        member_count,
      };
    });
  },

  async getTeamById(id: string): Promise<Team | null> {
    const teams = await this.getTeams();
    return teams.find((t) => t.id === id) || null;
  },

  async createTeam(teamData: { name: string; flag_color: string; theme_accent?: string }): Promise<Team> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase
          .from('teams')
          .insert({
            name: teamData.name.trim(),
            flag_color: teamData.flag_color,
            theme_accent: teamData.theme_accent || teamData.flag_color,
          })
          .select()
          .single();
        if (error) throw new Error(error.message);
        notifyDbChange();
        return data as Team;
      }
    }

    const db = loadLocalDb();
    if (db.teams.some((t) => t.name.toLowerCase() === teamData.name.trim().toLowerCase())) {
      throw new Error(`Team "${teamData.name}" already exists.`);
    }

    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name: teamData.name.trim(),
      flag_color: teamData.flag_color,
      theme_accent: teamData.theme_accent || teamData.flag_color,
      created_at: new Date().toISOString(),
    };
    db.teams.push(newTeam);
    saveLocalDb(db);
    return newTeam;
  },

  async updateTeam(id: string, teamData: Partial<Team>): Promise<Team> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase
          .from('teams')
          .update({
            ...teamData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single();
        if (error) throw new Error(error.message);
        notifyDbChange();
        return data as Team;
      }
    }

    const db = loadLocalDb();
    const idx = db.teams.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error('Team not found');

    db.teams[idx] = {
      ...db.teams[idx],
      ...teamData,
      updated_at: new Date().toISOString(),
    };
    saveLocalDb(db);
    return db.teams[idx];
  },

  async deleteTeam(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { error } = await supabase.from('teams').delete().eq('id', id);
        if (error) throw new Error(error.message);
        notifyDbChange();
        return;
      }
    }

    const db = loadLocalDb();
    const hasParticipants = db.participants.some((p) => p.team_id === id);
    if (hasParticipants) {
      throw new Error('Cannot delete team with assigned participants. Reassign or delete participants first.');
    }

    db.teams = db.teams.filter((t) => t.id !== id);
    db.team_leaders = db.team_leaders.filter((tl) => tl.team_id !== id);
    db.team_point_adjustments = db.team_point_adjustments.filter((tpa) => tpa.team_id !== id);
    saveLocalDb(db);
  },

  async setTeamLeaders(teamId: string, participantIds: string[]): Promise<void> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        // Delete old
        await supabase.from('team_leaders').delete().eq('team_id', teamId);
        // Insert new
        if (participantIds.length > 0) {
          const rows = participantIds.map((pid) => ({
            team_id: teamId,
            participant_id: pid,
          }));
          const { error } = await supabase.from('team_leaders').insert(rows);
          if (error) throw new Error(error.message);
        }
        notifyDbChange();
        return;
      }
    }

    const db = loadLocalDb();
    db.team_leaders = db.team_leaders.filter((tl) => tl.team_id !== teamId);
    participantIds.forEach((pid) => {
      db.team_leaders.push({
        id: `tl-${Date.now()}-${Math.random()}`,
        team_id: teamId,
        participant_id: pid,
        created_at: new Date().toISOString(),
      });
    });
    saveLocalDb(db);
  },
};
