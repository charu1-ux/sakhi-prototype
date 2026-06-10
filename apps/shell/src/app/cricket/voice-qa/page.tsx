"use client";

import { useCallback, useRef, useState } from "react";

import { HubHeader } from "@/app/jobs/design-prototype/HubHeader";

// ── Types ─────────────────────────────────────────────────────────────────────

type OrbState = "idle" | "listening" | "thinking" | "answered";
type Language = "English" | "Hindi" | "Hinglish" | "Marathi" | "Gujarati";

type QAEntry = {
  id: string;
  question: string;
  answer: string;
  time: string;
  lang: Language;
};

// ── Mock Q&A pairs ────────────────────────────────────────────────────────────

const QA_PAIRS: Array<{ question: string; answer: string }> = [
  {
    question: "What's the score right now?",
    answer:
      "India 156 for 4 after 17.3 overs. They need 22 more runs off 15 balls. Hardik and Jadeja are at the crease.",
  },
  {
    question: "Who's bowling this over?",
    answer:
      "Pat Cummins is bowling. He's got 3 overs done so far — 24 runs, 1 wicket. Tight last 2 balls: both dot balls.",
  },
  {
    question: "What happened on that DRS?",
    answer:
      "India reviewed a caught-behind decision on Hardik. Ball-tracking showed it clipped the outside edge — on-field out stands. India lose their second review.",
  },
  {
    question: "When was the catch dropped?",
    answer:
      "Over 14, ball 3. Maxwell shelled a sharp chance at mid-on off Kohli — estimated 68 runs Kohli would have cost Australia if he'd stayed. Kohli went for 44 two overs later anyway.",
  },
  {
    question: "Bumrah ka over kab hai?",
    answer:
      "Bumrah ke paas 1 over bacha hai — last over me bowl karega. Uska death-over economy 6.1 hai is tour mein. Pak ka bheja kharaab ho sakta hai.",
  },
];

// Suggested questions that show in idle state
const SUGGESTIONS = [
  "What's the current run rate?",
  "Who took the last wicket?",
  "What's the target?",
  "How many overs left?",
  "Best bowler today?",
  "Kohli ka score?",
];

const LANGUAGES: Language[] = ["English", "Hindi", "Hinglish", "Marathi", "Gujarati"];

// ── Mini score bar ────────────────────────────────────────────────────────────

function MiniScoreBar() {
  return (
    <div className="rounded-2xl bg-white px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-base leading-none">🇮🇳</span>
            <span className="text-[15px] font-bold text-[#0c0d10]">IND</span>
            <span className="text-[15px] font-bold text-[#0c0d10]">156/4*</span>
            <span className="text-[11px] font-medium text-black/40">(17.3)</span>
          </div>
          <span className="text-[11px] font-medium text-black/30">vs</span>
          <div className="flex items-center gap-1.5">
            <span className="text-base leading-none">🇦🇺</span>
            <span className="text-[15px] font-bold text-[#0c0d10]">AUS</span>
            <span className="text-[15px] font-bold text-[#0c0d10]">177/6</span>
            <span className="text-[11px] font-medium text-black/40">(20.0)</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#fa2f40] opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-[#fa2f40]" />
          </span>
          <span className="text-[10px] font-bold tracking-wide text-[#fa2f40] uppercase">Live</span>
        </div>
      </div>
      <p className="mt-1.5 text-[11px] font-bold text-[#0c0d10]">
        IND need 22 off 15 balls · 3rd T20I
      </p>
    </div>
  );
}

// ── Voice orb ────────────────────────────────────────────────────────────────

