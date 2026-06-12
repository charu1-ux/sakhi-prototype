"use client";

import { useCallback, useRef, useState } from "react";

import { HubHeader } from "@/app/jobs/design-prototype/HubHeader";
import { ClipCard, type ClipData } from "../_components/ClipCard";

// ── Categories ────────────────────────────────────────────────────────────────

type Category = "pappu" | "sardar" | "classic" | "festival";

const CATEGORIES: { id: Category; label: string; emoji: string; desc: string }[] = [
  { id: "pappu", label: "Pappu", emoji: "🧒", desc: "School results, exams, tuition woes" },
  { id: "sardar", label: "Sardar", emoji: "😄", desc: "Classic Sardar one-liners, clean & witty" },
  { id: "classic", label: "Classic", emoji: "😂", desc: "Timeless formats — Doctor, Santa-Banta" },
  { id: "festival", label: "Festival", emoji: "🎉", desc: "Diwali, Holi, Eid, Christmas variants" },
];

const FESTIVALS = ["Diwali", "Holi", "Eid", "Christmas", "Navratri", "Baisakhi", "Onam"];

const CLIPS: Record<Category, ClipData[]> = {
  pappu: [
    {
      jokeText:
        "Teacher: Pappu, agar tumhare paas 10 chocolates hain aur main 5 maang loon, toh tumhare paas kitni bachegi? Pappu: 10, Ma'am.",
      punchline: "Meri chocolates kisi ko nahi deta. Aap bhi nahi. 🍫",
      voiceTag: "School teacher tone",
      tone: "Classic",
      imageBg: "bg-[#0284c7]",
      imageEmoji: "🧒",
      durationSec: 22,
      lang: "Hindi",
    },
    {
      jokeText:
        "Teacher: Pappu, 1 se 10 tak gin ke dikhao. Pappu: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10. Teacher: Ab ulte gin ke dikhao. Pappu: 10, 9, 8, 7, 6, 5, 4, 3, 2, 1 — mera roll number.",
      punchline: "Pappu ka IQ exam mein nahi, life mein kaam aata hai. 😂",
      voiceTag: "School setting",
      tone: "Classic",
      imageBg: "bg-[#0284c7]",
      imageEmoji: "✏️",
      durationSec: 24,
      lang: "Hindi",
    },
  ],
  sardar: [
    {
      jokeText:
        "Ek Sardar ne shopkeeper se pucha — 'Bhai, yeh size 44 ki shirt mujhe fit hogi?' Shopkeeper ne kaha — 'Ji, agar aap size 44 ke hain toh.' Sardar bola — 'Oye, toh seedha bol na.'",
      punchline: "Simplicity is wisdom. 😄",
      voiceTag: "Punjabi warmth",
      tone: "Warm",
      imageBg: "bg-[#15803d]",
      imageEmoji: "😄",
      durationSec: 21,
      lang: "Hindi",
    },
    {
      jokeText:
        "Sardar ne Google Maps se pucha — 'Seedha jaoon ya left?' Google ne bola — 'Aage 500m par right.' Sardar ne kaha — 'Tune left ka jawab hi nahi diya.' Phone band kar diya.",
      punchline: "Logic is a personal preference. 🗺️",
      voiceTag: "Friendly uncle voice",
      tone: "Classic",
      imageBg: "bg-[#15803d]",
      imageEmoji: "🗺️",
      durationSec: 22,
      lang: "Hinglish",
    },
  ],
  classic: [
    {
      jokeText:
        "Doctor: Aapko chashma lagana padega. Patient: Kab se? Doctor: Jab se aap meri fees ka cheque likhenge.",
      punchline: "Healthcare: where the bill needs the most magnification. 👓",
      voiceTag: "Doctor voice",
      tone: "Classic",
      imageBg: "bg-[#7c3aed]",
      imageEmoji: "👓",
      durationSec: 18,
      lang: "Hindi",
    },
    {
      jokeText:
        "Wife: Aaj humari anniversary hai, tum bhool gaye? Husband: Main bhool kaise sakta hoon, yeh toh mere liye kisi holiday se kam nahi hai.",
      punchline: "He survived this answer. We don't know how. 💐",
      voiceTag: "Family drama tone",
      tone: "Classic",
      imageBg: "bg-[#db2777]",
      imageEmoji: "💐",
      durationSec: 20,
      lang: "Hindi",
    },
  ],
  festival: [
    {
      jokeText:
        "Holi ka din: Bhabhi ji ne rang lagaya. Uncle ne rang lagaya. Stranger ne rang lagaya. Driver ne rang lagaya. Ab mirror mein dekha — main Picasso ki painting ban gaya hoon.",
      punchline: "Holi: the one day everyone has permission. 🎨",
      voiceTag: "Festive voice",
      tone: "Warm",
      imageBg: "bg-gradient-to-br from-[#ec4899] to-[#8b5cf6]",
      imageEmoji: "🎨",
      durationSec: 25,
      lang: "Hinglish",
    },
    {
      jokeText:
        "Diwali mein ghar saaf karo, lights lagao, mithai khao, namaz padho, mandir jao — India mein Diwali sabka festival hai. Sirf cracker waale alag hain.",
      punchline: "Ek hi desh. Hazaar rang. 🪔",
      voiceTag: "Warm family voice",
      tone: "Inclusive",
      imageBg: "bg-[#ea580c]",
      imageEmoji: "🪔",
      durationSec: 23,
      lang: "Hinglish",
    },
  ],
};

