"use client";

import { CompanionAvatar } from "./CompanionAvatar";
import { ChevronLeftIcon, PhoneIcon, PrivacyIcon } from "../icons";
import { COMPANION, UI, type UiLanguage } from "../companion-data";

type Props = {
  uiLanguage: UiLanguage;
  onBack: () => void;
  onCall: () => void;
  /** Opens the profile sheet — triggered by tapping the name/title. */
  onTitleClick: () => void;
  privateMode: boolean;
  /** Toggles private mode on (from normal) / off (from private). */
  onTogglePrivate: () => void;
  /** Private mode can only be entered before the chat has started. */
  canEnterPrivate: boolean;
};

export function CompanionHeader({
  uiLanguage,
  onBack,
  onCall,
  onTitleClick,
  privateMode,
  onTogglePrivate,
  canEnterPrivate,
}: Props) {
  const t = UI[uiLanguage];

  return (
    <header
      className={`relative z-10 flex shrink-0 items-center gap-2.5 border-b px-3 pb-2.5 ${
        privateMode ? "border-[#e4dbff] bg-[#f6f3ff]" : "border-[rgba(12,13,16,0.08)] bg-white"
      }`}
      style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 10px)" }}
    >
      {/* In private mode, Back exits private → normal chat (no separate close). */}
      <button
        type="button"
        onClick={privateMode ? onTogglePrivate : onBack}
        aria-label={privateMode ? "Exit private chat" : "Back"}
        className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white text-[#0c0d10] transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] outline-none focus-visible:ring-2 focus-visible:ring-[#8B2FE8] active:scale-[0.92]"
      >
        <ChevronLeftIcon className="size-5" />
      </button>

      {/* Identity — keeps the Dil Ki Baat presence; tap opens the profile. */}
      <button
        type="button"
        onClick={onTitleClick}
        aria-label={`${COMPANION.name} — profile`}
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 rounded-2xl py-0.5 pr-2 text-left transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] outline-none focus-visible:ring-2 focus-visible:ring-[#8B2FE8] active:scale-[0.99]"
      >
        <CompanionAvatar size={40} showActiveDot />
        <span className="flex min-w-0 flex-col justify-center">
          <span className="truncate text-[16px] leading-tight font-bold text-[#0c0d10]">
            {COMPANION.name}
          </span>
          {privateMode ? (
            <span className="flex items-center gap-1 truncate text-[12px] leading-tight font-medium text-[#6d17ce]">
              <PrivacyIcon className="size-4" filled />
              {t.privateChat} · {t.notSaved}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 truncate text-[12px] leading-tight text-[rgba(12,13,16,0.6)]">
              {t.statusFriend}
              <span
                className="inline-block size-1.5 rounded-full bg-[#25ab21]"
                aria-hidden="true"
              />
              {t.activeNow}
            </span>
          )}
        </span>
      </button>

      {/* Call is available in every mode (private or not). */}
      <button
        type="button"
        onClick={onCall}
        className="flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-[#6d17ce] pr-3.5 pl-3 text-white transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] outline-none focus-visible:ring-2 focus-visible:ring-[#8B2FE8] focus-visible:ring-offset-2 active:scale-[0.97]"
        aria-label={t.call}
      >
        <PhoneIcon className="size-[18px]" />
        <span className="text-[14px] font-bold">{t.call}</span>
      </button>

      {/* Private toggle only before the chat has started (and not already private). */}
      {!privateMode && canEnterPrivate && (
        <button
          type="button"
          onClick={onTogglePrivate}
          aria-label={t.privateChat}
          className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#f5f5f5] text-[#0c0d10] transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] outline-none focus-visible:ring-2 focus-visible:ring-[#8B2FE8] active:scale-[0.92]"
        >
          <PrivacyIcon className="size-[22px]" />
        </button>
      )}
    </header>
  );
}
