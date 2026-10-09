import {
  FestSettings,
  Team,
  Participant,
  TeamLeader,
  EventCategory,
  FestEvent,
  ScoringTemplate,
  ScoringTemplateRule,
  EventScoringRule,
  EventParticipant,
  EventTeamAssignment,
  EventResult,
  TeamPointAdjustment,
  ProgramScheduleItem,
  LeaderboardItem,
} from '../types/database';
import { notifyDbChange } from './dbSync';

const DB_KEY = 'izhar_fest_db_v2';

export interface DatabaseState {
  fest_settings: FestSettings;
  teams: Team[];
  participants: Participant[];
  team_leaders: TeamLeader[];
  event_categories: EventCategory[];
  events: FestEvent[];
  scoring_templates: ScoringTemplate[];
  scoring_template_rules: ScoringTemplateRule[];
  event_scoring_rules: EventScoringRule[];
  event_participants: EventParticipant[];
  event_team_assignments: EventTeamAssignment[];
  event_results: EventResult[];
  team_point_adjustments: TeamPointAdjustment[];
  program_schedule: ProgramScheduleItem[];
}

function getInitialState(): DatabaseState {
  // IDs
  const idWiras = 'team-wiras-uuid';
  const idSuluk = 'team-suluk-uuid';
  const idDiraya = 'team-diraya-uuid';

  const pRiyas = 'p-wir-001';
  const pHafeel = 'p-wir-002';
  const pShahil = 'p-wir-003';

  const pNihal = 'p-slk-001';
  const pShakeeb = 'p-slk-002';
  const pArun = 'p-slk-003';
  const pAmal = 'p-slk-004';

  const pMidlaj = 'p-dry-001';
  const pAnfas = 'p-dry-002';
  const pRahul = 'p-dry-003';

  const catLiterary = 'cat-literary';
  const catIslamic = 'cat-islamic';
  const catArts = 'cat-arts';
  const catMedia = 'cat-media';

  const tplInd = 'tpl-ind-default';
  const tplGrp = 'tpl-grp-default';
  const tplGrd = 'tpl-grd-default';

  const evSpeech = 'ev-malayalam-speech';
  const evQawali = 'ev-qawali';
  const evQuran = 'ev-quran-tajweed';
  const evDebate = 'ev-english-debate';

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  return {
    fest_settings: {
      id: 'settings-1',
      fest_name: 'IZHAR 2K26',
      fest_year: '2026',
      description: 'Annual Arts, Cultural & Academic Fest celebrating Kerala Islamic heritage, creativity, and camaraderie.',
      logo_url: '/logo.png',
      contact_info: '+91 8075 055 921',
      venue_general: 'IDC ACADEMY CHIRAKKAL MARKAZ PERUMANNA',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    teams: [
      {
        id: idWiras,
        name: 'TEAM WIRAS',
        flag_color: '#f8fafc', // White
        theme_accent: '#cbd5e1',
        created_at: new Date().toISOString(),
      },
      {
        id: idSuluk,
        name: 'TEAM SULUK',
        flag_color: '#ef4444', // Red
        theme_accent: '#dc2626',
        created_at: new Date().toISOString(),
      },
      {
        id: idDiraya,
        name: 'TEAM DIRAYA',
        flag_color: '#3b82f6', // Blue
        theme_accent: '#2563eb',
        created_at: new Date().toISOString(),
      },
    ],
    participants: [
      // Wiras
      { id: pRiyas, participant_code: 'WIR-001', name: 'Muhammed Riyas', class_batch: 'Senior Batch A', team_id: idWiras },
      { id: pHafeel, participant_code: 'WIR-002', name: 'Abdul Hafeel', class_batch: 'Senior Batch B', team_id: idWiras },
      { id: pShahil, participant_code: 'WIR-003', name: 'Shahil Mohammed', class_batch: 'Junior Batch A', team_id: idWiras },
      // Suluk
      { id: pNihal, participant_code: 'SLK-001', name: 'Nihal Najeeb', class_batch: 'Senior Batch A', team_id: idSuluk },
      { id: pShakeeb, participant_code: 'SLK-002', name: 'Shakeeb Arsal', class_batch: 'Senior Batch C', team_id: idSuluk },
      { id: pArun, participant_code: 'SLK-003', name: 'Arun Kumar', class_batch: 'Junior Batch B', team_id: idSuluk },
      { id: pAmal, participant_code: 'SLK-004', name: 'Amal Farooq', class_batch: 'Senior Batch B', team_id: idSuluk },
      // Diraya
      { id: pMidlaj, participant_code: 'DRY-001', name: 'Muhammed Midlaj', class_batch: 'Senior Batch B', team_id: idDiraya },
      { id: pAnfas, participant_code: 'DRY-002', name: 'Muhammed Anfas', class_batch: 'Senior Batch A', team_id: idDiraya },
      { id: pRahul, participant_code: 'DRY-003', name: 'Rahul Krishnan', class_batch: 'Junior Batch A', team_id: idDiraya },
    ],
    team_leaders: [
      { id: 'tl-1', team_id: idWiras, participant_id: pRiyas },
      { id: 'tl-2', team_id: idWiras, participant_id: pHafeel },
      { id: 'tl-3', team_id: idSuluk, participant_id: pNihal },
      { id: 'tl-4', team_id: idSuluk, participant_id: pShakeeb },
      { id: 'tl-5', team_id: idDiraya, participant_id: pMidlaj },
      { id: 'tl-6', team_id: idDiraya, participant_id: pAnfas },
    ],
    event_categories: [
      { id: catLiterary, name: 'Literary', description: 'Debates, speeches, and creative writing competitions' },
      { id: catArts, name: 'Arts & Stage', description: 'Dramatics, stage performances, and cultural expressions' },
      { id: catIslamic, name: 'Islamic Cultural', description: 'Qawali, Moulood, Burdha, and Quranic recitation' },
      { id: catMedia, name: 'Media & IT', description: 'Digital design, multimedia, quiz, and technical events' },
    ],
    scoring_templates: [
      { id: tplInd, name: 'Individual Default (1st, 2nd, 3rd)', event_type: 'individual' },
      { id: tplGrp, name: 'Group Default (1st, 2nd, 3rd)', event_type: 'group' },
      { id: tplGrd, name: 'Grade-based Scoring (A, B, C)', event_type: 'all' },
    ],
    scoring_template_rules: [
      { id: 'str-1', template_id: tplInd, label: '1st Position', points: 20, sort_order: 1 },
      { id: 'str-2', template_id: tplInd, label: '2nd Position', points: 15, sort_order: 2 },
      { id: 'str-3', template_id: tplInd, label: '3rd Position', points: 10, sort_order: 3 },

      { id: 'str-4', template_id: tplGrp, label: '1st Position', points: 30, sort_order: 1 },
      { id: 'str-5', template_id: tplGrp, label: '2nd Position', points: 20, sort_order: 2 },
      { id: 'str-6', template_id: tplGrp, label: '3rd Position', points: 10, sort_order: 3 },

      { id: 'str-7', template_id: tplGrd, label: 'A Grade', points: 10, sort_order: 1 },
      { id: 'str-8', template_id: tplGrd, label: 'B Grade', points: 7, sort_order: 2 },
      { id: 'str-9', template_id: tplGrd, label: 'C Grade', points: 5, sort_order: 3 },
    ],
    events: [
      {
        id: evSpeech,
        name: 'Malayalam Elocution',
        event_type: 'individual',
        category_id: catLiterary,
        description: 'Time limit: 5 minutes. Topic is given 10 minutes prior to delivery. Clarity, logic, and diction are judged.',
        event_date: today,
        start_time: '09:30:00',
        end_time: '11:00:00',
        venue: 'Auditorium Stage 1',
        status: 'completed',
        result_status: 'published',
      },
      {
        id: evQawali,
        name: 'Traditional Qawali',
        event_type: 'group',
        category_id: catIslamic,
        description: 'Sufi & classical devotional music presentation. Max 6 singers and chorus. 12 minutes per team.',
        event_date: today,
        start_time: '11:30:00',
        end_time: '13:00:00',
        venue: 'Open Air Theatre',
        status: 'completed',
        result_status: 'published',
      },
      {
        id: evQuran,
        name: 'Quran Recitation (Tajweed)',
        event_type: 'individual',
        category_id: catIslamic,
        description: 'Recitation test judged by certified Qaris on Makharaij, Ahkam Tajweed, and Maqamat melodious tone.',
        event_date: today,
        start_time: '14:30:00',
        end_time: '16:30:00',
        venue: 'Seminary Hall A',
        status: 'ongoing',
        result_status: 'draft',
      },
      {
        id: evDebate,
        name: 'English Parliamentary Debate',
        event_type: 'group',
        category_id: catLiterary,
        description: 'Oxford parliamentary rules. 3-member squads. Motions delivered in impromptus format.',
        event_date: tomorrow,
        start_time: '10:00:00',
        end_time: '12:30:00',
        venue: 'Conference Hall',
        status: 'upcoming',
        result_status: 'not_entered',
      },
    ],
    event_scoring_rules: [
      // Speech
      { id: 'esr-1', event_id: evSpeech, label: '1st Position', points: 20, sort_order: 1 },
      { id: 'esr-2', event_id: evSpeech, label: '2nd Position', points: 15, sort_order: 2 },
      { id: 'esr-3', event_id: evSpeech, label: '3rd Position', points: 10, sort_order: 3 },
      // Qawali
      { id: 'esr-4', event_id: evQawali, label: '1st Position', points: 30, sort_order: 1 },
      { id: 'esr-5', event_id: evQawali, label: '2nd Position', points: 20, sort_order: 2 },
      { id: 'esr-6', event_id: evQawali, label: '3rd Position', points: 10, sort_order: 3 },
      // Quran
      { id: 'esr-7', event_id: evQuran, label: '1st Position', points: 20, sort_order: 1 },
      { id: 'esr-8', event_id: evQuran, label: '2nd Position', points: 15, sort_order: 2 },
      { id: 'esr-9', event_id: evQuran, label: '3rd Position', points: 10, sort_order: 3 },
      // Debate
      { id: 'esr-10', event_id: evDebate, label: 'Winner', points: 25, sort_order: 1 },
      { id: 'esr-11', event_id: evDebate, label: 'Runner Up', points: 15, sort_order: 2 },
    ],
    event_participants: [
      // Speech participants
      { id: 'ep-1', event_id: evSpeech, participant_id: pShahil },
      { id: 'ep-2', event_id: evSpeech, participant_id: pArun },
      { id: 'ep-3', event_id: evSpeech, participant_id: pRahul },
      // Qawali participants (grouped per team)
      { id: 'ep-4', event_id: evQawali, participant_id: pRiyas },
      { id: 'ep-5', event_id: evQawali, participant_id: pHafeel },
      { id: 'ep-6', event_id: evQawali, participant_id: pShahil },
      { id: 'ep-7', event_id: evQawali, participant_id: pNihal },
      { id: 'ep-8', event_id: evQawali, participant_id: pAmal },
      { id: 'ep-9', event_id: evQawali, participant_id: pMidlaj },
      { id: 'ep-10', event_id: evQawali, participant_id: pAnfas },
      // Quran participants
      { id: 'ep-11', event_id: evQuran, participant_id: pRiyas },
      { id: 'ep-12', event_id: evQuran, participant_id: pNihal },
      { id: 'ep-13', event_id: evQuran, participant_id: pMidlaj },
      // Debate participants
      { id: 'ep-14', event_id: evDebate, participant_id: pHafeel },
      { id: 'ep-15', event_id: evDebate, participant_id: pShakeeb },
      { id: 'ep-16', event_id: evDebate, participant_id: pAnfas },
    ],
    event_team_assignments: [
      { id: 'eta-1', event_id: evQawali, team_id: idWiras, assignment_mode: 'selected_participants' },
      { id: 'eta-2', event_id: evQawali, team_id: idSuluk, assignment_mode: 'selected_participants' },
      { id: 'eta-3', event_id: evQawali, team_id: idDiraya, assignment_mode: 'selected_participants' },
      { id: 'eta-4', event_id: evDebate, team_id: idWiras, assignment_mode: 'entire_team' },
      { id: 'eta-5', event_id: evDebate, team_id: idSuluk, assignment_mode: 'entire_team' },
      { id: 'eta-6', event_id: evDebate, team_id: idDiraya, assignment_mode: 'entire_team' },
    ],
    event_results: [
      // Speech (Individual, Published)
      // 1st: Shahil (Wiras) +20
      // 2nd: Arun (Suluk) +15
      // 3rd: Rahul (Diraya) +10
      {
        id: 'res-1',
        event_id: evSpeech,
        participant_id: pShahil,
        team_id: idWiras,
        scoring_rule_id: 'esr-1',
        result_label: '1st Position',
        points: 20,
        created_at: new Date().toISOString(),
      },
      {
        id: 'res-2',
        event_id: evSpeech,
        participant_id: pArun,
        team_id: idSuluk,
        scoring_rule_id: 'esr-2',
        result_label: '2nd Position',
        points: 15,
        created_at: new Date().toISOString(),
      },
      {
        id: 'res-3',
        event_id: evSpeech,
        participant_id: pRahul,
        team_id: idDiraya,
        scoring_rule_id: 'esr-3',
        result_label: '3rd Position',
        points: 10,
        created_at: new Date().toISOString(),
      },

      // Qawali (Group, Published)
      // 1st: Team Wiras +30 (no participant_id)
      // 2nd: Team Suluk +20 (no participant_id)
      // 3rd: Team Diraya +10 (no participant_id)
      {
        id: 'res-4',
        event_id: evQawali,
        participant_id: null,
        team_id: idWiras,
        scoring_rule_id: 'esr-4',
        result_label: '1st Position',
        points: 30,
        created_at: new Date().toISOString(),
      },
      {
        id: 'res-5',
        event_id: evQawali,
        participant_id: null,
        team_id: idSuluk,
        scoring_rule_id: 'esr-5',
        result_label: '2nd Position',
        points: 20,
        created_at: new Date().toISOString(),
      },
      {
        id: 'res-6',
        event_id: evQawali,
        participant_id: null,
        team_id: idDiraya,
        scoring_rule_id: 'esr-6',
        result_label: '3rd Position',
        points: 10,
        created_at: new Date().toISOString(),
      },

      // Quran (Draft result - must NOT show on public results or affect leaderboard!)
      {
        id: 'res-draft-1',
        event_id: evQuran,
        participant_id: pRiyas,
        team_id: idWiras,
        scoring_rule_id: 'esr-7',
        result_label: '1st Position (Draft)',
        points: 20,
        created_at: new Date().toISOString(),
      },
    ],
    team_point_adjustments: [
      {
        id: 'adj-1',
        team_id: idWiras,
        points: 5,
        adjustment_type: 'bonus',
        reason: 'Outstanding discipline and punctuality in opening procession',
        created_at: new Date().toISOString(),
      },
      {
        id: 'adj-2',
        team_id: idSuluk,
        points: 3,
        adjustment_type: 'penalty',
        reason: 'Late reporting for stage setup in event session 1',
        created_at: new Date().toISOString(),
      },
    ],
    program_schedule: [
      {
        id: 'sch-1',
        event_id: null,
        title: 'Grand Inaugural Ceremony & Flag Hoisting',
        description: 'Commencement of IZHAR Fest 2026. Dignitaries, prayers, and fest anthem release.',
        schedule_date: today,
        start_time: '08:30:00',
        end_time: '09:15:00',
        venue: 'Grand Central Ground',
      },
      {
        id: 'sch-2',
        event_id: evSpeech,
        title: 'Malayalam Elocution',
        description: 'Individual competition on stage 1.',
        schedule_date: today,
        start_time: '09:30:00',
        end_time: '11:00:00',
        venue: 'Auditorium Stage 1',
      },
      {
        id: 'sch-3',
        event_id: evQawali,
        title: 'Traditional Qawali',
        description: 'Choral sufi presentations by all competing team squads.',
        schedule_date: today,
        start_time: '11:30:00',
        end_time: '13:00:00',
        venue: 'Open Air Theatre',
      },
      {
        id: 'sch-4',
        event_id: null,
        title: 'Lunch & Dhuhr Prayer Break',
        description: 'Community dining and noon prayers in the Academy Mosque.',
        schedule_date: today,
        start_time: '13:00:00',
        end_time: '14:15:00',
        venue: 'Dining Pavilion & Mosque',
      },
      {
        id: 'sch-5',
        event_id: evQuran,
        title: 'Quran Recitation (Tajweed)',
        description: 'Vocal Quranic recitation test under expert supervision.',
        schedule_date: today,
        start_time: '14:30:00',
        end_time: '16:30:00',
        venue: 'Seminary Hall A',
      },
      {
        id: 'sch-6',
        event_id: evDebate,
        title: 'English Parliamentary Debate',
        description: 'Cross-examination and parliamentary debate championship.',
        schedule_date: tomorrow,
        start_time: '10:00:00',
        end_time: '12:30:00',
        venue: 'Conference Hall',
      },
      {
        id: 'sch-7',
        event_id: null,
        title: 'Grand Valedictory & Champion Trophy Presentation',
        description: 'Official declaration of Fest Winner Team and celebration ceremony.',
        schedule_date: tomorrow,
        start_time: '17:00:00',
        end_time: '19:30:00',
        venue: 'Grand Auditorium',
      },
    ],
  };
}

export function loadLocalDb(): DatabaseState {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(DB_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    }
  } catch (e) {
    console.error('Error loading local db', e);
  }
  const initial = getInitialState();
  saveLocalDb(initial);
  return initial;
}

