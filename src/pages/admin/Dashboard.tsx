import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { participantService } from '../../services/participantService';
import { teamService } from '../../services/teamService';
import { eventService } from '../../services/eventService';
import { leaderboardService } from '../../services/leaderboardService';
import { FestEvent, LeaderboardItem } from '../../types/database';
import { LeaderboardTable } from '../../components/LeaderboardTable';
import {
  Users,
  Flag,
  Award,
  Calendar,
  AlertTriangle,
  FileEdit,
  PlusCircle,
  Trophy,
  ArrowRight,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [participantCount, setParticipantCount] = useState(0);
  const [teamCount, setTeamCount] = useState(0);
  const [events, setEvents] = useState<FestEvent[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [parts, tms, evs, lb] = await Promise.all([
        participantService.getParticipants(),
        teamService.getTeams(),
        eventService.getEvents(),
        leaderboardService.getLeaderboard(),
      ]);
      setParticipantCount(parts.length);
      setTeamCount(tms.length);
      setEvents(evs);
      setLeaderboard(lb);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('izhar_db_updated', loadData);
    return () => window.removeEventListener('izhar_db_updated', loadData);
  }, []);

  const upcomingCount = events.filter((e) => e.status === 'upcoming' || e.status === 'ongoing').length;
  const completedCount = events.filter((e) => e.status === 'completed').length;
  const pendingResultsCount = events.filter((e) => e.result_status !== 'published').length;

  // Alerts
  const completedWithoutResults = events.filter(
    (e) => e.status === 'completed' && e.result_status === 'not_entered'
  );
  const draftsAwaitingPublication = events.filter((e) => e.result_status === 'draft');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Top Banner / Welcome */}
      <div
        className="glass-panel"
        style={{
          padding: '2rem 2.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          background: 'linear-gradient(135deg, rgba(26, 36, 60, 0.9) 0%, rgba(13, 19, 34, 0.95) 100%)',
          borderLeft: '4px solid var(--gold)',
        }}
      >
        <div>
          <span style={{ color: 'var(--gold)', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Control Center
          </span>
          <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 900, color: '#fff', marginTop: '0.2rem' }}>
            Fest Operations Dashboard
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', maxWidth: '600px', marginTop: '0.4rem' }}>
            Monitor real-time competition metrics, scoring publication pipelines, and standings consistency.
          </p>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
          <Link to="/admin/participants" className="btn btn-secondary btn-sm" style={{ gap: '0.35rem' }}>
            <PlusCircle size={14} color="var(--gold)" />
            <span>Add Participant</span>
          </Link>
          <Link to="/admin/events" className="btn btn-secondary btn-sm" style={{ gap: '0.35rem' }}>
            <PlusCircle size={14} color="var(--gold)" />
            <span>Add Event</span>
          </Link>
          <Link to="/admin/results" className="btn btn-primary btn-sm" style={{ gap: '0.35rem' }}>
            <Trophy size={14} />
            <span>Enter Results</span>
          </Link>
          <Link to="/admin/schedule" className="btn btn-outline btn-sm" style={{ gap: '0.35rem' }}>
            <Calendar size={14} />
            <span>Add Schedule</span>
          </Link>
        </div>
      </div>

      {/* Actionable Alerts Section */}
      {(completedWithoutResults.length > 0 || draftsAwaitingPublication.length > 0) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {completedWithoutResults.map((e) => (
            <div
              key={e.id}
              style={{
                padding: '1rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <AlertTriangle size={20} color="var(--gold)" />
                <div>
                  <strong style={{ color: '#fff', fontSize: '0.925rem' }}>
                    Event Completed Without Results: "{e.name}"
                  </strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Scores are pending submission before leaderboard standings can reflect this event.
                  </div>
                </div>
              </div>
              <Link to="/admin/results" className="btn btn-primary btn-sm" style={{ fontSize: '0.8rem' }}>
                Enter Scores Now
              </Link>
            </div>
          ))}

          {draftsAwaitingPublication.map((e) => (
            <div
              key={e.id}
              style={{
                padding: '1rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FileEdit size={20} color="#60a5fa" />
                <div>
                  <strong style={{ color: '#fff', fontSize: '0.925rem' }}>
                    Draft Results Ready for Publication: "{e.name}"
                  </strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Draft scores are saved privately and have not yet been published to the official public leaderboard.
                  </div>
                </div>
              </div>
              <Link to="/admin/results" className="btn btn-success btn-sm" style={{ fontSize: '0.8rem' }}>
                Review & Publish
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Stat Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.25rem',
        }}
      >
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Total Participants
            </span>
            <Users size={18} color="var(--gold)" />
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 900, color: '#fff', fontFamily: 'var(--font-heading)' }}>
            {participantCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', marginTop: '0.25rem' }}>
            Assigned to competing squads
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Teams
            </span>
            <Flag size={18} color="#60a5fa" />
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 900, color: '#fff', fontFamily: 'var(--font-heading)' }}>
            {teamCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', marginTop: '0.25rem' }}>
            Houses in contention
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Total Events
            </span>
            <Award size={18} color="#c084fc" />
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 900, color: '#fff', fontFamily: 'var(--font-heading)' }}>
            {events.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', marginTop: '0.25rem' }}>
            {completedCount} concluded • {upcomingCount} in pipeline
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Pending Results
            </span>
            <Clock size={18} color="#f87171" />
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 900, color: '#fff', fontFamily: 'var(--font-heading)' }}>
            {pendingResultsCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', marginTop: '0.25rem' }}>
            Awaiting final verification
          </div>
        </div>
      </div>

      {/* Live Standings Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>Official Team Standings</h2>
          <Link to="/admin/adjustments" className="btn btn-outline btn-sm" style={{ gap: '0.35rem' }}>
            Manage Bonuses & Penalties <ArrowRight size={13} />
          </Link>
        </div>
        <LeaderboardTable items={leaderboard} />
      </div>
    </div>
  );
};
