"use client";

import { useRef, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { HubHeader } from "@/app/jobs/design-prototype/HubHeader";
import { HubChatInput } from "@/app/jobs/design-prototype/HubChatInput";
import { isBlocked, isIsolated } from "@/lib/sakhi-feature";
import {
  askSakhi,
  isBlockerResponse,
  isMaleIdentifier,
  looksLikeQuestion,
  MALE_RESPONSE,
  MALE_RESPONSE_EN,
  splitDisclaimer,
} from "@/lib/sakhi";
import { useLang } from "../LangContext";
import { consumeVoiceQuery, useVoiceTarget } from "../voice/voiceBus";
import { speak, stopSpeech } from "../voice/tts";
import { SessionPrivacyNote } from "../SessionPrivacyNote";

type SakhiTurn = { role: "user" | "assistant"; content: string };

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  gulabi: "#E8536A",
  gulabiLight: "#FDEEF0",
  gulabiMid: "#F0899A",
  raat: "#2D1B4E",
  raatMid: "#5A3E7A",
  raatLight: "#F2EDF8",
  chai: "#C4884A",
  mint: "#2AAF7A",
  mintLight: "#E5F7F0",
  sky: "#4A90D9",
  skyLight: "#EBF4FC",
  amber: "#E8A020",
  violet: "#8B5CF6",
  violetLight: "#F3EEFF",
  surface: "#FFFFFF",
  surface2: "#F9F4FF",
  chatBg: "#F2EDF8",
  textPrimary: "#1A0E2E",
  textSecondary: "#6B5580",
  textTertiary: "#9E8BB0",
  border: "rgba(45,27,78,0.09)",
};

// ─── Phase calculation from period tracker data ───────────────────────────────
type PhaseKey = "menstrual" | "follicular" | "ovulation" | "luteal";

// Plain-language phase names — no clinical jargon (8th-standard reading level)
const PHASE_LABELS: Record<
  PhaseKey,
  { name: string; nameEn: string; hint: string; hintEn: string }
> = {
  menstrual: {
    name: "पीरियड के दिन",
    nameEn: "your period days",
    hint: "आज आराम करें — आपका शरीर काम कर रहा है",
    hintEn: "Rest today — your body is working hard",
  },
  follicular: {
    name: "पीरियड के बाद वाले दिन",
    nameEn: "the days after your period",
    hint: "एनर्जी बढ़ रही है — नई शुरुआत का समय!",
    hintEn: "Energy is rising — a great time for new starts!",
  },
  ovulation: {
    name: "साइकल के बीच वाले दिन",
    nameEn: "the middle days of your cycle",
    hint: "आज आप सबसे ज़्यादा energetic हो सकती हैं",
    hintEn: "You may feel at your most energetic today",
  },
  luteal: {
    name: "पीरियड से पहले वाले दिन",
    nameEn: "the days before your period",
    hint: "मूड थोड़ा भारी हो सकता है — यह सामान्य है",
    hintEn: "Mood may feel a little heavy — this is normal",
  },
};

// Which phase a given cycle day falls in (same boundaries the app has always used)
function phaseKeyForDay(day: number, len: number): PhaseKey {
  if (day <= 5) return "menstrual";
  if (day <= len - 15) return "follicular";
  if (day <= len - 14) return "ovulation";
  return "luteal";
}

function loadPeriod(): { lastPeriodMs: number; cycleLength: number } | null {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem("sakhi_period") : null;
    if (!raw) return null;
    const { lastPeriod, cycleLength } = JSON.parse(raw);
    const ms = new Date(lastPeriod).getTime();
    if (Number.isNaN(ms) || !cycleLength) return null;
    return { lastPeriodMs: ms, cycleLength: cycleLength as number };
  } catch {
    return null;
  }
}

// Cycle day (1..len) for any date — modulo so past dates map correctly
function cycleDayForDate(dateMs: number, lastPeriodMs: number, len: number): number {
  const diff = Math.floor((dateMs - lastPeriodMs) / 86400000);
  return (((diff % len) + len) % len) + 1;
}

function loadPhase() {
  const p = loadPeriod();
  if (!p) return null;
  const day = Math.max(1, Math.ceil((Date.now() - p.lastPeriodMs) / 86400000) + 1);
  const info = PHASE_LABELS[phaseKeyForDay(day, p.cycleLength)];
  return { ...info, day, cycleLength: p.cycleLength };
}

const PHASE_DEFAULT = {
  name: "—",
  nameEn: "—",
  day: 0,
  cycleLength: 28,
  hint: "पीरियड ट्रैकर में अपनी dates डालें तो cycle दिखेगा",
  hintEn: "Add your dates in Period Tracker to see your cycle",
};

// ─── "Show my last entry on open" preference (shared with period tracker) ──────
// Off by default — safer on a shared phone. When off, the cycle-day phase banner
// stays hidden until she actually logs today (or turns this on for her own phone).
const SHOW_LAST_KEY = "sakhi_show_last_entry";
function getShowLastOnOpen(): boolean {
  try {
    return typeof window !== "undefined" && localStorage.getItem(SHOW_LAST_KEY) === "1";
  } catch {
    return false;
  }
}

// ─── Mood log persistence (private, on-device only) ────────────────────────────
type MoodLogEntry = { date: string; mood: number; chip: string | null };
const MOOD_LOG_KEY = "sakhi_mood_log";

