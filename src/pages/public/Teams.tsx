import React, { useEffect, useState } from 'react';
import { teamService } from '../../services/teamService';
import { leaderboardService } from '../../services/leaderboardService';
import { Team, LeaderboardItem } from '../../types/database';
import { TeamCard } from '../../components/TeamCard';
import { Users, Flag, Trophy, Shield } from 'lucide-react';

export const Teams: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [allTeams, lb] = await Promise.all([
        teamService.getTeams(),
        leaderboardService.getLeaderboard(),
      ]);
      setTeams(allTeams);
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

  const rankMap = new Map<string, { rank: number; points: number }>();
  leaderboard.forEach((item) => {
    rankMap.set(item.team_id, { rank: item.rank, points: item.total_points });
  });

  return (
    <div className="container" style={{ padding: '3.5rem 1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--gold)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
          <Flag size={16} /> Participating Squads
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 900, marginBottom: '0.75rem' }}>
          Championship Teams
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '680px' }}>
          Competing squads representing academic departments and houses, competing for the prestigious IZHAR Championship Cup.
        </p>
      </div>

      {/* Teams Grid */}
      {teams.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
          }}
        >
          {teams.map((team) => {
            const standing = rankMap.get(team.id) || { rank: 1, points: 0 };
            return (
              <TeamCard
                key={team.id}
                team={team}
                points={standing.points}
                rank={standing.rank}
              />
            );
          })}
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Users size={36} color="var(--gold)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <p>No teams registered in the database.</p>
        </div>
      )}
    </div>
  );
};
