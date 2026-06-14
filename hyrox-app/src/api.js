// ════════════════════════════════════════════════════════════════════════════
//  api.js — standalone data layer (Strava REST + Claude proxy + localStorage)
// ════════════════════════════════════════════════════════════════════════════

export const STRAVA_CLIENT_ID = import.meta.env.VITE_STRAVA_CLIENT_ID || "";

// ─── localStorage (replaces window.storage) ─────────────────────────────────
export const store = {
  get(key) {
    try { const v = localStorage.getItem(key); return v ? { value: v } : null; } catch { return null; }
  },
  set(key, value) {
    try { localStorage.setItem(key, value); return { value }; } catch { return null; }
  },
};

// ─── Strava token management ────────────────────────────────────────────────
const TOKEN_KEY = "strava-tokens";

export function getStravaTokens() {
  try { return JSON.parse(localStorage.getItem(TOKEN_KEY) || "null"); } catch { return null; }
}
export function setStravaTokens(t) {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(t));
}
export function isStravaConnected() {
  return !!getStravaTokens()?.refresh_token;
}
export function stravaAuthUrl() {
  const redirect = `${window.location.origin}/`;
  const scope = "read,activity:read_all,profile:read_all";
  return `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}` +
    `&response_type=code&redirect_uri=${encodeURIComponent(redirect)}` +
    `&approval_prompt=auto&scope=${scope}`;
}

// Exchange the ?code= returned by Strava after the user authorises
export async function exchangeStravaCode(code) {
  const r = await fetch("/api/strava", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "exchange", code }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || "Strava exchange failed");
  setStravaTokens(data);
  return data;
}

// Ensure a fresh access token (refreshes if within 5 min of expiry)
async function freshAccessToken() {
  const t = getStravaTokens();
  if (!t?.refresh_token) throw new Error("Strava not connected");
  const now = Math.floor(Date.now() / 1000);
  if (t.access_token && t.expires_at && t.expires_at - now > 300) return t.access_token;
  const r = await fetch("/api/strava", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "refresh", refresh_token: t.refresh_token }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || "Strava refresh failed");
  setStravaTokens({ ...t, ...data });
  return data.access_token;
}

// Generic Strava REST GET via the server proxy
async function stravaGet(path, query) {
  const access_token = await freshAccessToken();
  const r = await fetch("/api/strava", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "proxy", access_token, path, query }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || "Strava request failed");
  return data.data;
}

// ─── Strava data shaping ────────────────────────────────────────────────────
const pace = (mPerSec) => {
  if (!mPerSec) return null;
  const secPerKm = 1000 / mPerSec;
  const m = Math.floor(secPerKm / 60), s = Math.round(secPerKm % 60);
  return `${m}:${String(s).padStart(2, "0")}/km`;
};
const mmss = (sec) => `${Math.floor(sec / 60)}:${String(Math.round(sec % 60)).padStart(2, "0")}`;
const fixCadence = (c) => (c == null ? null : c < 50 ? Math.round(c * 2) : Math.round(c));

export async function fetchRecentActivities(count = 12) {
  const acts = await stravaGet("/athlete/activities", { per_page: count, page: 1 });
  return (acts || []).map((a) => ({
    id: a.id,
    name: a.name,
    type: a.sport_type || a.type,
    date: (a.start_date_local || "").slice(0, 10),
    distance_km: a.distance ? +(a.distance / 1000).toFixed(2) : null,
    moving_time: a.moving_time ? mmss(a.moving_time) : null,
    avg_pace: a.average_speed ? pace(a.average_speed) : null,
    avg_hr: a.average_heartrate ? Math.round(a.average_heartrate) : null,
    max_hr: a.max_heartrate ? Math.round(a.max_heartrate) : null,
    elevation_m: a.total_elevation_gain ? Math.round(a.total_elevation_gain) : null,
    avg_cadence: fixCadence(a.average_cadence),
  }));
}

export async function fetchActivityLaps(id) {
  const laps = await stravaGet(`/activities/${id}/laps`);
  return (laps || []).map((l, i) => ({
    lap: String(i + 1),
    distance_km: l.distance ? +(l.distance / 1000).toFixed(2) : null,
    time: l.moving_time ? mmss(l.moving_time) : null,
    pace: l.average_speed ? pace(l.average_speed).replace("/km", "") : null,
    hr: l.average_heartrate ? Math.round(l.average_heartrate) : null,
    max_hr: l.max_heartrate ? Math.round(l.max_heartrate) : null,
    cadence: fixCadence(l.average_cadence),
  }));
}

export async function fetchAthleteStats() {
  // need athlete id first
  const me = await stravaGet("/athlete");
  const stats = await stravaGet(`/athletes/${me.id}/stats`);
  const r = stats.recent_run_totals, y = stats.ytd_run_totals;
  return {
    recent_runs_count: r?.count ?? null,
    recent_distance_km: r?.distance ? Math.round(r.distance / 1000) : null,
    ytd_distance_km: y?.distance ? Math.round(y.distance / 1000) : null,
    ytd_runs: y?.count ?? null,
  };
}

