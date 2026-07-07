"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { HubHeader } from "@/app/jobs/design-prototype/HubHeader";
import { HubChatInput } from "@/app/jobs/design-prototype/HubChatInput";
import {
  askSakhi,
  isBlockerResponse,
  isMaleIdentifier,
  MALE_RESPONSE,
  MALE_RESPONSE_EN,
} from "@/lib/sakhi";
import { useLang } from "../LangContext";

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
function loadPhase() {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem("sakhi_period") : null;
    if (!raw) return null;
    const { lastPeriod, cycleLength } = JSON.parse(raw);
    const lp = new Date(lastPeriod);
    const day = Math.max(1, Math.ceil((Date.now() - lp.getTime()) / 86400000) + 1);
    const len = cycleLength as number;
    let name = "ल्यूटियल फ़ेज़",
      nameEn = "Luteal Phase";
    let hint = "मूड थोड़ा भारी हो सकता है — यह सामान्य है";
    let hintEn = "Mood may feel heavy — this is normal";
    if (day <= 5) {
      name = "मासिक चरण";
      nameEn = "Menstrual Phase";
      hint = "आज आराम करें — आपका शरीर काम कर रहा है";
      hintEn = "Rest today — your body is working hard";
    } else if (day <= len - 15) {
      name = "फॉलिक्युलर फ़ेज़";
      nameEn = "Follicular Phase";
      hint = "एनर्जी बढ़ रही है — नई शुरुआत का समय!";
      hintEn = "Energy is rising — great time for new starts!";
    } else if (day <= len - 14) {
      name = "ओव्यूलेशन फ़ेज़";
      nameEn = "Ovulation Phase";
      hint = "आज आप सबसे ज़्यादा energetic हो सकती हैं";
      hintEn = "You may feel at your most energetic today";
    }
    return { name, nameEn, day, cycleLength: len, hint, hintEn };
  } catch {
    return null;
  }
}

const PHASE_DEFAULT = {
  name: "—",
  nameEn: "—",
  day: 0,
  cycleLength: 28,
  hint: "पीरियड ट्रैकर में डेटा डालें तो phase दिखेगा",
  hintEn: "Add data in Period Tracker to see your phase",
};

// ─── Mood options ─────────────────────────────────────────────────────────────
const MOODS = [
  { face: "😄", label: "बहुत अच्छा", labelEn: "Very Good", score: 5 },
  { face: "🙂", label: "अच्छा", labelEn: "Good", score: 4 },
  { face: "😐", label: "ठीक है", labelEn: "Okay", score: 3 },
  { face: "😔", label: "तनाव", labelEn: "Stressed", score: 2 },
  { face: "😞", label: "बुरा", labelEn: "Bad", score: 1 },
];

// ─── Energy options ───────────────────────────────────────────────────────────
const ENERGIES = [
  { icon: "🪫", label: "बहुत कम", labelEn: "Very Low", score: 1 },
  { icon: "⚡", label: "ठीक है", labelEn: "Okay", score: 2 },
  { icon: "🔋", label: "ज़्यादा", labelEn: "High", score: 3 },
];

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
  | { type: "energyPicker"; locked: boolean; selected?: (typeof ENERGIES)[0] }
  | { type: "confirmation"; mood: (typeof MOODS)[0]; energy: (typeof ENERGIES)[0] }
  | { type: "contentLink"; query: string }
  | { type: "breathingCard" };

