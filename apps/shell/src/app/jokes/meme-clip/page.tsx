"use client";

import { useCallback, useRef, useState } from "react";

import { HubHeader } from "@/app/jobs/design-prototype/HubHeader";
import { ClipCard, type ClipData } from "../_components/ClipCard";

// ── Trending topics ───────────────────────────────────────────────────────────

const TRENDING = [
  { topic: "India won last night", heat: "🔥🔥🔥" },
  { topic: "New iPhone price in India", heat: "🔥🔥🔥" },
  { topic: "Petrol at ₹106", heat: "🔥🔥" },
  { topic: "RCB still can't win", heat: "🔥🔥🔥" },
  { topic: "Monsoon delayed again", heat: "🔥🔥" },
  { topic: "Bigg Boss new season", heat: "🔥" },
  { topic: "Netflix raising prices", heat: "🔥🔥" },
  { topic: "Government exam leak", heat: "🔥🔥" },
];

const MOCK_CLIPS: Record<string, ClipData> = {
  "India won last night": {
    jokeText:
      "India jeetne ke baad Twitter: 'We always believed.' Aap log 2 overs pehle toh already crying emoji dal chuke the.",
    punchline: "Selective memory — India fan edition. 🏏",
    voiceTag: "Sports anchor roast",
    tone: "Roast",
    imageBg: "bg-[#1e40af]",
    imageEmoji: "🏏",
    durationSec: 22,
    lang: "Hinglish",
  },
  "New iPhone price in India": {
    jokeText:
      "New iPhone ₹1.4 lakh. India: 'Thoda sasta karo.' Apple: 'Have you tried not being born in India?'",
    punchline: "Meanwhile Android users counting their savings. 📱",
    voiceTag: "Tech bro voice",
    tone: "Absurd",
    imageBg: "bg-[#334155]",
    imageEmoji: "📱",
    durationSec: 20,
    lang: "Hinglish",
  },
  "Petrol at ₹106": {
    jokeText:
      "Petrol ₹106 hua. Log bole cycle kharidenge. Cycle ₹8000. Loan lete hain. EMI mein petrol se zyada dete hain. Circular problem.",
    punchline: "India's economy in one joke. 🚗",
    voiceTag: "Auto driver voice",
    tone: "Dry",
    imageBg: "bg-[#dc2626]",
    imageEmoji: "⛽",
    durationSec: 25,
    lang: "Hinglish",
  },
  "RCB still can't win": {
    jokeText:
      "RCB loses again. Virat scores 90. Ab bolte hain team effort. Ek hi toh tha team mein, woh bhi out ho gaya.",
    punchline: "RCB = Royal Challengers Bechare. 😭",
    voiceTag: "Commentary voice",
    tone: "Roast",
    imageBg: "bg-[#991b1b]",
    imageEmoji: "😭",
    durationSec: 21,
    lang: "Hinglish",
  },
  default: {
    jokeText:
      "Aaj trend dekha toh laga duniya thodi zyada serious ho gayi hai. Toh yeh lo ek joke — khud decide karo kya trending tha.",
    punchline: "Humour is the only real trending thing. 😂",
    voiceTag: "Raju Sir style",
    tone: "Meta",
    imageBg: "bg-[#ea580c]",
    imageEmoji: "🎭",
    durationSec: 18,
    lang: "Hinglish",
  },
};

type GenState = "idle" | "generating" | "ready";

export default function MemeClipPage() {
  const [input, setInput] = useState("");
  const [genState, setGenState] = useState<GenState>("idle");
  const [clip, setClip] = useState<ClipData | null>(null);
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const scrollRef = useRef(false);

  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    const past = e.currentTarget.scrollTop > 8;
    if (past !== scrollRef.current) {
      scrollRef.current = past;
      setScrolled(past);
    }
  }, []);

  const generate = useCallback((topic: string) => {
    setInput(topic);
    setGenState("generating");
    setTimeout(() => {
      setClip(MOCK_CLIPS[topic] ?? MOCK_CLIPS.default);
      setGenState("ready");
    }, 2000);
  }, []);

  const reset = useCallback(() => {
    setGenState("idle");
    setClip(null);
    setInput("");
    setActiveTopic(null);
  }, []);

  return (
    <div className="bg-canvas-grey text-fg relative flex h-full flex-col">
      <main
        className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 68px)" }}
        onScroll={handleScroll}
      >
        <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4">
          {genState === "idle" && (
            <>
              {/* Input */}
              <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3">
                <span className="text-[15px]">🎭</span>
                <input
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    setActiveTopic(null);
                  }}
                  placeholder="Make a clip about…"
                  className="flex-1 bg-transparent text-[14px] font-medium text-[#0c0d10] placeholder:text-black/30 focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && input.trim().length > 3) generate(input.trim());
                  }}
                />
                {input.trim().length > 3 && (
                  <button
                    onClick={() => generate(input.trim())}
                    className="rounded-full bg-[#ea580c] px-3 py-1.5 text-[12px] font-bold text-white active:opacity-80"
                  >
                    Go →
                  </button>
                )}
              </div>

              {/* Trending */}
              <section className="flex flex-col gap-3">
                <span className="text-[10px] font-bold tracking-widest text-black/40 uppercase">
                  Trending now
                </span>
                <div className="flex flex-col gap-2">
                  {TRENDING.map((t) => (
                    <button
                      key={t.topic}
                      onClick={() => {
                        setActiveTopic(t.topic);
                        generate(t.topic);
                      }}
                      className={`flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-left transition-all active:opacity-70 ${
                        activeTopic === t.topic ? "ring-2 ring-[#ea580c]" : ""
                      }`}
                    >
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <p className="text-[13px] font-bold text-[#0c0d10]">{t.topic}</p>
                        <p className="text-[10px] font-medium text-black/40">Tap to make a clip</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <span className="text-[12px]">{t.heat}</span>
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          className="text-[#ea580c]"
                        >
                          <path
                            d="M9 18l6-6-6-6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            </>
          )}

          {genState === "generating" && (
            <div className="flex flex-col items-center gap-5 rounded-2xl bg-white px-4 py-12">
              <div className="flex size-16 items-center justify-center rounded-full bg-[#fff7ed] text-3xl">
                🎭
              </div>
              <div className="flex flex-col items-center gap-1">
                <p className="text-[15px] font-black text-[#0c0d10]">Making your clip…</p>
                <p className="max-w-[220px] text-center text-[12px] font-medium text-black/40">
                  Finding the angle, writing the line, adding punch
                </p>
              </div>
              <p className="bg-surface-ghost rounded-2xl px-4 py-2.5 text-[13px] font-medium text-black/55 italic">
                &ldquo;{input}&rdquo;
              </p>
              <style>{`@keyframes dot-bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }`}</style>
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="size-2 rounded-full bg-[#ea580c]"
                    style={{ animation: `dot-bounce 0.8s ease-in-out ${i * 160}ms infinite` }}
                  />
                ))}
              </div>
            </div>
          )}

          {genState === "ready" && clip && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold tracking-widest text-black/40 uppercase">
                    Your meme clip
                  </span>
                  <p className="text-[12px] font-medium text-black/45 italic">
                    About: &ldquo;{input}&rdquo;
                  </p>
                </div>
                <button
                  onClick={reset}
                  className="bg-surface-ghost rounded-full px-3 py-1.5 text-[11px] font-bold text-black/60 active:opacity-70"
                >
                  New clip
                </button>
              </div>
              <ClipCard clip={clip} />
            </>
          )}
        </div>
      </main>

      <HubHeader title="Voice Meme Clip" backHref="/jokes" scrolled={scrolled} />
    </div>
  );
}
