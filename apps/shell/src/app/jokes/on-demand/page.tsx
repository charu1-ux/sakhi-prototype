"use client";

import { useCallback, useRef, useState } from "react";

import { HubHeader } from "@/app/jobs/design-prototype/HubHeader";
import { ClipCard, type ClipData } from "../_components/ClipCard";

// ── Mock clips ────────────────────────────────────────────────────────────────

type Theme = { id: string; label: string; emoji: string };

const THEMES: Theme[] = [
  { id: "cricket", label: "Cricket", emoji: "🏏" },
  { id: "monday", label: "Monday Blues", emoji: "😩" },
  { id: "diwali", label: "Diwali", emoji: "🪔" },
  { id: "office", label: "Office Life", emoji: "💼" },
  { id: "traffic", label: "Mumbai Traffic", emoji: "🚗" },
  { id: "food", label: "Food", emoji: "🍛" },
  { id: "marriage", label: "Shaadi Season", emoji: "💒" },
  { id: "ipl", label: "IPL", emoji: "🏆" },
];

const TODAY_EVENTS = [
  "India beat Australia last night",
  "It's Wednesday (Hump day)",
  "Petrol prices up again",
  "New Bollywood release this Friday",
];

const MOCK_CLIPS: Record<string, ClipData> = {
  cricket: {
    jokeText:
      "Ek baat batao — agar batting average se IQ hota, toh India mein engineer nahi, opening batsmen hote.",
    punchline: "But we still love you, bhai. 🏏",
    voiceTag: "Sunil Grover style",
    tone: "Roast",
    imageBg: "bg-[#1e40af]",
    imageEmoji: "🏏",
    durationSec: 23,
    lang: "Hinglish",
  },
  monday: {
    jokeText:
      "Monday aaya matlab alarm ne pehli baar poora baja — aur phir bhi neend nahi tooti. Phone ne socha — yeh toh soya hi rehega.",
    punchline: "Monday motivation? Mere liye toh Monday condolence hai. 😩",
    voiceTag: "Kapil Sharma style",
    tone: "Relatable",
    imageBg: "bg-[#7c3aed]",
    imageEmoji: "😴",
    durationSec: 25,
    lang: "Hinglish",
  },
  diwali: {
    jokeText:
      "Diwali mein ghar saaf karo, toh cupboard ke andar se 2019 ka mithai ka dabba milta hai. Seal band. Expiry 2020. Still full.",
    punchline: "Indian households: where sweets go to retire. 🪔",
    voiceTag: "Aunty voice",
    tone: "Warm",
    imageBg: "bg-[#ea580c]",
    imageEmoji: "🪔",
    durationSec: 22,
    lang: "Hinglish",
  },
  office: {
    jokeText:
      "Team building activity mein sabne kaha 'I'm a team player.' Sab jhoote hain. Meeting mein toh sabne phone pe dekha.",
    punchline: "HR log bhi. 💼",
    voiceTag: "Corporate voice",
    tone: "Dry",
    imageBg: "bg-[#475569]",
    imageEmoji: "😐",
    durationSec: 20,
    lang: "English",
  },
  traffic: {
    jokeText:
      "Mumbai traffic mein pehle horn bajao, phir brake lagao, phir socho kyun bajaya. Logic — optional.",
    punchline: "Wahan toh GPS bhi bol deta hai — 'Rethink your life choices.' 🚗",
    voiceTag: "Auto driver voice",
    tone: "Roast",
    imageBg: "bg-[#dc2626]",
    imageEmoji: "🚕",
    durationSec: 24,
    lang: "Hinglish",
  },
  food: {
    jokeText:
      "Ghar ka khana vs restaurant ka khana. Ghar mein Maa puchti hai — 'Aur lena?' Restaurant mein waiter puchta hai — 'Kuch aur chahiye?' Dono ki neeyat alag hai.",
    punchline: "Lekin dono mein se Maa jeet ti hai. Hamesha. 🍛",
    voiceTag: "Food blogger voice",
    tone: "Warm",
    imageBg: "bg-[#b45309]",
    imageEmoji: "🍛",
    durationSec: 25,
    lang: "Hinglish",
  },
  marriage: {
    jokeText:
      "Shaadi ke baad log bhi badal jaate hain. Matlab — single mein Zomato, married mein 'ghar ka khana khao.'",
    punchline:
      "Love marriage = love karo. Arranged marriage = arrange karo. Both = survive karo. 💒",
    voiceTag: "Stand-up voice",
    tone: "Relatable",
    imageBg: "bg-[#db2777]",
    imageEmoji: "💒",
    durationSec: 23,
    lang: "Hinglish",
  },
  ipl: {
    jokeText:
      "IPL mein team change karna aur party change karna — dono mein logic nahi chahiye, sirf jersey chahiye.",
    punchline: "CSK fan in January. RCB fan in April. Cricket fan always. 🏆",
    voiceTag: "Commentary voice",
    tone: "Roast",
    imageBg: "bg-[#7c3aed]",
    imageEmoji: "🏆",
    durationSec: 21,
    lang: "Hinglish",
  },
  default: {
    jokeText:
      "Ek baar ek banda bola — 'I hate Mondays.' System bola — 'Error 404: Monday not found. It's Sunday. Sleep more.'",
    punchline: "True story. It happened to me. Every Sunday. 😂",
    voiceTag: "Raju Sir voice",
    tone: "Random",
    imageBg: "bg-[#ea580c]",
    imageEmoji: "😂",
    durationSec: 22,
    lang: "Hinglish",
  },
};

