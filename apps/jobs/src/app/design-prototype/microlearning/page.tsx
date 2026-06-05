"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";

import { ActivityCardStack, ExpandedOverlay } from "../ActivityCardStack";
import { HubChatInput } from "../HubChatInput";
import { HubHeader } from "../HubHeader";
import { SkillsEarned } from "../SkillsEarned";
import { HOME_ASSETS, JOBS_APP_BASE_PATH, MICROLEARN_ASSETS } from "../hub-data";

// ── Microlearning topic cards ─────────────────────────────────────────────────

type TopicCard = {
  title: string;
  subtitle: string;
  /** Tailwind bg utility for the icon slot */
  iconBg: string;
  iconSrc: string;
  href?: string;
};

const TOPIC_CARDS: TopicCard[] = [
  {
    title: "Creator",
    subtitle: "Hooks · Titles · Thumbnails · Edits",
    iconBg: "bg-blue-50",
    iconSrc: `${MICROLEARN_ASSETS}/creator.svg`,
    href: `${JOBS_APP_BASE_PATH}/design-prototype/microlearning/creator/`,
  },
  {
    title: "Shopkeeper",
    subtitle: "WhatsApp · Inventory · POS",
    iconBg: "bg-violet-50",
    iconSrc: `${MICROLEARN_ASSETS}/shopkeeper.svg`,
  },
  {
    title: "Office",
    subtitle: "Excel · Email · Slides",
    iconBg: "bg-teal-50",
    iconSrc: `${MICROLEARN_ASSETS}/office.svg`,
  },
  {
    title: "AI fluency",
    subtitle: "ChatGPT · Image gen · Voice",
    iconBg: "bg-sky-50",
    iconSrc: `${MICROLEARN_ASSETS}/ai.svg`,
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MicrolearningPage() {
  const [scrolled, setScrolled] = useState(false);
  const [cardsExpanded, setCardsExpanded] = useState(false);
  const scrollRef = useRef(false);

  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    const past = e.currentTarget.scrollTop > 8;
    if (past !== scrollRef.current) {
      scrollRef.current = past;
      setScrolled(past);
    }
  }, []);

  return (
    <div className="relative flex h-full flex-col bg-canvas-grey text-fg">
      <HubHeader
        title="Microlearning"
        backHref={`${JOBS_APP_BASE_PATH}/design-prototype/`}
        scrolled={scrolled}
      />
      <main
        className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto pb-4 pt-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onScroll={handleScroll}
      >
        <div className="flex w-full flex-col gap-6">
          {/* Continue where you left off */}
          <div className="px-4">
            <ActivityCardStack onExpand={() => setCardsExpanded(true)} />
          </div>

          {/* Topic cards */}
          <ul className="flex list-none flex-col gap-3 p-0 px-4 select-none">
            {TOPIC_CARDS.map((card) => {
              const inner = (
                <div className="flex items-center gap-3 rounded-2xl bg-white p-3 active:opacity-70 transition-opacity">
                  <div
                    className={`flex size-12 shrink-0 items-center justify-center rounded-md p-3 ${card.iconBg}`}
                  >
                    <Image
                      src={card.iconSrc}
                      alt=""
                      width={24}
                      height={24}
                      className="size-6 pointer-events-none"
                      unoptimized
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <span className="block text-base tracking-[-0.32px] text-activity-percent">
                      {card.title}
                    </span>
                    <span className="block text-sm text-black/65">{card.subtitle}</span>
                  </div>
                  <Image
                    src={`${HOME_ASSETS}/chevron-right.svg`}
                    alt=""
                    width={16}
                    height={16}
                    className="size-4 shrink-0 pointer-events-none"
                    unoptimized
                  />
                </div>
              );
              return (
                <li key={card.title}>
                  {card.href ? (
                    <div
                      className="cursor-pointer"
                      onClick={() => {
                        window.location.href = card.href!;
                      }}
                    >
                      {inner}
                    </div>
                  ) : (
                    inner
                  )}
                </li>
              );
            })}
          </ul>

          <div className="px-4">
            <SkillsEarned />
          </div>
        </div>
      </main>

      {cardsExpanded && <ExpandedOverlay onClose={() => setCardsExpanded(false)} />}

      <HubChatInput />
    </div>
  );
}
