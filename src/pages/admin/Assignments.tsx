import React, { useEffect, useState } from 'react';
import { eventService } from '../../services/eventService';
import { teamService } from '../../services/teamService';
import { participantService } from '../../services/participantService';
import { assignmentService } from '../../services/assignmentService';
import { FestEvent, Team, Participant, AssignmentMode } from '../../types/database';
import { UserCheck, Users, Search, CheckCircle2, AlertCircle, Save } from 'lucide-react';

export const Assignments: React.FC = () => {
  const [events, setEvents] = useState<FestEvent[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Assignment states for selected event
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>([]);
  const [teamModes, setTeamModes] = useState<Record<string, AssignmentMode>>({});
  const [teamSelectedMembers, setTeamSelectedMembers] = useState<Record<string, string[]>>({});

  // Filter/search for individual list
  const [participantSearch, setParticipantSearch] = useState('');
  const [filterTeam, setFilterTeam] = useState('all');

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const loadInitialData = async () => {
    try {
      const [allEvents, allTeams, allParts] = await Promise.all([
        eventService.getEvents(),
        teamService.getTeams(),
        participantService.getParticipants(),
      ]);
      setEvents(allEvents);
      setTeams(allTeams);
      setParticipants(allParts);
      if (allEvents.length > 0 && !selectedEventId) {
        setSelectedEventId(allEvents[0].id);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // When selected event changes, load its assignments
  useEffect(() => {
    if (!selectedEventId) return;
    const currentEv = events.find((e) => e.id === selectedEventId);
    if (!currentEv) return;

    assignmentService.getEventAssignments(selectedEventId).then((data) => {
      setSelectedParticipantIds(data.participantIds);

      // Group event setup
      const modes: Record<string, AssignmentMode> = {};
      const membersMap: Record<string, string[]> = {};

      teams.forEach((t) => {
        modes[t.id] = data.teamAssignments[t.id] || 'selected_participants';
        // Members assigned to this event belonging to this team
        membersMap[t.id] = data.participantIds.filter((pid) => {
          const part = participants.find((p) => p.id === pid);
          return part?.team_id === t.id;
        });
      });

      setTeamModes(modes);
      setTeamSelectedMembers(membersMap);
      setSavedSuccess(false);
    });
  }, [selectedEventId, events, teams, participants]);

  const activeEvent = events.find((e) => e.id === selectedEventId);
  const isGroup = activeEvent?.event_type === 'group';

  // Toggle for individual
  const toggleIndividualParticipant = (pid: string) => {
    setSelectedParticipantIds((prev) =>
      prev.includes(pid) ? prev.filter((id) => id !== pid) : [...prev, pid]
    );
    setSavedSuccess(false);
  };

  // Toggle for group selected members
  const toggleGroupMember = (teamId: string, pid: string) => {
    setTeamSelectedMembers((prev) => {
      const current = prev[teamId] || [];
      const updated = current.includes(pid)
        ? current.filter((id) => id !== pid)
        : [...current, pid];
      return { ...prev, [teamId]: updated };
    });
    setSavedSuccess(false);
  };

  const handleModeChange = (teamId: string, mode: AssignmentMode) => {
    setTeamModes((prev) => ({ ...prev, [teamId]: mode }));
    if (mode === 'entire_team') {
      // populate with all current members of that team
      const allTeamMemberIds = participants.filter((p) => p.team_id === teamId).map((p) => p.id);
      setTeamSelectedMembers((prev) => ({ ...prev, [teamId]: allTeamMemberIds }));
    }
    setSavedSuccess(false);
  };

  const handleSaveAssignments = async () => {
    if (!selectedEventId || !activeEvent) return;
    setSaving(true);
    setSavedSuccess(false);
    try {
      if (activeEvent.event_type === 'individual') {
        await assignmentService.saveIndividualAssignments(selectedEventId, selectedParticipantIds);
      } else {
        const teamSettings = teams.map((t) => ({
          teamId: t.id,
          mode: teamModes[t.id] || 'selected_participants',
          participantIds: teamSelectedMembers[t.id] || [],
        }));
        await assignmentService.saveGroupAssignments(selectedEventId, teamSettings);
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      window.dispatchEvent(new Event('izhar_db_updated'));
    } catch (err: any) {
      alert(err.message || 'Error saving assignments');
    } finally {
      setSaving(false);
    }
  };

  const filteredIndividualParticipants = participants.filter((p) => {
    if (participantSearch.trim()) {
      const q = participantSearch.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.participant_code.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (filterTeam !== 'all' && p.team_id !== filterTeam) {
      return false;
    }
    return true;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#fff' }}>Event Assignments Matrix</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Assign participants to individual events or squads to group competitions. Synchronized across participant profiles.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleSaveAssignments}
          disabled={saving || !selectedEventId}
          style={{ gap: '0.45rem' }}
        >
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Assignments'}
        </button>
      </div>

      {savedSuccess && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            color: '#34d399',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.75rem',
          }}
        >
          <CheckCircle2 size={18} />
          <span>Event assignments saved successfully! Synchronized across all participant records.</span>
        </div>
      )}

      {/* Event Selector Card */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Select Competition Event</label>
          <select
            className="form-select"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            style={{ fontSize: '1rem', fontWeight: 700 }}
          >
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.name} — [{ev.event_type.toUpperCase()}] ({ev.category?.name || 'General'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dynamic Assignment Interface */}
      {activeEvent && (
        <div>
          {isGroup ? (
            /* GROUP ASSIGNMENT INTERFACE */
            <div>
              <div style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 800 }}>
                  Group Squad Assignment: {activeEvent.name}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  For each team, choose whether the entire team is entered or hand-pick specific squad members.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
                {teams.map((team) => {
                  const mode = teamModes[team.id] || 'selected_participants';
                  const teamMembers = participants.filter((p) => p.team_id === team.id);
                  const selectedMembers = teamSelectedMembers[team.id] || [];

                  return (
                    <div
                      key={team.id}
                      className="glass-panel"
                      style={{
                        padding: '1.5rem',
                        borderTop: `4px solid ${team.flag_color || '#3b82f6'}`,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <div
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '3px',
                            backgroundColor: team.flag_color || '#fff',
                          }}
                        />
                        <h4 style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 800 }}>{team.name}</h4>
                      </div>

                      {/* Mode Radio Buttons */}
                      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                          <input
                            type="radio"
                            name={`mode-${team.id}`}
                            checked={mode === 'entire_team'}
                            onChange={() => handleModeChange(team.id, 'entire_team')}
                            style={{ accentColor: 'var(--gold)' }}
                          />
                          <span>Entire Team ({teamMembers.length})</span>
                        </label>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                          <input
                            type="radio"
                            name={`mode-${team.id}`}
                            checked={mode === 'selected_participants'}
                            onChange={() => handleModeChange(team.id, 'selected_participants')}
                            style={{ accentColor: 'var(--gold)' }}
                          />
                          <span>Selected Members ({selectedMembers.length})</span>
                        </label>
                      </div>

                      {/* Participants Checklist */}
                      <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {teamMembers.map((m) => {
                          const isChecked = selectedMembers.includes(m.id);
                          return (
                            <label
                              key={m.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0.5rem 0.75rem',
                                borderRadius: 'var(--radius-sm)',
                                background: isChecked ? 'rgba(59, 130, 246, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                                border: isChecked ? '1px solid rgba(59, 130, 246, 0.35)' : '1px solid var(--border-subtle)',
                                cursor: mode === 'entire_team' ? 'not-allowed' : 'pointer',
                                opacity: mode === 'entire_team' ? 0.75 : 1,
                              }}
                            >
                              <div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>{m.name}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>{m.participant_code}</div>
                              </div>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                disabled={mode === 'entire_team'}
                                onChange={() => toggleGroupMember(team.id, m.id)}
                                style={{ accentColor: '#3b82f6', width: '16px', height: '16px' }}
                              />
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* INDIVIDUAL ASSIGNMENT INTERFACE */
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 800 }}>
                    Individual Enrollment: {activeEvent.name}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Check candidates participating in this individual contest ({selectedParticipantIds.length} currently assigned).
                  </p>
                </div>

                {/* Filter / Search within participant list */}
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search candidate..."
                    value={participantSearch}
                    onChange={(e) => setParticipantSearch(e.target.value)}
                    style={{ width: '200px', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                  />

                  <select
                    className="form-select"
                    value={filterTeam}
                    onChange={(e) => setFilterTeam(e.target.value)}
                    style={{ width: '150px', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                  >
                    <option value="all">All Teams</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '0.75rem',
                }}
              >
                {filteredIndividualParticipants.map((p) => {
                  const isChecked = selectedParticipantIds.includes(p.id);
                  return (
                    <label
                      key={p.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        background: isChecked ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                        border: isChecked ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>{p.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {p.team?.name} • {p.participant_code}
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleIndividualParticipant(p.id)}
                        style={{ accentColor: 'var(--gold)', width: '18px', height: '18px' }}
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
