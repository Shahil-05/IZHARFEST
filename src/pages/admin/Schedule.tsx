import React, { useEffect, useState } from 'react';
import { scheduleService } from '../../services/scheduleService';
import { eventService } from '../../services/eventService';
import { ProgramScheduleItem, FestEvent } from '../../types/database';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import {
  Calendar,
  Clock,
  MapPin,
  PlusCircle,
  Edit2,
  Trash2,
  X,
  Award,
  AlertCircle,
} from 'lucide-react';

export const Schedule: React.FC = () => {
  const [schedule, setSchedule] = useState<ProgramScheduleItem[]>([]);
  const [events, setEvents] = useState<FestEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProgramScheduleItem | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [venue, setVenue] = useState('');
  const [eventId, setEventId] = useState<string>('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<ProgramScheduleItem | null>(null);

  const loadData = async () => {
    try {
      const [sch, evs] = await Promise.all([
        scheduleService.getSchedule(),
        eventService.getEvents(),
      ]);
      setSchedule(sch);
      setEvents(evs);
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
    setEditingItem(null);
    setTitle('');
    setDescription('');
    setScheduleDate(new Date().toISOString().split('T')[0]);
    setStartTime('09:00');
    setEndTime('10:00');
    setVenue('Main Ground');
    setEventId('');
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (item: ProgramScheduleItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setDescription(item.description || '');
    setScheduleDate(item.schedule_date);
    setStartTime(item.start_time?.slice(0, 5) || '');
    setEndTime(item.end_time?.slice(0, 5) || '');
    setVenue(item.venue || '');
    setEventId(item.event_id || '');
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      if (editingItem) {
        await scheduleService.updateScheduleItem(editingItem.id, {
          title,
          description,
          schedule_date: scheduleDate,
          start_time: startTime || undefined,
          end_time: endTime || undefined,
          venue,
          event_id: eventId || null,
        });
      } else {
        await scheduleService.createScheduleItem({
          title,
          description,
          schedule_date: scheduleDate,
          start_time: startTime || undefined,
          end_time: endTime || undefined,
          venue,
          event_id: eventId || null,
        });
      }
      setModalOpen(false);
      await loadData();
    } catch (err: any) {
      setFormError(err.message || 'Error saving schedule item.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await scheduleService.deleteScheduleItem(deleteTarget.id);
      setDeleteTarget(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Error deleting item');
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#fff' }}>Program Schedule Manager</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Plan the timeline for competition sessions, inaugural ceremonies, prayers, and valedictory events.
          </p>
        </div>

        <button className="btn btn-primary" onClick={openAddModal} style={{ gap: '0.45rem' }}>
          <PlusCircle size={16} /> Add Program Item
        </button>
      </div>

      {/* Schedule Items Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '130px' }}>Date</th>
                <th style={{ width: '130px' }}>Time</th>
                <th>Title & Program Description</th>
                <th>Associated Event</th>
                <th>Venue</th>
                <th style={{ textAlign: 'right', width: '110px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {schedule.length > 0 ? (
                schedule.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--gold)', fontSize: '0.85rem' }}>
                        {item.schedule_date}
                      </span>
                    </td>

                    <td>
                      <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.875rem' }}>
                        {item.start_time?.slice(0, 5) || 'TBA'}
                        {item.end_time ? ` – ${item.end_time.slice(0, 5)}` : ''}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>
                        {item.title}
                      </div>
                      {item.description && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {item.description}
                        </div>
                      )}
                    </td>

                    <td>
                      {item.event ? (
                        <span className="badge badge-ongoing" style={{ fontSize: '0.75rem' }}>
                          <Award size={12} /> {item.event.name}
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-faint)', fontStyle: 'italic' }}>
                          Ceremony / General
                        </span>
                      )}
                    </td>

                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {item.venue || 'Campus Venue'}
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px' }}
                          onClick={() => openEditModal(item)}
                          title="Edit Schedule Item"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          style={{ padding: '4px 8px' }}
                          onClick={() => setDeleteTarget(item)}
                          title="Delete Item"
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
                    No schedule items recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add/Edit Item */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: '580px', padding: '2rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 800 }}>
                {editingItem ? 'Edit Program Item' : 'New Schedule Program Item'}
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

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Inauguration, Lunch Break, Prize Distribution"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input
                    type="date"
                    required
                    className="form-input"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Start Time</label>
                  <input
                    type="time"
                    className="form-input"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">End Time</label>
                  <input
                    type="time"
                    className="form-input"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Link to Competition Event (Optional)</label>
                <select
                  className="form-select"
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                >
                  <option value="">None (Ceremony / General Break)</option>
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.name} ({ev.event_type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Venue</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Main Auditorium, Seminary Quadrangle"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="Short outline of the session..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Schedule Item"
        message={`Are you sure you want to delete "${deleteTarget?.title}" from the program timeline?`}
        confirmLabel="Delete Item"
        isDanger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
