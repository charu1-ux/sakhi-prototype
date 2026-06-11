"use client";

import { useCallback, useRef, useState } from "react";

import { HubChatInput } from "@/app/jobs/design-prototype/HubChatInput";
import { HubHeader } from "@/app/jobs/design-prototype/HubHeader";

// ── Types ─────────────────────────────────────────────────────────────────────

type StoryStatus = "breaking" | "developing" | "latest";

type Story = {
  id: string;
  status: StoryStatus;
  category: string;
  headline: string;
  summary: string;
  time: string;
  source: string;
  imageEmoji: string;
  updates?: string[];
};

// ── Data ──────────────────────────────────────────────────────────────────────

const STORIES: Story[] = [
  {
    id: "1",
    status: "breaking",
    category: "Politics",
    headline: "Parliament passes landmark data protection bill after midnight session",
    summary:
      "The Digital Personal Data Protection Amendment Bill 2025 cleared both Houses of Parliament in a historic overnight session, setting strict penalties for data breaches and creating a new regulatory body.",
    time: "Just now",
    source: "PTI",
    imageEmoji: "🏛️",
    updates: [
      "Opposition stages walkout over surveillance clause",
      "Tech industry welcomes clarity on cross-border data flows",
      "Effective date set at 90 days from Presidential assent",
    ],
  },
  {
    id: "2",
    status: "breaking",
    category: "Economy",
    headline: "RBI cuts repo rate by 50 bps in emergency meeting",
    summary:
      "The Reserve Bank of India convened an unscheduled MPC meeting and voted 5-1 to cut the benchmark rate to 5.5%, the steepest single cut in six years, citing global recession fears.",
    time: "12 min ago",
    source: "Bloomberg Quint",
    imageEmoji: "🏦",
    updates: [
      "Sensex surges 1,200 points on news",
      "Home loan EMIs to fall by approx ₹800/month on ₹50L loan",
    ],
  },
  {
    id: "3",
    status: "developing",
    category: "Weather",
    headline: "Cyclone Arnav makes landfall near Puri; red alert in 5 Odisha districts",
    summary:
      "Very severe cyclonic storm Arnav crossed the Odisha coast early this morning with wind speeds of 140 km/h. NDRF teams have been pre-deployed across the coast.",
    time: "38 min ago",
    source: "IMD",
    imageEmoji: "🌀",
    updates: [
      "Bhubaneswar airport suspended operations till 8 PM",
      "Over 2 lakh evacuated to shelter homes",
    ],
  },
  {
    id: "4",
    status: "developing",
    category: "Sports",
    headline: "BCCI suspends star pacer pending inquiry into spot-fixing allegations",
    summary:
      "The Board of Control for Cricket in India has placed a prominent fast bowler under an interim suspension while the Anti-Corruption Unit investigates communications flagged during the IPL.",
    time: "1 hr ago",
    source: "Cricinfo",
    imageEmoji: "🏏",
  },
  {
    id: "5",
    status: "latest",
    category: "Tech",
    headline: "Reliance Jio announces 5G-SA rollout complete in 100 cities",
    summary:
      "Jio has completed the standalone 5G rollout across 100 Indian cities, with average download speeds reported at 450 Mbps in pilot trials. National coverage target set for Q1 2026.",
    time: "2 hr ago",
    source: "TelecomTalk",
    imageEmoji: "📡",
  },
  {
    id: "6",
    status: "latest",
    category: "Health",
    headline: "ICMR study links ultra-processed food to 40% rise in metabolic disease",
    summary:
      "A 10-year longitudinal study across 12 Indian cities found that high consumption of ultra-processed foods correlates with a 40% increased risk of diabetes and hypertension in adults under 45.",
    time: "3 hr ago",
    source: "ICMR",
    imageEmoji: "🩺",
  },
];

// ── Badge config ──────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  StoryStatus,
  { label: string; bg: string; text: string; dot?: boolean }
> = {
  breaking: { label: "BREAKING", bg: "bg-[#fa2f40]", text: "text-white", dot: true },
  developing: { label: "DEVELOPING", bg: "bg-[#f06d0f]", text: "text-white", dot: false },
  latest: { label: "LATEST", bg: "bg-[#ecf7ff]", text: "text-[#0078ad]", dot: false },
};

