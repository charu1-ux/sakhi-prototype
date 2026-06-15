// Data + timing for the Sehat Saathi "Khana-paani reminder" chat story (auto-
// playing conversation prototype). The user sets up simple food + water
// reminders. Pure data — no JSX — shared by the orchestrator and the widgets.
// Mirrors ../nuskha and the JioMart reference (../../commerce/jiomart).

export type ClarifyOption = { id: string; label: string };

export type ReminderIcon = "droplet" | "sunrise" | "sun" | "moon";

export type Reminder =
  // Water: repeats every N hours (user steps the interval).
  | {
      id: string;
      icon: ReminderIcon;
      label: string;
      kind: "interval";
      intervalHours: number;
      on: boolean;
    }
  // Meals: a clock time the user can step in 15-min increments.
  | {
      id: string;
      icon: ReminderIcon;
      label: string;
      kind: "time";
      /** Minutes from midnight (e.g. 8:00 → 480). */
      minutes: number;
      on: boolean;
    };

// Interval bounds for the water reminder (hours).
export const INTERVAL_MIN = 1;
export const INTERVAL_MAX = 6;
/** Step a clock time by 15 minutes, wrapping within a day. */
export const TIME_STEP = 15;

// ── Clarifying questions (scripted) ──────────────────────────────────────────────

export const CLARIFY_WATER: ClarifyOption[] = [
  { id: "1h", label: "हर 1 घंटे" },
  { id: "2h", label: "हर 2 घंटे" },
  { id: "3h", label: "हर 3 घंटे" },
];

export const CLARIFY_MEALS: ClarifyOption[] = [
  { id: "all", label: "तीनों वक़्त" },
  { id: "two", label: "नाश्ता और रात" },
  { id: "remind", label: "बस याद दिला दो" },
];

// ── The reminders being set up (scripted defaults the user can toggle) ────────────

export const REMINDERS: Reminder[] = [
  { id: "water", icon: "droplet", label: "पानी", kind: "interval", intervalHours: 2, on: true },
  { id: "breakfast", icon: "sunrise", label: "नाश्ता", kind: "time", minutes: 8 * 60, on: true },
  {
    id: "lunch",
    icon: "sun",
    label: "दोपहर का खाना",
    kind: "time",
    minutes: 13 * 60 + 30,
    on: true,
  },
  { id: "dinner", icon: "moon", label: "रात का खाना", kind: "time", minutes: 20 * 60, on: true },
];

/** Format minutes-from-midnight as a Hindi-period clock, e.g. "सुबह 8:00". */
export function formatClock(minutes: number): string {
  const m = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const mm = (m % 60).toString().padStart(2, "0");
  const period = h < 4 ? "रात" : h < 12 ? "सुबह" : h < 16 ? "दोपहर" : h < 19 ? "शाम" : "रात";
  let hh = h % 12;
  if (hh === 0) hh = 12;
  return `${period} ${hh}:${mm}`;
}

export const FINISH = {
  headline: "हो गया, सुनीता!",
  body: "अब मैं समय पर खाना और पानी की याद दिलाती रहूँगी। चाहें तो कभी भी यहाँ से बदल सकती हैं।",
  // A sample of how the reminder will look when it pops up.
  sampleTitle: "पानी पीने का समय",
  sampleBody: "एक गिलास पानी पी लीजिए — थोड़ा-थोड़ा दिन भर।",
};

// ── Timeline pacing (ms) ──────────────────────────────────────────────────────────

export const TIMING = {
  initial: 500,
  beat: 2000,
  clarifyBeat: 1500,
  searchHold: 2000,
  loaderHold: 2000,
};

// Actions emitted by gated buttons inside widgets.
export type StoryAction = "clarify-water" | "clarify-meals" | "confirm" | "finish";
