// Data + timing for the Sehat Saathi "Khane ka dhyaan" meal-care chat story
// (auto-playing conversation prototype). Pure data — no JSX — shared by the
// orchestrator and the presentational widgets. Mirrors ../nuskha and the
// JioMart reference (../../commerce/jiomart).

export type ClarifyOption = { id: string; label: string };

export type MealIcon = "sunrise" | "sun" | "sunset" | "moon";

export type Meal = {
  id: string;
  time: string;
  icon: MealIcon;
  dish: string;
  why: string;
};

// ── Clarifying questions (scripted) ──────────────────────────────────────────────

export const CLARIFY_GOAL: ClarifyOption[] = [
  { id: "sugar", label: "शुगर" },
  { id: "bp", label: "बी.पी." },
  { id: "weight", label: "वज़न कम करना" },
  { id: "general", label: "सामान्य सेहत" },
];

export const CLARIFY_DIET: ClarifyOption[] = [
  { id: "veg", label: "शुद्ध शाकाहारी" },
  { id: "egg", label: "अंडा भी" },
  { id: "all", label: "सब कुछ" },
];

// ── The recommended day plan (scripted, sugar-friendly veg) ───────────────────────

export const PLAN = {
  title: "आज का प्लान — शुगर फ्रेंडली",
  meta: "देसी खाना · 4 वक़्त",
};

export const MEALS: Meal[] = [
  {
    id: "breakfast",
    time: "सुबह",
    icon: "sunrise",
    dish: "दलिया + छाछ",
    why: "धीरे पचता है, शुगर नहीं बढ़ती",
  },
  {
    id: "lunch",
    time: "दोपहर",
    icon: "sun",
    dish: "2 रोटी + दाल + हरी सब्ज़ी + सलाद",
    why: "फाइबर भरपूर, पेट भरा रहे",
  },
  {
    id: "snack",
    time: "शाम",
    icon: "sunset",
    dish: "भुना चना + ग्रीन टी",
    why: "भूख कंट्रोल, हल्का नाश्ता",
  },
  {
    id: "dinner",
    time: "रात",
    icon: "moon",
    dish: "1 रोटी + सब्ज़ी + सूप",
    why: "रात में हल्का खाना सबसे अच्छा",
  },
];

export const WATER_GOAL = 8;

export const FINISH = {
  headline: "बहुत बढ़िया, सुनीता!",
  body: "आज का खाना पूरा प्लान के हिसाब से। रोज़ ऐसे ही — शुगर अपने आप कंट्रोल रहेगी। 🌱",
};

export const FEELINGS: { id: string; label: string; icon: "smile" | "meh" | "frown" }[] = [
  { id: "easy", label: "आसान लगा", icon: "smile" },
  { id: "ok", label: "ठीक-ठाक", icon: "meh" },
  { id: "hard", label: "थोड़ा मुश्किल", icon: "frown" },
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
export type StoryAction = "clarify-goal" | "clarify-diet" | "start-tracker" | "finish";
