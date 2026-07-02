"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { HubHeader } from "@/app/jobs/design-prototype/HubHeader";
import { HubChatInput } from "@/app/jobs/design-prototype/HubChatInput";
import { askSakhi } from "@/lib/sakhi";

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
const DAYS_SHORT = ["र", "सो", "मं", "बु", "गु", "शु", "श"];

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
function getPhase(day: number, len: number) {
  if (day <= 5) return "Menstrual";
  if (day <= len - 15) return "Follicular";
  if (day <= len - 14) return "Ovulation";
  return "Luteal";
}
function parseForWhom(text: string): ForWhom {
  const t = text.trim().toLowerCase();
  const self = [
    "मेरे लिए",
    "मेरे",
    "खुद",
    "for me",
    "myself",
    "self",
    "mere liye",
    "mujhe",
    "main",
  ];
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
  const pct = Math.min((day - 1) / Math.max(len - 1, 1), 1);
  const cx = 110,
    cy = 108,
    r = 86;
  const angle = Math.PI - pct * Math.PI;
  const dotX = cx + r * Math.cos(angle);
  const dotY = cy - r * Math.sin(angle);
  const phase = getPhase(day, len);
  const phaseLabels: Record<string, string> = {
    Menstrual: "मासिक चरण",
    Follicular: "फॉलिकुलर चरण",
    Ovulation: "ओव्यूलेशन",
    Luteal: "लुटियल चरण",
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
            मासिक
          </text>
          <text
            x="54"
            y="28"
            fontSize="8"
            fill="rgba(255,255,255,0.35)"
            fontFamily="-apple-system,sans-serif"
            fontWeight="600"
          >
            फॉलि.
          </text>
          <text
            x="100"
            y="14"
            fontSize="8"
            fill="rgba(255,255,255,0.35)"
            fontFamily="-apple-system,sans-serif"
            fontWeight="600"
          >
            ओव्यु.
          </text>
          <text
            x="152"
            y="28"
            fontSize="8"
            fill="rgba(255,255,255,0.55)"
            fontFamily="-apple-system,sans-serif"
            fontWeight="700"
          >
            लुटियल
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
            Cycle दिन
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
            {daysLeft > 0 ? ` · ${daysLeft} दिन बाकी` : ""}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Stats strip ───────────────────────────────────────────────────────────────
function StatsStrip({ len, nextPeriod }: { len: number; nextPeriod: Date }) {
  const daysLeft = Math.ceil((nextPeriod.getTime() - Date.now()) / 86400000);
  const fmt = (d: Date) => d.toLocaleDateString("hi-IN", { day: "numeric", month: "short" });
  const stats = [
    { val: `${len}`, lbl: "Cycle" },
    { val: daysLeft > 0 ? `${daysLeft} दिन` : "जल्द", lbl: "अगला पीरियड" },
    { val: fmt(nextPeriod), lbl: "तारीख" },
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
          {MONTHS_HI[month]} {year}
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
        {DAYS_SHORT.map((d) => (
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
          { color: C.gulabi, label: "पीरियड" },
          { color: C.mint, label: "फर्टाइल" },
          { color: C.amber, label: "ओव्यूलेशन" },
          { color: C.raat, label: "आज" },
          { color: C.gulabiPale, label: "अनुमानित", dashed: true },
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
const PHASE_INFO: Record<string, { body: string; tip: string }> = {
  Menstrual: {
    body: "इस चरण में गर्भाशय की परत निकल रही है — थकान और ऐंठन होना स्वाभाविक है। यह आराम का समय है।",
    tip: "💡 गर्म पानी की बोतल, हल्का योग, और पालक-दालें जैसे आयरन-रिच खाने से सबसे ज़्यादा राहत मिलती है।",
  },
  Follicular: {
    body: "Estrogen बढ़ रहा है — ऊर्जा और मूड दोनों बेहतर होते हैं। नए काम शुरू करने का यह अच्छा समय है।",
    tip: "💡 इस phase में exercise और नई चुनौतियाँ लेना आसान लगता है — हॉर्मोन आपके साथ हैं!",
  },
  Ovulation: {
    body: "आज के आसपास ओव्यूलेशन होता है — यह सबसे उपजाऊ समय है। Estrogen peak पर है।",
    tip: "💡 आज आप सबसे अधिक ऊर्जावान और मिलनसार महसूस कर सकती हैं — यह LH surge का असर है।",
  },
  Luteal: {
    body: "Progesterone बढ़ रहा है — हल्की थकान और मूड बदलाव सामान्य हैं। यह आपका आराम करने का संकेत है।",
    tip: "💡 हल्की walk, गर्म chai, और आयरन-रिच खाना इस phase में सबसे ज़्यादा मदद करता है।",
  },
};

function PhaseInsightCard({ day, len }: { day: number; len: number }) {
  const phase = getPhase(day, len);
  const { body, tip } = PHASE_INFO[phase];
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
        {body}
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
        {tip}
      </div>
    </div>
  );
}

// ── Symptom chips ─────────────────────────────────────────────────────────────
const SYMPTOMS = [
  "थकान",
  "मूड बदलाव",
  "Bloating",
  "दर्द",
  "Nausea",
  "सिरदर्द",
  "Pimples",
  "नींद कम",
  "भूख कम",
  "पीठ दर्द",
];

function SymptomChipsCard({ onDone }: { onDone: (s: string[]) => void }) {
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 800,
            color: C.raat,
            fontFamily: "JioType, sans-serif",
          }}
        >
          आज के symptoms
        </span>
        <button
          onClick={() => onDone(sel)}
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: C.gulabi,
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "JioType, sans-serif",
          }}
        >
          {sel.length > 0 ? "Save करें ✓" : "Skip"}
        </button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6 }}>
        {SYMPTOMS.map((s) => (
          <button
            key={s}
            onClick={() => toggle(s)}
            style={{
              padding: "5px 11px",
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
              background: sel.includes(s) ? C.raat : C.surface,
              color: sel.includes(s) ? "#fff" : C.textSecondary,
              border: `1.5px solid ${sel.includes(s) ? C.raat : C.border}`,
              fontFamily: "JioType, sans-serif",
            }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Date picker calendar ──────────────────────────────────────────────────────
function DatePickerCalendar({ onDatePick }: { onDatePick: (label: string, date: Date) => void }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [picked, setPicked] = useState<number | null>(null);
  const cells = buildCells(year, month);

  function pickDay(day: number) {
    setPicked(day);
    onDatePick(`${day} ${MONTHS_HI[month]}`, new Date(year, month, day));
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
        आखिरी पीरियड की तारीख चुनें
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
          {MONTHS_HI[month]} {year}
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
        {DAYS_SHORT.map((d) => (
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
    </div>
  );
}

// ── Cycle length picker ───────────────────────────────────────────────────────
function CycleLengthCard({ onPick }: { onPick: (d: number) => void }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6 }}>
      {[21, 24, 28, 30, 32, 35].map((d) => (
        <button
          key={d}
          onClick={() => onPick(d)}
          style={{
            padding: "6px 14px",
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 600,
            background: C.gulabiLight,
            color: C.gulabi,
            border: "none",
            cursor: "pointer",
            fontFamily: "JioType, sans-serif",
          }}
        >
          {d} दिन
        </button>
      ))}
      <button
        onClick={() => onPick(28)}
        style={{
          padding: "6px 14px",
          borderRadius: 20,
          fontSize: 12,
          fontWeight: 600,
          background: C.raatLight,
          color: C.raatMid,
          border: "none",
          cursor: "pointer",
          fontFamily: "JioType, sans-serif",
        }}
      >
        पता नहीं
      </button>
    </div>
  );
}

// ── For-whom picker ───────────────────────────────────────────────────────────
type ForWhom = "self" | "other" | null;

function ForWhomCard({ onPick }: { onPick: (v: ForWhom) => void }) {
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
        मेरे लिए
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
        किसी और के लिए
      </button>
    </div>
  );
}

// ── Content redirect card ─────────────────────────────────────────────────────
function ContentLinkCard({ onTap }: { onTap: () => void }) {
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
          जाँची-परखी जानकारी देखें
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
        इस विषय पर WHO और FOGSI द्वारा सत्यापित वीडियो और लेख उपलब्ध हैं
      </p>
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "#8B5CF6",
          fontFamily: "JioType, sans-serif",
        }}
      >
        अभी देखें →
      </span>
    </button>
  );
}

// ── MessageKind union ─────────────────────────────────────────────────────────
type MessageKind =
  | { type: "text"; role: "user" | "sakhi"; text: string; isLlm?: boolean }
  | { type: "forWhomPicker" }
  | { type: "calendar"; onDatePick: (label: string, date: Date) => void }
  | { type: "cycleLength"; onPick: (days: number) => void }
  | { type: "prediction"; lastPeriod: Date; cycleLength: number }
  | { type: "symptoms"; onDone: (s: string[]) => void }
  | { type: "contentLink"; query: string };

// ── Page ──────────────────────────────────────────────────────────────────────
export default function PeriodTrackerPage() {
  const router = useRouter();
  const [lastPeriodDate, setLastPeriodDate] = useState<Date | null>(null);
  const [step, setStep] = useState<"forWhom" | "date" | "cycleLength" | "chat">("forWhom");
  const bottomRef = useRef<HTMLDivElement>(null);
  const scroll = () =>
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 60);

  function onSymptomsDone(selected: string[]) {
    const reply =
      selected.length > 0
        ? `Noted! 💜 आज के symptoms: ${selected.join(", ")}। इन्हें track करते रहना बहुत helpful होगा।`
        : "कोई symptoms नहीं — अच्छा है! 💜";
    setMessages((prev) => [
      ...prev.filter((m) => m.type !== "symptoms"),
      { type: "text", role: "sakhi", text: reply },
      {
        type: "text",
        role: "sakhi",
        text: "कोई और सवाल? जैसे — देरी क्यों होती है, दर्द कम कैसे करें, या कुछ और।",
      },
    ]);
    scroll();
  }

  function onCyclePick(days: number) {
    const lp = lastPeriodDate ?? new Date();
    setMessages((prev) => [
      ...prev.filter((m) => m.type !== "cycleLength"),
      { type: "text", role: "user", text: `${days} दिन` },
      { type: "text", role: "sakhi", text: "बढ़िया! 🗓️ यहाँ देखें आपकी पूरी cycle:" },
      { type: "prediction", lastPeriod: lp, cycleLength: days },
      { type: "symptoms", onDone: onSymptomsDone },
    ]);
    setStep("chat");
    scroll();
  }

  function makeCalendarMsg(): MessageKind {
    return {
      type: "calendar",
      onDatePick: (label, date) => {
        setLastPeriodDate(date);
        setMessages((prev) => [
          ...prev.filter((m) => m.type !== "calendar"),
          { type: "text", role: "user", text: `आखिरी पीरियड: ${label}` },
          {
            type: "text",
            role: "sakhi",
            text: `${label} — नोट हो गया! आपकी cycle आमतौर पर कितने दिनों की होती है?`,
          },
          { type: "cycleLength", onPick: onCyclePick },
        ]);
        setStep("cycleLength");
        scroll();
      },
    };
  }

  function handleForWhom(v: ForWhom, displayText?: string) {
    const userText = displayText ?? (v === "self" ? "मेरे लिए" : "किसी और के लिए");
    const sakhiText =
      v === "self"
        ? "ठीक है! 📅 पहले बताइए — आखिरी पीरियड कब शुरू हुआ था?"
        : "ठीक है! 📅 उनका आखिरी पीरियड कब शुरू हुआ था?";
    setMessages((prev) => [
      ...prev.filter((m) => m.type !== "forWhomPicker"),
      { type: "text", role: "user", text: userText },
      { type: "text", role: "sakhi", text: sakhiText },
      makeCalendarMsg(),
    ]);
    setStep("date");
    scroll();
  }

  const [messages, setMessages] = useState<MessageKind[]>([
    {
      type: "text",
      role: "sakhi",
      text: "नमस्ते! मैं सखी हूँ — आपकी स्वास्थ्य सहेली। 💜\n\nआपका राज़ मेरा राज़ है। जो भी आप मुझसे कहेंगी — वो सिर्फ हमारे बीच रहेगा। कोई विज्ञापन नहीं, कोई जानकारी किसी के साथ साझा नहीं।\n\nपहले बताइए —",
    },
    { type: "forWhomPicker" },
  ]);

  const [loading, setLoading] = useState(false);

  async function handleSubmit(text: string) {
    if (!text.trim() || loading) return;
    const q = text.trim();

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
            text: "माफ़ कीजिए, ठीक से समझ नहीं आया 🙏 कृपया ऊपर बटन दबाएँ, या लिखें — 'मेरे लिए' या 'किसी और के लिए'।",
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
        { type: "text", role: "sakhi", text: "कृपया ऊपर दिए गए कैलेंडर में तारीख पर टैप करें 📅" },
      ]);
      scroll();
      return;
    }

    if (step === "cycleLength") {
      const days = parseCycleLength(q);
      if (days) {
        onCyclePick(days);
      } else {
        setMessages((prev) => [
          ...prev,
          { type: "text", role: "user", text: q },
          {
            type: "text",
            role: "sakhi",
            text: "कृपया 21-35 के बीच एक नंबर बताएं, या ऊपर दिए विकल्पों में से कोई एक चुनें।",
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
      const data = await askSakhi(q, history);
      // If Sakhi matched a health topic (has video/article), redirect to content section
      if (data.video || data.article) {
        setMessages((prev) => [
          ...prev,
          {
            type: "text",
            role: "sakhi",
            text: "इस विषय पर मेरे पास verified जानकारी है — वीडियो और लेख दोनों उपलब्ध हैं:",
          },
          { type: "contentLink", query: q },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            type: "text",
            role: "sakhi",
            text: data.answer || "सखी अभी उपलब्ध नहीं है।",
            isLlm: data.isLlm,
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { type: "text", role: "sakhi", text: "नेटवर्क में समस्या है। कृपया पुनः प्रयास करें।" },
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
      <HubHeader title="पीरियड ट्रैकर" backHref="/womens-health" scrolled={false} />
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
                      क्या यह आपके लिए है या किसी और के लिए?
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
                    <DatePickerCalendar onDatePick={m.onDatePick} />
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
                      Cycle की लंबाई चुनें
                    </p>
                    <CycleLengthCard onPick={m.onPick} />
                  </div>
                </div>
              );

            if (m.type === "prediction") {
              const day = getCycleDay(m.lastPeriod);
              const nextPeriod = addDays(m.lastPeriod, m.cycleLength);
              return (
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "flex-start" }}>
                    {avatar}
                    <div style={{ flex: 1, maxWidth: "92%" }}>
                      <PhaseArc day={day} len={m.cycleLength} />
                      <StatsStrip len={m.cycleLength} nextPeriod={nextPeriod} />
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start" }}>
                    {avatar}
                    <div style={{ flex: 1, maxWidth: "92%" }}>
                      <PredictionCalendar lastPeriod={m.lastPeriod} len={m.cycleLength} />
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start" }}>
                    {avatar}
                    <div style={{ flex: 1, maxWidth: "92%" }}>
                      <PhaseInsightCard day={day} len={m.cycleLength} />
                    </div>
                  </div>
                </div>
              );
            }

            if (m.type === "symptoms")
              return (
                <div key={i} style={{ display: "flex", alignItems: "flex-start" }}>
                  {avatar}
                  <div style={{ flex: 1, maxWidth: "92%" }}>
                    <SymptomChipsCard onDone={m.onDone} />
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
                    <span>🤖</span>
                    <span>
                      यह जवाब AI द्वारा उत्पन्न है। यह जानकारी सामान्य शिक्षा के लिए है और किसी
                      योग्य डॉक्टर की व्यक्तिगत सलाह का विकल्प नहीं है। स्वास्थ्य संबंधी कोई भी
                      निर्णय लेने से पहले अपनी डॉक्टर से अवश्य परामर्श करें।
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
        placeholder="पीरियड के बारे में पूछें..."
        onSubmit={handleSubmit}
      />
    </div>
  );
}
