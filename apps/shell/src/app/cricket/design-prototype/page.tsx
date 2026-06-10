"use client";

import { useCallback, useRef, useState } from "react";

import { HubChatInput } from "@/app/jobs/design-prototype/HubChatInput";
import { HubHeader } from "@/app/jobs/design-prototype/HubHeader";

// ── Types ─────────────────────────────────────────────────────────────────────

type Format = "T20" | "ODI" | "Test";
type MatchState = "live" | "completed";
type Tab = "live" | "scorecard";
type Innings = 1 | 2;

// ── Live match mock data ───────────────────────────────────────────────────────

const BATTER_ROWS = {
  live: [
    { name: "V Kohli", status: "batting", r: 67, b: 43, fours: 8, sixes: 2, sr: 155.8 },
    { name: "H Pandya", status: "batting", r: 23, b: 15, fours: 2, sixes: 1, sr: 153.3 },
  ],
  full: [
    {
      name: "R Sharma",
      status: "c Maxwell b Cummins",
      r: 34,
      b: 22,
      fours: 4,
      sixes: 2,
      sr: 154.5,
    },
    { name: "S Gill", status: "lbw b Starc", r: 12, b: 9, fours: 1, sixes: 0, sr: 133.3 },
    { name: "V Kohli", status: "not out", r: 67, b: 43, fours: 8, sixes: 2, sr: 155.8 },
    { name: "S Iyer", status: "c Inglis b Hazlewood", r: 8, b: 6, fours: 1, sixes: 0, sr: 133.3 },
    { name: "H Pandya", status: "not out", r: 23, b: 15, fours: 2, sixes: 1, sr: 153.3 },
    { name: "R Jadeja", status: "yet to bat", r: 0, b: 0, fours: 0, sixes: 0, sr: 0 },
    { name: "D Karthik", status: "yet to bat", r: 0, b: 0, fours: 0, sixes: 0, sr: 0 },
  ],
};

const BOWLER_ROWS = {
  current: { name: "P Cummins", o: 3, m: 0, r: 28, w: 1, eco: 9.3 },
  full: [
    { name: "M Starc", o: 4, m: 0, r: 38, w: 1, eco: 9.5 },
    { name: "P Cummins", o: 3, m: 0, r: 28, w: 1, eco: 9.3 },
    { name: "J Hazlewood", o: 4, m: 0, r: 32, w: 1, eco: 8.0 },
    { name: "A Zampa", o: 4, m: 0, r: 29, w: 1, eco: 7.25 },
    { name: "M Maxwell", o: 2, m: 0, r: 19, w: 0, eco: 9.5 },
  ],
};

type Ball = { type: "dot" | "run" | "four" | "six" | "wicket" | "wide" | "nb"; val: string };
const LAST_6: Ball[] = [
  { type: "run", val: "1" },
  { type: "wicket", val: "W" },
  { type: "four", val: "4" },
  { type: "dot", val: "0" },
  { type: "six", val: "6" },
  { type: "run", val: "1" },
];

const RECENT_OVERS = [
  { over: 12, runs: 8 },
  { over: 13, runs: 14 },
  { over: 14, runs: 6 },
  { over: 15, runs: 18 },
  { over: 16, runs: 11 },
  { over: 17, runs: 9 },
];

const FOW = [
  { wkt: 1, score: "42/1", over: "5.3", batter: "R Sharma" },
  { wkt: 2, score: "58/2", over: "8.1", batter: "S Gill" },
  { wkt: 3, score: "112/3", over: "14.4", batter: "S Iyer" },
  { wkt: 4, score: "133/4", over: "16.2", batter: "Current" },
];

const PARTNERSHIPS = [
  { batters: "Rohit & Gill", runs: 16, balls: 14 },
  { batters: "Gill & Kohli", runs: 16, balls: 13 },
  { batters: "Kohli & Iyer", runs: 54, balls: 34 },
  { batters: "Iyer & Pandya", runs: 21, balls: 14 },
  { batters: "Kohli & Pandya", runs: 23, balls: 15 },
];

