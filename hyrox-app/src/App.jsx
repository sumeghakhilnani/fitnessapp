import { useState, useEffect } from "react";
import { FONT_IMPORT, DEFAULT_GOALS, PLAN, C, currentPlanWeek } from "./config.js";
import { CSS } from "./styles.js";
import { Analyzer, Goals, PlanView, Chat, Dashboard } from "./components.jsx";
import {
  daysUntil, fmtDate, store,
  isStravaConnected, stravaAuthUrl, exchangeStravaCode, STRAVA_CLIENT_ID,
} from "./api.js";

// ─── STRAVA CONNECT GATE ────────────────────────────────────────────────────
function StravaConnect({ onConnected }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  // handle the ?code=... redirect coming back from Strava
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      setBusy(true);
      exchangeStravaCode(code)
        .then(() => {
          window.history.replaceState({}, "", window.location.origin + "/");
          onConnected();
        })
        .catch((e) => setErr(e.message))
        .finally(() => setBusy(false));
    }
  }, [onConnected]);

  if (busy) {
    return (
      <div className="loader" style={{ minHeight: "60vh" }}>
        <div className="spinner" />
        <div className="loader-text">Connecting Strava…</div>
      </div>
    );
  }

  return (
    <div style={{ padding: "60px 24px", textAlign: "center" }}>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 60, color: C.accent, lineHeight: 1, letterSpacing: -2 }}>HYROX</div>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 4, color: C.muted, marginBottom: 28 }}>TRAINER</div>
      <div style={{ fontSize: 14, color: "#bbb", lineHeight: 1.6, maxWidth: 360, margin: "0 auto 28px" }}>
        Connect your Strava to pull live sessions, run the daily analyzer, and chat with your coach.
        Your data stays between your phone, Strava, and your own server.
      </div>
      {!STRAVA_CLIENT_ID && (
        <div className="error-box" style={{ marginBottom: 18, textAlign: "left" }}>
          VITE_STRAVA_CLIENT_ID isn't set. Add it in Vercel → Settings → Environment Variables, then redeploy.
        </div>
      )}
      {err && <div className="error-box" style={{ marginBottom: 18 }}>{err}</div>}
      <a href={STRAVA_CLIENT_ID ? stravaAuthUrl() : "#"}>
        <button className="btn btn-primary" style={{ fontSize: 15, padding: "13px 28px" }} disabled={!STRAVA_CLIENT_ID}>
          CONNECT WITH STRAVA
        </button>
      </a>
    </div>
  );
}

// ─── GARMIN MANUAL ENTRY MODAL ──────────────────────────────────────────────
function GarminSyncModal({ onClose }) {
  const [f, setF] = useState(() => {
    try { return JSON.parse(localStorage.getItem("hyrox-recovery") || "{}"); } catch { return {}; }
  });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const hrv = f.hrv || {};

  const save = () => {
    const rec = {
      hrv: {
        lastNight: num(f._hrvLast), weeklyAvg: num(f._hrvAvg),
        low: num(f._hrvLow) ?? 56, high: num(f._hrvHigh) ?? 82, status: "MANUAL",
      },
      readiness: num(f._readiness), rhr: num(f._rhr), sleep: num(f._sleep),
      battery: num(f._battery), stress: f._stress || "—", vo2: num(f._vo2) ?? 43,
      syncedOn: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      hrvWeek: hrv.hrvWeek || [],
    };
    localStorage.setItem("hyrox-recovery", JSON.stringify(rec));
    onClose(true);
  };

  const Field = ({ label, k, ph }) => (
    <>
      <label className="input-label">{label}</label>
      <input className="input-field" inputMode="numeric" placeholder={ph}
        value={f[k] ?? ""} onChange={(e) => set(k, e.target.value)} />
    </>
  );

  return (
    <div className="modal-overlay" onClick={() => onClose(false)}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="section-label">GARMIN RECOVERY — ENTER FROM YOUR WATCH</div>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 14, lineHeight: 1.5 }}>
          Garmin has no public API, so pop these in from the Garmin Connect app. Takes 20 seconds; they persist on your phone.
        </div>
        <Field label="HRV LAST NIGHT (ms)" k="_hrvLast" ph="79" />
        <Field label="HRV 7-DAY AVG (ms)" k="_hrvAvg" ph="72" />
        <Field label="TRAINING READINESS (/100)" k="_readiness" ph="95" />
        <Field label="RESTING HR (bpm)" k="_rhr" ph="50" />
        <Field label="SLEEP SCORE (/100)" k="_sleep" ph="85" />
        <Field label="BODY BATTERY (/100)" k="_battery" ph="59" />
        <Field label="VO₂ MAX" k="_vo2" ph="43" />
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button className="btn btn-full" onClick={() => onClose(false)}>CANCEL</button>
          <button className="btn btn-primary btn-full" onClick={save}>SAVE</button>
        </div>
      </div>
    </div>
  );
}
const num = (v) => (v === "" || v == null || isNaN(+v) ? null : +v);

