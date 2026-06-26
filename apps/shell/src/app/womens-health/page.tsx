"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { HubChatInput } from "@/app/jobs/design-prototype/HubChatInput";
import { HubHeader } from "@/app/jobs/design-prototype/HubHeader";

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
          {/* Dupatta suggestion at bottom */}
          <path d="M13 41 Q26 38 39 41 L39 52 L13 52Z" fill="#E11D48" opacity="0.7" />
        </svg>
      </div>
    </div>
  );
}

// ─── Sakhi Card ───────────────────────────────────────────────────────────────

function SakhiCard() {
  const [speaking, setSpeaking] = useState(false);

  return (
    <div className="rounded-2xl bg-white p-4" style={{ border: "1px solid #F3F4F6" }}>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setSpeaking((v) => !v)}
          className="shrink-0 cursor-pointer touch-manipulation border-none bg-transparent p-0 transition-transform duration-150 active:scale-95"
          aria-label="सखी से बात करें"
        >
          <SakhiAvatar speaking={speaking} />
        </button>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            <span
              className="text-[17px] font-bold tracking-tight text-zinc-900"
              style={{ fontFamily: "JioType, sans-serif" }}
            >
              सखी
            </span>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{ background: "#FFF1F2", color: "#BE123C", fontFamily: "JioType, sans-serif" }}
            >
              AI सहेली
            </span>
          </div>
          <p
            className="text-[13px] leading-snug text-zinc-500"
            style={{ fontFamily: "JioType, sans-serif" }}
          >
            {speaking ? "हाँ बताओ, मैं सुन रही हूँ..." : "नमस्ते! कोई भी सवाल पूछें — बेझिझक।"}
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
    desc: "PCOS, पीरियड दर्द, एनीमिया — विशेषज्ञों द्वारा सत्यापित लेख और वीडियो",
    href: "/womens-health/health-content",
  },
  {
    icon: "🗓️",
    iconBg: "#FFF1F2",
    label: "पीरियड ट्रैकर",
    desc: "पीरियड लॉग करें, अगला पीरियड कब — सखी याद रखती है",
    href: "/womens-health/period-tracker",
  },
  {
    icon: "💜",
    iconBg: "#F5F3FF",
    label: "मूड ट्रैकर",
    desc: "मासिक धर्म से पहले मूड खराब, चिड़चिड़ापन — हॉर्मोन से जोड़कर समझें",
    href: "/womens-health/low-mood",
  },
];

function P0Tiles() {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-3">
      <h2
        className="text-[15px] font-bold text-zinc-900"
        style={{ fontFamily: "JioType, sans-serif" }}
      >
        आज क्या करना है?
      </h2>
      <div className="flex flex-col gap-2">
        {P0_TILES.map((t) => (
          <button
            key={t.label}
            type="button"
            onClick={() => router.push(t.href)}
            className="flex items-center gap-3 rounded-2xl bg-white p-3.5 text-left transition-opacity active:opacity-70"
            style={{ border: "1px solid #F3F4F6" }}
          >
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[22px]"
              style={{ background: t.iconBg }}
            >
              {t.icon}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span
                className="text-[14px] font-semibold text-zinc-900"
                style={{ fontFamily: "JioType, sans-serif" }}
              >
                {t.label}
              </span>
              <span
                className="text-[12px] leading-snug text-zinc-500"
                style={{ fontFamily: "JioType, sans-serif" }}
              >
                {t.desc}
              </span>
            </div>
            <span className="shrink-0 text-[18px] text-zinc-300">›</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Awareness ────────────────────────────────────────────────────────────────

const AWARENESS = [
  {
    stat: "57%",
    topic: "भारतीय महिलाओं को खून की कमी है",
    sub: "एनीमिया इतना आम है कि सब 'सामान्य' मान लेती हैं",
    accentColor: "#B45309",
  },
  {
    stat: "7 साल",
    topic: "Endometriosis का औसत diagnosis delay",
    sub: '"सबको दर्द होता है" — यह सोच बदलनी होगी',
    accentColor: "#E11D48",
  },
  {
    stat: "67%",
    topic: "महिलाएं स्वास्थ्य को taboo मानती हैं",
    sub: "अपनी तकलीफ किसी को नहीं बता पातीं",
    accentColor: "#7C3AED",
  },
  {
    stat: "98%",
    topic: "महिलाएं अपनी भाषा में जानकारी चाहती हैं",
    sub: "सखी हिंदी में — आपकी ज़बान में — बात करती है",
    accentColor: "#059669",
  },
];

function AwarenessTiles() {
  return (
    <div className="flex flex-col gap-3">
      <h2
        className="text-[15px] font-bold text-zinc-900"
        style={{ fontFamily: "JioType, sans-serif" }}
      >
        आप अकेली नहीं हैं
      </h2>
      <div className="flex flex-col gap-2">
        {AWARENESS.map((a) => (
          <div
            key={a.topic}
            className="flex items-start gap-3 rounded-xl bg-white p-3"
            style={{ border: "1px solid #F3F4F6" }}
          >
            <span
              className="shrink-0 text-[20px] leading-tight font-black tabular-nums"
              style={{ fontFamily: "JioType, sans-serif", color: a.accentColor, minWidth: 52 }}
            >
              {a.stat}
            </span>
            <div className="flex flex-col gap-0.5">
              <span
                className="text-[13px] leading-snug font-semibold text-zinc-800"
                style={{ fontFamily: "JioType, sans-serif" }}
              >
                {a.topic}
              </span>
              <span
                className="text-[11px] leading-snug text-zinc-400"
                style={{ fontFamily: "JioType, sans-serif" }}
              >
                {a.sub}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WomensHealthPage() {
  const [scrolled, setScrolled] = useState(false);
  const scrollRef = useRef(false);

  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    const past = e.currentTarget.scrollTop > 8;
    if (past !== scrollRef.current) {
      scrollRef.current = past;
      setScrolled(past);
    }
  }, []);

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
          <AwarenessTiles />
        </div>
      </main>

      <HubHeader title="महिला स्वास्थ्य" scrolled={scrolled} />
      <HubChatInput variant="sleek" placeholder="सखी से पूछें..." />
    </div>
  );
}
