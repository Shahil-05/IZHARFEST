import React, { useEffect, useState } from 'react';
import { eventService } from '../../services/eventService';
import { FestEvent, EventCategory, EventType, EventStatus } from '../../types/database';
import { EventCard } from '../../components/EventCard';
import { Search, Filter, Award, Sparkles } from 'lucide-react';

export const Events: React.FC = () => {
  const [events, setEvents] = useState<FestEvent[]>([]);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<EventType | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<EventStatus | 'all'>('all');

  const loadData = async () => {
    try {
      const [cats, evs] = await Promise.all([
        eventService.getCategories(),
        eventService.getEvents(),
      ]);
      setCategories(cats);
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

  const filteredEvents = events.filter((ev) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = ev.name.toLowerCase().includes(q);
      const matchVenue = ev.venue?.toLowerCase().includes(q);
      const matchDesc = ev.description?.toLowerCase().includes(q);
      if (!matchName && !matchVenue && !matchDesc) return false;
    }

    if (selectedType !== 'all' && ev.event_type !== selectedType) {
      return false;
    }

    if (selectedCategory !== 'all' && ev.category_id !== selectedCategory) {
      return false;
    }

    if (selectedStatus !== 'all' && ev.status !== selectedStatus) {
      return false;
    }

    return true;
  });

  return (
    <div className="container" style={{ padding: '3.5rem 1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--gold)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
          <Award size={16} /> Competition Schedule & Directory
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 900, marginBottom: '0.75rem' }}>
          Fest Competitions & Events
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '680px' }}>
          Browse all official competitions. Filter by category, participation format, and real-time event status.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div
        className="glass-panel"
        style={{
          padding: '1.5rem',
          marginBottom: '2.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          alignItems: 'end',
        }}
      >
        {/* Search */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Search Event / Venue</label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Speech, Qawali, Stage..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.25rem' }}
            />
            <Search
              size={16}
              style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }}
            />
          </div>
        </div>

        {/* Type Filter */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Format / Type</label>
          <select
            className="form-select"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
          >
            <option value="all">All Formats</option>
            <option value="individual">Individual</option>
            <option value="group">Group Squad</option>
          </select>
        </div>

        {/* Category Filter (Database Driven) */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Category</label>
          <select
            className="form-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Event Status</label>
          <select
            className="form-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
          >
            <option value="all">All Statuses</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Live Now</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.75rem',
          }}
        >
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
          <Sparkles size={40} color="var(--gold)" style={{ margin: '0 auto 1rem', opacity: 0.6 }} />
          <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '0.5rem' }}>No events match your filters</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Try resetting your filters or search keywords.
          </p>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setSearch('');
              setSelectedType('all');
              setSelectedCategory('all');
              setSelectedStatus('all');
            }}
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
};
