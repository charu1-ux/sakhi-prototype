"use client";

import Image from "next/image";

import { ChevronLeftIcon } from "./hub-icons";

type Props = {
  title: string;
  backHref?: string;
  scrolled?: boolean;
  rightIconSrc?: string;
  rightIconLabel?: string;
  onRightIconClick?: () => void;
};

export function HubHeader({
  title,
  backHref = "/",
  scrolled = false,
  rightIconSrc,
  rightIconLabel,
  onRightIconClick,
}: Props) {
  return (
    <header
      className="pointer-events-none absolute inset-x-0 top-0 z-10"
      style={{ height: "calc(env(safe-area-inset-top, 0px) + 60px)" }}
    >
      {/* Background — solid at rest, gradient + blur on scroll */}
      <div
        aria-hidden
        className="absolute inset-0 transition-all duration-300"
        style={{
          backdropFilter: scrolled ? "blur(4px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(4px)" : "none",
          background:
            "linear-gradient(180deg, #F5F5F5 0%, #F5F5F5 73.27%, rgba(245,245,245,0.60) 86.13%, rgba(245,245,245,0.00) 100%)",
        }}
      />
      {/* Back button + title + optional right icon */}
      <div
        className="pointer-events-auto relative flex items-center gap-3 px-4 pb-3"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)" }}
      >
        <a
          href={backHref}
          className="flex size-8 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-[#f5f5f5] outline-none ring-0 no-underline focus-visible:ring-2 focus-visible:ring-dock-accent"
          aria-label="Back"
        >
          <ChevronLeftIcon className="size-[19px]" />
        </a>
        <h1 className="flex-1 text-[18px] font-bold leading-normal text-black">{title}</h1>
        {rightIconSrc && (
          <button
            type="button"
            aria-label={rightIconLabel ?? "Action"}
            onClick={onRightIconClick}
            className="flex size-8 shrink-0 cursor-pointer appearance-none items-center justify-center overflow-hidden rounded-full bg-[#f5f5f5] outline-none ring-0 touch-manipulation focus-visible:ring-2 focus-visible:ring-dock-accent"
          >
            <Image
              src={rightIconSrc}
              alt=""
              width={20}
              height={20}
              className="size-5"
              unoptimized
            />
          </button>
        )}
      </div>
    </header>
  );
}
