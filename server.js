import express from 'express';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

// ---------- Setup ----------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DB_PATH = path.join(__dirname, 'football.db');

// Helper to run SQL files
function runSQL(db, file) {
  const p = path.join(__dirname, 'db', file);
  const sql = fs.readFileSync(p, 'utf8');
  db.exec(sql);
}

// ---------- Handle CLI flags before opening DB ----------
if (process.argv.includes('--init-db')) {
  const db = new Database(DB_PATH);
  db.pragma('foreign_keys = ON');
  runSQL(db, 'schema.sql');
  db.close();
  console.log('DB schema created.');
  process.exit(0);
}

if (process.argv.includes('--reset-db')) {
  if (fs.existsSync(DB_PATH)) {
    try { fs.rmSync(DB_PATH, { force: true }); } catch {}
  }
  const db = new Database(DB_PATH);
  db.pragma('foreign_keys = ON');
  runSQL(db, 'schema.sql');
  runSQL(db, 'seed.sql');
  db.close();
  console.log('DB reset + seeded.');
  process.exit(0);
}

// ---------- Now open the main database ----------
const db = new Database(DB_PATH);
db.pragma('foreign_keys = ON');

// ---------- Role gate ----------
function requireRole(...roles) {
  return (req, res, next) => {
    const role = (req.headers['x-role'] || 'spectator').toString();
    if (!roles.includes(role)) return res.status(403).json({ error: 'Forbidden' });
    req.role = role;
    next();
  };
}

// ---------- Schemas ----------
const TeamSchema = z.object({
  name: z.string().min(2),
  coach_name: z.string().optional().nullable(),
  founded_year: z.number().int().min(1850).max(new Date().getFullYear()).optional().nullable(),
  stadium: z.string().optional().nullable(),
});

const PlayerSchema = z.object({
  team_id: z.number().int().positive(),
  full_name: z.string().min(2),
  position: z.enum(['GK', 'DF', 'MF', 'FW']),
  age: z.number().int().min(10).max(55),
  nationality: z.string().optional().nullable(),
});

const MatchSchema = z.object({
  competition_id: z.number().int().positive().optional().nullable(),
  home_team_id: z.number().int().positive(),
  away_team_id: z.number().int().positive().refine((v, ctx) => {
    const home = ctx.parent?.home_team_id;
    return !home || v !== home;
  }, 'Home and away teams must differ'),
  date_time: z.string(),
  venue: z.string().optional().nullable(),
  referee: z.string().optional().nullable(),
});

// ---------- Teams ----------
app.get('/api/teams', (req, res) => {
  const rows = db.prepare('SELECT * FROM teams ORDER BY name').all();
  res.json(rows);
});