type GenState = "idle" | "generating" | "ready";

export default function OnDemandPage() {
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [customInput, setCustomInput] = useState("");
  const [genState, setGenState] = useState<GenState>("idle");
  const [clip, setClip] = useState<ClipData | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const scrollRef = useRef(false);

  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    const past = e.currentTarget.scrollTop > 8;
    if (past !== scrollRef.current) {
      scrollRef.current = past;
      setScrolled(past);
    }
  }, []);

  const canGenerate = selectedTheme !== null || customInput.trim().length > 3;

  const generate = useCallback(() => {
    if (!canGenerate) return;
    setGenState("generating");
    setTimeout(() => {
      const key = selectedTheme ?? "default";
      setClip(MOCK_CLIPS[key] ?? MOCK_CLIPS.default);
      setGenState("ready");
    }, 1800);
  }, [canGenerate, selectedTheme]);

  const reset = useCallback(() => {
    setGenState("idle");
    setClip(null);
    setSelectedTheme(null);
    setCustomInput("");
  }, []);

  return (
    <div className="bg-canvas-grey text-fg relative flex h-full flex-col">
      <main
        className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 68px)" }}
        onScroll={handleScroll}
      >
        <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4">
          {/* Input */}
          {genState === "idle" && (
            <>
              <div className="flex flex-col gap-3 rounded-2xl bg-white px-4 py-4">
                <p className="text-[13px] font-bold text-[#0c0d10]">
                  What should the joke be about?
                </p>
                <input
                  value={customInput}
                  onChange={(e) => {
                    setCustomInput(e.target.value);
                    setSelectedTheme(null);
                  }}
                  placeholder="Type anything — cricket, traffic, office…"
                  className="bg-surface-ghost w-full rounded-xl px-4 py-3 text-[14px] font-medium text-[#0c0d10] placeholder:text-black/30 focus:ring-2 focus:ring-[#ea580c] focus:outline-none"
                />
              </div>

              {/* Theme chips */}
              <section className="flex flex-col gap-3">
                <span className="text-[10px] font-bold tracking-widest text-black/40 uppercase">
                  Or pick a theme
                </span>
                <div className="flex flex-wrap gap-2">
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setSelectedTheme(t.id);
                        setCustomInput("");
                      }}
                      className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-bold transition-all ${
                        selectedTheme === t.id
                          ? "bg-[#ea580c] text-white"
                          : "bg-white text-[#0c0d10] active:bg-[#fff7ed]"
                      }`}
                    >
                      <span>{t.emoji}</span>
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Today's events */}
              <section className="flex flex-col gap-3">
                <span className="text-[10px] font-bold tracking-widest text-black/40 uppercase">
                  Tied to today
                </span>
                <div className="flex flex-col gap-2">
                  {TODAY_EVENTS.map((ev) => (
                    <button
                      key={ev}
                      onClick={() => {
                        setCustomInput(ev);
                        setSelectedTheme(null);
                      }}
                      className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-left transition-colors active:bg-[#fff7ed]"
                    >
                      <span className="text-[11px] font-medium text-black/50">Today ·</span>
                      <span className="text-[13px] font-medium text-[#0c0d10]">{ev}</span>
                    </button>
                  ))}
                </div>
              </section>

              <button
                onClick={generate}
                disabled={!canGenerate}
                className="w-full rounded-full bg-[#ea580c] py-4 text-[15px] font-bold text-white transition-opacity active:opacity-80 disabled:opacity-30"
              >
                Generate joke clip →
              </button>
            </>
          )}

          {/* Generating */}
          {genState === "generating" && (
            <div className="flex flex-col items-center gap-5 rounded-2xl bg-white px-4 py-12">
              <div className="flex size-16 items-center justify-center rounded-full bg-[#fff7ed]">
                <div className="flex items-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="size-2 rounded-full bg-[#ea580c]"
                      style={{ animation: `dot-bounce 0.8s ease-in-out ${i * 160}ms infinite` }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <p className="text-[15px] font-black text-[#0c0d10]">Writing the joke…</p>
                <p className="text-[12px] font-medium text-black/40">
                  Timing, punchline, voice — crafting it right
                </p>
              </div>
              <style>{`@keyframes dot-bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }`}</style>
            </div>
          )}

          {/* Ready */}
          {genState === "ready" && clip && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-widest text-black/40 uppercase">
                  Your joke clip
                </span>
                <button
                  onClick={reset}
                  className="bg-surface-ghost rounded-full px-3 py-1.5 text-[11px] font-bold text-black/60 active:opacity-70"
                >
                  New joke
                </button>
              </div>
              <ClipCard clip={clip} />
            </>
          )}
        </div>
      </main>

      <HubHeader title="On-demand Joke" backHref="/jokes" scrolled={scrolled} />
    </div>
  );
}
