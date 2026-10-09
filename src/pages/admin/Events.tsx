import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { eventService } from '../../services/eventService';
import { scoringService } from '../../services/scoringService';
import { FestEvent, EventCategory, ScoringTemplate, EventType, EventStatus, ResultStatus } from '../../types/database';
import { StatusBadge } from '../../components/StatusBadge';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import {
  Award,
  PlusCircle,
  Search,
  Edit2,
  Trash2,
  Eye,
  Plus,
  X,
  AlertCircle,
  Clock,
  Calendar,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

export const Events: React.FC = () => {
  const [events, setEvents] = useState<FestEvent[]>([]);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [templates, setTemplates] = useState<ScoringTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<EventType | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<EventStatus | 'all'>('all');
  const [selectedResultStatus, setSelectedResultStatus] = useState<ResultStatus | 'all'>('all');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<FestEvent | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [eventType, setEventType] = useState<EventType>('individual');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [venue, setVenue] = useState('');
  const [status, setStatus] = useState<EventStatus>('upcoming');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [scoringRules, setScoringRules] = useState<{ id?: string; label: string; points: number; sort_order: number }[]>([]);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<FestEvent | null>(null);

  const loadData = async () => {
    try {
      const [allEvents, allCats, allTpls] = await Promise.all([
        eventService.getEvents(),
        eventService.getCategories(),
        scoringService.getTemplates(),
      ]);
      setEvents(allEvents);
      setCategories(allCats);
      setTemplates(allTpls);
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
    setEditingEvent(null);
    setName('');
    setEventType('individual');
    setCategoryId(categories[0]?.id || '');
    setDescription('');
    setEventDate(new Date().toISOString().split('T')[0]);
    setStartTime('09:30');
    setEndTime('11:00');
    setVenue('Auditorium Stage');
    setStatus('upcoming');
    setSelectedTemplateId('');

    // Pre-populate with default template rules if available
    const defaultTpl = templates.find((t) => t.event_type === 'individual' || t.event_type === 'all') || templates[0];
    if (defaultTpl?.rules && defaultTpl.rules.length > 0) {
      setSelectedTemplateId(defaultTpl.id);
      setScoringRules(
        defaultTpl.rules.map((r, i) => ({
          label: r.label,
          points: r.points,
          sort_order: i + 1,
        }))
      );
    } else {
      setScoringRules([
        { label: '1st Position', points: 20, sort_order: 1 },
        { label: '2nd Position', points: 15, sort_order: 2 },
        { label: '3rd Position', points: 10, sort_order: 3 },
      ]);
    }

    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (ev: FestEvent) => {
    setEditingEvent(ev);
    setName(ev.name);
    setEventType(ev.event_type);
    setCategoryId(ev.category_id || '');
    setDescription(ev.description || '');
    setEventDate(ev.event_date || '');
    setStartTime(ev.start_time?.slice(0, 5) || '');
    setEndTime(ev.end_time?.slice(0, 5) || '');
    setVenue(ev.venue || '');
    setStatus(ev.status);
    setSelectedTemplateId('');

    // Use current event's scoring rules
    const rules = ev.scoring_rules?.map((r, i) => ({
      id: r.id,
      label: r.label,
      points: r.points,
      sort_order: r.sort_order ?? i + 1,
    })) || [];
    setScoringRules(rules);

    setFormError('');
    setModalOpen(true);
  };

  const handleApplyTemplate = (tplId: string) => {
    setSelectedTemplateId(tplId);
    const chosen = templates.find((t) => t.id === tplId);
    if (chosen?.rules && chosen.rules.length > 0) {
      setScoringRules(
        chosen.rules.map((r, i) => ({
          label: r.label,
          points: r.points,
          sort_order: i + 1,
        }))
      );
    }
  };

  const addCustomRule = () => {
    setScoringRules((prev) => [
      ...prev,
      { label: `Position ${prev.length + 1}`, points: 5, sort_order: prev.length + 1 },
    ]);
  };

  const updateRule = (idx: number, field: 'label' | 'points', val: any) => {
    setScoringRules((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: field === 'points' ? Number(val) : val };
      return copy;
    });
  };

  const removeRule = (idx: number) => {
    setScoringRules((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      if (editingEvent) {
        await eventService.updateEvent(
          editingEvent.id,
          {
            name,
            event_type: eventType,
            category_id: categoryId || null,
            description,
            event_date: eventDate || undefined,
            start_time: startTime || undefined,
            end_time: endTime || undefined,
            venue,
            status,
          },
          scoringRules
        );
      } else {
        await eventService.createEvent({
          name,
          event_type: eventType,
          category_id: categoryId || undefined,
          description,
          event_date: eventDate || undefined,
          start_time: startTime || undefined,
          end_time: endTime || undefined,
          venue,
          scoring_rules: scoringRules,
        });
      }
      setModalOpen(false);
      await loadData();
    } catch (err: any) {
      setFormError(err.message || 'Error saving event.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await eventService.deleteEvent(deleteTarget.id);
      setDeleteTarget(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Error deleting event');
    }
  };

  const filteredEvents = events.filter((ev) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!ev.name.toLowerCase().includes(q) && !ev.venue?.toLowerCase().includes(q)) return false;
    }
    if (selectedType !== 'all' && ev.event_type !== selectedType) return false;
    if (selectedCategory !== 'all' && ev.category_id !== selectedCategory) return false;
    if (selectedStatus !== 'all' && ev.status !== selectedStatus) return false;
    if (selectedResultStatus !== 'all' && ev.result_status !== selectedResultStatus) return false;
    return true;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#fff' }}>Events & Competitions</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Create events, copy scoring templates into custom event rules, and schedule venues.
          </p>
        </div>

        <button className="btn btn-primary" onClick={openAddModal} style={{ gap: '0.45rem' }}>
          <PlusCircle size={16} /> Create Competition Event
        </button>
      </div>

      {/* Filter Toolbar */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem',
          marginBottom: '2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          alignItems: 'end',
        }}
      >
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Search Event / Venue</label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Debate, Stage..."
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
          <label className="form-label">Format</label>
          <select className="form-select" value={selectedType} onChange={(e) => setSelectedType(e.target.value as any)}>
            <option value="all">All Formats</option>
            <option value="individual">Individual</option>
            <option value="group">Group Squad</option>
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Category</label>
          <select className="form-select" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Event Status</label>
          <select className="form-select" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value as any)}>
            <option value="all">All Statuses</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Live Now</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Result Status</label>
          <select className="form-select" value={selectedResultStatus} onChange={(e) => setSelectedResultStatus(e.target.value as any)}>
            <option value="all">All Results</option>
            <option value="not_entered">Results Pending</option>
            <option value="draft">Draft Saved</option>
            <option value="published">Official Published</option>
          </select>
        </div>
      </div>

      {/* Events Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Category & Type</th>
                <th>Schedule & Venue</th>
                <th>Event Status</th>
                <th>Results Status</th>
                <th style={{ textAlign: 'right', width: '130px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length > 0 ? (
                filteredEvents.map((ev) => (
                  <tr key={ev.id}>
                    <td>
                      <div style={{ fontWeight: 800, color: '#fff', fontSize: '0.95rem' }}>{ev.name}</div>
                      {ev.description && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {ev.description}
                        </div>
                      )}
                    </td>

                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--gold)', fontSize: '0.85rem' }}>
                        {ev.category?.name || 'General'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {ev.event_type === 'individual' ? 'Individual' : 'Group Squad'}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontSize: '0.85rem', color: '#fff' }}>{ev.event_date || 'Date TBA'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {ev.start_time?.slice(0, 5) || ''} • {ev.venue || 'Venue TBA'}
                      </div>
                    </td>

                    <td>
                      <StatusBadge status={ev.status} />
                    </td>

                    <td>
                      <StatusBadge resultStatus={ev.result_status} />
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <Link
                          to={`/events/${ev.id}`}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '4px 8px' }}
                          title="View Public Page"
                          target="_blank"
                        >
                          <Eye size={13} />
                        </Link>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px' }}
                          onClick={() => openEditModal(ev)}
                          title="Edit Event"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          style={{ padding: '4px 8px' }}
                          onClick={() => setDeleteTarget(ev)}
                          title="Delete Event"
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
                    No events found matching your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Event Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: '680px', padding: '2rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.3rem', color: '#fff', fontWeight: 800 }}>
                {editingEvent ? 'Edit Competition Event' : 'Create New Competition Event'}
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
                <label className="form-label">Event Name *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Malayalam Speech, Traditional Qawali..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Event Format *</label>
                  <select
                    className="form-select"
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as EventType)}
                  >
                    <option value="individual">Individual</option>
                    <option value="group">Group Squad</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    className="form-select"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description & Rules</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="Rules, time limits, judging criteria..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
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

                {editingEvent && (
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as EventStatus)}
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="ongoing">Live Now</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Venue</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Auditorium Stage 1, Open Air Theatre..."
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                />
              </div>

              {/* Scoring Rules Section */}
              <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <div>
                    <label className="form-label" style={{ marginBottom: '0.2rem' }}>Event-Specific Scoring Rules</label>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>
                      Rules are independent for this event. Future changes to templates will not alter this event.
                    </p>
                  </div>

                  {/* Template Picker */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <select
                      className="form-select btn-sm"
                      style={{ width: 'auto', fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
                      value={selectedTemplateId}
                      onChange={(e) => handleApplyTemplate(e.target.value)}
                    >
                      <option value="">Copy From Template...</option>
                      {templates.map((tpl) => (
                        <option key={tpl.id} value={tpl.id}>
                          {tpl.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Rules List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.85rem' }}>
                  {scoringRules.map((rule, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Rule label (e.g. 1st Position, A Grade)"
                        value={rule.label}
                        onChange={(e) => updateRule(idx, 'label', e.target.value)}
                        style={{ flex: 2 }}
                      />
                      <input
                        type="number"
                        className="form-input"
                        placeholder="Points"
                        value={rule.points}
                        onChange={(e) => updateRule(idx, 'points', e.target.value)}
                        style={{ width: '90px' }}
                      />
                      <button
                        type="button"
                        onClick={() => removeRule(idx)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: 'none',
                          color: '#f87171',
                          borderRadius: '6px',
                          padding: '6px',
                          cursor: 'pointer',
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={addCustomRule}
                  style={{ gap: '0.35rem' }}
                >
                  <Plus size={13} /> Add Custom Position Rule
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingEvent ? 'Save Changes' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Competition Event"
        message={`Are you sure you want to permanently delete "${deleteTarget?.name}"? All assigned participants and entered results for this event will also be removed.`}
        confirmLabel="Delete Event"
        isDanger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
