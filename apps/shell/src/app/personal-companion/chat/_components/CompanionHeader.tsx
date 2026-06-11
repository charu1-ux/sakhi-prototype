"use client";

import { CompanionAvatar } from "./CompanionAvatar";
import { ChevronLeftIcon, DotsIcon, PhoneIcon } from "../icons";
import { COMPANION, UI, type UiLanguage } from "../companion-data";

type Props = {
  uiLanguage: UiLanguage;
  onBack: () => void;
  onCall: () => void;
  onMenu: () => void;
};

export function CompanionHeader({ uiLanguage, onBack, onCall, onMenu }: Props) {
  const t = UI[uiLanguage];
  return (
    <header
      className="relative z-10 flex shrink-0 items-center gap-2.5 border-b border-[rgba(12,13,16,0.08)] bg-white px-3 pb-2.5"
      style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 10px)" }}
    >
      <button
        type="button"
        onClick={onBack}
        aria-label="Back"
        className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#f5f5f5] text-[#0c0d10] transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] outline-none focus-visible:ring-2 focus-visible:ring-[#8B2FE8] active:scale-[0.92]"
      >
        <ChevronLeftIcon className="size-5" />
      </button>

      <CompanionAvatar size={40} showActiveDot />

      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <span className="truncate text-[16px] leading-tight font-bold text-[#0c0d10]">
          {COMPANION.name}
        </span>
        <span className="flex items-center gap-1.5 truncate text-[12px] leading-tight text-[rgba(12,13,16,0.6)]">
          {t.statusFriend}
          <span className="inline-block size-1.5 rounded-full bg-[#25ab21]" aria-hidden="true" />
          {t.activeNow}
        </span>
      </div>

      {/* Call is the headline action — a prominent purple pill (call-first product). */}
      <button
        type="button"
        onClick={onCall}
        className="flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-[#6d17ce] pr-3.5 pl-3 text-white transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] outline-none focus-visible:ring-2 focus-visible:ring-[#8B2FE8] focus-visible:ring-offset-2 active:scale-[0.97]"
        aria-label={t.call}
      >
        <PhoneIcon className="size-[18px]" />
        <span className="text-[14px] font-bold">{t.call}</span>
      </button>

      <button
        type="button"
        onClick={onMenu}
        aria-label="Menu"
        className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#f5f5f5] text-[#0c0d10] transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] outline-none focus-visible:ring-2 focus-visible:ring-[#8B2FE8] active:scale-[0.92]"
      >
        <DotsIcon className="size-5" />
      </button>
    </header>
  );
}
