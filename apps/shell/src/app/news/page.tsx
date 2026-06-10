"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";

import { HubChatInput } from "@/app/jobs/design-prototype/HubChatInput";
import { HubHeader } from "@/app/jobs/design-prototype/HubHeader";

type ExperienceCard = {
  title: string;
  subtitle: string;
  href?: string;
  badge?: string;
  iconBg: string;
  icon: string;
};

const EXPERIENCE_CARDS: ExperienceCard[] = [
  {
    title: "Daily Briefing",
    subtitle: "Your morning digest · Top stories curated for you",
    href: "/news/briefing",
    iconBg: "bg-[#ecf7ff]",
    icon: "📰",
  },
  {
    title: "Breaking News",
    subtitle: "Live updates · As it happens",
    href: "/news/breaking",
    iconBg: "bg-[#fde8ea]",
    icon: "⚡",
    badge: "Live",
  },
  {
    title: "Fact Check",
    subtitle: "Verify claims · Separate fact from fiction",
    href: "/news/fact-check",
    iconBg: "bg-[#e6f7e6]",
    icon: "🔍",
  },
  {
    title: "Market Pulse",
    subtitle: "Markets · Stocks · Economy at a glance",
    href: "/news/market-pulse",
    iconBg: "bg-[#ddfef2]",
    icon: "📈",
  },
  {
    title: "Pulse of Nation",
    subtitle: "What India is talking about right now",
    href: "/news/pulse",
    iconBg: "bg-[#f6f3ff]",
    icon: "🇮🇳",
  },
];

export default function NewsPage() {
  const [scrolled, setScrolled] = useState(false);
  const scrollRef = useRef(false);

  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    const past = e.currentTarget.scrollTop > 8;
    if (past !== scrollRef.current) {
      scrollRef.current = past;
      setScrolled(past);
    }
  }, []);

  return (
    <div className="bg-canvas-grey text-fg relative flex h-full flex-col">
      <main
        className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 68px)" }}
        onScroll={handleScroll}
      >
        <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4">
          {/* Section label */}
          <p className="pt-2 text-xs font-semibold tracking-widest text-black/40 uppercase">
            Choose an experience
          </p>

          {/* Experience cards */}
          <ul className="flex list-none flex-col gap-3 p-0">
            {EXPERIENCE_CARDS.map((card) => {
              const inner = (
                <div className="flex items-center gap-3 rounded-2xl bg-white p-3 transition-opacity select-none active:opacity-70">
                  {/* Icon */}
                  <div
                    className={`flex size-12 shrink-0 items-center justify-center rounded-xl text-2xl ${card.iconBg}`}
                  >
                    {card.icon}
                  </div>

                  {/* Text */}
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold tracking-tight text-[#0c0d10]">
                        {card.title}
                      </span>
                      {card.badge && (
                        <span className="rounded-full bg-[#fa2f40] px-2 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase">
                          {card.badge}
                        </span>
                      )}
                    </div>
                    <span className="block text-sm text-black/55">{card.subtitle}</span>
                  </div>

                  {/* Chevron */}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 20 20"
                    fill="none"
                    className={`shrink-0 ${card.href ? "text-[#6d17ce]" : "text-black/20"}`}
                    aria-hidden="true"
                  >
                    <path
                      d="M7.5 3.33334L13.5774 9.41074C13.9028 9.73618 13.9028 10.2638 13.5774 10.5893L7.5 16.6667"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              );

              return (
                <li key={card.title}>
                  {card.href ? (
                    <Link href={card.href} className="block">
                      {inner}
                    </Link>
                  ) : (
                    <div className="opacity-50">{inner}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </main>

      <HubHeader title="News" backHref="/" scrolled={scrolled} />
      <HubChatInput placeholder="Ask about any news topic…" />
    </div>
  );
}
