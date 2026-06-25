"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { HubChatInput } from "@/app/jobs/design-prototype/HubChatInput";
import { HubHeader } from "@/app/jobs/design-prototype/HubHeader";

// ─── Sakhi Avatar ────────────────────────────────────────────────────────────

function DidiAvatar({ speaking }: { speaking: boolean }) {
  return (
    <div className="relative flex items-center justify-center">
      {/* Glow ring when speaking */}
      <div
        className={`absolute rounded-full transition-all duration-700 ${
          speaking ? "scale-110 opacity-100" : "scale-100 opacity-0"
        }`}
        style={{
          width: 92,
          height: 92,
          background: "radial-gradient(circle, rgba(194,24,91,0.3) 0%, rgba(194,24,91,0) 70%)",
        }}
      />
      {/* Outer ring border */}
      <div
        className="absolute rounded-full"
        style={{
          width: 80,
          height: 80,
          background: speaking
            ? "linear-gradient(135deg, #C2185B, #E91E8C)"
            : "linear-gradient(135deg, #f9a8d4, #C2185B)",
          padding: 2,
        }}
      />
      {/* Avatar image */}
      <div
        className="relative overflow-hidden rounded-full"
        style={{ width: 76, height: 76, border: "3px solid white" }}
      >
        <Image
          src="/assets/personal-companion/avatar.png"
          alt="दीदी"
          width={76}
          height={76}
          className="size-full object-cover object-top"
          unoptimized
        />
      </div>
    </div>
  );
}

// ─── Section 1: Sakhi Assistant Card ─────────────────────────────────────────

function DidiCard() {
  const [speaking, setSpeaking] = useState(false);

  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: "linear-gradient(135deg, #fff0f5 0%, #fce4ec 100%)" }}
    >
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => setSpeaking((v) => !v)}
          className="shrink-0 cursor-pointer touch-manipulation border-none bg-transparent p-0 transition-transform duration-150 active:scale-95"
          aria-label="सखी से बात करें"
        >
          <DidiAvatar speaking={speaking} />
        </button>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            <span
              className="text-[18px] font-bold tracking-tight"
              style={{ fontFamily: "JioType, sans-serif", color: "#880E4F" }}
            >
              सखी
            </span>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{ background: "#FCE4EC", color: "#C2185B" }}
            >
              AI सहेली
            </span>
          </div>
          <p
            className="text-[13px] leading-snug"
            style={{ fontFamily: "JioType, sans-serif", color: "#4A1942" }}
          >
            {speaking
              ? "हाँ बताओ, मैं सुन रही हूँ... 🌸"
              : "नमस्ते! मैं सखी हूँ — आपकी विश्वासपात्र स्वास्थ्य सहेली। कोई भी बात बेझिझक पूछें।"}
          </p>
        </div>
      </div>

      {/* Speaking indicator */}
      {speaking && (
        <div className="mt-3 flex items-center gap-1.5 pl-[88px]">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="rounded-full"
              style={{
                width: 4,
                height: 4 + ((i * 7) % 12),
                background: "#C2185B",
                opacity: 0.7,
                animation: `bounce 0.8s ease-in-out ${i * 0.1}s infinite alternate`,
              }}
            />
          ))}
          <style>{`
            @keyframes bounce { from { transform: scaleY(1); } to { transform: scaleY(2.2); } }
          `}</style>
        </div>
      )}

      <button
        type="button"
        onClick={() => setSpeaking((v) => !v)}
        className="mt-3 w-full rounded-full py-2.5 text-[14px] font-semibold text-white transition-transform duration-150 active:scale-[0.97]"
        style={{
          fontFamily: "JioType, sans-serif",
          background: speaking
            ? "linear-gradient(90deg, #C2185B 0%, #880E4F 100%)"
            : "linear-gradient(90deg, #E91E8C 0%, #C2185B 100%)",
        }}
      >
        {speaking ? "🛑 रोकें" : "🎙️ सखी से बात करें"}
      </button>
    </div>
  );
}

// ─── Section 2: Three P0 Tiles ───────────────────────────────────────────────