// ─── MAIN ───────────────────────────────────────────────────────────────────
export default function FitnessApp() {
  const [connected, setConnected] = useState(isStravaConnected());
  const [tab, setTab] = useState("analyze");
  const [goals, setGoals] = useState(DEFAULT_GOALS);
  const [garminOpen, setGarminOpen] = useState(false);
  const [recoveryNonce, setRecoveryNonce] = useState(0);
  const planWeek = currentPlanWeek();

  // returning from Strava OAuth?
  const hasCode = new URLSearchParams(window.location.search).get("code");

  // persist goals
  useEffect(() => {
    const r = store.get("hyrox-goals");
    if (r?.value) { try { const p = JSON.parse(r.value); if (Array.isArray(p) && p.length) setGoals(p); } catch {} }
  }, []);
  useEffect(() => { store.set("hyrox-goals", JSON.stringify(goals)); }, [goals]);

  if (!connected || hasCode) {
    return (
      <>
        <style>{FONT_IMPORT + CSS}</style>
        <div className="app">
          <StravaConnect onConnected={() => setConnected(true)} />
        </div>
      </>
    );
  }

  const primaryGoal = goals.find((g) => g.active) || goals[0];
  const days = daysUntil(primaryGoal.date);
  const planPct = (planWeek.w / PLAN.totalWeeks) * 100;

  const NAV = [
    { id: "analyze", icon: "📊", label: "ANALYZE" },
    { id: "goals", icon: "🎯", label: "GOALS" },
    { id: "chat", icon: "💬", label: "COACH" },
    { id: "dash", icon: "❤️", label: "RECOVERY" },
  ];

  return (
    <>
      <style>{FONT_IMPORT + CSS}</style>
      <div className="app">
        <header className="header">
          <div className="header-top">
            <span className="days-number">{days < 0 ? "—" : days}</span>
            <div className="days-right">
              <div className="days-to">DAYS TO</div>
              <div className="days-city">{primaryGoal.title.split("—").pop().trim().toUpperCase()}</div>
            </div>
          </div>
          <div className="header-badges">
            <span className="badge badge-phase">WK {planWeek.w} · {planWeek.phase}</span>
            <span className="badge badge-goal">GOAL {primaryGoal.primary}</span>
            {primaryGoal.stretch && <span className="badge badge-stretch">STRETCH {primaryGoal.stretch}</span>}
            {primaryGoal.pb && primaryGoal.pb !== "—" && <span className="badge badge-pb">PB {primaryGoal.pb}</span>}
          </div>
          <div className="plan-bar-outer">
            <div className="plan-bar-inner" style={{ width: `${planPct}%` }} />
          </div>
          <div className="plan-bar-labels">
            <span>WK 1 · APR 19</span>
            <span>WEEK {planWeek.w} OF {PLAN.totalWeeks}</span>
            <span>RACE · {fmtDate(primaryGoal.date).toUpperCase()}</span>
          </div>
        </header>

        {tab === "analyze" && <Analyzer goals={goals} planWeek={planWeek} />}
        {tab === "goals" && (
          <>
            <Goals goals={goals} setGoals={setGoals} />
            <div style={{ padding: "0 20px" }}><PlanView planWeek={planWeek} /></div>
          </>
        )}
        {tab === "chat" && <Chat goals={goals} planWeek={planWeek} />}
        {tab === "dash" && (
          <Dashboard key={recoveryNonce} goals={goals} planWeek={planWeek} onManualSync={() => setGarminOpen(true)} />
        )}

        {garminOpen && (
          <GarminSyncModal onClose={(saved) => { setGarminOpen(false); if (saved) setRecoveryNonce((n) => n + 1); }} />
        )}

        <nav className="bottom-nav">
          {NAV.map((n) => (
            <button key={n.id} className={`nav-btn ${tab === n.id ? "active" : ""}`} onClick={() => setTab(n.id)}>
              <span className="nav-icon">{n.icon}</span>
              <span className="nav-label">{n.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
