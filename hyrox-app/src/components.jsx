import { useState, useEffect, useRef, useCallback } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { C, PLAN, FOCUS_AREAS } from "./config.js";
import {
  fetchRecentActivities, fetchAthleteStats, analyzeSession, chatAssistant,
  daysUntil, fmtDate, store
} from "./api.js";

// ─── SHARED UI ──────────────────────────────────────────────────────────────
export function Loader({ text = "Working…" }) {
  return (
    <div className="loader">
      <div className="spinner" />
      <div className="loader-text">{text}</div>
    </div>
  );
}
export function ErrorBox({ msg, onRetry }) {
  return (
    <div className="error-box">
      {msg}
      {onRetry && (
        <div style={{ marginTop: 10 }}>
          <button className="btn btn-sm" onClick={onRetry}>RETRY</button>
        </div>
      )}
    </div>
  );
}

const ACT_ICON = {
  Run: "🏃", TrailRun: "🏃", Workout: "🏋️", WeightTraining: "🏋️", Crossfit: "🔥",
  Ride: "🚴", Walk: "🚶", Hike: "🥾", Swim: "🏊", Yoga: "🧘", Elliptical: "⚙️",
};
const actIcon = (t) => ACT_ICON[t] || "💪";

const FLAG_COLOR = { good: C.green, watch: C.amber, flag: C.accent };
const PRI_STYLE = {
  CRITICAL: { background: "#1a0a05", color: C.accent },
  HIGH: { background: "#1a1200", color: C.amber },
  MAINTAIN: { background: "#0a1620", color: C.blue },
  STRONG: { background: "#0a2416", color: C.green },
  ELITE: { background: "#160a20", color: C.purple },
};

function priColor(p) {
  return ({ CRITICAL: C.accent, HIGH: C.amber, MAINTAIN: C.blue, STRONG: C.green, ELITE: C.purple })[p] || C.muted;
}

// progress percentage between a start and target (lower = better, time-based)
function timeToSec(t) {
  if (!t || typeof t !== "string" || !t.includes(":")) return null;
  const [m, s] = t.split(":").map(Number);
  return m * 60 + s;
}
function progressPct(current, start, target) {
  const c = timeToSec(current), s = timeToSec(start), t = timeToSec(target);
  if (c == null || s == null || t == null || s === t) return 0;
  return Math.min(100, Math.max(0, ((s - c) / (s - t)) * 100));
}


