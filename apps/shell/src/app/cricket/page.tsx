"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";

import { HubChatInput } from "@/app/jobs/design-prototype/HubChatInput";
import { HubHeader } from "@/app/jobs/design-prototype/HubHeader";

// ── Types ─────────────────────────────────────────────────────────────────────

type MatchStatus = "live" | "upcoming" | "completed";
type Format = "T20" | "ODI" | "Test";

type Match = {
  id: string;
  status: MatchStatus;
  format: Format;
  series: string;
  team1: string;
  team1Flag: string;
  team1Score?: string;
  team1Overs?: string;
  team2: string;
  team2Flag: string;
  team2Score?: string;
  team2Overs?: string;
  statusText: string;
  venue: string;
  href?: string;
};

// ── Match data ────────────────────────────────────────────────────────────────

const MATCHES: Match[] = [
  {
    id: "1",
    status: "live",
    format: "T20",
    series: "3rd T20I · India tour of Australia",
    team1: "IND",
    team1Flag: "🇮🇳",
    team1Score: "156/4",
    team1Overs: "17.3",
    team2: "AUS",
    team2Flag: "🇦🇺",
    team2Score: "177/6",
    team2Overs: "20.0",
    statusText: "IND need 22 off 15 balls",
    venue: "Rajiv Gandhi Int'l Stadium, Hyderabad",
    href: "/cricket/scorecard",
  },
  {
    id: "2",
    status: "live",
    format: "Test",
    series: "2nd Test · India vs England",
    team1: "IND",
    team1Flag: "🇮🇳",
    team1Score: "342/7",
    team1Overs: "Day 2",
    team2: "ENG",
    team2Flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    team2Score: "289",
    team2Overs: "Innings 1",
    statusText: "IND lead by 53 runs · Day 2, Session 2",
    venue: "Edgbaston, Birmingham",
    href: "/cricket/scorecard",
  },
  {
    id: "3",
    status: "upcoming",
    format: "ODI",
    series: "1st ODI · India tour of South Africa",
    team1: "IND",
    team1Flag: "🇮🇳",
    team2: "SA",
    team2Flag: "🇿🇦",
    statusText: "Tomorrow, 1:30 PM IST",
    venue: "Newlands, Cape Town",
  },
  {
    id: "4",
    status: "upcoming",
    format: "T20",
    series: "ICC T20 World Cup · Super 8",
    team1: "PAK",
    team1Flag: "🇵🇰",
    team2: "NZ",
    team2Flag: "🇳🇿",
    statusText: "Jun 15 · 8:00 PM IST",
    venue: "Nassau County International Cricket Stadium",
  },
  {
    id: "5",
    status: "completed",
    format: "T20",
    series: "2nd T20I · India tour of Australia",
    team1: "IND",
    team1Flag: "🇮🇳",
    team1Score: "189/4",
    team1Overs: "20.0",
    team2: "AUS",
    team2Flag: "🇦🇺",
    team2Score: "183/7",
    team2Overs: "20.0",
    statusText: "India won by 6 runs",
    venue: "SCG, Sydney",
    href: "/cricket/scorecard",
  },
  {
    id: "6",
    status: "completed",
    format: "ODI",
    series: "3rd ODI · Sri Lanka tour of India",
    team1: "SL",
    team1Flag: "🇱🇰",
    team1Score: "231/8",
    team1Overs: "50.0",
    team2: "IND",
    team2Flag: "🇮🇳",
    team2Score: "232/3",
    team2Overs: "44.2",
    statusText: "India won by 7 wickets",
    venue: "Wankhede Stadium, Mumbai",
    href: "/cricket/scorecard",
  },
];

// ── Format badge ──────────────────────────────────────────────────────────────

const FORMAT_COLORS: Record<Format, string> = {
  T20: "bg-[#ecf7ff] text-[#0078ad]",
  ODI: "bg-[#ddfef2] text-[#00ad8b]",
  Test: "bg-[#f6f3ff] text-[#6d17ce]",
};

// ── Match card ────────────────────────────────────────────────────────────────

