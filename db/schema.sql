PRAGMA foreign_keys = ON;
-- USERS (for future auth)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    role TEXT CHECK(role IN ('admin', 'coach', 'referee', 'spectator')) NOT NULL DEFAULT 'spectator',
    password_hash TEXT
);
-- TEAMS
CREATE TABLE IF NOT EXISTS teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    coach_name TEXT,
    founded_year INTEGER,
    stadium TEXT
);
-- PLAYERS
CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_id INTEGER NOT NULL,
    full_name TEXT NOT NULL,
    position TEXT CHECK(position IN ('GK', 'DF', 'MF', 'FW')) NOT NULL,
    age INTEGER CHECK(
        age >= 10
        AND age <= 55
    ) NOT NULL,
    nationality TEXT,
    appearances INTEGER NOT NULL DEFAULT 0,
    goals INTEGER NOT NULL DEFAULT 0,
    assists INTEGER NOT NULL DEFAULT 0,
    yellow_cards INTEGER NOT NULL DEFAULT 0,
    red_cards INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);
-- COMPETITIONS
CREATE TABLE IF NOT EXISTS competitions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    type TEXT CHECK(type IN ('LEAGUE', 'TOURNAMENT')) NOT NULL,
    min_squad INTEGER NOT NULL DEFAULT 11,
    max_squad INTEGER NOT NULL DEFAULT 35,
    age_limit INTEGER
);
-- REGISTRATIONS
CREATE TABLE IF NOT EXISTS registrations (
    team_id INTEGER NOT NULL,
    competition_id INTEGER NOT NULL,
    registered_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (team_id, competition_id),
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE
);
-- MATCHES
CREATE TABLE IF NOT EXISTS matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    competition_id INTEGER,
    home_team_id INTEGER NOT NULL,
    away_team_id INTEGER NOT NULL,
    date_time TEXT NOT NULL,
    venue TEXT,
    referee TEXT,
    status TEXT CHECK(status IN ('SCHEDULED', 'IN_PLAY', 'FINISHED')) NOT NULL DEFAULT 'SCHEDULED',
    home_score INTEGER NOT NULL DEFAULT 0,
    away_score INTEGER NOT NULL DEFAULT 0,
    UNIQUE(home_team_id, away_team_id, date_time),
    FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE
    SET NULL,
        FOREIGN KEY (home_team_id) REFERENCES teams(id) ON DELETE CASCADE,
        FOREIGN KEY (away_team_id) REFERENCES teams(id) ON DELETE CASCADE
);
-- MATCH EVENTS
CREATE TABLE IF NOT EXISTS match_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    match_id INTEGER NOT NULL,
    minute INTEGER CHECK(
        minute >= 0
        AND minute <= 130
    ) NOT NULL,
    type TEXT CHECK(
        type IN ('GOAL', 'ASSIST', 'YELLOW', 'RED', 'SUB', 'OWN_GOAL')
    ) NOT NULL,
    player_id INTEGER,
    team_id INTEGER,
    notes TEXT,
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE
    SET NULL,
        FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE
    SET NULL
);