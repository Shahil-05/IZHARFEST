import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { festService } from '../../services/festService';
import { leaderboardService } from '../../services/leaderboardService';
import { eventService } from '../../services/eventService';
import { FestSettings, LeaderboardItem, FestEvent } from '../../types/database';
import { LeaderboardTable } from '../../components/LeaderboardTable';
import { EventCard } from '../../components/EventCard';
import { Trophy, Award, Calendar, ArrowRight, Sparkles, CheckCircle2, Eye, X, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

import { ASSETS, FEST_POSTERS } from '../../constants/assets';

export const Home: React.FC = () => {
  const [settings, setSettings] = useState<FestSettings | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<FestEvent[]>([]);
  const [recentCompleted, setRecentCompleted] = useState<FestEvent[]>([]);
  const [posterModalOpen, setPosterModalOpen] = useState(false);
  const [activePosterIndex, setActivePosterIndex] = useState(0);

  const loadData = async () => {
    try {
      const [sets, lb, events] = await Promise.all([
        festService.getSettings(),
        leaderboardService.getLeaderboard(),
        eventService.getEvents(),
      ]);
      setSettings(sets);
      setLeaderboard(lb);

      const upcoming = events.filter((e) => e.status === 'upcoming' || e.status === 'ongoing').slice(0, 3);
      const completed = events.filter((e) => e.status === 'completed').slice(0, 3);
      setUpcomingEvents(upcoming);
      setRecentCompleted(completed);
    } catch (e) {
      console.error('Failed to load home data', e);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('izhar_db_updated', loadData);
    return () => window.removeEventListener('izhar_db_updated', loadData);
  }, []);

  // Keyboard navigation for poster modal
  useEffect(() => {
    if (!posterModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setActivePosterIndex((prev) => (prev + 1) % FEST_POSTERS.length);
      } else if (e.key === 'ArrowLeft') {
        setActivePosterIndex((prev) => (prev - 1 + FEST_POSTERS.length) % FEST_POSTERS.length);
      } else if (e.key === 'Escape') {
        setPosterModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [posterModalOpen]);

  const currentPoster = FEST_POSTERS[activePosterIndex];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4.5rem' }}>
      {/* 1. HERO SECTION WITH ACADEMY LOGO & OFFICIAL POSTERS */}
      <section
        style={{
          position: 'relative',
          padding: '4rem 0 2.5rem',
          overflow: 'hidden',
        }}
      >
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '3rem',
              alignItems: 'center',
            }}
          >
            {/* Left Column: Academy Branding & Title */}
            <div>
              {/* Academy Logo + Affiliation Header */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  padding: '0.45rem 1rem 0.45rem 0.5rem',
                  borderRadius: 'var(--radius-pill)',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                  marginBottom: '1.25rem',
                }}
              >
                <img
                  src={ASSETS.LOGO}
                  alt="IDC Academy"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '1.5px solid var(--gold)',
                  }}
                />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#fff', letterSpacing: '0.04em' }}>
                    IDC ACADEMY
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    CHIRAKKAL MARKAZ PERUMANNA
                  </div>
                </div>
              </div>

              {/* Heritage Tagline Pill */}
              <div style={{ marginBottom: '1rem' }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '0.35rem 0.9rem',
                    borderRadius: '8px',
                    background: 'rgba(245, 158, 11, 0.12)',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                    color: 'var(--gold)',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                  }}
                >
                  "മുസ്ലിം ജീവിതം കേരളീയ പൈതൃകം" • Arts Fest
                </span>
              </div>

              {/* Main Heading */}
              <h1
                style={{
                  fontSize: 'clamp(2.75rem, 5.5vw, 4.5rem)',
                  fontWeight: 900,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.05,
                  marginBottom: '1rem',
                  textTransform: 'uppercase',
                }}
              >
                <span className="fest-title-gold">IZHAR 2K26</span>
              </h1>

              {/* Dates & Venue Info */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.25rem',
                  flexWrap: 'wrap',
                  marginBottom: '1.25rem',
                  fontSize: '0.925rem',
                  fontWeight: 700,
                  color: '#fff',
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--gold)' }}>
                  <Calendar size={18} />
                  <span>OCTOBER 09 • 10 • 11</span>
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                  <MapPin size={18} color="var(--gold)" />
                  <span>{settings?.venue_general || 'IDC ACADEMY CHIRAKKAL MARKAZ PERUMANNA'}</span>
                </span>
              </div>

              {/* Description */}
              <p
                style={{
                  fontSize: '1.05rem',
                  color: 'var(--text-muted)',
                  lineHeight: '1.65',
                  marginBottom: '2rem',
                  maxWidth: '540px',
                }}
              >
                {settings?.description ||
                  'The premier arts and cultural championship of IDC Academy Chirakkal Markaz celebrating Islamic cultural heritage, literary eloquence, and stage performance excellence.'}
              </p>

              {/* Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  flexWrap: 'wrap',
                }}
              >
                <Link to="/results" className="btn btn-primary btn-lg" style={{ gap: '0.5rem' }}>
                  <Trophy size={20} />
                  <span>Live Leaderboard</span>
                </Link>
                <Link to="/events" className="btn btn-secondary btn-lg" style={{ gap: '0.5rem' }}>
                  <Award size={20} color="var(--gold)" />
                  <span>Browse Events</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setPosterModalOpen(true)}
                  className="btn btn-outline"
                  style={{ gap: '0.45rem', padding: '0.85rem 1.25rem' }}
                >
                  <Eye size={18} />
                  <span>View Posters ({FEST_POSTERS.length})</span>
                </button>
              </div>
            </div>

            {/* Right Column: Multi-Poster Showcase & Switcher */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.85rem', width: '100%', maxWidth: '480px', margin: '0 auto' }}>
              {/* Poster Card */}
              <div
                onClick={() => setPosterModalOpen(true)}
                style={{
                  position: 'relative',
                  cursor: 'pointer',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: `2px solid ${currentPoster.accentColor}88`,
                  boxShadow: `0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px ${currentPoster.accentColor}26`,
                  width: '100%',
                  background: '#0a0f1d',
                  transition: 'all 0.3s ease',
                }}
                className="hover-card"
              >
                {/* Poster Badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    zIndex: 3,
                    background: 'rgba(8, 12, 22, 0.88)',
                    backdropFilter: 'blur(8px)',
                    border: `1px solid ${currentPoster.accentColor}88`,
                    color: currentPoster.accentColor === '#f8fafc' ? '#fff' : currentPoster.accentColor,
                    fontSize: '0.725rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-pill)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <Sparkles size={12} /> {currentPoster.badge}
                </div>

                {/* Click to expand overlay tip */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    zIndex: 3,
                    background: 'rgba(8, 12, 22, 0.88)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    color: '#fff',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-pill)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <Eye size={13} /> View all {FEST_POSTERS.length} posters
                </div>

                <img
                  src={currentPoster.image}
                  alt={currentPoster.title}
                  style={{
                    width: '100%',
                    maxHeight: '440px',
                    display: 'block',
                    objectFit: 'contain',
                    background: '#070b14',
                  }}
                />
              </div>

              {/* Quick Tab Switcher Underneath Card */}
              <div style={{ display: 'flex', gap: '0.4rem', width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
                {FEST_POSTERS.map((p, idx) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePosterIndex(idx);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.35rem 0.65rem',
                      borderRadius: 'var(--radius-pill)',
                      background: activePosterIndex === idx ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                      border: activePosterIndex === idx ? `1.5px solid ${p.accentColor}` : '1px solid rgba(255, 255, 255, 0.1)',
                      color: activePosterIndex === idx ? '#fff' : 'var(--text-muted)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {p.flagColor && (
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: p.flagColor,
                          display: 'inline-block',
                          border: '1px solid rgba(255,255,255,0.4)',
                        }}
                      />
                    )}
                    <span>{p.tag}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Multi-Poster Lightbox Modal with Full Gallery & Carousel */}
        {posterModalOpen && (
          <div
            onClick={() => setPosterModalOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1000,
              background: 'rgba(4, 7, 15, 0.95)',
              backdropFilter: 'blur(16px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'relative',
                maxWidth: '960px',
                width: '100%',
                maxHeight: '94vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: '#0a0f1d',
                borderRadius: '16px',
                border: `2px solid ${currentPoster.accentColor}88`,
                boxShadow: `0 25px 60px rgba(0, 0, 0, 0.9), 0 0 40px ${currentPoster.accentColor}33`,
                overflow: 'hidden',
              }}
            >
              {/* Modal Top Bar */}
              <div
                style={{
                  width: '100%',
                  padding: '0.85rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    IZHAR 2K26 Posters
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    ({activePosterIndex + 1} of {FEST_POSTERS.length})
                  </span>
                </div>

                {/* Tab Buttons in Top Bar */}
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {FEST_POSTERS.map((p, idx) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setActivePosterIndex(idx)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.3rem 0.65rem',
                        borderRadius: '6px',
                        background: activePosterIndex === idx ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                        border: activePosterIndex === idx ? `1px solid ${p.accentColor}` : '1px solid transparent',
                        color: activePosterIndex === idx ? '#fff' : 'var(--text-muted)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {p.flagColor && (
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: p.flagColor,
                            display: 'inline-block',
                          }}
                        />
                      )}
                      <span>{p.tag}</span>
                    </button>
                  ))}
                </div>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setPosterModalOpen(false)}
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
                  title="Close modal (Esc)"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Main Image Area with Floating Arrow Buttons */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1rem',
                  flex: 1,
                  overflow: 'hidden',
                  background: '#050811',
                }}
              >
                {/* Left Arrow Button */}
                <button
                  type="button"
                  onClick={() => setActivePosterIndex((prev) => (prev - 1 + FEST_POSTERS.length) % FEST_POSTERS.length)}
                  style={{
                    position: 'absolute',
                    left: '16px',
                    zIndex: 10,
                    background: 'rgba(8, 12, 22, 0.8)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '42px',
                    height: '42px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  title="Previous Poster (←)"
                >
                  <ChevronLeft size={24} />
                </button>

                {/* Poster Image */}
                <img
                  src={currentPoster.image}
                  alt={currentPoster.title}
                  style={{
                    maxHeight: '60vh',
                    maxWidth: '100%',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.7)',
                  }}
                />

                {/* Right Arrow Button */}
                <button
                  type="button"
                  onClick={() => setActivePosterIndex((prev) => (prev + 1) % FEST_POSTERS.length)}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    zIndex: 10,
                    background: 'rgba(8, 12, 22, 0.8)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '42px',
                    height: '42px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  title="Next Poster (→)"
                >
                  <ChevronRight size={24} />
                </button>
              </div>

              {/* Caption & Thumbnail Rail */}
              <div
                style={{
                  width: '100%',
                  padding: '1rem 1.25rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  background: 'rgba(8, 12, 22, 0.95)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 900, fontSize: '1.15rem', color: '#fff', letterSpacing: '-0.02em' }}>
                    {currentPoster.title}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    {currentPoster.subtitle}
                  </div>
                </div>

                {/* Thumbnail Preview Strip */}
                <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', maxWidth: '100%', padding: '0.25rem' }}>
                  {FEST_POSTERS.map((p, idx) => (
                    <div
                      key={p.id}
                      onClick={() => setActivePosterIndex(idx)}
                      style={{
                        width: '64px',
                        height: '78px',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: activePosterIndex === idx ? `2px solid ${p.accentColor}` : '1px solid rgba(255, 255, 255, 0.15)',
                        opacity: activePosterIndex === idx ? 1 : 0.6,
                        transform: activePosterIndex === idx ? 'scale(1.06)' : 'none',
                        transition: 'all 0.2s ease',
                        flexShrink: 0,
                        background: '#070b14',
                      }}
                      title={p.title}
                    >
                      <img src={p.image} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 2. CURRENT TEAM STANDINGS (PROMINENT LEADERBOARD) */}
      <section className="container">
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gold)', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
              <Trophy size={16} /> Live Championship Standings
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 900 }}>Current Team Leaderboard</h2>
          </div>

          <Link to="/results" className="btn btn-outline btn-sm" style={{ gap: '0.4rem' }}>
            Full Points Breakdown <ArrowRight size={14} />
          </Link>
        </div>

        <LeaderboardTable items={leaderboard} />
      </section>

      {/* 3. UPCOMING EVENTS */}
      <section className="container">
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gold)', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
              <Calendar size={16} /> On Stage & Next Up
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 900 }}>Upcoming & Active Events</h2>
          </div>

          <Link to="/events" className="btn btn-outline btn-sm" style={{ gap: '0.4rem' }}>
            View Full Schedule <ArrowRight size={14} />
          </Link>
        </div>

        {upcomingEvents.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Calendar size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
            <p>No upcoming events scheduled right now.</p>
          </div>
        )}
      </section>

      {/* 4. RECENTLY COMPLETED EVENTS */}
      {recentCompleted.length > 0 && (
        <section className="container">
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
                <CheckCircle2 size={16} /> Results Verified
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: 900 }}>Recently Completed Events</h2>
            </div>

            <Link to="/results" className="btn btn-outline btn-sm" style={{ gap: '0.4rem' }}>
              All Official Results <ArrowRight size={14} />
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {recentCompleted.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