function MatchCard({ match }: { match: Match }) {
  const inner = (
    <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 transition-opacity select-none active:opacity-70">
      {/* Top row: series + format badge */}
      <div className="flex items-center gap-2">
        <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-black/40">
          {match.series}
        </span>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${FORMAT_COLORS[match.format]}`}
        >
          {match.format}
        </span>
        {match.status === "live" && (
          <div className="flex shrink-0 items-center gap-1">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#fa2f40] opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-[#fa2f40]" />
            </span>
            <span className="text-[10px] font-bold tracking-wide text-[#fa2f40] uppercase">
              Live
            </span>
          </div>
        )}
      </div>

      {/* Teams + scores */}
      <div className="flex flex-col gap-2">
        {/* Team 1 */}
        <div className="flex items-center gap-2">
          <span className="text-lg leading-none">{match.team1Flag}</span>
          <span className="text-[15px] font-bold text-[#0c0d10]">{match.team1}</span>
          {match.team1Score && (
            <>
              <span className="ml-auto text-[15px] font-bold text-[#0c0d10]">
                {match.team1Score}
              </span>
              <span className="text-[12px] font-medium text-black/40">({match.team1Overs})</span>
            </>
          )}
        </div>
        {/* Team 2 */}
        <div className="flex items-center gap-2">
          <span className="text-lg leading-none">{match.team2Flag}</span>
          <span className="text-[15px] font-bold text-[#0c0d10]">{match.team2}</span>
          {match.team2Score && (
            <>
              <span className="ml-auto text-[15px] font-bold text-[#0c0d10]">
                {match.team2Score}
              </span>
              <span className="text-[12px] font-medium text-black/40">({match.team2Overs})</span>
            </>
          )}
        </div>
      </div>

      {/* Status line + venue */}
      <div className="flex flex-col gap-0.5 border-t border-black/[0.06] pt-3">
        <span
          className={`text-[12px] font-bold ${
            match.status === "completed"
              ? match.statusText.toLowerCase().includes("won")
                ? "text-[#25ab21]"
                : "text-black/55"
              : match.status === "live"
                ? "text-[#0c0d10]"
                : "text-[#6d17ce]"
          }`}
        >
          {match.statusText}
        </span>
        <span className="text-[11px] font-medium text-black/35">{match.venue}</span>
      </div>
    </div>
  );

  return match.href ? (
    <Link href={match.href} className="block">
      {inner}
    </Link>
  ) : (
    inner
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CricketPage() {
  const [scrolled, setScrolled] = useState(false);
  const scrollRef = useRef(false);

  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    const past = e.currentTarget.scrollTop > 8;
    if (past !== scrollRef.current) {
      scrollRef.current = past;
      setScrolled(past);
    }
  }, []);

  const liveMatches = MATCHES.filter((m) => m.status === "live");
  const upcomingMatches = MATCHES.filter((m) => m.status === "upcoming");
  const completedMatches = MATCHES.filter((m) => m.status === "completed");

  return (
    <div className="bg-canvas-grey text-fg relative flex h-full flex-col">
      <main
        className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 68px)" }}
        onScroll={handleScroll}
      >
        <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4">
          {/* Live */}
          {liveMatches.length > 0 && (
            <section className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-widest text-black/40 uppercase">
                  Live now
                </span>
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#fa2f40] opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-[#fa2f40]" />
                </span>
              </div>
              <ul className="flex list-none flex-col gap-3 p-0">
                {liveMatches.map((m) => (
                  <li key={m.id}>
                    <MatchCard match={m} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Upcoming */}
          {upcomingMatches.length > 0 && (
            <section className="flex flex-col gap-3">
              <span className="text-[10px] font-bold tracking-widest text-black/40 uppercase">
                Upcoming
              </span>
              <ul className="flex list-none flex-col gap-3 p-0">
                {upcomingMatches.map((m) => (
                  <li key={m.id}>
                    <MatchCard match={m} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Recent results */}
          {completedMatches.length > 0 && (
            <section className="flex flex-col gap-3">
              <span className="text-[10px] font-bold tracking-widest text-black/40 uppercase">
                Recent results
              </span>
              <ul className="flex list-none flex-col gap-3 p-0">
                {completedMatches.map((m) => (
                  <li key={m.id}>
                    <MatchCard match={m} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* AI experiences */}
          <section className="flex flex-col gap-3">
            <span className="text-[10px] font-bold tracking-widest text-black/40 uppercase">
              AI experiences
            </span>
            <div className="flex flex-col gap-2.5">
              <Link href="/cricket/voice-qa" className="block">
                <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 transition-opacity active:opacity-70">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#f6f3ff]">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <rect x="9" y="2" width="6" height="12" rx="3" fill="#6d17ce" />
                      <path
                        d="M5 11a7 7 0 0 0 14 0"
                        stroke="#6d17ce"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <line
                        x1="12"
                        y1="18"
                        x2="12"
                        y2="22"
                        stroke="#6d17ce"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <p className="text-[14px] font-bold text-[#0c0d10]">Voice Q&amp;A</p>
                    <p className="text-[11px] font-medium text-black/40">
                      Ask anything mid-match. TV keeps playing.
                    </p>
                  </div>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="shrink-0 text-black/20"
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
              </Link>

              <Link href="/cricket/predict" className="block">
                <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 transition-opacity active:opacity-70">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#fff7ed]">
                    <span className="text-lg leading-none">🔮</span>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <p className="text-[14px] font-bold text-[#0c0d10]">Predict Anything</p>
                    <p className="text-[11px] font-medium text-black/40">
                      Lock in bold calls. Points inversely proportional to probability.
                    </p>
                  </div>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="shrink-0 text-black/20"
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
              </Link>

              <Link href="/cricket/reminders" className="block">
                <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 transition-opacity active:opacity-70">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#ddfef2]">
                    <span className="text-lg leading-none">🔔</span>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <p className="text-[14px] font-bold text-[#0c0d10]">Event Reminders</p>
                    <p className="text-[11px] font-medium text-black/40">
                      Alert when Kohli bats, powerplay ends, match resumes.
                    </p>
                  </div>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="shrink-0 text-black/20"
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
              </Link>

              <Link href="/jokes/cricket-banter" className="block">
                <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 transition-opacity active:opacity-70">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#fff7ed]">
                    <span className="text-lg leading-none">🎙️</span>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <p className="text-[14px] font-bold text-[#0c0d10]">Cricket Banter</p>
                    <p className="text-[11px] font-medium text-black/40">
                      Wicket falls → 20s → shareable audio banter clip.
                    </p>
                  </div>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="shrink-0 text-black/20"
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
              </Link>
            </div>
          </section>
        </div>
      </main>

      <HubHeader title="Cricket" backHref="/" scrolled={scrolled} />
      <HubChatInput placeholder="Ask about any match or player…" />
    </div>
  );
}
