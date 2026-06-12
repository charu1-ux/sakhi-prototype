"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";

import { HubChatInput } from "@/app/jobs/design-prototype/HubChatInput";
import { HubHeader } from "@/app/jobs/design-prototype/HubHeader";

type ExperienceCard = {
  title: string;
  subtitle: string;
  href: string;
  icon: string;
  iconBg: string;
  badge?: string;
};

const CARDS: ExperienceCard[] = [
  {
    title: "Cricket Banter",
    subtitle: "Wicket falls → 20s → a clip ready to share",
    href: "/jokes/cricket-banter",
    icon: "🏏",
    iconBg: "bg-[#ecf7ff]",
    badge: "Live",
  },
  {
    title: "On-demand Joke",
    subtitle: "Ask for any joke · Audio, image, or video clip back",
    href: "/jokes/on-demand",
    icon: "😂",
    iconBg: "bg-[#fff7ed]",
  },
  {
    title: "Voice Meme Clip",
    subtitle: "Make a clip about any trending topic",
    href: "/jokes/meme-clip",
    icon: "🎭",
    iconBg: "bg-[#fdf4ff]",
  },
  {
    title: "Clean Family Humour",
    subtitle: "Pappu, Sardar, classics · Safe for 7 to 70",
    href: "/jokes/family",
    icon: "👨‍👩‍👧‍👦",
    iconBg: "bg-[#f0fdf4]",
  },
  {
    title: "Regional Language Jokes",
    subtitle: "Bhojpuri, Marathi, Tamil · Written for locals",
    href: "/jokes/regional",
    icon: "🗺️",
    iconBg: "bg-[#fef3c7]",
  },
];

export default function JokesPage() {
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
          <p className="pt-2 text-xs font-semibold tracking-widest text-black/40 uppercase">
            Choose an experience
          </p>
          <ul className="flex list-none flex-col gap-3 p-0">
            {CARDS.map((card) => (
              <li key={card.title}>
                <Link href={card.href} className="block">
                  <div className="flex items-center gap-3 rounded-2xl bg-white p-3 transition-opacity select-none active:opacity-70">
                    <div
                      className={`flex size-12 shrink-0 items-center justify-center rounded-xl text-2xl ${card.iconBg}`}
                    >
                      {card.icon}
                    </div>
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
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 20 20"
                      fill="none"
                      className="shrink-0 text-[#ea580c]"
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
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>

      <HubHeader title="Jokes" backHref="/" scrolled={scrolled} />
      <HubChatInput variant="sleek" placeholder="Ask for a joke, meme, or banter clip…" />
    </div>
  );
}
