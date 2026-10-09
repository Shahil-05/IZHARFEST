import React from 'react';
import { Link } from 'react-router-dom';
import { Team } from '../types/database';
import { Trophy, Users, Shield, ArrowRight } from 'lucide-react';

interface TeamCardProps {
  team: Team;
  points?: number;
  rank?: number;
}

export const TeamCard: React.FC<TeamCardProps> = ({ team, points = 0, rank = 1 }) => {
  const isFirst = rank === 1;

  return (
    <div
      className="glass-panel glass-panel-hover"
      style={{
        padding: '1.75rem',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderTop: `4px solid ${team.flag_color || '#3b82f6'}`,
      }}
    >
      <div>
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '4px',
                  backgroundColor: team.flag_color || '#fff',
                  border: '2px solid rgba(255, 255, 255, 0.4)',
                  boxShadow: `0 0 10px ${team.flag_color}`,
                }}
              />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                Flag Color: {team.flag_color?.toUpperCase()}
              </span>
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff' }}>
              <Link to={`/teams/${team.id}`} style={{ color: 'inherit' }}>
                {team.name}
              </Link>
            </h3>
          </div>

          {/* Rank Badge */}
          <div
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-pill)',
              background: isFirst ? 'var(--gold-grad)' : 'rgba(255, 255, 255, 0.08)',
              color: isFirst ? '#0b0f17' : '#fff',
              fontWeight: 800,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <Trophy size={13} />
            <span>Rank #{rank}</span>
          </div>
        </div>

        {/* Current Points Bar */}
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Current Standing
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 900, color: 'var(--gold)' }}>
              {points}
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>PTS</span>
          </div>
        </div>

        {/* Leaders */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.45rem' }}>
            <Shield size={12} color="var(--gold)" />
            <span>Team Leaders</span>
          </div>
          {team.leaders && team.leaders.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {team.leaders.map((leader) => (
                <span
                  key={leader.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '0.25rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.825rem',
                    color: '#e2e8f0',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  {leader.name}
                </span>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: '0.825rem', color: 'var(--text-faint)', fontStyle: 'italic' }}>
              No leaders assigned
            </div>
          )}
        </div>
      </div>

      {/* Footer Info & Action */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '1rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
          <Users size={14} />
          <span>{team.member_count ?? 0} Registered Members</span>
        </div>

        <Link to={`/teams/${team.id}`} className="btn btn-outline btn-sm" style={{ gap: '0.35rem' }}>
          Breakdown <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
};
