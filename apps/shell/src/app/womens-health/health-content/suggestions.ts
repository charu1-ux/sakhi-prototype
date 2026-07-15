// ─── Personalised content-hub suggestions ────────────────────────────────────
//
// The content hub shows four tappable question "pills" before the woman has
// asked anything. This module decides WHICH four — and refreshes them each time
// she returns, so they keep suiting her life stage, her interests, and where she
// is in her cycle right now.
//
// WHAT DRIVES THE PICK
//   1. Profile  — her life stage (age band) and self-chosen interests.
//                 In the real product these come from the backend account.
//                 Here they are mocked (see `loadProfile`) so the prototype is
//                 demoable, and so the PRD has a concrete shape to point at.
//   2. Signals  — the real, on-device data we already keep:
//                   • cycle phase, from `sakhi_period` (Period Tracker)
//                   • recent mood, from `sakhi_mood_log` (Mood Tracker)
//   3. Rotation — a per-visit seed so the four pills change on each return
//                 instead of showing the same set every time.
//
// TRUST NOTE: we never *claim* to know her age or mood in the UI ("no detection
// claims"). The signals only tilt which vetted questions surface. Every question
// in the pool is a safe, in-scope women's-health topic Sakhi can already answer.

export type AgeBand = "teen" | "twenties" | "thirties" | "forties" | "menopause";
export type Topic =
  "periods" | "fertility" | "pregnancy" | "hormones" | "mental-wellbeing" | "nutrition" | "general";
export type Phase = "menstrual" | "follicular" | "ovulation" | "luteal";

export type HealthProfile = {
  ageBand: AgeBand;
  // Interests she has opted into. Empty = no preference (everything is fair game).
  interests: Topic[];
};

export type Suggestion = {
  id: string;
  hi: string;
  en: string;
  // Life stages this question suits. Empty = suits everyone.
  ageBands: AgeBand[];
  // Interest tags — used to match declared interests.
  topics: Topic[];
  // Cycle phases where this question is extra relevant (optional).
  phases?: Phase[];
  // Surface this when recent mood has been low (optional).
  moodSensitive?: boolean;
};

// ── The vetted pool ───────────────────────────────────────────────────────────
// Every entry maps to a topic Sakhi already answers. Keep English simple
// (~8th-standard), no idioms.

