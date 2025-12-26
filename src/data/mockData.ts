import { Team, Player, Match, Competition, StandingRow } from '@/types/football';

export const mockTeams: Team[] = [
  { id: 1, name: 'FC Thunder', coach_name: 'Carlos Martinez', founded_year: 1985, stadium: 'Thunder Arena' },
  { id: 2, name: 'United Stars', coach_name: 'John Williams', founded_year: 1990, stadium: 'Star Stadium' },
  { id: 3, name: 'Royal Eagles', coach_name: 'Ahmed Hassan', founded_year: 1978, stadium: 'Eagle Nest' },
  { id: 4, name: 'City Wolves', coach_name: 'Michael Brown', founded_year: 2002, stadium: 'Wolf Den' },
  { id: 5, name: 'Athletic Lions', coach_name: 'David Chen', founded_year: 1995, stadium: 'Lion\'s Roar' },
  { id: 6, name: 'Dynamo FC', coach_name: 'Igor Petrov', founded_year: 1988, stadium: 'Dynamo Park' },
];

export const mockPlayers: Player[] = [
  { id: 1, team_id: 1, team_name: 'FC Thunder', full_name: 'Marcus Johnson', position: 'FW', age: 26, nationality: 'England', appearances: 32, goals: 18, assists: 7, yellow_cards: 3, red_cards: 0 },
  { id: 2, team_id: 1, team_name: 'FC Thunder', full_name: 'Leo Garcia', position: 'MF', age: 24, nationality: 'Spain', appearances: 30, goals: 5, assists: 12, yellow_cards: 5, red_cards: 1 },
  { id: 3, team_id: 1, team_name: 'FC Thunder', full_name: 'James Wilson', position: 'DF', age: 28, nationality: 'England', appearances: 34, goals: 2, assists: 1, yellow_cards: 8, red_cards: 0 },
  { id: 4, team_id: 1, team_name: 'FC Thunder', full_name: 'Pedro Santos', position: 'GK', age: 31, nationality: 'Brazil', appearances: 34, goals: 0, assists: 0, yellow_cards: 1, red_cards: 0 },
  { id: 5, team_id: 2, team_name: 'United Stars', full_name: 'Alex Mueller', position: 'FW', age: 23, nationality: 'Germany', appearances: 28, goals: 14, assists: 5, yellow_cards: 2, red_cards: 0 },
  { id: 6, team_id: 2, team_name: 'United Stars', full_name: 'Ryan O\'Connor', position: 'MF', age: 27, nationality: 'Ireland', appearances: 31, goals: 8, assists: 9, yellow_cards: 4, red_cards: 0 },
  { id: 7, team_id: 3, team_name: 'Royal Eagles', full_name: 'Omar El-Sayed', position: 'FW', age: 25, nationality: 'Egypt', appearances: 29, goals: 12, assists: 6, yellow_cards: 1, red_cards: 0 },
  { id: 8, team_id: 3, team_name: 'Royal Eagles', full_name: 'Yuki Tanaka', position: 'MF', age: 22, nationality: 'Japan', appearances: 26, goals: 3, assists: 11, yellow_cards: 2, red_cards: 0 },
  { id: 9, team_id: 4, team_name: 'City Wolves', full_name: 'Luca Rossi', position: 'DF', age: 29, nationality: 'Italy', appearances: 33, goals: 1, assists: 2, yellow_cards: 7, red_cards: 1 },
  { id: 10, team_id: 5, team_name: 'Athletic Lions', full_name: 'Kai Weber', position: 'GK', age: 26, nationality: 'Germany', appearances: 34, goals: 0, assists: 0, yellow_cards: 0, red_cards: 0 },
];

export const mockMatches: Match[] = [
  { id: 1, home_team_id: 1, away_team_id: 2, home_team: 'FC Thunder', away_team: 'United Stars', home_score: 2, away_score: 1, date_time: '2025-12-10T19:00:00', venue: 'Thunder Arena', status: 'SCHEDULED' },
  { id: 2, home_team_id: 3, away_team_id: 4, home_team: 'Royal Eagles', away_team: 'City Wolves', home_score: 1, away_score: 1, date_time: '2025-12-08T15:30:00', venue: 'Eagle Nest', status: 'IN_PLAY' },
  { id: 3, home_team_id: 5, away_team_id: 6, home_team: 'Athletic Lions', away_team: 'Dynamo FC', home_score: 3, away_score: 0, date_time: '2025-12-07T20:00:00', venue: 'Lion\'s Roar', status: 'FINISHED' },
  { id: 4, home_team_id: 2, away_team_id: 3, home_team: 'United Stars', away_team: 'Royal Eagles', home_score: 0, away_score: 2, date_time: '2025-12-05T18:00:00', venue: 'Star Stadium', status: 'FINISHED' },
  { id: 5, home_team_id: 4, away_team_id: 1, home_team: 'City Wolves', away_team: 'FC Thunder', home_score: 1, away_score: 3, date_time: '2025-12-03T21:00:00', venue: 'Wolf Den', status: 'FINISHED' },
  { id: 6, home_team_id: 6, away_team_id: 5, home_team: 'Dynamo FC', away_team: 'Athletic Lions', home_score: 0, away_score: 0, date_time: '2025-12-15T17:00:00', venue: 'Dynamo Park', status: 'SCHEDULED' },
];

export const mockCompetitions: Competition[] = [
  { id: 1, name: 'Premier League', type: 'League', min_squad: 18, max_squad: 25, age_limit: undefined },
  { id: 2, name: 'Champions Cup', type: 'Cup', min_squad: 18, max_squad: 25, age_limit: undefined },
  { id: 3, name: 'Youth Championship', type: 'League', min_squad: 16, max_squad: 22, age_limit: 21 },
];

export const mockStandings: StandingRow[] = [
  { team_id: 1, team: 'FC Thunder', P: 10, W: 7, D: 2, L: 1, GF: 22, GA: 8, GD: 14, PTS: 23 },
  { team_id: 3, team: 'Royal Eagles', P: 10, W: 6, D: 3, L: 1, GF: 18, GA: 7, GD: 11, PTS: 21 },
  { team_id: 5, team: 'Athletic Lions', P: 10, W: 5, D: 3, L: 2, GF: 15, GA: 10, GD: 5, PTS: 18 },
  { team_id: 2, team: 'United Stars', P: 10, W: 4, D: 2, L: 4, GF: 14, GA: 14, GD: 0, PTS: 14 },
  { team_id: 6, team: 'Dynamo FC', P: 10, W: 2, D: 3, L: 5, GF: 9, GA: 16, GD: -7, PTS: 9 },
  { team_id: 4, team: 'City Wolves', P: 10, W: 1, D: 1, L: 8, GF: 6, GA: 29, GD: -23, PTS: 4 },
];
