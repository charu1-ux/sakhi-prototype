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
    title: "Music RJ",
    subtitle: "An AI radio jockey tells you stories between songs — film, singer, composer",
    href: "/music/rj",
    icon: "🎙️",
    iconBg: "bg-[#f5f3ff]",
    badge: "AI RJ",
  },
  {
    title: "Yeh Kaun Sa Gaana Hai?",
    subtitle: "Hum a line or hold up your phone — JBIQ names the song, film, singer",
    href: "/music/song-lookup",
    icon: "🎵",
    iconBg: "bg-[#fdf4ff]",
  },
];

export default function MusicPage() {
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
                          <span className="rounded-full bg-[#7c3aed] px-2 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase">
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
                      className="shrink-0 text-[#7c3aed]"
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

      <HubHeader title="Music" backHref="/" scrolled={scrolled} />
      <HubChatInput variant="sleek" placeholder="Ask RJ anything · Find a song you're humming…" />
    </div>
  );
}
