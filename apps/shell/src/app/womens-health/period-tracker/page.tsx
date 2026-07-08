"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { HubHeader } from "@/app/jobs/design-prototype/HubHeader";
import { HubChatInput } from "@/app/jobs/design-prototype/HubChatInput";
import {
  askSakhi,
  getHomeRemedies,
  isMaleIdentifier,
  MALE_RESPONSE,
  MALE_RESPONSE_EN,
  type Remedy,
} from "@/lib/sakhi";
import { useLang } from "../LangContext";

type SakhiTurn = { role: "user" | "assistant"; content: string };

// ── Design tokens (from sakhi_cycle_tracker_ui.html) ─────────────────────────
const C = {
  gulabi: "#E8536A",
  gulabiLight: "#FDEEF0",
  gulabiMid: "#F0899A",
  gulabiPale: "#FDF2F4",
  raat: "#2D1B4E",
  raatMid: "#5A3E7A",
  raatLight: "#F2EDF8",
  mint: "#2AAF7A",
  mintLight: "#E5F7F0",
  amber: "#E8A020",
  amberLight: "#FEF6E4",
  chai: "#C4884A",
  chaiLight: "#FDF3E8",
  surface: "#FFFFFF",
  textPrimary: "#1A0E2E",
  textSecondary: "#6B5580",
  textTertiary: "#9E8BB0",
  border: "rgba(45,27,78,0.09)",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const MONTHS_HI = [
  "जनवरी",
  "फरवरी",
  "मार्च",
  "अप्रैल",
  "मई",
  "जून",
  "जुलाई",
  "अगस्त",
  "सितंबर",
  "अक्तूबर",
  "नवंबर",
  "दिसंबर",
];
const MONTHS_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAYS_SHORT = ["र", "सो", "मं", "बु", "गु", "शु", "श"];
const DAYS_SHORT_EN = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function buildCells(year: number, month: number) {
  const first = new Date(year, month, 1).getDay();
  const total = new Date(year, month + 1, 0).getDate();
  return [...Array(first).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)] as (
    | number
    | null
  )[];
}
function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}
function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function getCycleDay(lastPeriod: Date) {
  return Math.max(1, Math.ceil((Date.now() - lastPeriod.getTime()) / 86400000) + 1);
}
// Work out an average cycle length from a set of period start dates. Gaps that
// look like one cycle (15-45 days) count directly; a ~2-month gap (46-75, when a
// month in between was skipped) is halved. Returns null if nothing usable.
function computeCycle(dates: Date[]): number | null {
  const sorted = [...dates].sort((a, b) => b.getTime() - a.getTime());
  const gaps: number[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const g = Math.round((sorted[i].getTime() - sorted[i + 1].getTime()) / 86400000);
    if (g >= 15 && g <= 45) gaps.push(g);
    else if (g > 45 && g <= 75) gaps.push(Math.round(g / 2));
  }
  if (!gaps.length) return null;
  return Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
}
function getPhase(day: number, len: number) {
  if (day <= 5) return "Menstrual";
  if (day <= len - 15) return "Follicular";
  if (day <= len - 14) return "Ovulation";
  return "Luteal";
}
function parseForWhom(text: string): ForWhom {
  const t = text.trim().toLowerCase();
  const self = ["मेरे लिए", "मेरे", "खुद", "for me", "myself", "self", "mere liye", "mujhe"];
  const other = [
    "किसी और",
    "उनके लिए",
    "for someone",
    "other",
    "kisi aur",
    "unke liye",
    "wife",
    "sister",
    "husband",
    "friend",
    "maa",
    "mummy",
    "beti",
    "didi",
    "behen",
  ];
  if (self.some((k) => t.includes(k))) return "self";
  if (other.some((k) => t.includes(k))) return "other";
  return null;
}
function parseCycleLength(text: string): number | null {
  const match = text.match(/\d{2}/);
  if (!match) return null;
  const n = parseInt(match[0], 10);
  return n >= 15 && n <= 45 ? n : null;
}

// ── Phase arc ─────────────────────────────────────────────────────────────────
function PhaseArc({ day, len }: { day: number; len: number }) {
  const { lang } = useLang();
  const t = (hi: string, en: string) => (lang === "hi" ? hi : en);
  const pct = Math.min((day - 1) / Math.max(len - 1, 1), 1);
  const cx = 110,
    cy = 108,
    r = 86;
  const angle = Math.PI - pct * Math.PI;
  const dotX = cx + r * Math.cos(angle);
  const dotY = cy - r * Math.sin(angle);
  const phase = getPhase(day, len);
  const phaseLabels: Record<string, string> = {
    Menstrual: t("मासिक चरण", "Menstrual"),
    Follicular: t("फॉलिकुलर चरण", "Follicular"),
    Ovulation: t("ओव्यूलेशन", "Ovulation"),
    Luteal: t("लुटियल चरण", "Luteal"),
  };
  const daysLeft = len - day;
  return (
    <div style={{ background: C.raat, borderRadius: "16px 16px 0 0", padding: "14px 16px 4px" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
        }}
      >
        <svg width="200" height="112" viewBox="0 0 220 120" fill="none">
          <path
            d="M 24 108 A 86 86 0 0 1 196 108"
            stroke="rgba(255,255,255,0.10)"
            strokeWidth="11"
            strokeLinecap="round"
          />
          <path
            d="M 24 108 A 86 86 0 0 1 60 36"
            stroke={C.gulabiMid}
            strokeWidth="11"
            strokeLinecap="round"
          />
          <path
            d="M 60 36 A 86 86 0 0 1 110 18"
            stroke={C.mint}
            strokeWidth="11"
            strokeLinecap="round"
          />
          <path
            d="M 110 18 A 86 86 0 0 1 158 36"
            stroke={C.amber}
            strokeWidth="11"
            strokeLinecap="round"
          />
          <path
            d="M 158 36 A 86 86 0 0 1 196 108"
            stroke="rgba(138,75,200,0.35)"
            strokeWidth="11"
            strokeLinecap="round"
          />
          <circle cx={dotX} cy={dotY} r="8" fill={C.gulabi} stroke="white" strokeWidth="3" />
          <text
            x="16"
            y="100"
            fontSize="8"
            fill="rgba(255,255,255,0.35)"
            fontFamily="-apple-system,sans-serif"
            fontWeight="600"
          >
            {t("मासिक", "Men.")}
          </text>
          <text
            x="54"
            y="28"
            fontSize="8"
            fill="rgba(255,255,255,0.35)"
            fontFamily="-apple-system,sans-serif"
            fontWeight="600"
          >
            {t("फॉलि.", "Foll.")}
          </text>
          <text
            x="100"
            y="14"
            fontSize="8"
            fill="rgba(255,255,255,0.35)"
            fontFamily="-apple-system,sans-serif"
            fontWeight="600"
          >
            {t("ओव्यु.", "Ovu.")}
          </text>
          <text
            x="152"
            y="28"
            fontSize="8"
            fill="rgba(255,255,255,0.55)"
            fontFamily="-apple-system,sans-serif"
            fontWeight="700"
          >
            {t("लुटियल", "Lut.")}
          </text>
        </svg>
        <div style={{ position: "absolute", bottom: 10, textAlign: "center" }}>
          <div
            style={{
              fontSize: 36,
              fontWeight: 900,
              color: "#fff",
              lineHeight: 1,
              letterSpacing: -1,
              fontFamily: "JioType, sans-serif",
            }}
          >
            {day}
          </div>
          <div
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.45)",
              marginTop: 2,
              fontFamily: "JioType, sans-serif",
            }}
          >
            {t("Cycle दिन", "Cycle Day")}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "center", padding: "8px 0 6px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "4px 12px",
            borderRadius: 20,
            background: "rgba(232,83,106,0.2)",
          }}
        >
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.gulabiMid }} />
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: C.gulabiMid,
              fontFamily: "JioType, sans-serif",
            }}
          >
            {phaseLabels[phase]}
            {daysLeft > 0 ? ` · ${daysLeft} ${t("दिन बाकी", "days left")}` : ""}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Stats strip ───────────────────────────────────────────────────────────────
