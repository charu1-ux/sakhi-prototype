"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { HubChatInput } from "@/app/jobs/design-prototype/HubChatInput";
import { HubHeader } from "@/app/jobs/design-prototype/HubHeader";

// ─── Didi Avatar ─────────────────────────────────────────────────────────────

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

// ─── Section 1: Didi Assistant Card ──────────────────────────────────────────

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
          aria-label="दीदी से बात करें"
        >
          <DidiAvatar speaking={speaking} />
        </button>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            <span
              className="text-[18px] font-bold tracking-tight"
              style={{ fontFamily: "JioType, sans-serif", color: "#880E4F" }}
            >
              दीदी
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
              : "नमस्ते! मैं दीदी हूँ — आपकी महिला स्वास्थ्य सहेली। कोई भी बात बेझिझक पूछें।"}
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
        {speaking ? "🛑 रोकें" : "🎙️ दीदी से बात करें"}
      </button>
    </div>
  );
}

// ─── Section 2: Action Tiles ──────────────────────────────────────────────────

const ACTIONS = [
  {
    icon: "🩸",
    label: "पीरियड ट्रैकर",
    desc: "अगला पीरियड कब?",
    color: "#FEE2E2",
    accent: "#EF4444",
    href: "/womens-health/period-tracker",
  },
  {
    icon: "💊",
    label: "पीरियड दर्द",
    desc: "दर्द से राहत के उपाय",
    color: "#FEF3C7",
    accent: "#D97706",
    href: "/womens-health/period-pain",
  },
  {
    icon: "😔",
    label: "मूड खराब",
    desc: "मानसिक थकान, चिड़चिड़ापन",
    color: "#EDE9FE",
    accent: "#7C3AED",
    href: "/womens-health/low-mood",
  },
  {
    icon: "😴",
    label: "नींद न आना",
    desc: "हॉर्मोन और नींद",
    color: "#DBEAFE",
    accent: "#2563EB",
    href: null,
  },
  {
    icon: "⚖️",
    label: "वजन बढ़ना",
    desc: "PCOS और वजन",
    color: "#D1FAE5",
    accent: "#059669",
    href: null,
  },
  {
    icon: "🤰",
    label: "गर्भधारण",
    desc: "प्रेगनेंसी की तैयारी",
    color: "#FCE7F3",
    accent: "#DB2777",
    href: null,
  },
];

function ActionTiles() {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-3">
      <h2
        className="text-[15px] font-bold text-zinc-900"
        style={{ fontFamily: "JioType, sans-serif" }}
      >
        क्या जानना है आपको?
      </h2>
      <div className="grid grid-cols-2 gap-2.5">
        {ACTIONS.map((a) => (
          <button
            key={a.label}
            type="button"
            onClick={() => a.href && router.push(a.href)}
            className="flex flex-col gap-1.5 rounded-xl p-3 text-left transition-transform duration-100 active:scale-[0.97]"
            style={{ background: a.color, opacity: a.href ? 1 : 0.6 }}
          >
            <span className="text-[22px]">{a.icon}</span>
            <span
              className="text-[13px] leading-tight font-bold"
              style={{ fontFamily: "JioType, sans-serif", color: a.accent }}
            >
              {a.label}
            </span>
            <span
              className="text-[11px] leading-tight"
              style={{ fontFamily: "JioType, sans-serif", color: "#374151" }}
            >
              {a.desc}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Section 3: Push Notifications / Awareness ───────────────────────────────

const AWARENESS = [
  {
    stat: "हर 5 में से 1",
    topic: "महिला को अनियमित पीरियड्स होते हैं",
    sub: "PCOS सबसे आम कारण है",
    color: "#FEE2E2",
    accent: "#EF4444",
    icon: "📅",
  },
  {
    stat: "80%",
    topic: "महिलाओं को पीरियड दर्द होता है",
    sub: "पर सिर्फ 30% ही डॉक्टर से मिलती हैं",
    color: "#FEF3C7",
    accent: "#D97706",
    icon: "💛",
  },
  {
    stat: "हर 10 में से 4",
    topic: "महिलाएं पीरियड के दौरान काम छोड़ती हैं",
    sub: "पर इसके बारे में बात नहीं होती",
    color: "#EDE9FE",
    accent: "#7C3AED",
    icon: "💜",
  },
  {
    stat: "60%",
    topic: "महिलाओं को PMS होता है",
    sub: "चिड़चिड़ापन, सूजन, थकान — सब सामान्य है",
    color: "#D1FAE5",
    accent: "#059669",
    icon: "🌿",
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
        दीदी को बताएं 💬
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
              आपकी बात सुनी। दीदी जल्द जवाब देगी... 🌸
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
          <ActionTiles />
          <AwarenessTiles />
          <HindiInput />
        </div>
      </main>

      <HubHeader title="महिला स्वास्थ्य" scrolled={scrolled} />

      <HubChatInput variant="sleek" placeholder="दीदी से पूछें..." />
    </div>
  );
}
