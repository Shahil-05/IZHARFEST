import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { scheduleService } from '../../services/scheduleService';
import { ProgramScheduleItem } from '../../types/database';
import { Calendar, Clock, MapPin, Award, ArrowRight } from 'lucide-react';

export const Schedule: React.FC = () => {
  const [schedule, setSchedule] = useState<ProgramScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('all');

  const loadSchedule = async () => {
    try {
      const data = await scheduleService.getSchedule();
      setSchedule(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedule();
    window.addEventListener('izhar_db_updated', loadSchedule);
    return () => window.removeEventListener('izhar_db_updated', loadSchedule);
  }, []);

  const dates = Array.from(new Set(schedule.map((s) => s.schedule_date))).sort();

  const filteredSchedule = schedule.filter((item) => {
    if (selectedDate !== 'all' && item.schedule_date !== selectedDate) {
      return false;
    }
    return true;
  });

  return (
    <div className="container" style={{ padding: '3.5rem 1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--gold)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
          <Calendar size={16} /> Official Timeline
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 900, marginBottom: '0.75rem' }}>
          Program Schedule
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '680px' }}>
          Chronological program timeline spanning ceremonies, stage presentations, and competition slots.
        </p>
      </div>

      {/* Date Filter Tabs */}
      {dates.length > 1 && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <button
            className={`btn btn-sm ${selectedDate === 'all' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setSelectedDate('all')}
          >
            All Dates ({schedule.length})
          </button>
          {dates.map((d) => (
            <button
              key={d}
              className={`btn btn-sm ${selectedDate === d ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setSelectedDate(d)}
            >
              {d}
            </button>
          ))}
        </div>
      )}

      {/* Timeline List */}
      {filteredSchedule.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredSchedule.map((item, index) => {
            const hasEventLink = Boolean(item.event_id);

            return (
              <div
                key={item.id}
                className="glass-panel glass-panel-hover"
                style={{
                  padding: '1.5rem 1.75rem',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '1.25rem',
                  alignItems: 'center',
                  borderLeft: hasEventLink ? '4px solid var(--gold)' : '4px solid #64748b',
                }}
              >
                {/* Time & Date */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--gold)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                    <Calendar size={13} />
                    <span>{item.schedule_date}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
                    <Clock size={16} color="var(--gold)" />
                    <span>
                      {item.start_time?.slice(0, 5) || 'TBA'}
                      {item.end_time ? ` – ${item.end_time.slice(0, 5)}` : ''}
                    </span>
                  </div>
                </div>

                {/* Title & Description */}
                <div style={{ gridColumn: 'span 2' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>{item.title}</h3>
                    {hasEventLink && (
                      <span className="badge badge-ongoing" style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem' }}>
                        Competition
                      </span>
                    )}
                  </div>

                  {item.description && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: '1.5', marginBottom: '0.5rem' }}>
                      {item.description}
                    </p>
                  )}

                  {item.venue && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-faint)' }}>
                      <MapPin size={13} color="var(--gold)" />
                      <span>{item.venue}</span>
                    </div>
                  )}
                </div>

                {/* Event link button if applicable */}
                <div style={{ textAlign: 'right' }}>
                  {hasEventLink ? (
                    <Link to={`/events/${item.event_id}`} className="btn btn-secondary btn-sm" style={{ gap: '0.4rem' }}>
                      <Award size={13} /> Event Details <ArrowRight size={13} />
                    </Link>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-faint)', fontStyle: 'italic' }}>
                      General Program
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Calendar size={36} color="var(--gold)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <p>No schedule items recorded for the selected timeline.</p>
        </div>
      )}
    </div>
  );
};
