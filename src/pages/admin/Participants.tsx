import React, { useEffect, useState } from 'react';
import { participantService } from '../../services/participantService';
import { teamService } from '../../services/teamService';
import { eventService } from '../../services/eventService';
import { Participant, Team, FestEvent } from '../../types/database';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import {
  Users,
  Search,
  Filter,
  PlusCircle,
  Edit2,
  Trash2,
  Eye,
  X,
  CheckCircle2,
  AlertCircle,
  Award,
} from 'lucide-react';

export const Participants: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [events, setEvents] = useState<FestEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [selectedBatch, setSelectedBatch] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<string>('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);

  // Form Fields
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [classBatch, setClassBatch] = useState('');
  const [teamId, setTeamId] = useState('');
  const [assignedEventIds, setAssignedEventIds] = useState<string[]>([]);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<Participant | null>(null);

  const loadData = async () => {
    try {
      const [allParts, allTeams, allEvents] = await Promise.all([
        participantService.getParticipants(),
        teamService.getTeams(),
        eventService.getEvents(),
      ]);
      setParticipants(allParts);
      setTeams(allTeams);
      setEvents(allEvents);
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
    setEditingParticipant(null);
    setCode('');
    setName('');
    setClassBatch('');
    setTeamId(teams[0]?.id || '');
    setAssignedEventIds([]);
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (p: Participant) => {
    setEditingParticipant(p);
    setCode(p.participant_code);
    setName(p.name);
    setClassBatch(p.class_batch);
    setTeamId(p.team_id);
    const existingEvents = p.events?.map((e) => e.id) || [];
    setAssignedEventIds(existingEvents);
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      if (editingParticipant) {
        await participantService.updateParticipant(
          editingParticipant.id,
          {
            participant_code: code,
            name,
            class_batch: classBatch,
            team_id: teamId,
          },
          assignedEventIds
        );
      } else {
        await participantService.createParticipant(
          {
            participant_code: code,
            name,
            class_batch: classBatch,
            team_id: teamId,
          },
          assignedEventIds
        );
      }
      setModalOpen(false);
      await loadData();
    } catch (err: any) {
      setFormError(err.message || 'Error saving participant.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await participantService.deleteParticipant(deleteTarget.id);
      setDeleteTarget(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Error deleting participant.');
    }
  };

  const toggleEvent = (evId: string) => {
    setAssignedEventIds((prev) =>
      prev.includes(evId) ? prev.filter((id) => id !== evId) : [...prev, evId]
    );
  };

  const uniqueBatches = Array.from(new Set(participants.map((p) => p.class_batch))).filter(Boolean);

  const filteredParticipants = participants.filter((p) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchCode = p.participant_code.toLowerCase().includes(q);
      if (!matchName && !matchCode) return false;
    }
    if (selectedTeam !== 'all' && p.team_id !== selectedTeam) return false;
    if (selectedBatch !== 'all' && p.class_batch !== selectedBatch) return false;
    if (selectedEvent !== 'all' && !p.events?.some((e) => e.id === selectedEvent)) return false;
    return true;
  });

  const individualEvents = events.filter((e) => e.event_type === 'individual');
  const groupEvents = events.filter((e) => e.event_type === 'group');

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#fff' }}>Participants Directory</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Manage registered students, team house assignments, and event enrollment matrix.
          </p>
        </div>

        <button className="btn btn-primary" onClick={openAddModal} style={{ gap: '0.45rem' }}>
          <PlusCircle size={16} /> Add Participant
        </button>
      </div>

      {/* Toolbar / Filters */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem',
          marginBottom: '2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          alignItems: 'end',
        }}
      >
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Search Name or ID</label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Riyas, WIR-001..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.25rem' }}
            />
            <Search
              size={15}
              style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }}
            />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Team Filter</label>
          <select className="form-select" value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)}>
            <option value="all">All Teams</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Batch / Class</label>
          <select className="form-select" value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)}>
            <option value="all">All Batches</option>
            {uniqueBatches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Assigned Event</label>
          <select className="form-select" value={selectedEvent} onChange={(e) => setSelectedEvent(e.target.value)}>
            <option value="all">All Events</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.name} ({ev.event_type})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Participants Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '130px' }}>ID Code</th>
                <th>Name</th>
                <th>Class / Batch</th>
                <th>Assigned Team</th>
                <th>Enrolled Events</th>
                <th style={{ textAlign: 'right', width: '110px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredParticipants.length > 0 ? (
                filteredParticipants.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          background: 'rgba(255, 255, 255, 0.06)',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          color: 'var(--gold)',
                        }}
                      >
                        {p.participant_code}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#fff' }}>{p.name}</div>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{p.class_batch}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div
                          style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '2px',
                            backgroundColor: p.team?.flag_color || '#fff',
                          }}
                        />
                        <span style={{ fontWeight: 600, color: '#fff' }}>{p.team?.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-ongoing" style={{ fontSize: '0.75rem' }}>
                        {p.events?.length || 0} Events
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px' }}
                          title="Edit Participant"
                          onClick={() => openEditModal(p)}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          style={{ padding: '4px 8px' }}
                          title="Delete Participant"
                          onClick={() => setDeleteTarget(p)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No participants found matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Participant Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: '620px', padding: '2rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.3rem', color: '#fff', fontWeight: 800 }}>
                {editingParticipant ? 'Edit Participant' : 'Add New Participant'}
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
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1.25rem',
                }}
              >
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">ID Code *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. WIR-004"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="Student full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Class / Batch *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Senior Batch A"
                    value={classBatch}
                    onChange={(e) => setClassBatch(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Team Squad *</label>
                  <select
                    className="form-select"
                    required
                    value={teamId}
                    onChange={(e) => setTeamId(e.target.value)}
                  >
                    <option value="">Select Team</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Event Assignment Section (Separated into Individual and Group) */}
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
                <label className="form-label" style={{ marginBottom: '0.75rem', display: 'block' }}>
                  Event Assignments (Synchronized with Event Roster)
                </label>

                {/* Individual Events */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    Individual Events
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.5rem' }}>
                    {individualEvents.map((ev) => {
                      const isChecked = assignedEventIds.includes(ev.id);
                      return (
                        <label
                          key={ev.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            padding: '0.5rem 0.75rem',
                            borderRadius: 'var(--radius-sm)',
                            background: isChecked ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                            border: isChecked ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid var(--border-subtle)',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleEvent(ev.id)}
                            style={{ accentColor: 'var(--gold)' }}
                          />
                          <span style={{ color: '#fff', fontWeight: isChecked ? 700 : 500 }}>{ev.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Group Events */}
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    Group Events (Team Squad Members)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.5rem' }}>
                    {groupEvents.map((ev) => {
                      const isChecked = assignedEventIds.includes(ev.id);
                      return (
                        <label
                          key={ev.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            padding: '0.5rem 0.75rem',
                            borderRadius: 'var(--radius-sm)',
                            background: isChecked ? 'rgba(59, 130, 246, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                            border: isChecked ? '1px solid rgba(59, 130, 246, 0.35)' : '1px solid var(--border-subtle)',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleEvent(ev.id)}
                            style={{ accentColor: '#3b82f6' }}
                          />
                          <span style={{ color: '#fff', fontWeight: isChecked ? 700 : 500 }}>{ev.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingParticipant ? 'Save Changes' : 'Create Participant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Participant"
        message={`Are you sure you want to permanently delete participant "${deleteTarget?.name}" (${deleteTarget?.participant_code})? Any assigned event registrations will be removed.`}
        confirmLabel="Delete"
        isDanger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
