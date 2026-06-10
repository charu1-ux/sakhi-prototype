"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { HubHeader } from "@/app/jobs/design-prototype/HubHeader";

// ── Data ──────────────────────────────────────────────────────────────────────

type SongResult = {
  title: string;
  film: string;
  singer: string;
  year: number;
  lang: string;
  composer: string;
  metro_trivia: string;
  bharat_context: string;
  imageBg: string;
  imageEmoji: string;
  matchPct: number;
};

const MOCK_RESULTS: SongResult[] = [
  {
    title: "Tum Hi Ho",
    film: "Aashiqui 2",
    singer: "Arijit Singh",
    year: 2013,
    lang: "Hindi",
    composer: "Mithoon",
    metro_trivia:
      "Mithoon composes exclusively in D minor for heartbreak songs. 'It's the only key that sounds like crying,' he once said. Tum Hi Ho, Hasi, Woh Lamhe — all D minor.",
    bharat_context:
      "Aashiqui 2 — a fading rock star discovers a girl with a voice that can fill stadiums. He destroys himself trying to lift her up. One of the biggest love stories of the 2010s.",
    imageBg: "bg-[#312e81]",
    imageEmoji: "💙",
    matchPct: 96,
  },
  {
    title: "Rowdy Baby",
    film: "Maari 2",
    singer: "Dhanush, Dhee",
    year: 2018,
    lang: "Tamil",
    composer: "Yuvan Shankar Raja",
    metro_trivia:
      "Yuvan Shankar Raja is the son of Ilaiyaraaja — the man who composed over 1,000 film songs. Yuvan crossed 500 in 2023. Tamil cinema's most musical dynasty.",
    bharat_context:
      "Maari 2 is a loveable rowdy-hero comedy from Tamil cinema. Rowdy Baby became the most-watched Tamil music video of all time on YouTube — 1.7 billion views.",
    imageBg: "bg-[#7c2d12]",
    imageEmoji: "🔥",
    matchPct: 94,
  },
  {
    title: "Chaiyya Chaiyya",
    film: "Dil Se",
    singer: "Sukhwinder Singh, Sapna Awasthi",
    year: 1998,
    lang: "Hindi",
    composer: "A.R. Rahman",
    metro_trivia:
      "Rahman composed this in 48 hours for Mani Ratnam. The sequence was filmed on the Nilgiri Mountain Railway — 200 dancers, a moving train, zero CGI. Gulzar's lyrics draw from Sufi poet Bulleh Shah.",
    bharat_context:
      "Dil Se — a journalist falls for a mysterious woman with a dark secret. Shah Rukh Khan's most intense performance. Bombed at the box office in 1998 and became a cult classic.",
    imageBg: "bg-[#14532d]",
    imageEmoji: "🌿",
    matchPct: 98,
  },
  {
    title: "Kesariya",
    film: "Brahmastra",
    singer: "Arijit Singh",
    year: 2022,
    lang: "Hindi",
    composer: "Pritam",
    metro_trivia:
      "Pritam recorded a 72-piece orchestra in Prague for this one track. Arijit's opening hum was a warmup take — Pritam heard the playback and said 'that stays in.'",
    bharat_context:
      "Brahmastra is Ayan Mukerji's 9-year passion project — a fantasy film about a boy who discovers he can control fire. The love story and this song became bigger than the movie itself.",
    imageBg: "bg-[#78350f]",
    imageEmoji: "🌸",
    matchPct: 97,
  },
  {
    title: "Vaathi Coming",
    film: "Master",
    singer: "Anirudh Ravichander",
    year: 2021,
    lang: "Tamil",
    composer: "Anirudh Ravichander",
    metro_trivia:
      "Anirudh composed, arranged, and sang this himself. He wrote it in 2 hours during a lockdown session. The bass drop at 0:42 took 4 separate mix sessions to get right.",
    bharat_context:
      "Master is a Vijay action film about a professor who goes undercover in a juvenile prison. Vaathi Coming became the anthem for every celebration in Tamil Nadu through 2021.",
    imageBg: "bg-[#1e3a5f]",
    imageEmoji: "🎧",
    matchPct: 93,
  },
];

