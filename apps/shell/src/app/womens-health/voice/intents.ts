/**
 * Stage-1 intent matching — deliberately NOT full NLU.
 *
 * We do simple keyword / phrase matching against the actions the app already
 * has. Three routed intents plus two catch-alls:
 *   - period : open the Period Tracker (the "next period date" view)
 *   - mood   : open the Mood Tracker (its existing emoji-select flow)
 *   - ask    : send the spoken question into the Content Hub chat (Ask Sakhi)
 *   - none   : nothing usable was heard → caller shows a spoken apology + tap UI
 *
 * Guard: a "why / how / pain" style health question that happens to mention
 * "period" (e.g. "पीरियड में दर्द क्यों होता है") is an ASK, not a tracker open —
 * it should be answered by Sakhi, not routed to the date picker.
 */
export type VoiceIntent =
  { kind: "period" } | { kind: "mood" } | { kind: "ask"; query: string } | { kind: "none" };

// Phrases that mean "show me my period date / track my period" (Devanagari,
// Hinglish and English). These are about the DATE/TRACKING, not health info.
const PERIOD_NAV = [
  "अगला पीरियड",
  "पीरियड कब",
  "पीरियड की तारीख",
  "पीरियड की डेट",
  "पीरियड ट्रैक",
  "पीरियड लॉग",
  "माहवारी कब",
  "अगली माहवारी",
  "agla period",
  "period kab",
  "next period",
  "period date",
  "period track",
  "track period",
  "period tracker",
  "when is my period",
  "when period",
  "my period",
];

// Words that signal a mood check-in ("how I feel today"), not a health question.
const MOOD_NAV = [
  "मूड",
  "मन उदास",
  "मन नहीं लग",
  "मन भारी",
  "उदास",
  "तनाव",
  "चिड़चिड़",
  "अकेला",
  "अकेली",
  "रोना",
  "mood",
  "udaas",
  "tanav",
  "mann udaas",
  "mann nahi",
  "sad",
  "stress",
  "irritable",
  "lonely",
  "feeling low",
  "low mood",
  "mood kharab",
  "mood theek nahi",
];

// If any of these appear it is a QUESTION for Sakhi, even if a tracker word is
// also present — route to the chat instead of opening a tracker.
const QUESTION_MARKERS = [
  "क्यों",
  "क्यूँ",
  "kyun",
  "kyu",
  "why",
  "कैसे",
  "kaise",
  "how",
  "दर्द",
  "pain",
  "इलाज",
  "ilaj",
  "उपाय",
  "upay",
  "remedy",
  "कारण",
  "reason",
  "लक्षण",
  "symptom",
  "क्या करूँ",
  "क्या करू",
  "kya karu",
  "kya karun",
  "मतलब",
  "matlab",
  "जानकारी",
];

function normalize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

const hasAny = (text: string, list: string[]) => list.some((p) => text.includes(p));

export function matchIntent(raw: string): VoiceIntent {
  const text = normalize(raw);
  if (text.length < 2) return { kind: "none" };

  const isQuestion = hasAny(text, QUESTION_MARKERS);

  // Tracker opens only when it is NOT phrased as a health question.
  if (!isQuestion && hasAny(text, PERIOD_NAV)) return { kind: "period" };
  if (!isQuestion && hasAny(text, MOOD_NAV)) return { kind: "mood" };

  // Anything else with real content goes to Sakhi as a question.
  return { kind: "ask", query: raw.trim() };
}
