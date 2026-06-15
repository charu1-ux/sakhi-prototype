"use client";

import { LangToggle } from "./LangToggle";
import { ChevronLeftIcon } from "../../chat/icons";
import { useLang } from "../saathi-i18n";
import { useNav } from "../use-nav";

// Shared JDS header for the destination stub screens — back button + title +
// top-right language toggle.
export function StubHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const { t } = useLang();
  const { back } = useNav();
  return (
    <header
      className="bg-surface sticky top-0 z-10 flex shrink-0 items-center gap-2.5 px-3 pb-3"
      style={{
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 12px)",
        borderBottom: "1px solid rgba(12,13,16,0.08)",
      }}
    >
      <button
        type="button"
        aria-label={t.back}
        onClick={() => back()}
        className="bg-surface-ghost focus-visible:ring-primary-60 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#0c0d10] transition-transform duration-200 outline-none hover:scale-[1.05] focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.95]"
      >
        <ChevronLeftIcon className="size-5" />
      </button>
      <div className="min-w-0">
        <h1 className="text-title-s text-[#0c0d10]">{title}</h1>
        {subtitle && <p className="text-[12px] text-[rgba(12,13,16,0.65)]">{subtitle}</p>}
      </div>
      <div className="ml-auto">
        <LangToggle />
      </div>
    </header>
  );
}