// ─── ANALYZER (priority 1) ──────────────────────────────────────────────────
export function Analyzer({ goals, planWeek }) {
  const [activities, setActivities] = useState(null);
  const [loadingList, setLoadingList] = useState(false);
  const [listErr, setListErr] = useState(null);
  const [selected, setSelected] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [anErr, setAnErr] = useState(null);

  const primaryGoal = goals.find((g) => g.active) || goals[0];

  const loadList = useCallback(async () => {
    setLoadingList(true); setListErr(null);
    try {
      const acts = await fetchRecentActivities(12);
      if (!acts.length) setListErr("No activities came back from Strava. Pull to refresh, or check the Strava connection.");
      setActivities(acts);
    } catch (e) {
      setListErr(`Couldn't reach Strava: ${e.message}`);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => { loadList(); }, [loadList]);

  const runAnalysis = async (act) => {
    setSelected(act); setAnalysis(null); setAnErr(null); setAnalyzing(true);
    try {
      // find prior similar (same type, earlier) for comparison
      const prior = (activities || [])
        .filter((a) => a.id !== act.id && a.type === act.type)
        .slice(0, 3)
        .map((a) => ({ date: a.date, name: a.name, distance_km: a.distance_km, avg_pace: a.avg_pace, avg_hr: a.avg_hr }));
      const res = await analyzeSession({
        activity: act, goal: primaryGoal, planWeek, focusAreas: FOCUS_AREAS, priorSimilar: prior,
      });
      if (!res) setAnErr("Analysis came back unreadable. Try again — Strava may have been slow to return laps.");
      setAnalysis(res);
    } catch (e) {
      setAnErr(`Analysis failed: ${e.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="panel">
      <div className="section-label">DAILY SESSION ANALYZER</div>
      {loadingList && <Loader text="Pulling recent sessions from Strava…" />}
      {listErr && !loadingList && <ErrorBox msg={listErr} onRetry={loadList} />}

      {activities && !loadingList && (
        <>
          {!selected && (
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 12, lineHeight: 1.5 }}>
              Tap a session for a full coach breakdown — lap splits, cardiac drift, comparison to your last similar
              session, and what it means for {primaryGoal?.primary} at {primaryGoal?.title.split("—")[0].trim()}.
            </div>
          )}
          {activities.map((a) => (
            <div
              key={a.id}
              className={`activity-row ${selected?.id === a.id ? "selected" : ""}`}
              onClick={() => runAnalysis(a)}
            >
              <span className="act-icon">{actIcon(a.type)}</span>
              <div className="act-main">
                <div className="act-name">{a.name}</div>
                <div className="act-meta">
                  {a.distance_km ? `${a.distance_km}km · ` : ""}{a.moving_time || ""}
                  {a.avg_hr ? ` · ${a.avg_hr}bpm` : ""}
                </div>
              </div>
              <div className="act-right">
                {a.avg_pace && <div className="act-pace">{a.avg_pace}</div>}
                <div className="act-date">{a.date}</div>
              </div>
            </div>
          ))}
          <button className="btn btn-full btn-sm mt14" onClick={loadList}>↻ REFRESH SESSIONS</button>
        </>
      )}

      {analyzing && <Loader text="Pulling lap data + analysing against your plan…" />}
      {anErr && !analyzing && <ErrorBox msg={anErr} onRetry={() => runAnalysis(selected)} />}

      {analysis && !analyzing && (
        <div className="analysis-card">
          <div className="an-verdict">{analysis.verdict}</div>
          {analysis.tied_to_plan && (
            <span className="an-tied">
              {analysis.tied_to_plan === "unplanned" ? "UNPLANNED SESSION" : `↳ ${analysis.tied_to_plan}`}
            </span>
          )}

          {analysis.metrics && (
            <div className="an-metrics">
              <div className="an-metric">
                <div className="an-m-val" style={{ color: C.white }}>{analysis.metrics.avg_pace || "—"}</div>
                <div className="an-m-label">AVG PACE</div>
              </div>
              <div className="an-metric">
                <div className="an-m-val" style={{ color: C.accent }}>{analysis.metrics.avg_hr || "—"}</div>
                <div className="an-m-label">AVG HR</div>
              </div>
              <div className="an-metric">
                <div className="an-m-val" style={{ color: C.amber, fontSize: 16 }}>{analysis.metrics.drift || "—"}</div>
                <div className="an-m-label">DRIFT</div>
              </div>
              <div className="an-metric">
                <div className="an-m-val" style={{ color: C.blue }}>{analysis.metrics.cadence || "—"}</div>
                <div className="an-m-label">CADENCE</div>
              </div>
            </div>
          )}

          {analysis.vs_target && (
            <div className="an-block">
              <div className="an-block-title">VS TARGET</div>
              <div className="an-text">{analysis.vs_target}</div>
            </div>
          )}
          {analysis.vs_prior && (
            <div className="an-block">
              <div className="an-block-title">VS LAST SIMILAR SESSION</div>
              <div className="an-text">{analysis.vs_prior}</div>
            </div>
          )}

          {Array.isArray(analysis.splits) && analysis.splits.length > 0 && (
            <div className="an-block">
              <div className="an-block-title">SPLITS</div>
              <table className="splits-table">
                <thead>
                  <tr><th>LAP</th><th>PACE</th><th>HR</th><th>CAD</th><th>NOTE</th></tr>
                </thead>
                <tbody>
                  {analysis.splits.map((s, i) => (
                    <tr key={i}>
                      <td>{s.lap}</td><td>{s.pace || "—"}</td><td>{s.hr || "—"}</td>
                      <td>{s.cadence || "—"}</td><td style={{ color: C.muted }}>{s.note || ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {analysis.goal_read && (
            <div className="an-block">
              <div className="an-block-title">WHAT IT MEANS FOR {primaryGoal?.primary?.toUpperCase()}</div>
              <div className="an-text">{analysis.goal_read}</div>
            </div>
          )}

          {Array.isArray(analysis.focus_flags) && analysis.focus_flags.length > 0 && (
            <div className="an-block">
              <div className="an-block-title">FOCUS AREA CHECK</div>
              {analysis.focus_flags.map((f, i) => (
                <div key={i} className="flag-row">
                  <span className="flag-dot" style={{ background: FLAG_COLOR[f.status] || C.muted }} />
                  <div>
                    <div className="flag-area">{f.area}</div>
                    <div className="flag-note">{f.note}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {Array.isArray(analysis.actions) && analysis.actions.length > 0 && (
            <div className="an-block">
              <div className="an-block-title">DO NEXT</div>
              {analysis.actions.map((a, i) => (
                <div key={i} className="action-item">
                  <span className="action-num">{i + 1}</span><span>{a}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


// ─── GOALS (priority 2) ─────────────────────────────────────────────────────
export function Goals({ goals, setGoals }) {
  const [expanded, setExpanded] = useState(goals[0]?.id);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", date: "", primary: "", stretch: "" });

  const addGoal = () => {
    if (!form.title || !form.date) return;
    const ng = {
      id: `goal-${Date.now()}`, title: form.title, date: form.date, type: "custom",
      primary: form.primary || "Finish", stretch: form.stretch, pb: "—", active: true,
      color: C.blue, notes: "", stations: [], runTargets: [],
    };
    setGoals([...goals, ng]);
    setForm({ title: "", date: "", primary: "", stretch: "" });
    setAdding(false);
  };

  const sorted = [...goals].sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="panel">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div className="section-label" style={{ margin: 0 }}>GOALS</div>
        <button className="btn btn-sm" onClick={() => setAdding(true)}>+ ADD GOAL</button>
      </div>

      {sorted.map((g) => {
        const days = daysUntil(g.date);
        const isOpen = expanded === g.id;
        return (
          <div key={g.id} className="goal-card">
            <div className="goal-head" style={{ borderLeftColor: g.color }} onClick={() => setExpanded(isOpen ? null : g.id)}>
              <div>
                <div className="goal-title">{g.title}</div>
                <div className="goal-date">{fmtDate(g.date)}</div>
              </div>
              <div className="goal-countdown">
                <div className="goal-cd-num" style={{ color: days < 0 ? C.muted : g.color }}>
                  {days < 0 ? "DONE" : days}
                </div>
                {days >= 0 && <div className="goal-cd-label">DAYS OUT</div>}
              </div>
            </div>
            <div className="goal-targets">
              <span className="goal-tag" style={{ background: "#141414", color: C.white, border: "1px solid #333" }}>
                {g.primary}
              </span>
              {g.stretch && (
                <span className="goal-tag" style={{ background: "#141414", color: C.amber, border: "1px solid #3a2e00" }}>
                  STRETCH {g.stretch}
                </span>
              )}
              {g.pb && g.pb !== "—" && (
                <span className="goal-tag" style={{ background: "#141414", color: C.muted, border: "1px solid #2a2a2a" }}>
                  PB {g.pb}
                </span>
              )}
            </div>
            {g.notes && <div className="goal-notes">{g.notes}</div>}

            {isOpen && (g.stations?.length > 0 || g.runTargets?.length > 0) && (
              <div className="goal-expand">
                {g.runTargets?.length > 0 && (
                  <>
                    <div className="an-block-title">RACE RUN TARGETS</div>
                    {g.runTargets.map((r, i) => (
                      <div key={i} className="run-target-row">
                        <span className="rt-seg">{r.seg}</span>
                        <span className="rt-pace">{r.pace}</span>
                        <span className="rt-note">{r.note}</span>
                      </div>
                    ))}
                  </>
                )}
                {g.stations?.length > 0 && (
                  <>
                    <div className="an-block-title" style={{ marginTop: 16 }}>STATION TARGETS</div>
                    <div className="station-grid">
                      {g.stations.map((s, i) => (
                        <div key={i} className="station-chip">
                          <div className="sc-top">
                            <span className="sc-name2">{s.short}</span>
                            <span className="sc-pri" style={PRI_STYLE[s.priority]}>{s.priority}</span>
                          </div>
                          <div className="sc-times">
                            <span className="sc-blr">{s.blr}</span>
                            <span className="sc-arrow">→</span>
                            <span className="sc-tgt">{s.target}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}

      {adding && (
        <div className="modal-overlay" onClick={() => setAdding(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="section-label">ADD A GOAL</div>
            <label className="input-label">RACE / EVENT</label>
            <input className="input-field" placeholder="e.g. Bengaluru Marathon"
              value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <label className="input-label">DATE</label>
            <input className="input-field" type="date"
              value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <label className="input-label">PRIMARY TARGET</label>
            <input className="input-field" placeholder="e.g. Sub 4:00"
              value={form.primary} onChange={(e) => setForm({ ...form, primary: e.target.value })} />
            <label className="input-label">STRETCH TARGET (optional)</label>
            <input className="input-field" placeholder="e.g. Sub 3:45"
              value={form.stretch} onChange={(e) => setForm({ ...form, stretch: e.target.value })} />
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              <button className="btn btn-full" onClick={() => setAdding(false)}>CANCEL</button>
              <button className="btn btn-primary btn-full" onClick={addGoal}>SAVE GOAL</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PLAN VIEW (lives under Goals tab as a sub-section) ─────────────────────
export function PlanView({ planWeek }) {
  const [openWeek, setOpenWeek] = useState(planWeek.w);
  return (
    <div style={{ marginTop: 24 }}>
      <div className="section-label">{PLAN.name.toUpperCase()}</div>
      <div className="phase-strip">
        {PLAN.phases.map((p, i) => (
          <div key={i} className="phase-seg" style={{ borderColor: `${p.color}55` }}>
            <div className="phase-seg-name" style={{ color: p.color }}>{p.name}</div>
            <div className="phase-seg-wk">WK {p.weeks}</div>
          </div>
        ))}
      </div>

      {PLAN.weeks.map((w) => {
        const isCurrent = w.w === planWeek.w;
        const isDone = w.w < planWeek.w;
        const isOpen = openWeek === w.w;
        const phaseColor =
          w.phase === "DELOAD" ? C.amber :
          w.phase === "TAPER" ? C.green :
          w.phase.includes("SPECIFIC") || w.phase === "PEAK" ? C.accent : C.blue;
        return (
          <div key={w.w}>
            <div
              className={`week-row ${isCurrent ? "current" : ""} ${isDone ? "done" : ""}`}
              onClick={() => setOpenWeek(isOpen ? null : w.w)}
            >
              <div className="week-num" style={{ color: isCurrent ? C.accent : isDone ? C.muted : C.white }}>{w.w}</div>
              <div className="week-info">
                <div className="week-focus">{w.focus}</div>
                <div className="week-meta">{w.label}{isCurrent ? " · THIS WEEK" : isDone ? " · done" : ""}</div>
              </div>
              <span className="week-phase-tag" style={{ background: `${phaseColor}1a`, color: phaseColor, border: `1px solid ${phaseColor}44` }}>
                {w.phase}
              </span>
            </div>
            {isOpen && (
              <div className="week-detail">
                {w.sessions.map((s, i) => (
                  <span key={i} className="session-pill">{s}</span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}


// ─── CHAT ASSISTANT (priority 3) ────────────────────────────────────────────
export function Chat({ goals, planWeek }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `I'm your coach. Ask me about any session, your recovery, your paces, or how things are tracking toward ${goals.find((g) => g.active)?.primary || "your goal"}. I'll pull your live Strava data when it helps.`,
      usedData: false,
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  const suggestions = [
    "How was my last run?",
    "Am I on track for sub 1:50?",
    "How's my cadence trending?",
    "What should I focus on this week?",
  ];

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, sending]);

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || sending) return;
    const newHistory = [...messages, { role: "user", content: msg }];
    setMessages(newHistory);
    setInput("");
    setSending(true);
    try {
      const apiHistory = newHistory.map(({ role, content }) => ({ role, content }));
      const { text: reply, usedData } = await chatAssistant({
        history: apiHistory, goals, planWeek, focusAreas: FOCUS_AREAS,
      });
      setMessages((m) => [...m, { role: "assistant", content: reply, usedData }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", content: `Something went wrong reaching the coach: ${e.message}`, usedData: false }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="panel">
      <div className="section-label">COACH CHAT</div>
      <div className="chat-wrap">
        <div className="chat-scroll" ref={scrollRef}>
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.role}`}>
              <div className="msg-bubble">
                {m.content}
                {m.role === "assistant" && m.usedData && (
                  <div className="msg-data-badge">✓ pulled live Strava data</div>
                )}
              </div>
            </div>
          ))}
          {sending && (
            <div className="msg assistant">
              <div className="msg-bubble"><span className="loader-text">Coach is thinking…</span></div>
            </div>
          )}
        </div>

        {messages.length <= 1 && (
          <div className="chat-suggest">
            {suggestions.map((s, i) => (
              <button key={i} className="suggest-chip" onClick={() => send(s)}>{s}</button>
            ))}
          </div>
        )}

        <div className="chat-input-row">
          <textarea
            className="chat-input" rows={1} placeholder="Ask your coach…" value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          />
          <button className="btn btn-primary" onClick={() => send()} disabled={sending || !input.trim()}>SEND</button>
        </div>
      </div>
    </div>
  );
}


