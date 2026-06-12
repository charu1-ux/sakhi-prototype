// Data + timing for the Sehat Saathi "Home Remedy" chat story (auto-playing
// conversation prototype). Pure data — no JSX — shared by the orchestrator and
// the presentational widgets. Mirrors the JioMart reference (../commerce/jiomart).

export type ClarifyOption = { id: string; label: string };

export type StepIcon = "leaf" | "flame" | "cup";

export type WalkthroughStep = {
  n: number;
  title: string;
  instruction: string;
  /** Spoken line (TTS source) — voice is a visual stub in this dressing build. */
  say: string;
  icon: StepIcon;
};

// ── Clarifying questions (scripted) ──────────────────────────────────────────────

export const CLARIFY_WHERE: ClarifyOption[] = [
  { id: "front", label: "माथे के आगे" },
  { id: "back", label: "पीछे (गर्दन)" },
  { id: "side", label: "साइड में" },
  { id: "all", label: "पूरा सिर" },
];

export const CLARIFY_SINCE: ClarifyOption[] = [
  { id: "now", label: "अभी-अभी" },
  { id: "morning", label: "आज सुबह से" },
  { id: "night", label: "कल रात से" },
];

// ── The recommended remedy + its walkthrough ─────────────────────────────────────

export const REMEDY = {
  title: "तुलसी काढ़ा",
  meta: "3 कदम · 8 मिनट",
  social: "1,321 लोगों को फ़ायदा हुआ",
};

export const STEPS: WalkthroughStep[] = [
  {
    n: 1,
    title: "तुलसी पत्ते कूटो",
    instruction: "8–10 ताज़े तुलसी पत्ते तोड़कर हल्का कूट लें, ताकि रस निकले।",
    say: "आठ से दस ताज़े तुलसी पत्ते तोड़कर हल्का कूट लें, ताकि रस निकले।",
    icon: "leaf",
  },
  {
    n: 2,
    title: "पानी में उबालो",
    instruction: "एक कप पानी में तुलसी, 2 काली मिर्च और थोड़ी अदरक डालकर 5 मिनट उबालें।",
    say: "एक कप पानी में तुलसी, दो काली मिर्च और थोड़ी अदरक डालकर पाँच मिनट उबालें।",
    icon: "flame",
  },
  {
    n: 3,
    title: "गरम-गरम पियो",
    instruction: "छानकर थोड़ा शहद मिला लें और गरम-गरम पिएँ। गले और सर्दी दोनों को आराम।",
    say: "छानकर थोड़ा शहद मिला लें और गरम-गरम पिएँ। गले और सर्दी दोनों को आराम मिलेगा।",
    icon: "cup",
  },
];

export const FINISH = {
  headline: "बहुत बढ़िया, सुनीता!",
  body: "आपने तुलसी काढ़ा पूरा किया। थोड़ा आराम करें — जल्दी फ़ायदा दिखेगा।",
};

export const FEELINGS: { id: string; label: string; icon: "smile" | "meh" | "frown" }[] = [
  { id: "good", label: "आराम है", icon: "smile" },
  { id: "some", label: "थोड़ा", icon: "meh" },
  { id: "no", label: "अभी नहीं", icon: "frown" },
];

// ── Timeline pacing (ms) ──────────────────────────────────────────────────────────

export const TIMING = {
  initial: 500,
  beat: 2000,
  clarifyBeat: 1500,
  searchHold: 2000,
  loaderHold: 2000,
};

// Actions emitted by gated buttons inside widgets.
export type StoryAction = "clarify-where" | "clarify-since" | "start-walkthrough" | "finish";