const AUS_BATTING = [
  {
    name: "D Warner",
    status: "c Kohli b Bumrah",
    r: 48,
    b: 72,
    min: 95,
    fours: 6,
    sixes: 0,
    sr: 66.7,
  },
  { name: "U Khawaja", status: "b Shami", r: 71, b: 114, min: 158, fours: 9, sixes: 0, sr: 62.3 },
  {
    name: "M Labuschagne",
    status: "not out",
    r: 89,
    b: 134,
    min: 189,
    fours: 11,
    sixes: 1,
    sr: 66.4,
  },
  { name: "S Smith", status: "lbw b Jadeja", r: 34, b: 67, min: 91, fours: 4, sixes: 0, sr: 50.7 },
  { name: "T Head", status: "c & b Ashwin", r: 15, b: 28, min: 38, fours: 2, sixes: 0, sr: 53.6 },
  {
    name: "A Carey†",
    status: "c Pant b Bumrah",
    r: 22,
    b: 41,
    min: 55,
    fours: 2,
    sixes: 0,
    sr: 53.7,
  },
];

// ── Completed match data ───────────────────────────────────────────────────────

const COMPLETED_HERO: Record<
  Format,
  {
    team1: string;
    team1Flag: string;
    team1Score: string;
    team1Overs?: string;
    team2: string;
    team2Flag: string;
    team2Score: string;
    team2Overs?: string;
    result: string;
  }
> = {
  T20: {
    team1: "IND",
    team1Flag: "🇮🇳",
    team1Score: "189/4",
    team1Overs: "20.0",
    team2: "AUS",
    team2Flag: "🇦🇺",
    team2Score: "183/7",
    team2Overs: "20.0",
    result: "India won by 6 runs",
  },
  ODI: {
    team1: "IND",
    team1Flag: "🇮🇳",
    team1Score: "232/3",
    team1Overs: "44.2",
    team2: "SL",
    team2Flag: "🇱🇰",
    team2Score: "231/8",
    team2Overs: "50.0",
    result: "India won by 7 wickets",
  },
  Test: {
    team1: "IND",
    team1Flag: "🇮🇳",
    team1Score: "482/8d",
    team2: "ENG",
    team2Flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    team2Score: "289 & 156 all out",
    result: "India won by an innings and 37 runs",
  },
};

type Moment = { over: string; text: string };
type SummaryRecord = {
  potm: string;
  potmStat: string;
  potmFlag: string;
  topBatter: string;
  topBatterStat: string;
  topBowler: string;
  topBowlerStat: string;
  moments: Moment[];
};

const SUMMARY_DATA: Record<Format, SummaryRecord> = {
  T20: {
    potm: "V Kohli",
    potmStat: "89*(54) · 3×4 · 4×6",
    potmFlag: "🇮🇳",
    topBatter: "V Kohli",
    topBatterStat: "89*(54) · SR 164.8",
    topBowler: "J Bumrah",
    topBowlerStat: "4-0-22-3 · Eco 5.5",
    moments: [
      { over: "17.4", text: "Kohli six — IND overtake AUS total for first time" },
      { over: "19.1", text: "Bumrah removes Maxwell — AUS last hope gone" },
      { over: "20.0", text: "Pandya hits winning boundary, India seal by 6 runs" },
    ],
  },
  ODI: {
    potm: "R Sharma",
    potmStat: "112*(98) · 11×4 · 2×6",
    potmFlag: "🇮🇳",
    topBatter: "R Sharma",
    topBatterStat: "112*(98) · SR 114.3",
    topBowler: "R Ashwin",
    topBowlerStat: "10-1-38-4 · Eco 3.8",
    moments: [
      {
        over: "13.2",
        text: "Rohit reaches century off 88 balls — fastest by an Indian in this series",
      },
      { over: "22.0", text: "Ashwin takes back-to-back wickets to trigger Sri Lanka collapse" },
      { over: "44.2", text: "Pandya drives Hasaranga — India win with 34 balls to spare" },
    ],
  },
  Test: {
    potm: "R Ashwin",
    potmStat: "9 wickets · 72 runs",
    potmFlag: "🇮🇳",
    topBatter: "C Pujara",
    topBatterStat: "133 (289b) · 18×4",
    topBowler: "R Ashwin",
    topBowlerStat: "9/127 across 2 innings",
    moments: [
      { over: "Day 2", text: "Ashwin takes 5/58 — England bowled out for 289 in 1st innings" },
      { over: "Day 3", text: "India post 482/8d — lead of 193 runs before declaring" },
      {
        over: "Day 4",
        text: "Bumrah's 4-fer wraps up England 2nd innings for 156 — win by innings",
      },
    ],
  },
};

// ── Ball indicator ────────────────────────────────────────────────────────────

