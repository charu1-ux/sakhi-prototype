"use client";

import { useCallback, useRef, useState } from "react";

import { HubChatInput } from "@/app/jobs/design-prototype/HubChatInput";
import { HubHeader } from "@/app/jobs/design-prototype/HubHeader";

// ── Types ─────────────────────────────────────────────────────────────────────

type Category = "All" | "Politics" | "Sports" | "Entertainment" | "Tech" | "Business" | "Health";

type RegionalSentiment = {
  region: "North" | "South" | "East" | "West";
  flag: string;
  sentiment: "positive" | "negative" | "neutral";
  summary: string;
};

type Topic = {
  id: string;
  rank: number;
  title: string;
  category: Exclude<Category, "All">;
  searches: string; // e.g. "2.4M"
  trend: "rising" | "falling" | "stable";
  trendPct: number;
  positive: number; // 0–100
  neutral: number;
  negative: number;
  regional: RegionalSentiment[];
};

// ── Data ──────────────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = [
  "All",
  "Politics",
  "Sports",
  "Entertainment",
  "Tech",
  "Business",
  "Health",
];

const TOPICS: Topic[] = [
  {
    id: "1",
    rank: 1,
    title: "Parliament Data Bill",
    category: "Politics",
    searches: "4.1M",
    trend: "rising",
    trendPct: 312,
    positive: 34,
    neutral: 28,
    negative: 38,
    regional: [
      {
        region: "North",
        flag: "🏔️",
        sentiment: "negative",
        summary: "Concern over surveillance clauses",
      },
      {
        region: "South",
        flag: "🌴",
        sentiment: "positive",
        summary: "Welcomed data sovereignty protections",
      },
      {
        region: "East",
        flag: "🌊",
        sentiment: "neutral",
        summary: "Wait-and-watch on enforcement",
      },
      {
        region: "West",
        flag: "🌆",
        sentiment: "positive",
        summary: "Tech community optimistic on clarity",
      },
    ],
  },
  {
    id: "2",
    rank: 2,
    title: "RBI Rate Cut",
    category: "Business",
    searches: "3.7M",
    trend: "rising",
    trendPct: 280,
    positive: 62,
    neutral: 22,
    negative: 16,
    regional: [
      {
        region: "North",
        flag: "🏔️",
        sentiment: "positive",
        summary: "Home buyers celebrate lower EMIs",
      },
      {
        region: "South",
        flag: "🌴",
        sentiment: "positive",
        summary: "Markets rally, IT sector leads",
      },
      {
        region: "East",
        flag: "🌊",
        sentiment: "neutral",
        summary: "Cautious optimism, inflation worries persist",
      },
      {
        region: "West",
        flag: "🌆",
        sentiment: "positive",
        summary: "Business confidence hits 2-year high",
      },
    ],
  },
  {
    id: "3",
    rank: 3,
    title: "Cyclone Arnav",
    category: "Health",
    searches: "2.9M",
    trend: "rising",
    trendPct: 540,
    positive: 12,
    neutral: 30,
    negative: 58,
    regional: [
      {
        region: "East",
        flag: "🌊",
        sentiment: "negative",
        summary: "Odisha and WB brace for impact",
      },
      {
        region: "North",
        flag: "🏔️",
        sentiment: "neutral",
        summary: "Solidarity, donations flowing in",
      },
      {
        region: "South",
        flag: "🌴",
        sentiment: "neutral",
        summary: "Monitoring situation, rainfall alerts",
      },
      {
        region: "West",
        flag: "🌆",
        sentiment: "neutral",
        summary: "Limited direct impact expected",
      },
    ],
  },
  {
    id: "4",
    rank: 4,
    title: "IPL Spot-Fixing",
    category: "Sports",
    searches: "2.4M",
    trend: "rising",
    trendPct: 198,
    positive: 8,
    neutral: 25,
    negative: 67,
    regional: [
      {
        region: "North",
        flag: "🏔️",
        sentiment: "negative",
        summary: "Outrage, calls for lifetime ban",
      },
      { region: "South", flag: "🌴", sentiment: "negative", summary: "Fan trust in BCCI eroding" },
      {
        region: "East",
        flag: "🌊",
        sentiment: "negative",
        summary: "Disappointed, demands transparency",
      },
      {
        region: "West",
        flag: "🌆",
        sentiment: "negative",
        summary: "Mumbai fans split — denial and anger",
      },
    ],
  },
  {
    id: "5",
    rank: 5,
    title: "Jio 5G SA Rollout",
    category: "Tech",
    searches: "1.8M",
    trend: "rising",
    trendPct: 145,
    positive: 71,
    neutral: 19,
    negative: 10,
    regional: [
      {
        region: "North",
        flag: "🏔️",
        sentiment: "positive",
        summary: "Delhi, Noida speed tests viral",
      },
      {
        region: "South",
        flag: "🌴",
        sentiment: "positive",
        summary: "Bengaluru celebrates coverage depth",
      },
      {
        region: "East",
        flag: "🌊",
        sentiment: "neutral",
        summary: "Kolkata in next phase, awaiting expansion",
      },
      {
        region: "West",
        flag: "🌆",
        sentiment: "positive",
        summary: "Mumbai testing speeds above 500 Mbps",
      },
    ],
  },
  {
    id: "6",
    rank: 6,
    title: "Deepika New Film",
    category: "Entertainment",
    searches: "1.5M",
    trend: "stable",
    trendPct: 12,
    positive: 78,
    neutral: 15,
    negative: 7,
    regional: [
      {
        region: "North",
        flag: "🏔️",
        sentiment: "positive",
        summary: "Trailer trending #1 across Hindi belt",
      },
      {
        region: "South",
        flag: "🌴",
        sentiment: "positive",
        summary: "Pan-India release buzz high",
      },
      {
        region: "East",
        flag: "🌊",
        sentiment: "positive",
        summary: "Kolkata loves the period drama backdrop",
      },
      {
        region: "West",
        flag: "🌆",
        sentiment: "positive",
        summary: "Mumbai multiplex advance bookings sold out",
      },
    ],
  },
];

