"use client";

import Image from "next/image";

import { ChevronLeftIcon } from "./hub-icons";

type Props = {
  title: string;
  backHref?: string;
  scrolled?: boolean;
  /** "grey" = page bg is #f5f5f5 → buttons use white. "white" = page bg is white → buttons use #f5f5f5. */
  pageBg?: "grey" | "white";
  rightIconSrc?: string;
  rightIconLabel?: string;
  onRightIconClick?: () => void;
};

export function HubHeader({
  title,
  backHref = "/",
  scrolled = false,
  pageBg = "grey",
  rightIconSrc,
  rightIconLabel,
  onRightIconClick,
}: Props) {
  const btnBg = pageBg === "grey" ? "bg-white" : "bg-[#f5f5f5]";
  const gradient =
    pageBg === "white"
      ? "linear-gradient(180deg, #ffffff 0%, #ffffff 73.27%, rgba(255,255,255,0.60) 86.13%, rgba(255,255,255,0.00) 100%)"
      : "linear-gradient(180deg, #F5F5F5 0%, #F5F5F5 73.27%, rgba(245,245,245,0.60) 86.13%, rgba(245,245,245,0.00) 100%)";
  return (
    <header
      className="pointer-events-none sticky top-0 z-10 w-full"
      style={{ height: "calc(env(safe-area-inset-top, 0px) + 60px)" }}
    >
      <div
        aria-hidden
        className="absolute inset-0 transition-all duration-300"
        style={{
          backdropFilter: scrolled ? "blur(4px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(4px)" : "none",
          background: gradient,
        }}
      />
      {/* Back button + title + optional right icon */}
      <div
        className="pointer-events-auto relative flex items-center gap-3 px-4 pb-3"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)" }}
      >
        <button
          type="button"
          onClick={() => {
            if (backHref === "/") {
              // Post message to shell to navigate to homepage (cross-origin safe)
              window.parent.postMessage({ type: "jobs:navigate", href: "/" }, "*");
            } else {
              window.location.href = backHref;
            }
          }}
          className={`flex size-10 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full outline-none ring-0 focus-visible:ring-2 focus-visible:ring-dock-accent ${btnBg}`}
          aria-label="Back"
        >
          <ChevronLeftIcon className="size-5" />
        </button>
        <h1 className="flex-1 text-[18px] font-bold leading-normal text-black">{title}</h1>
        {rightIconSrc && (
          <button
            type="button"
            aria-label={rightIconLabel ?? "Action"}
            onClick={onRightIconClick}
            className={`flex size-10 shrink-0 cursor-pointer appearance-none items-center justify-center overflow-hidden rounded-full outline-none ring-0 touch-manipulation focus-visible:ring-2 focus-visible:ring-dock-accent ${btnBg}`}
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
