"use client";

import type { ReactNode } from "react";

// Tappable "suggested reply" chips that drive a scripted conversation forward.
// Mirrors the JDS quick-reply pattern: outline pill, primary text, gentle
// press-scale. Used by the Kaam Ki Baat reminder/doc/image stories so the demo
// advances turn-by-turn on a tap (the user can still type freely instead).
export type Suggestion = {
  label: string;
  icon?: ReactNode;
  onPick: () => void;
  // Muted = grey, non-interactive placeholder (e.g. a work-in-progress action).
  muted?: boolean;
};

export function SuggestedReplies({ items }: { items: Suggestion[] }) {
  if (items.length === 0) return null;
  return (
    <div className="flex gap-2 overflow-x-auto px-4 pt-3 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {items.map((s) =>
        s.muted ? (
          <span
            key={s.label}
            aria-disabled
            className="bg-surface-ghost flex shrink-0 cursor-default items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-medium text-[rgba(12,13,16,0.45)]"
          >
            {s.icon}
            <span className="whitespace-nowrap">{s.label}</span>
          </span>
        ) : (
          <button
            key={s.label}
            type="button"
            onClick={s.onPick}
            className="border-primary-50/30 bg-surface text-primary-50 focus-visible:ring-primary-60 flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 py-2 text-[13px] font-medium transition-transform duration-200 outline-none hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-offset-1 active:scale-[0.96]"
          >
            {s.icon}
            <span className="whitespace-nowrap">{s.label}</span>
          </button>
        ),
      )}
    </div>
  );
}