export const SUGGESTION_POOL: Suggestion[] = [
  // Teen / first years of periods
  {
    id: "menarche-normal",
    hi: "पहली बार पीरियड कब आना सामान्य है?",
    en: "When is it normal to get your first period?",
    ageBands: ["teen"],
    topics: ["periods"],
  },
  {
    id: "irregular-early-years",
    hi: "शुरुआती सालों में पीरियड अनियमित क्यों होते हैं?",
    en: "Why are periods irregular in the early years?",
    ageBands: ["teen", "twenties"],
    topics: ["periods", "hormones"],
  },
  // Painful / heavy periods (broad)
  {
    id: "painful-periods",
    hi: "पीरियड में बहुत दर्द — क्या यह सामान्य है?",
    en: "Very painful periods — is this normal?",
    ageBands: ["teen", "twenties", "thirties"],
    topics: ["periods"],
    phases: ["menstrual"],
  },
  {
    id: "heavy-bleeding",
    hi: "पीरियड में बहुत ज़्यादा खून आना — कब चिंता करें?",
    en: "Very heavy periods — when should you worry?",
    ageBands: ["thirties", "forties"],
    topics: ["periods"],
    phases: ["menstrual"],
  },
  {
    id: "irregular-periods",
    hi: "अनियमित पीरियड क्यों होते हैं?",
    en: "Why do irregular periods happen?",
    ageBands: ["twenties", "thirties", "forties"],
    topics: ["periods", "hormones"],
  },
  // Cramps / relief — menstrual phase
  {
    id: "cramp-relief",
    hi: "पीरियड के दर्द में घर पर क्या राहत दे सकता है?",
    en: "What can ease period pain at home?",
    ageBands: [],
    topics: ["periods", "general"],
    phases: ["menstrual"],
  },
  // Anaemia / nutrition
  {
    id: "anaemia-symptoms",
    hi: "खून की कमी के लक्षण क्या हैं?",
    en: "What are the symptoms of anaemia?",
    ageBands: [],
    topics: ["nutrition", "general"],
  },
  {
    id: "iron-foods",
    hi: "खून बढ़ाने के लिए कौन से आहार अच्छे हैं?",
    en: "Which foods help build iron in the blood?",
    ageBands: [],
    topics: ["nutrition"],
    phases: ["menstrual", "follicular"],
  },
  // PCOS / hormones
  {
    id: "pcos-basics",
    hi: "PCOS क्या होता है?",
    en: "What is PCOS?",
    ageBands: ["twenties", "thirties"],
    topics: ["hormones", "periods"],
  },
  {
    id: "pms-mood",
    hi: "पीरियड से पहले मूड क्यों बदलता है?",
    en: "Why does mood change before a period?",
    ageBands: ["twenties", "thirties", "forties"],
    topics: ["mental-wellbeing", "hormones"],
    phases: ["luteal"],
    moodSensitive: true,
  },
  // Mental wellbeing
  {
    id: "stress-calm",
    hi: "तनाव कम करने के आसान तरीके क्या हैं?",
    en: "What are simple ways to lower stress?",
    ageBands: [],
    topics: ["mental-wellbeing"],
    moodSensitive: true,
  },
  {
    id: "low-mood-help",
    hi: "मन उदास रहे तो क्या करें?",
    en: "What can help when you feel low?",
    ageBands: [],
    topics: ["mental-wellbeing"],
    moodSensitive: true,
  },
  // Fertility / ovulation
  {
    id: "fertile-days",
    hi: "गर्भधारण के लिए सबसे अच्छे दिन कौन से हैं?",
    en: "Which days are best for getting pregnant?",
    ageBands: ["twenties", "thirties"],
    topics: ["fertility"],
    phases: ["ovulation", "follicular"],
  },
  {
    id: "conceive-tips",
    hi: "गर्भधारण की कोशिश में क्या ध्यान रखें?",
    en: "What should you keep in mind when trying to conceive?",
    ageBands: ["twenties", "thirties"],
    topics: ["fertility", "pregnancy"],
    phases: ["ovulation"],
  },
  // Pregnancy / postpartum
  {
    id: "postpartum-mood",
    hi: "डिलीवरी के बाद मन उदास रहना — कब सामान्य है?",
    en: "Feeling low after delivery — when is it normal?",
    ageBands: ["twenties", "thirties"],
    topics: ["pregnancy", "mental-wellbeing"],
    moodSensitive: true,
  },
  // Contraception
  {
    id: "contraception-options",
    hi: "गर्भ रोकने के सुरक्षित तरीके कौन से हैं?",
    en: "What are the safe ways to prevent pregnancy?",
    ageBands: ["twenties", "thirties", "forties"],
    topics: ["general", "fertility"],
  },
  // Perimenopause / forties
  {
    id: "perimenopause-signs",
    hi: "40 के बाद पीरियड में बदलाव क्यों आते हैं?",
    en: "Why do periods change after the age of 40?",
    ageBands: ["forties", "menopause"],
    topics: ["hormones", "periods"],
  },
  {
    id: "breast-check",
    hi: "स्तन की जांच खुद कैसे करें?",
    en: "How can you check your breasts yourself?",
    ageBands: ["thirties", "forties", "menopause"],
    topics: ["general"],
  },
  // Menopause
  {
    id: "menopause-symptoms",
    hi: "मेनोपॉज़ के लक्षण क्या होते हैं?",
    en: "What are the symptoms of menopause?",
    ageBands: ["forties", "menopause"],
    topics: ["hormones"],
  },
  {
    id: "menopause-sleep",
    hi: "मेनोपॉज़ में नींद न आए तो क्या करें?",
    en: "What helps with sleep trouble during menopause?",
    ageBands: ["menopause"],
    topics: ["hormones", "mental-wellbeing"],
    moodSensitive: true,
  },
];

// ── Profile (backend-provided in the real product) ────────────────────────────

const PROFILE_KEY = "sakhi_profile";

// Sensible default so the hub works before any profile exists. The real product
// replaces this with the woman's account data from the backend.
const DEFAULT_PROFILE: HealthProfile = { ageBand: "twenties", interests: [] };

