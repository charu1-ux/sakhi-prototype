"use client";

import { type CSSProperties } from "react";

import { Avatar } from "./_components/Avatar";
import { ModeButtons } from "./_components/ModeButtons";
import { SaathiHeader } from "./_components/SaathiHeader";
import { SuggestedReplies } from "./_components/SuggestedReplies";
import { ASSETS, ROUTES, SAATHI } from "./saathi-data";
import { useLang } from "./saathi-i18n";
import { DocIcon, ImageIcon, SparkleIcon, SunIcon } from "./saathi-icons";
import { useNav } from "./use-nav";

// ── Reminders parked while Daily Briefing is WIP ──────────────────────────────
// The reminders widget + its URL auto-jump (?reminders=<filter>|empty) are
// commented out below. Restore these (and the import + state) to bring it back.
//
// import { RemindersWidget } from "./_components/RemindersWidget";
// import { type Filter } from "./reminders/reminders-data";
// const FILTERS: Filter[] = ["overdue", "today", "upcoming", "all"];
//   const [remFilter, setRemFilter] = useState<Filter | undefined>(undefined);
//   const [forceEmpty, setForceEmpty] = useState(false);
//   useEffect(() => {
//     const p = new URLSearchParams(window.location.search).get("reminders");
//     if (p === "empty") setForceEmpty(true);
//     else if (p && (FILTERS as string[]).includes(p)) setRemFilter(p as Filter);
//   }, []);
//   <RemindersWidget initialFilter={remFilter} forceEmpty={forceEmpty} />

const rise = (i: number): CSSProperties => ({
  animation: "sf-rise 0.5s cubic-bezier(0.05,0.7,0.1,1) both",
  animationDelay: `${i * 70}ms`,
});

export default function DailySaathiHome() {
  const { t } = useLang();
  const { go } = useNav();
  const name = SAATHI.firstName?.trim();

  // Quick actions → jump straight to a Kaam Ki Baat capability from home.
  // "Today's Briefing" is a muted placeholder (work in progress).
  const quickActions = [
    { label: t.briefing.pill, icon: <SunIcon className="size-4" />, onPick: () => {}, muted: true },
    {
      label: t.kaam.pills.doc,
      icon: <DocIcon className="size-4" />,
      onPick: () => go(`${ROUTES.kaam}?intent=doc`),
    },
    {
      label: t.kaam.pills.image,
      icon: <ImageIcon className="size-4" />,
      onPick: () => go(`${ROUTES.kaam}?intent=image`),
    },
  ];

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

          {/* Quick actions — shortcuts into the Kaam Ki Baat capabilities */}
          <div className="-mx-4" style={rise(2)}>
            <SuggestedReplies items={quickActions} />
          </div>

          {/* For Today — Daily Briefing placeholder (reminders parked, WIP) */}
          <div style={rise(3)}>
            <h2 className="mb-2.5 px-0.5 text-[13px] font-bold text-[#0c0d10]">{t.forToday}</h2>
            <div className="bg-surface flex items-center justify-center rounded-xl border border-[rgba(12,13,16,0.08)] px-4 py-12 text-center">
              <span className="text-[13px] text-[rgba(12,13,16,0.4)]">{t.briefing.comingSoon}</span>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes sf-rise {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
