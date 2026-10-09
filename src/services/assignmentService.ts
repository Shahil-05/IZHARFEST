import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabaseClient';
import { loadLocalDb, saveLocalDb } from '../lib/localDb';
import { notifyDbChange } from '../lib/dbSync';
import { AssignmentMode } from '../types/database';

export const assignmentService = {
  // Get assignments for a given event
  async getEventAssignments(eventId: string) {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data: epData } = await supabase
          .from('event_participants')
          .select('participant_id')
          .eq('event_id', eventId);

        const { data: etaData } = await supabase
          .from('event_team_assignments')
          .select('team_id, assignment_mode')
          .eq('event_id', eventId);

        const participantIds = epData?.map((ep) => ep.participant_id) || [];
        const teamAssignments: Record<string, AssignmentMode> = {};
        etaData?.forEach((eta) => {
          teamAssignments[eta.team_id] = eta.assignment_mode as AssignmentMode;
        });

        return {
          participantIds,
          teamAssignments,
        };
      }
    }

    const db = loadLocalDb();
    const participantIds = db.event_participants
      .filter((ep) => ep.event_id === eventId)
      .map((ep) => ep.participant_id);

    const teamAssignments: Record<string, AssignmentMode> = {};
    db.event_team_assignments
      .filter((eta) => eta.event_id === eventId)
      .forEach((eta) => {
        teamAssignments[eta.team_id] = eta.assignment_mode;
      });

    return {
      participantIds,
      teamAssignments,
    };
  },

  // Save assignments for an individual event
  async saveIndividualAssignments(eventId: string, selectedParticipantIds: string[]): Promise<void> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        // Clear existing for this event
        await supabase.from('event_participants').delete().eq('event_id', eventId);
        // Insert new
        if (selectedParticipantIds.length > 0) {
          const rows = selectedParticipantIds.map((pid) => ({
            event_id: eventId,
            participant_id: pid,
          }));
          const { error } = await supabase.from('event_participants').insert(rows);
          if (error) throw new Error(error.message);
        }
        notifyDbChange();
        return;
      }
    }

    const db = loadLocalDb();
    db.event_participants = db.event_participants.filter((ep) => ep.event_id !== eventId);
    selectedParticipantIds.forEach((pid) => {
      db.event_participants.push({
        id: `ep-${Date.now()}-${Math.random()}`,
        event_id: eventId,
        participant_id: pid,
        created_at: new Date().toISOString(),
      });
    });
    saveLocalDb(db);
  },

  // Save assignments for a group event
  async saveGroupAssignments(
    eventId: string,
    teamSettings: {
      teamId: string;
      mode: AssignmentMode;
      participantIds: string[];
    }[]
  ): Promise<void> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        // Reset both event_team_assignments and event_participants for this event
        await supabase.from('event_team_assignments').delete().eq('event_id', eventId);
        await supabase.from('event_participants').delete().eq('event_id', eventId);

        const etaRows = teamSettings.map((ts) => ({
          event_id: eventId,
          team_id: ts.teamId,
          assignment_mode: ts.mode,
        }));
        if (etaRows.length > 0) {
          await supabase.from('event_team_assignments').insert(etaRows);
        }

        // Collect all participating member IDs
        const allMemberIds = Array.from(new Set(teamSettings.flatMap((ts) => ts.participantIds)));
        if (allMemberIds.length > 0) {
          const epRows = allMemberIds.map((pid) => ({
            event_id: eventId,
            participant_id: pid,
          }));
          await supabase.from('event_participants').insert(epRows);
        }
        notifyDbChange();
        return;
      }
    }

    const db = loadLocalDb();
    db.event_team_assignments = db.event_team_assignments.filter((eta) => eta.event_id !== eventId);
    db.event_participants = db.event_participants.filter((ep) => ep.event_id !== eventId);

    teamSettings.forEach((ts) => {
      db.event_team_assignments.push({
        id: `eta-${Date.now()}-${ts.teamId}`,
        event_id: eventId,
        team_id: ts.teamId,
        assignment_mode: ts.mode,
        created_at: new Date().toISOString(),
      });
    });

    const allMemberIds = Array.from(new Set(teamSettings.flatMap((ts) => ts.participantIds)));
    allMemberIds.forEach((pid) => {
      db.event_participants.push({
        id: `ep-${Date.now()}-${Math.random()}`,
        event_id: eventId,
        participant_id: pid,
        created_at: new Date().toISOString(),
      });
    });

    saveLocalDb(db);
  },
};
