"use client";

import { type Lang, useLang } from "../saathi-i18n";

// Compact EN / हिं segmented toggle for the top-right of the header. Selection
// persists (localStorage) and applies across the whole Daily Saathi flow.
const OPTIONS: { value: Lang; label: string }[] = [
  { value: "en", label: "EN" },
  { value: "hi", label: "हिं" },
];

export function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div
      role="group"
      aria-label="Language"
      className="bg-surface-ghost flex shrink-0 items-center gap-0.5 rounded-full p-0.5"
    >
      {OPTIONS.map((o) => {
        const active = lang === o.value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => setLang(o.value)}
            className={`focus-visible:ring-primary-60 cursor-pointer rounded-full px-2.5 py-1 text-[12px] font-bold transition-transform duration-200 outline-none focus-visible:ring-2 focus-visible:ring-offset-1 active:scale-[0.95] ${
              active ? "bg-primary-50 text-white" : "text-[rgba(12,13,16,0.55)]"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
