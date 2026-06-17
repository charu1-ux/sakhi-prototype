"use client";

import { Avatar } from "./Avatar";
import { ASSETS, ROUTES } from "../saathi-data";
import { useLang } from "../saathi-i18n";
import { ChevronRightIcon, HeartIcon, TasksIcon } from "../saathi-icons";
import { useNav } from "../use-nav";

// The two core modes (PRD §3.3). Both cards share the SAME primary-50 fill for
// uniformity; the avatar photo in each circle is what distinguishes them.
export function ModeButtons() {
  const { t } = useLang();
  const { go } = useNav();

  const modes = [
    {
      label: t.modes.dil.label,
      sub: t.modes.dil.sub,
      href: ROUTES.companion,
      avatar: ASSETS.dilKiBaat,
      fallback: <HeartIcon className="text-primary-50 size-6" />,
    },
    {
      label: t.modes.kaam.label,
      sub: t.modes.kaam.sub,
      href: ROUTES.kaam,
      avatar: ASSETS.kaamKiBaat,
      fallback: <TasksIcon className="text-primary-50 size-6" />,
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      {modes.map((m) => (
        <button
          key={m.href}
          type="button"
          onClick={() => go(m.href)}
          className="bg-primary-50 focus-visible:ring-primary-60 flex w-full cursor-pointer items-center gap-3.5 rounded-xl p-4 text-left text-white shadow-[0_8px_24px_rgba(109,23,206,0.20)] transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] outline-none hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.97]"
        >
          <Avatar
            src={m.avatar}
            alt=""
            fallback={m.fallback}
            className="size-12 shrink-0 rounded-full bg-white"
          />
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] leading-snug font-medium">{m.label}</span>
            <span className="mt-0.5 block text-[12px] leading-snug font-normal text-white/75">
              {m.sub}
            </span>
          </span>
          <ChevronRightIcon className="size-5 shrink-0 text-white/70" />
        </button>
      ))}
    </div>
  );
}