// ── Story card ────────────────────────────────────────────────────────────────

function StoryCard({ story }: { story: Story }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[story.status];

  return (
    <div
      className="flex flex-col gap-3 rounded-2xl bg-white p-4 transition-opacity select-none active:opacity-70"
      onClick={() => setExpanded((v) => !v)}
    >
      {/* Top row: category + status badge */}
      <div className="flex items-center gap-2">
        <span className="min-w-0 flex-1 truncate text-[11px] font-semibold tracking-wide text-black/40 uppercase">
          {story.category}
        </span>
        <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 ${cfg.bg}`}>
          {cfg.dot && (
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-white" />
            </span>
          )}
          <span className={`text-[10px] font-bold tracking-wide ${cfg.text}`}>{cfg.label}</span>
        </div>
      </div>

      {/* Headline + emoji */}
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-2xl leading-none">{story.imageEmoji}</span>
        <p className="flex-1 text-[15px] leading-snug font-bold text-[#0c0d10]">{story.headline}</p>
      </div>

      {/* Summary — always visible */}
      <p className="text-[13px] leading-relaxed text-black/55">{story.summary}</p>

      {/* Updates — expanded only */}
      {expanded && story.updates && story.updates.length > 0 && (
        <ul className="flex flex-col gap-1.5 border-t border-black/[0.06] pt-3">
          {story.updates.map((u, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[#6d17ce]" />
              <span className="text-[12px] leading-relaxed text-black/60">{u}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Footer: source + time + expand hint */}
      <div className="flex items-center gap-2 border-t border-black/[0.06] pt-2">
        <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-black/35">
          {story.source} · {story.time}
        </span>
        {story.updates && story.updates.length > 0 && (
          <span className="text-[11px] font-semibold text-[#6d17ce]">
            {expanded ? "Show less" : `+${story.updates.length} updates`}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BreakingNewsPage() {
  const [scrolled, setScrolled] = useState(false);
  const scrollRef = useRef(false);

  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    const past = e.currentTarget.scrollTop > 8;
    if (past !== scrollRef.current) {
      scrollRef.current = past;
      setScrolled(past);
    }
  }, []);

  const breakingStories = STORIES.filter((s) => s.status === "breaking");
  const developingStories = STORIES.filter((s) => s.status === "developing");
  const latestStories = STORIES.filter((s) => s.status === "latest");

  return (
    <div className="bg-canvas-grey text-fg relative flex h-full flex-col">
      <main
        className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 68px)" }}
        onScroll={handleScroll}
      >
        <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4">
          {/* Live ticker bar */}
          <div className="flex items-center gap-2 rounded-xl bg-[#fde8ea] px-3 py-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#fa2f40] opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-[#fa2f40]" />
            </span>
            <span className="text-[12px] font-bold tracking-wide text-[#fa2f40] uppercase">
              Live updates
            </span>
            <span className="text-[12px] text-black/50">· Tap any story to expand</span>
          </div>

          {/* Breaking */}
          {breakingStories.length > 0 && (
            <section className="flex flex-col gap-3">
              <span className="text-[10px] font-bold tracking-widest text-[#fa2f40] uppercase">
                Breaking now
              </span>
              <ul className="flex list-none flex-col gap-3 p-0">
                {breakingStories.map((s) => (
                  <li key={s.id}>
                    <StoryCard story={s} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Developing */}
          {developingStories.length > 0 && (
            <section className="flex flex-col gap-3">
              <span className="text-[10px] font-bold tracking-widest text-[#f06d0f] uppercase">
                Developing
              </span>
              <ul className="flex list-none flex-col gap-3 p-0">
                {developingStories.map((s) => (
                  <li key={s.id}>
                    <StoryCard story={s} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Latest */}
          {latestStories.length > 0 && (
            <section className="flex flex-col gap-3">
              <span className="text-[10px] font-bold tracking-widest text-black/40 uppercase">
                Latest
              </span>
              <ul className="flex list-none flex-col gap-3 p-0">
                {latestStories.map((s) => (
                  <li key={s.id}>
                    <StoryCard story={s} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </main>

      <HubHeader title="Breaking News" backHref="/news" scrolled={scrolled} />
      <HubChatInput variant="sleek" placeholder="Ask about any breaking story…" />
    </div>
  );
}
