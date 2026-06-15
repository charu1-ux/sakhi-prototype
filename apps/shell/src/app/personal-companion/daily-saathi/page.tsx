"use client";

import { type CSSProperties, useEffect, useState } from "react";

import { Avatar } from "./_components/Avatar";
import { ModeButtons } from "./_components/ModeButtons";
import { RemindersWidget } from "./_components/RemindersWidget";
import { SaathiComposer } from "./_components/SaathiComposer";
import { SaathiHeader } from "./_components/SaathiHeader";
import { type Filter } from "./reminders/reminders-data";
import { ASSETS, ROUTES, SAATHI } from "./saathi-data";
import { useLang } from "./saathi-i18n";
import { SparkleIcon } from "./saathi-icons";
import { useNav } from "./use-nav";

const rise = (i: number): CSSProperties => ({
  animation: "sf-rise 0.5s cubic-bezier(0.05,0.7,0.1,1) both",
  animationDelay: `${i * 70}ms`,
});

const FILTERS: Filter[] = ["overdue", "today", "upcoming", "all"];

export default function DailySaathiHome() {
  const { t } = useLang();
  const { go } = useNav();
  const name = SAATHI.firstName?.trim();

  // Read the widget auto-jump filter from the URL (?reminders=<filter>) set on save.
  const [remFilter, setRemFilter] = useState<Filter | undefined>(undefined);
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("reminders");
    if (p && (FILTERS as string[]).includes(p)) setRemFilter(p as Filter);
  }, []);

  return (
    <div className="bg-surface-minimal relative flex h-full flex-col text-[#0c0d10]">
      <SaathiHeader />

      <main className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        <div className="mx-auto flex w-full max-w-md flex-col gap-6 pt-1 pb-2">
          {/* Greeting — namaste icon + warm welcome (PRD §3.2) */}
          <div className="flex items-center gap-3" style={rise(0)}>
            <Avatar
              src={ASSETS.namaste}
              alt="Namaste"
              fallback={<SparkleIcon className="text-primary-50 size-6" />}
              className="bg-surface-ghost-icon size-12 shrink-0 rounded-full"
            />
            <div className="min-w-0">
              <h2 className="text-headline-3xs text-[#0c0d10]">{t.greeting(name)}</h2>
              <p className="text-[14px] text-[rgba(12,13,16,0.65)]">{t.greetingSub}</p>
            </div>
          </div>

          <div style={rise(1)}>
            <ModeButtons />
          </div>

          {/* Reminders — the one live "for today" surface in this cut */}
          <div style={rise(2)}>
            <RemindersWidget initialFilter={remFilter} />
          </div>
        </div>
      </main>

      {/* Catch-all composer → companion with the input as opening message */}
      <SaathiComposer
        placeholder={t.composer}
        onSubmit={() => go(ROUTES.companion)}
        voiceFirst
        speakLabel={t.speak}
        onVoice={() => go(ROUTES.companion)}
      />

      <style>{`
        @keyframes sf-rise {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
