"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { HubHeader } from "@/app/jobs/design-prototype/HubHeader";
import { ClipCard, type ClipData } from "../_components/ClipCard";

// ── Mock events ───────────────────────────────────────────────────────────────

type BallEvent = {
  over: string;
  ball: string;
  desc: string;
  isWicket: boolean;
  batter?: string;
  bowler?: string;
};

const BALL_FEED: BallEvent[] = [
  {
    over: "17.3",
    ball: "1",
    desc: "Hardik plays and misses — outside edge, safe",
    isWicket: false,
  },
  {
    over: "17.3",
    ball: "2",
    desc: "Four! Hardik whips Cummins through midwicket",
    isWicket: false,
  },
  { over: "17.3", ball: "3", desc: "Dot. Yorker nailed.", isWicket: false },
  {
    over: "17.3",
    ball: "4",
    desc: "WICKET! Jadeja caught at deep square leg off Hazlewood",
    isWicket: true,
    batter: "Jadeja",
    bowler: "Hazlewood",
  },
  { over: "17.3", ball: "5", desc: "Six! Hardik clears long-on effortlessly", isWicket: false },
  { over: "17.3", ball: "6", desc: "Wide. Full toss down leg.", isWicket: false },
];

const BANTER_CLIPS: Record<"ind_fan" | "aus_fan", ClipData[]> = {
  ind_fan: [
    {
      jokeText: "Jadeja out for 7? Bhai thoda aur ruk jaata, mera popcorn khatam nahi hua tha!",
      punchline: "Ab Hardik pe sab kuch — jai ho! 🙏",
      voiceTag: "Raju Sir voice",
      tone: "Roast",
      imageBg: "bg-[#ea580c]",
      imageEmoji: "😭",
      durationSec: 22,
      lang: "Hinglish",
      shareText: "Jadeja out for 7? Bhai thoda aur ruk jaata 😭 #INDvsAUS #Cricket",
    },
    {
      jokeText: "Jadeja dropped his bat before the catch. Physics 1, Jadeja 0.",
      punchline: "At least his fielding is still elite 😤",
      voiceTag: "Sports anchor voice",
      tone: "Dry",
      imageBg: "bg-[#1e40af]",
      imageEmoji: "🏏",
      durationSec: 18,
      lang: "English",
      shareText: "Physics 1, Jadeja 0 😅 #INDvsAUS",
    },
  ],
  aus_fan: [
    {
      jokeText:
        "Hazlewood just sent Jadeja on a one-way trip to the pavilion. Economy class. No refund.",
      punchline: "That's how it's done, mate! 🦘",
      voiceTag: "Aussie bloke voice",
      tone: "Victory",
      imageBg: "bg-[#166534]",
      imageEmoji: "🦘",
      durationSec: 24,
      lang: "English",
    },
  ],
};

// ── Countdown ring ────────────────────────────────────────────────────────────

