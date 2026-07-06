"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { HubChatInput } from "@/app/jobs/design-prototype/HubChatInput";
import { HubHeader } from "@/app/jobs/design-prototype/HubHeader";
import { useLang } from "./LangContext";

// ─── Sakhi Avatar (simple illustrated, relatable) ────────────────────────────

function SakhiAvatar({ speaking }: { speaking: boolean }) {
  return (
    <div className="relative flex items-center justify-center">
      {/* Pulse ring when speaking */}
      {speaking && (
        <div
          className="absolute animate-ping rounded-full"
          style={{ width: 76, height: 76, background: "rgba(225,29,72,0.15)" }}
        />
      )}
      {/* Avatar circle */}
      <div
        className="relative flex items-center justify-center overflow-hidden rounded-full"
        style={{
          width: 72,
          height: 72,
          background: "#FFF1F2",
          border: speaking ? "2.5px solid #E11D48" : "2.5px solid #FECDD3",
        }}
      >
        {/* Simple illustrated face — relatable, everyday Indian woman */}
        <svg
          width="52"
          height="52"
          viewBox="0 0 52 52"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Head group — scaled down to balance against the coat */}
          <g transform="translate(9.1, -1.5) scale(0.65)">
            {/* Hair top */}
            <ellipse cx="26" cy="15" rx="14" ry="12" fill="#1C1917" />
            {/* Side hair */}
            <ellipse cx="12" cy="22" rx="4" ry="7" fill="#1C1917" />
            <ellipse cx="40" cy="22" rx="4" ry="7" fill="#1C1917" />
            {/* Middle parting line */}
            <line x1="26" y1="5" x2="26" y2="14" stroke="#292524" strokeWidth="1.5" />
            {/* Face */}
            <ellipse cx="26" cy="27" rx="13" ry="14" fill="#C68642" />
            {/* Forehead bindi */}
            <circle cx="26" cy="17" r="1.5" fill="#DC2626" />
            {/* Eyes */}
            <ellipse cx="21" cy="25" rx="2.5" ry="2" fill="#1C1917" />
            <ellipse cx="31" cy="25" rx="2.5" ry="2" fill="#1C1917" />
            {/* Eye shine */}
            <circle cx="22" cy="24" r="0.7" fill="white" />
            <circle cx="32" cy="24" r="0.7" fill="white" />
            {/* Nose */}
            <path d="M26 27 Q24 30 25 31 Q26 31.5 27 31 Q28 30 26 27Z" fill="#A0673A" />
            {/* Smile */}
            <path
              d="M21 33 Q26 37 31 33"
              stroke="#7C3C1A"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
          </g>
          {/* White coat — wide shoulders */}
          <path
            d="M3 29 Q26 24.5 49 29 L49 52 L3 52Z"
            fill="#FFFFFF"
            stroke="#E2E8F0"
            strokeWidth="1"
          />
          {/* Coat lapels (V-neck) */}
          <path d="M12 28 L26 49 L20.5 28Z" fill="#EEF2F6" stroke="#DCE3EA" strokeWidth="0.5" />
          <path d="M40 28 L26 49 L31.5 28Z" fill="#EEF2F6" stroke="#DCE3EA" strokeWidth="0.5" />
          {/* Shirt collar peeking through */}
          <path d="M20.5 28 L26 37 L31.5 28Z" fill="#BFDBFE" />
          {/* ID badge */}
          <rect
            x="8"
            y="32.5"
            width="8"
            height="9"
            rx="1.15"
            fill="#FFFFFF"
            stroke="#CBD5E1"
            strokeWidth="0.6"
          />
          <circle cx="12" cy="36" r="1.6" fill="#93C5FD" />
          <line x1="9" y1="39.65" x2="15.5" y2="39.65" stroke="#CBD5E1" strokeWidth="0.7" />
          {/* Stethoscope tube */}
          <path
            d="M12 27 Q4.5 34 11 41 Q15.5 45.5 22.5 43.5"
            stroke="#64748B"
            strokeWidth="2.4"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M40 27 Q47.5 34 41 41 Q36.5 45.5 29.5 43.5"
            stroke="#64748B"
            strokeWidth="2.4"
            fill="none"
            strokeLinecap="round"
          />
          {/* Stethoscope chestpiece */}
          <circle cx="26" cy="44.5" r="3.6" fill="#64748B" />
          <circle cx="26" cy="44.5" r="1.95" fill="#94A3B8" />
        </svg>
      </div>
    </div>
  );
}

// ─── Sakhi Card ───────────────────────────────────────────────────────────────

