"use client";

import { useCallback, useRef, useState } from "react";

import { HubChatInput } from "@/app/jobs/design-prototype/HubChatInput";
import { HubHeader } from "@/app/jobs/design-prototype/HubHeader";

// ── Types ─────────────────────────────────────────────────────────────────────

type Story = {
  id: string;
  source: string;
  sourceColor: string;
  headline: string;
  summary: string;
  timeAgo: string;
  category: string;
  isBreaking?: boolean;
  isTop?: boolean;
};

// ── Briefing customiser ───────────────────────────────────────────────────────

type BriefingConfig = {
  style: string;
  topics: string[];
  length: string;
  language: string;
};

const DEFAULT_CONFIG: BriefingConfig = {
  style: "Calm",
  topics: ["All"],
  length: "5 min",
  language: "English",
};

const STYLE_OPTIONS = ["Calm", "Punchy", "Anchor", "Podcast"];
const TOPIC_OPTIONS = [
  "All",
  "India",
  "International",
  "Business",
  "Sports",
  "Entertainment",
  "Tech",
  "World",
];
const LENGTH_OPTIONS = ["2 min", "5 min", "10 min"];
const LANGUAGE_OPTIONS = ["English", "Hinglish", "Hindi", "Marathi", "Gujarati"];

function PillRow({
  label,
  options,
  selected,
  multi,
  onSelect,
}: {
  label: string;
  options: string[];
  selected: string | string[];
  multi?: boolean;
  onSelect: (val: string) => void;
}) {
  const isActive = (opt: string) =>
    multi ? (selected as string[]).includes(opt) : selected === opt;

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] font-bold tracking-widest text-black/40 uppercase">{label}</span>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onSelect(opt)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-bold transition-all duration-150 active:scale-95 ${
              isActive(opt) ? "bg-[#6d17ce] text-white" : "bg-[#eeeeef] text-[rgba(12,13,16,0.65)]"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function BriefingCustomiser({
  config,
  onChange,
}: {
  config: BriefingConfig;
  onChange: (next: BriefingConfig) => void;
}) {
  const [open, setOpen] = useState(false);

  const isDirty =
    config.style !== DEFAULT_CONFIG.style ||
    config.length !== DEFAULT_CONFIG.length ||
    config.language !== DEFAULT_CONFIG.language ||
    !(config.topics.length === 1 && config.topics[0] === "All");

  const summary = [config.style, config.topics.join(", "), config.length, config.language].join(
    " · ",
  );

  function setStyle(val: string) {
    onChange({ ...config, style: val });
  }
  function setLength(val: string) {
    onChange({ ...config, length: val });
  }
  function setLanguage(val: string) {
    onChange({ ...config, language: val });
  }
  function toggleTopic(val: string) {
    if (val === "All") {
      onChange({ ...config, topics: ["All"] });
      return;
    }
    const without = config.topics.filter((t) => t !== "All");
    const next = without.includes(val) ? without.filter((t) => t !== val) : [...without, val];
    onChange({ ...config, topics: next.length === 0 ? ["All"] : next });
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-white">
      {/* Always-visible header row — tap to expand/collapse */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-4 py-3.5 transition-opacity select-none active:opacity-70"
      >
        {/* Sliders icon */}
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#f6f3ff]">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 6H20M4 12H14M4 18H9"
              stroke="#6d17ce"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="17" cy="12" r="2.5" fill="#6d17ce" />
            <circle cx="12" cy="6" r="2.5" fill="#6d17ce" />
            <circle cx="7" cy="18" r="2.5" fill="#6d17ce" />
          </svg>
        </div>

        <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
          <span className="text-[13px] font-bold text-[#0c0d10]">Customise briefing</span>
          <span className="truncate text-[11px] font-medium text-black/40">{summary}</span>
        </div>

        {/* Dirty dot */}
        {isDirty && <div className="size-2 shrink-0 rounded-full bg-[#6d17ce]" />}

        {/* Chevron */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
          className={`shrink-0 text-black/30 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Expandable body */}
      {open && (
        <>
          <div className="mx-4 h-px bg-black/[0.06]" />
          <div className="flex flex-col gap-4 px-4 pt-4 pb-4">
            <PillRow
              label="Style"
              options={STYLE_OPTIONS}
              selected={config.style}
              onSelect={setStyle}
            />
            <PillRow
              label="Topics"
              options={TOPIC_OPTIONS}
              selected={config.topics}
              multi
              onSelect={toggleTopic}
            />
            <PillRow
              label="Length"
              options={LENGTH_OPTIONS}
              selected={config.length}
              onSelect={setLength}
            />
            <PillRow
              label="Language"
              options={LANGUAGE_OPTIONS}
              selected={config.language}
              onSelect={setLanguage}
            />

            {/* Actions row */}
            <div className="flex items-center gap-2">
              {isDirty && (
                <button
                  type="button"
                  onClick={() => onChange({ ...DEFAULT_CONFIG })}
                  className="rounded-full border border-black/10 px-4 py-2.5 text-[13px] font-bold text-black/40 active:scale-95"
                >
                  Reset
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-[14px] font-bold transition-all duration-150 active:scale-[0.97] ${
                  isDirty ? "bg-[#6d17ce] text-white" : "bg-[#eeeeef] text-[rgba(12,13,16,0.65)]"
                }`}
              >
                {isDirty ? "Regenerate briefing" : "Done"}
                {isDirty && (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M5 12H19M13 6L19 12L13 18"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Sample data ───────────────────────────────────────────────────────────────

const STORIES: Story[] = [
  {
    id: "1",
    source: "The Hindu",
    sourceColor: "#c0202e",
    headline:
      "India's GDP growth accelerates to 7.8% in Q1, beats analyst forecasts by wide margin",
    summary:
      "The economy expanded faster than expected driven by strong domestic consumption and a rebound in manufacturing output.",
    timeAgo: "32m ago",
    category: "Business",
    isTop: true,
  },
  {
    id: "2",
    source: "NDTV",
    sourceColor: "#e05c00",
    headline: "Parliament monsoon session begins today amid opposition protest over key bills",
    summary:
      "Opposition parties have announced walkouts over the data protection bill and three other contentious pieces of legislation.",
    timeAgo: "1h ago",
    category: "Politics",
    isBreaking: true,
  },
  {
    id: "3",
    source: "TechCrunch",
    sourceColor: "#0078ad",
    headline: "Reliance Jio launches AI-powered personalised news feed across 450M users",
    summary:
      "The rollout uses on-device language models to surface local language stories without sending data to the cloud.",
    timeAgo: "2h ago",
    category: "Tech",
  },
  {
    id: "4",
    source: "Times of India",
    sourceColor: "#e07000",
    headline: "Supreme Court upholds reservation for OBCs in local body elections",
    summary:
      "A five-judge bench ruled unanimously that the triple test criteria must be satisfied before extending political reservations.",
    timeAgo: "3h ago",
    category: "Politics",
  },
  {
    id: "5",
    source: "Mint",
    sourceColor: "#25ab21",
    headline: "RBI keeps repo rate unchanged at 6.5% for sixth consecutive meeting",
    summary:
      "The Monetary Policy Committee cited persistent food inflation as the reason for holding rates steady despite easing core inflation.",
    timeAgo: "4h ago",
    category: "Business",
  },
  {
    id: "6",
    source: "Indian Express",
    sourceColor: "#6d17ce",
    headline:
      "India and UAE sign landmark energy and digital infrastructure pact worth ₹2.1 lakh cr",
    summary:
      "The deal covers solar energy projects, undersea cables and a fast-track visa corridor for tech professionals.",
    timeAgo: "5h ago",
    category: "World",
  },
];

const CATEGORIES = ["All", "Politics", "Business", "Tech", "Sports", "World"];

// ── Listen Button ─────────────────────────────────────────────────────────────

function ListenButton({ isPlaying, onToggle }: { isPlaying: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center gap-3 rounded-2xl bg-[#310064] px-4 py-3.5 transition-opacity select-none active:opacity-80"
    >
      {/* Waveform bars */}
      <div className="flex h-5 items-center gap-[3px]">
        {[1, 0.5, 0.8, 0.3, 0.9, 0.4, 0.7, 0.5, 1, 0.6].map((h, i) => (
          <div
            key={i}
            className="w-[3px] rounded-full bg-white"
            style={{
              height: `${Math.round(h * 20)}px`,
              opacity: isPlaying ? 1 : 0.45,
              transition: "height 0.3s ease",
              animation: isPlaying ? `wave-bar 0.8s ease-in-out ${i * 80}ms infinite` : "none",
            }}
          />
        ))}
      </div>

      {/* Label */}
      <div className="flex flex-1 flex-col items-start gap-0.5">
        <span className="text-[10px] font-bold tracking-widest text-white/60 uppercase">
          {isPlaying ? "Now playing" : "Listen to briefing"}
        </span>
        <span className="text-sm font-bold text-white">
          {isPlaying ? "Pause" : "Today · 8 stories · ~4 min"}
        </span>
      </div>

      {/* Play/pause icon */}
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/15">
        {isPlaying ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="3" y="2" width="4" height="12" rx="1.5" fill="white" />
            <rect x="9" y="2" width="4" height="12" rx="1.5" fill="white" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M5 3L13 8L5 13V3Z" fill="white" />
          </svg>
        )}
      </div>
    </button>
  );
}

// ── Story Card ────────────────────────────────────────────────────────────────

function StoryCard({ story, isTop }: { story: Story; isTop?: boolean }) {
  const [bookmarked, setBookmarked] = useState(false);

  return (
    <div
      className={`flex flex-col gap-3 rounded-2xl bg-white p-4 transition-opacity select-none active:opacity-75 ${
        isTop ? "ring-1 ring-[#6d17ce]/15" : ""
      }`}
    >
      {/* Meta row */}
      <div className="flex items-center gap-2">
        {/* Source dot + name */}
        <div
          className="size-2 shrink-0 rounded-full"
          style={{ backgroundColor: story.sourceColor }}
        />
        <span
          className="text-[10px] font-bold tracking-widest uppercase"
          style={{ color: story.sourceColor }}
        >
          {story.source}
        </span>

        {/* Breaking badge */}
        {story.isBreaking && (
          <span className="rounded-full bg-[#fa2f40] px-2 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase">
            Breaking
          </span>
        )}
        {isTop && (
          <span className="rounded-full bg-[#f6f3ff] px-2 py-0.5 text-[10px] font-bold tracking-wide text-[#6d17ce] uppercase">
            Top Story
          </span>
        )}

        {/* Time — pushed right */}
        <span className="ml-auto text-[11px] font-medium text-black/40">{story.timeAgo}</span>
      </div>

      {/* Headline */}
      <h3 className="text-[15px] leading-snug font-bold tracking-[-0.01em] text-[#0c0d10]">
        {story.headline}
      </h3>

      {/* Summary */}
      <p className="line-clamp-2 text-[13px] leading-relaxed font-medium text-black/55">
        {story.summary}
      </p>

      {/* Actions row */}
      <div className="flex items-center gap-2 pt-0.5">
        {/* Category pill */}
        <span className="rounded-full bg-[#f5f5f5] px-3 py-1 text-[11px] font-bold text-black/55">
          {story.category}
        </span>

        <div className="ml-auto flex items-center gap-1">
          {/* Bookmark */}
          <button
            type="button"
            aria-label="Bookmark"
            onClick={() => setBookmarked((b) => !b)}
            className="flex size-8 items-center justify-center rounded-full transition-colors active:scale-95"
            style={{ backgroundColor: bookmarked ? "#f6f3ff" : "#f5f5f5" }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M5 3H19C19.5523 3 20 3.44772 20 4V21L12 17L4 21V4C4 3.44772 4.44772 3 5 3Z"
                stroke={bookmarked ? "#6d17ce" : "rgba(12,13,16,0.45)"}
                strokeWidth="2"
                fill={bookmarked ? "#6d17ce" : "none"}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Share */}
          <button
            type="button"
            aria-label="Share"
            className="flex size-8 items-center justify-center rounded-full bg-[#f5f5f5] transition-colors active:scale-95"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M4 12V20C4 20.5523 4.44772 21 5 21H19C19.5523 21 20 20.5523 20 20V12M12 3V15M12 3L8 7M12 3L16 7"
                stroke="rgba(12,13,16,0.45)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function NewsBriefingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [briefingConfig, setBriefingConfig] = useState<BriefingConfig>({ ...DEFAULT_CONFIG });
  const scrollRef = useRef(false);

  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    const past = e.currentTarget.scrollTop > 8;
    if (past !== scrollRef.current) {
      scrollRef.current = past;
      setScrolled(past);
    }
  }, []);

  const filteredStories =
    activeCategory === "All" ? STORIES : STORIES.filter((s) => s.category === activeCategory);

  // Today's date
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="bg-canvas-grey text-fg relative flex h-full flex-col">
      {/* Waveform animation keyframes injected inline */}
      <style>{`
        @keyframes wave-bar {
          0%, 100% { transform: scaleY(1); }
          50%       { transform: scaleY(0.35); }
        }
      `}</style>

      <main
        className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 68px)" }}
        onScroll={handleScroll}
      >
        <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4">
          {/* Date + greeting */}
          <div className="flex flex-col gap-0.5 pt-1">
            <p className="text-[10px] font-bold tracking-widest text-black/35 uppercase">{today}</p>
            <h2 className="text-xl font-bold tracking-tight text-[#0c0d10]">
              Good morning, Shantanu
            </h2>
            <p className="text-sm font-medium text-black/55">8 stories · 4 min read</p>
          </div>

          {/* Listen button */}
          <ListenButton isPlaying={isPlaying} onToggle={() => setIsPlaying((p) => !p)} />

          {/* Briefing customiser */}
          <BriefingCustomiser config={briefingConfig} onChange={setBriefingConfig} />

          {/* Category pills */}
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-bold transition-colors active:scale-95 ${
                  activeCategory === cat
                    ? "bg-[#6d17ce] text-white"
                    : "bg-white text-[rgba(12,13,16,0.65)]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Stories */}
          <ul className="flex list-none flex-col gap-3 p-0">
            {filteredStories.map((story, i) => (
              <li key={story.id}>
                <StoryCard story={story} isTop={i === 0 && activeCategory === "All"} />
              </li>
            ))}
          </ul>

          {/* End of briefing */}
          <div className="flex flex-col items-center gap-2 py-4">
            <div className="flex size-8 items-center justify-center rounded-full bg-[#f6f3ff] text-base">
              ✓
            </div>
            <p className="text-[13px] font-medium text-black/40">You're caught up for today</p>
          </div>
        </div>
      </main>

      <HubHeader title="Daily Briefing" backHref="/news" scrolled={scrolled} />
      <HubChatInput variant="sleek" placeholder="Ask about any story…" />
    </div>
  );
}