type GenState = "idle" | "generating" | "ready";

export default function FamilyPage() {
  const [category, setCategory] = useState<Category>("pappu");
  const [festival, setFestival] = useState<string | null>(null);
  const [jokeIdx, setJokeIdx] = useState(0);
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

  const generate = useCallback(() => {
    setGenState("generating");
    setTimeout(() => {
      const pool = CLIPS[category];
      setClip(pool[jokeIdx % pool.length]);
      setJokeIdx((i) => i + 1);
      setGenState("ready");
    }, 1400);
  }, [category, jokeIdx]);

  const reset = useCallback(() => {
    setGenState("idle");
    setClip(null);
  }, []);

  return (
    <div className="bg-canvas-grey text-fg relative flex h-full flex-col">
      <main
        className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 68px)" }}
        onScroll={handleScroll}
      >
        <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4">
          {/* Category picker */}
          <section className="flex flex-col gap-3">
            <span className="text-[10px] font-bold tracking-widest text-black/40 uppercase">
              Joke type
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setCategory(cat.id);
                    setGenState("idle");
                    setClip(null);
                  }}
                  className={`flex flex-col gap-1.5 rounded-2xl px-3.5 py-3.5 text-left transition-all active:scale-[0.97] ${
                    category === cat.id ? "bg-[#fff7ed] ring-2 ring-[#ea580c]/40" : "bg-white"
                  }`}
                >
                  <span className="text-2xl leading-none">{cat.emoji}</span>
                  <p className="text-[13px] font-bold text-[#0c0d10]">{cat.label}</p>
                  <p className="text-[10px] leading-snug font-medium text-black/40">{cat.desc}</p>
                </button>
              ))}
            </div>
          </section>

          {/* Festival variant (shown when festival category selected) */}
          {category === "festival" && (
            <section className="flex flex-col gap-2">
              <span className="text-[10px] font-bold tracking-widest text-black/40 uppercase">
                Pick a festival
              </span>
              <div className="flex flex-wrap gap-2">
                {FESTIVALS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFestival(festival === f ? null : f)}
                    className={`rounded-full px-3.5 py-1.5 text-[12px] font-bold transition-all ${
                      festival === f
                        ? "bg-[#ea580c] text-white"
                        : "bg-white text-[#0c0d10] active:bg-[#fff7ed]"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Family safe badge */}
          <div className="flex items-center gap-2 rounded-xl bg-[#f0fdf4] px-4 py-2.5">
            <span className="text-lg">✅</span>
            <p className="text-[12px] font-medium text-[#166534]">
              Clean humour · Safe for ages 7 to 70 · No adult content
            </p>
          </div>

          {/* Generate */}
          {genState === "idle" && (
            <button
              onClick={generate}
              className="w-full rounded-full bg-[#ea580c] py-4 text-[15px] font-bold text-white transition-opacity active:opacity-80"
            >
              Get a {CATEGORIES.find((c) => c.id === category)?.label} joke →
            </button>
          )}

          {/* Generating */}
          {genState === "generating" && (
            <div className="flex items-center justify-center gap-3 rounded-2xl bg-white px-4 py-6">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="size-2 rounded-full bg-[#ea580c]"
                    style={{ animation: `dot-bounce 0.8s ease-in-out ${i * 160}ms infinite` }}
                  />
                ))}
              </div>
              <p className="text-[13px] font-medium text-black/50">Finding the perfect joke…</p>
              <style>{`@keyframes dot-bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }`}</style>
            </div>
          )}

          {/* Ready */}
          {genState === "ready" && clip && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-widest text-black/40 uppercase">
                  {CATEGORIES.find((c) => c.id === category)?.emoji}{" "}
                  {CATEGORIES.find((c) => c.id === category)?.label} joke
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={generate}
                    className="rounded-full bg-[#fff7ed] px-3 py-1.5 text-[11px] font-bold text-[#ea580c] active:opacity-70"
                  >
                    Another →
                  </button>
                  <button
                    onClick={reset}
                    className="bg-surface-ghost rounded-full px-3 py-1.5 text-[11px] font-bold text-black/60 active:opacity-70"
                  >
                    Change type
                  </button>
                </div>
              </div>
              <ClipCard clip={clip} />
            </>
          )}
        </div>
      </main>

      <HubHeader title="Family Humour" backHref="/jokes" scrolled={scrolled} />
    </div>
  );
}
