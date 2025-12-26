export type Role = 'spectator' | 'coach' | 'referee' | 'admin';

export type PlayerPosition = 'GK' | 'DF' | 'MF' | 'FW';

export type MatchStatus = 'SCHEDULED' | 'IN_PLAY' | 'FINISHED';

export type EventType = 'GOAL' | 'ASSIST' | 'YELLOW' | 'RED' | 'SUB' | 'OWN_GOAL';

export interface Team {
  id: number;
  name: string;
  coach_name?: string;
  founded_year?: number;
  stadium?: string;
}

export interface Player {
  id: number;
  team_id: number;
  team_name?: string;
  full_name: string;
  position: PlayerPosition;
  age: number;
  nationality?: string;
  appearances: number;
  goals: number;
  assists: number;
  yellow_cards: number;
  red_cards: number;
}

export interface Match {
  id: number;
  competition_id?: number;
  home_team_id: number;
  away_team_id: number;
  home_team: string;
  away_team: string;
  home_score: number;
  away_score: number;
  date_time: string;
  venue?: string;
  referee?: string;
  status: MatchStatus;
}

export interface Competition {
  id: number;
  name: string;
  type: string;
  min_squad: number;
  max_squad: number;
  age_limit?: number;
}

export interface MatchEvent {
  id: number;
  match_id: number;
  minute: number;
  type: EventType;
  player_id?: number;
  team_id?: number;
  notes?: string;
}

export interface StandingRow {
  team_id: number;
  team: string;
  P: number;
  W: number;
  D: number;
  L: number;
  GF: number;
  GA: number;
  GD: number;
  PTS: number;
}