app.post('/api/teams', requireRole('admin', 'coach'), (req, res) => {
  const parsed = TeamSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const { name, coach_name, founded_year, stadium } = parsed.data;
  try {
    const stmt = db.prepare('INSERT INTO teams (name, coach_name, founded_year, stadium) VALUES (?,?,?,?)');
    const info = stmt.run(name, coach_name ?? null, founded_year ?? null, stadium ?? null);
    res.status(201).json({ id: info.lastInsertRowid });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.put('/api/teams/:id', requireRole('admin', 'coach'), (req, res) => {
  const id = Number(req.params.id);
  const partial = TeamSchema.partial().safeParse(req.body);
  if (!partial.success) return res.status(400).json(partial.error);
  const fields = Object.keys(partial.data);
  if (!fields.length) return res.json({ updated: 0 });
  const set = fields.map(f => `${f} = ?`).join(',');
  const values = fields.map(f => partial.data[f] ?? null);
  const info = db.prepare(`UPDATE teams SET ${set} WHERE id = ?`).run(...values, id);
  res.json({ updated: info.changes });
});

app.delete('/api/teams/:id', requireRole('admin'), (req, res) => {
  const info = db.prepare('DELETE FROM teams WHERE id = ?').run(Number(req.params.id));
  res.json({ deleted: info.changes });
});

// ---------- Players ----------
app.get('/api/players', (req, res) => {
  const rows = db.prepare(`SELECT p.*, t.name as team_name FROM players p JOIN teams t ON t.id = p.team_id ORDER BY p.full_name`).all();
  res.json(rows);
});

app.post('/api/players', requireRole('admin', 'coach'), (req, res) => {
  const parsed = PlayerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const { team_id, full_name, position, age, nationality } = parsed.data;
  try {
    const info = db.prepare(`INSERT INTO players (team_id, full_name, position, age, nationality) VALUES (?,?,?,?,?)`).run(team_id, full_name, position, age, nationality ?? null);
    res.status(201).json({ id: info.lastInsertRowid });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.put('/api/players/:id', requireRole('admin', 'coach'), (req, res) => {
  const id = Number(req.params.id);
  const allowed = ['team_id', 'full_name', 'position', 'age', 'nationality', 'appearances', 'goals', 'assists', 'yellow_cards', 'red_cards'];
  const fields = Object.keys(req.body).filter(k => allowed.includes(k));
  if (!fields.length) return res.json({ updated: 0 });
  const set = fields.map(f => `${f} = ?`).join(',');
  const values = fields.map(f => req.body[f]);
  const info = db.prepare(`UPDATE players SET ${set} WHERE id = ?`).run(...values, id);
  res.json({ updated: info.changes });
});

app.delete('/api/players/:id', requireRole('admin', 'coach'), (req, res) => {
  const info = db.prepare('DELETE FROM players WHERE id = ?').run(Number(req.params.id));
  res.json({ deleted: info.changes });
});

// ---------- Competitions & Registration ----------
app.get('/api/competitions', (req, res) => {
  res.json(db.prepare('SELECT * FROM competitions ORDER BY name').all());
});

app.post('/api/competitions', requireRole('admin'), (req, res) => {
  const { name, type, min_squad = 11, max_squad = 35, age_limit = null } = req.body;
  try {
    const info = db.prepare('INSERT INTO competitions (name,type,min_squad,max_squad,age_limit) VALUES (?,?,?,?,?)')
      .run(name, type, min_squad, max_squad, age_limit);
    res.status(201).json({ id: info.lastInsertRowid });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.post('/api/competitions/:id/register', requireRole('admin', 'coach'), (req, res) => {
  const competition_id = Number(req.params.id);
  const { team_id } = req.body;
  const comp = db.prepare('SELECT * FROM competitions WHERE id = ?').get(competition_id);
  if (!comp) return res.status(404).json({ error: 'Competition not found' });
  const squad = db.prepare('SELECT COUNT(*) as c, MIN(age) as min_age, MAX(age) as max_age FROM players WHERE team_id = ?').get(team_id);
  if (squad.c < comp.min_squad) return res.status(400).json({ error: `Minimum squad size ${comp.min_squad} not met` });
  if (squad.c > comp.max_squad) return res.status(400).json({ error: `Maximum squad size ${comp.max_squad} exceeded` });
  if (comp.age_limit && squad.max_age > comp.age_limit) return res.status(400).json({ error: `Age limit ${comp.age_limit} exceeded by some players` });
  try {
    db.prepare('INSERT INTO registrations (team_id, competition_id) VALUES (?,?)').run(team_id, competition_id);
    res.status(201).json({ ok: true });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// ---------- Matches ----------
app.get('/api/matches', (req, res) => {
  const rows = db.prepare(`SELECT m.*, ht.name AS home_team, at.name AS away_team FROM matches m JOIN teams ht ON ht.id = m.home_team_id JOIN teams at ON at.id = m.away_team_id ORDER BY datetime(m.date_time) ASC`).all();
  res.json(rows);
});

app.post('/api/matches', requireRole('admin'), (req, res) => {
  const parsed = MatchSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const { competition_id = null, home_team_id, away_team_id, date_time, venue = null, referee = null } = parsed.data;
  try {
    const info = db.prepare(`INSERT INTO matches (competition_id, home_team_id, away_team_id, date_time, venue, referee) VALUES (?,?,?,?,?,?)`).run(competition_id, home_team_id, away_team_id, date_time, venue, referee);
    res.status(201).json({ id: info.lastInsertRowid });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.post('/api/matches/:id/status', requireRole('referee', 'admin'), (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;
  if (!['SCHEDULED', 'IN_PLAY', 'FINISHED'].includes(status)) return res.status(400).json({ error: 'Bad status' });
  const info = db.prepare('UPDATE matches SET status = ? WHERE id = ?').run(status, id);
  res.json({ updated: info.changes });
});

app.post('/api/matches/:id/event', requireRole('referee', 'admin'), (req, res) => {
  const id = Number(req.params.id);
  const { minute, type, player_id = null, team_id = null, notes = null } = req.body;
  if (!['GOAL', 'ASSIST', 'YELLOW', 'RED', 'SUB', 'OWN_GOAL'].includes(type)) return res.status(400).json({ error: 'Bad event type' });
  const info = db.prepare('INSERT INTO match_events (match_id, minute, type, player_id, team_id, notes) VALUES (?,?,?,?,?,?)').run(id, minute, type, player_id, team_id, notes);
  const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(id);
  if (type === 'GOAL' || type === 'OWN_GOAL') {
    const isOwn = type === 'OWN_GOAL';
    const homeInc = (team_id === match.home_team_id) ^ isOwn ? 1 : 0;
    const awayInc = (team_id === match.away_team_id) ^ isOwn ? 1 : 0;
    db.prepare('UPDATE matches SET home_score = home_score + ?, away_score = away_score + ? WHERE id = ?').run(homeInc, awayInc, id);
    if (player_id && type === 'GOAL') db.prepare('UPDATE players SET goals = goals + 1 WHERE id = ?').run(player_id);
  }
  if (type === 'YELLOW') player_id && db.prepare('UPDATE players SET yellow_cards = yellow_cards + 1 WHERE id = ?').run(player_id);
  if (type === 'RED') player_id && db.prepare('UPDATE players SET red_cards = red_cards + 1 WHERE id = ?').run(player_id);
  res.status(201).json({ id: info.lastInsertRowid });
});

app.get('/api/matches/:id/events', (req, res) => {
  const rows = db.prepare('SELECT * FROM match_events WHERE match_id = ? ORDER BY minute ASC, id ASC').all(Number(req.params.id));
  res.json(rows);
});

// ---------- Fixtures, Live, Standings ----------
app.get('/api/fixtures', (req, res) => {
  const rows = db.prepare(`SELECT m.*, ht.name AS home_team, at.name AS away_team FROM matches m JOIN teams ht ON ht.id = m.home_team_id JOIN teams at ON at.id = m.away_team_id WHERE datetime(m.date_time) >= datetime('now') ORDER BY datetime(m.date_time) ASC`).all();
  res.json(rows);
});

app.get('/api/live', (req, res) => {
  const rows = db.prepare(`SELECT m.*, ht.name AS home_team, at.name AS away_team FROM matches m JOIN teams ht ON ht.id = m.home_team_id JOIN teams at ON at.id = m.away_team_id WHERE m.status = 'IN_PLAY' ORDER BY datetime(m.date_time) ASC`).all();
  res.json(rows);
});

app.get('/api/standings/:competitionId', (req, res) => {
  const cid = Number(req.params.competitionId);
  const teams = db.prepare('SELECT t.id, t.name FROM teams t JOIN registrations r ON r.team_id = t.id WHERE r.competition_id = ?').all(cid);
  const table = new Map(teams.map(t => [t.id, { team_id: t.id, team: t.name, P: 0, W: 0, D: 0, L: 0, GF: 0, GA: 0, GD: 0, PTS: 0 }]));
  const matches = db.prepare('SELECT * FROM matches WHERE competition_id = ? AND status = "FINISHED"').all(cid);
  for (const m of matches) {
    const home = table.get(m.home_team_id);
    const away = table.get(m.away_team_id);
    if (!home || !away) continue;
    home.P++; away.P++;
    home.GF += m.home_score; home.GA += m.away_score; home.GD = home.GF - home.GA;
    away.GF += m.away_score; away.GA += m.home_score; away.GD = away.GF - away.GA;
    if (m.home_score > m.away_score) { home.W++; away.L++; home.PTS += 3; }
    else if (m.home_score < m.away_score) { away.W++; home.L++; away.PTS += 3; }
    else { home.D++; away.D++; home.PTS++; away.PTS++; }
  }
  const rows = Array.from(table.values()).sort((a, b) => b.PTS - a.PTS || b.GD - a.GD || b.GF - a.GF || a.team.localeCompare(b.team));
  res.json(rows);
});

// ---------- Health check ----------
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// ---------- Start server ----------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server on http://localhost:${PORT}`);
  if (!fs.existsSync(path.join(__dirname, 'db'))) fs.mkdirSync(path.join(__dirname, 'db'));
  if (!fs.existsSync(DB_PATH)) {
    runSQL(db, 'schema.sql');
    if (fs.existsSync(path.join(__dirname, 'db', 'seed.sql'))) runSQL(db, 'seed.sql');
    console.log('DB initialized.');
  }
});
