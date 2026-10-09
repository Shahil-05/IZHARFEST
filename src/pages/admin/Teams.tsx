import React, { useEffect, useState } from 'react';
import { teamService } from '../../services/teamService';
import { participantService } from '../../services/participantService';
import { Team, Participant } from '../../types/database';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Flag, PlusCircle, Edit2, Trash2, Users, Shield, X, AlertCircle } from 'lucide-react';

export const Teams: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  // Add/Edit Team Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [name, setName] = useState('');
  const [flagColor, setFlagColor] = useState('#3b82f6');
  const [themeAccent, setThemeAccent] = useState('#2563eb');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Manage Leaders Modal
  const [leadersModalOpen, setLeadersModalOpen] = useState(false);
  const [targetTeam, setTargetTeam] = useState<Team | null>(null);
  const [selectedLeaderIds, setSelectedLeaderIds] = useState<string[]>([]);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<Team | null>(null);

  const loadData = async () => {
    try {
      const [allTeams, allParticipants] = await Promise.all([
        teamService.getTeams(),
        participantService.getParticipants(),
      ]);
      setTeams(allTeams);
      setParticipants(allParticipants);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('izhar_db_updated', loadData);
    return () => window.removeEventListener('izhar_db_updated', loadData);
  }, []);

  const openAddModal = () => {
    setEditingTeam(null);
    setName('');
    setFlagColor('#f59e0b');
    setThemeAccent('#d97706');
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (t: Team) => {
    setEditingTeam(t);
    setName(t.name);
    setFlagColor(t.flag_color || '#3b82f6');
    setThemeAccent(t.theme_accent || t.flag_color || '#2563eb');
    setFormError('');
    setModalOpen(true);
  };

  const handleSaveTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      if (editingTeam) {
        await teamService.updateTeam(editingTeam.id, {
          name,
          flag_color: flagColor,
          theme_accent: themeAccent,
        });
      } else {
        await teamService.createTeam({
          name,
          flag_color: flagColor,
          theme_accent: themeAccent,
        });
      }
      setModalOpen(false);
      await loadData();
    } catch (err: any) {
      setFormError(err.message || 'Error saving team.');
    } finally {
      setSaving(false);
    }
  };

  const openLeadersModal = (team: Team) => {
    setTargetTeam(team);
    const currentLeaderIds = team.leaders?.map((l) => l.id) || [];
    setSelectedLeaderIds(currentLeaderIds);
    setLeadersModalOpen(true);
  };

  const handleSaveLeaders = async () => {
    if (!targetTeam) return;
    try {
      await teamService.setTeamLeaders(targetTeam.id, selectedLeaderIds);
      setLeadersModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Error updating team leaders');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await teamService.deleteTeam(deleteTarget.id);
      setDeleteTarget(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Error deleting team');
    }
  };

  // Filter participants of the selected team for leaders picker
  const eligibleLeaders = participants.filter((p) => p.team_id === targetTeam?.id);

  const toggleLeader = (pid: string) => {
    setSelectedLeaderIds((prev) =>
      prev.includes(pid) ? prev.filter((id) => id !== pid) : [...prev, pid]
    );
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#fff' }}>Teams & Houses Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Configure competing teams, flag color aesthetics, and designate student squad leaders.
          </p>
        </div>

        <button className="btn btn-primary" onClick={openAddModal} style={{ gap: '0.45rem' }}>
          <PlusCircle size={16} /> Add Team House
        </button>
      </div>

      {/* Teams Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.75rem',
        }}
      >
        {teams.map((team) => (
          <div
            key={team.id}
            className="glass-panel"
            style={{
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              borderTop: `5px solid ${team.flag_color || '#3b82f6'}`,
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '4px',
                      backgroundColor: team.flag_color || '#fff',
                      border: '2px solid rgba(255, 255, 255, 0.4)',
                    }}
                  />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {team.flag_color?.toUpperCase()}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '4px 8px' }}
                    onClick={() => openEditModal(team)}
                    title="Edit Team"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    style={{ padding: '4px 8px' }}
                    onClick={() => setDeleteTarget(team)}
                    title="Delete Team"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff', marginBottom: '1rem' }}>
                {team.name}
              </h2>

              {/* Leaders */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 700 }}>
                    <Shield size={12} style={{ display: 'inline', marginRight: '4px' }} /> Leaders
                  </span>
                  <button
                    onClick={() => openLeadersModal(team)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--gold)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    + Assign Leaders
                  </button>
                </div>

                {team.leaders && team.leaders.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {team.leaders.map((leader) => (
                      <span
                        key={leader.id}
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          color: '#fff',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        {leader.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-faint)', fontStyle: 'italic' }}>
                    No leaders designated
                  </div>
                )}
              </div>
            </div>

            {/* Member count */}
            <div
              style={{
                paddingTop: '1rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.825rem',
                color: 'var(--text-muted)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Users size={14} />
                <span>{team.member_count ?? 0} Registered Members</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Team Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: '480px', padding: '2rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 800 }}>
                {editingTeam ? 'Edit Team House' : 'Create Team House'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-faint)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  fontSize: '0.85rem',
                  marginBottom: '1.25rem',
                }}
              >
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveTeam}>
              <div className="form-group">
                <label className="form-label">Team House Name *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. TEAM WIRAS"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Flag / Main Color</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="color"
                      value={flagColor}
                      onChange={(e) => setFlagColor(e.target.value)}
                      style={{ width: '42px', height: '38px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: 'transparent' }}
                    />
                    <input
                      type="text"
                      className="form-input"
                      value={flagColor}
                      onChange={(e) => setFlagColor(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Accent Color</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="color"
                      value={themeAccent}
                      onChange={(e) => setThemeAccent(e.target.value)}
                      style={{ width: '42px', height: '38px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: 'transparent' }}
                    />
                    <input
                      type="text"
                      className="form-input"
                      value={themeAccent}
                      onChange={(e) => setThemeAccent(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingTeam ? 'Save Changes' : 'Create Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Leaders Modal */}
      {leadersModalOpen && targetTeam && (
        <div className="modal-overlay" onClick={() => setLeadersModalOpen(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: '520px', padding: '2rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 800 }}>
                  Designate Leaders: {targetTeam.name}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Leaders must be existing registered participants belonging to this team.
                </p>
              </div>
              <button
                onClick={() => setLeadersModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-faint)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {eligibleLeaders.length > 0 ? (
                eligibleLeaders.map((p) => {
                  const isChecked = selectedLeaderIds.includes(p.id);
                  return (
                    <label
                      key={p.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.65rem 0.85rem',
                        borderRadius: 'var(--radius-md)',
                        background: isChecked ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                        border: isChecked ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>{p.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          ID: {p.participant_code} • {p.class_batch}
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleLeader(p.id)}
                        style={{ accentColor: 'var(--gold)', width: '18px', height: '18px' }}
                      />
                    </label>
                  );
                })
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1rem', textAlign: 'center' }}>
                  No participants registered under this team yet. Add participants first.
                </p>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={() => setLeadersModalOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSaveLeaders}>
                Save Leaders Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Team House"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? You cannot delete a team if it currently has registered participants.`}
        confirmLabel="Delete Team"
        isDanger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
