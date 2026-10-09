import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { leaderboardService } from '../../services/leaderboardService';
import { eventService } from '../../services/eventService';
import { LeaderboardItem, FestEvent } from '../../types/database';
import { LeaderboardTable } from '../../components/LeaderboardTable';
import { Trophy, Search, Award, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

export const Results: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [events, setEvents] = useState<FestEvent[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [lb, allEvents] = await Promise.all([
        leaderboardService.getLeaderboard(),
        eventService.getEvents(),
      ]);
      setLeaderboard(lb);
      // Strictly ONLY published events
      const published = allEvents.filter((e) => e.result_status === 'published');
      setEvents(published);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('izhar_db_updated', loadData);
    return () => window.removeEventListener('izhar_db_updated', loadData);
  }, []);

  const filteredEvents = events.filter((e) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return e.name.toLowerCase().includes(q) || e.category?.name?.toLowerCase().includes(q);
  });

  return (
    <div className="container" style={{ padding: '3.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '4rem' }}>
      {/* 1. Header & Official Championship Leaderboard */}
      <section>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--gold)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
            <Trophy size={16} /> Official Standing
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 900, marginBottom: '0.75rem' }}>
            Results & Championship Leaderboard
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '680px' }}>
            Live cumulative standings calculated strictly from published event results and validated team adjustments.
          </p>
        </div>

        <LeaderboardTable items={leaderboard} />
      </section>

      {/* 2. Published Event Results Feed */}
      <section>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: '1.75rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
              <CheckCircle2 size={16} /> Official Verified Logs
            </div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#fff' }}>
              Published Event Results ({events.length})
            </h2>
          </div>

          <div style={{ width: '100%', maxWidth: '300px' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search published event results..."
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
        </div>

        {filteredEvents.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="glass-panel"
                style={{
                  padding: '1.75rem',
                  borderLeft: '4px solid #10b981',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gold)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {event.category?.name || 'General Category'} • {event.event_type === 'group' ? 'Group Event' : 'Individual'}
                    </div>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>
                      {event.name}
                    </h3>
                  </div>

                  <Link to={`/events/${event.id}`} className="btn btn-secondary btn-sm" style={{ gap: '0.4rem' }}>
                    View Full Event <ArrowRight size={13} />
                  </Link>
                </div>

                {/* Score table preview */}
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th style={{ width: '140px' }}>Rank / Position</th>
                        <th>{event.event_type === 'group' ? 'Winning Team' : 'Participant & Team'}</th>
                        <th style={{ textAlign: 'right', width: '120px' }}>Points Added</th>
                      </tr>
                    </thead>
                    <tbody>
                      {event.results?.map((res, i) => (
                        <tr key={res.id}>
                          <td>
                            <span style={{ fontWeight: 800, color: i === 0 ? 'var(--gold)' : '#fff' }}>
                              {res.result_label}
                            </span>
                          </td>

                          <td>
                            {event.event_type === 'group' ? (
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
                                <span style={{ fontWeight: 700, color: '#fff' }}>{res.participant?.name}</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                                  ({res.team?.name})
                                </span>
                              </div>
                            )}
                          </td>

                          <td style={{ textAlign: 'right' }}>
                            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, color: 'var(--gold)' }}>
                              +{res.points}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Award size={36} color="var(--gold)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>No Published Results Yet</h3>
            <p style={{ maxWidth: '400px', margin: '0 auto' }}>
              Results are published here once official juries conclude scoring and publish the final verdicts.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};
