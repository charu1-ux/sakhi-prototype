"use client";

import { PhoneIcon } from "../icons";
import { QUICK_CHIPS, type UiLanguage } from "../companion-data";

type Props = {
  uiLanguage: UiLanguage;
  onPick: (label: string) => void;
  onCall: () => void;
};

// Emotion scaffolding chips, shown above the composer while the input is empty.
export function QuickChips({ uiLanguage, onPick, onCall }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {QUICK_CHIPS[uiLanguage].map((chip) => (
        <button
          key={chip.id}
          type="button"
          onClick={() => (chip.isCall ? onCall() : onPick(chip.label))}
          className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-[#6d17ce] bg-white px-3 py-1.5 text-[13px] font-medium whitespace-nowrap text-[#6d17ce] transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] outline-none focus-visible:ring-2 focus-visible:ring-[#8B2FE8] active:scale-[0.97]"
        >
          {chip.isCall && <PhoneIcon className="size-3.5" />}
          {chip.emoji && (
            <span className="text-[15px] leading-none" aria-hidden>
              {chip.emoji}
            </span>
          )}
          {chip.label}
        </button>
      ))}
    </div>
  );
}