const P0_TILES = [
  {
    icon: "🩸",
    label: "पीरियड ट्रैकर",
    desc: "पीरियड लॉग करें, अगला पीरियड कब — सखी याद रखती है",
    tag: "Foundation",
    bg: "#FEE2E2",
    accent: "#EF4444",
    tagBg: "#FCE4EC",
    tagText: "#C2185B",
    href: "/womens-health/period-tracker",
  },
  {
    icon: "💜",
    label: "मूड ट्रैकर",
    desc: "PMS, चिड़चिड़ापन, थकान — हॉर्मोन से जोड़कर समझें",
    tag: "सबसे अलग",
    bg: "#EDE9FE",
    accent: "#7C3AED",
    tagBg: "#EDE9FE",
    tagText: "#5B21B6",
    href: "/womens-health/low-mood",
  },
  {
    icon: "📖",
    label: "महिला स्वास्थ्य",
    desc: "PCOS, दर्द, एनीमिया — सखी से पूछें, Hindi में जवाब",
    tag: "जानकारी",
    bg: "#E1F5EE",
    accent: "#059669",
    tagBg: "#D1FAE5",
    tagText: "#065F46",
    href: "/womens-health/health-content",
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
      <div className="flex flex-col gap-2.5">
        {P0_TILES.map((t) => (
          <button
            key={t.label}
            type="button"
            onClick={() => router.push(t.href)}
            className="flex items-center gap-4 rounded-2xl p-4 text-left transition-transform duration-100 active:scale-[0.98]"
            style={{ background: t.bg }}
          >
            <span className="shrink-0 text-[36px]">{t.icon}</span>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex items-center gap-2">
                <span
                  className="text-[15px] leading-tight font-bold"
                  style={{ fontFamily: "JioType, sans-serif", color: t.accent }}
                >
                  {t.label}
                </span>
                <span
                  className="rounded-full px-2 py-0.5 text-[9px] font-semibold"
                  style={{
                    background: t.tagBg,
                    color: t.tagText,
                    fontFamily: "JioType, sans-serif",
                  }}
                >
                  {t.tag}
                </span>
              </div>
              <span
                className="text-[12px] leading-snug text-zinc-600"
                style={{ fontFamily: "JioType, sans-serif" }}
              >
                {t.desc}
              </span>
            </div>
            <span className="shrink-0 text-[18px] text-zinc-400">›</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Section 3: Push Notifications / Awareness ───────────────────────────────

const AWARENESS = [
  {
    stat: "57%",
    topic: "भारतीय महिलाओं को खून की कमी है",
    sub: "एनीमिया इतना आम है कि सब 'सामान्य' मान लेती हैं",
    color: "#FEF9C3",
    accent: "#B45309",
    icon: "🩺",
  },
  {
    stat: "7 साल",
    topic: "Endometriosis का औसत diagnosis delay",
    sub: "'सबको दर्द होता है' — यह सोच बदलनी होगी",
    color: "#FEE2E2",
    accent: "#EF4444",
    icon: "⏳",
  },
  {
    stat: "67%",
    topic: "महिलाएं स्वास्थ्य को taboo मानती हैं",
    sub: "अपनी तकलीफ किसी को नहीं बता पातीं",
    color: "#EDE9FE",
    accent: "#7C3AED",
    icon: "💜",
  },
  {
    stat: "98%",
    topic: "महिलाएं अपनी भाषा में जानकारी चाहती हैं",
    sub: "सखी हिंदी में — आपकी ज़बान में — बात करती है",
    color: "#D1FAE5",
    accent: "#059669",
    icon: "🌸",
  },
];

function AwarenessTiles() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <h2
          className="text-[15px] font-bold text-zinc-900"
          style={{ fontFamily: "JioType, sans-serif" }}
        >
          आप अकेली नहीं हैं 🌸
        </h2>
        <p className="text-[12px]" style={{ fontFamily: "JioType, sans-serif", color: "#6B7280" }}>
          ये बातें हर महिला के लिए ज़रूरी हैं
        </p>
      </div>
      <div className="flex flex-col gap-2.5">
        {AWARENESS.map((a) => (
          <div
            key={a.topic}
            className="flex items-start gap-3 rounded-xl p-3"
            style={{ background: a.color }}
          >
            <span className="mt-0.5 shrink-0 text-[20px]">{a.icon}</span>
            <div className="flex flex-col gap-0.5">
              <span
                className="text-[16px] leading-tight font-black"
                style={{ fontFamily: "JioType, sans-serif", color: a.accent }}
              >
                {a.stat}
              </span>
              <span
                className="text-[13px] leading-snug font-semibold text-zinc-800"
                style={{ fontFamily: "JioType, sans-serif" }}
              >
                {a.topic}
              </span>
              <span
                className="text-[11px] leading-snug"
                style={{ fontFamily: "JioType, sans-serif", color: "#6B7280" }}
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

// ─── Section 4: Voice + Text Input ───────────────────────────────────────────

function HindiInput() {
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [voiceActive, setVoiceActive] = useState(false);

  const QUICK = ["पीरियड लेट है", "बहुत दर्द है", "मूड खराब है", "कमज़ोरी लग रही है"];

  function handleSubmit() {
    if (!text.trim()) return;
    setSubmitted(text.trim());
    setText("");
  }

  return (
    <div className="flex flex-col gap-3">
      <h2
        className="text-[15px] font-bold text-zinc-900"
        style={{ fontFamily: "JioType, sans-serif" }}
      >
        सखी को बताएं 💬
      </h2>

      {/* Quick chips */}
      <div className="flex flex-wrap gap-2">
        {QUICK.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => setText(q)}
            className="rounded-full px-3 py-1.5 text-[12px] font-medium transition-all duration-150 active:scale-95"
            style={{
              fontFamily: "JioType, sans-serif",
              background: text === q ? "#C2185B" : "#FCE4EC",
              color: text === q ? "white" : "#880E4F",
            }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Text area */}
      <div
        className="flex flex-col gap-2 rounded-2xl p-3"
        style={{ background: "#FFF0F5", border: "1px solid #F9A8D4" }}
      >
        <textarea
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="हिंदी में लिखें — जैसे 'मेरे पीरियड्स अनियमित हैं...'"
          className="resize-none border-none bg-transparent text-[14px] leading-relaxed outline-none placeholder:text-pink-300"
          style={{ fontFamily: "JioType, sans-serif", color: "#3D1A24" }}
        />

        <div className="flex items-center justify-between">
          {/* Voice button */}
          <button
            type="button"
            onClick={() => setVoiceActive((v) => !v)}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium transition-all duration-150 active:scale-95"
            style={{
              fontFamily: "JioType, sans-serif",
              background: voiceActive ? "#C2185B" : "#FCE4EC",
              color: voiceActive ? "white" : "#880E4F",
            }}
          >
            <span>{voiceActive ? "🔴" : "🎙️"}</span>
            <span>{voiceActive ? "सुन रही हूँ..." : "बोलकर बताएं"}</span>
          </button>

          {/* Send button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!text.trim()}
            className="rounded-full px-4 py-1.5 text-[13px] font-semibold text-white transition-all duration-150 active:scale-95 disabled:opacity-40"
            style={{
              fontFamily: "JioType, sans-serif",
              background: "linear-gradient(90deg, #E91E8C 0%, #C2185B 100%)",
            }}
          >
            भेजें →
          </button>
        </div>
      </div>

      {/* Response bubble */}
      {submitted && (
        <div className="flex flex-col gap-2">
          {/* User message */}
          <div
            className="self-end rounded-2xl rounded-br-sm px-3 py-2 text-[13px] text-white"
            style={{ background: "#C2185B", fontFamily: "JioType, sans-serif" }}
          >
            {submitted}
          </div>
          {/* Didi response */}
          <div className="flex items-start gap-2">
            <div
              className="shrink-0 overflow-hidden rounded-full"
              style={{ width: 32, height: 32 }}
            >
              <Image
                src="/assets/personal-companion/avatar.png"
                alt="दीदी"
                width={32}
                height={32}
                className="size-full object-cover object-top"
                unoptimized
              />
            </div>
            <div
              className="flex-1 rounded-2xl rounded-tl-sm px-3 py-2 text-[13px] leading-relaxed"
              style={{ background: "#FCE4EC", fontFamily: "JioType, sans-serif", color: "#4A1942" }}
            >
              आपकी बात सुनी। सखी जल्द जवाब देगी... 🌸
            </div>
          </div>
        </div>
      )}
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
          <DidiCard />
          <P0Tiles />
          <AwarenessTiles />
          <HindiInput />
        </div>
      </main>

      <HubHeader title="महिला स्वास्थ्य" scrolled={scrolled} />

      <HubChatInput variant="sleek" placeholder="सखी से पूछें..." />
    </div>
  );
}
