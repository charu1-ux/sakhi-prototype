// Data + timing for the Sehat Saathi "Saans aur sukoon" breathe-and-calm chat
// story (auto-playing conversation prototype). Pure data — no JSX — shared by
// the orchestrator and the presentational widgets. Mirrors ../nuskha and the
// JioMart reference (../../commerce/jiomart).

export type ClarifyOption = { id: string; label: string };

// ── Clarifying questions (scripted) ──────────────────────────────────────────────

export const CLARIFY_MOOD: ClarifyOption[] = [
  { id: "stress", label: "तनाव" },
  { id: "anxious", label: "घबराहट" },
  { id: "sleep", label: "नींद नहीं आ रही" },
  { id: "sad", label: "उदासी" },
];

export const CLARIFY_TIME: ClarifyOption[] = [
  { id: "2", label: "2 मिनट" },
  { id: "5", label: "5 मिनट" },
  { id: "more", label: "थोड़ा ज़्यादा" },
];

// ── The recommended exercise ──────────────────────────────────────────────────────

export const EXERCISE = {
  title: "बॉक्स ब्रीदिंग",
  meta: "4 चरण · 5 मिनट",
  social: "घबराहट में तुरंत सुकून देता है",
};

// One round of box breathing — equal counts in / hold / out / hold.
export type BreathPhase = {
  key: "in" | "hold1" | "out" | "hold2";
  label: string;
  durationMs: number;
  scale: number;
};

export const BREATH_PHASES: BreathPhase[] = [
  { key: "in", label: "साँस लो", durationMs: 4000, scale: 1.45 },
  { key: "hold1", label: "रोको", durationMs: 4000, scale: 1.45 },
  { key: "out", label: "छोड़ो", durationMs: 4000, scale: 0.72 },
  { key: "hold2", label: "रोको", durationMs: 4000, scale: 0.72 },
];

export const TOTAL_CYCLES = 4;

export const FINISH = {
  headline: "बहुत अच्छा, सुनीता 🌙",
  body: "आपने पूरा अभ्यास किया। मन थोड़ा हल्का लगे तो दिन में जब भी घबराहट हो, यही दोहरा सकती हैं।",
};

export const FEELINGS: { id: string; label: string; icon: "smile" | "meh" | "frown" }[] = [
  { id: "calm", label: "शांत लग रहा", icon: "smile" },
  { id: "better", label: "थोड़ा बेहतर", icon: "meh" },
  { id: "still", label: "अभी भी बेचैन", icon: "frown" },
];

// ── Timeline pacing (ms) ──────────────────────────────────────────────────────────

export const TIMING = {
  initial: 500,
  beat: 2000,
  clarifyBeat: 1500,
  searchHold: 2000,
  loaderHold: 2200,
};

// Actions emitted by gated buttons inside widgets.
export type StoryAction = "clarify-mood" | "clarify-time" | "start-breath" | "finish";
