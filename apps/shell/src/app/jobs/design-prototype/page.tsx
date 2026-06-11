"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";

import { ActivityCardStack, ExpandedOverlay } from "./ActivityCardStack";
import { HubChatInput } from "./HubChatInput";
import { HubHeader } from "./HubHeader";
import { SkillsEarned } from "./SkillsEarned";
import { HOME_ASSETS, HUB_CARDS } from "./hub-data";

export default function DesignPrototypePage() {
  const [cardsExpanded, setCardsExpanded] = useState(false);
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
      {/*
       * Scrollable content fills the whole column.
       * The header overlay sits absolutely on top, so content scrolls under it.
       */}
      <main
        className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 68px)" }}
        onScroll={handleScroll}
      >
        <div className="mx-auto flex w-full max-w-md flex-col gap-6">
          <ActivityCardStack onExpand={() => setCardsExpanded(true)} />
          <ul className="flex list-none flex-col gap-3 p-0">
            {HUB_CARDS.map((card) => {
              const inner = (
                <div className="flex gap-3 rounded-2xl bg-white p-2 transition-opacity select-none active:opacity-70">
                  <div className="h-20 w-[108px] shrink-0 overflow-hidden rounded-xl bg-white">
                    <Image
                      src={card.thumbnail}
                      alt=""
                      width={108}
                      height={80}
                      className="pointer-events-none size-full object-cover"
                      sizes="108px"
                      unoptimized
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
                    <span className="text-fg block text-sm leading-normal font-medium tracking-normal">
                      {card.title}
                    </span>
                    <span className="text-fg-muted block text-sm leading-snug">
                      {card.subtitle}
                    </span>
                  </div>
                  <Image
                    src={`${HOME_ASSETS}/chevron-right.svg`}
                    alt=""
                    width={16}
                    height={16}
                    className="pointer-events-none mt-px size-4 shrink-0 self-center"
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
          <SkillsEarned />
        </div>
      </main>

      <HubHeader title="Hi, Samyak" scrolled={scrolled} />

      {cardsExpanded && <ExpandedOverlay onClose={() => setCardsExpanded(false)} />}

      <HubChatInput variant="sleek" />
    </div>
  );
}
