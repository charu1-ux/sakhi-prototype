"use client";

import { Avatar } from "./Avatar";
import { LangToggle } from "./LangToggle";
import { ChevronLeftIcon } from "../../chat/icons";
import { ASSETS } from "../saathi-data";
import { useLang } from "../saathi-i18n";
import { SparkleIcon } from "../saathi-icons";
import { useNav } from "../use-nav";

// Daily Saathi root header — back to the app home (seamless nav, mirroring the
// Dil Ki Baat header) + title + a top-right language toggle. Mobile-first 40px
// touch targets.
export function SaathiHeader() {
  const { t } = useLang();
  const { appHome } = useNav();
  return (
    <header
      className="bg-surface-minimal sticky top-0 z-10 flex shrink-0 items-center gap-2.5 px-3 pb-2.5"
      style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 10px)" }}
    >
      <button
        type="button"
        aria-label={t.back}
        onClick={appHome}
        className="bg-surface focus-visible:ring-primary-60 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#0c0d10] transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] outline-none hover:scale-[1.05] focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.92]"
      >
        <ChevronLeftIcon className="size-5" />
      </button>
      <Avatar
        src={ASSETS.dailySaathi}
        alt=""
        fallback={<SparkleIcon className="text-primary-50 size-[18px]" />}
        className="bg-surface-ghost-icon size-8 shrink-0 rounded-full"
      />
      <h1 className="text-title-m text-[#0c0d10]">{t.appTitle}</h1>
      <div className="ml-auto">
        <LangToggle />
      </div>
    </header>
  );
}