// ─── Claude proxy ───────────────────────────────────────────────────────────
async function callClaude({ system, messages, maxTokens = 1500, web = false }) {
  const r = await fetch("/api/claude", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system, messages, max_tokens: maxTokens, web_search: web }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || "Claude request failed");
  return data.text || "";
}

// JSON parsers
function stripFences(s) { return (s || "").replace(/```json/gi, "").replace(/```/g, "").trim(); }
function parseObj(s) {
  try { const c = stripFences(s); return JSON.parse(c.slice(c.indexOf("{"), c.lastIndexOf("}") + 1)); }
  catch { return null; }
}

// Analyse a session: we fetch laps here, then hand everything to Claude.
export async function analyzeSession({ activity, goal, planWeek, focusAreas, priorSimilar }) {
  let laps = [];
  try { laps = await fetchActivityLaps(activity.id); } catch { /* some activities have no laps */ }

  const sys = `You are Sumegha's Hyrox/running coach analyst. Analyse the session using the LAP data provided (already fetched). Never invent numbers — use only what's given.

ATHLETE CONTEXT:
- Next race: ${goal?.title} on ${goal?.date}. Primary ${goal?.primary}, stretch ${goal?.stretch}. PB ${goal?.pb}.
- Plan week: Week ${planWeek?.w} (${planWeek?.phase}) — focus: ${planWeek?.focus}. Planned: ${planWeek?.sessions?.join("; ")}.
- Standing focus: ${focusAreas.map((f) => `${f.label} (${f.detail})`).join(" | ")}.
- BBJ framing: race BBJ is 80m ≈ 53–55 reps. Never "100+ rep" framing. Garmin caps reps at 99 (=100).
- Z2 correct = pace fades while HR holds flat ≤144.
- Compute cardiac drift = HR per km across laps; rising HR at flat pace = drift.

PRIOR SIMILAR SESSIONS: ${priorSimilar?.length ? JSON.stringify(priorSimilar) : "none"}.

Return ONLY valid JSON (no fences):
{"verdict":"one line","session_type":"interval|tempo|z2|long|sim|station|strength|recovery|other","tied_to_plan":"matched planned session or 'unplanned'","splits":[{"lap":"1","pace":"M:SS","hr":N,"cadence":N,"note":"..."}],"metrics":{"distance_km":N,"avg_pace":"M:SS","avg_hr":N,"drift":"+N bpm / flat / improving","cadence":N},"vs_target":"hit|near|missed + gap","vs_prior":"vs last similar, with numbers","goal_read":"meaning for the goal","focus_flags":[{"area":"...","status":"good|watch|flag","note":"..."}],"actions":["1-3 next actions"]}`;

  const payload = { activity, laps };
  const text = await callClaude({
    system: sys,
    messages: [{ role: "user", content: `Analyse this session: ${JSON.stringify(payload)}` }],
    maxTokens: 3000,
  });
  return parseObj(text);
}

// Chat: fetch recent activities up front, pass as context, let Claude answer.
export async function chatAssistant({ history, goals, planWeek, focusAreas }) {
  let recent = [];
  try { recent = await fetchRecentActivities(8); } catch { /* offline / not connected */ }

  const sys = `You are Sumegha's personal Hyrox + running coach. Warm, sharp, data-honest. Use the recent Strava activities provided as your data source; cite real numbers, don't guess. For deep pace/HR questions, note if you'd need lap detail.

RECENT ACTIVITIES: ${JSON.stringify(recent)}

GOALS: ${goals.map((g) => `${g.title} (${g.date}) — ${g.primary}${g.stretch ? `, stretch ${g.stretch}` : ""}`).join(" | ")}.
PLAN WEEK: Week ${planWeek?.w} (${planWeek?.phase}) — ${planWeek?.focus}. Sessions: ${planWeek?.sessions?.join("; ")}.
FOCUS: ${focusAreas.map((f) => f.label).join(", ")}.
BBJ: race distance 80m ≈ 53–55 reps; never "100+ rep". Z2 correct = pace fades, HR flat ≤144. L supraspinatus tendinitis — avoid heavy overhead cues.
Concise, concrete, tie back to the goal. Plain text, no markdown headers.`;

  const text = await callClaude({ system: sys, messages: history, maxTokens: 2000, web: true });
  return { text: text || "(no response)", usedData: recent.length > 0 };
}

// ─── date / plan helpers ────────────────────────────────────────────────────
export function daysUntil(dateStr, today = new Date()) {
  return Math.ceil((new Date(dateStr) - today) / (1000 * 60 * 60 * 24));
}
export function fmtDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
