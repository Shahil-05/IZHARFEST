import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { teamService } from '../../services/teamService';
import { leaderboardService, TeamPointsBreakdown } from '../../services/leaderboardService';
import { participantService } from '../../services/participantService';
import { Team, Participant } from '../../types/database';
import {
  ArrowLeft,
  Trophy,
  Shield,
  Users,
  Award,
  PlusCircle,
  MinusCircle,
  FileText,
  Eye,
  X,
  Sparkles,
} from 'lucide-react';

import { getTeamPoster } from '../../constants/assets';

export const TeamDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [team, setTeam] = useState<Team | null>(null);
  const [breakdown, setBreakdown] = useState<TeamPointsBreakdown | null>(null);
  const [members, setMembers] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [posterOpen, setPosterOpen] = useState(false);

  const loadData = async () => {
    if (!id) return;
    try {
      const [t, bd, mems] = await Promise.all([
        teamService.getTeamById(id),
        leaderboardService.getTeamBreakdown(id),
        participantService.getParticipants({ teamId: id }),
      ]);
      setTeam(t);
      setBreakdown(bd);
      setMembers(mems);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('izhar_db_updated', loadData);
    return () => window.removeEventListener('izhar_db_updated', loadData);
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p>Loading squad details...</p>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2>Team Not Found</h2>
        <Link to="/teams" className="btn btn-secondary btn-sm" style={{ marginTop: '1rem' }}>
          <ArrowLeft size={14} /> Back to Teams
        </Link>
      </div>
    );
  }

  const isFirst = breakdown?.rank === 1;
  const poster = team ? getTeamPoster(team.name) : null;

  return (
    <div className="container" style={{ padding: '3.5rem 1.5rem' }}>
      {/* Back button */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to="/teams"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            color: 'var(--text-muted)',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          <ArrowLeft size={16} /> All Teams
        </Link>
      </div>

      {/* Main Squad Hero Card */}
      <div
        className="glass-panel"
        style={{
          padding: '2.5rem 2rem',
          marginBottom: '2.5rem',
          borderTop: `6px solid ${team.flag_color || '#3b82f6'}`,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '2rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.45rem' }}>
            <div
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '4px',
                backgroundColor: team.flag_color || '#fff',
                border: '2px solid rgba(255, 255, 255, 0.4)',
                boxShadow: `0 0 10px ${team.flag_color}`,
              }}
            />
            <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
              Official Flag: {team.flag_color?.toUpperCase()}
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(2.25rem, 5vw, 3rem)', fontWeight: 900, color: '#fff', marginBottom: '0.75rem' }}>
            {team.name}
          </h1>

          {/* Leaders */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-faint)', fontWeight: 700, textTransform: 'uppercase' }}>
              <Shield size={13} style={{ display: 'inline', marginRight: '4px' }} /> Leaders:
            </span>
            {team.leaders && team.leaders.length > 0 ? (
              team.leaders.map((l) => (
                <span
                  key={l.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    padding: '0.2rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                    color: '#fff',
                    fontWeight: 600,
                  }}
                >
                  {l.name}
                </span>
              ))
            ) : (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                None assigned
              </span>
            )}
          </div>
        </div>

        {/* Total Points Standings Badge */}
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.35)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem 2rem',
            textAlign: 'center',
            minWidth: '200px',
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.06em', marginBottom: '0.35rem' }}>
            Championship Rank #{breakdown?.rank || 1}
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '3rem', fontWeight: 900, color: isFirst ? 'var(--gold)' : '#fff', lineHeight: 1 }}>
            {breakdown?.totalPoints ?? 0}
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            TOTAL POINTS
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* Left Column: Event Points Breakdown */}
        <div>
          <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', color: 'var(--gold)' }}>
              <Award size={20} />
              <h3 style={{ fontSize: '1.3rem', color: '#fff', fontWeight: 800 }}>Event-by-Event Points</h3>
            </div>

            {breakdown && breakdown.eventResults.length > 0 ? (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Event & Category</th>
                      <th>Placement</th>
                      <th style={{ textAlign: 'right' }}>Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {breakdown.eventResults.map((er, idx) => (
                      <tr key={idx}>
                        <td>
                          <div style={{ fontWeight: 700, color: '#fff' }}>{er.eventName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {er.categoryName || 'General'}
                            {er.participantName ? ` • ${er.participantName}` : ' • Group Squad'}
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-published" style={{ fontSize: '0.75rem' }}>
                            {er.resultLabel}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span style={{ fontWeight: 800, color: 'var(--gold)', fontSize: '1.05rem' }}>
                            +{er.points}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No published event points awarded to this team yet.
              </p>
            )}
          </div>

          {/* Point Adjustments (Bonuses & Penalties) */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', color: 'var(--gold)' }}>
              <Trophy size={20} />
              <h3 style={{ fontSize: '1.3rem', color: '#fff', fontWeight: 800 }}>Bonuses & Penalties</h3>
            </div>

            {breakdown && breakdown.adjustments.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {breakdown.adjustments.map((adj) => {
                  const isBonus = adj.adjustment_type === 'bonus';
                  return (
                    <div
                      key={adj.id}
                      style={{
                        padding: '0.85rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        background: isBonus ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                        border: isBonus ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(239, 68, 68, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {isBonus ? (
                          <PlusCircle size={20} color="#10b981" />
                        ) : (
                          <MinusCircle size={20} color="#ef4444" />
                        )}
                        <div>
                          <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>
                            {adj.reason}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Type: {isBonus ? 'Discipline / Cultural Bonus' : 'Official Committee Penalty'}
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          fontWeight: 900,
                          fontSize: '1.15rem',
                          color: isBonus ? '#34d399' : '#f87171',
                          fontFamily: 'var(--font-heading)',
                        }}
                      >
                        {isBonus ? `+${adj.points}` : `-${adj.points}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No bonuses or penalties applied to this team.
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Poster Card & Registered Members Roster */}
        <div>
          {poster && (
            <div
              className="glass-panel"
              style={{
                padding: '1.5rem',
                marginBottom: '1.5rem',
                border: `1.5px solid ${poster.color}40`,
                background: 'rgba(10, 15, 29, 0.7)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--gold)', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase' }}>
                  <Sparkles size={15} /> Official Flag Launch Poster
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{poster.flagName}</span>
              </div>

              <div
                onClick={() => setPosterOpen(true)}
                style={{
                  position: 'relative',
                  cursor: 'pointer',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: '#070b14',
                }}
                className="hover-card"
              >
                <img
                  src={poster.src}
                  alt={poster.alt}
                  style={{
                    width: '100%',
                    maxHeight: '340px',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: '10px',
                    right: '10px',
                    background: 'rgba(8, 12, 22, 0.85)',
                    backdropFilter: 'blur(6px)',
                    color: '#fff',
                    padding: '0.3rem 0.65rem',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                >
                  <Eye size={13} /> Click to expand
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Leaders: <strong style={{ color: '#fff' }}>{poster.leaders}</strong>
              </div>
            </div>
          )}

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gold)' }}>
                <Users size={20} />
                <h3 style={{ fontSize: '1.3rem', color: '#fff', fontWeight: 800 }}>Squad Members ({members.length})</h3>
              </div>
            </div>

            {members.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {members.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.925rem' }}>{m.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        ID: {m.participant_code} • {m.class_batch}
                      </div>
                    </div>

                    {team.leaders?.some((l) => l.id === m.id) && (
                      <span className="badge badge-published" style={{ fontSize: '0.65rem' }}>
                        Leader
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No participants currently assigned to this team.</p>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {posterOpen && poster && (
        <div
          onClick={() => setPosterOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(4, 7, 15, 0.95)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '720px',
              width: '100%',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: '#0a0f1d',
              borderRadius: '16px',
              border: `2px solid ${poster.color}88`,
              boxShadow: `0 25px 60px rgba(0, 0, 0, 0.9)`,
              overflow: 'hidden',
              padding: '1.25rem',
            }}
          >
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontWeight: 800, color: '#fff', fontSize: '1.1rem' }}>{poster.alt}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Leaders: {poster.leaders}</div>
              </div>
              <button
                type="button"
                onClick={() => setPosterOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '34px',
                  height: '34px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>
            <img
              src={poster.src}
              alt={poster.alt}
              style={{
                maxWidth: '100%',
                maxHeight: '75vh',
                objectFit: 'contain',
                borderRadius: '8px',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