function loadMoodLog(): MoodLogEntry[] {
  try {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(MOOD_LOG_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveMoodLog(entry: MoodLogEntry) {
  try {
    if (typeof window === "undefined") return;
    // One entry per day (latest wins) — keeps streaks and weekly counts honest
    const log = [...loadMoodLog().filter((e) => e.date !== entry.date), entry].slice(-60);
    localStorage.setItem(MOOD_LOG_KEY, JSON.stringify(log));
  } catch {
    // storage unavailable — logging is best-effort, never blocks the flow
  }
}

// Collapse to one entry per calendar day (latest), sorted oldest → newest
function dedupeByDay(entries: MoodLogEntry[]): MoodLogEntry[] {
  const byDay = new Map<string, MoodLogEntry>();
  for (const e of entries) byDay.set(e.date, e);
  return [...byDay.values()].sort((a, b) => a.date.localeCompare(b.date));
}

// ─── Mood options ─────────────────────────────────────────────────────────────
const MOODS = [
  {
    face: "😄",
    label: "बहुत अच्छा",
    labelEn: "Very Good",
    score: 5,
    validate: "बहुत बढ़िया! ऐसे अच्छे दिन को याद रखना ज़रूरी है 💜",
    validateEn: "That's wonderful! It's good to remember happy days like this 💜",
  },
  {
    face: "🙂",
    label: "अच्छा",
    labelEn: "Good",
    score: 4,
    validate: "अच्छा लग रहा है — यह सुनकर मुझे खुशी हुई 🌸",
    validateEn: "Feeling good — I'm glad to hear that 🌸",
  },
  {
    face: "😐",
    label: "ठीक है",
    labelEn: "Okay",
    score: 3,
    validate: "ठीक-ठाक दिन भी बिलकुल normal हैं — हर दिन एक जैसा नहीं होता।",
    validateEn: "'Okay' days are completely normal too — not every day feels the same.",
  },
  {
    face: "😔",
    label: "तनाव",
    labelEn: "Stressed",
    score: 2,
    validate:
      "तनाव महसूस करना बिलकुल normal है — बहुत सी महिलाएँ ऐसा महसूस करती हैं। तुम अकेली नहीं हो।",
    validateEn:
      "Feeling stressed is completely normal — many women feel this way. You are not alone.",
  },
  {
    face: "😞",
    label: "बुरा",
    labelEn: "Bad",
    score: 1,
    validate: "ऐसा महसूस करना बिलकुल ठीक है — और तुम अकेली नहीं हो। इसे बताना हिम्मत की बात है 💜",
    validateEn:
      "Feeling this way is completely okay — and you are not alone. It takes courage to share this 💜",
  },
];

// ─── Context chips (Layer 2 — optional, tap-only, never free text) ─────────────
// Acks stay validated and non-diagnostic — light acknowledgment, no medicalizing.
const CHIPS = [
  {
    id: "sleep",
    label: "नींद",
    labelEn: "Sleep",
    ack: "नींद कम होना मूड पर असर डालता है — यह सच है।",
    ackEn: "Less sleep does affect mood — that's true.",
  },
  {
    id: "work",
    label: "काम",
    labelEn: "Work",
    ack: "काम का दबाव मन पर असर डालता है — यह आम बात है।",
    ackEn: "Work pressure weighs on the mind — this is common.",
  },
  {
    id: "home",
    label: "घर",
    labelEn: "Home",
    ack: "घर की बातें मन पर असर डालती हैं — यह स्वाभाविक है।",
    ackEn: "Things at home weigh on the mind — that's natural.",
  },
  {
    id: "alone",
    label: "अकेला लग रहा है",
    labelEn: "Feeling alone",
    ack: "अकेलापन महसूस होना मुश्किल होता है — और यह भी आम है।",
    ackEn: "Feeling alone is hard — and it's more common than you think.",
  },
  {
    id: "skip",
    label: "बताना नहीं चाहती",
    labelEn: "Prefer not to say",
    ack: "कोई बात नहीं 💜",
    ackEn: "That's completely okay 💜",
  },
];

// ─── Voice/text parsing for the tap pickers (Stage-1, keyword based) ──────────
// Spoken (or typed) answers to the pickers must drive the SAME picker actions,
// otherwise they fall through to the LLM and break the on-rail flow.
function parseForWhomVoice(text: string): ForWhom | null {
  const t = text.toLowerCase();
  const other = [
    "किसी और",
    "किसी",
    "उनके",
    "उनका",
    "for someone",
    "someone else",
    "other",
    "kisi aur",
    "kisi",
    "unke",
    "unka",
    "wife",
    "biwi",
    "patni",
    "sister",
    "behen",
    "didi",
    "maa",
    "mummy",
    "beti",
    "friend",
    "saheli",
    "husband",
  ];
  const self = [
    "मेरे लिए",
    "मेरे",
    "खुद",
    "अपने",
    "अपनी",
    "for me",
    "myself",
    "self",
    "mere liye",
    "mujhe",
    "apne",
    "apni",
  ];
  if (other.some((k) => t.includes(k))) return "other";
  if (self.some((k) => t.includes(k))) return "self";
  return null;
}

function parseMoodVoice(text: string): (typeof MOODS)[number] | null {
  const t = text.toLowerCase();
  const byScore = (s: number) => MOODS.find((m) => m.score === s) ?? null;
  const neg = /(नहीं|nahi|nhi|\bnot\b|मत)/.test(t);
  // "theek nahi" / "accha nahi" / "not good" → she's not okay → stressed
  if (neg && /(अच्छा|accha|theek|thik|good|okay|ठीक|fine)/.test(t)) return byScore(2);
  if (
    /(बहुत अच्छा|bahut accha|bahut badhiya|very good|great|बढ़िया|badhiya|खुश|khush|excellent)/.test(
      t,
    )
  )
    return byScore(5);
  if (
    /(बुरा|bura|उदास|udaas|udas|\bsad\b|\blow\b|दुखी|dukhi|depress|रोना|rona|मन नहीं|mann nahi)/.test(
      t,
    )
  )
    return byScore(1);
  if (
    /(तनाव|tanav|stress|tension|परेशान|pareshan|चिंता|chinta|irritable|चिड़चिड़|गुस्सा|gussa)/.test(
      t,
    )
  )
    return byScore(2);
  if (/(ठीक|theek|thik|okay|\bok\b|normal|chalega|so so|ठीक ठाक|thik thak)/.test(t))
    return byScore(3);
  if (/(अच्छा|accha|good|badhiya|fine|happy|खुश)/.test(t)) return byScore(4);
  return null;
}

function parseChipVoice(text: string): (typeof CHIPS)[number] | null {
  const t = text.toLowerCase();
  const map: Record<string, string[]> = {
    sleep: ["नींद", "neend", "nind", "sleep", "सोना", "sona", "नहीं सो"],
    work: ["काम", "kaam", "work", "job", "office", "naukri", "नौकरी", "दफ्तर", "daftar"],
    home: ["घर", "ghar", "home", "family", "parivaar", "परिवार", "gharwale"],
    alone: ["अकेला", "अकेली", "akela", "akeli", "alone", "lonely", "tanha", "तन्हा", "akelapan"],
    skip: [
      "बताना नहीं",
      "nahi batana",
      "batana nahi",
      "prefer not",
      "skip",
      "छोड़",
      "chhod",
      "नहीं बताना",
    ],
  };
  for (const c of CHIPS) if (map[c.id]?.some((k) => t.includes(k))) return c;
  return null;
}

// A short, standalone "no / nothing / that's all" reply. Exact-match (not
// substring) so "no sleep" etc. still reach the LLM. These get a warm sign-off
// rather than being treated as "show me more" or hitting the off-topic blocker.
function isClosingReply(text: string): boolean {
  const t = text
    .toLowerCase()
    .trim()
    .replace(/[.!।]+$/, "");
  if (t.length > 20) return false;
  const closers = [
    "no",
    "nope",
    "no thanks",
    "no thank you",
    "nothing",
    "nothing else",
    "that's all",
    "thats all",
    "no more",
    "nahi",
    "nahin",
    "nhi",
    "na",
    "bas",
    "kuch nahi",
    "kuch nahin",
    "aur nahi",
    "नहीं",
    "नही",
    "ना",
    "बस",
    "कुछ नहीं",
    "और नहीं",
    "bye",
    "thanks",
    "thank you",
    "shukriya",
    "धन्यवाद",
    "शुक्रिया",
  ];
  return closers.includes(t);
}

// ─── Comfort options (she chooses — never auto-pushed at her) ──────────────────
// Letting her pick respects her feeling; a joke forced on a low day feels dismissive.
type ComfortId = "breathing" | "music" | "funny" | "talk";
const COMFORTS: { id: ComfortId; emoji: string; label: string; labelEn: string }[] = [
  { id: "breathing", emoji: "🫁", label: "साँस लेने का अभ्यास", labelEn: "Breathing" },
  { id: "music", emoji: "🎵", label: "शांत संगीत", labelEn: "Calming music" },
  { id: "funny", emoji: "😄", label: "कुछ हँसी-मज़ाक", labelEn: "Something funny" },
  { id: "talk", emoji: "💬", label: "बस बात करनी है", labelEn: "Just talk" },
];

// Light, wholesome, culture-safe jokes — simple language, no idioms.
const JOKES: { hi: string; en: string }[] = [
  {
    hi: "टीचर: तुम स्कूल लेट क्यों आए? बच्चा: रास्ते में लिखा था — 'स्कूल आगे है, धीरे चलें'। 🚸",
    en: "Teacher: Why are you late for school? Student: The sign said 'School Ahead, Go Slow'. 🚸",
  },
  {
    hi: "टमाटर लाल क्यों हो गया? क्योंकि उसने सलाद बनते हुए देख लिया! 🍅",
    en: "Why did the tomato turn red? Because it saw the salad being made! 🍅",
  },
  {
    hi: "बिना दाँत वाले भालू को क्या कहते हैं? जेली भालू! 🐻",
    en: "What do you call a bear with no teeth? A gummy bear! 🐻",
  },
  {
    hi: "फ़ोन ने चश्मा क्यों पहना? क्योंकि उसके सारे contacts खो गए! 📱",
    en: "Why did the phone wear glasses? Because it lost all its contacts! 📱",
  },
];

// ─── Pattern reflection (rule-based, no ML, no detection engine) ───────────────
// We only surface truthful counts and sequences — she does the interpreting.
// Never diagnoses; a low streak is a caring check-in, not a clinical inference.
// Takes the deduped daily series (today is the last element). Day 1 → null.
function buildReflection(
  days: MoodLogEntry[],
  period: { lastPeriodMs: number; cycleLength: number } | null,
  t: (hi: string, en: string) => string,
): string | null {
  if (days.length < 2) return null;
  const today = days[days.length - 1];
  const prev = days[days.length - 2];

  // Rule 1 — consecutive low-mood days: earliest, gentlest self-care check-in.
  // NOT escalation — crisis routing stays with existing resource triggers.
  let streak = 0;
  for (let i = days.length - 1; i >= 0 && days[i].mood <= 2; i--) streak++;
  if (streak >= 3) {
    return t(
      `यह लगातार ${streak}वाँ दिन है जब मन उदास लगा — सब ठीक है? अपना ख्याल रखना ज़रूरी है 💜`,
      `This is the ${streak}th time in a row you've felt low — is everything okay? Taking care of yourself matters 💜`,
    );
  }

  // Rule 2 — cycle correlation: where her low-mood days actually fall.
  // We surface the honest count, not a diagnosis; the hormone note is validation.
  if (period) {
    const lowDays = days.filter((e) => e.mood <= 2);
    if (lowDays.length >= 3) {
      const counts: Record<PhaseKey, number> = {
        menstrual: 0,
        follicular: 0,
        ovulation: 0,
        luteal: 0,
      };
      for (const e of lowDays) {
        const day = cycleDayForDate(Date.parse(e.date), period.lastPeriodMs, period.cycleLength);
        counts[phaseKeyForDay(day, period.cycleLength)]++;
      }
      const [topKey, topN] = (Object.entries(counts) as [PhaseKey, number][]).sort(
        (a, b) => b[1] - a[1],
      )[0];
      if (topN >= 2 && topN >= Math.ceil(lowDays.length * 0.6)) {
        const total = lowDays.length;
        if (topKey === "luteal") {
          return t(
            `तुम्हारे ${total} भारी दिनों में से ${topN} period से पहले वाले हफ्ते में थे — यह हार्मोन की वजह से आम है 💜`,
            `${topN} of your ${total} low days were in the week before your period — this is common with hormones 💜`,
          );
        }
        if (topKey === "menstrual") {
          return t(
            `तुम्हारे ${total} भारी दिनों में से ${topN} period के दिनों में थे — तब मन भारी लगना आम है 💜`,
            `${topN} of your ${total} low days were during your period — feeling low then is common 💜`,
          );
        }
        const label = PHASE_LABELS[topKey];
        return t(
          `तुम्हारे ${total} भारी दिनों में से ${topN} ${label.name} में थे।`,
          `${topN} of your ${total} low days fell in ${label.nameEn}.`,
        );
      }
    }
  }

  // Rule 3 — same context tagged repeatedly this week: surface the count plainly.
  if (today.chip && today.chip !== "skip") {
    const last7 = days.slice(-7);
    const count = last7.filter((e) => e.chip === today.chip).length;
    const chip = CHIPS.find((x) => x.id === today.chip);
    if (count >= 3 && chip) {
      const label = t(chip.label, chip.labelEn);
      return t(
        `इस हफ्ते "${label}" ${count} बार तुम्हारे mood से जुड़ा — बस बता रही हूँ 🌸`,
        `This week "${label}" came up ${count} times with your mood — just sharing 🌸`,
      );
    }
  }

  // Rule 4 — simple honest comparison to the last log (delivers the day-2 payoff).
  if (today.mood > prev.mood) {
    return t(
      "पिछली बार से आज थोड़ा बेहतर लग रहा है 🌸",
      "You're feeling a little better than last time 🌸",
    );
  }
  if (today.mood < prev.mood) {
    return t(
      "पिछली बार से आज थोड़ा भारी लग रहा है — कोई बात नहीं, ऐसे दिन आते हैं 💜",
      "Today feels a little heavier than last time — that's okay, such days come 💜",
    );
  }
  return t("पिछली बार जैसा ही महसूस हो रहा है।", "You're feeling about the same as last time.");
}

// ─── For whom ─────────────────────────────────────────────────────────────────
type ForWhom = "self" | "other";

function ForWhomCard({
  onPick,
  locked,
  selected,
}: {
  onPick: (v: ForWhom) => void;
  locked: boolean;
  selected?: ForWhom;
}) {
  const { lang } = useLang();
  const t = (hi: string, en: string) => (lang === "hi" ? hi : en);
  return (
    <div
      className="mt-1 rounded-tr-2xl rounded-b-2xl p-3"
      style={{ background: C.surface, boxShadow: "0 1px 6px rgba(45,27,78,0.08)", maxWidth: 252 }}
    >
      <div className="mb-2.5 text-[11px] font-semibold" style={{ color: C.textTertiary }}>
        {t("किसके लिए? 👇", "Who is this for? 👇")}
      </div>
      <div className="flex gap-2">
        {(["self", "other"] as ForWhom[]).map((v) => {
          const isSelected = selected === v;
          return (
            <button
              key={v}
              type="button"
              disabled={locked}
              onClick={() => !locked && onPick(v)}
              className="flex-1 rounded-2xl py-2.5 text-[13px] font-semibold transition-all active:scale-95"
              style={{
                background: isSelected ? C.raat : C.raatLight,
                color: isSelected ? "#fff" : C.raatMid,
                border: "none",
                opacity: locked && !isSelected ? 0.4 : 1,
                fontFamily: "JioType, sans-serif",
              }}
            >
              {v === "self" ? t("मेरे लिए", "For me") : t("किसी और के लिए", "For someone else")}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Message kinds ────────────────────────────────────────────────────────────

type MessageKind =
  | { type: "greeting" }
  | { type: "text"; role: "user" | "sakhi"; text: string; isLlm?: boolean }
  | { type: "forWhomPicker"; locked: boolean; selected?: ForWhom }
  | { type: "moodPicker"; locked: boolean; selected?: (typeof MOODS)[0] }
  | { type: "chipPicker"; locked: boolean; selected?: string }
  | { type: "confirmation"; mood: (typeof MOODS)[0]; isReturning: boolean }
  | { type: "contentLink"; query: string }
  | { type: "weekView"; days: MoodLogEntry[] }
  | { type: "comfortMenu" }
  | { type: "breathingAnim" }
  | { type: "musicCard" }
  | { type: "jokeCard" };

// ─── Comfort menu (she chooses what would help) ────────────────────────────────
function ComfortMenu({ onPick }: { onPick: (id: ComfortId) => void }) {
  const { lang } = useLang();
  const t = (hi: string, en: string) => (lang === "hi" ? hi : en);
  return (
    <div
      className="mt-1 rounded-tr-2xl rounded-b-2xl p-3"
      style={{ background: C.surface, boxShadow: "0 1px 6px rgba(45,27,78,0.08)", maxWidth: 260 }}
    >
      <div className="mb-2.5 text-[11px] font-semibold" style={{ color: C.textTertiary }}>
        {t("अभी क्या अच्छा लगेगा? 👇", "What would feel good right now? 👇")}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {COMFORTS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onPick(c.id)}
            className="flex items-center gap-1.5 rounded-2xl px-2.5 py-2.5 text-left text-[12px] font-semibold transition-all active:scale-95"
            style={{
              background: C.raatLight,
              color: C.raatMid,
              border: "none",
              fontFamily: "JioType, sans-serif",
            }}
          >
            <span style={{ fontSize: 16, lineHeight: 1 }}>{c.emoji}</span>
            {t(c.label, c.labelEn)}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Breathing animation (live "breathe with the circle") ──────────────────────
function BreathingAnimation() {
  const { lang } = useLang();
  const t = (hi: string, en: string) => (lang === "hi" ? hi : en);
  return (
    <div
      className="mt-1 flex flex-col items-center rounded-tr-2xl rounded-b-2xl px-3 py-6"
      style={{
        background: "linear-gradient(135deg, #EBF4FC 0%, #E5F7F0 100%)",
        boxShadow: "0 1px 6px rgba(45,27,78,0.08)",
        maxWidth: 260,
      }}
    >
      <p
        className="mb-5 text-center text-[12px] font-semibold"
        style={{ color: C.raat, fontFamily: "JioType, sans-serif" }}
      >
        {t("मेरे साथ साँस लो 💜", "Breathe with me 💜")}
      </p>

      {/* Guided orb — grows on the in-breath, shrinks on the out-breath */}
      <div className="relative flex h-36 w-36 items-center justify-center">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(74,144,217,0.28) 0%, rgba(74,144,217,0) 70%)",
            animation: "breatheGlow 8s ease-in-out infinite",
          }}
        />
        <div
          className="absolute inset-4 rounded-full"
          style={{
            background: "rgba(74,144,217,0.22)",
            animation: "breatheScale 8s ease-in-out infinite",
          }}
        />
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full text-[24px]"
          style={{
            background: C.sky,
            color: "#fff",
            animation: "breatheScale 8s ease-in-out infinite",
          }}
        >
          🫁
        </div>
      </div>

      {/* Synced label — crossfades with the orb */}
      <div className="relative mt-5 h-5 w-full">
        <span
          className="absolute inset-0 text-center text-[13px] font-bold"
          style={{ color: C.sky, animation: "labelIn 8s ease-in-out infinite" }}
        >
          {t("साँस लो…", "Breathe in…")}
        </span>
        <span
          className="absolute inset-0 text-center text-[13px] font-bold"
          style={{ color: C.mint, animation: "labelOut 8s ease-in-out infinite" }}
        >
          {t("साँस छोड़ो…", "Breathe out…")}
        </span>
      </div>

      <style>{`
        @keyframes breatheScale {
          0%, 100% { transform: scale(0.55); }
          50% { transform: scale(1); }
        }
        @keyframes breatheGlow {
          0%, 100% { opacity: 0.3; transform: scale(0.7); }
          50% { opacity: 0.75; transform: scale(1.05); }
        }
        @keyframes labelIn {
          0% { opacity: 0; }
          10%, 42% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        @keyframes labelOut {
          0%, 50% { opacity: 0; }
          60%, 92% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ─── Calming music player (prototype — visual player) ──────────────────────────
function MusicCard() {
  const { lang } = useLang();
  const t = (hi: string, en: string) => (lang === "hi" ? hi : en);
  const [playing, setPlaying] = useState(true);
  return (
    <div
      className="mt-1 rounded-tr-2xl rounded-b-2xl p-3"
      style={{
        background: "linear-gradient(135deg, #3D2560 0%, #2D1B4E 100%)",
        boxShadow: "0 2px 10px rgba(45,27,78,0.20)",
        maxWidth: 260,
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-[22px]"
          style={{ background: "rgba(255,255,255,0.12)" }}
        >
          🎧
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-bold text-white">
            {t("शांत — हल्का संगीत", "Shaant — Calm sounds")}
          </div>
          <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.5)" }}>
            {t("5 मिनट · धीमा और सुकून भरा", "5 min · slow and soothing")}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[14px] transition-all active:scale-90"
          style={{ background: C.mint, color: "#fff" }}
          aria-label={playing ? t("रोकें", "Pause") : t("चलाएँ", "Play")}
        >
          {playing ? "⏸" : "▶"}
        </button>
      </div>
      {/* Equalizer — animates while playing */}
      <div className="mt-3 flex h-6 items-end gap-1">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
          <div
            key={i}
            className="flex-1 rounded-full"
            style={{
              background: "rgba(42,175,122,0.7)",
              height: playing ? undefined : "20%",
              animation: playing ? `eq 1s ease-in-out ${i * 0.12}s infinite` : "none",
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes eq {
          0%, 100% { height: 20%; }
          50% { height: 100%; }
        }
      `}</style>
    </div>
  );
}

// ─── Joke card (light, wholesome — one more on tap) ────────────────────────────
function JokeCard() {
  const { lang } = useLang();
  const t = (hi: string, en: string) => (lang === "hi" ? hi : en);
  const [i, setI] = useState(() => Math.floor(Math.random() * JOKES.length));
  const joke = JOKES[i];
  return (
    <div
      className="mt-1 rounded-tr-2xl rounded-b-2xl p-3"
      style={{ background: "#FFF7ED", boxShadow: "0 1px 6px rgba(45,27,78,0.08)", maxWidth: 260 }}
    >
      <div className="mb-1.5 flex items-center gap-1.5">
        <span className="text-[16px]">😄</span>
        <span
          className="text-[11px] font-bold"
          style={{ color: "#B45309", fontFamily: "JioType, sans-serif" }}
        >
          {t("एक हल्की सी बात", "A little something")}
        </span>
      </div>
      <p
        className="text-[13px] leading-relaxed"
        style={{ color: C.textPrimary, fontFamily: "JioType, sans-serif" }}
      >
        {t(joke.hi, joke.en)}
      </p>
      <button
        type="button"
        onClick={() => setI((prev) => (prev + 1) % JOKES.length)}
        className="mt-2.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all active:scale-95"
        style={{ background: "#FED7AA", color: "#92400E", fontFamily: "JioType, sans-serif" }}
      >
        {t("एक और 😄", "One more 😄")}
      </button>
    </div>
  );
}

// ─── Content redirect card ────────────────────────────────────────────────────
function ContentLinkCard({ onTap }: { onTap: () => void }) {
  const { lang } = useLang();
  const t = (hi: string, en: string) => (lang === "hi" ? hi : en);
  return (
    <button
      type="button"
      onClick={onTap}
      className="mt-1 w-full rounded-tr-2xl rounded-b-2xl p-3 text-left transition-all active:scale-[0.98]"
      style={{
        background: C.violetLight,
        border: `1.5px solid rgba(139,92,246,0.25)`,
        maxWidth: 252,
        boxShadow: "0 1px 6px rgba(45,27,78,0.08)",
      }}
    >
      <div className="mb-1 flex items-center gap-2">
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[14px]"
          style={{ background: C.violet }}
        >
          ✅
        </div>
        <span
          className="text-[12px] font-bold"
          style={{ color: C.raat, fontFamily: "JioType, sans-serif" }}
        >
          {t("जाँची-परखी जानकारी देखें", "View Verified Information")}
        </span>
      </div>
      <p
        className="text-[11px] leading-relaxed"
        style={{ color: C.textSecondary, fontFamily: "JioType, sans-serif" }}
      >
        {t(
          "PMS, तनाव, और हॉर्मोन से जुड़ी जानकारी — WHO और FOGSI द्वारा सत्यापित",
          "Information on PMS, stress, and hormones — verified by WHO and FOGSI",
        )}
      </p>
      <div
        className="mt-2 flex items-center gap-1 text-[11px] font-semibold"
        style={{ color: C.violet }}
      >
        {t("अभी पढ़ें →", "Read now →")}
      </div>
    </button>
  );
}

// ─── Phase banner ─────────────────────────────────────────────────────────────
type PhaseData = ReturnType<typeof loadPhase>;

function PhaseBanner({ phase }: { phase: NonNullable<PhaseData> }) {
  const PHASE = phase;
  const { lang } = useLang();
  const t = (hi: string, en: string) => (lang === "hi" ? hi : en);
  return (
    <div
      className="flex items-center gap-2 px-4 py-2"
      style={{
        background: "linear-gradient(90deg, #3D2560 0%, #2D1B4E 100%)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ background: C.violet, boxShadow: "0 0 6px rgba(139,92,246,0.6)" }}
      />
      <div className="flex-1">
        <div className="text-[11px] font-bold" style={{ color: "rgba(255,255,255,0.85)" }}>
          {t(PHASE.name, PHASE.nameEn)} · {t("दिन", "Day")} {PHASE.day}
        </div>
        <div className="mt-0.5 text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>
          {t(PHASE.hint, PHASE.hintEn)}
        </div>
      </div>
      <div
        className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold"
        style={{
          background: "rgba(232,83,106,0.2)",
          border: "1px solid rgba(232,83,106,0.35)",
          color: C.gulabiMid,
        }}
      >
        D{PHASE.day}
      </div>
    </div>
  );
}

// ─── Mood face selector ───────────────────────────────────────────────────────
function MoodPicker({
  onPick,
  locked,
  selected,
}: {
  onPick: (m: (typeof MOODS)[0]) => void;
  locked: boolean;
  selected?: (typeof MOODS)[0];
}) {
  const { lang } = useLang();
  const t = (hi: string, en: string) => (lang === "hi" ? hi : en);
  return (
    <div
      className="mt-1 rounded-tr-2xl rounded-b-2xl p-3"
      style={{ background: C.surface, boxShadow: "0 1px 6px rgba(45,27,78,0.08)", maxWidth: 252 }}
    >
      <div className="mb-2 text-[11px] font-semibold" style={{ color: C.textTertiary }}>
        {t("एक tap करो 👇", "Tap one 👇")}
      </div>
      <div className="flex gap-1.5">
        {MOODS.map((m) => {
          const isSelected = selected?.score === m.score;
          return (
            <button
              key={m.score}
              type="button"
              disabled={locked}
              onClick={() => !locked && onPick(m)}
              className="flex flex-1 flex-col items-center gap-1 rounded-xl py-2 transition-all active:scale-95"
              style={{
                border: `1.5px solid ${isSelected ? C.sky : C.border}`,
                background: isSelected ? C.skyLight : C.surface,
                opacity: locked && !isSelected ? 0.45 : 1,
              }}
            >
              <span style={{ fontSize: 22, lineHeight: 1 }}>{m.face}</span>
              <span
                className="text-center text-[8px] leading-tight font-bold tracking-wide uppercase"
                style={{ color: isSelected ? C.sky : C.textTertiary }}
              >
                {t(m.label, m.labelEn)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Context chip picker (Layer 2 — optional, tap-only) ────────────────────────
function ChipPicker({
  onPick,
  locked,
  selected,
}: {
  onPick: (c: (typeof CHIPS)[0]) => void;
  locked: boolean;
  selected?: string;
}) {
  const { lang } = useLang();
  const t = (hi: string, en: string) => (lang === "hi" ? hi : en);
  return (
    <div
      className="mt-1 rounded-tr-2xl rounded-b-2xl p-3"
      style={{ background: C.surface, boxShadow: "0 1px 6px rgba(45,27,78,0.08)", maxWidth: 252 }}
    >
      <div className="mb-2.5 text-[11px] font-semibold" style={{ color: C.textTertiary }}>
        {t("कोई खास वजह? (चाहो तो) 👇", "Any particular reason? (only if you want) 👇")}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {CHIPS.map((c) => {
          const isSelected = selected === c.id;
          const isSkip = c.id === "skip";
          return (
            <button
              key={c.id}
              type="button"
              disabled={locked}
              onClick={() => !locked && onPick(c)}
              className="rounded-full px-3 py-2 text-[12px] font-semibold transition-all active:scale-95"
              style={{
                border: `1.5px solid ${isSelected ? C.raat : C.border}`,
                background: isSelected ? C.raat : isSkip ? "transparent" : C.raatLight,
                color: isSelected ? "#fff" : isSkip ? C.textTertiary : C.raatMid,
                opacity: locked && !isSelected ? 0.45 : 1,
                fontFamily: "JioType, sans-serif",
              }}
            >
              {t(c.label, c.labelEn)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Confirmation card ────────────────────────────────────────────────────────
function ConfirmationCard({
  mood,
  phase,
  isReturning,
}: {
  mood: (typeof MOODS)[0];
  phase: NonNullable<PhaseData>;
  isReturning: boolean;
}) {
  const PHASE = phase;
  const { lang } = useLang();
  const t = (hi: string, en: string) => (lang === "hi" ? hi : en);
  const hasPhaseData = PHASE.day > 0;
  return (
    <div
      className="relative mt-1 overflow-hidden rounded-tr-2xl rounded-b-2xl p-3.5"
      style={{
        background: "linear-gradient(135deg, #3D2560 0%, #2D1B4E 100%)",
        maxWidth: 252,
        boxShadow: "0 2px 10px rgba(45,27,78,0.20)",
      }}
    >
      {/* bg decoration */}
      <div
        className="absolute -right-5 -bottom-5 h-16 w-16 rounded-full"
        style={{ background: "rgba(232,83,106,0.12)" }}
      />

      {/* Title */}
      <div className="mb-2.5 flex items-center gap-2">
        <div
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
          style={{ background: C.mint }}
        >
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
            <polyline
              points="2,7 5,10 12,3"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className="text-[12px] font-bold" style={{ color: "rgba(255,255,255,0.9)" }}>
          {t("आज का mood note हो गया ✓", "Today's mood noted ✓")}
        </span>
      </div>

      {/* Mood row */}
      <div className="mb-2.5 flex items-center gap-2.5">
        <span style={{ fontSize: 28, lineHeight: 1 }}>{mood.face}</span>
        <div className="text-[14px] font-extrabold text-white">{t(mood.label, mood.labelEn)}</div>
      </div>

      {/* Cycle correlation — only claim a phase when we actually have period data */}
      {hasPhaseData ? (
        <div
          className="relative z-10 rounded-xl p-2.5"
          style={{ background: "rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-start gap-1.5">
            <span style={{ fontSize: 13, flexShrink: 0, marginTop: 1 }}>💡</span>
            <p className="text-[11px] leading-relaxed" style={{ color: "rgba(255,255,255,0.70)" }}>
              <strong style={{ color: "rgba(255,255,255,0.90)" }}>
                {t(`${PHASE.name} में यह आम है।`, `This is common in ${PHASE.nameEn}.`)}
              </strong>{" "}
              {isReturning
                ? t(
                    "तुम्हारा pattern साफ़ होता जा रहा है — ऐसे ही log करती रहो।",
                    "Your pattern is getting clearer — keep logging like this.",
                  )
                : t(
                    "आज से log करना शुरू हो गया — अगली बार सखी आपका pattern बता सकेगी।",
                    "Logging has started from today — next time Sakhi can show you your pattern.",
                  )}
            </p>
          </div>
          <div
            className="mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5"
            style={{
              background: "rgba(139,92,246,0.25)",
              border: "1px solid rgba(139,92,246,0.35)",
            }}
          >
            <div className="h-1.5 w-1.5 rounded-full" style={{ background: C.violet }} />
            <span
              className="text-[9px] font-bold tracking-wide uppercase"
              style={{ color: "rgba(139,92,246,0.9)" }}
            >
              {t("दिन", "Day")} {PHASE.day} / {PHASE.cycleLength}
            </span>
          </div>
        </div>
      ) : (
        <div
          className="relative z-10 rounded-xl p-2.5"
          style={{ background: "rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-start gap-1.5">
            <span style={{ fontSize: 13, flexShrink: 0, marginTop: 1 }}>🩸</span>
            <p className="text-[11px] leading-relaxed" style={{ color: "rgba(255,255,255,0.70)" }}>
              {t(
                "Period Tracker में अपनी dates डालो — फिर मैं तुम्हारे mood को cycle से जोड़ सकूँगी 💜",
                "Add your dates in Period Tracker — then I can link your mood to your cycle 💜",
              )}
            </p>
          </div>
        </div>
      )}

      {/* Privacy — felt at the moment of logging, not just stated once */}
      <div
        className="relative z-10 mt-2.5 flex items-center gap-1.5"
        style={{ color: "rgba(255,255,255,0.5)" }}
      >
        <span className="text-[11px]">🔒</span>
        <span className="text-[10px]" style={{ fontFamily: "JioType, sans-serif" }}>
          {t("यह सिर्फ तुम्हारे पास रहता है", "This stays only with you")}
        </span>
      </div>
    </div>
  );
}

// ─── Week view (D7 reward) ─────────────────────────────────────────────────────
// A plain row of her last 7 mood faces + colors. No interpretation text — seeing
// the pattern laid out does the interpretive work. We only show, never claim.
function WeekView({ days }: { days: MoodLogEntry[] }) {
  const { lang } = useLang();
  const t = (hi: string, en: string) => (lang === "hi" ? hi : en);
  const moodColor = (score: number) =>
    score >= 5
      ? C.mint
      : score === 4
        ? "#7CC49B"
        : score === 3
          ? C.amber
          : score === 2
            ? C.gulabiMid
            : C.gulabi;
  const face = (score: number) => MOODS.find((m) => m.score === score)?.face ?? "";
  return (
    <div
      className="mt-1 rounded-tr-2xl rounded-b-2xl p-3"
      style={{ background: C.surface, boxShadow: "0 1px 6px rgba(45,27,78,0.08)", maxWidth: 272 }}
    >
      <div
        className="mb-0.5 text-[12px] font-bold"
        style={{ color: C.raat, fontFamily: "JioType, sans-serif" }}
      >
        {t("तुम्हारा हफ्ता 🗓️", "Your week 🗓️")}
      </div>
      <div className="mb-2.5 text-[10px]" style={{ color: C.textTertiary }}>
        {t("पिछले 7 log — खुद देखो", "Your last 7 logs — see for yourself")}
      </div>
      <div className="flex items-end justify-between gap-1">
        {days.map((d) => {
          const wd = new Date(d.date).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", {
            weekday: "short",
          });
          return (
            <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
              <span style={{ fontSize: 18, lineHeight: 1 }}>{face(d.mood)}</span>
              <div
                className="h-1.5 w-full rounded-full"
                style={{ background: moodColor(d.mood) }}
              />
              <span className="text-[8px] font-semibold" style={{ color: C.textTertiary }}>
                {wd}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Sakhi bubble wrapper ─────────────────────────────────────────────────────
function SakhiRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-end gap-1.5">
      <div
        className="mb-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px]"
        style={{ background: C.raat }}
      >
        💜
      </div>
      <div className="flex flex-col gap-0.5" style={{ maxWidth: 252 }}>
        <span
          className="pl-0.5 text-[9px] font-bold tracking-wider uppercase"
          style={{ color: C.textTertiary }}
        >
          Sakhi
        </span>
        {children}
      </div>
    </div>
  );
}

// Doctor disclaimer — rendered as a distinct, muted footnote (not blended into
// the answer text) so it reads clearly as a standing note, not as content.
function DisclaimerNote({ text }: { text: string }) {
  return (
    <div
      className="mt-1 flex items-start gap-1.5 rounded-lg px-2.5 py-1.5"
      style={{ maxWidth: 252, background: "#FFFBEB", border: "1px solid #FDE68A" }}
    >
      <span className="shrink-0 text-[11px] leading-[15px]">ⓘ</span>
      <span
        className="text-[10px] leading-snug italic"
        style={{ color: "#92400E", fontFamily: "JioType, sans-serif" }}
      >
        {text}
      </span>
    </div>
  );
}

// ─── Text bubble ─────────────────────────────────────────────────────────────
function Bubble({ text, time }: { text: string; time?: string }) {
  const { body, disclaimer } = splitDisclaimer(text);
  return (
    <>
      <div
        className="rounded-tl-sm rounded-tr-2xl rounded-b-2xl px-3 py-2.5 text-[13px] leading-relaxed"
        style={{
          background: C.surface,
          color: C.textPrimary,
          boxShadow: "0 1px 4px rgba(45,27,78,0.08)",
          fontFamily: "JioType, sans-serif",
        }}
      >
        {body}
      </div>
      {disclaimer && <DisclaimerNote text={disclaimer} />}
      {time && (
        <span className="pl-0.5 text-[9px]" style={{ color: C.textTertiary }}>
          {time}
        </span>
      )}
    </>
  );
}

// ─── Loading dots ─────────────────────────────────────────────────────────────
function LoadingDots() {
  return (
    <SakhiRow>
      <div
        className="flex items-center gap-1.5 rounded-tl-sm rounded-tr-2xl rounded-b-2xl px-4 py-3"
        style={{ background: C.surface, boxShadow: "0 1px 4px rgba(45,27,78,0.08)" }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full"
            style={{
              background: C.textTertiary,
              animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
        <style>{`@keyframes pulse{0%,100%{opacity:0.3}50%{opacity:1}}`}</style>
      </div>
    </SakhiRow>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function MoodTrackerPage() {
  // Isolated builds for the other two features must not expose this page.
  if (isBlocked("mood")) notFound();
  const router = useRouter();
  const { lang } = useLang();
  const t = (hi: string, en: string) => (lang === "hi" ? hi : en);
  const [PHASE] = useState(() => loadPhase() ?? PHASE_DEFAULT);
  // Returning user? (used only for a warmer greeting — never to show her data.)
  const [returning] = useState(() => loadMoodLog().length > 0);
  // The phase banner is cycle-derived data. Keep it hidden on a neutral open;
  // reveal it after she logs today, or if she's turned on "show on open".
  const [showPhase, setShowPhase] = useState(() => getShowLastOnOpen());
  const bottomRef = useRef<HTMLDivElement>(null);
  const scroll = () =>
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);

  // Back-button gate: show the privacy note once per session, then navigate.
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const goHome = () => router.push("/womens-health");
  const handleBack = () => setPrivacyOpen(true);

  // Voice input on this screen goes straight into the chat (same as typing), so
  // it stays in the mood flow instead of navigating away.
  useVoiceTarget((text) => handleSubmit(text));

  const [forWhomLocked, setForWhomLocked] = useState(false);
  const [selectedForWhom, setSelectedForWhom] = useState<ForWhom | undefined>();
  const [moodLocked, setMoodLocked] = useState(false);
  const [chipLocked, setChipLocked] = useState(false);
  const [selectedMood, setSelectedMood] = useState<(typeof MOODS)[0] | undefined>();
  const [selectedChip, setSelectedChip] = useState<string | undefined>();
  const [loading, setLoading] = useState(false); // API call only
  const [flowLoading, setFlowLoading] = useState(false); // between picker steps

  const [messages, setMessages] = useState<MessageKind[]>(() => [
    { type: "greeting" },
    { type: "forWhomPicker", locked: false },
  ]);

  function push(msg: MessageKind) {
    setMessages((prev) => [...prev, msg]);
    scroll();
  }

  function handleForWhomPick(v: ForWhom) {
    if (forWhomLocked) return;
    setForWhomLocked(true);
    setSelectedForWhom(v);
    push({
      type: "text",
      role: "user",
      text: v === "self" ? t("मेरे लिए", "For me") : t("किसी और के लिए", "For someone else"),
    });
    setFlowLoading(true);
    scroll();
    setTimeout(() => {
      setFlowLoading(false);
      const opening =
        v === "other"
          ? t(
              "कभी-कभी मूड बिना वजह खराब हो जाता है ना? मैं ध्यान रखूँगी — धीरे-धीरे पता चलेगा कि उन्हें कब और क्यों ऐसा लगता है। बस एक शब्द बता दो — आज उनका मूड कैसा है?",
              "Sometimes mood feels low for no clear reason, right? I'll keep track — slowly you'll start to see when and why they feel this way. Just tell me in one word — how is their mood today?",
            )
          : t(
              "कभी-कभी लगता है मूड बिना वजह खराब हो जाता है ना? मैं ध्यान रखूँगी — धीरे-धीरे पता चलेगा कि तुम्हें कब और क्यों ऐसा लगता है। बस एक शब्द बता दो — आज कैसा महसूस हो रहा है?",
              "Sometimes your mood feels low for no clear reason, right? I'll keep track — slowly you'll start to see when and why you feel this way. Just tell me in one word — how do you feel today?",
            );
      push({ type: "text", role: "sakhi", text: opening });
      push({ type: "moodPicker", locked: false });
      scroll();
    }, 900);
  }

  function handleMoodPick(m: (typeof MOODS)[0]) {
    if (moodLocked) return;
    setMoodLocked(true);
    setSelectedMood(m);
    push({ type: "text", role: "user", text: `${m.face} ${t(m.label, m.labelEn)}` });
    setFlowLoading(true);
    scroll();
    setTimeout(() => {
      setFlowLoading(false);
      // Validate before asking anything more — value-back even on entry #1
      push({ type: "text", role: "sakhi", text: t(m.validate, m.validateEn) });
      // Layer 2: optional, tap-only context — never free text as the default
      push({ type: "chipPicker", locked: false });
      scroll();
    }, 900);
  }

  // Context chip is the last step — logging completes here (no energy step)
  function handleChipPick(c: (typeof CHIPS)[0]) {
    if (chipLocked) return;
    setChipLocked(true);
    setSelectedChip(c.id);
    push({ type: "text", role: "user", text: t(c.label, c.labelEn) });
    setFlowLoading(true);
    scroll();
    setTimeout(() => {
      setFlowLoading(false);
      // Light, chip-specific acknowledgment — validated, non-diagnostic
      push({ type: "text", role: "sakhi", text: t(c.ack, c.ackEn) });

      // Persist the completed log (on-device only) and reflect the pattern back
      const today: MoodLogEntry = {
        date: new Date().toISOString().slice(0, 10),
        mood: selectedMood?.score ?? 3,
        chip: c.id === "skip" ? null : c.id,
      };
      const period = loadPeriod();
      const days = dedupeByDay([...loadMoodLog(), today]);
      const reflection = buildReflection(days, period, t);
      saveMoodLog(today);
      // She's logged now, so the cycle-day banner is fine to reveal.
      setShowPhase(true);

      push({ type: "confirmation", mood: selectedMood!, isReturning: days.length > 1 });
      if (reflection) push({ type: "text", role: "sakhi", text: reflection });
      // D7: once she has 7 days logged, the week view is the reward — show it plainly
      if (days.length >= 7) push({ type: "weekView", days: days.slice(-7) });
      const isLowMood = (selectedMood?.score ?? 5) <= 2;
      if (isLowMood) {
        // Offer choices — never push a fix (or a joke) at her unasked
        push({
          type: "text",
          role: "sakhi",
          text: t(
            "यह महसूस करना मुश्किल हो सकता है। कुछ ऐसा चुनो जो अभी थोड़ा अच्छा महसूस कराए 💜",
            "It can be hard to feel this way. Pick something that might help you feel a little better right now 💜",
          ),
        });
        push({ type: "comfortMenu" });
      } else {
        push({
          type: "text",
          role: "sakhi",
          text: t(
            "कल भी लॉग करें — पैटर्न समझना फायदेमंद होगा। कोई और बात करनी है? 🌸",
            "Log again tomorrow — understanding patterns is helpful. Anything else you'd like to talk about? 🌸",
          ),
        });
      }
      scroll();
    }, 900);
  }

  // She picked a comfort — show it. Menu stays, so she can try another.
  function handleComfortPick(id: ComfortId) {
    const opt = COMFORTS.find((o) => o.id === id);
    if (!opt) return;
    push({ type: "text", role: "user", text: `${opt.emoji} ${t(opt.label, opt.labelEn)}` });
    setFlowLoading(true);
    scroll();
    setTimeout(() => {
      setFlowLoading(false);
      if (id === "breathing") {
        push({ type: "breathingAnim" });
      } else if (id === "music") {
        push({
          type: "text",
          role: "sakhi",
          text: t(
            "यह सुनो — धीरे-धीरे मन हल्का लगेगा 🎵",
            "Listen to this — it may ease your mind slowly 🎵",
          ),
        });
        push({ type: "musicCard" });
      } else if (id === "funny") {
        push({
          type: "text",
          role: "sakhi",
          text: t("ठीक है, एक हल्की सी बात 😊", "Okay, here's something light 😊"),
        });
        push({ type: "jokeCard" });
      } else {
        push({
          type: "text",
          role: "sakhi",
          text: t(
            "मैं यहीं हूँ। जो भी मन में है, बता सकती हो — कोई जल्दी नहीं 💜",
            "I'm right here. Tell me whatever is on your mind — no rush 💜",
          ),
        });
      }
      scroll();
    }, 700);
  }

  const VAGUE_OPENERS = [
    "mere liye",
    "mujhe",
    "mujhko",
    "main",
    "meri",
    "mera",
    "hi",
    "hello",
    "hmm",
    "hm",
    "मेरे लिए",
    "मुझे",
    "मैं",
    "मेरी",
    "मेरा",
  ];

  const AFFIRMATIVES = [
    "yes",
    "haan",
    "ha",
    "ok",
    "okay",
    "theek hai",
    "batao",
    "help",
    "aur batao",
    "chahti hoon",
    "learn more",
    "aur",
    "kya karu",
    "हाँ",
    "हां",
    "ठीक है",
  ];

  const hasSakhiHistory = messages.some(
    (m) => m.type === "greeting" || (m.type === "text" && m.role === "sakhi"),
  );

  function isAffirmative(q: string): boolean {
    const ql = q.toLowerCase().trim();
    return AFFIRMATIVES.some((p) => ql === p || ql === p + "?" || ql === p + ".");
  }

  function isVagueOpener(q: string): boolean {
    const ql = q.toLowerCase().trim();
    return VAGUE_OPENERS.some((p) => ql === p || ql === p + "?") || ql.length < 4;
  }

  const VAGUE_FOLLOWUP_TRIGGERS = [
    "aisa kyun",
    "aisa kyu",
    "ऐसा क्यों",
    "ऐसा क्यूँ",
    "kyun hota",
    "kyun hoti",
    "kyu hota",
    "क्यों होता",
    "क्यों होती",
    "aur batao",
    "aur samjhao",
    "aur kuch",
    "kya kare",
    "kya karun",
    "kya karna",
    "kaise theek",
    "kaise better",
    "kaise kam",
    "kitna time",
    "kitne din",
  ];

  function isVagueFollowup(q: string): boolean {
    const ql = q.toLowerCase().trim();
    return ql.length < 35 && VAGUE_FOLLOWUP_TRIGGERS.some((p) => ql.includes(p));
  }

  // Find the health topic from prior user messages in the conversation
  function getTopicQueryFromHistory(): string {
    const userMessages = messages
      .filter(
        (m): m is Extract<MessageKind, { type: "text" }> => m.type === "text" && m.role === "user",
      )
      .map((m) => m.text.toLowerCase());
    const combined = userMessages.join(" ");
    if (
      combined.includes("तनाव") ||
      combined.includes("tanav") ||
      combined.includes("stress") ||
      combined.includes("anxiety")
    )
      return "tanav stress anxiety kyun hota hai";
    if (
      combined.includes("बुरा") ||
      combined.includes("उदास") ||
      combined.includes("sad") ||
      combined.includes("udas") ||
      combined.includes("dukh")
    )
      return "low mood mann udaas kyun hota hai";
    if (
      combined.includes("थकान") ||
      combined.includes("thakaan") ||
      combined.includes("tired") ||
      combined.includes("थका")
    )
      return "thakaan fatigue kyun hoti hai";
    if (
      combined.includes("गुस्सा") ||
      combined.includes("gussa") ||
      combined.includes("angry") ||
      combined.includes("irritable")
    )
      return "gussa irritable mood swing kyun hota hai";
    // Default to stress/mood content
    return "low mood mann udaas kyun hota hai";
  }

  async function handleSubmit(text: string) {
    if (!text.trim() || loading) return;
    const q = text.trim();
    // If this query arrived by voice, speak Sakhi's answer back.
    const viaVoice = consumeVoiceQuery();

    // Answer a free-text query via the LLM (askSakhi). Shared by the general
    // chat fall-through AND the pickers below, so a real question typed while a
    // picker is open is answered instead of getting a canned "pick above" reply.
    const runLlm = async (query: string) => {
      const history: SakhiTurn[] = messages
        .filter((m): m is Extract<MessageKind, { type: "text" }> => m.type === "text")
        .map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.text }));
      push({ type: "text", role: "user", text: query });
      setLoading(true);
      scroll();
      try {
        const data = await askSakhi(query, history, lang);
        let spokenText: string;
        if (data.video || data.article) {
          const intro = t(
            "समझ गई। इस बारे में कुछ verified जानकारी है — यहाँ देखें:",
            "Understood. There is some verified information on this — see here:",
          );
          push({ type: "text", role: "sakhi", text: intro });
          push({ type: "contentLink", query });
          spokenText = intro;
        } else if (!isBlockerResponse(data.answer)) {
          push({ type: "text", role: "sakhi", text: data.answer, isLlm: data.isLlm });
          spokenText = splitDisclaimer(data.answer).body;
        } else {
          const intro = t(
            "समझ गई। मूड और मानसिक स्वास्थ्य के बारे में यहाँ कुछ verified जानकारी है:",
            "Understood. Here is some verified information on mood and mental health:",
          );
          push({ type: "text", role: "sakhi", text: intro });
          push({ type: "contentLink", query: "low mood mann udaas kyun hota hai" });
          spokenText = intro;
        }
        // Voice query → speak the answer back (body only, not the disclaimer).
        if (viaVoice) {
          stopSpeech();
          speak(spokenText, { lang });
        }
      } catch {
        push({
          type: "text",
          role: "sakhi",
          text: t(
            "नेटवर्क में थोड़ी समस्या है। दोबारा कोशिश करें। 💜",
            "There's a small network issue. Please try again. 💜",
          ),
        });
      } finally {
        setLoading(false);
        scroll();
      }
    };

    if (isMaleIdentifier(q)) {
      push({ type: "text", role: "user", text: q });
      push({ type: "text", role: "sakhi", text: lang === "en" ? MALE_RESPONSE_EN : MALE_RESPONSE });
      return;
    }

    // ── Voice/typed answers to the tap pickers ──────────────────────────────
    // The onboarding flow is a sequence of pickers (for-whom → mood → context
    // chip). While one is still open, route the answer to that picker's own
    // action so voice stays on-rail. Only after all are done do we fall through
    // to the free-chat / LLM logic below. A matched picker handler pushes its
    // own user bubble, so we don't echo `q` here.
    if (!forWhomLocked) {
      const who = parseForWhomVoice(q);
      if (who) {
        handleForWhomPick(who);
        return;
      }
      if (looksLikeQuestion(q)) {
        await runLlm(q);
        return;
      }
      push({ type: "text", role: "user", text: q });
      push({
        type: "text",
        role: "sakhi",
        text: t(
          "कोई बात नहीं 🙏 ऊपर दिए बटन दबाएँ, या बोलिए — 'मेरे लिए' या 'किसी और के लिए'।",
          "No problem 🙏 Tap a button above, or say — 'For me' or 'For someone else'.",
        ),
      });
      scroll();
      return;
    }
    if (!moodLocked) {
      const mood = parseMoodVoice(q);
      if (mood) {
        handleMoodPick(mood);
        return;
      }
      if (looksLikeQuestion(q)) {
        await runLlm(q);
        return;
      }
      push({ type: "text", role: "user", text: q });
      push({
        type: "text",
        role: "sakhi",
        text: t(
          "ऊपर दिए चेहरों में से एक चुनें 👆 — या बोलिए, जैसे 'अच्छा', 'ठीक है', या 'तनाव'।",
          "Tap one of the faces above 👆 — or say something like 'Good', 'Okay', or 'Stressed'.",
        ),
      });
      scroll();
      return;
    }
    if (!chipLocked) {
      const chip = parseChipVoice(q);
      if (chip) {
        handleChipPick(chip);
        return;
      }
      if (looksLikeQuestion(q)) {
        await runLlm(q);
        return;
      }
      push({ type: "text", role: "user", text: q });
      push({
        type: "text",
        role: "sakhi",
        text: t(
          "ऊपर दिए विकल्पों में से चुनें 👆 — जैसे नींद, काम, घर, या 'बताना नहीं चाहती'।",
          "Pick one above 👆 — like Sleep, Work, Home, or 'Prefer not to say'.",
        ),
      });
      scroll();
      return;
    }

    // Help request with low/stress mood — offer breathing exercise
    if (hasSakhiHistory) {
      const ql = q.toLowerCase();
      const isHelpRequest = [
        "help",
        "kya karu",
        "kya karun",
        "batao",
        "kuch batao",
        "madad",
        "मदद",
        "बताओ",
        "feel better",
        "theek kaise",
        "saans",
        "breathing",
        "relax",
        "calm",
        "शांत",
      ].some((p) => ql.includes(p));
      const hasLowMood =
        getTopicQueryFromHistory().includes("low mood") ||
        getTopicQueryFromHistory().includes("tanav");
      if (isHelpRequest && hasLowMood) {
        push({ type: "text", role: "user", text: q });
        push({ type: "breathingAnim" });
        return;
      }
    }

    // Vague contextual follow-up after mood is logged — route directly to relevant content
    if (hasSakhiHistory && isVagueFollowup(q)) {
      push({ type: "text", role: "user", text: q });
      push({
        type: "text",
        role: "sakhi",
        text: t(
          "ज़रूर! इस बारे में verified जानकारी यहाँ है:",
          "Of course! Here is verified information on this:",
        ),
      });
      push({ type: "contentLink", query: getTopicQueryFromHistory() });
      return;
    }

    // After mood logged + Sakhi replied: affirmative = "show me more content"
    if (hasSakhiHistory && isAffirmative(q)) {
      push({ type: "text", role: "user", text: q });
      push({
        type: "text",
        role: "sakhi",
        text: t(
          "ज़रूर! इस बारे में verified जानकारी यहाँ है:",
          "Of course! Here is verified information on this:",
        ),
      });
      const contentQuery = getTopicQueryFromHistory();
      push({ type: "contentLink", query: contentQuery });
      return;
    }

    // No history yet: vague opener = ask mood
    if (!hasSakhiHistory && isVagueOpener(q)) {
      push({ type: "text", role: "user", text: q });
      push({
        type: "text",
        role: "sakhi",
        text: t(
          "आज आप कैसा महसूस कर रही हैं? खुशी, उदासी, थकान, गुस्सा — जो भी हो, बता सकती हैं। 💜",
          "How are you feeling today? Happiness, sadness, fatigue, anger — whatever it is, you can tell me. 💜",
        ),
      });
      return;
    }

    // A "no / that's all" gets a warm sign-off — not a "here's more info" card
    // or the off-topic blocker the LLM would return for a bare "No".
    if (hasSakhiHistory && isClosingReply(q)) {
      push({ type: "text", role: "user", text: q });
      push({
        type: "text",
        role: "sakhi",
        text: t(
          "ठीक है! अपना ख्याल रखना 💜 जब भी ज़रूरत हो, मैं यहीं हूँ — कभी भी वापस आ सकती हैं।",
          "Okay! Take care of yourself 💜 I'm right here whenever you need me — come back anytime.",
        ),
      });
      return;
    }

    // General chat (logging done, no special pattern matched) — answer via LLM.
    await runLlm(q);
  }

  // Render messages
  function renderMessage(msg: MessageKind, i: number) {
    if (msg.type === "greeting") {
      return (
        <SakhiRow key={i}>
          <Bubble
            text={
              returning
                ? t(
                    "फिर से स्वागत है! 💜 आज कैसा महसूस हो रहा है?",
                    "Welcome back! 💜 How are you feeling today?",
                  )
                : t(
                    "नमस्ते! मैं सखी हूँ — आपकी स्वास्थ्य सहेली। 💜\n\nआपका राज़ मेरा राज़ है। जो भी आप मुझसे कहें — वो सिर्फ हमारे बीच रहेगा। कोई विज्ञापन नहीं, कोई जानकारी किसी के साथ साझा नहीं।",
                    "Hi! I'm your Health Companion. 💜\n\nYour privacy is my priority. Everything you share stays between us. No ads, no data shared with anyone.",
                  )
            }
          />
        </SakhiRow>
      );
    }

    if (msg.type === "text" && msg.role === "user") {
      return (
        <div key={i} className="flex justify-end">
          <div
            className="max-w-[64%] rounded-2xl rounded-tr-sm px-3 py-2.5 text-[13px] leading-relaxed text-white"
            style={{ background: C.raat, fontFamily: "JioType, sans-serif" }}
          >
            {msg.text}
          </div>
        </div>
      );
    }

    if (msg.type === "text" && msg.role === "sakhi") {
      return (
        <SakhiRow key={i}>
          <Bubble text={msg.text} />
          {msg.isLlm && (
            <div
              className="mt-1 flex items-center gap-1 text-[10px]"
              style={{ color: "#9CA3AF", fontFamily: "JioType, sans-serif" }}
            >
              <span>⚠️</span>
              <span>
                {t(
                  "यह जवाब AI द्वारा उत्पन्न है। यह जानकारी सामान्य शिक्षा के लिए है और किसी योग्य डॉक्टर की व्यक्तिगत सलाह का विकल्प नहीं है। स्वास्थ्य संबंधी कोई भी निर्णय लेने से पहले अपनी डॉक्टर से अवश्य परामर्श करें।",
                  "This answer is made by AI. It is only for general learning — not a doctor's personal advice. Please talk to your doctor before taking any health decision.",
                )}
              </span>
            </div>
          )}
        </SakhiRow>
      );
    }

    if (msg.type === "comfortMenu") {
      return (
        <SakhiRow key={i}>
          <ComfortMenu onPick={handleComfortPick} />
        </SakhiRow>
      );
    }

    if (msg.type === "breathingAnim") {
      return (
        <SakhiRow key={i}>
          <BreathingAnimation />
        </SakhiRow>
      );
    }

    if (msg.type === "musicCard") {
      return (
        <SakhiRow key={i}>
          <MusicCard />
        </SakhiRow>
      );
    }

    if (msg.type === "jokeCard") {
      return (
        <SakhiRow key={i}>
          <JokeCard />
        </SakhiRow>
      );
    }

    if (msg.type === "weekView") {
      return (
        <SakhiRow key={i}>
          <WeekView days={msg.days} />
        </SakhiRow>
      );
    }

    if (msg.type === "forWhomPicker") {
      return (
        <SakhiRow key={i}>
          <Bubble
            text={t(
              "नमस्ते! यह मूड लॉग आपके लिए है या किसी और के लिए?",
              "Hello! Is this mood log for you or for someone else?",
            )}
          />
          <ForWhomCard
            locked={forWhomLocked}
            selected={selectedForWhom}
            onPick={handleForWhomPick}
          />
        </SakhiRow>
      );
    }

    if (msg.type === "moodPicker") {
      return (
        <SakhiRow key={i}>
          <MoodPicker locked={moodLocked} selected={selectedMood} onPick={handleMoodPick} />
        </SakhiRow>
      );
    }

    if (msg.type === "chipPicker") {
      return (
        <SakhiRow key={i}>
          <ChipPicker locked={chipLocked} selected={selectedChip} onPick={handleChipPick} />
        </SakhiRow>
      );
    }

    if (msg.type === "confirmation") {
      return (
        <SakhiRow key={i}>
          <ConfirmationCard mood={msg.mood} phase={PHASE} isReturning={msg.isReturning} />
        </SakhiRow>
      );
    }

    if (msg.type === "contentLink") {
      // Isolated builds have no health-content route to link into — hide the card.
      if (isIsolated) return null;
      return (
        <SakhiRow key={i}>
          <ContentLinkCard
            onTap={() =>
              router.push(`/womens-health/health-content?q=${encodeURIComponent(msg.query)}`)
            }
          />
        </SakhiRow>
      );
    }

    return null;
  }

  return (
    <div className="relative flex h-full flex-col" style={{ background: C.chatBg }}>
      <main
        className="min-h-0 flex-1 [scrollbar-width:none] overflow-y-auto px-3 pb-4 [&::-webkit-scrollbar]:hidden"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 76px + 40px)" }}
      >
        <div className="mx-auto flex w-full max-w-md flex-col gap-3">
          {/* Date separator */}
          <div
            className="py-1 text-center text-[10px] font-semibold tracking-wide"
            style={{ color: C.textTertiary }}
          >
            {t("आज", "Today")} ·{" "}
            {new Date().toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", {
              day: "numeric",
              month: "long",
            })}
          </div>

          {messages.map((m, i) => renderMessage(m, i))}

          {(loading || flowLoading) && <LoadingDots />}

          <div ref={bottomRef} />
        </div>
      </main>

      {/* Phase banner sits just below the HubHeader — cycle-derived, so it's
          hidden on a neutral open and revealed only once she logs today. */}
      {showPhase && (
        <div
          className="fixed right-0 left-0 z-10"
          style={{ top: "calc(env(safe-area-inset-top, 0px) + 76px)" }}
        >
          <PhaseBanner phase={PHASE} />
        </div>
      )}

      <HubHeader
        title={t("सखी", "Sakhi")}
        backHref="/womens-health"
        onBack={handleBack}
        hideBack={isIsolated}
        scrolled={false}
      />
      <HubChatInput
        variant="sleek"
        placeholder={t("कुछ और बताना चाहती हैं...", "Anything else you'd like to share...")}
        onSubmit={handleSubmit}
      />
      <SessionPrivacyNote lang={lang} open={privacyOpen} onResolved={goHome} />
    </div>
  );
}
