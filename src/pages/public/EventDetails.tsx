import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { eventService } from '../../services/eventService';
import { FestEvent } from '../../types/database';
import { StatusBadge } from '../../components/StatusBadge';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  User,
  Trophy,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  FileText,
  Shield,
  Award,
} from 'lucide-react';

export const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<FestEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedTeams, setExpandedTeams] = useState<Record<string, boolean>>({});

  const loadEvent = async () => {
    if (!id) return;
    try {
      const data = await eventService.getEventById(id);
      setEvent(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvent();
    window.addEventListener('izhar_db_updated', loadEvent);
    return () => window.removeEventListener('izhar_db_updated', loadEvent);
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p>Loading event information...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2>Event Not Found</h2>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0 1.5rem' }}>The event you requested does not exist or has been removed.</p>
        <Link to="/events" className="btn btn-secondary btn-sm">
          <ArrowLeft size={14} /> Back to Events
        </Link>
      </div>
    );
  }

  const isGroup = event.event_type === 'group';
  const isPublished = event.result_status === 'published';

  const toggleTeam = (teamId: string) => {
    setExpandedTeams((prev) => ({
      ...prev,
      [teamId]: !prev[teamId],
    }));
  };

  return (
    <div className="container" style={{ padding: '3.5rem 1.5rem' }}>
      {/* Back button */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to="/events"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            color: 'var(--text-muted)',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          <ArrowLeft size={16} /> All Events
        </Link>
      </div>

      {/* Main Header Panel */}
      <div
        className="glass-panel"
        style={{
          padding: '2.5rem 2rem',
          marginBottom: '2.5rem',
          position: 'relative',
          overflow: 'hidden',
          borderLeft: '4px solid var(--gold)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
          <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {event.category?.name || 'General Category'}
          </span>
          <span style={{ color: 'var(--text-faint)' }}>•</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {isGroup ? <Users size={14} /> : <User size={14} />}
            {isGroup ? 'Group Squad Event' : 'Individual Competition'}
          </span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
            <StatusBadge status={event.status} />
            <StatusBadge resultStatus={event.result_status} />
          </div>
        </div>

        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 900, marginBottom: '1.25rem', color: '#fff' }}>
          {event.name}
        </h1>

        {/* Schedule & Venue Meta */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.5rem',
            fontSize: '0.925rem',
            color: 'var(--text-muted)',
            paddingTop: '1.25rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          {event.event_date && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Calendar size={16} color="var(--gold)" />
              <span>{event.event_date}</span>
            </div>
          )}

          {event.start_time && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Clock size={16} color="var(--gold)" />
              <span>
                {event.start_time.slice(0, 5)} {event.end_time ? `- ${event.end_time.slice(0, 5)}` : ''}
              </span>
            </div>
          )}

          {event.venue && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <MapPin size={16} color="var(--gold)" />
              <span>{event.venue}</span>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* Left Column: Rules & Details */}
        <div>
          {/* Rules & Guidelines */}
          <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--gold)' }}>
              <FileText size={18} />
              <h3 style={{ fontSize: '1.15rem', color: '#fff' }}>Event Description & Rules</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.925rem' }}>
              {event.description || 'Official guidelines and rules set by academy fest committee.'}
            </p>
          </div>

          {/* Scoring Rules Schema */}
          {event.scoring_rules && event.scoring_rules.length > 0 && (
            <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--gold)' }}>
                <Award size={18} />
                <h3 style={{ fontSize: '1.15rem', color: '#fff' }}>Official Scoring Allocation</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {event.scoring_rules.map((rule) => (
                  <div
                    key={rule.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>{rule.label}</span>
                    <span style={{ fontWeight: 800, color: 'var(--gold)', fontSize: '0.95rem' }}>{rule.points} PTS</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Competing Teams / Roster */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--gold)' }}>
              <Users size={18} />
              <h3 style={{ fontSize: '1.15rem', color: '#fff' }}>
                {isGroup ? 'Registered Squads & Roster' : 'Registered Participants'}
              </h3>
            </div>

            {isGroup ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {event.assigned_teams && event.assigned_teams.length > 0 ? (
                  event.assigned_teams.map((at) => (
                    <div
                      key={at.team_id}
                      style={{
                        padding: '0.85rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                        }}
                        onClick={() => toggleTeam(at.team_id)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <div
                            style={{
                              width: '12px',
                              height: '12px',
                              borderRadius: '3px',
                              background: at.team?.flag_color || '#fff',
                            }}
                          />
                          <span style={{ fontWeight: 800, color: '#fff', fontSize: '0.95rem' }}>
                            {at.team?.name}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>
                            ({at.members?.length || 0} members)
                          </span>
                        </div>
                        <button
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          {expandedTeams[at.team_id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>

                      {/* Expanded Members */}
                      {expandedTeams[at.team_id] && (
                        <div
                          style={{
                            marginTop: '0.85rem',
                            paddingTop: '0.65rem',
                            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '0.4rem',
                          }}
                        >
                          {at.members && at.members.length > 0 ? (
                            at.members.map((m) => (
                              <span
                                key={m.id}
                                style={{
                                  fontSize: '0.8rem',
                                  padding: '0.2rem 0.55rem',
                                  borderRadius: 'var(--radius-sm)',
                                  background: 'rgba(255, 255, 255, 0.06)',
                                  color: 'var(--text-muted)',
                                }}
                              >
                                {m.name} ({m.participant_code})
                              </span>
                            ))
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-faint)', fontStyle: 'italic' }}>
                              All team members eligible
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No team assignments configured yet.</p>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {event.assigned_participants && event.assigned_participants.length > 0 ? (
                  event.assigned_participants.map((p) => (
                    <div
                      key={p.id}
                      style={{
                        padding: '0.45rem 0.75rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.85rem',
                      }}
                    >
                      <span style={{ fontWeight: 700, color: '#fff' }}>{p.name}</span>{' '}
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        ({p.team?.name || 'Assigned'})
                      </span>
                    </div>
                  ))
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No individual participants assigned yet.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: OFFICIAL RESULTS */}
        <div>
          <div
            className="glass-panel"
            style={{
              padding: '2rem',
              border: isPublished ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid var(--border-subtle)',
              background: isPublished
                ? 'linear-gradient(180deg, rgba(26, 36, 60, 0.85) 0%, rgba(16, 23, 40, 0.95) 100%)'
                : 'var(--bg-card)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', color: 'var(--gold)' }}>
              <Trophy size={22} />
              <h2 style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 800 }}>Official Results</h2>
            </div>

            {isPublished && event.results && event.results.length > 0 ? (
              <div>
                <p style={{ fontSize: '0.85rem', color: '#34d399', marginBottom: '1.25rem', fontWeight: 600 }}>
                  ✓ Officially verified and contributing to Team Championship Standings.
                </p>

                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Position</th>
                        <th>{isGroup ? 'Team' : 'Participant & Team'}</th>
                        <th style={{ textAlign: 'right' }}>Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {event.results.map((res, index) => {
                        const is1st = index === 0;
                        return (
                          <tr key={res.id}>
                            <td>
                              <span
                                style={{
                                  fontWeight: 800,
                                  fontSize: '0.9rem',
                                  color: is1st ? 'var(--gold)' : '#fff',
                                }}
                              >
                                {res.result_label}
                              </span>
                            </td>

                            <td>
                              {isGroup ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <div
                                    style={{
                                      width: '10px',
                                      height: '10px',
                                      borderRadius: '2px',
                                      background: res.team?.flag_color || '#fff',
                                    }}
                                  />
                                  <span style={{ fontWeight: 700, color: '#fff' }}>{res.team?.name}</span>
                                </div>
                              ) : (
                                <div>
                                  <div style={{ fontWeight: 700, color: '#fff' }}>
                                    {res.participant?.name || 'Participant'}
                                  </div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    {res.team?.name} • {res.participant?.participant_code}
                                  </div>
                                </div>
                              )}
                            </td>

                            <td style={{ textAlign: 'right' }}>
                              <span
                                style={{
                                  fontFamily: 'var(--font-heading)',
                                  fontWeight: 900,
                                  fontSize: '1.15rem',
                                  color: is1st ? 'var(--gold)' : '#fff',
                                }}
                              >
                                +{res.points}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div
                  style={{
                    marginTop: '1.75rem',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  <p>
                    <strong>Note:</strong> Group event points are awarded once directly to the respective team tally and are never multiplied by participant headcount.
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                <Trophy size={36} color="var(--gold)" style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
                <h4 style={{ color: '#fff', marginBottom: '0.5rem', fontSize: '1.1rem' }}>Results Pending</h4>
                <p style={{ fontSize: '0.875rem', maxWidth: '320px', margin: '0 auto' }}>
                  Judges and fest administrators have not published official scores for this event yet. Check back soon!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