function StatsStrip({
  len,
  nextPeriod,
  hideLen = false,
}: {
  len: number;
  nextPeriod: Date;
  hideLen?: boolean;
}) {
  const { lang } = useLang();
  const t = (hi: string, en: string) => (lang === "hi" ? hi : en);
  const daysLeft = Math.ceil((nextPeriod.getTime() - Date.now()) / 86400000);
  const fmt = (d: Date) =>
    d.toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", { day: "numeric", month: "short" });
  const stats = [
    { val: hideLen ? "—" : `${len}`, lbl: "Cycle" },
    {
      val: daysLeft > 0 ? `${daysLeft} ${t("दिन", "days")}` : t("जल्द", "Soon"),
      lbl: t("अगला पीरियड", "Next Period"),
    },
    { val: fmt(nextPeriod), lbl: t("तारीख", "Date") },
  ];
  return (
    <div style={{ background: C.raat, borderRadius: "0 0 16px 16px", padding: "0 14px 14px" }}>
      <div
        style={{
          display: "flex",
          background: "rgba(255,255,255,0.07)",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {stats.map((s, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              padding: "9px 4px",
              textAlign: "center",
              borderRight: i < 2 ? "1px solid rgba(255,255,255,0.07)" : "none",
            }}
          >
            <div
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: "#fff",
                lineHeight: 1.1,
                fontFamily: "JioType, sans-serif",
              }}
            >
              {s.val}
            </div>
            <div
              style={{
                fontSize: 9,
                color: "rgba(255,255,255,0.38)",
                marginTop: 2,
                textTransform: "uppercase" as const,
                letterSpacing: "0.3px",
                fontFamily: "JioType, sans-serif",
              }}
            >
              {s.lbl}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Color-coded prediction calendar ──────────────────────────────────────────
function PredictionCalendar({ lastPeriod, len }: { lastPeriod: Date; len: number }) {
  const { lang } = useLang();
  const t = (hi: string, en: string) => (lang === "hi" ? hi : en);
  const MONTHS = lang === "hi" ? MONTHS_HI : MONTHS_EN;
  const DAYS = lang === "hi" ? DAYS_SHORT : DAYS_SHORT_EN;
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const cells = buildCells(year, month);

  const periodDays: Date[] = [],
    fertileDays: Date[] = [],
    ovDays: Date[] = [];
  for (let c = -1; c <= 3; c++) {
    const start = addDays(lastPeriod, c * len);
    for (let d = 0; d < 5; d++) periodDays.push(addDays(start, d));
    const ov = addDays(start, len - 14);
    ovDays.push(ov);
    for (let d = -4; d <= 4; d++) {
      if (d !== 0) fertileDays.push(addDays(ov, d));
    }
  }

  function dayStyle(day: number): React.CSSProperties {
    const d = new Date(year, month, day);
    const isPast = d < today && !sameDay(d, today);
    const isToday = sameDay(d, today);
    const isPeriod = periodDays.some((p) => sameDay(p, d));
    const isOv = ovDays.some((o) => sameDay(o, d));
    const isFertile = fertileDays.some((f) => sameDay(f, d));
    if (isToday) return { background: C.raat, color: "#fff", fontWeight: 800 };
    if (isPeriod && isPast) return { background: C.gulabi, color: "#fff", fontWeight: 700 };
    if (isPeriod)
      return {
        background: C.gulabiPale,
        color: C.gulabi,
        fontWeight: 600,
        outline: `1.5px dashed ${C.gulabiMid}`,
        outlineOffset: "-1px",
      };
    if (isOv && isPast) return { background: C.amber, color: "#fff", fontWeight: 800 };
    if (isOv) return { background: C.amberLight, color: C.amber, fontWeight: 700 };
    if (isFertile && isPast) return { background: C.mint, color: "#fff" };
    if (isFertile) return { background: C.mintLight, color: C.mint };
    return { color: isPast ? C.textTertiary : C.textPrimary };
  }

  function prev() {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  }
  function next() {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  }

  return (
    <div
      style={{
        background: C.surface,
        borderRadius: 16,
        padding: "12px 12px 10px",
        boxShadow: "0 2px 10px rgba(45,27,78,0.08)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: C.raat,
            fontFamily: "JioType, sans-serif",
          }}
        >
          {MONTHS[month]} {year}
        </span>
        <div style={{ display: "flex", gap: 4 }}>
          {(["‹", "›"] as const).map((ch, i) => (
            <button
              key={ch}
              onClick={i === 0 ? prev : next}
              style={{
                width: 26,
                height: 26,
                borderRadius: 8,
                background: C.raatLight,
                border: "none",
                cursor: "pointer",
                fontWeight: 700,
                color: C.raatMid,
                fontSize: 15,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {ch}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", marginBottom: 3 }}>
        {DAYS.map((d) => (
          <div
            key={d}
            style={{
              textAlign: "center",
              fontSize: 9,
              fontWeight: 700,
              color: C.textTertiary,
              padding: "2px 0",
              fontFamily: "JioType, sans-serif",
            }}
          >
            {d}
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          return (
            <div
              key={day}
              style={{
                aspectRatio: "1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                borderRadius: 8,
                fontFamily: "JioType, sans-serif",
                ...dayStyle(day),
              }}
            >
              {day}
            </div>
          );
        })}
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          marginTop: 10,
          paddingTop: 10,
          borderTop: `1px solid ${C.border}`,
        }}
      >
        {[
          { color: C.gulabi, label: t("पीरियड", "Period") },
          { color: C.mint, label: t("फर्टाइल", "Fertile") },
          { color: C.amber, label: t("ओव्यूलेशन", "Ovulation") },
          { color: C.raat, label: t("आज", "Today") },
          { color: C.gulabiPale, label: t("अनुमानित", "Predicted"), dashed: true },
        ].map((l) => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <div
              style={{
                width: 9,
                height: 9,
                borderRadius: 3,
                background: l.color,
                border: l.dashed ? `1.5px dashed ${C.gulabiMid}` : "none",
              }}
            />
            <span
              style={{
                fontSize: 9,
                fontWeight: 600,
                color: C.textTertiary,
                textTransform: "uppercase" as const,
                letterSpacing: "0.3px",
                fontFamily: "JioType, sans-serif",
              }}
            >
              {l.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Phase insight card ────────────────────────────────────────────────────────
const PHASE_INFO: Record<string, { body: string; bodyEn: string; tip: string; tipEn: string }> = {
  Menstrual: {
    body: "इस चरण में गर्भाशय की परत निकल रही है — थकान और ऐंठन होना स्वाभाविक है। यह आराम का समय है।",
    bodyEn:
      "The uterine lining is shedding — fatigue and cramps are natural. This is a time to rest.",
    tip: "💡 गर्म पानी की बोतल, हल्का योग, और पालक-दालें जैसे आयरन-रिच खाने से सबसे ज़्यादा राहत मिलती है।",
    tipEn:
      "💡 A hot water bottle, gentle yoga, and iron-rich foods like spinach and lentils provide the most relief.",
  },
  Follicular: {
    body: "Estrogen बढ़ रहा है — ऊर्जा और मूड दोनों बेहतर होते हैं। नए काम शुरू करने का यह अच्छा समय है।",
    bodyEn:
      "Estrogen is rising — energy and mood both improve. This is a great time to start new things.",
    tip: "💡 इस phase में exercise और नई चुनौतियाँ लेना आसान लगता है — हॉर्मोन आपके साथ हैं!",
    tipEn:
      "💡 Exercise and new challenges feel easier in this phase — your hormones are on your side!",
  },
  Ovulation: {
    body: "आज के आसपास ओव्यूलेशन होता है — यह सबसे उपजाऊ समय है। Estrogen peak पर है।",
    bodyEn:
      "Ovulation occurs around today — this is your most fertile time. Estrogen is at its peak.",
    tip: "💡 आज आप सबसे अधिक ऊर्जावान और मिलनसार महसूस कर सकती हैं — यह LH surge का असर है।",
    tipEn: "💡 You may feel most energetic and social today — this is the effect of the LH surge.",
  },
  Luteal: {
    body: "Progesterone बढ़ रहा है — हल्की थकान और मूड बदलाव सामान्य हैं। यह आपका आराम करने का संकेत है।",
    bodyEn:
      "Progesterone is rising — mild fatigue and mood changes are normal. This is your cue to rest.",
    tip: "💡 हल्की walk, गर्म chai, और आयरन-रिच खाना इस phase में सबसे ज़्यादा मदद करता है।",
    tipEn: "💡 A light walk, warm chai, and iron-rich food help the most in this phase.",
  },
};

function PhaseInsightCard({ day, len }: { day: number; len: number }) {
  const { lang } = useLang();
  const t = (hi: string, en: string) => (lang === "hi" ? hi : en);
  const phase = getPhase(day, len);
  const info = PHASE_INFO[phase];
  return (
    <div
      style={{
        background: C.surface,
        borderRadius: 16,
        padding: "12px 14px",
        boxShadow: `0 1px 6px ${C.border}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 8,
          flexWrap: "wrap" as const,
        }}
      >
        <span
          style={{
            padding: "3px 10px",
            borderRadius: 20,
            fontSize: 10,
            fontWeight: 700,
            textTransform: "uppercase" as const,
            letterSpacing: "0.4px",
            background: "#F0EBFF",
            color: "#7C3AED",
            fontFamily: "JioType, sans-serif",
          }}
        >
          {phase}
        </span>
        <span
          style={{
            padding: "3px 10px",
            borderRadius: 20,
            fontSize: 10,
            fontWeight: 700,
            background: C.gulabiLight,
            color: C.gulabi,
            fontFamily: "JioType, sans-serif",
          }}
        >
          D{day} of {len}
        </span>
      </div>
      <p
        style={{
          fontSize: 12,
          color: C.textSecondary,
          lineHeight: 1.6,
          fontFamily: "JioType, sans-serif",
        }}
      >
        {t(info.body, info.bodyEn)}
      </p>
      <div
        style={{
          marginTop: 8,
          padding: "8px 10px",
          background: C.chaiLight,
          borderRadius: 10,
          fontSize: 11,
          color: C.chai,
          fontWeight: 600,
          lineHeight: 1.4,
          fontFamily: "JioType, sans-serif",
        }}
      >
        {t(info.tip, info.tipEn)}
      </div>
    </div>
  );
}

// ── Symptom chips ─────────────────────────────────────────────────────────────
const SYMPTOMS = [
  { hi: "थकान", en: "Fatigue" },
  { hi: "मूड बदलाव", en: "Mood swings" },
  { hi: "Bloating", en: "Bloating" },
  { hi: "दर्द", en: "Pain" },
  { hi: "Nausea", en: "Nausea" },
  { hi: "सिरदर्द", en: "Headache" },
  { hi: "Pimples", en: "Pimples" },
  { hi: "नींद कम", en: "Poor sleep" },
  { hi: "भूख कम", en: "Low appetite" },
  { hi: "पीठ दर्द", en: "Back pain" },
];

function SymptomChipsCard({ onDone }: { onDone: (s: string[]) => void }) {
  const { lang } = useLang();
  const t = (hi: string, en: string) => (lang === "hi" ? hi : en);
  const [sel, setSel] = useState<string[]>([]);
  const toggle = (s: string) =>
    setSel((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));
  return (
    <div
      style={{
        background: C.surface,
        borderRadius: 16,
        padding: "12px 14px",
        boxShadow: `0 1px 6px ${C.border}`,
      }}
    >
      <span
        style={{
          display: "block",
          marginBottom: 10,
          fontSize: 13,
          fontWeight: 800,
          color: C.raat,
          fontFamily: "JioType, sans-serif",
        }}
      >
        {t(
          "आपको क्या महसूस हो रहा है? (जो लागू हो, चुनें)",
          "What are you feeling? (tap all that apply)",
        )}
      </span>
      <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6 }}>
        {SYMPTOMS.map((s) => {
          const label = t(s.hi, s.en);
          return (
            <button
              key={s.hi}
              onClick={() => toggle(s.hi)}
              style={{
                padding: "5px 11px",
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
                background: sel.includes(s.hi) ? C.raat : C.surface,
                color: sel.includes(s.hi) ? "#fff" : C.textSecondary,
                border: `1.5px solid ${sel.includes(s.hi) ? C.raat : C.border}`,
                fontFamily: "JioType, sans-serif",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
      {/* No "save" step — taps are kept automatically. This just moves on;
          it also works with nothing selected (treated as "no symptoms"). */}
      <button
        onClick={() => onDone(sel)}
        style={{
          marginTop: 12,
          width: "100%",
          padding: "9px 0",
          borderRadius: 12,
          fontSize: 12,
          fontWeight: 700,
          background: sel.length > 0 ? C.gulabi : C.raatLight,
          color: sel.length > 0 ? "#fff" : C.raatMid,
          border: "none",
          cursor: "pointer",
          fontFamily: "JioType, sans-serif",
        }}
      >
        {sel.length > 0 ? t("हो गया ✓", "Done ✓") : t("कुछ नहीं / आगे बढ़ें", "Nothing / Continue")}
      </button>
    </div>
  );
}

// ── Home remedies card — LLM-generated, kitchen/home-only, icon per remedy ─────
function HomeRemediesCard({ remedies }: { remedies: Remedy[] }) {
  const { lang } = useLang();
  const t = (hi: string, en: string) => (lang === "hi" ? hi : en);
  return (
    <div
      style={{
        background: C.surface,
        borderRadius: 16,
        padding: "12px 14px",
        boxShadow: `0 1px 6px ${C.border}`,
      }}
    >
      <span
        style={{
          display: "block",
          marginBottom: 10,
          fontSize: 13,
          fontWeight: 800,
          color: C.raat,
          fontFamily: "JioType, sans-serif",
        }}
      >
        {t("घर पर आज़माएं 🏡", "Try at home 🏡")}
      </span>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {remedies.map((r, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: C.chaiLight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 15,
                flexShrink: 0,
              }}
            >
              {r.icon}
            </div>
            <span
              style={{
                fontSize: 12,
                color: C.textSecondary,
                fontFamily: "JioType, sans-serif",
                lineHeight: 1.4,
              }}
            >
              {r.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Date picker calendar ──────────────────────────────────────────────────────
function DatePickerCalendar({
  onDatePick,
  title,
  onSkip,
  initialDate,
}: {
  onDatePick: (label: string, date: Date) => void;
  title?: string;
  onSkip?: () => void;
  initialDate?: Date;
}) {
  const { lang } = useLang();
  const t = (hi: string, en: string) => (lang === "hi" ? hi : en);
  const MONTHS = lang === "hi" ? MONTHS_HI : MONTHS_EN;
  const DAYS = lang === "hi" ? DAYS_SHORT : DAYS_SHORT_EN;
  const today = new Date();
  const base = initialDate ?? today;
  const [year, setYear] = useState(base.getFullYear());
  const [month, setMonth] = useState(base.getMonth());
  const [picked, setPicked] = useState<number | null>(null);
  const cells = buildCells(year, month);

  function pickDay(day: number) {
    setPicked(day);
    onDatePick(`${day} ${MONTHS[month]}`, new Date(year, month, day));
  }
  function prev() {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  }
  function next() {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  }

  return (
    <div
      style={{
        background: C.surface,
        borderRadius: 16,
        padding: "12px 12px 10px",
        boxShadow: "0 2px 10px rgba(45,27,78,0.08)",
      }}
    >
      <p
        style={{
          fontSize: 12,
          color: C.textTertiary,
          marginBottom: 8,
          fontFamily: "JioType, sans-serif",
        }}
      >
        {title ?? t("आखिरी पीरियड की तारीख चुनें", "Select date of your last period")}
      </p>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: C.raat,
            fontFamily: "JioType, sans-serif",
          }}
        >
          {MONTHS[month]} {year}
        </span>
        <div style={{ display: "flex", gap: 4 }}>
          {(["‹", "›"] as const).map((ch, i) => (
            <button
              key={ch}
              onClick={i === 0 ? prev : next}
              style={{
                width: 26,
                height: 26,
                borderRadius: 8,
                background: C.raatLight,
                border: "none",
                cursor: "pointer",
                fontWeight: 700,
                color: C.raatMid,
                fontSize: 15,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {ch}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", marginBottom: 3 }}>
        {DAYS.map((d) => (
          <div
            key={d}
            style={{
              textAlign: "center",
              fontSize: 9,
              fontWeight: 700,
              color: C.textTertiary,
              fontFamily: "JioType, sans-serif",
            }}
          >
            {d}
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const isToday =
            day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          const isFuture = new Date(year, month, day) > today;
          const isPicked = day === picked;
          return (
            <button
              key={day}
              disabled={isFuture}
              onClick={() => pickDay(day)}
              style={{
                aspectRatio: "1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: isPicked || isToday ? 800 : 500,
                borderRadius: 8,
                background: isPicked ? C.gulabi : isToday ? C.gulabiLight : "transparent",
                color: isPicked
                  ? "#fff"
                  : isToday
                    ? C.gulabi
                    : isFuture
                      ? C.textTertiary
                      : C.textPrimary,
                border: "none",
                cursor: isFuture ? "default" : "pointer",
                fontFamily: "JioType, sans-serif",
              }}
            >
              {day}
            </button>
          );
        })}
      </div>
      {onSkip && (
        <button
          onClick={onSkip}
          style={{
            marginTop: 8,
            width: "100%",
            padding: "8px 0",
            borderRadius: 12,
            fontSize: 12,
            fontWeight: 600,
            background: C.raatLight,
            color: C.raatMid,
            border: "none",
            cursor: "pointer",
            fontFamily: "JioType, sans-serif",
          }}
        >
          {t("मुझे याद नहीं", "I don't remember")}
        </button>
      )}
    </div>
  );
}

// ── Cycle length picker ───────────────────────────────────────────────────────
function CycleLengthCard({ onPick }: { onPick: (d: number, unsure?: boolean) => void }) {
  const { lang } = useLang();
  const t = (hi: string, en: string) => (lang === "hi" ? hi : en);
  return (
    <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6 }}>
      {/* "Unsure" first — an easy, non-judgmental starting choice.
          Silently assumes 28 (the number is never shown in chat). */}
      <button
        onClick={() => onPick(28, true)}
        style={{
          padding: "6px 14px",
          borderRadius: 20,
          fontSize: 12,
          fontWeight: 600,
          background: C.gulabiLight,
          color: C.gulabi,
          border: `1px dashed ${C.gulabiMid}`,
          cursor: "pointer",
          fontFamily: "JioType, sans-serif",
        }}
      >
        {t("मुझे पता नहीं", "I'm not sure")}
      </button>
      {[21, 24, 26, 28, 30, 32, 35].map((d) => (
        <button
          key={d}
          onClick={() => onPick(d)}
          style={{
            padding: "6px 14px",
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 600,
            background: C.raatLight,
            color: C.raat,
            border: `1px solid ${C.border}`,
            cursor: "pointer",
            fontFamily: "JioType, sans-serif",
          }}
        >
          {d} {t("दिन", "days")}
        </button>
      ))}
    </div>
  );
}

// ── Reminder pickers ──────────────────────────────────────────────────────────
function ReminderAskCard({ onYes, onNo }: { onYes: () => void; onNo: () => void }) {
  const { lang } = useLang();
  const t = (hi: string, en: string) => (lang === "hi" ? hi : en);
  return (
    <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
      <button
        onClick={onYes}
        style={{
          flex: 1,
          borderRadius: 20,
          padding: "10px 0",
          fontSize: 13,
          fontWeight: 600,
          color: "#fff",
          background: C.gulabi,
          border: "none",
          cursor: "pointer",
          fontFamily: "JioType, sans-serif",
        }}
      >
        {t("हां, याद दिलाएं 🔔", "Yes, remind me 🔔")}
      </button>
      <button
        onClick={onNo}
        style={{
          flex: 1,
          borderRadius: 20,
          padding: "10px 0",
          fontSize: 13,
          fontWeight: 600,
          color: C.raatMid,
          background: C.raatLight,
          border: "none",
          cursor: "pointer",
          fontFamily: "JioType, sans-serif",
        }}
      >
        {t("नहीं, अभी नहीं", "No, not now")}
      </button>
    </div>
  );
}

function ReminderDaysCard({ options, onPick }: { options: number[]; onPick: (n: number) => void }) {
  const { lang } = useLang();
  const t = (hi: string, en: string) => (lang === "hi" ? hi : en);
  return (
    <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6 }}>
      {options.map((n) => (
        <button
          key={n}
          onClick={() => onPick(n)}
          style={{
            padding: "6px 14px",
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 600,
            background: C.raatLight,
            color: C.raat,
            border: `1px solid ${C.border}`,
            cursor: "pointer",
            fontFamily: "JioType, sans-serif",
          }}
        >
          {t(`${n} दिन पहले`, `${n} day${n > 1 ? "s" : ""} before`)}
        </button>
      ))}
    </div>
  );
}

// ── For-whom picker ───────────────────────────────────────────────────────────
type ForWhom = "self" | "other" | null;

function ForWhomCard({ onPick }: { onPick: (v: ForWhom) => void }) {
  const { lang } = useLang();
  const t = (hi: string, en: string) => (lang === "hi" ? hi : en);
  return (
    <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
      <button
        onClick={() => onPick("self")}
        style={{
          flex: 1,
          borderRadius: 20,
          padding: "10px 0",
          fontSize: 13,
          fontWeight: 600,
          color: "#fff",
          background: C.raat,
          border: "none",
          cursor: "pointer",
          fontFamily: "JioType, sans-serif",
        }}
      >
        {t("मेरे लिए", "For me")}
      </button>
      <button
        onClick={() => onPick("other")}
        style={{
          flex: 1,
          borderRadius: 20,
          padding: "10px 0",
          fontSize: 13,
          fontWeight: 600,
          color: C.raatMid,
          background: C.raatLight,
          border: "none",
          cursor: "pointer",
          fontFamily: "JioType, sans-serif",
        }}
      >
        {t("किसी और के लिए", "For someone else")}
      </button>
    </div>
  );
}

// ── Content redirect card ─────────────────────────────────────────────────────
function ContentLinkCard({ onTap }: { onTap: () => void }) {
  const { lang } = useLang();
  const t = (hi: string, en: string) => (lang === "hi" ? hi : en);
  return (
    <button
      type="button"
      onClick={onTap}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        background: "#F3EEFF",
        border: "1.5px solid rgba(139,92,246,0.25)",
        borderRadius: "4px 16px 16px 16px",
        padding: "10px 12px",
        marginTop: 4,
        maxWidth: 260,
        cursor: "pointer",
        textAlign: "left",
        boxShadow: "0 1px 6px rgba(45,27,78,0.08)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: "#8B5CF6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            flexShrink: 0,
          }}
        >
          ✅
        </div>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: C.raat,
            fontFamily: "JioType, sans-serif",
          }}
        >
          {t("जाँची-परखी जानकारी देखें", "View Verified Information")}
        </span>
      </div>
      <p
        style={{
          fontSize: 11,
          color: C.raatMid,
          fontFamily: "JioType, sans-serif",
          lineHeight: 1.5,
          margin: 0,
        }}
      >
        {t(
          "इस विषय पर WHO और FOGSI द्वारा सत्यापित वीडियो और लेख उपलब्ध हैं",
          "Videos and articles on this topic verified by WHO and FOGSI are available",
        )}
      </p>
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "#8B5CF6",
          fontFamily: "JioType, sans-serif",
        }}
      >
        {t("अभी देखें →", "View now →")}
      </span>
    </button>
  );
}

// ── Continue touchpoint card ───────────────────────────────────────────────────
function ContinuePromptCard({
  label,
  buttonLabel,
  onContinue,
}: {
  label: string;
  buttonLabel: string;
  onContinue: () => void;
}) {
  return (
    <div
      style={{
        background: C.surface,
        borderRadius: 16,
        padding: "12px 14px",
        boxShadow: `0 1px 4px ${C.border}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 10,
      }}
    >
      <span
        style={{
          fontSize: 13,
          lineHeight: 1.5,
          color: C.textSecondary,
          fontFamily: "JioType, sans-serif",
        }}
      >
        {label}
      </span>
      <button
        onClick={onContinue}
        style={{
          alignSelf: "flex-start",
          padding: "7px 16px",
          borderRadius: 20,
          fontSize: 12,
          fontWeight: 700,
          background: C.gulabi,
          color: "#fff",
          border: "none",
          cursor: "pointer",
          fontFamily: "JioType, sans-serif",
          flexShrink: 0,
        }}
      >
        {buttonLabel}
      </button>
    </div>
  );
}

// ── MessageKind union ─────────────────────────────────────────────────────────
type MessageKind =
  | { type: "text"; role: "user" | "sakhi"; text: string; isLlm?: boolean }
  | { type: "forWhomPicker" }
  | {
      type: "calendar";
      onDatePick: (label: string, date: Date) => void;
      title?: string;
      onSkip?: () => void;
      initialDate?: Date;
    }
  | { type: "cycleLength"; lastPeriod: Date; onPick: (days: number, unsure?: boolean) => void }
  | { type: "cycleOverview"; lastPeriod: Date; cycleLength: number; unsure?: boolean }
  | { type: "reminderAsk"; onYes: () => void; onNo: () => void }
  | { type: "reminderDays"; options: number[]; onPick: (n: number) => void }
  | { type: "phaseInsight"; day: number; cycleLength: number }
  | { type: "continuePrompt"; label: string; buttonLabel: string; onContinue: () => void }
  | { type: "symptoms"; onDone: (s: string[]) => void }
  | { type: "homeRemedies"; remedies: Remedy[] }
  | { type: "remediesLoading" }
  | { type: "contentLink"; query: string };

// Reads the last saved cycle from localStorage (written by onCyclePick) to work
// out the current phase for the home-remedies LLM call.
function getCurrentPhaseFromStorage(): string | null {
  try {
    const raw = localStorage.getItem("sakhi_period");
    if (!raw) return null;
    const { lastPeriod, cycleLength } = JSON.parse(raw) as {
      lastPeriod: string;
      cycleLength: number;
    };
    const day = getCycleDay(new Date(lastPeriod));
    return getPhase(day, cycleLength);
  } catch {
    return null;
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function PeriodTrackerPage() {
  const router = useRouter();
  const { lang } = useLang();
  const t = (hi: string, en: string) => (lang === "hi" ? hi : en);
  const [lastPeriodDate, setLastPeriodDate] = useState<Date | null>(null);
  const [step, setStep] = useState<"forWhom" | "date" | "cycleLength" | "chat">("forWhom");
  const bottomRef = useRef<HTMLDivElement>(null);
  const scroll = () =>
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 60);

  const anyOtherQuestions = (): MessageKind => ({
    type: "text",
    role: "sakhi",
    text: t(
      "कोई और सवाल? जैसे — देरी क्यों होती है, दर्द कम कैसे करें, या कुछ और।",
      "Any other questions? Like — why is there a delay, how to reduce pain, or anything else.",
    ),
  });

  function onSymptomsDone(selected: string[]) {
    if (selected.length === 0) {
      setMessages((prev) => [
        ...prev.filter((m) => m.type !== "symptoms"),
        {
          type: "text",
          role: "sakhi",
          text: t(
            "कोई symptoms नहीं — बहुत अच्छा! 💜 फिर भी कुछ पूछना हो तो मैं यहीं हूँ।",
            "No symptoms — wonderful! 💜 I'm right here whenever you'd like to ask anything.",
          ),
        },
        anyOtherQuestions(),
      ]);
      scroll();
      return;
    }

    const names = selected.map((k) => {
      const s = SYMPTOMS.find((x) => x.hi === k);
      return s ? t(s.hi, s.en) : k;
    });

    setMessages((prev) => [
      ...prev.filter((m) => m.type !== "symptoms"),
      {
        type: "text",
        role: "sakhi",
        text: t(
          `समझ गई। 💜 आपके बताए लक्षण (${names.join(", ")}) इस phase में कई महिलाओं को होते हैं — आप अकेली नहीं हैं। कुछ आसान घरेलू उपाय जो राहत दे सकते हैं:`,
          `I understand. 💜 The symptoms you shared (${names.join(", ")}) are common for many women in this phase — you're not alone. Here are some simple home remedies that may help:`,
        ),
      },
      { type: "remediesLoading" },
    ]);
    scroll();

    const phase = getCurrentPhaseFromStorage() ?? "Menstrual";
    getHomeRemedies(phase, names, lang).then((remedies) => {
      setMessages((prev) => [
        ...prev.filter((m) => m.type !== "remediesLoading"),
        { type: "homeRemedies", remedies },
        {
          type: "text",
          role: "sakhi",
          text: t(
            "अगर कोई तकलीफ़ बहुत ज़्यादा हो या कई दिन बनी रहे, तो डॉक्टर से ज़रूर मिलें।",
            "If any symptom feels very severe or lasts several days, please do see a doctor.",
          ),
        },
        anyOtherQuestions(),
      ]);
      scroll();
    });
  }

  function onCyclePick(
    days: number,
    lp: Date,
    opts: { unsure?: boolean; userText?: string | null } = {},
  ) {
    const unsure = opts.unsure ?? false;
    // Save to localStorage so mood tracker can read real cycle data
    localStorage.setItem(
      "sakhi_period",
      JSON.stringify({ lastPeriod: lp.toISOString(), cycleLength: days }),
    );
    const nextPeriod = addDays(lp, days);
    const daysUntil = Math.ceil((nextPeriod.getTime() - Date.now()) / 86400000);

    // When the user is unsure, silently assume a typical cycle — never surface
    // the assumed number in the chat.
    const cycleReflection = unsure
      ? t(
          "कोई बात नहीं! 💜 अभी के लिए मैं एक सामान्य cycle मानकर अनुमान लगा रही हूँ — जैसे-जैसे आप पीरियड लॉग करेंगी, यह अनुमान और सटीक होता जाएगा।",
          "No problem at all! 💜 For now I'll estimate using a typical cycle — and as you log your periods, this will keep getting more accurate.",
        )
      : days < 24
        ? t(
            `आपका cycle ${days} दिन का है — यह थोड़ा छोटा है, पर कुछ महिलाओं में ऐसा होता है।`,
            `Your cycle is ${days} days — that's a bit short, but it happens in some women.`,
          )
        : days <= 35
          ? t(
              `आपका cycle ${days} दिन का है — यह बिल्कुल normal range में है। 👍`,
              `Your cycle is ${days} days — that's perfectly in the normal range. 👍`,
            )
          : t(
              `आपका cycle ${days} दिन का है — यह थोड़ा लंबा है, पर घबराएं नहीं, डॉक्टर से एक बार ज़रूर बात करें।`,
              `Your cycle is ${days} days — that's a bit long, but don't worry, do consult a doctor once.`,
            );

    const countdownMsg =
      daysUntil <= 0
        ? t(
            "आपका period आज या कल आ सकता है — तैयार रहें! 🩸",
            "Your period may come today or tomorrow — be ready! 🩸",
          )
        : daysUntil === 1
          ? t(
              "कल period आ सकता है — पैड या cup तैयार रख लें। 🩸",
              "Period may come tomorrow — keep a pad or cup ready. 🩸",
            )
          : daysUntil <= 5
            ? t(
                `बस ${daysUntil} दिन बाद period आ सकता है — कल दोबारा check करें। 🗓️`,
                `Period may come in just ${daysUntil} days — check again tomorrow. 🗓️`,
              )
            : t(
                `आपका अगला period लगभग ${daysUntil} दिन बाद आने की संभावना है।`,
                `Your next period is likely to come in about ${daysUntil} days.`,
              );

    // If the period is more than a day away, offer a reminder before moving to
    // symptoms. If it's due today/tomorrow, a reminder is pointless — skip it.
    const tail: MessageKind[] =
      daysUntil > 1
        ? [
            {
              type: "text",
              role: "sakhi",
              text: t(
                "क्या आप चाहेंगी कि मैं period से पहले आपको एक notification से याद दिला दूँ?",
                "Would you like me to remind you with a notification before your period?",
              ),
            },
            { type: "reminderAsk", onYes: () => onReminderYes(daysUntil), onNo: onReminderNo },
          ]
        : [symptomsOfferPrompt()];

    // The user's answer bubble: a caller can override it (e.g. show the date
    // they picked instead of "N days"), or pass null to suppress it.
    const userBubble: MessageKind[] =
      opts.userText === null
        ? []
        : [
            {
              type: "text",
              role: "user",
              text:
                opts.userText ??
                (unsure ? t("मुझे पता नहीं", "I'm not sure") : `${days} ${t("दिन", "days")}`),
            },
          ];

    setMessages((prev) => [
      ...prev.filter((m) => m.type !== "cycleLength" && m.type !== "calendar"),
      ...userBubble,
      { type: "text", role: "sakhi", text: cycleReflection },
      // Visual first — easier to absorb — then the countdown text below it.
      { type: "cycleOverview", lastPeriod: lp, cycleLength: days, unsure },
      { type: "text", role: "sakhi", text: countdownMsg },
      ...tail,
    ]);
    setStep("chat");
    scroll();
  }

  // Reusable symptoms offer — shown after the reminder step (or directly when a
  // reminder isn't offered).
  function symptomsOfferPrompt(): MessageKind {
    return {
      type: "continuePrompt",
      label: t(
        "इस समय के आसपास ज़्यादातर महिलाओं को शरीर और मन में एक जैसे बदलाव महसूस होते हैं। क्या आप बताना चाहेंगी कि आपको क्या महसूस हो रहा है? मैं कुछ आसान घरेलू उपाय बता सकती हूँ।",
        "Around this time in your cycle, most women feel the same kind of body and mood changes. Would you like to tell me what you feel? I can share some easy home remedies.",
      ),
      buttonLabel: t("हां, symptoms बताऊँ 📝", "Yes, share my symptoms 📝"),
      onContinue: () => showSymptomsStage(),
    };
  }

  function onReminderYes(daysUntil: number) {
    // Only offer reminder lead-times that still fall before the next period.
    const options = [1, 2, 3, 5, 7].filter((n) => n < daysUntil);
    setMessages((prev) => [
      ...prev.filter((m) => m.type !== "reminderAsk"),
      { type: "text", role: "user", text: t("हां, याद दिलाएं", "Yes, remind me") },
      {
        type: "text",
        role: "sakhi",
        text: t(
          "बढ़िया! period से कितने दिन पहले आपको याद दिलाऊँ?",
          "Great! How many days before your period should I remind you?",
        ),
      },
      { type: "reminderDays", options, onPick: onReminderDaysPick },
    ]);
    scroll();
  }

  function onReminderNo() {
    setMessages((prev) => [
      ...prev.filter((m) => m.type !== "reminderAsk"),
      { type: "text", role: "user", text: t("नहीं, अभी नहीं", "No, not now") },
      {
        type: "text",
        role: "sakhi",
        text: t(
          "कोई बात नहीं! जब चाहें, याद दिलाने के लिए कह सकती हैं। 💜",
          "No problem! You can ask me to remind you whenever you like. 💜",
        ),
      },
      symptomsOfferPrompt(),
    ]);
    scroll();
  }

  function onReminderDaysPick(n: number) {
    setMessages((prev) => [
      ...prev.filter((m) => m.type !== "reminderDays"),
      {
        type: "text",
        role: "user",
        text: t(`${n} दिन पहले`, `${n} day${n > 1 ? "s" : ""} before`),
      },
      {
        type: "text",
        role: "sakhi",
        text: t(
          `हो गया! ✅ मैं आपको period से ${n} दिन पहले एक notification भेज दूँगी, ताकि आप पहले से तैयार रह सकें।`,
          `Done! ✅ I'll send you a notification ${n} day${n > 1 ? "s" : ""} before your period, so you can get ready in time.`,
        ),
      },
      symptomsOfferPrompt(),
    ]);
    scroll();
  }

  function showSymptomsStage() {
    setMessages((prev) => [
      ...prev.filter((m) => m.type !== "continuePrompt"),
      { type: "symptoms", onDone: onSymptomsDone },
    ]);
    scroll();
  }

  function makeCalendarMsg(): MessageKind {
    return {
      type: "calendar",
      onDatePick: (label, date) => {
        setLastPeriodDate(date);
        setMessages((prev) => [
          ...prev.filter((m) => m.type !== "calendar"),
          {
            type: "text",
            role: "user",
            text: t(`आखिरी पीरियड: ${label}`, `Last period: ${label}`),
          },
          {
            type: "text",
            role: "sakhi",
            text: t(
              `${label} — नोट हो गया! 📝 एक और बात से बहुत मदद मिलेगी — आपके पिछले पीरियड की तारीख से मैं आपकी अगली तारीख ज़्यादा सही बता पाऊंगी।`,
              `${label} — got it! 📝 One more thing will help a lot — knowing your earlier periods lets me tell your next date more exactly.`,
            ),
          },
          ...prevMonthMessages(date, [date], 1),
        ]);
        setStep("date");
        scroll();
      },
    };
  }

  // Ask about the period in the month `step` months before the last period —
  // anchored to that month so it's easy to recall (e.g. "when did it come in
  // May?"). The calendar opens on that month; "I don't remember" is available.
  function prevMonthMessages(lmp: Date, collected: Date[], step: 1 | 2): MessageKind[] {
    const target = new Date(lmp.getFullYear(), lmp.getMonth() - step, 1);
    const monthName = (lang === "hi" ? MONTHS_HI : MONTHS_EN)[target.getMonth()];
    const question =
      step === 1
        ? t(
            `अच्छा! और ${monthName} में आपका पीरियड कब आया था?`,
            `Okay! And when did your period come in ${monthName}?`,
          )
        : t(`और ${monthName} में?`, `And in ${monthName}?`);
    return [
      { type: "text", role: "sakhi", text: question },
      {
        type: "calendar",
        title: t(`${monthName} में तारीख चुनें`, `Pick the date in ${monthName}`),
        initialDate: target,
        onSkip: () => onMonthAnswered(lmp, collected, step, null),
        onDatePick: (lbl, d) => onMonthAnswered(lmp, collected, step, d, lbl),
      },
    ];
  }

  function onMonthAnswered(
    lmp: Date,
    collected: Date[],
    step: 1 | 2,
    date: Date | null,
    label?: string,
  ) {
    const next = date ? [...collected, date] : collected;
    const userText = date && label ? label : t("मुझे याद नहीं", "I don't remember");

    if (step === 1) {
      // Move on to the month before that.
      setMessages((prev) => [
        ...prev.filter((m) => m.type !== "calendar"),
        { type: "text", role: "user", text: userText },
        ...prevMonthMessages(lmp, next, 2),
      ]);
      scroll();
      return;
    }

    // Step 2 done — work out the cycle from whichever dates we have.
    const cycle = computeCycle(next);
    if (cycle) {
      setMessages((prev) => [
        ...prev.filter((m) => m.type !== "calendar"),
        { type: "text", role: "user", text: userText },
      ]);
      onCyclePick(cycle, lmp, { userText: null });
    } else {
      // Not enough to compute — fall back to a gentle rough estimate.
      setMessages((prev) => [
        ...prev.filter((m) => m.type !== "calendar"),
        { type: "text", role: "user", text: userText },
        {
          type: "text",
          role: "sakhi",
          text: t(
            "कोई बात नहीं! 💜 तो बस अंदाज़े से बता दीजिए — आमतौर पर कितने दिन बाद आपका अगला पीरियड आता है? सबसे करीबी विकल्प चुनें।",
            "No problem at all! 💜 Then just give a rough idea — usually, after about how many days does your next period come? Pick the closest one.",
          ),
        },
        {
          type: "cycleLength",
          lastPeriod: lmp,
          onPick: (days, unsure) => onCyclePick(days, lmp, { unsure }),
        },
      ]);
      setStep("cycleLength");
      scroll();
    }
  }

  function handleForWhom(v: ForWhom, displayText?: string) {
    const userText =
      displayText ??
      (v === "self" ? t("मेरे लिए", "For me") : t("किसी और के लिए", "For someone else"));
    const valueText =
      v === "self"
        ? t(
            "यह बताने से मैं आपके लिए एक निजी रिमाइंडर सेट कर सकती हूँ — ताकि पीरियड कभी अचानक न आए। आप पहले से पैड या कप तैयार रख सकें, और अपना दिन, काम या कोई ज़रूरी काम उसी हिसाब से प्लान कर सकें। 📅",
            "If you tell me this, I can set a private reminder for you — so your period never comes as a surprise. You can keep pads or a cup ready, and plan your day, work, or any big event around it. 📅",
          )
        : t(
            "यह बताने से मैं एक निजी रिमाइंडर सेट कर सकती हूँ — ताकि पीरियड कभी अचानक न आए, वे पहले से सामान तैयार रख सकें और अपने दिन उसी हिसाब से प्लान कर सकें। 📅",
            "If you tell me this, I can set a private reminder — so her period never comes as a surprise. She can keep things ready and plan her days around it. 📅",
          );
    const sakhiText =
      v === "self"
        ? t("तो बताइए — आपका आखिरी पीरियड कब शुरू हुआ था?", "So, when did your last period start?")
        : t(
            "तो बताइए — उनका आखिरी पीरियड कब शुरू हुआ था?",
            "So, when did their last period start?",
          );
    setMessages((prev) => [
      ...prev.filter((m) => m.type !== "forWhomPicker"),
      { type: "text", role: "user", text: userText },
      { type: "text", role: "sakhi", text: valueText },
      { type: "text", role: "sakhi", text: sakhiText },
      makeCalendarMsg(),
    ]);
    setStep("date");
    scroll();
  }

  const [messages, setMessages] = useState<MessageKind[]>(() => [
    {
      type: "text",
      role: "sakhi",
      text:
        lang === "en"
          ? "Hi! I'm your Health Companion. 💜\n\nYour privacy is my priority. Everything you share stays between us. No ads, no data shared with anyone.\n\nFirst, tell me —"
          : "नमस्ते! मैं सखी हूँ — आपकी स्वास्थ्य सहेली। 💜\n\nआपका राज़ मेरा राज़ है। जो भी आप मुझसे कहेंगी — वो सिर्फ हमारे बीच रहेगा। कोई विज्ञापन नहीं, कोई जानकारी किसी के साथ साझा नहीं।\n\nपहले बताइए —",
    },
    { type: "forWhomPicker" },
  ]);

  const [loading, setLoading] = useState(false);

  async function handleSubmit(text: string) {
    if (!text.trim() || loading) return;
    const q = text.trim();

    if (isMaleIdentifier(q)) {
      setMessages((prev) => [
        ...prev,
        { type: "text", role: "user", text: q },
        { type: "text", role: "sakhi", text: lang === "en" ? MALE_RESPONSE_EN : MALE_RESPONSE },
      ]);
      scroll();
      return;
    }

    if (step === "forWhom") {
      const parsed = parseForWhom(q);
      if (parsed) {
        handleForWhom(parsed, q);
      } else {
        setMessages((prev) => [
          ...prev,
          { type: "text", role: "user", text: q },
          {
            type: "text",
            role: "sakhi",
            text: t(
              "माफ़ कीजिए, ठीक से समझ नहीं आया 🙏 कृपया ऊपर बटन दबाएँ, या लिखें — 'मेरे लिए' या 'किसी और के लिए'।",
              "Sorry, I didn't quite understand 🙏 Please tap the button above, or write — 'For me' or 'For someone else'.",
            ),
          },
        ]);
        scroll();
      }
      return;
    }

    if (step === "date") {
      setMessages((prev) => [
        ...prev,
        { type: "text", role: "user", text: q },
        {
          type: "text",
          role: "sakhi",
          text: t(
            "कृपया ऊपर दिए गए कैलेंडर में तारीख पर टैप करें 📅",
            "Please tap a date in the calendar above 📅",
          ),
        },
      ]);
      scroll();
      return;
    }

    if (step === "cycleLength") {
      const days = parseCycleLength(q);
      if (days) {
        onCyclePick(days, lastPeriodDate ?? new Date());
      } else {
        setMessages((prev) => [
          ...prev,
          { type: "text", role: "user", text: q },
          {
            type: "text",
            role: "sakhi",
            text: t(
              "कृपया 21-35 के बीच एक नंबर बताएं, या ऊपर दिए विकल्पों में से कोई एक चुनें।",
              "Please enter a number between 21-35, or choose one of the options above.",
            ),
          },
        ]);
        scroll();
      }
      return;
    }

    const history: SakhiTurn[] = messages
      .filter((m): m is Extract<MessageKind, { type: "text" }> => m.type === "text")
      .map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.text }));
    setMessages((prev) => [...prev, { type: "text", role: "user", text: q }]);
    setLoading(true);
    scroll();
    try {
      const data = await askSakhi(q, history, lang);
      if (data.video || data.article) {
        setMessages((prev) => [
          ...prev,
          {
            type: "text",
            role: "sakhi",
            text: t(
              "इस विषय पर मेरे पास verified जानकारी है — वीडियो और लेख दोनों उपलब्ध हैं:",
              "I have verified information on this topic — both videos and articles are available:",
            ),
          },
          { type: "contentLink", query: q },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            type: "text",
            role: "sakhi",
            text: data.answer || t("सखी अभी उपलब्ध नहीं है।", "Sakhi is not available right now."),
            isLlm: data.isLlm,
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          type: "text",
          role: "sakhi",
          text: t(
            "नेटवर्क में समस्या है। कृपया पुनः प्रयास करें।",
            "There is a network issue. Please try again.",
          ),
        },
      ]);
    } finally {
      setLoading(false);
      scroll();
    }
  }

  const avatar = (
    <div
      style={{
        width: 28,
        height: 28,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        background: C.gulabiLight,
        fontSize: 13,
        marginRight: 6,
      }}
    >
      🗓️
    </div>
  );

  return (
    <div style={{ background: "#EAE3F4" }} className="relative flex h-full flex-col">
      <HubHeader
        title={t("पीरियड ट्रैकर", "Period Tracker")}
        backHref="/womens-health"
        scrolled={false}
      />
      <main
        className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 76px)" }}
      >
        <div className="mx-auto flex w-full max-w-md flex-col gap-3">
          {messages.map((m, i) => {
            if (m.type === "forWhomPicker")
              return (
                <div key={i} style={{ display: "flex", alignItems: "flex-start" }}>
                  {avatar}
                  <div
                    style={{
                      flex: 1,
                      maxWidth: "88%",
                      background: C.surface,
                      borderRadius: "16px 16px 16px 4px",
                      padding: "10px 12px",
                      boxShadow: `0 1px 4px ${C.border}`,
                    }}
                  >
                    <p
                      style={{
                        fontSize: 13,
                        color: C.textPrimary,
                        marginBottom: 4,
                        fontFamily: "JioType, sans-serif",
                      }}
                    >
                      {t(
                        "क्या यह आपके लिए है या किसी और के लिए?",
                        "Is this for you or for someone else?",
                      )}
                    </p>
                    <ForWhomCard onPick={handleForWhom} />
                  </div>
                </div>
              );

            if (m.type === "calendar")
              return (
                <div key={i} style={{ display: "flex", alignItems: "flex-start" }}>
                  {avatar}
                  <div style={{ flex: 1, maxWidth: "92%" }}>
                    <DatePickerCalendar
                      onDatePick={m.onDatePick}
                      title={m.title}
                      onSkip={m.onSkip}
                      initialDate={m.initialDate}
                    />
                  </div>
                </div>
              );

            if (m.type === "cycleLength")
              return (
                <div key={i} style={{ display: "flex", alignItems: "flex-start" }}>
                  {avatar}
                  <div
                    style={{
                      flex: 1,
                      maxWidth: "92%",
                      background: C.surface,
                      borderRadius: 16,
                      padding: "10px 12px",
                      boxShadow: `0 1px 4px ${C.border}`,
                    }}
                  >
                    <p
                      style={{
                        fontSize: 12,
                        color: C.textTertiary,
                        marginBottom: 8,
                        fontFamily: "JioType, sans-serif",
                      }}
                    >
                      {t("Cycle की लंबाई चुनें", "Choose cycle length")}
                    </p>
                    <CycleLengthCard onPick={m.onPick} />
                  </div>
                </div>
              );

            if (m.type === "reminderAsk")
              return (
                <div key={i} style={{ display: "flex", alignItems: "flex-start" }}>
                  {avatar}
                  <div style={{ flex: 1, maxWidth: "92%" }}>
                    <ReminderAskCard onYes={m.onYes} onNo={m.onNo} />
                  </div>
                </div>
              );

            if (m.type === "reminderDays")
              return (
                <div key={i} style={{ display: "flex", alignItems: "flex-start" }}>
                  {avatar}
                  <div style={{ flex: 1, maxWidth: "92%" }}>
                    <ReminderDaysCard options={m.options} onPick={m.onPick} />
                  </div>
                </div>
              );

            if (m.type === "cycleOverview") {
              const day = getCycleDay(m.lastPeriod);
              const nextPeriod = addDays(m.lastPeriod, m.cycleLength);
              return (
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "flex-start" }}>
                    {avatar}
                    <div style={{ flex: 1, maxWidth: "92%" }}>
                      <PhaseArc day={day} len={m.cycleLength} />
                      <StatsStrip len={m.cycleLength} nextPeriod={nextPeriod} hideLen={m.unsure} />
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start" }}>
                    {avatar}
                    <div style={{ flex: 1, maxWidth: "92%" }}>
                      <PredictionCalendar lastPeriod={m.lastPeriod} len={m.cycleLength} />
                    </div>
                  </div>
                </div>
              );
            }

            if (m.type === "phaseInsight")
              return (
                <div key={i} style={{ display: "flex", alignItems: "flex-start" }}>
                  {avatar}
                  <div style={{ flex: 1, maxWidth: "92%" }}>
                    <PhaseInsightCard day={m.day} len={m.cycleLength} />
                  </div>
                </div>
              );

            if (m.type === "continuePrompt")
              return (
                <div key={i} style={{ display: "flex", alignItems: "flex-start" }}>
                  {avatar}
                  <div style={{ flex: 1, maxWidth: "92%" }}>
                    <ContinuePromptCard
                      label={m.label}
                      buttonLabel={m.buttonLabel}
                      onContinue={m.onContinue}
                    />
                  </div>
                </div>
              );

            if (m.type === "symptoms")
              return (
                <div key={i} style={{ display: "flex", alignItems: "flex-start" }}>
                  {avatar}
                  <div style={{ flex: 1, maxWidth: "92%" }}>
                    <SymptomChipsCard onDone={m.onDone} />
                  </div>
                </div>
              );

            if (m.type === "homeRemedies")
              return (
                <div key={i} style={{ display: "flex", alignItems: "flex-start" }}>
                  {avatar}
                  <div style={{ flex: 1, maxWidth: "92%" }}>
                    <HomeRemediesCard remedies={m.remedies} />
                  </div>
                </div>
              );

            if (m.type === "remediesLoading")
              return (
                <div
                  key={i}
                  style={{ display: "flex", justifyContent: "flex-start", width: "100%" }}
                >
                  {avatar}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "10px 14px",
                      borderRadius: "18px 18px 18px 4px",
                      background: C.surface,
                      boxShadow: `0 1px 4px ${C.border}`,
                    }}
                  >
                    {[0, 1, 2].map((j) => (
                      <span
                        key={j}
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: C.textTertiary,
                          display: "inline-block",
                          animation: `pulse 1.2s ease-in-out ${j * 0.2}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              );

            if (m.type === "contentLink")
              return (
                <div key={i} style={{ display: "flex", alignItems: "flex-start" }}>
                  {avatar}
                  <ContentLinkCard
                    onTap={() =>
                      router.push(`/womens-health/health-content?q=${encodeURIComponent(m.query)}`)
                    }
                  />
                </div>
              );

            return (
              <React.Fragment key={i}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                    width: "100%",
                  }}
                >
                  {m.role === "sakhi" && avatar}
                  <div
                    style={{
                      maxWidth: "82%",
                      padding: "8px 12px",
                      fontSize: 13,
                      lineHeight: 1.6,
                      background: m.role === "user" ? C.raat : C.surface,
                      color: m.role === "user" ? "#fff" : C.textPrimary,
                      borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                      fontFamily: "JioType, sans-serif",
                      boxShadow: m.role === "sakhi" ? `0 1px 4px ${C.border}` : "none",
                    }}
                  >
                    {m.text}
                  </div>
                </div>
                {m.role === "sakhi" && m.isLlm && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 10,
                      color: "#9CA3AF",
                      fontFamily: "JioType, sans-serif",
                      paddingLeft: 36,
                      marginTop: 2,
                    }}
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
              </React.Fragment>
            );
          })}
          {loading && (
            <div style={{ display: "flex", justifyContent: "flex-start", width: "100%" }}>
              {avatar}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "10px 14px",
                  borderRadius: "18px 18px 18px 4px",
                  background: C.surface,
                  boxShadow: `0 1px 4px ${C.border}`,
                }}
              >
                {[0, 1, 2].map((j) => (
                  <span
                    key={j}
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: C.textTertiary,
                      display: "inline-block",
                      animation: `pulse 1.2s ease-in-out ${j * 0.2}s infinite`,
                    }}
                  />
                ))}
                <style>{`@keyframes pulse{0%,100%{opacity:0.3}50%{opacity:1}}`}</style>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </main>
      <HubChatInput
        variant="sleek"
        placeholder={t("पीरियड के बारे में पूछें...", "Ask about your period...")}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