const RECENT = [
  { title: "Enna Sona", film: "Ok Jaanu", singer: "Arijit Singh", lang: "Hindi" },
  { title: "Vaathi Coming", film: "Master", singer: "Anirudh Ravichander", lang: "Tamil" },
];

// ── Sub-components ────────────────────────────────────────────────────────────

type ListenMode = "hum" | "ambient";

function ListeningView({ mode }: { mode: ListenMode }) {
  const barHeights = [4, 9, 15, 22, 30, 22, 15, 9, 4, 9, 18, 27, 33, 27, 18, 9, 4];
  return (
    <div className="flex flex-col items-center gap-6 rounded-2xl bg-white px-4 py-12">
      {/* Pulsing rings + core */}
      <div className="relative flex size-32 items-center justify-center">
        <div
          className="absolute size-32 rounded-full bg-[#7c3aed]/10"
          style={{ animation: "listen-ping 1.5s ease-out infinite" }}
        />
        <div
          className="absolute size-24 rounded-full bg-[#7c3aed]/15"
          style={{ animation: "listen-ping 1.5s ease-out 0.4s infinite" }}
        />
        <div className="relative flex size-20 items-center justify-center rounded-full bg-[#7c3aed] shadow-lg">
          <span className="text-3xl">{mode === "hum" ? "🎤" : "📱"}</span>
        </div>
      </div>

      {/* Waveform bars */}
      <div className="flex items-center gap-1" style={{ height: "36px" }}>
        {barHeights.map((h, i) => (
          <div
            key={i}
            className="rounded-full bg-[#7c3aed]"
            style={{
              width: "5px",
              height: `${h}px`,
              animation: `listen-bar 0.8s ease-in-out ${i * 80}ms infinite alternate`,
            }}
          />
        ))}
      </div>

      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-[16px] font-black text-[#0c0d10]">
          {mode === "hum" ? "Hum the tune…" : "Listening to room…"}
        </p>
        <p className="text-[12px] font-medium text-black/40">
          {mode === "hum"
            ? "Hum any part you remember — even off-key is fine"
            : "Point your phone towards the music source"}
        </p>
      </div>

      <style>{`
        @keyframes listen-ping { 0% { transform: scale(0.9); opacity: 0.6; } 100% { transform: scale(1.4); opacity: 0; } }
        @keyframes listen-bar  { from { transform: scaleY(0.25); } to { transform: scaleY(1); } }
      `}</style>
    </div>
  );
}

const IDENTIFY_STEPS = [
  "Analysing melody",
  "Matching signature",
  "Confirming language",
  "Found it",
];

function IdentifyingView({ step }: { step: number }) {
  const arc = 2 * Math.PI * 26;
  return (
    <div className="flex flex-col items-center gap-5 rounded-2xl bg-white px-4 py-10">
      <div className="relative flex size-16 items-center justify-center">
        <svg
          className="absolute size-16"
          viewBox="0 0 64 64"
          style={{ animation: "spin 2s linear infinite", transformOrigin: "center" }}
        >
          <circle cx="32" cy="32" r="26" fill="none" stroke="#ede9fe" strokeWidth="4" />
          <circle
            cx="32"
            cy="32"
            r="26"
            fill="none"
            stroke="#7c3aed"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${arc * 0.3} ${arc * 0.7}`}
            transform="rotate(-90 32 32)"
          />
        </svg>
        <span className="relative text-xl">🎵</span>
      </div>

      <div className="flex flex-col items-center gap-1">
        <p className="text-[15px] font-black text-[#0c0d10]">Matching across 50M+ songs…</p>
        <p className="text-[12px] font-medium text-black/40">Hindi · Tamil · Telugu · Regional</p>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {IDENTIFY_STEPS.map((s, i) => (
          <span
            key={s}
            className={`rounded-full px-3 py-1 text-[10px] font-bold ${
              step > i ? "bg-[#7c3aed] text-white" : "bg-surface-ghost text-black/35"
            }`}
          >
            {s}
          </span>
        ))}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

type GenState = "idle" | "listening" | "identifying" | "result";
type UserType = "metro" | "bharat";

export default function SongLookupPage() {
  const [genState, setGenState] = useState<GenState>("idle");
  const [listenMode, setListenMode] = useState<ListenMode>("hum");
  const [identifyStep, setIdentifyStep] = useState(0);
  const [resultIdx, setResultIdx] = useState(0);
  const [userType, setUserType] = useState<UserType>("metro");
  const [scrolled, setScrolled] = useState(false);
  const scrollRef = useRef(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const result = MOCK_RESULTS[resultIdx % MOCK_RESULTS.length];

  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    const past = e.currentTarget.scrollTop > 8;
    if (past !== scrollRef.current) {
      scrollRef.current = past;
      setScrolled(past);
    }
  }, []);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  useEffect(() => () => clearTimers(), []);

  const startListening = useCallback((mode: ListenMode) => {
    setListenMode(mode);
    setGenState("listening");
    const t = setTimeout(() => {
      setGenState("identifying");
      setIdentifyStep(0);
      [700, 1400, 2100, 2700].forEach((delay, i) => {
        const t2 = setTimeout(() => setIdentifyStep(i + 1), delay);
        timersRef.current.push(t2);
      });
      const t3 = setTimeout(() => setGenState("result"), 3200);
      timersRef.current.push(t3);
    }, 2000);
    timersRef.current.push(t);
  }, []);

  const reset = useCallback(() => {
    clearTimers();
    setGenState("idle");
    setIdentifyStep(0);
  }, []);

  const tryAnother = useCallback(() => {
    clearTimers();
    setResultIdx((i) => i + 1);
    setGenState("idle");
  }, []);

  return (
    <div className="bg-canvas-grey text-fg relative flex h-full flex-col">
      <main
        className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 68px)" }}
        onScroll={handleScroll}
      >
        <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4">
          {/* ── Idle ── */}
          {genState === "idle" && (
            <>
              {/* Header text */}
              <div className="flex flex-col gap-1 pt-1">
                <h2 className="text-[20px] font-black text-[#0c0d10]">Yeh Kaun Sa Gaana Hai?</h2>
                <p className="text-[13px] font-medium text-black/45">
                  Hum a line or hold your phone near the music
                </p>
              </div>

              {/* Two input modes */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => startListening("hum")}
                  className="flex flex-col items-center gap-3 rounded-2xl bg-white px-4 py-6 transition-all active:scale-[0.97] active:opacity-80"
                >
                  <div className="flex size-14 items-center justify-center rounded-full bg-[#ede9fe] text-3xl">
                    🎤
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <p className="text-[14px] font-black text-[#0c0d10]">Hum a line</p>
                    <p className="text-center text-[11px] leading-snug font-medium text-black/40">
                      Hum the melody you remember
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => startListening("ambient")}
                  className="flex flex-col items-center gap-3 rounded-2xl bg-white px-4 py-6 transition-all active:scale-[0.97] active:opacity-80"
                >
                  <div className="flex size-14 items-center justify-center rounded-full bg-[#fdf4ff] text-3xl">
                    📱
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <p className="text-[14px] font-black text-[#0c0d10]">Hold up phone</p>
                    <p className="text-center text-[11px] leading-snug font-medium text-black/40">
                      Point it at the speaker
                    </p>
                  </div>
                </button>
              </div>

              {/* Languages supported */}
              <div className="flex items-center gap-2 rounded-xl bg-[#f5f3ff] px-4 py-2.5">
                <span className="text-base">🌐</span>
                <p className="text-[11px] font-medium text-[#5b21b6]">
                  Works for Hindi · Tamil · Telugu · Punjabi · Bengali · and more
                </p>
              </div>

              {/* Recently identified */}
              {RECENT.length > 0 && (
                <section className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold tracking-widest text-black/40 uppercase">
                    Recently identified
                  </span>
                  {RECENT.map((r) => (
                    <div
                      key={r.title}
                      className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3"
                    >
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#ede9fe] text-base">
                        🎵
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <p className="truncate text-[13px] font-bold text-[#0c0d10]">{r.title}</p>
                        <p className="truncate text-[10px] font-medium text-black/40">
                          {r.singer} · {r.film}
                        </p>
                      </div>
                      <span className="bg-surface-ghost rounded-full px-2 py-0.5 text-[10px] font-bold text-black/40">
                        {r.lang}
                      </span>
                    </div>
                  ))}
                </section>
              )}
            </>
          )}

          {/* ── Listening ── */}
          {genState === "listening" && (
            <>
              <ListeningView mode={listenMode} />
              <button
                onClick={reset}
                className="w-full rounded-full bg-white py-3.5 text-[14px] font-bold text-black/60 active:opacity-70"
              >
                Cancel
              </button>
            </>
          )}

          {/* ── Identifying ── */}
          {genState === "identifying" && <IdentifyingView step={identifyStep} />}

          {/* ── Result ── */}
          {genState === "result" && result && (
            <>
              {/* Match confidence */}
              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/10">
                  <div
                    className="h-full rounded-full bg-[#25ab21]"
                    style={{ width: `${result.matchPct}%` }}
                  />
                </div>
                <span className="text-[11px] font-bold text-[#25ab21]">
                  {result.matchPct}% match
                </span>
              </div>

              {/* Song card */}
              <div className={`flex flex-col gap-4 rounded-2xl ${result.imageBg} px-4 py-5`}>
                <div className="flex items-center gap-3">
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-white/20 text-3xl">
                    {result.imageEmoji}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[20px] leading-tight font-black text-white">
                      {result.title}
                    </p>
                    <p className="text-[14px] font-bold text-white/80">{result.film}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold text-white">
                    🎤 {result.singer}
                  </span>
                  <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold text-white">
                    📅 {result.year}
                  </span>
                  <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold text-white">
                    {result.lang}
                  </span>
                </div>
              </div>

              {/* Metro / Bharat toggle */}
              <div className="flex overflow-hidden rounded-2xl bg-white p-1">
                <button
                  onClick={() => setUserType("metro")}
                  className={`flex-1 rounded-xl py-2.5 text-[12px] font-bold transition-all ${
                    userType === "metro" ? "bg-[#7c3aed] text-white" : "text-black/40"
                  }`}
                >
                  Metro 🏙️
                </button>
                <button
                  onClick={() => setUserType("bharat")}
                  className={`flex-1 rounded-xl py-2.5 text-[12px] font-bold transition-all ${
                    userType === "bharat" ? "bg-[#7c3aed] text-white" : "text-black/40"
                  }`}
                >
                  Bharat 🌾
                </button>
              </div>

              {/* Conditional content */}
              {userType === "metro" && (
                <div className="flex flex-col gap-2 rounded-2xl bg-white px-4 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold tracking-widest text-black/40 uppercase">
                      Composer
                    </span>
                    <span className="rounded-full bg-[#ede9fe] px-2 py-0.5 text-[10px] font-bold text-[#7c3aed]">
                      {result.composer}
                    </span>
                  </div>
                  <p className="text-[13px] leading-relaxed font-medium text-[#0c0d10]">
                    {result.metro_trivia}
                  </p>
                </div>
              )}
              {userType === "bharat" && (
                <div className="flex flex-col gap-2 rounded-2xl bg-white px-4 py-4">
                  <span className="text-[10px] font-bold tracking-widest text-black/40 uppercase">
                    Film context
                  </span>
                  <p className="text-[13px] leading-relaxed font-medium text-[#0c0d10]">
                    {result.bharat_context}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button className="flex-1 rounded-full bg-[#7c3aed] py-3.5 text-[14px] font-bold text-white active:opacity-80">
                  Play on Saavn 🎵
                </button>
                <button
                  onClick={tryAnother}
                  className="bg-surface-ghost rounded-full px-4 py-3.5 text-[13px] font-bold text-black/60 active:opacity-70"
                >
                  Try another
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      <HubHeader title="Yeh Kaun Sa Gaana Hai?" backHref="/music" scrolled={scrolled} />
    </div>
  );
}