// ── Sentiment bar ─────────────────────────────────────────────────────────────

function SentimentBar({
  positive,
  neutral,
  negative,
}: {
  positive: number;
  neutral: number;
  negative: number;
}) {
  return (
    <div className="flex h-1.5 w-full overflow-hidden rounded-full">
      <div className="bg-[#25ab21]" style={{ width: `${positive}%` }} />
      <div className="bg-black/15" style={{ width: `${neutral}%` }} />
      <div className="bg-[#fa2f40]" style={{ width: `${negative}%` }} />
    </div>
  );
}

// ── Regional pill ─────────────────────────────────────────────────────────────

const SENTIMENT_COLORS = {
  positive: "text-[#25ab21]",
  negative: "text-[#fa2f40]",
  neutral: "text-black/40",
};

const SENTIMENT_BG = {
  positive: "bg-[#e6f7e6]",
  negative: "bg-[#fde8ea]",
  neutral: "bg-black/[0.04]",
};

// ── Topic card ────────────────────────────────────────────────────────────────

function TopicCard({ topic }: { topic: Topic }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="flex flex-col gap-3 rounded-2xl bg-white p-4 transition-opacity select-none active:opacity-70"
      onClick={() => setExpanded((v) => !v)}
    >
      {/* Top row */}
      <div className="flex items-center gap-3">
        {/* Rank */}
        <span className="w-6 shrink-0 text-center text-[15px] font-black text-black/20">
          {topic.rank}
        </span>

        {/* Title + meta */}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-[14px] font-bold text-[#0c0d10]">{topic.title}</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium text-black/40">{topic.searches} searches</span>
            <span className="text-black/20">·</span>
            <span
              className={`text-[11px] font-bold ${
                topic.trend === "rising"
                  ? "text-[#25ab21]"
                  : topic.trend === "falling"
                    ? "text-[#fa2f40]"
                    : "text-black/40"
              }`}
            >
              {topic.trend === "rising" ? "▲" : topic.trend === "falling" ? "▼" : "—"}{" "}
              {topic.trendPct}%
            </span>
          </div>
        </div>

        {/* Category chip */}
        <span className="shrink-0 rounded-full bg-[#f6f3ff] px-2 py-0.5 text-[10px] font-bold text-[#6d17ce]">
          {topic.category}
        </span>
      </div>

      {/* Sentiment bar */}
      <SentimentBar positive={topic.positive} neutral={topic.neutral} negative={topic.negative} />

      {/* Sentiment legend */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <span className="size-2 rounded-full bg-[#25ab21]" />
          <span className="text-[11px] text-black/40">{topic.positive}%</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="size-2 rounded-full bg-black/15" />
          <span className="text-[11px] text-black/40">{topic.neutral}%</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="size-2 rounded-full bg-[#fa2f40]" />
          <span className="text-[11px] text-black/40">{topic.negative}%</span>
        </div>
        <button className="ml-auto text-[11px] font-semibold text-[#6d17ce]">
          {expanded ? "Hide regions" : "By region"}
        </button>
      </div>

      {/* Regional breakdown — expanded */}
      {expanded && (
        <div className="grid grid-cols-2 gap-2 border-t border-black/[0.06] pt-3">
          {topic.regional.map((r) => (
            <div
              key={r.region}
              className={`flex flex-col gap-1 rounded-xl p-2.5 ${SENTIMENT_BG[r.sentiment]}`}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-base leading-none">{r.flag}</span>
                <span className="text-[11px] font-bold text-[#0c0d10]">{r.region}</span>
                <span className={`ml-auto text-[10px] font-bold ${SENTIMENT_COLORS[r.sentiment]}`}>
                  {r.sentiment === "positive" ? "+" : r.sentiment === "negative" ? "−" : "~"}
                </span>
              </div>
              <p className="text-[11px] leading-snug text-black/55">{r.summary}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PulseOfNationPage() {
  const [scrolled, setScrolled] = useState(false);
  const scrollRef = useRef(false);
  const [activeCategory, setActiveCategory] = useState<Category>("All");

  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    const past = e.currentTarget.scrollTop > 8;
    if (past !== scrollRef.current) {
      scrollRef.current = past;
      setScrolled(past);
    }
  }, []);

  const filtered =
    activeCategory === "All" ? TOPICS : TOPICS.filter((t) => t.category === activeCategory);

  return (
    <div className="bg-canvas-grey text-fg relative flex h-full flex-col">
      <main
        className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 68px)" }}
        onScroll={handleScroll}
      >
        <div className="mx-auto flex w-full max-w-md flex-col gap-5 px-4">
          {/* Intro line */}
          <p className="pt-2 text-xs font-semibold tracking-widest text-black/40 uppercase">
            Trending in India · Right now
          </p>

          {/* Sentiment legend card */}
          <div className="flex items-center gap-4 rounded-2xl bg-white px-4 py-3">
            <span className="text-[12px] font-semibold text-black/40">Sentiment</span>
            <div className="flex items-center gap-1">
              <span className="size-2.5 rounded-full bg-[#25ab21]" />
              <span className="text-[11px] text-black/55">Positive</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="size-2.5 rounded-full bg-black/15" />
              <span className="text-[11px] text-black/55">Neutral</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="size-2.5 rounded-full bg-[#fa2f40]" />
              <span className="text-[11px] text-black/55">Negative</span>
            </div>
          </div>

          {/* Category filter */}
          <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                  activeCategory === cat ? "bg-[#6d17ce] text-white" : "bg-white text-black/55"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Topic list */}
          <ul className="flex list-none flex-col gap-3 p-0">
            {filtered.map((t) => (
              <li key={t.id}>
                <TopicCard topic={t} />
              </li>
            ))}
          </ul>
        </div>
      </main>

      <HubHeader title="Pulse of Nation" backHref="/news" scrolled={scrolled} />
      <HubChatInput placeholder="Ask what India thinks about…" />
    </div>
  );
}
