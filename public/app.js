const roleSel = document.getElementById('role');
const headers = () => ({ 'Content-Type': 'application/json', 'X-Role': roleSel.value });

// Tabs
const tabs = document.querySelectorAll('nav.tabs button');
const sections = document.querySelectorAll('main .tab');
tabs.forEach(btn => btn.addEventListener('click', () => {
  tabs.forEach(b => b.classList.remove('active'));
  sections.forEach(s => s.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(btn.dataset.tab).classList.add('active');
}));

// Helpers
function toast(msg, ok = true) { console.log(ok ? '✅' : '❌', msg); }

async function api(url, opts = {}) {
  const res = await fetch(url, { ...opts, headers: { ...(opts.headers || {}), ...headers() } });
  if (!res.ok) throw new Error((await res.text()) || res.statusText);
  return res.headers.get('content-type')?.includes('application/json') ? res.json() : res.text();
}

// Populate selects
async function loadTeams() {
  const teams = await api('/api/teams');
  const opts = teams.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
  document.getElementById('playerTeam').innerHTML = opts;
  document.getElementById('homeTeam').innerHTML = opts;
  document.getElementById('awayTeam').innerHTML = opts;

  const table = document.getElementById('teamsTable');
  table.innerHTML = `<tr><th>ID</th><th>Name</th><th>Coach</th><th>Founded</th><th>Stadium</th><th></th></tr>` +
    teams.map(t => `
      <tr>
        <td>${t.id}</td>
        <td>${t.name}</td>
        <td>${t.coach_name || ''}</td>
        <td>${t.founded_year || ''}</td>
        <td>${t.stadium || ''}</td>
        <td><button data-del-team="${t.id}">Delete</button></td>
      </tr>`).join('');

  table.querySelectorAll('button[data-del-team]').forEach(b => b.onclick = async () => {
    try { await api(`/api/teams/${b.dataset.delTeam}`, { method: 'DELETE' }); toast('Team deleted'); loadTeams(); }
    catch (e) { toast(e.message, false); }
  });
}

async function loadCompetitions() {
  const comps = await api('/api/competitions');
  const opts = `<option value="">(none)</option>` + comps.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  document.getElementById('competition').innerHTML = opts;
  document.getElementById('standingsCompetition').innerHTML = comps.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
}

async function loadPlayers() {
  const players = await api('/api/players');
  const table = document.getElementById('playersTable');
  table.innerHTML = `<tr><th>ID</th><th>Name</th><th>Pos</th><th>Age</th><th>Team</th><th>G</th><th>A</th><th>YC</th><th>RC</th></tr>` +
    players.map(p => `
      <tr>
        <td>${p.id}</td>
        <td>${p.full_name}</td>
        <td>${p.position}</td>
        <td>${p.age}</td>
        <td>${p.team_name}</td>
        <td>${p.goals}</td>
        <td>${p.assists}</td>
        <td>${p.yellow_cards}</td>
        <td>${p.red_cards}</td>
      </tr>`).join('');
}

async function loadMatches() {
  const matches = await api('/api/matches');
  const table = document.getElementById('matchesTable');
  table.innerHTML = `<tr><th>ID</th><th>Date</th><th>Home</th><th>Score</th><th>Away</th><th>Status</th><th>Actions</th></tr>` +
    matches.map(m => `
      <tr>
        <td>${m.id}</td>
        <td>${new Date(m.date_time).toLocaleString()}</td>
        <td>${m.home_team}</td>
        <td>${m.home_score} : ${m.away_score}</td>
        <td>${m.away_team}</td>
        <td>${m.status}</td>
        <td>
          <button data-start="${m.id}">Start</button>
          <button data-finish="${m.id}">Finish</button>
          <button data-addgoal="${m.id}" data-home="${m.home_team_id}" data-away="${m.away_team_id}">+ Goal</button>
        </td>
      </tr>`).join('');

  table.querySelectorAll('button[data-start]').forEach(b => b.onclick = () =>
    api(`/api/matches/${b.dataset.start}/status`, { method: 'POST', body: JSON.stringify({ status: 'IN_PLAY' }) })
      .then(() => { toast('Match started'); loadMatches(); })
      .catch(e => toast(e.message, false))
  );

  table.querySelectorAll('button[data-finish]').forEach(b => b.onclick = () =>
    api(`/api/matches/${b.dataset.finish}/status`, { method: 'POST', body: JSON.stringify({ status: 'FINISHED' }) })
      .then(() => { toast('Match finished'); loadMatches(); })
      .catch(e => toast(e.message, false))
  );

  table.querySelectorAll('button[data-addgoal]').forEach(b => b.onclick = async () => {
    const matchId = b.dataset.addgoal;
    const teamIdStr = prompt('Goal for which team ID? (enter numeric team id)');
    if (!teamIdStr) return;
    const team_id = Number(teamIdStr);
    if (Number.isNaN(team_id)) { toast('Not a number', false); return; }
    try {
      await api(`/api/matches/${matchId}/event`, {
        method: 'POST',
        body: JSON.stringify({ minute: 1, type: 'GOAL', team_id })
      });
      toast('Goal added');
      loadMatches();
    } catch (e) { toast(e.message, false); }
  });
}

async function loadLive() {
  const list = document.getElementById('liveList');
  const live = await api('/api/live');
  list.innerHTML = live.map(m => `
    <div class="card">
      <div><strong>${m.home_team}</strong> vs <strong>${m.away_team}</strong></div>
      <div>${m.home_score} : ${m.away_score}</div>
      <div>${new Date(m.date_time).toLocaleString()} • ${m.venue || ''} • Ref: ${m.referee || ''}</div>
    </div>`).join('') || '<p>No live matches</p>';
}

async function loadStandings() {
  const cid = document.getElementById('standingsCompetition').value;
  if (!cid) return;
  const rows = await api(`/api/standings/${cid}`);
  const table = document.getElementById('standingsTable');
  table.innerHTML = `<tr><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th>PTS</th></tr>` +
    rows.map(r => `
      <tr>
        <td>${r.team}</td>
        <td>${r.P}</td>
        <td>${r.W}</td>
        <td>${r.D}</td>
        <td>${r.L}</td>
        <td>${r.GF}</td>
        <td>${r.GA}</td>
        <td>${r.GD}</td>
        <td>${r.PTS}</td>
      </tr>`).join('');
}

document.getElementById('loadStandings').onclick = loadStandings;

// Forms
const teamForm = document.getElementById('teamForm');
teamForm.onsubmit = async (e) => {
  e.preventDefault();
  const fd = new FormData(teamForm);
  const data = Object.fromEntries(fd.entries());
  if (data.founded_year) data.founded_year = Number(data.founded_year);
  try { await api('/api/teams', { method: 'POST', body: JSON.stringify(data) }); toast('Team created'); teamForm.reset(); loadTeams(); }
  catch (e) { toast(e.message, false); }
};

const playerForm = document.getElementById('playerForm');
playerForm.onsubmit = async (e) => {
  e.preventDefault();
  const fd = new FormData(playerForm);
  const data = Object.fromEntries(fd.entries());
  data.age = Number(data.age);
  data.team_id = Number(data.team_id);
  try { await api('/api/players', { method: 'POST', body: JSON.stringify(data) }); toast('Player created'); playerForm.reset(); loadPlayers(); }
  catch (e) { toast(e.message, false); }
};

const matchForm = document.getElementById('matchForm');
matchForm.onsubmit = async (e) => {
  e.preventDefault();
  const fd = new FormData(matchForm);
  const data = Object.fromEntries(fd.entries());
  data.competition_id = data.competition_id ? Number(data.competition_id) : null;
  data.home_team_id = Number(data.home_team_id);
  data.away_team_id = Number(data.away_team_id);
  try { await api('/api/matches', { method: 'POST', body: JSON.stringify(data) }); toast('Match scheduled'); matchForm.reset(); loadMatches(); }
  catch (e) { toast(e.message, false); }
};

// Initial load
(async function init() {
  await loadTeams();
  await loadCompetitions();
  await loadPlayers();
  await loadMatches();
  await loadLive();
  setInterval(loadLive, 5000);
})();