function VoiceOrb({ state, onTap }: { state: OrbState; onTap: () => void }) {
  const isActive = state === "listening" || state === "thinking";

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Orb */}
      <button
        onClick={onTap}
        className="relative flex size-28 items-center justify-center rounded-full transition-transform focus:outline-none active:scale-95"
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        {/* Pulse rings — only when active */}
        {isActive && (
          <>
            <span className="absolute size-28 animate-ping rounded-full bg-[#6d17ce] opacity-20" />
            <span
              className="absolute size-36 animate-ping rounded-full bg-[#6d17ce] opacity-10"
              style={{ animationDelay: "0.15s" }}
            />
          </>
        )}

        {/* Core */}
        <div
          className={`relative flex size-24 items-center justify-center rounded-full transition-all duration-300 ${
            state === "idle"
              ? "bg-surface-ghost"
              : state === "listening"
                ? "bg-[#6d17ce]"
                : state === "thinking"
                  ? "bg-[#310064]"
                  : "bg-[#6d17ce]"
          }`}
        >
          {state === "idle" && (
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className="text-[#6d17ce]">
              <rect x="9" y="2" width="6" height="12" rx="3" fill="currentColor" />
              <path
                d="M5 11a7 7 0 0 0 14 0"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                x1="12"
                y1="18"
                x2="12"
                y2="22"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                x1="9"
                y1="22"
                x2="15"
                y2="22"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
          {state === "listening" && (
            /* Waveform bars */
            <div className="flex items-end gap-1">
              {[0.4, 0.7, 1, 0.8, 0.5, 0.9, 0.6].map((h, i) => (
                <div
                  key={i}
                  className="w-1 rounded-full bg-white"
                  style={{
                    height: `${h * 28}px`,
                    animation: `wave-bar 0.6s ease-in-out ${i * 80}ms infinite alternate`,
                  }}
                />
              ))}
            </div>
          )}
          {state === "thinking" && (
            /* Three dots */
            <div className="flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="size-2 rounded-full bg-white"
                  style={{
                    animation: `dot-bounce 0.8s ease-in-out ${i * 160}ms infinite`,
                  }}
                />
              ))}
            </div>
          )}
          {state === "answered" && (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-white">
              <rect x="9" y="2" width="6" height="12" rx="3" fill="currentColor" />
              <path
                d="M5 11a7 7 0 0 0 14 0"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                x1="12"
                y1="18"
                x2="12"
                y2="22"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                x1="9"
                y1="22"
                x2="15"
                y2="22"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
        </div>
      </button>

      {/* Label */}
      <p
        className={`text-[13px] font-semibold transition-colors ${
          state === "idle"
            ? "text-black/40"
            : state === "listening"
              ? "text-[#6d17ce]"
              : state === "thinking"
                ? "text-black/40"
                : "text-[#6d17ce]"
        }`}
      >
        {state === "idle" && "Tap to ask"}
        {state === "listening" && "Listening…"}
        {state === "thinking" && "JBIQ is thinking…"}
        {state === "answered" && "Tap to ask again"}
      </p>
    </div>
  );
}

// ── Q&A card ─────────────────────────────────────────────────────────────────

