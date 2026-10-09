import React, { useEffect, useState } from 'react';
import { eventService } from '../../services/eventService';
import { resultService, ResultInputItem } from '../../services/resultService';
import { FestEvent, EventScoringRule, ResultStatus } from '../../types/database';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { StatusBadge } from '../../components/StatusBadge';
import {
  Trophy,
  Save,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Award,
  Users,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const Results: React.FC = () => {
  const [events, setEvents] = useState<FestEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [activeEvent, setActiveEvent] = useState<FestEvent | null>(null);
  const [loading, setLoading] = useState(true);

  // Result entry rows
  const [resultRows, setResultRows] = useState<
    {
      key: string;
      id?: string;
      participant_id?: string | null;
      participant_name?: string;
      participant_code?: string;
      team_id: string;
      team_name: string;
      flag_color?: string;
      scoring_rule_id: string;
      result_label: string;
      points: number;
    }[]
  >([]);

  // Confirmation dialogs
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [showEditPublishedConfirm, setShowEditPublishedConfirm] = useState(false);
  const [showVoidConfirm, setShowVoidConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<ResultStatus | null>(null);

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const loadEvents = async () => {
    try {
      const allEvents = await eventService.getEvents();
      setEvents(allEvents);
      if (allEvents.length > 0 && !selectedEventId) {
        setSelectedEventId(allEvents[0].id);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // When selected event changes, load its full details and current results
  useEffect(() => {
    if (!selectedEventId) return;
    eventService.getEventById(selectedEventId).then((fullEvent) => {
      if (!fullEvent) return;
      setActiveEvent(fullEvent);

      const rules = fullEvent.scoring_rules || [];
      const currentResults = fullEvent.results || [];

      if (fullEvent.event_type === 'individual') {
        // Build rows from assigned participants
        const assigned = fullEvent.assigned_participants || [];
        const rows = assigned.map((p) => {
          const existing = currentResults.find((r) => r.participant_id === p.id);
          return {
            key: p.id,
            id: existing?.id,
            participant_id: p.id,
            participant_name: p.name,
            participant_code: p.participant_code,
            team_id: p.team_id,
            team_name: p.team?.name || 'Assigned Team',
            flag_color: p.team?.flag_color,
            scoring_rule_id: existing?.scoring_rule_id || '',
            result_label: existing?.result_label || '',
            points: existing ? Number(existing.points) : 0,
          };
        });
        setResultRows(rows);
      } else {
        // Group event: rows from assigned teams
        const assignedTeams = fullEvent.assigned_teams || [];
        const rows = assignedTeams.map((at) => {
          const existing = currentResults.find((r) => r.team_id === at.team_id);
          return {
            key: at.team_id,
            id: existing?.id,
            participant_id: null,
            participant_name: undefined,
            team_id: at.team_id,
            team_name: at.team?.name || 'Assigned Team',
            flag_color: at.team?.flag_color,
            scoring_rule_id: existing?.scoring_rule_id || '',
            result_label: existing?.result_label || '',
            points: existing ? Number(existing.points) : 0,
          };
        });
        setResultRows(rows);
      }
    });
  }, [selectedEventId]);

  const handleRuleSelect = (idx: number, ruleId: string) => {
    if (!activeEvent) return;
    const rule = activeEvent.scoring_rules?.find((r) => r.id === ruleId);

    setResultRows((prev) => {
      const copy = [...prev];
      if (rule) {
        copy[idx] = {
          ...copy[idx],
          scoring_rule_id: rule.id,
          result_label: rule.label,
          points: rule.points, // Automatically populate points!
        };
      } else {
        // None / No position
        copy[idx] = {
          ...copy[idx],
          scoring_rule_id: '',
          result_label: '',
          points: 0,
        };
      }
      return copy;
    });
  };

  const handleCustomLabelChange = (idx: number, label: string) => {
    setResultRows((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], result_label: label };
      return copy;
    });
  };

  const handlePointsChange = (idx: number, pts: number) => {
    setResultRows((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], points: Number(pts) };
      return copy;
    });
  };

  const triggerSave = (targetStatus: ResultStatus) => {
    if (!activeEvent) return;

    // If event is already published, editing requires confirmation warning
    if (activeEvent.result_status === 'published') {
      setPendingAction(targetStatus);
      setShowEditPublishedConfirm(true);
      return;
    }

    if (targetStatus === 'published') {
      setShowPublishConfirm(true);
      return;
    }

    executeSave('draft');
  };

  const executeSave = async (targetStatus: ResultStatus) => {
    if (!activeEvent) return;
    setSaving(true);
    setSuccessMsg('');
    try {
      // Filter rows that have position or points assigned
      const payload: ResultInputItem[] = resultRows
        .filter((r) => r.result_label.trim() && r.points > 0)
        .map((r) => ({
          id: r.id,
          participant_id: r.participant_id,
          team_id: r.team_id,
          scoring_rule_id: r.scoring_rule_id || null,
          result_label: r.result_label,
          points: Number(r.points),
        }));

      await resultService.saveResults(activeEvent.id, payload, targetStatus);
      setSuccessMsg(
        targetStatus === 'published'
          ? 'Results successfully published to the live leaderboard!'
          : 'Results saved as draft. Invisible to the public.'
      );

      // Refresh event
      await loadEvents();
      const updated = await eventService.getEventById(activeEvent.id);
      setActiveEvent(updated);
      window.dispatchEvent(new Event('izhar_db_updated'));
    } catch (err: any) {
      alert(err.message || 'Error saving results');
    } finally {
      setSaving(false);
      setShowPublishConfirm(false);
      setShowEditPublishedConfirm(false);
      setPendingAction(null);
    }
  };

  const handleVoid = async () => {
    if (!activeEvent) return;
    try {
      await resultService.voidResults(activeEvent.id);
      setShowVoidConfirm(false);
      setSuccessMsg('Results voided. Event status reset to pending.');
      await loadEvents();
      const updated = await eventService.getEventById(activeEvent.id);
      setActiveEvent(updated);
      window.dispatchEvent(new Event('izhar_db_updated'));
    } catch (err: any) {
      alert(err.message || 'Error voiding results');
    }
  };

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#fff' }}>Results & Scoring Control</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Record participant placements and group verdicts. Safe draft workflow with confirmation safeguards.
          </p>
        </div>

        {activeEvent && (
          <div style={{ display: 'flex', gap: '0.65rem' }}>
            {activeEvent.result_status !== 'not_entered' && (
              <button
                className="btn btn-danger btn-sm"
                onClick={() => setShowVoidConfirm(true)}
                title="Clear and reset results for this event"
              >
                <RotateCcw size={14} /> Void Results
              </button>
            )}
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => triggerSave('draft')}
              disabled={saving}
              style={{ gap: '0.35rem' }}
            >
              <Save size={14} /> Save Draft
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => triggerSave('published')}
              disabled={saving}
              style={{ gap: '0.35rem' }}
            >
              <Trophy size={14} /> Publish Official Results
            </button>
          </div>
        )}
      </div>

      {successMsg && (
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
          <span>{successMsg}</span>
        </div>
      )}

      {/* Event Selector Card */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Select Event for Scoring</label>
            <select
              className="form-select"
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              style={{ fontSize: '1rem', fontWeight: 700 }}
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name} — [{ev.event_type.toUpperCase()}] ({ev.result_status.replace('_', ' ').toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {activeEvent && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Current Result Status
                </span>
                <div style={{ marginTop: '0.2rem' }}>
                  <StatusBadge resultStatus={activeEvent.result_status} />
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Event Mode
                </span>
                <div style={{ marginTop: '0.2rem', fontWeight: 700, color: 'var(--gold)', fontSize: '0.9rem' }}>
                  {activeEvent.event_type === 'individual' ? 'Individual Contest' : 'Group Squad Contest'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Table for Selected Event */}
      {activeEvent && (
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.15rem', color: '#fff', fontWeight: 800 }}>
              {activeEvent.name} — Scoring Matrix
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Only enrolled candidates/squads are listed ({resultRows.length} total)
            </span>
          </div>

          {resultRows.length > 0 ? (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{activeEvent.event_type === 'group' ? 'Assigned Team' : 'Participant & Team'}</th>
                    <th style={{ width: '220px' }}>Placement / Scoring Rule</th>
                    <th style={{ width: '180px' }}>Result Label</th>
                    <th style={{ width: '120px', textAlign: 'right' }}>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {resultRows.map((row, idx) => (
                    <tr key={row.key}>
                      <td>
                        {activeEvent.event_type === 'group' ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div
                              style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '3px',
                                backgroundColor: row.flag_color || '#fff',
                              }}
                            />
                            <span style={{ fontWeight: 800, color: '#fff', fontSize: '1rem' }}>
                              {row.team_name}
                            </span>
                          </div>
                        ) : (
                          <div>
                            <div style={{ fontWeight: 700, color: '#fff' }}>{row.participant_name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {row.team_name} • {row.participant_code}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Rule dropdown (auto-fills points & label) */}
                      <td>
                        <select
                          className="form-select"
                          style={{ padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}
                          value={row.scoring_rule_id}
                          onChange={(e) => handleRuleSelect(idx, e.target.value)}
                        >
                          <option value="">-- No Placement --</option>
                          {activeEvent.scoring_rules?.map((rule) => (
                            <option key={rule.id} value={rule.id}>
                              {rule.label} (+{rule.points} pts)
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Result Label */}
                      <td>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. 1st Position"
                          value={row.result_label}
                          onChange={(e) => handleCustomLabelChange(idx, e.target.value)}
                          style={{ padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}
                        />
                      </td>

                      {/* Points */}
                      <td style={{ textAlign: 'right' }}>
                        <input
                          type="number"
                          className="form-input"
                          value={row.points}
                          onChange={(e) => handlePointsChange(idx, Number(e.target.value))}
                          style={{
                            padding: '0.45rem 0.65rem',
                            fontSize: '0.95rem',
                            fontWeight: 800,
                            textAlign: 'right',
                            color: row.points > 0 ? 'var(--gold)' : 'var(--text-faint)',
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Users size={36} color="var(--gold)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <p>No participants or squads are currently assigned to this event.</p>
              <p style={{ fontSize: '0.8rem', marginTop: '0.35rem' }}>
                Please enroll participants in the <strong>Assignments</strong> section first.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Confirmation: Publish */}
      <ConfirmDialog
        isOpen={showPublishConfirm}
        title="Publish Official Results"
        message="Publishing these results will make them publicly visible immediately on the fest portal and will affect the team championship leaderboard."
        confirmLabel="Publish to Leaderboard"
        isWarning
        onConfirm={() => executeSave('published')}
        onCancel={() => setShowPublishConfirm(false)}
      />

      {/* Warning: Editing Already Published Results */}
      <ConfirmDialog
        isOpen={showEditPublishedConfirm}
        title="Warning: Modifying Published Results"
        message="This result has already been published. Changing it will directly recalculate and modify the official team championship standings. Are you sure you want to proceed with this correction?"
        confirmLabel="Confirm & Recalculate Standings"
        isDanger
        onConfirm={() => executeSave(pendingAction || 'published')}
        onCancel={() => {
          setShowEditPublishedConfirm(false);
          setPendingAction(null);
        }}
      />

      {/* Confirmation: Void Results */}
      <ConfirmDialog
        isOpen={showVoidConfirm}
        title="Void Event Results"
        message="Are you sure you want to completely void all recorded results for this event? Points contributed to the leaderboard will be revoked."
        confirmLabel="Void Results"
        isDanger
        onConfirm={handleVoid}
        onCancel={() => setShowVoidConfirm(false)}
      />
    </div>
  );
};
