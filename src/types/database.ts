export type EventType = 'individual' | 'group';
export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
export type ResultStatus = 'not_entered' | 'draft' | 'published';
export type AdjustmentType = 'bonus' | 'penalty';
export type AssignmentMode = 'entire_team' | 'selected_participants';

export interface FestSettings {
  id: string;
  fest_name: string;
  fest_year: string;
  description: string;
  logo_url: string;
  contact_info: string;
  venue_general: string;
  created_at?: string;
  updated_at?: string;
}

export interface Team {
  id: string;
  name: string;
  flag_color: string;
  theme_accent?: string;
  created_at?: string;
  updated_at?: string;
  // Joins
  leaders?: Participant[];
  member_count?: number;
}

export interface Participant {
  id: string;
  participant_code: string;
  name: string;
  class_batch: string;
  team_id: string;
  created_at?: string;
  updated_at?: string;
  // Joins
  team?: Team;
  events?: FestEvent[];
}

export interface TeamLeader {
  id: string;
  team_id: string;
  participant_id: string;
  created_at?: string;
  participant?: Participant;
  team?: Team;
}

export interface EventCategory {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
}

export interface FestEvent {
  id: string;
  name: string;
  event_type: EventType;
  category_id?: string | null;
  description?: string;
  event_date?: string;
  start_time?: string;
  end_time?: string;
  venue?: string;
  status: EventStatus;
  result_status: ResultStatus;
  created_at?: string;
  updated_at?: string;
  // Joins
  category?: EventCategory;
  scoring_rules?: EventScoringRule[];
  assigned_participants?: Participant[];
  assigned_teams?: {
    team_id: string;
    team: Team;
    assignment_mode: AssignmentMode;
    members?: Participant[];
  }[];
  results?: EventResult[];
}

export interface ScoringTemplate {
  id: string;
  name: string;
  event_type?: 'individual' | 'group' | 'all';
  created_at?: string;
  rules?: ScoringTemplateRule[];
}

export interface ScoringTemplateRule {
  id: string;
  template_id: string;
  label: string;
  points: number;
  sort_order: number;
}

export interface EventScoringRule {
  id: string;
  event_id: string;
  label: string;
  points: number;
  sort_order: number;
  created_at?: string;
}

export interface EventParticipant {
  id: string;
  event_id: string;
  participant_id: string;
  created_at?: string;
  participant?: Participant;
}

export interface EventTeamAssignment {
  id: string;
  event_id: string;
  team_id: string;
  assignment_mode: AssignmentMode;
  created_at?: string;
  team?: Team;
}

export interface EventResult {
  id: string;
  event_id: string;
  participant_id?: string | null; // null for group
  team_id: string;
  scoring_rule_id?: string | null;
  result_label: string;
  points: number;
  created_at?: string;
  updated_at?: string;
  // Joins
  participant?: Participant;
  team?: Team;
  scoring_rule?: EventScoringRule;
}

export interface TeamPointAdjustment {
  id: string;
  team_id: string;
  points: number;
  adjustment_type: AdjustmentType;
  reason: string;
  created_by?: string;
  created_at?: string;
  team?: Team;
}

export interface ProgramScheduleItem {
  id: string;
  event_id?: string | null;
  title: string;
  description?: string;
  schedule_date: string;
  start_time?: string;
  end_time?: string;
  venue?: string;
  created_at?: string;
  updated_at?: string;
  event?: FestEvent;
}

export interface AdminProfile {
  id: string;
  user_id: string;
  role: 'admin' | 'superadmin' | 'judge';
  created_at?: string;
}

export interface LeaderboardItem {
  team_id: string;
  team_name: string;
  flag_color: string;
  theme_accent?: string;
  event_points: number;
  adjustment_points: number;
  total_points: number;
  rank: number;
}