function CountdownRing({ seconds, total }: { seconds: number; total: number }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const progress = (seconds / total) * circ;

  return (
    <div className="relative flex size-20 items-center justify-center">
      <svg width="80" height="80" viewBox="0 0 80 80" className="-rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" stroke="#f5f5f5" strokeWidth="5" />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke="#ea580c"
          strokeWidth="5"
          strokeDasharray={circ}
          strokeDashoffset={circ - progress}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s linear" }}
        />
      </svg>
      <span className="absolute text-[22px] font-black text-[#0c0d10]">{seconds}</span>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

type PageState = "watching" | "countdown" | "ready";
type Team = "ind_fan" | "aus_fan";

export default function CricketBanterPage() {
  const [pageState, setPageState] = useState<PageState>("watching");
  const [team, setTeam] = useState<Team>("ind_fan");
  const [countdown, setCountdown] = useState(20);
  const [clip, setClip] = useState<ClipData | null>(null);
  const [banterIdx, setBanterIdx] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const scrollRef = useRef(false);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    const past = e.currentTarget.scrollTop > 8;
    if (past !== scrollRef.current) {
      scrollRef.current = past;
      setScrolled(past);
    }
  }, []);

  const triggerWicket = useCallback(() => {
    setPageState("countdown");
    setCountdown(20);

    countdownRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(countdownRef.current!);
          const clips = BANTER_CLIPS[team];
          const c2 = clips[banterIdx % clips.length];
          setBanterIdx((i) => i + 1);
          setClip(c2);
          setPageState("ready");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }, [team, banterIdx]);

  useEffect(
    () => () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    },
    [],
  );

  const reset = useCallback(() => {
    setPageState("watching");
    setClip(null);
    setCountdown(20);
  }, []);

  return (
    <div className="bg-canvas-grey text-fg relative flex h-full flex-col">
      <main
        className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 68px)" }}
        onScroll={handleScroll}
      >
        <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4">
          {/* Live score strip */}
          <div className="rounded-2xl bg-white px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">🇮🇳</span>
                  <span className="text-[14px] font-bold text-[#0c0d10]">IND 156/5*</span>
                  <span className="text-[11px] text-black/40">(17.4)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">🇦🇺</span>
                  <span className="text-[14px] font-bold text-[#0c0d10]">AUS 177/6</span>
                  <span className="text-[11px] text-black/40">(20.0)</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#fa2f40] opacity-75" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-[#fa2f40]" />
                </span>
                <span className="text-[10px] font-bold tracking-wide text-[#fa2f40] uppercase">
                  Live
                </span>
              </div>
            </div>
            <p className="mt-1 text-[11px] font-bold text-[#0c0d10]">
              IND need 22 off 14 balls · Hardik 38* (24)
            </p>
          </div>

          {/* Your team — which side are you on */}
          {pageState === "watching" && (
            <div className="flex flex-col gap-2 rounded-2xl bg-white px-4 py-4">
              <p className="text-[12px] font-bold text-[#0c0d10]">Your side</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setTeam("ind_fan")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-[13px] font-bold transition-all ${
                    team === "ind_fan"
                      ? "bg-[#0078ad]/10 text-[#0078ad] ring-2 ring-[#0078ad]/30"
                      : "bg-surface-ghost text-black/50"
                  }`}
                >
                  🇮🇳 India
                </button>
                <button
                  onClick={() => setTeam("aus_fan")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-[13px] font-bold transition-all ${
                    team === "aus_fan"
                      ? "bg-[#166534]/10 text-[#166534] ring-2 ring-[#166534]/30"
                      : "bg-surface-ghost text-black/50"
                  }`}
                >
                  🇦🇺 Australia
                </button>
              </div>
              <p className="text-[11px] font-medium text-black/40">
                Your banter clips will roast the other team — or laugh at yours with love 😂
              </p>
            </div>
          )}

          {/* Recent ball feed */}
          {pageState === "watching" && (
            <section className="flex flex-col gap-3">
              <span className="text-[10px] font-bold tracking-widest text-black/40 uppercase">
                Ball feed
              </span>
              <div className="flex flex-col gap-1.5">
                {BALL_FEED.map((ev, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${
                      ev.isWicket ? "bg-[#fde8ea]" : "bg-white"
                    }`}
                  >
                    <span className="shrink-0 text-[10px] font-bold text-black/35">{ev.over}</span>
                    <p
                      className={`flex-1 text-[12px] font-medium ${ev.isWicket ? "font-bold text-[#fa2f40]" : "text-[#0c0d10]"}`}
                    >
                      {ev.desc}
                    </p>
                    {ev.isWicket && (
                      <span className="shrink-0 text-[11px] font-black text-[#fa2f40]">W</span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Simulate wicket button */}
          {pageState === "watching" && (
            <div className="flex flex-col gap-2">
              <button
                onClick={triggerWicket}
                className="w-full rounded-full bg-[#fa2f40] py-4 text-[15px] font-bold text-white transition-opacity active:opacity-80"
              >
                🏏 Wicket falls! Generate banter →
              </button>
              <p className="text-center text-[11px] font-medium text-black/35">
                In the live app, this triggers automatically within 5s of the event
              </p>
            </div>
          )}

          {/* Countdown */}
          {pageState === "countdown" && (
            <div className="flex flex-col items-center gap-6 rounded-2xl bg-white px-4 py-10">
              <CountdownRing seconds={countdown} total={20} />
              <div className="flex flex-col items-center gap-1">
                <p className="text-[16px] font-black text-[#0c0d10]">Crafting your banter clip…</p>
                <p className="max-w-[240px] text-center text-[12px] font-medium text-black/45">
                  Reading the moment, picking the perfect tone, generating your{" "}
                  {team === "ind_fan" ? "India" : "Australia"} fan clip
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  "Reading wicket context",
                  "Matching tone",
                  "Writing line",
                  "Generating voice",
                ].map((s, i) => (
                  <span
                    key={s}
                    className={`rounded-full px-3 py-1 text-[10px] font-bold ${
                      countdown < 20 - i * 4
                        ? "bg-[#ea580c] text-white"
                        : "bg-surface-ghost text-black/35"
                    }`}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Ready — clip */}
          {pageState === "ready" && clip && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold tracking-widest text-black/40 uppercase">
                    Banter clip ready
                  </span>
                  <p className="text-[13px] font-medium text-black/55">
                    Generated in 18s · Jadeja wicket · Over 17.4
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

      <HubHeader title="Cricket Banter" backHref="/jokes" scrolled={scrolled} />
    </div>
  );
}