function QACard({ entry }: { entry: QAEntry }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white p-4">
      {/* Question */}
      <div className="flex items-start gap-2">
        <div className="bg-surface-ghost mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
            <rect x="9" y="2" width="6" height="12" rx="3" fill="#6d17ce" />
            <path
              d="M5 11a7 7 0 0 0 14 0"
              stroke="#6d17ce"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <p className="text-[13px] font-semibold text-[#0c0d10]">{entry.question}</p>
      </div>

      {/* Divider */}
      <div className="h-px bg-black/[0.06]" />

      {/* Answer */}
      <div className="flex items-start gap-2">
        <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#f6f3ff]">
          <span className="text-[9px] font-bold text-[#6d17ce]">J</span>
        </div>
        <p className="text-[13px] leading-relaxed font-medium text-[#0c0d10]">{entry.answer}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-[#f6f3ff] px-2 py-0.5 text-[10px] font-bold text-[#6d17ce]">
          {entry.lang}
        </span>
        <span className="text-[11px] font-medium text-black/30">{entry.time}</span>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function VoiceQAPage() {
  const [orbState, setOrbState] = useState<OrbState>("idle");
  const [language, setLanguage] = useState<Language>("English");
  const [langOpen, setLangOpen] = useState(false);
  const [history, setHistory] = useState<QAEntry[]>([]);
  const pairIndexRef = useRef(0);
  const [scrolled, setScrolled] = useState(false);
  const scrollRef = useRef(false);

  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    const past = e.currentTarget.scrollTop > 8;
    if (past !== scrollRef.current) {
      scrollRef.current = past;
      setScrolled(past);
    }
  }, []);

  const handleOrbTap = useCallback(() => {
    if (orbState === "listening" || orbState === "thinking") return;

    // Start listening
    setOrbState("listening");

    // After 1.8s simulate question heard → thinking
    setTimeout(() => {
      setOrbState("thinking");
    }, 1800);

    // After 3.2s show answer
    setTimeout(() => {
      const pair = QA_PAIRS[pairIndexRef.current % QA_PAIRS.length];
      pairIndexRef.current += 1;

      const now = new Date();
      const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;

      setHistory((prev) => [
        { id: String(Date.now()), ...pair, time: timeStr, lang: language },
        ...prev,
      ]);
      setOrbState("answered");
    }, 3200);
  }, [orbState, language]);

  const handleSuggestion = useCallback(
    (q: string) => {
      if (orbState === "listening" || orbState === "thinking") return;
      setOrbState("thinking");

      setTimeout(() => {
        const pair = QA_PAIRS[pairIndexRef.current % QA_PAIRS.length];
        pairIndexRef.current += 1;
        const now = new Date();
        const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
        setHistory((prev) => [
          {
            id: String(Date.now()),
            question: q,
            answer: pair.answer,
            time: timeStr,
            lang: language,
          },
          ...prev,
        ]);
        setOrbState("answered");
      }, 1400);
    },
    [orbState, language],
  );

  return (
    <div className="bg-canvas-grey text-fg relative flex h-full flex-col">
      <style>{`
        @keyframes wave-bar {
          from { transform: scaleY(0.4); }
          to   { transform: scaleY(1); }
        }
        @keyframes dot-bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40%            { transform: translateY(-6px); }
        }
      `}</style>

      <main
        className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 68px)" }}
        onScroll={handleScroll}
      >
        <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4">
          {/* Live score context */}
          <MiniScoreBar />

          {/* Language selector */}
          <div className="relative">
            <button
              onClick={() => setLangOpen((o) => !o)}
              className="flex w-full items-center justify-between rounded-2xl bg-white px-4 py-3 active:opacity-70"
            >
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-medium text-black/40">Reply language</span>
                <span className="rounded-full bg-[#f6f3ff] px-2.5 py-0.5 text-[12px] font-bold text-[#6d17ce]">
                  {language}
                </span>
              </div>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                className={`text-black/30 transition-transform ${langOpen ? "rotate-180" : ""}`}
              >
                <path
                  d="M6 9l6 6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {langOpen && (
              <div className="absolute top-full right-0 left-0 z-10 mt-1 flex flex-col overflow-hidden rounded-2xl bg-white shadow-md">
                {LANGUAGES.map((l) => (
                  <button
                    key={l}
                    onClick={() => {
                      setLanguage(l);
                      setLangOpen(false);
                    }}
                    className={`flex items-center justify-between px-4 py-3 text-[14px] font-medium transition-colors active:bg-[#f6f3ff] ${
                      l === language ? "font-bold text-[#6d17ce]" : "text-[#0c0d10]"
                    }`}
                  >
                    {l}
                    {l === language && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M5 12l5 5L19 7"
                          stroke="#6d17ce"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Orb section */}
          <div className="flex flex-col items-center gap-5 rounded-2xl bg-white px-4 py-8">
            <VoiceOrb state={orbState} onTap={handleOrbTap} />

            {/* Helper text */}
            <p className="max-w-[240px] text-center text-[12px] leading-relaxed font-medium text-black/35">
              Ask anything about the match — no need to look away from the TV
            </p>

            {/* Suggestion chips */}
            {orbState === "idle" || orbState === "answered" ? (
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSuggestion(s)}
                    className="bg-surface-ghost rounded-full px-3 py-1.5 text-[12px] font-medium text-[#0c0d10] transition-colors active:bg-[#f6f3ff] active:text-[#6d17ce]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {/* Q&A history */}
          {history.length > 0 && (
            <section className="flex flex-col gap-3">
              <span className="text-[10px] font-bold tracking-widest text-black/40 uppercase">
                Asked this session
              </span>
              <div className="flex flex-col gap-3">
                {history.map((e) => (
                  <QACard key={e.id} entry={e} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <HubHeader title="Voice Q&A" backHref="/cricket" scrolled={scrolled} />
    </div>
  );
}