export function loadProfile(): HealthProfile {
  try {
    if (typeof window === "undefined") return DEFAULT_PROFILE;
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    const p = JSON.parse(raw) as Partial<HealthProfile>;
    return {
      ageBand: p.ageBand ?? DEFAULT_PROFILE.ageBand,
      interests: Array.isArray(p.interests) ? p.interests : [],
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

// ── Real on-device signals ────────────────────────────────────────────────────

function loadPhase(): Phase | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem("sakhi_period");
    if (!raw) return null;
    const { lastPeriod, cycleLength } = JSON.parse(raw) as {
      lastPeriod: string;
      cycleLength: number;
    };
    const ms = new Date(lastPeriod).getTime();
    if (Number.isNaN(ms) || !cycleLength) return null;
    // Day within the cycle (1..cycleLength), matching Period/Mood trackers.
    const diff = Math.floor((Date.now() - ms) / 86400000);
    const day = (((diff % cycleLength) + cycleLength) % cycleLength) + 1;
    if (day <= 5) return "menstrual";
    if (day <= cycleLength - 15) return "follicular";
    if (day <= cycleLength - 14) return "ovulation";
    return "luteal";
  } catch {
    return null;
  }
}

// True when recent mood entries lean low, so we gently surface a wellbeing pill.
function recentMoodIsLow(): boolean {
  try {
    if (typeof window === "undefined") return false;
    const raw = localStorage.getItem("sakhi_mood_log");
    const log = raw ? (JSON.parse(raw) as { mood: number }[]) : [];
    if (!Array.isArray(log) || log.length === 0) return false;
    const recent = log.slice(-5);
    const avg = recent.reduce((s, e) => s + (e.mood ?? 0), 0) / recent.length;
    // Mood scale is 1..5 (1 = lowest). Treat an average at/below 2.5 as low.
    return avg > 0 && avg <= 2.5;
  } catch {
    return false;
  }
}

// ── Rotation ──────────────────────────────────────────────────────────────────
// A visit counter that increments each return. Used as a tie-breaker seed so the
// four pills reshuffle over visits even when their scores are equal.

const VISIT_KEY = "sakhi_hub_visits";

function nextVisitSeed(): number {
  try {
    if (typeof window === "undefined") return 0;
    const n = (parseInt(localStorage.getItem(VISIT_KEY) ?? "0", 10) || 0) + 1;
    localStorage.setItem(VISIT_KEY, String(n));
    return n;
  } catch {
    return Math.floor(Math.random() * 1000);
  }
}

// Deterministic pseudo-random in [0,1) from an integer — keeps the shuffle stable
// within a single visit but different across visits.
function seeded(n: number): number {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

// ── The picker ────────────────────────────────────────────────────────────────

type PickOptions = {
  profile?: HealthProfile;
  phase?: Phase | null;
  moodLow?: boolean;
  seed?: number;
  count?: number;
  // Suggestion ids to leave out — used so each turn shows a fresh set that
  // doesn't repeat ones already offered. When the remaining pool is too small,
  // the caller resets and starts over.
  exclude?: string[];
};

// Returns `count` suggestions (default 4) tailored to profile + signals, freshly
// rotated for this visit. Injectable options make it unit-testable; by default it
// reads live state from the device.
export function pickSuggestions(opts: PickOptions = {}): Suggestion[] {
  const profile = opts.profile ?? loadProfile();
  const phase = opts.phase !== undefined ? opts.phase : loadPhase();
  const moodLow = opts.moodLow !== undefined ? opts.moodLow : recentMoodIsLow();
  const seed = opts.seed ?? nextVisitSeed();
  const count = opts.count ?? 4;
  const exclude = opts.exclude ?? [];

  const pool = SUGGESTION_POOL.filter((s) => !exclude.includes(s.id));

  const scored = pool
    .map((s) => {
      let score = 1; // base — every item is a valid choice

      // Life stage: strong match if tagged for her band; small penalty if it is
      // tagged for other bands only (still allowed, just less likely).
      if (s.ageBands.length === 0) score += 1;
      else if (s.ageBands.includes(profile.ageBand)) score += 4;
      else score -= 1;

      // Declared interests.
      if (profile.interests.length > 0) {
        if (s.topics.some((t) => profile.interests.includes(t))) score += 3;
      }

      // Cycle phase relevance.
      if (phase && s.phases?.includes(phase)) score += 3;

      // Mood: lift wellbeing-oriented items when recent mood is low.
      if (moodLow && s.moodSensitive) score += 3;

      // Per-visit jitter so ties break differently on each return.
      score += seeded(seed * 97 + hashId(s.id)) * 1.5;

      return { s, score };
    })
    .sort((a, b) => b.score - a.score);

  // Take the top items but keep topic variety — avoid four near-identical pills.
  const chosen: Suggestion[] = [];
  const usedTopics = new Set<Topic>();
  for (const { s } of scored) {
    if (chosen.length >= count) break;
    const primary = s.topics[0] ?? "general";
    // Allow a repeat topic only once we would otherwise run short.
    if (usedTopics.has(primary) && chosen.length < count - 1) continue;
    chosen.push(s);
    usedTopics.add(primary);
  }
  // Top up if variety filtering left us short.
  if (chosen.length < count) {
    for (const { s } of scored) {
      if (chosen.length >= count) break;
      if (!chosen.includes(s)) chosen.push(s);
    }
  }
  return chosen.slice(0, count);
}

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}
