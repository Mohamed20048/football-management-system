INSERT
    OR IGNORE INTO teams (name, coach_name, founded_year, stadium)
VALUES ('Falcon FC', 'A. Kovacs', 1998, 'Falcon Arena'),
    ('River United', 'M. Horvath', 2003, 'River Park');
INSERT
    OR IGNORE INTO players (team_id, full_name, position, age, nationality)
VALUES (1, 'Janos Toth', 'GK', 28, 'HU'),
    (1, 'Bence Nagy', 'DF', 24, 'HU'),
    (1, 'Milan Popov', 'FW', 26, 'RS'),
    (2, 'Adam Szabo', 'GK', 29, 'HU'),
    (2, 'David Kiss', 'MF', 22, 'HU'),
    (2, 'Luka Petrovic', 'FW', 25, 'RS');
INSERT
    OR IGNORE INTO competitions (name, type, min_squad, max_squad, age_limit)
VALUES ('National League', 'LEAGUE', 16, 35, NULL),
    ('U23 Cup', 'TOURNAMENT', 11, 25, 23);
INSERT
    OR IGNORE INTO registrations (team_id, competition_id)
VALUES (1, 1),
(2, 1);
INSERT
    OR IGNORE INTO matches (
        competition_id,
        home_team_id,
        away_team_id,
        date_time,
        venue,
        referee
    )
VALUES (
        1,
        1,
        2,
        datetime('now', '+1 day'),
        'Falcon Arena',
        'Ref A'
    );