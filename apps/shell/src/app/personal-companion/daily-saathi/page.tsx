"use client";

import { type CSSProperties, type ReactNode } from "react";

import { Avatar } from "./_components/Avatar";
import { SaathiHeader } from "./_components/SaathiHeader";
import { ASSETS, ROUTES, SAATHI } from "./saathi-data";
import { useLang } from "./saathi-i18n";
import { DocIcon, ImageIcon, MicIcon, SparkleIcon, SunIcon } from "./saathi-icons";
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

// A square use-case tile. Tapping a live tile deep-links into the Kaam Ki Baat
// chat with that capability as the chat header; the muted tile is a WIP stub.
function UseCaseTile({
  icon,
  label,
  onPick,
  muted = false,
}: {
  icon: ReactNode;
  label: string;
  onPick?: () => void;
  muted?: boolean;
}) {
  if (muted) {
    return (
      <span
        aria-disabled
        className="bg-surface-minimal relative flex aspect-square cursor-default flex-col items-center justify-center gap-2 rounded-2xl border border-[rgba(12,13,16,0.06)] px-2 text-center"
      >
        <span className="bg-surface-ghost absolute top-2 right-2 rounded-full px-2 py-0.5 text-[9px] font-medium text-[rgba(12,13,16,0.45)]">
          Soon
        </span>
        <span className="text-[rgba(12,13,16,0.35)]">{icon}</span>
        <span className="text-[11px] leading-tight text-[rgba(12,13,16,0.4)]">{label}</span>
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={onPick}
      className="bg-surface focus-visible:ring-primary-60 flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-[rgba(12,13,16,0.08)] px-2 text-center transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] outline-none hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.96]"
    >
      <span className="text-primary-50">{icon}</span>
      <span className="text-[11px] leading-tight text-[#0c0d10]">{label}</span>
    </button>
  );
}

export default function DailySaathiHome() {
  const { t } = useLang();
  const { go } = useNav();
  const name = SAATHI.firstName?.trim();

  return (
    <div className="bg-surface-minimal relative flex h-full flex-col text-[#0c0d10]">
      <SaathiHeader />

      <main className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
        <div className="mx-auto flex w-full max-w-md flex-col">
          {/* Greeting — warm, two-line companion welcome */}
          <div className="px-1 pt-2" style={rise(0)}>
            <h2 className="text-[22px] leading-snug font-medium text-[#0c0d10]">
              {t.home.hi(name)}
            </h2>
            <p className="text-[22px] leading-snug font-normal text-[rgba(12,13,16,0.5)]">
              {t.home.how}
            </p>
          </div>

          {/* Companion — static avatar with calm pulsing rings */}
          <div
            className="relative flex h-52 items-center justify-center"
            style={rise(1)}
            aria-hidden="true"
          >
            <span className="ds-ring border-primary-50/15 absolute size-44 rounded-full border" />
            <span className="ds-ring border-primary-50/15 absolute size-44 rounded-full border [animation-delay:1.1s]" />
            <span className="ds-ring border-primary-50/15 absolute size-44 rounded-full border [animation-delay:2.2s]" />
            <span className="bg-primary-20 absolute size-36 rounded-full" />
            <Avatar
              src={ASSETS.dilKiBaat}
              alt=""
              fallback={<SparkleIcon className="text-primary-50 size-12" />}
              className="bg-primary-30 relative size-28 rounded-full"
            />
          </div>

          {/* Talk to me — primary CTA into Dil Ki Baat */}
          <div className="flex flex-col items-center gap-1.5" style={rise(2)}>
            <button
              type="button"
              onClick={() => go(ROUTES.companion)}
              className="bg-primary-50 focus-visible:ring-primary-60 inline-flex cursor-pointer items-center gap-2 rounded-full px-6 py-3 text-[15px] font-medium text-white shadow-[0_8px_24px_rgba(109,23,206,0.22)] transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] outline-none hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.96]"
            >
              <MicIcon className="size-[18px]" />
              {t.home.talk}
            </button>
            <span className="text-[11px] text-[rgba(12,13,16,0.4)]">{t.home.opensDil}</span>
          </div>

          {/* Use-case tiles → open the Kaam Ki Baat chat on that capability */}
          <div className="mt-7 grid grid-cols-3 gap-2.5" style={rise(3)}>
            <UseCaseTile
              icon={<DocIcon className="size-6" />}
              label={t.kaam.pills.doc}
              onPick={() => go(`${ROUTES.kaam}?intent=doc`)}
            />
            <UseCaseTile
              icon={<ImageIcon className="size-6" />}
              label={t.kaam.pills.image}
              onPick={() => go(`${ROUTES.kaam}?intent=image`)}
            />
            <UseCaseTile icon={<SunIcon className="size-6" />} label={t.briefing.pill} muted />
          </div>

          {/* For Today — Daily Briefing placeholder (reminders parked, WIP) */}
          <div className="mt-7" style={rise(4)}>
            <h2 className="mb-2.5 px-0.5 text-[13px] font-bold text-[#0c0d10]">{t.forToday}</h2>
            <div className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed border-[rgba(12,13,16,0.14)] bg-[rgba(12,13,16,0.015)] px-4 py-9 text-center">
              <SparkleIcon className="size-6 text-[rgba(12,13,16,0.3)]" />
              <span className="text-[12px] text-[rgba(12,13,16,0.45)]">
                {t.briefing.comingSoon}
              </span>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes sf-rise {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ds-ring {
          0%   { transform: scale(0.82); opacity: 0.85; }
          70%  { opacity: 0.12; }
          100% { transform: scale(1.18); opacity: 0; }
        }
        .ds-ring { animation: ds-ring 3.4s ease-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .ds-ring { animation: none; opacity: 0.18; }
        }
      `}</style>
    </div>
  );
}
