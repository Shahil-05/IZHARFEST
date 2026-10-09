import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabaseClient';
import { loadLocalDb, calculateLeaderboard } from '../lib/localDb';
import { LeaderboardItem, EventResult, TeamPointAdjustment } from '../types/database';

export interface TeamPointsBreakdown {
  teamId: string;
  teamName: string;
  flagColor: string;
  themeAccent?: string;
  totalPoints: number;
  rank: number;
  eventResults: {
    eventName: string;
    categoryName?: string;
    resultLabel: string;
    points: number;
    participantName?: string;
  }[];
  adjustments: TeamPointAdjustment[];
}

export const leaderboardService = {
  // Returns unified leaderboard ranked descending
  async getLeaderboard(): Promise<LeaderboardItem[]> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        // First try the database view
        const { data: viewData, error: viewError } = await supabase
          .from('leaderboard_view')
          .select('*')
          .order('rank', { ascending: true });

        if (!viewError && viewData && viewData.length > 0) {
          return viewData as LeaderboardItem[];
        }

        // Fallback to safe query via client
        const { data: teams } = await supabase.from('teams').select('*');
        const { data: events } = await supabase.from('events').select('id, result_status');
        const publishedIds = new Set(
          (events || []).filter((e) => e.result_status === 'published').map((e) => e.id)
        );

        const { data: results } = await supabase.from('event_results').select('*');
        const { data: adjustments } = await supabase.from('team_point_adjustments').select('*');

        const teamEventPoints: Record<string, number> = {};
        (results || []).forEach((r) => {
          if (publishedIds.has(r.event_id)) {
            teamEventPoints[r.team_id] = (teamEventPoints[r.team_id] || 0) + Number(r.points);
          }
        });

        const teamAdjustmentPoints: Record<string, number> = {};
        (adjustments || []).forEach((adj) => {
          const pts = Math.abs(Number(adj.points));
          const delta = adj.adjustment_type === 'penalty' ? -pts : pts;
          teamAdjustmentPoints[adj.team_id] = (teamAdjustmentPoints[adj.team_id] || 0) + delta;
        });

        const items: LeaderboardItem[] = (teams || []).map((t) => {
          const evPts = teamEventPoints[t.id] || 0;
          const adjPts = teamAdjustmentPoints[t.id] || 0;
          return {
            team_id: t.id,
            team_name: t.name,
            flag_color: t.flag_color,
            theme_accent: t.theme_accent,
            event_points: evPts,
            adjustment_points: adjPts,
            total_points: evPts + adjPts,
            rank: 1,
          };
        });

        items.sort((a, b) => b.total_points - a.total_points);
        let curRank = 1;
        for (let i = 0; i < items.length; i++) {
          if (i > 0 && items[i].total_points < items[i - 1].total_points) {
            curRank++;
          }
          items[i].rank = curRank;
        }

        if (teams) {
          return items;
        }
      }
    }

    const db = loadLocalDb();
    return calculateLeaderboard(db);
  },

  // Returns full points breakdown for a specific team
  async getTeamBreakdown(teamId: string): Promise<TeamPointsBreakdown | null> {
    const leaderboard = await this.getLeaderboard();
    const teamRankInfo = leaderboard.find((item) => item.team_id === teamId);
    if (!teamRankInfo) return null;

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        // Fetch published results for this team
        const { data: resultsData } = await supabase
          .from('event_results')
          .select('*, event:events(*, category:event_categories(*)), participant:participants(*)')
          .eq('team_id', teamId);

        const publishedResults = (resultsData || [])
          .filter((r) => r.event?.result_status === 'published')
          .map((r) => ({
            eventName: r.event?.name || 'Event',
            categoryName: r.event?.category?.name,
            resultLabel: r.result_label,
            points: Number(r.points),
            participantName: r.participant?.name,
          }));

        const { data: adjData } = await supabase
          .from('team_point_adjustments')
          .select('*')
          .eq('team_id', teamId)
          .order('created_at', { ascending: false });

        return {
          teamId,
          teamName: teamRankInfo.team_name,
          flagColor: teamRankInfo.flag_color,
          themeAccent: teamRankInfo.theme_accent,
          totalPoints: teamRankInfo.total_points,
          rank: teamRankInfo.rank,
          eventResults: publishedResults,
          adjustments: (adjData || []) as TeamPointAdjustment[],
        };
      }
    }

    const db = loadLocalDb();
    const publishedEventMap = new Map(
      db.events.filter((e) => e.result_status === 'published').map((e) => [e.id, e])
    );

    const eventResults = db.event_results
      .filter((r) => r.team_id === teamId && publishedEventMap.has(r.event_id))
      .map((r) => {
        const ev = publishedEventMap.get(r.event_id)!;
        const cat = db.event_categories.find((c) => c.id === ev.category_id);
        const part = db.participants.find((p) => p.id === r.participant_id);
        return {
          eventName: ev.name,
          categoryName: cat?.name,
          resultLabel: r.result_label,
          points: Number(r.points),
          participantName: part?.name,
        };
      });

    const adjustments = db.team_point_adjustments
      .filter((a) => a.team_id === teamId)
      .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());

    return {
      teamId,
      teamName: teamRankInfo.team_name,
      flagColor: teamRankInfo.flag_color,
      themeAccent: teamRankInfo.theme_accent,
      totalPoints: teamRankInfo.total_points,
      rank: teamRankInfo.rank,
      eventResults,
      adjustments,
    };
  },
};