export function saveLocalDb(state: DatabaseState): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(DB_KEY, JSON.stringify(state));
    }
    notifyDbChange();
  } catch (e) {
    console.error('Error saving local db', e);
  }
}

export function resetLocalDb(): DatabaseState {
  const initial = getInitialState();
  saveLocalDb(initial);
  return initial;
}

// Helper calculation matching SQL leaderboard_view
export function calculateLeaderboard(db: DatabaseState): LeaderboardItem[] {
  // Published event points
  const publishedEventIds = new Set(
    db.events.filter((e) => e.result_status === 'published').map((e) => e.id)
  );

  const teamEventPoints: Record<string, number> = {};
  db.event_results.forEach((res) => {
    if (publishedEventIds.has(res.event_id)) {
      teamEventPoints[res.team_id] = (teamEventPoints[res.team_id] || 0) + Number(res.points);
    }
  });

  // Team adjustments
  const teamAdjustmentPoints: Record<string, number> = {};
  db.team_point_adjustments.forEach((adj) => {
    const pts = Math.abs(Number(adj.points));
    const delta = adj.adjustment_type === 'penalty' ? -pts : pts;
    teamAdjustmentPoints[adj.team_id] = (teamAdjustmentPoints[adj.team_id] || 0) + delta;
  });

  const items: LeaderboardItem[] = db.teams.map((team) => {
    const evPts = teamEventPoints[team.id] || 0;
    const adjPts = teamAdjustmentPoints[team.id] || 0;
    const total = evPts + adjPts;
    return {
      team_id: team.id,
      team_name: team.name,
      flag_color: team.flag_color,
      theme_accent: team.theme_accent,
      event_points: evPts,
      adjustment_points: adjPts,
      total_points: total,
      rank: 1, // calculated below
    };
  });

  // Sort by total_points DESC, then team_name ASC
  items.sort((a, b) => {
    if (b.total_points !== a.total_points) {
      return b.total_points - a.total_points;
    }
    return a.team_name.localeCompare(b.team_name);
  });

  // Dense rank calculation
  let currentRank = 1;
  for (let i = 0; i < items.length; i++) {
    if (i > 0 && items[i].total_points < items[i - 1].total_points) {
      currentRank++;
    }
    items[i].rank = currentRank;
  }

  return items;
}
