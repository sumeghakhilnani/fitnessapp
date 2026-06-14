
// ─── FONTS ──────────────────────────────────────────────────────────────────
export const FONT_IMPORT = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');
`;

// ─── DESIGN TOKENS ──────────────────────────────────────────────────────────
export const C = {
  bg: "#080808",
  surface: "#111111",
  surface2: "#181818",
  surface3: "#1d1d1d",
  border: "#222222",
  borderLight: "#2c2c2c",
  accent: "#E8461A",
  accentDim: "#6B1F08",
  accentGlow: "#FF5A2C",
  amber: "#F0A500",
  green: "#22C55E",
  blue: "#4A9EE0",
  purple: "#A06BE0",
  white: "#F0F0F0",
  muted: "#777777",
  mutedDark: "#555555",
  mutedLight: "#444444",
};

// ─── ATHLETE / STRAVA ───────────────────────────────────────────────────────
export const STRAVA_ATHLETE_ID = 41971171;
export const MODEL = "claude-sonnet-4-6";

// ─── DEFAULT GOALS (editable, persisted) ────────────────────────────────────
export const DEFAULT_GOALS = [
  {
    id: "hyrox-delhi",
    title: "Hyrox Open Solo — Delhi",
    date: "2026-07-26",
    type: "hyrox",
    primary: "Sub 1:50",
    stretch: "Sub 1:45",
    pb: "2:03:41",
    active: true,
    color: C.accent,
    notes: "14-week V3 plan. BBJ + Wall Balls are the big leaks. R1 restraint is the recurring race-day discipline.",
    stations: [
      { name: "Burpee Broad Jump", short: "BBJ", blr: "12:50", rank: 512, target: "8:00", priority: "CRITICAL" },
      { name: "Wall Balls", short: "WB", blr: "8:34", rank: 155, target: "6:00", priority: "HIGH" },
      { name: "Ski Erg", short: "Ski", blr: "5:58", rank: 189, target: "5:30", priority: "MAINTAIN" },
      { name: "Row", short: "Row", blr: "5:56", rank: 93, target: "5:40", priority: "MAINTAIN" },
      { name: "Sled Push", short: "Push", blr: "3:09", rank: 60, target: "3:00", priority: "STRONG" },
      { name: "Sled Pull", short: "Pull", blr: "6:01", rank: 34, target: "5:45", priority: "STRONG" },
      { name: "Farmers Carry", short: "Carry", blr: "2:26", rank: 82, target: "2:20", priority: "STRONG" },
      { name: "Sandbag Lunge", short: "Lunge", blr: "3:46", rank: 7, target: "3:40", priority: "ELITE" },
    ],
    runTargets: [
      { seg: "R1", pace: "7:00", note: "Hold back hard" },
      { seg: "R2–R3", pace: "6:55", note: "Settle into rhythm" },
      { seg: "R4–R6", pace: "6:50", note: "Race pace, controlled" },
      { seg: "R7", pace: "6:30", note: "Your natural gear" },
      { seg: "R8", pace: "all-out", note: "Empty the tank" },
    ],
  },
  {
    id: "ktm-half",
    title: "Kaveri Trail Marathon — Half",
    date: "2026-11-22",
    type: "running",
    primary: "Finish strong",
    stretch: "Sub 2:00",
    pb: "—",
    active: true,
    color: C.blue,
    notes: "~15-week build post-Delhi. August restart, peak long run ~20km+ in October, taper November.",
    stations: [],
    runTargets: [],
  },
];

// ─── PLAN STRUCTURE (V3, 14 weeks) ──────────────────────────────────────────
export const PLAN_START = new Date("2026-04-19");
export const PLAN = {
  name: "Hyrox Delhi — V3 (14 weeks)",
  goalId: "hyrox-delhi",
  totalWeeks: 14,
  phases: [
    { name: "Base + Build", weeks: "1–6", color: C.blue },
    { name: "Deload", weeks: "7", color: C.amber },
    { name: "Race Specificity", weeks: "8–12", color: C.accent },
    { name: "Taper", weeks: "13–14", color: C.green },
  ],
  weeks: [
    { w: 1, phase: "BASE", label: "Apr 19–25", focus: "Aerobic base + BBJ/WB technique", sessions: ["Easy 5km Z2", "4×800m @6:45", "Long 7km", "BBJ 3×15", "WB 3×20", "Ski 2×500m"] },
    { w: 2, phase: "BASE", label: "Apr 26 – May 2", focus: "Build base, time BBJ baseline", sessions: ["Easy 6km Z2", "5×800m @6:40", "Long 8km", "BBJ 3×20", "WB 3×25", "Ski 3×500m"] },
    { w: 3, phase: "BUILD", label: "May 3–9", focus: "First sim block", sessions: ["Tempo 5km @7:00", "Sim block A", "Long 10km", "BBJ 4×20", "WB 3×30", "Sled work"] },
    { w: 4, phase: "BUILD", label: "May 10–16", focus: "Sim B, rehab tempo added", sessions: ["Tempo 6km @6:55", "Sim block B (WB 50)", "Long 11km", "BBJ 4×25", "WB 4×25", "Hip thrusts/RDL"] },
    { w: 5, phase: "BUILD+", label: "May 17–23", focus: "First half-sim", sessions: ["Tempo 6km @6:50", "Half sim 4×1km", "Long 12km", "BBJ 5×25", "WB 100r", "Farmers"] },
    { w: 6, phase: "BUILD+", label: "May 24–30", focus: "Hardest base week", sessions: ["Tempo 6km @6:45", "Half sim (beat splits)", "Long 13km", "BBJ 5×25", "WB 100r <7:30", "Sandbag"] },
    { w: 7, phase: "DELOAD", label: "May 31 – Jun 6", focus: "40% volume cut, reset HRV", sessions: ["Easy 5km", "4×600m strides", "Easy 6km", "BBJ 2×15", "WB 2×20", "Ski/Row easy"] },
    { w: 8, phase: "SPECIFIC", label: "Jun 7–13", focus: "Phase 3 opens, practice sim", sessions: ["6×1km @6:40", "Practice sim 80%", "Easy 8km", "BBJ 80m baseline", "WB 100r <7:00", "Full stations"] },
    { w: 9, phase: "SPECIFIC", label: "Jun 14–20", focus: "First full timed sim", sessions: ["7×1km @6:25", "FULL SIM #1", "Easy 9km", "BBJ 5×25 <8:45", "WB 100r <6:45", "Race-weight sled"] },
    { w: 10, phase: "SPECIFIC", label: "Jun 21–27", focus: "Race-pace intervals + R1 restraint", sessions: ["8×1km @6:35", "Practice sim 80%", "Easy 9km", "BBJ 5×30 <8:15", "WB 100r <6:30", "Sled sim"] },
    { w: 11, phase: "SPECIFIC", label: "Jun 28 – Jul 4", focus: "Full sim #2, beat Wk9", sessions: ["8×1km @6:32", "FULL SIM #2", "Easy 10km", "BBJ 5×30 <8:00", "WB 100r <6:15", "Full circuit"] },
    { w: 12, phase: "PEAK", label: "Jul 5–11", focus: "Peak — full sim #3, film it", sessions: ["8×1km @6:30", "FULL SIM #3", "Easy 8km", "BBJ 5×30 <7:45", "WB 100r <6:00", "All stations"] },
    { w: 13, phase: "TAPER", label: "Jul 12–18", focus: "50% volume drop", sessions: ["Easy 5km", "4×1km strides", "Easy 4km", "BBJ 2×15", "WB 2×20", "Ski/Row easy"] },
    { w: 14, phase: "TAPER", label: "Jul 19–25", focus: "Arrive fresh + sharp", sessions: ["Easy 4km", "3×1km strides", "Easy 3km", "BBJ 1×10", "WB 1×15", "Rest"] },
  ],
};

// Bengaluru race baseline run splits (reference)
export const BLR_RUNS = [
  { seg: "R1", time: "8:00", rank: 495 }, { seg: "R2", time: "7:39" }, { seg: "R3", time: "7:40" },
  { seg: "R4", time: "7:39" }, { seg: "R5", time: "7:54" }, { seg: "R6", time: "7:42" },
  { seg: "R7", time: "7:20", rank: 239 }, { seg: "R8", time: "8:16" },
];

// ─── STANDING FOCUS AREAS (from skill context) ──────────────────────────────
export const FOCUS_AREAS = [
  { id: "r1", label: "R1 restraint", detail: "Going out too fast is the recurring race-day error. Beep alert below 7:00/km." },
  { id: "drift", label: "Cardiac drift", detail: "Watch HR rise across run segments at steady pace." },
  { id: "cadence", label: "Cadence", detail: "Move from ~77–78 toward 80–85 spm." },
  { id: "bbj", label: "BBJ capacity", detail: "Weakest station. Frame at 80m race distance (~53–55 reps)." },
  { id: "z2", label: "Z2 HR discipline", detail: "Hold HR ≤144 regardless of feel — pace fades while HR stays flat." },
  { id: "scap", label: "Scapular protocol", detail: "L supraspinatus tendinitis. Strengthen lower traps/serratus, avoid heavy overhead." },
];


export function currentPlanWeek(today = new Date()) {
  const diffDays = Math.floor((today - PLAN_START) / (1000 * 60 * 60 * 24));
  const wNum = Math.floor(diffDays / 7) + 1;
  const clamped = Math.max(1, Math.min(PLAN.totalWeeks, wNum));
  return PLAN.weeks.find((w) => w.w === clamped) || PLAN.weeks[0];
}
