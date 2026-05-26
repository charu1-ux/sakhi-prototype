"use client";

import Image from "next/image";
import Link from "next/link";

import { ActivityCardStack } from "./ActivityCardStack";
import { DESIGN_ASSETS_PREFIX, HUB_CARDS } from "./hub-data";
import { ChevronLeftIcon, HubAddIcon, HubSpeakIcon } from "./hub-icons";

export default function DesignPrototypePage() {
  return (
    <div className="bg-gray-50 flex h-dvh max-h-dvh flex-col overflow-hidden text-fg">
      <main className="bg-gray-50 min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-4 pb-4 pt-4">
        <div className="mx-auto flex w-full max-w-md flex-col gap-6">
          <header className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="active:scale-[0.97] text-fg shadow-flat flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white outline-none ring-0 focus-visible:ring-2 focus-visible:ring-dock-accent"
              aria-label="Back"
            >
              <ChevronLeftIcon />
            </button>
            <h1 className="text-[22px] font-medium leading-none">Hi, Samyak</h1>
          </header>
          <ActivityCardStack />
          <div className="flex flex-col gap-3 shadow-flat">
            <p className="text-base leading-snug">
              Good afternoon, it&apos;s great to see your here!
            </p>
            <ul className="flex list-none flex-col gap-3 p-0">
              {HUB_CARDS.map((card) => (
                <li key={card.href}>
                  <Link
                    href={card.href}
                    className="active:scale-[0.994] backdrop-blur-sm flex gap-3 rounded-2xl bg-white p-2 shadow-flat outline-none ring-0 no-underline focus-visible:ring-2 focus-visible:ring-dock-accent"
                  >
                    <div className="bg-white h-20 w-[108px] shrink-0 overflow-hidden rounded-xl">
                      <Image
                        src={card.thumbnail}
                        alt=""
                        width={108}
                        height={80}
                        className="size-full object-cover"
                        sizes="108px"
                        unoptimized
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
                      <span className="text-fg block text-base tracking-normal">{card.title}</span>
                      <span className="text-fg-muted block text-sm leading-snug">
                        {card.subtitle}
                      </span>
                    </div>
                    <Image
                      src={`${DESIGN_ASSETS_PREFIX}/chevron-right.svg`}
                      alt=""
                      width={16}
                      height={16}
                      className="mt-px size-4 shrink-0 self-center"
                      unoptimized
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
      <footer
        role="contentinfo"
        className="flex w-full shrink-0 flex-col bg-white shadow-flat outline-none ring-0"
      >
        <div className="flex w-full min-w-0 items-center gap-1.5 bg-white px-4 py-3 shadow-flat">
          <button
            type="button"
            aria-label="Add"
            className="flex size-10 shrink-0 cursor-pointer appearance-none items-center justify-center rounded-full bg-indigo-700 text-white outline-none ring-0 shadow-flat touch-manipulation focus-visible:ring-2 focus-visible:ring-indigo-700/60"
          >
            <HubAddIcon className="pointer-events-none size-5 shrink-0 text-white" />
          </button>
          <div className="flex h-10 min-h-10 min-w-0 flex-1 cursor-text items-center overflow-hidden rounded-full bg-gray-100 p-3.5 shadow-flat">
            <input
              type="text"
              placeholder="Ask me anything"
              aria-label="Ask me anything"
              autoComplete="off"
              className="text-fg placeholder:text-fg/65 min-h-0 w-full min-w-0 flex-1 border-none bg-transparent text-base leading-5 outline-none ring-0"
            />
          </div>
          <button
            type="button"
            className="flex h-10 min-h-10 shrink-0 cursor-pointer appearance-none items-center gap-1.25 rounded-full bg-indigo-700 px-3 text-base font-normal text-white outline-none ring-0 shadow-flat touch-manipulation focus-visible:ring-2 focus-visible:ring-indigo-700/60"
            aria-label="Speak"
          >
            <HubSpeakIcon className="pointer-events-none size-5 shrink-0 text-white" />
            <span className="shrink-0 whitespace-nowrap text-white">Speak</span>
          </button>
        </div>
        <div className="relative h-chat-home-strip w-full shrink-0 bg-white" aria-hidden>
          <div className="bg-fg absolute bottom-2 left-1/2 h-1.25 w-36 -translate-x-1/2 rounded-full" />
        </div>
      </footer>
    </div>
  );
}
