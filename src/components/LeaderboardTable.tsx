import React from 'react';
import { Link } from 'react-router-dom';
import { LeaderboardItem } from '../types/database';
import { Trophy, Medal, ChevronRight } from 'lucide-react';

interface LeaderboardTableProps {
  items: LeaderboardItem[];
  compact?: boolean;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ items, compact = false }) => {
  if (items.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <Trophy size={36} color="var(--gold)" style={{ margin: '0 auto 1rem', opacity: 0.7 }} />
        <p>No team standings available yet. Once events are published, rankings appear here.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ overflow: 'hidden' }}>
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '80px', textAlign: 'center' }}>Rank</th>
              <th>Team</th>
              {!compact && <th style={{ textAlign: 'right' }}>Event Pts</th>}
              {!compact && <th style={{ textAlign: 'right' }}>Adjustments</th>}
              <th style={{ textAlign: 'right', width: '130px' }}>Total Points</th>
              <th style={{ width: '50px' }}></th>
            </tr>
          </thead>
          <tbody>
            {items.map((team, idx) => {
              const isFirst = team.rank === 1;
              const isSecond = team.rank === 2;
              const isThird = team.rank === 3;

              return (
                <tr
                  key={team.team_id}
                  style={{
                    background:
                      isFirst
                        ? 'linear-gradient(90deg, rgba(245, 158, 11, 0.12) 0%, rgba(245, 158, 11, 0.02) 100%)'
                        : undefined,
                  }}
                >
                  {/* Rank */}
                  <td style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        fontWeight: 800,
                        fontSize: '0.95rem',
                        background: isFirst
                          ? 'var(--gold-grad)'
                          : isSecond
                          ? 'linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%)'
                          : isThird
                          ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'
                          : 'rgba(255, 255, 255, 0.05)',
                        color: isFirst || isSecond || isThird ? '#090d16' : 'var(--text-muted)',
                        boxShadow: isFirst ? '0 0 15px rgba(245, 158, 11, 0.5)' : undefined,
                      }}
                    >
                      {team.rank}
                    </div>
                  </td>

                  {/* Team */}
                  <td>
                    <Link
                      to={`/teams/${team.team_id}`}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}
                    >
                      <div
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '4px',
                          backgroundColor: team.flag_color || '#fff',
                          border: '2px solid rgba(255, 255, 255, 0.4)',
                          boxShadow: `0 0 8px ${team.flag_color}`,
                          flexShrink: 0,
                        }}
                      />
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff', letterSpacing: '0.01em' }}>
                          {team.team_name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Flag: {team.flag_color?.toUpperCase()}
                        </div>
                      </div>
                    </Link>
                  </td>

                  {/* Event Points */}
                  {!compact && (
                    <td style={{ textAlign: 'right', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {team.event_points} pts
                    </td>
                  )}

                  {/* Adjustments */}
                  {!compact && (
                    <td
                      style={{
                        textAlign: 'right',
                        fontWeight: 600,
                        color:
                          team.adjustment_points > 0
                            ? '#34d399'
                            : team.adjustment_points < 0
                            ? '#f87171'
                            : 'var(--text-faint)',
                      }}
                    >
                      {team.adjustment_points > 0
                        ? `+${team.adjustment_points}`
                        : team.adjustment_points < 0
                        ? `${team.adjustment_points}`
                        : '0'}
                    </td>
                  )}

                  {/* Total Points */}
                  <td style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'baseline',
                        gap: '0.2rem',
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 900,
                        fontSize: isFirst ? '1.4rem' : '1.2rem',
                        color: isFirst ? 'var(--gold)' : '#fff',
                      }}
                    >
                      <span>{team.total_points}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>PTS</span>
                    </div>
                  </td>

                  {/* Action */}
                  <td style={{ textAlign: 'right' }}>
                    <Link
                      to={`/teams/${team.team_id}`}
                      style={{ color: 'var(--text-faint)', display: 'inline-flex', alignItems: 'center' }}
                      title="View Team Breakdown"
                    >
                      <ChevronRight size={18} />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