function SakhiCard() {
  const { lang } = useLang();
  const [speaking, setSpeaking] = useState(false);
  const t = (hi: string, en: string) => (lang === "hi" ? hi : en);

  return (
    <div className="rounded-2xl bg-white p-4" style={{ border: "1px solid #F3F4F6" }}>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setSpeaking((v) => !v)}
          className="shrink-0 cursor-pointer touch-manipulation border-none bg-transparent p-0 transition-transform duration-150 active:scale-95"
          aria-label={t("सखी से बात करें", "Talk to Doctor Friend")}
        >
          <SakhiAvatar speaking={speaking} />
        </button>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            <span
              className="text-[17px] font-bold tracking-tight text-zinc-900"
              style={{ fontFamily: "JioType, sans-serif" }}
            >
              {t("सखी", "Doctor Friend")}
            </span>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{ background: "#FFF1F2", color: "#BE123C", fontFamily: "JioType, sans-serif" }}
            >
              {t("AI सहेली", "AI Companion")}
            </span>
          </div>
          <p
            className="text-[13px] leading-snug text-zinc-500"
            style={{ fontFamily: "JioType, sans-serif" }}
          >
            {speaking
              ? t("हाँ बताओ, मैं सुन रही हूँ...", "Yes, tell me, I'm listening...")
              : t("नमस्ते! कोई भी सवाल पूछें — बेझिझक।", "Hello! Ask me anything — feel free.")}
          </p>
        </div>
      </div>

      {/* Voice bars */}
      {speaking && (
        <div className="mt-3 flex items-center gap-1.5 pl-[80px]">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="rounded-full"
              style={{
                width: 4,
                height: 4 + ((i * 7) % 12),
                background: "#E11D48",
                opacity: 0.65,
                animation: `bounce 0.8s ease-in-out ${i * 0.1}s infinite alternate`,
              }}
            />
          ))}
          <style>{`@keyframes bounce{from{transform:scaleY(1)}to{transform:scaleY(2.2)}}`}</style>
        </div>
      )}
    </div>
  );
}

// ─── P0 Tiles ─────────────────────────────────────────────────────────────────

const P0_TILES = [
  {
    icon: "✅",
    iconBg: "#F0FDF4",
    label: "जाँची-परखी जानकारी",
    labelEn: "Verified Health Info",
    desc: "PCOS, पीरियड दर्द, एनीमिया — विशेषज्ञों द्वारा सत्यापित लेख और वीडियो",
    descEn: "PCOS, period pain, anaemia — articles & videos verified by experts",
    href: "/womens-health/health-content",
  },
  {
    icon: "🗓️",
    iconBg: "#FFF1F2",
    label: "पीरियड ट्रैकर",
    labelEn: "Period Tracker",
    desc: "पीरियड लॉग करें, अगला पीरियड कब — सखी याद रखती है",
    descEn: "Log your period, know when next — Doctor Friend remembers",
    href: "/womens-health/period-tracker",
  },
  {
    icon: "💜",
    iconBg: "#F5F3FF",
    label: "मूड ट्रैकर",
    labelEn: "Mood Tracker",
    desc: "मासिक धर्म से पहले मूड खराब, चिड़चिड़ापन — हॉर्मोन से जोड़कर समझें",
    descEn: "Low mood, irritability before periods — understand the hormone link",
    href: "/womens-health/mood-tracker",
  },
];

function P0Tiles() {
  const { lang } = useLang();
  const router = useRouter();
  const t = (hi: string, en: string) => (lang === "hi" ? hi : en);
  return (
    <div className="flex flex-col gap-3">
      <h2
        className="text-[15px] font-bold text-zinc-900"
        style={{ fontFamily: "JioType, sans-serif" }}
      >
        {t("आज क्या करना है?", "What do you want to do today?")}
      </h2>
      <div className="flex flex-col gap-2">
        {P0_TILES.map((tile) => (
          <button
            key={tile.label}
            type="button"
            onClick={() => router.push(tile.href)}
            className="flex items-center gap-3 rounded-2xl bg-white p-3.5 text-left transition-opacity active:opacity-70"
            style={{ border: "1px solid #F3F4F6" }}
          >
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[22px]"
              style={{ background: tile.iconBg }}
            >
              {tile.icon}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span
                className="text-[14px] font-semibold text-zinc-900"
                style={{ fontFamily: "JioType, sans-serif" }}
              >
                {t(tile.label, tile.labelEn)}
              </span>
              <span
                className="text-[12px] leading-snug text-zinc-500"
                style={{ fontFamily: "JioType, sans-serif" }}
              >
                {t(tile.desc, tile.descEn)}
              </span>
            </div>
            <span className="shrink-0 text-[18px] text-zinc-300">›</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WomensHealthPage() {
  const { lang, setLang } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const scrollRef = useRef(false);
  const t = (hi: string, en: string) => (lang === "hi" ? hi : en);

  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    const past = e.currentTarget.scrollTop > 8;
    if (past !== scrollRef.current) {
      scrollRef.current = past;
      setScrolled(past);
    }
  }, []);

  const langToggle = (
    <button
      type="button"
      onClick={() => setLang(lang === "hi" ? "en" : "hi")}
      className="flex h-9 items-center rounded-full px-3 text-[13px] font-semibold"
      style={{ background: "#FFF1F2", color: "#BE123C", fontFamily: "JioType, sans-serif" }}
    >
      {lang === "hi" ? "EN" : "हिं"}
    </button>
  );

  return (
    <div className="bg-canvas-grey text-fg relative flex h-full flex-col">
      <main
        className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-4 pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 76px)" }}
        onScroll={handleScroll}
      >
        <div className="mx-auto flex w-full max-w-md flex-col gap-6">
          <SakhiCard />
          <P0Tiles />
        </div>
      </main>

      <HubHeader
        title={t("महिला स्वास्थ्य", "Women's Health")}
        scrolled={scrolled}
        onBack={() => {}}
        rightSlot={langToggle}
      />
      <HubChatInput variant="sleek" placeholder={t("सखी से पूछें...", "Ask Sakhi...")} />
    </div>
  );
}
