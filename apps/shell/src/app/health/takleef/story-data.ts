// Data + timing for the Sehat Saathi "Kya takleef hai?" symptom-triage chat
// story (auto-playing conversation prototype). Pure data — no JSX — shared by
// the orchestrator and the presentational widgets. Mirrors the home-remedy
// story (../nuskha) and the JioMart reference (../../commerce/jiomart).

export type ClarifyOption = { id: string; label: string };

// ── Clarifying questions (scripted) ──────────────────────────────────────────────

export const CLARIFY_DURATION: ClarifyOption[] = [
  { id: "today", label: "आज से" },
  { id: "2-3", label: "2–3 दिन से" },
  { id: "week", label: "हफ़्ते भर से" },
];

export const CLARIFY_SEVERITY: ClarifyOption[] = [
  { id: "mild", label: "हल्का है" },
  { id: "high", label: "तेज़ (101°)" },
  { id: "veryhigh", label: "बहुत तेज़" },
];

// ── Triage result (scripted) ─────────────────────────────────────────────────────

export const TRIAGE = {
  // What's most likely + the reassuring framing.
  summary:
    "2 दिन का तेज़ बुखार और बदन दर्द — अक्सर यह वायरल बुखार होता है। घबराइए मत, घर पे ध्यान रखेंगे तो आराम मिलेगा। बस कुछ बातों का ख्याल ज़रूरी है।",
  selfCare: [
    "पूरा आराम करें — शरीर को लड़ने दीजिए",
    "थोड़ा-थोड़ा पानी, ORS और सूप लेते रहें",
    "बुखार तेज़ हो तो माथे पे गीला कपड़ा रखें",
    "पैरासिटामोल ज़रूरत पड़ने पर, 6 घंटे के अंतर से",
  ],
  redFlags: [
    "बुखार 102° से ऊपर या 3 दिन से ज़्यादा",
    "साँस फूलना या सीने में दर्द",
    "बहुत कमज़ोरी, चक्कर या बेहोशी जैसा",
    "लगातार उल्टी या कुछ भी न रुकना",
  ],
};

export const CLOSE = {
  headline: "अपना ध्यान रखिए 💛",
  body: "ज़्यादातर वायरल बुखार 2–3 दिन में उतर जाता है। ऊपर बताई कोई भी बात दिखे, तो देर मत कीजिए — तुरंत डॉक्टर को दिखाइए।",
};

// ── Timeline pacing (ms) ──────────────────────────────────────────────────────────

export const TIMING = {
  initial: 500,
  beat: 2000,
  clarifyBeat: 1500,
  searchHold: 2000,
  loaderHold: 2200,
};

// Actions emitted by gated buttons inside widgets.
export type StoryAction = "clarify-duration" | "clarify-severity" | "acknowledge" | "finish";
