import React from 'react';
import { Link } from 'react-router-dom';
import { FestEvent } from '../types/database';
import { StatusBadge } from './StatusBadge';
import { Calendar, Clock, MapPin, Users, User, Trophy, ArrowRight } from 'lucide-react';

interface EventCardProps {
  event: FestEvent;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const isCompleted = event.status === 'completed';
  const hasPublishedResults = event.result_status === 'published';

  return (
    <div
      className="glass-panel glass-panel-hover"
      style={{
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top category & badges */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
            marginBottom: '0.85rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--gold)',
              }}
            >
              {event.category?.name || 'General Category'}
            </span>
            <span style={{ color: 'var(--text-faint)' }}>•</span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                fontWeight: 600,
              }}
            >
              {event.event_type === 'individual' ? <User size={12} /> : <Users size={12} />}
              {event.event_type === 'individual' ? 'Individual' : 'Group Squad'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            {hasPublishedResults ? (
              <StatusBadge resultStatus="published" />
            ) : (
              <StatusBadge status={event.status} />
            )}
          </div>
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            marginBottom: '0.65rem',
            color: '#fff',
            lineHeight: 1.3,
          }}
        >
          <Link to={`/events/${event.id}`} style={{ color: 'inherit' }}>
            {event.name}
          </Link>
        </h3>

        {/* Description snippet */}
        {event.description && (
          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.875rem',
              lineHeight: 1.5,
              marginBottom: '1.25rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {event.description}
          </p>
        )}
      </div>

      {/* Meta info & Bottom Action */}
      <div>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            paddingTop: '0.85rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            marginBottom: '1.1rem',
          }}
        >
          {event.event_date && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Calendar size={13} color="var(--gold)" />
              <span>{event.event_date}</span>
            </div>
          )}

          {event.start_time && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Clock size={13} color="var(--gold)" />
              <span>{event.start_time.slice(0, 5)} {event.end_time ? `- ${event.end_time.slice(0, 5)}` : ''}</span>
            </div>
          )}

          {event.venue && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <MapPin size={13} color="var(--gold)" />
              <span>{event.venue}</span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {hasPublishedResults ? (
            <Link
              to={`/events/${event.id}`}
              className="btn btn-primary btn-sm"
              style={{ width: '100%', gap: '0.45rem' }}
            >
              <Trophy size={14} /> View Official Results
            </Link>
          ) : (
            <Link
              to={`/events/${event.id}`}
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', gap: '0.45rem' }}
            >
              Event Details <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