const BALL_STYLES: Record<Ball["type"], string> = {
  dot: "bg-[#eeeeef] text-[rgba(12,13,16,0.55)]",
  run: "bg-[#ddfef2] text-[#00ad8b]",
  four: "bg-[#ecf7ff] text-[#0078ad]",
  six: "bg-[#6d17ce] text-white",
  wicket: "bg-[#fa2f40] text-white",
  wide: "bg-[#fef0e6] text-[#f06d0f]",
  nb: "bg-[#fef0e6] text-[#f06d0f]",
};

function BallDot({ ball }: { ball: Ball }) {
  return (
    <div
      className={`flex size-9 items-center justify-center rounded-full text-[13px] font-bold ${BALL_STYLES[ball.type]}`}
    >
      {ball.val}
    </div>
  );
}

// ── Phase label (T20 / ODI) ───────────────────────────────────────────────────

function phaseLabel(format: Format, overs: number): string {
  if (format === "Test") return "";
  if (format === "T20") {
    if (overs <= 6) return "Powerplay";
    if (overs <= 15) return "Middle overs";
    return "Death overs";
  }
  if (overs <= 10) return "Powerplay";
  if (overs <= 40) return "Middle overs";
  return "Death overs";
}

// ── Score hero ────────────────────────────────────────────────────────────────

function ScoreHero({ format, matchState }: { format: Format; matchState: MatchState }) {
  // ── COMPLETED ───────────────────────────────────────────────────────────────
  if (matchState === "completed") {
    const d = COMPLETED_HERO[format];
    const isTest = format === "Test";
    return (
      <div className="flex flex-col gap-3 rounded-2xl bg-[#0c0d10] px-4 py-4">
        {/* Batting team (winner on top) — or for Test, both teams */}
        <div className="flex flex-col gap-3">
          {/* Bowling/fielding side */}
          <div className="flex items-center gap-2">
            <span className="text-base">{d.team2Flag}</span>
            <span className="text-[13px] font-bold text-white/50">{d.team2}</span>
            <span className="ml-auto text-[13px] font-medium text-white/50">{d.team2Score}</span>
            {!isTest && d.team2Overs && (
              <span className="text-[11px] text-white/30">({d.team2Overs})</span>
            )}
          </div>
          {/* Winning side */}
          <div className="flex items-center gap-2">
            <span className="text-base">{d.team1Flag}</span>
            <span className="text-[15px] font-bold text-white">{d.team1}</span>
            {isTest ? (
              <span className="ml-auto text-[15px] font-bold text-white">{d.team1Score}</span>
            ) : (
              <>
                <span className="ml-auto text-[22px] leading-none font-bold text-white">
                  {d.team1Score}
                </span>
                {d.team1Overs && (
                  <span className="text-[13px] font-medium text-white/50">({d.team1Overs})</span>
                )}
              </>
            )}
          </div>
        </div>
        {/* Result banner */}
        <div className="flex items-center justify-center rounded-xl bg-[#25ab21]/[0.18] px-3 py-2.5">
          <span className="text-[13px] font-bold text-[#25ab21]">{d.result}</span>
        </div>
      </div>
    );
  }

  // ── LIVE — Test ─────────────────────────────────────────────────────────────
  if (format === "Test") {
    return (
      <div className="flex flex-col gap-3 rounded-2xl bg-[#0c0d10] px-4 py-4">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold tracking-widest text-white/60 uppercase">
            Day 2 · Session 2
          </span>
          <div className="ml-auto flex items-center gap-1">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#fa2f40] opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-[#fa2f40]" />
            </span>
            <span className="text-[10px] font-bold tracking-wide text-[#fa2f40] uppercase">
              Live
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-base">🏴󠁧󠁢󠁥󠁮󠁧󠁿</span>
            <span className="text-[13px] font-bold text-white/50">ENG</span>
            <span className="ml-1 text-[13px] font-medium text-white/50">289</span>
            <span className="ml-1 text-[11px] text-white/30">(92.4)</span>
            <span className="ml-auto text-[10px] font-bold tracking-wide text-white/30 uppercase">
              1st Innings
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base">🇮🇳</span>
            <span className="text-[15px] font-bold text-white">IND</span>
            <span className="ml-1 text-[22px] font-bold text-white">342/7</span>
            <span className="ml-1 text-[13px] font-medium text-white/50">(98.2)</span>
            <span className="ml-auto text-[10px] font-bold tracking-wide text-[#25ab21] uppercase">
              Batting
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-white/[0.06] px-3 py-2">
          <span className="text-[12px] font-bold text-white">IND lead by 53 runs</span>
          <span className="ml-auto text-[11px] text-white/40">Today: 89 runs, 3 wkts</span>
        </div>
      </div>
    );
  }

  // ── LIVE — T20 / ODI ────────────────────────────────────────────────────────
  const isODI = format === "ODI";
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-[#0c0d10] px-4 py-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🇮🇳</span>
          <span className="text-[13px] font-bold text-white/60">IND</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-[32px] leading-none font-bold tracking-tight text-white">
            {isODI ? "156/2" : "156/4"}
          </span>
          <span className="text-[14px] font-medium text-white/50">
            {isODI ? "(28.4)" : "(17.3)"}
          </span>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#fa2f40] opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-[#fa2f40]" />
          </span>
          <span className="text-[10px] font-bold tracking-wide text-[#fa2f40] uppercase">Live</span>
        </div>
      </div>
      <div className="h-px bg-white/[0.08]" />
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-bold tracking-widest text-white/35 uppercase">
            Target
          </span>
          <span className="text-[15px] font-bold text-white">{isODI ? "232" : "178"}</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[10px] font-bold tracking-widest text-white/35 uppercase">
            Need
          </span>
          <span className="text-[15px] font-bold text-white">
            {isODI ? "76 off 129" : "22 off 15"}
          </span>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-[10px] font-bold tracking-widest text-white/35 uppercase">RRR</span>
          <span className="text-[15px] font-bold text-[#f06d0f]">{isODI ? "3.5" : "8.8"}</span>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-[10px] font-bold tracking-widest text-white/35 uppercase">CRR</span>
          <span className="text-[15px] font-bold text-[#25ab21]">{isODI ? "5.4" : "8.9"}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold text-white/60">
          {phaseLabel(format, isODI ? 28 : 17)}
        </span>
        <span className="ml-auto text-[11px] font-medium text-white/35">
          {isODI ? "🇱🇰 SL set 231/8" : "🇦🇺 AUS set 177/6"}
        </span>
      </div>
    </div>
  );
}

