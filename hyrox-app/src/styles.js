import { C } from "./config.js";

export const CSS = `
* { box-sizing: border-box; margin: 0; padding: 0; }
body, #root { background: ${C.bg}; }
@media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }

.app {
  font-family: 'DM Sans', sans-serif;
  background: ${C.bg};
  color: ${C.white};
  min-height: 100vh;
  max-width: 720px;
  margin: 0 auto;
  padding-bottom: 90px;
  position: relative;
}

/* ── HEADER ── */
.header { padding: 24px 20px 16px; border-bottom: 1px solid ${C.border}; }
.header-top { display: flex; align-items: flex-end; gap: 16px; margin-bottom: 14px; }
.days-number { font-family: 'Bebas Neue', sans-serif; font-size: 80px; line-height: 0.85; color: ${C.accent}; letter-spacing: -2px; }
.days-right { padding-bottom: 6px; flex: 1; }
.days-to { font-family: 'Bebas Neue', sans-serif; font-size: 20px; letter-spacing: 2px; color: ${C.white}; line-height: 1.1; }
.days-city { font-family: 'Bebas Neue', sans-serif; font-size: 13px; letter-spacing: 4px; color: ${C.muted}; }
.header-badges { display: flex; gap: 7px; flex-wrap: wrap; margin-bottom: 12px; }
.badge { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 1.3px; padding: 4px 9px; border-radius: 3px; }
.badge-phase { background: #1a0a05; color: ${C.accent}; border: 1px solid ${C.accentDim}; }
.badge-goal { background: #141414; color: ${C.white}; border: 1px solid #333; }
.badge-stretch { background: #141414; color: ${C.amber}; border: 1px solid #3a2e00; }
.badge-pb { background: #141414; color: ${C.muted}; border: 1px solid #2a2a2a; }
.plan-bar-outer { height: 3px; background: ${C.border}; border-radius: 2px; overflow: hidden; }
.plan-bar-inner { height: 100%; background: linear-gradient(90deg, ${C.accent}, ${C.amber}); border-radius: 2px; transition: width 0.6s ease; }
.plan-bar-labels { display: flex; justify-content: space-between; margin-top: 5px; font-size: 10px; color: ${C.muted}; font-family: 'Barlow Condensed', sans-serif; letter-spacing: 0.5px; }

/* ── BOTTOM NAV ── */
.bottom-nav {
  position: fixed; bottom: 0; left: 50%; transform: translateX(-50%);
  width: 100%; max-width: 720px; display: flex; background: rgba(10,10,10,0.94);
  backdrop-filter: blur(12px); border-top: 1px solid ${C.border}; z-index: 50;
}
.nav-btn {
  flex: 1; background: none; border: none; padding: 10px 0 12px; cursor: pointer;
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  color: ${C.mutedDark}; transition: color 0.15s;
}
.nav-btn.active { color: ${C.accent}; }
.nav-icon { font-size: 19px; line-height: 1; }
.nav-label { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 1px; }

.panel { padding: 18px 20px; animation: fade 0.35s ease; }
@keyframes fade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }

.section-label { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 2px; color: ${C.muted}; margin-bottom: 10px; }
.mt20 { margin-top: 20px; } .mt14 { margin-top: 14px; }

.card { background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 10px; padding: 16px; }
.card + .card { margin-top: 10px; }

/* ── BUTTONS ── */
.btn {
  font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 1.2px;
  color: ${C.white}; background: ${C.surface2}; border: 1px solid #333; border-radius: 7px;
  padding: 11px 18px; cursor: pointer; transition: all 0.15s;
}
.btn:hover { border-color: ${C.accent}; color: ${C.accent}; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-primary { background: ${C.accent}; color: #fff; border-color: ${C.accent}; }
.btn-primary:hover { background: ${C.accentGlow}; color: #fff; border-color: ${C.accentGlow}; }
.btn-full { width: 100%; }
.btn-sm { padding: 7px 12px; font-size: 12px; }

/* ── ANALYZER ── */
.activity-row {
  background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 9px;
  padding: 13px 15px; margin-bottom: 8px; cursor: pointer; transition: all 0.15s;
  display: flex; align-items: center; gap: 13px;
}
.activity-row:hover { border-color: ${C.borderLight}; background: ${C.surface2}; }
.activity-row.selected { border-color: ${C.accent}; }
.act-icon { font-size: 20px; width: 26px; text-align: center; flex-shrink: 0; }
.act-main { flex: 1; min-width: 0; }
.act-name { font-family: 'Barlow Condensed', sans-serif; font-size: 15px; font-weight: 600; color: ${C.white}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.act-meta { font-size: 11px; color: ${C.muted}; margin-top: 2px; }
.act-right { text-align: right; flex-shrink: 0; }
.act-pace { font-family: 'Bebas Neue', sans-serif; font-size: 20px; color: ${C.white}; letter-spacing: 0.5px; }
.act-date { font-size: 10px; color: ${C.mutedDark}; }

.analysis-card { background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 12px; padding: 18px; margin-top: 14px; }
.an-verdict { font-family: 'Barlow Condensed', sans-serif; font-size: 19px; font-weight: 700; color: ${C.white}; line-height: 1.25; margin-bottom: 6px; }
.an-tied { display: inline-block; font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 0.8px; color: ${C.accent}; background: #1a0a05; border: 1px solid ${C.accentDim}; padding: 3px 9px; border-radius: 4px; margin-bottom: 14px; }
.an-metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 16px; }
.an-metric { background: ${C.surface2}; border-radius: 7px; padding: 10px; text-align: center; }
.an-m-val { font-family: 'Bebas Neue', sans-serif; font-size: 22px; line-height: 1; letter-spacing: -0.5px; }
.an-m-label { font-size: 9px; color: ${C.muted}; letter-spacing: 0.5px; margin-top: 4px; font-family: 'Barlow Condensed', sans-serif; font-weight: 600; }

.an-block { margin-top: 14px; }
.an-block-title { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 1.5px; color: ${C.muted}; margin-bottom: 8px; }
.an-text { font-size: 13px; color: #bbb; line-height: 1.55; }

.splits-table { width: 100%; border-collapse: collapse; }
.splits-table th { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 0.8px; color: ${C.muted}; text-align: left; padding: 5px 6px; border-bottom: 1px solid ${C.border}; }
.splits-table td { font-size: 12px; padding: 6px 6px; border-bottom: 1px solid #181818; color: #ccc; }
.splits-table td:first-child { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; color: ${C.muted}; }

.flag-row { display: flex; align-items: flex-start; gap: 9px; padding: 8px 0; border-bottom: 1px solid #181818; }
.flag-row:last-child { border-bottom: none; }
.flag-dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 5px; flex-shrink: 0; }
.flag-area { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 700; color: ${C.white}; }
.flag-note { font-size: 12px; color: ${C.muted}; margin-top: 1px; }

.action-item { display: flex; gap: 9px; padding: 7px 0; font-size: 13px; color: #ccc; line-height: 1.5; }
.action-num { font-family: 'Bebas Neue', sans-serif; color: ${C.accent}; font-size: 16px; flex-shrink: 0; }

/* ── GOALS ── */
.goal-card { background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 12px; padding: 0; margin-bottom: 12px; overflow: hidden; }
.goal-head { padding: 16px; border-left: 3px solid; display: flex; justify-content: space-between; align-items: flex-start; }
.goal-title { font-family: 'Barlow Condensed', sans-serif; font-size: 18px; font-weight: 700; color: ${C.white}; line-height: 1.15; }
.goal-date { font-size: 12px; color: ${C.muted}; margin-top: 3px; }
.goal-countdown { text-align: right; flex-shrink: 0; }
.goal-cd-num { font-family: 'Bebas Neue', sans-serif; font-size: 38px; line-height: 0.9; letter-spacing: -1px; }
.goal-cd-label { font-size: 9px; color: ${C.muted}; letter-spacing: 1px; font-family: 'Barlow Condensed', sans-serif; }
.goal-targets { display: flex; gap: 8px; padding: 0 16px 14px; flex-wrap: wrap; }
.goal-tag { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.8px; padding: 4px 10px; border-radius: 4px; }
.goal-notes { font-size: 12px; color: ${C.muted}; line-height: 1.5; padding: 0 16px 14px; }
.goal-expand { padding: 0 16px 16px; }

.station-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 7px; }
.station-chip { background: ${C.surface2}; border-radius: 7px; padding: 9px 11px; }
.sc-top { display: flex; justify-content: space-between; align-items: baseline; }
.sc-name2 { font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 700; color: ${C.white}; }
.sc-pri { font-size: 8px; font-weight: 700; letter-spacing: 0.5px; padding: 1px 5px; border-radius: 3px; font-family: 'Barlow Condensed', sans-serif; }
.sc-times { display: flex; gap: 6px; align-items: baseline; margin-top: 5px; font-size: 11px; }
.sc-blr { color: ${C.muted}; text-decoration: line-through; }
.sc-arrow { color: ${C.mutedDark}; }
.sc-tgt { color: ${C.green}; font-weight: 600; }

.run-target-row { display: flex; align-items: center; gap: 10px; padding: 7px 0; border-bottom: 1px solid #181818; }
.run-target-row:last-child { border-bottom: none; }
.rt-seg { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; color: ${C.accent}; font-size: 13px; width: 52px; }
.rt-pace { font-family: 'Bebas Neue', sans-serif; font-size: 18px; color: ${C.white}; width: 70px; }
.rt-note { font-size: 12px; color: ${C.muted}; flex: 1; }

/* ── PLAN ── */
.phase-strip { display: flex; gap: 4px; margin-bottom: 16px; }
.phase-seg { flex: 1; border-radius: 4px; padding: 8px 6px; text-align: center; border: 1px solid ${C.border}; }
.phase-seg-name { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 0.5px; }
.phase-seg-wk { font-size: 9px; color: ${C.muted}; margin-top: 2px; }

.week-row {
  display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 9px;
  background: ${C.surface}; border: 1px solid ${C.border}; margin-bottom: 7px; cursor: pointer; transition: all 0.15s;
}
.week-row:hover { border-color: ${C.borderLight}; }
.week-row.current { border-color: ${C.accent}; background: #120a06; }
.week-row.done { opacity: 0.55; }
.week-num { font-family: 'Bebas Neue', sans-serif; font-size: 30px; line-height: 0.85; letter-spacing: -1px; width: 38px; text-align: center; flex-shrink: 0; }
.week-info { flex: 1; min-width: 0; }
.week-focus { font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 600; color: ${C.white}; }
.week-meta { font-size: 11px; color: ${C.muted}; margin-top: 2px; }
.week-phase-tag { font-family: 'Barlow Condensed', sans-serif; font-size: 9px; font-weight: 700; letter-spacing: 0.8px; padding: 2px 7px; border-radius: 3px; flex-shrink: 0; }
.week-detail { margin-top: 7px; padding: 12px 14px; background: ${C.surface2}; border-radius: 9px; }
.session-pill { display: inline-block; font-size: 11px; color: #bbb; background: ${C.surface3}; border: 1px solid ${C.border}; border-radius: 5px; padding: 4px 9px; margin: 3px 3px 0 0; }

/* ── CHAT ── */
.chat-wrap { display: flex; flex-direction: column; height: calc(100vh - 230px); min-height: 380px; }
.chat-scroll { flex: 1; overflow-y: auto; padding: 4px 2px; }
.msg { margin-bottom: 12px; display: flex; }
.msg.user { justify-content: flex-end; }
.msg-bubble { max-width: 82%; padding: 11px 14px; border-radius: 13px; font-size: 13.5px; line-height: 1.5; white-space: pre-wrap; }
.msg.user .msg-bubble { background: ${C.accent}; color: #fff; border-bottom-right-radius: 4px; }
.msg.assistant .msg-bubble { background: ${C.surface2}; color: #e0e0e0; border: 1px solid ${C.border}; border-bottom-left-radius: 4px; }
.msg-data-badge { font-size: 9px; color: ${C.green}; font-family: 'Barlow Condensed', sans-serif; letter-spacing: 0.5px; margin-top: 5px; }
.chat-suggest { display: flex; gap: 7px; flex-wrap: wrap; margin-bottom: 10px; }
.suggest-chip { font-size: 11px; color: ${C.muted}; background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 14px; padding: 6px 12px; cursor: pointer; transition: all 0.15s; font-family: 'DM Sans', sans-serif; }
.suggest-chip:hover { border-color: ${C.accent}; color: ${C.accent}; }
.chat-input-row { display: flex; gap: 8px; padding-top: 10px; border-top: 1px solid ${C.border}; }
.chat-input { flex: 1; background: ${C.surface2}; border: 1px solid ${C.border}; border-radius: 9px; padding: 11px 13px; color: ${C.white}; font-family: 'DM Sans', sans-serif; font-size: 13.5px; resize: none; outline: none; }
.chat-input:focus { border-color: ${C.accent}; }

/* ── DASHBOARD METRICS ── */
.recovery-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
.hrv-card { grid-column: 1 / -1; background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 10px; padding: 16px; }
.hrv-top { display: flex; justify-content: space-between; align-items: flex-start; }
.mc-label { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 1.3px; color: ${C.muted}; margin-bottom: 7px; }
.hrv-num { font-family: 'Bebas Neue', sans-serif; font-size: 50px; color: ${C.accent}; line-height: 0.9; letter-spacing: -1px; }
.hrv-unit { font-family: 'Barlow Condensed', sans-serif; font-size: 15px; color: ${C.muted}; margin-left: 4px; }
.hrv-sub { font-size: 11px; color: ${C.muted}; margin-top: 5px; }
.status-pill { display: inline-block; font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 1.2px; padding: 3px 9px; border-radius: 3px; }
.pill-green { background: #0a2416; color: ${C.green}; border: 1px solid #0f3a22; }
.pill-orange { background: #1a0a05; color: ${C.accent}; border: 1px solid ${C.accentDim}; }
.pill-amber { background: #1a1200; color: ${C.amber}; border: 1px solid #3a2e00; }
.pill-muted { background: #141414; color: ${C.muted}; border: 1px solid #2a2a2a; }
.metric-card { background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 10px; padding: 14px; }
.mc-big { font-family: 'Bebas Neue', sans-serif; font-size: 40px; line-height: 0.9; letter-spacing: -1px; }
.mc-unit { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; color: ${C.muted}; margin-left: 3px; }
.mc-sub { font-size: 11px; color: ${C.muted}; margin-top: 5px; }
.recovery-bottom { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }

.sync-banner { background: #0d0500; border: 1px solid ${C.accentDim}; border-radius: 10px; padding: 13px 15px; display: flex; gap: 11px; align-items: center; margin-bottom: 14px; }
.sync-text { font-size: 12px; color: #aaa; line-height: 1.4; flex: 1; }
.sync-title { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 1px; color: ${C.accent}; margin-bottom: 2px; }

.progress-card { background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 10px; padding: 16px; margin-bottom: 10px; }
.pc-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.pc-name { font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 1.5px; color: ${C.muted}; }
.pc-pct { font-family: 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: 0.5px; }
.pc-meta { display: flex; gap: 18px; margin-bottom: 12px; }
.pc-stat-label { font-size: 9px; color: ${C.muted}; letter-spacing: 0.5px; margin-bottom: 3px; font-family: 'Barlow Condensed', sans-serif; }
.pc-stat-val { font-family: 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: -0.5px; line-height: 1; }
.pc-track { height: 6px; background: ${C.border}; border-radius: 3px; overflow: hidden; }
.pc-fill { height: 100%; border-radius: 3px; transition: width 0.8s ease; }
.pc-labels { display: flex; justify-content: space-between; font-size: 10px; color: ${C.muted}; margin-top: 5px; }

/* ── LOADER ── */
.loader { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; gap: 14px; }
.spinner { width: 30px; height: 30px; border: 2.5px solid ${C.border}; border-top-color: ${C.accent}; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.loader-text { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; letter-spacing: 1px; color: ${C.muted}; }
.error-box { background: #1a0808; border: 1px solid #4a1515; border-radius: 9px; padding: 13px 15px; font-size: 12px; color: #d88; line-height: 1.5; }
.empty-box { text-align: center; padding: 36px 20px; color: ${C.mutedDark}; font-size: 13px; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 100; display: flex; align-items: flex-end; justify-content: center; }
.modal { background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 14px 14px 0 0; width: 100%; max-width: 720px; padding: 20px; max-height: 88vh; overflow-y: auto; animation: slideup 0.25s ease; }
@keyframes slideup { from { transform: translateY(40px); opacity: 0; } to { transform: none; opacity: 1; } }
.input-field { width: 100%; background: ${C.surface2}; border: 1px solid ${C.border}; border-radius: 8px; padding: 11px 13px; color: ${C.white}; font-family: 'DM Sans', sans-serif; font-size: 14px; outline: none; margin-bottom: 10px; }
.input-field:focus { border-color: ${C.accent}; }
.input-label { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 1px; color: ${C.muted}; margin-bottom: 5px; display: block; }
`;