// ─── DASHBOARD (priority 4) ─────────────────────────────────────────────────
// Garmin recovery metrics: seeded from last known sync, refreshed via manual entry.
const SEED_RECOVERY = {
  hrv: { lastNight: null, weeklyAvg: null, low: 56, high: 82, status: "SYNC NEEDED" },
  readiness: null, rhr: null, sleep: null, battery: null, stress: "—",
  vo2: 43, syncedOn: null,
  hrvWeek: [],
};

// Station progress baseline (from race PB → training bests). Updated on Garmin sync.
const SEED_STATIONS = [
  { key: "bbj", name: "BURPEE BROAD JUMP", blr: "12:50", best: "8:53", target: "8:00", color: C.accent, note: "True 80m baseline 8:53 (Jun 10)" },
  { key: "wb", name: "WALL BALLS 100r", blr: "8:34", best: "6:11", target: "6:00", color: C.amber, note: "6:11 — 11s off target" },
];

export function Dashboard({ goals, planWeek, onManualSync }) {
  const [rec, setRec] = useState(SEED_RECOVERY);
  const [stations] = useState(SEED_STATIONS);
  const [stravaStats, setStravaStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const primaryGoal = goals.find((g) => g.active) || goals[0];
  const days = daysUntil(primaryGoal.date);

  // load persisted Garmin sync
  useEffect(() => {
    (async () => {
      try {
        const r = await store.get("hyrox-recovery");
        if (r?.value) setRec(JSON.parse(r.value));
      } catch { /* seed */ }
    })();
  }, []);

  // pull live Strava volume totals
  useEffect(() => {
    (async () => {
      setStatsLoading(true);
      try {
        const s = await fetchAthleteStats();
        setStravaStats(s);
      } catch { /* not connected */ } finally { setStatsLoading(false); }
    })();
  }, []);

  const syncGarmin = () => onManualSync();

  const hrvStatus = rec.hrv.lastNight == null ? "SYNC NEEDED"
    : rec.hrv.lastNight >= rec.hrv.high - 5 ? "BALANCED"
    : rec.hrv.lastNight < rec.hrv.low + 5 ? "SUPPRESSED" : "STEADY";
  const hrvPill = hrvStatus === "BALANCED" ? "pill-green" : hrvStatus === "SUPPRESSED" ? "pill-amber" : hrvStatus === "SYNC NEEDED" ? "pill-muted" : "pill-orange";

  return (
    <div className="panel">
      <div className="section-label">RECOVERY & READINESS</div>

      <div className="sync-banner">
        <span style={{ fontSize: 20 }}>⌚</span>
        <div className="sync-text">
          <div className="sync-title">GARMIN SYNC</div>
          {rec.syncedOn ? `Last synced ${rec.syncedOn}. Tap to refresh recovery metrics.` : "Recovery metrics need a Garmin pull — tap sync."}
        </div>
        <button className="btn btn-sm btn-primary" onClick={syncGarmin}>SYNC</button>
      </div>

      <div className="hrv-card">
        <div className="hrv-top">
          <div>
            <div className="mc-label">HRV — LAST NIGHT</div>
            <div>
              <span className="hrv-num">{rec.hrv.lastNight ?? "—"}</span>
              <span className="hrv-unit">ms</span>
            </div>
            <div className="hrv-sub">
              {rec.hrv.weeklyAvg ? `Weekly avg ${rec.hrv.weeklyAvg}ms · ` : ""}Baseline {rec.hrv.low}–{rec.hrv.high}ms
            </div>
          </div>
          <span className={`status-pill ${hrvPill}`}>{hrvStatus}</span>
        </div>
        {rec.hrvWeek?.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <ResponsiveContainer width="100%" height={60}>
              <AreaChart data={rec.hrvWeek} margin={{ top: 4, right: 0, bottom: 0, left: -28 }}>
                <defs>
                  <linearGradient id="hg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.accent} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={C.accent} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <ReferenceLine y={rec.hrv.low} stroke="#2a2a2a" strokeDasharray="3 3" />
                <ReferenceLine y={rec.hrv.high} stroke="#2a2a2a" strokeDasharray="3 3" />
                <Area type="monotone" dataKey="v" stroke={C.accent} strokeWidth={1.5} fill="url(#hg)" dot={{ fill: C.accent, r: 2.5, strokeWidth: 0 }} />
                <XAxis dataKey="d" tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[40, 95]} hide />
                <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #333", fontSize: 12 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="recovery-bottom" style={{ marginTop: 10 }}>
        {[
          { label: "READINESS", value: rec.readiness ?? "—", unit: rec.readiness ? "/100" : "", color: C.accent },
          { label: "RESTING HR", value: rec.rhr ?? "—", unit: rec.rhr ? "bpm" : "", color: C.white },
          { label: "SLEEP", value: rec.sleep ?? "—", unit: rec.sleep ? "/100" : "", color: C.white },
        ].map((m, i) => (
          <div key={i} className="metric-card">
            <div className="mc-label">{m.label}</div>
            <div className="mc-big" style={{ color: m.color }}>{m.value}<span className="mc-unit">{m.unit}</span></div>
          </div>
        ))}
      </div>

      <div className="metric-card" style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div className="mc-label">BODY BATTERY</div>
          <div className="mc-big">{rec.battery ?? "—"}<span className="mc-unit">{rec.battery ? "/100" : ""}</span></div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="mc-label">VO₂ MAX</div>
          <div className="mc-big" style={{ color: C.green }}>{rec.vo2 ?? "—"}</div>
        </div>
      </div>

      {/* STRAVA LIVE VOLUME */}
      <div className="section-label mt20">VOLUME — LIVE FROM STRAVA</div>
      {statsLoading && <Loader text="Pulling volume totals…" />}
      {stravaStats && !statsLoading && (
        <div className="recovery-bottom">
          <div className="metric-card">
            <div className="mc-label">LAST 4 WEEKS</div>
            <div className="mc-big">{stravaStats.recent_distance_km ?? "—"}<span className="mc-unit">km</span></div>
            <div className="mc-sub">{stravaStats.recent_runs_count ?? "—"} runs</div>
          </div>
          <div className="metric-card">
            <div className="mc-label">YTD DISTANCE</div>
            <div className="mc-big">{stravaStats.ytd_distance_km ?? "—"}<span className="mc-unit">km</span></div>
            <div className="mc-sub">{stravaStats.ytd_runs ?? "—"} runs</div>
          </div>
          <div className="metric-card">
            <div className="mc-label">TO RACE</div>
            <div className="mc-big" style={{ color: C.accent }}>{days}<span className="mc-unit">days</span></div>
            <div className="mc-sub">Wk {planWeek.w}/14</div>
          </div>
        </div>
      )}

      {/* STATION PROGRESS */}
      <div className="section-label mt20">STATION PROGRESS — PATH TO {primaryGoal.primary?.toUpperCase()}</div>
      {stations.map((s) => {
        const pct = progressPct(s.best, s.blr, s.target);
        return (
          <div key={s.key} className="progress-card">
            <div className="pc-head">
              <div className="pc-name">{s.name}</div>
              <div className="pc-pct" style={{ color: s.color }}>{Math.round(pct)}% to target</div>
            </div>
            <div className="pc-meta">
              {[
                { label: "RACE PB", val: s.blr, color: "#aaa" },
                { label: "BEST NOW", val: s.best, color: s.color },
                { label: "TARGET", val: s.target, color: C.green },
              ].map((x, i) => (
                <div key={i}>
                  <div className="pc-stat-label">{x.label}</div>
                  <div className="pc-stat-val" style={{ color: x.color }}>{x.val}</div>
                </div>
              ))}
            </div>
            <div className="pc-track">
              <div className="pc-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${s.color}88, ${s.color})` }} />
            </div>
            <div className="pc-labels"><span>{s.blr}</span><span style={{ color: s.color }}>{s.target}</span></div>
            <div className="mc-sub" style={{ marginTop: 8 }}>{s.note}</div>
          </div>
        );
      })}
    </div>
  );
}
