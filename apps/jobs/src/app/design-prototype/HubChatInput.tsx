"use client";

import Image from "next/image";

import { HOME_ASSETS } from "./hub-data";

type Props = {
  placeholder?: string;
  onAdd?: () => void;
  onSpeak?: () => void;
};

export function HubChatInput({ placeholder = "Ask me anything", onAdd, onSpeak }: Props) {
  return (
    <footer
      className="shrink-0 w-full bg-white"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center gap-[6px] px-4 py-3">
        {/* Add button — light purple circle */}
        <button
          type="button"
          aria-label="Add"
          onClick={onAdd}
          className="flex size-10 shrink-0 cursor-pointer appearance-none items-center justify-center overflow-hidden rounded-full touch-manipulation outline-none focus-visible:ring-2 focus-visible:ring-dock-accent/40"
          style={{ backgroundColor: "#f0e8fa" }}
        >
          <Image
            src={`${HOME_ASSETS}/add.svg`}
            alt=""
            width={20}
            height={20}
            className="pointer-events-none size-5"
            unoptimized
          />
        </button>

        {/* Text input — grey pill */}
        <div
          className="flex h-10 flex-1 min-w-0 items-center overflow-hidden rounded-full px-[14px]"
          style={{ backgroundColor: "#f5f5f5" }}
        >
          <input
            type="text"
            placeholder={placeholder}
            aria-label={placeholder}
            autoComplete="off"
            className="min-w-0 w-full border-none bg-transparent text-base leading-5 outline-none ring-0"
            style={{ color: "rgba(0,0,0,0.65)" }}
          />
        </div>

        {/* Speak button — dark purple pill */}
        <button
          type="button"
          aria-label="Speak"
          onClick={onSpeak}
          className="flex h-10 shrink-0 cursor-pointer appearance-none items-center gap-[5px] overflow-hidden rounded-full px-3 touch-manipulation outline-none focus-visible:ring-2 focus-visible:ring-dock-accent/40"
          style={{ backgroundColor: "#3e0084" }}
        >
          <Image
            src={`${HOME_ASSETS}/speak.svg`}
            alt=""
            width={20}
            height={20}
            className="pointer-events-none size-5"
            unoptimized
          />
          <span className="whitespace-nowrap text-base text-white leading-normal">Speak</span>
        </button>
      </div>
    </footer>
  );
}