// ── Summary view (completed match) ────────────────────────────────────────────

function SummaryView({ format }: { format: Format }) {
  const d = SUMMARY_DATA[format];
  return (
    <div className="flex flex-col gap-3">
      {/* Player of the Match */}
      <div className="rounded-2xl bg-white p-4">
        <span className="mb-3 block text-[10px] font-bold tracking-widest text-black/40 uppercase">
          Player of the Match
        </span>
        <div className="flex items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#f6f3ff] text-2xl">
            {d.potmFlag}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-bold text-[#0c0d10]">{d.potm}</div>
            <div className="text-[12px] font-medium text-black/45">{d.potmStat}</div>
          </div>
          <span className="text-2xl">🏆</span>
        </div>
      </div>

      {/* Top performers */}
      <div className="rounded-2xl bg-white p-4">
        <span className="mb-3 block text-[10px] font-bold tracking-widest text-black/40 uppercase">
          Top Performers
        </span>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="shrink-0 rounded-full bg-[#ecf7ff] px-2 py-0.5 text-[10px] font-bold text-[#0078ad]">
              BAT
            </span>
            <span className="text-[13px] font-bold text-[#0c0d10]">{d.topBatter}</span>
            <span className="ml-auto text-[12px] font-medium text-black/45">{d.topBatterStat}</span>
          </div>
          <div className="h-px bg-black/[0.05]" />
          <div className="flex items-center gap-2">
            <span className="shrink-0 rounded-full bg-[#ddfef2] px-2 py-0.5 text-[10px] font-bold text-[#00ad8b]">
              BOWL
            </span>
            <span className="text-[13px] font-bold text-[#0c0d10]">{d.topBowler}</span>
            <span className="ml-auto text-[12px] font-medium text-black/45">{d.topBowlerStat}</span>
          </div>
        </div>
      </div>

      {/* Key moments */}
      <div className="rounded-2xl bg-white p-4">
        <span className="mb-3 block text-[10px] font-bold tracking-widest text-black/40 uppercase">
          Key Moments
        </span>
        <div className="flex flex-col gap-3">
          {d.moments.map((m, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="mt-0.5 shrink-0 rounded-full bg-[#f6f3ff] px-2 py-0.5 text-[10px] font-bold text-[#6d17ce]">
                {m.over}
              </span>
              <span className="text-[12px] leading-snug font-medium text-black/55">{m.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Live view ─────────────────────────────────────────────────────────────────

function LiveView({ format }: { format: Format }) {
  return (
    <div className="flex flex-col gap-3">
      {/* Last 6 balls */}
      <div className="flex flex-col gap-3 rounded-2xl bg-white p-4">
        <span className="text-[10px] font-bold tracking-widest text-black/40 uppercase">
          {BOWLER_ROWS.current.name} — Over {Math.floor(17.3) + 1}
        </span>
        <div className="flex items-center gap-2">
          {LAST_6.map((b, i) => (
            <BallDot key={i} ball={b} />
          ))}
        </div>
      </div>

      {/* Current batters */}
      <div className="flex flex-col overflow-hidden rounded-2xl bg-white">
        <div className="px-4 pt-3 pb-2">
          <span className="text-[10px] font-bold tracking-widest text-black/40 uppercase">
            Batting
          </span>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-black/[0.06]">
              <th className="px-4 pb-2 text-left text-[10px] font-bold tracking-widest text-black/30 uppercase">
                Batter
              </th>
              <th className="px-2 pb-2 text-right text-[10px] font-bold tracking-widest text-black/30 uppercase">
                R
              </th>
              <th className="px-2 pb-2 text-right text-[10px] font-bold tracking-widest text-black/30 uppercase">
                B
              </th>
              <th className="px-2 pb-2 text-right text-[10px] font-bold tracking-widest text-black/30 uppercase">
                4s
              </th>
              <th className="px-2 pb-2 text-right text-[10px] font-bold tracking-widest text-black/30 uppercase">
                6s
              </th>
              <th className="px-4 pb-2 text-right text-[10px] font-bold tracking-widest text-black/30 uppercase">
                SR
              </th>
            </tr>
          </thead>
          <tbody>
            {BATTER_ROWS.live.map((b, i) => (
              <tr key={b.name} className="border-b border-black/[0.04] last:border-0">
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-bold text-[#0c0d10]">{b.name}</span>
                    {i === 0 && <span className="text-[10px] text-[#6d17ce]">*</span>}
                  </div>
                </td>
                <td className="px-2 py-2.5 text-right text-[14px] font-bold text-[#0c0d10]">
                  {b.r}
                </td>
                <td className="px-2 py-2.5 text-right text-[13px] font-medium text-black/55">
                  {b.b}
                </td>
                <td className="px-2 py-2.5 text-right text-[13px] font-medium text-black/55">
                  {b.fours}
                </td>
                <td className="px-2 py-2.5 text-right text-[13px] font-medium text-black/55">
                  {b.sixes}
                </td>
                <td className="px-4 py-2.5 text-right text-[13px] font-bold text-[#0078ad]">
                  {b.sr}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Current bowler */}
      <div className="flex flex-col overflow-hidden rounded-2xl bg-white">
        <div className="px-4 pt-3 pb-2">
          <span className="text-[10px] font-bold tracking-widest text-black/40 uppercase">
            Bowling
          </span>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-black/[0.06]">
              <th className="px-4 pb-2 text-left text-[10px] font-bold tracking-widest text-black/30 uppercase">
                Bowler
              </th>
              <th className="px-2 pb-2 text-right text-[10px] font-bold tracking-widest text-black/30 uppercase">
                O
              </th>
              <th className="px-2 pb-2 text-right text-[10px] font-bold tracking-widest text-black/30 uppercase">
                R
              </th>
              <th className="px-2 pb-2 text-right text-[10px] font-bold tracking-widest text-black/30 uppercase">
                W
              </th>
              <th className="px-4 pb-2 text-right text-[10px] font-bold tracking-widest text-black/30 uppercase">
                Eco
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-4 py-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-bold text-[#0c0d10]">
                    {BOWLER_ROWS.current.name}
                  </span>
                  <span className="rounded-full bg-[#f6f3ff] px-1.5 py-0.5 text-[9px] font-bold text-[#6d17ce]">
                    Bowling
                  </span>
                </div>
              </td>
              <td className="px-2 py-2.5 text-right text-[13px] font-medium text-black/55">
                {BOWLER_ROWS.current.o}
              </td>
              <td className="px-2 py-2.5 text-right text-[13px] font-medium text-black/55">
                {BOWLER_ROWS.current.r}
              </td>
              <td className="px-2 py-2.5 text-right text-[14px] font-bold text-[#0c0d10]">
                {BOWLER_ROWS.current.w}
              </td>
              <td className="px-4 py-2.5 text-right text-[13px] font-bold text-[#fa2f40]">
                {BOWLER_ROWS.current.eco}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Recent overs */}
      <div className="flex flex-col gap-3 rounded-2xl bg-white p-4">
        <span className="text-[10px] font-bold tracking-widest text-black/40 uppercase">
          Recent overs
        </span>
        <div className="flex h-12 items-end gap-2">
          {RECENT_OVERS.map((o) => (
            <div key={o.over} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-sm bg-[#6d17ce]/20"
                style={{ height: `${Math.round((o.runs / 18) * 40)}px` }}
              />
              <span className="text-[9px] font-bold text-black/30">{o.runs}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between">
          {RECENT_OVERS.map((o) => (
            <span key={o.over} className="flex-1 text-center text-[9px] text-black/25">
              Ov {o.over}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Scorecard view ─────────────────────────────────────────────────────────────

function ScorecardView({
  format,
  innings,
  onInningsChange,
}: {
  format: Format;
  innings: Innings;
  onInningsChange: (i: Innings) => void;
}) {
  const isTest = format === "Test";

  return (
    <div className="flex flex-col gap-3">
      {/* Test innings selector */}
      {isTest && (
        <div className="flex gap-2">
          {([1, 2] as Innings[]).map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => onInningsChange(i)}
              className={`flex-1 rounded-full py-2 text-[13px] font-bold transition-colors ${
                innings === i ? "bg-[#6d17ce] text-white" : "bg-white text-black/55"
              }`}
            >
              {i === 1 ? "ENG 1st Inn · 289" : "IND 2nd Inn · 342/7*"}
            </button>
          ))}
        </div>
      )}

      {/* Batting table */}
      <div className="flex flex-col overflow-hidden rounded-2xl bg-white">
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <span className="text-[10px] font-bold tracking-widest text-black/40 uppercase">
            {isTest ? (innings === 1 ? "England Batting" : "India Batting") : "India Batting"}
          </span>
          <span className="text-[11px] font-bold text-black/40">
            {isTest ? (innings === 1 ? "289 all out" : "342/7") : "156/4 (17.3)"}
          </span>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-black/[0.06]">
              <th className="px-4 pb-2 text-left text-[10px] font-bold tracking-widest text-black/30 uppercase">
                Batter
              </th>
              <th className="px-2 pb-2 text-right text-[10px] font-bold tracking-widest text-black/30 uppercase">
                R
              </th>
              <th className="px-2 pb-2 text-right text-[10px] font-bold tracking-widest text-black/30 uppercase">
                B
              </th>
              {isTest && (
                <th className="px-2 pb-2 text-right text-[10px] font-bold tracking-widest text-black/30 uppercase">
                  M
                </th>
              )}
              <th className="px-2 pb-2 text-right text-[10px] font-bold tracking-widest text-black/30 uppercase">
                4s
              </th>
              <th className="px-2 pb-2 text-right text-[10px] font-bold tracking-widest text-black/30 uppercase">
                6s
              </th>
              <th className="px-4 pb-2 text-right text-[10px] font-bold tracking-widest text-black/30 uppercase">
                SR
              </th>
            </tr>
          </thead>
          <tbody>
            {(isTest && innings === 1 ? AUS_BATTING : BATTER_ROWS.full).map((b) => {
              const isYetToBat = b.status === "yet to bat";
              return (
                <tr
                  key={b.name}
                  className={`border-b border-black/[0.04] last:border-0 ${isYetToBat ? "opacity-35" : ""}`}
                >
                  <td className="px-4 py-2.5">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[13px] font-bold text-[#0c0d10]">{b.name}</span>
                      {!isYetToBat && (
                        <span className="text-[10px] leading-tight font-medium text-black/40">
                          {b.status}
                        </span>
                      )}
                    </div>
                  </td>
                  <td
                    className={`px-2 py-2.5 text-right text-[14px] font-bold ${isYetToBat ? "text-black/30" : "text-[#0c0d10]"}`}
                  >
                    {isYetToBat ? "-" : b.r}
                  </td>
                  <td className="px-2 py-2.5 text-right text-[13px] font-medium text-black/40">
                    {isYetToBat ? "-" : b.b}
                  </td>
                  {isTest && (
                    <td className="px-2 py-2.5 text-right text-[13px] font-medium text-black/40">
                      {isYetToBat ? "-" : "min" in b ? (b as { min: number }).min : "-"}
                    </td>
                  )}
                  <td className="px-2 py-2.5 text-right text-[13px] font-medium text-black/40">
                    {isYetToBat ? "-" : b.fours}
                  </td>
                  <td className="px-2 py-2.5 text-right text-[13px] font-medium text-black/40">
                    {isYetToBat ? "-" : b.sixes}
                  </td>
                  <td
                    className={`px-4 py-2.5 text-right text-[13px] font-bold ${isYetToBat ? "text-black/30" : "text-[#0078ad]"}`}
                  >
                    {isYetToBat ? "-" : b.sr}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="flex items-center justify-between border-t border-black/[0.06] px-4 py-2.5">
          <span className="text-[12px] font-medium text-black/40">Extras</span>
          <span className="text-[12px] font-medium text-black/40">
            {isTest && innings === 1 ? "10 (b4, lb3, w2, nb1)" : "11 (b1, lb4, w6)"}
          </span>
        </div>
      </div>

      {/* ODI: Partnerships */}
      {format === "ODI" && (
        <div className="flex flex-col overflow-hidden rounded-2xl bg-white">
          <div className="px-4 pt-3 pb-2">
            <span className="text-[10px] font-bold tracking-widest text-black/40 uppercase">
              Partnerships
            </span>
          </div>
          {PARTNERSHIPS.map((p, i) => (
            <div
              key={i}
              className="flex items-center gap-3 border-b border-black/[0.04] px-4 py-2.5 last:border-0"
            >
              <span className="flex-1 text-[12px] font-medium text-black/55">{p.batters}</span>
              <div className="flex items-baseline gap-1">
                <span className="text-[13px] font-bold text-[#0c0d10]">{p.runs}</span>
                <span className="text-[11px] text-black/35">({p.balls}b)</span>
              </div>
              <div className="h-2 w-16 overflow-hidden rounded-full bg-[#eeeeef]">
                <div
                  className="h-full rounded-full bg-[#6d17ce]/40"
                  style={{ width: `${Math.min(100, (p.runs / 54) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bowling table */}
      <div className="flex flex-col overflow-hidden rounded-2xl bg-white">
        <div className="px-4 pt-3 pb-2">
          <span className="text-[10px] font-bold tracking-widest text-black/40 uppercase">
            {isTest ? (innings === 1 ? "India Bowling" : "England Bowling") : "Australia Bowling"}
          </span>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-black/[0.06]">
              <th className="px-4 pb-2 text-left text-[10px] font-bold tracking-widest text-black/30 uppercase">
                Bowler
              </th>
              <th className="px-2 pb-2 text-right text-[10px] font-bold tracking-widest text-black/30 uppercase">
                O
              </th>
              <th className="px-2 pb-2 text-right text-[10px] font-bold tracking-widest text-black/30 uppercase">
                M
              </th>
              <th className="px-2 pb-2 text-right text-[10px] font-bold tracking-widest text-black/30 uppercase">
                R
              </th>
              <th className="px-2 pb-2 text-right text-[10px] font-bold tracking-widest text-black/30 uppercase">
                W
              </th>
              {isTest && (
                <>
                  <th className="px-2 pb-2 text-right text-[10px] font-bold tracking-widest text-black/30 uppercase">
                    NB
                  </th>
                  <th className="px-2 pb-2 text-right text-[10px] font-bold tracking-widest text-black/30 uppercase">
                    WD
                  </th>
                </>
              )}
              <th className="px-4 pb-2 text-right text-[10px] font-bold tracking-widest text-black/30 uppercase">
                Eco
              </th>
            </tr>
          </thead>
          <tbody>
            {BOWLER_ROWS.full.map((b) => (
              <tr key={b.name} className="border-b border-black/[0.04] last:border-0">
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-bold text-[#0c0d10]">{b.name}</span>
                    {b.name === BOWLER_ROWS.current.name && (
                      <span className="rounded-full bg-[#f6f3ff] px-1.5 py-0.5 text-[9px] font-bold text-[#6d17ce]">
                        Now
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-2 py-2.5 text-right text-[13px] font-medium text-black/55">
                  {b.o}
                </td>
                <td className="px-2 py-2.5 text-right text-[13px] font-medium text-black/55">
                  {b.m}
                </td>
                <td className="px-2 py-2.5 text-right text-[13px] font-medium text-black/55">
                  {b.r}
                </td>
                <td className="px-2 py-2.5 text-right text-[14px] font-bold text-[#0c0d10]">
                  {b.w}
                </td>
                {isTest && (
                  <>
                    <td className="px-2 py-2.5 text-right text-[13px] font-medium text-black/40">
                      0
                    </td>
                    <td className="px-2 py-2.5 text-right text-[13px] font-medium text-black/40">
                      1
                    </td>
                  </>
                )}
                <td
                  className={`px-4 py-2.5 text-right text-[13px] font-bold ${b.eco > 9 ? "text-[#fa2f40]" : b.eco < 7.5 ? "text-[#25ab21]" : "text-[#f06d0f]"}`}
                >
                  {b.eco}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Fall of wickets */}
      <div className="flex flex-col gap-2 rounded-2xl bg-white p-4">
        <span className="text-[10px] font-bold tracking-widest text-black/40 uppercase">
          Fall of wickets
        </span>
        <div className="flex flex-wrap gap-2">
          {FOW.map((f) => (
            <div key={f.wkt} className="flex flex-col gap-0.5 rounded-xl bg-[#f5f5f5] px-3 py-2">
              <span className="text-[10px] font-bold text-black/35">{f.score}</span>
              <span className="text-[11px] font-bold text-[#0c0d10]">{f.batter}</span>
              <span className="text-[9px] text-black/35">Ov {f.over}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CricketScorecardPage() {
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("live");
  const [format, setFormat] = useState<Format>("T20");
  const [matchState, setMatchState] = useState<MatchState>("live");
  const [innings, setInnings] = useState<Innings>(1);
  const scrollRef = useRef(false);

  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    const past = e.currentTarget.scrollTop > 8;
    if (past !== scrollRef.current) {
      scrollRef.current = past;
      setScrolled(past);
    }
  }, []);

  const handleMatchStateChange = (s: MatchState) => {
    setMatchState(s);
    // Completed defaults to scorecard; live defaults to live tab
    setActiveTab(s === "completed" ? "scorecard" : "live");
  };

  // Tab labels flip when completed: "🔴 Live" → "Summary"
  const tabs = [
    { id: "live" as Tab, label: matchState === "completed" ? "Summary" : "🔴 Live" },
    { id: "scorecard" as Tab, label: "Scorecard" },
  ];

  return (
    <div className="bg-canvas-grey text-fg relative flex h-full flex-col">
      <main
        className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 68px)" }}
        onScroll={handleScroll}
      >
        <div className="mx-auto flex w-full max-w-md flex-col gap-3 px-4">
          {/* Match meta */}
          <div className="flex items-center gap-2 pt-1">
            <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-black/40">
              {format === "Test"
                ? "2nd Test · India vs England · Edgbaston"
                : format === "ODI"
                  ? "3rd ODI · Sri Lanka tour of India · Mumbai"
                  : "3rd T20I · India tour of Australia · Hyderabad"}
            </span>
          </div>

          {/* Format toggle */}
          <div className="flex gap-1.5">
            {(["T20", "ODI", "Test"] as Format[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFormat(f)}
                className={`rounded-full px-3 py-1.5 text-[12px] font-bold transition-colors ${
                  format === f ? "bg-[#0c0d10] text-white" : "bg-white text-black/40"
                }`}
              >
                {f}
              </button>
            ))}
            <span className="ml-auto self-center text-[10px] font-medium text-black/25">
              Format
            </span>
          </div>

          {/* State toggle */}
          <div className="flex gap-1.5">
            {(["live", "completed"] as MatchState[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleMatchStateChange(s)}
                className={`rounded-full px-3 py-1.5 text-[12px] font-bold transition-colors ${
                  matchState === s ? "bg-[#0c0d10] text-white" : "bg-white text-black/40"
                }`}
              >
                {s === "live" ? "🔴 Live" : "Completed"}
              </button>
            ))}
            <span className="ml-auto self-center text-[10px] font-medium text-black/25">State</span>
          </div>

          {/* Score hero */}
          <ScoreHero format={format} matchState={matchState} />

          {/* Tab toggle */}
          <div className="flex gap-1 rounded-2xl bg-white p-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`flex-1 rounded-xl py-2 text-[13px] font-bold transition-colors ${
                  activeTab === t.id ? "bg-[#0c0d10] text-white" : "text-black/40"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === "live" ? (
            matchState === "completed" ? (
              <SummaryView format={format} />
            ) : (
              <LiveView format={format} />
            )
          ) : (
            <ScorecardView format={format} innings={innings} onInningsChange={setInnings} />
          )}
        </div>
      </main>

      <HubHeader
        title={
          format === "Test"
            ? "IND vs ENG · Test"
            : format === "ODI"
              ? "IND vs SL · ODI"
              : "IND vs AUS · T20I"
        }
        backHref="/cricket"
        scrolled={scrolled}
      />
      <HubChatInput placeholder="Ask about this match…" />
    </div>
  );
}