// ─── Breathing exercise card ──────────────────────────────────────────────────
function BreathingCard() {
  const { lang } = useLang();
  const t = (hi: string, en: string) => (lang === "hi" ? hi : en);
  const steps = [
    {
      icon: "🫁",
      label: t("साँस लें", "Breathe in"),
      count: t("4 तक गिनें", "Count to 4"),
      note: t("पेट बाहर जाए", "Let belly expand"),
      sub: t("छाती नहीं", "not chest"),
      bg: "#E8F5FF",
      border: "#BFDBFE",
      accent: "#3B82F6",
    },
    {
      icon: "🫁",
      label: t("साँस छोड़ें", "Breathe out"),
      count: t("4 तक गिनें", "Count to 4"),
      note: t("पेट अंदर आए", "Let belly fall"),
      sub: "",
      bg: "#F0FDF4",
      border: "#BBF7D0",
      accent: "#22C55E",
    },
  ];
  return (
    <div
      className="mt-1 rounded-tr-2xl rounded-b-2xl p-3"
      style={{ background: "#fff", boxShadow: "0 1px 6px rgba(45,27,78,0.08)", maxWidth: 272 }}
    >
      <p
        className="mb-2.5 text-[12px] font-semibold"
        style={{ color: C.raat, fontFamily: "JioType, sans-serif" }}
      >
        {t("अभी यह करें — डीप बेली ब्रीदिंग", "Do this now — Deep Belly Breathing")}
      </p>

      <div className="flex flex-col gap-2">
        {steps.map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5"
            style={{ background: s.bg, border: `1.5px solid ${s.border}` }}
          >
            <span className="text-[20px]">{s.icon}</span>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span
                  className="text-[13px] font-bold"
                  style={{ color: s.accent, fontFamily: "JioType, sans-serif" }}
                >
                  {s.label}
                </span>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                  style={{ background: s.accent, color: "#fff", fontFamily: "JioType, sans-serif" }}
                >
                  {s.count}
                </span>
              </div>
              <span
                className="text-[11px]"
                style={{ color: C.textSecondary, fontFamily: "JioType, sans-serif" }}
              >
                {s.note}
                {s.sub && <span style={{ color: C.textTertiary }}> ({s.sub})</span>}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div
        className="mt-2.5 rounded-xl px-3 py-2 text-[11px]"
        style={{
          background: "#FFF7ED",
          border: "1.5px solid #FED7AA",
          color: "#92400E",
          fontFamily: "JioType, sans-serif",
        }}
      >
        {t(
          "⚠️ बीच में साँस बिल्कुल न रोकें — सीधे लें और छोड़ें",
          "⚠️ Don't hold your breath — breathe in and out continuously",
        )}
      </div>

      <p
        className="mt-2 text-[11px]"
        style={{ color: C.textTertiary, fontFamily: "JioType, sans-serif" }}
      >
        {t(
          "5-6 बार करें — आप फर्क महसूस करेंगी 💜",
          "Do 5-6 times — you'll feel the difference 💜",
        )}
      </p>
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

// ─── Energy picker ────────────────────────────────────────────────────────────
function EnergyPicker({
  onPick,
  locked,
  selected,
}: {
  onPick: (e: (typeof ENERGIES)[0]) => void;
  locked: boolean;
  selected?: (typeof ENERGIES)[0];
}) {
  const { lang } = useLang();
  const t = (hi: string, en: string) => (lang === "hi" ? hi : en);
  return (
    <div
      className="mt-1 rounded-tr-2xl rounded-b-2xl p-3"
      style={{ background: C.surface, boxShadow: "0 1px 6px rgba(45,27,78,0.08)", maxWidth: 252 }}
    >
      <div className="mb-2 text-[11px] font-semibold" style={{ color: C.textTertiary }}>
        {t("Energy level 👇", "Energy level 👇")}
      </div>
      <div className="flex gap-2">
        {ENERGIES.map((e) => {
          const isSelected = selected?.score === e.score;
          return (
            <button
              key={e.score}
              type="button"
              disabled={locked}
              onClick={() => !locked && onPick(e)}
              className="flex flex-1 flex-col items-center gap-1.5 rounded-xl py-2 transition-all active:scale-95"
              style={{
                border: `1.5px solid ${isSelected ? C.gulabi : C.border}`,
                background: isSelected ? C.gulabiLight : C.surface,
                opacity: locked && !isSelected ? 0.45 : 1,
              }}
            >
              <span style={{ fontSize: 18, lineHeight: 1 }}>{e.icon}</span>
              <span
                className="text-[9px] font-bold tracking-wide uppercase"
                style={{ color: isSelected ? C.gulabi : C.textTertiary }}
              >
                {t(e.label, e.labelEn)}
              </span>
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
  energy,
  phase,
}: {
  mood: (typeof MOODS)[0];
  energy: (typeof ENERGIES)[0];
  phase: NonNullable<PhaseData>;
}) {
  const PHASE = phase;
  const { lang } = useLang();
  const t = (hi: string, en: string) => (lang === "hi" ? hi : en);
  const dots = Array.from({ length: 5 }, (_, i) => i < energy.score + 1);
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
        <div>
          <div className="text-[14px] font-extrabold text-white">{t(mood.label, mood.labelEn)}</div>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.45)" }}>
              {t("ऊर्जा", "Energy")}
            </span>
            <div className="flex gap-1">
              {dots.map((on, i) => (
                <div
                  key={i}
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: on ? C.gulabi : "rgba(255,255,255,0.15)" }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Cycle correlation */}
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
            {t(
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
            {t(PHASE.name, PHASE.nameEn)} · {t("दिन", "Day")} {PHASE.day} of {PHASE.cycleLength}
          </span>
        </div>
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

// ─── Text bubble ─────────────────────────────────────────────────────────────
function Bubble({ text, time }: { text: string; time?: string }) {
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
        {text}
      </div>
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
  const router = useRouter();
  const { lang } = useLang();
  const t = (hi: string, en: string) => (lang === "hi" ? hi : en);
  const [PHASE] = useState(() => loadPhase() ?? PHASE_DEFAULT);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scroll = () =>
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);

  const [forWhomLocked, setForWhomLocked] = useState(false);
  const [selectedForWhom, setSelectedForWhom] = useState<ForWhom | undefined>();
  const [moodLocked, setMoodLocked] = useState(false);
  const [energyLocked, setEnergyLocked] = useState(false);
  const [selectedMood, setSelectedMood] = useState<(typeof MOODS)[0] | undefined>();
  const [selectedEnergy, setSelectedEnergy] = useState<(typeof ENERGIES)[0] | undefined>();
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
          ? t("ज़रूर! उनका मूड कैसा है आज?", "Of course! How is their mood today?")
          : t("अच्छा! आज कैसा महसूस हो रहा है?", "Great! How are you feeling today?");
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
      push({
        type: "text",
        role: "sakhi",
        text: t(
          `${m.label} — समझ गई। ऊर्जा कैसी है आज?`,
          `${m.labelEn} — understood. How's your energy today?`,
        ),
      });
      push({ type: "energyPicker", locked: false });
      scroll();
    }, 900);
  }

  function handleEnergyPick(e: (typeof ENERGIES)[0]) {
    if (energyLocked) return;
    setEnergyLocked(true);
    setSelectedEnergy(e);
    push({ type: "text", role: "user", text: `${e.icon} ${t(e.label, e.labelEn)}` });
    setFlowLoading(true);
    scroll();
    setTimeout(() => {
      setFlowLoading(false);
      push({ type: "confirmation", mood: selectedMood!, energy: e });
      const isLowMood = (selectedMood?.score ?? 5) <= 2;
      push({
        type: "text",
        role: "sakhi",
        text: isLowMood
          ? t(
              "यह महसूस करना मुश्किल हो सकता है। अभी एक छोटी सी चीज़ try करें जो तुरंत थोड़ा better feel कराएगी:",
              "It can be hard to feel this way. Try one small thing right now that will help you feel a little better:",
            )
          : t(
              "कल भी लॉग करें — पैटर्न समझना फायदेमंद होगा। कोई और बात करनी है? 🌸",
              "Log again tomorrow — understanding patterns is helpful. Anything else you'd like to talk about? 🌸",
            ),
      });
      if (isLowMood) {
        push({ type: "breathingCard" });
        push({
          type: "text",
          role: "sakhi",
          text: t(
            "कल भी लॉग करें — पैटर्न समझना फायदेमंद होगा। 🌸",
            "Log again tomorrow — understanding patterns is helpful. 🌸",
          ),
        });
      }
      scroll();
    }, 900);
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

    if (isMaleIdentifier(q)) {
      push({ type: "text", role: "user", text: q });
      push({ type: "text", role: "sakhi", text: lang === "en" ? MALE_RESPONSE_EN : MALE_RESPONSE });
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
        push({ type: "breathingCard" });
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

    const history: SakhiTurn[] = messages
      .filter((m): m is Extract<MessageKind, { type: "text" }> => m.type === "text")
      .map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.text }));
    push({ type: "text", role: "user", text: q });
    setLoading(true);
    scroll();
    try {
      const data = await askSakhi(q, history, lang);
      if (data.video || data.article) {
        push({
          type: "text",
          role: "sakhi",
          text: t(
            "समझ गई। इस बारे में कुछ verified जानकारी है — यहाँ देखें:",
            "Understood. There is some verified information on this — see here:",
          ),
        });
        push({ type: "contentLink", query: q });
      } else if (!isBlockerResponse(data.answer)) {
        // LLM gave a meaningful response (e.g. clarification) — show it
        push({ type: "text", role: "sakhi", text: data.answer, isLlm: data.isLlm });
      } else {
        push({
          type: "text",
          role: "sakhi",
          text: t(
            "समझ गई। मूड और मानसिक स्वास्थ्य के बारे में यहाँ कुछ verified जानकारी है:",
            "Understood. Here is some verified information on mood and mental health:",
          ),
        });
        push({ type: "contentLink", query: "low mood mann udaas kyun hota hai" });
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
  }

  // Render messages
  function renderMessage(msg: MessageKind, i: number) {
    if (msg.type === "greeting") {
      return (
        <SakhiRow key={i}>
          <Bubble
            text={t(
              "नमस्ते! मैं सखी हूँ — आपकी स्वास्थ्य सहेली। 💜\n\nआपका राज़ मेरा राज़ है। जो भी आप मुझसे कहें — वो सिर्फ हमारे बीच रहेगा। कोई विज्ञापन नहीं, कोई जानकारी किसी के साथ साझा नहीं।",
              "Hi! I'm your Health Companion. 💜\n\nYour privacy is my priority. Everything you share stays between us. No ads, no data shared with anyone.",
            )}
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

    if (msg.type === "breathingCard") {
      return (
        <SakhiRow key={i}>
          <BreathingCard />
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

    if (msg.type === "energyPicker") {
      return (
        <SakhiRow key={i}>
          <EnergyPicker locked={energyLocked} selected={selectedEnergy} onPick={handleEnergyPick} />
        </SakhiRow>
      );
    }

    if (msg.type === "confirmation") {
      return (
        <SakhiRow key={i}>
          <ConfirmationCard mood={msg.mood} energy={msg.energy} phase={PHASE} />
        </SakhiRow>
      );
    }

    if (msg.type === "contentLink") {
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
        className="min-h-0 flex-1 overflow-y-auto px-3 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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

      {/* Phase banner sits just below the HubHeader */}
      <div
        className="fixed right-0 left-0 z-10"
        style={{ top: "calc(env(safe-area-inset-top, 0px) + 76px)" }}
      >
        <PhaseBanner phase={PHASE} />
      </div>

      <HubHeader
        title={t("मूड ट्रैकर", "Mood Tracker")}
        backHref="/womens-health"
        scrolled={false}
      />
      <HubChatInput
        variant="sleek"
        placeholder={t("कुछ और बताना चाहती हैं...", "Anything else you'd like to share...")}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
