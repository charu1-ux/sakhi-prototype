"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { ChevronLeftIcon } from "./hub-icons";

type Props = {
  title: string;
  /** Custom title content (e.g. an avatar + name) — replaces the text title when set. */
  titleSlot?: ReactNode;
  backHref?: string;
  scrolled?: boolean;
  /** "grey" = page bg is #f5f5f5 → buttons use white. "white" = page bg is white → buttons use #f5f5f5. "transparent" = over a colored hero → white text + translucent buttons, no gradient. */
  pageBg?: "grey" | "white" | "transparent";
  rightIconSrc?: string;
  rightIconLabel?: string;
  onRightIconClick?: () => void;
  /** If set, the back button calls this instead of navigating to backHref (for in-page state transitions). */
  onBack?: () => void;
  /** Custom right-side content (e.g. a text "Skip" button) — takes precedence over rightIconSrc. */
  rightSlot?: ReactNode;
};

/**
 * Shared chat/page header. Three sanctioned shapes — composed via props, not a `variant` enum:
 *
 *   1. back + heading + right icon           →  title="…"                  rightSlot={<button/>}
 *   2. back + address + right icon           →  titleSlot={<AddressMenu/>}  rightSlot={<button/>}
 *   3. back + heading + multiple right icons →  title="…"                  rightSlot={<div className="flex items-center gap-3">…</div>}
 *
 * `title` ↔ `titleSlot` selects heading-vs-custom centre; `rightSlot` carries one OR many buttons.
 * `pageBg`: "white"=white screen · "grey"=#f5f5f5 screen · "transparent"=over a colored hero.
 */
export function HubHeader({
  title,
  titleSlot,
  backHref = "/",
  scrolled = false,
  pageBg = "grey",
  rightIconSrc,
  rightIconLabel,
  onRightIconClick,
  onBack,
  rightSlot,
}: Props) {
  const router = useRouter();
  const isTransparent = pageBg === "transparent";
  const btnBg = isTransparent
    ? "bg-white/15 text-white backdrop-blur-sm"
    : pageBg === "grey"
      ? "bg-white dark:bg-bg-elev dark:text-ink"
      : "bg-[#f5f5f5] dark:bg-bg-elev dark:text-ink";
  // pageBg="white" derives from --color-surface so the fade exactly matches the
  // screen bg in both light and dark (no hardcoded dark guess). grey stays light.
  const gradient =
    pageBg === "white"
      ? "linear-gradient(180deg, rgb(var(--color-surface)) 0%, rgb(var(--color-surface)) 73.27%, rgb(var(--color-surface) / 0.6) 86.13%, rgb(var(--color-surface) / 0) 100%)"
      : pageBg === "grey"
        ? "linear-gradient(180deg, #F5F5F5 0%, #F5F5F5 73.27%, rgba(245,245,245,0.60) 86.13%, rgba(245,245,245,0.00) 100%)"
        : "none";
  return (
    <header
      className="pointer-events-none fixed inset-x-0 top-0 z-10"
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
            if (onBack) {
              onBack();
            } else if (backHref === "/" && window.parent !== window) {
              window.parent.postMessage({ type: "jobs:navigate", href: "/" }, "*");
            } else {
              router.push(backHref);
            }
          }}
          className={`focus-visible:ring-dock-accent flex size-10 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full ring-0 outline-none focus-visible:ring-2 ${btnBg}`}
          aria-label="Back"
        >
          <ChevronLeftIcon className="size-5" />
        </button>
        {titleSlot ? (
          <div className="flex min-w-0 flex-1">{titleSlot}</div>
        ) : (
          <h1
            className={`font-jio flex-1 text-[18px] leading-normal ${
              isTransparent ? "font-semibold text-white" : "dark:text-ink font-bold text-black"
            }`}
          >
            {title}
          </h1>
        )}
        {rightSlot ? (
          <div className="shrink-0">{rightSlot}</div>
        ) : (
          rightIconSrc && (
            <button
              type="button"
              aria-label={rightIconLabel ?? "Action"}
              onClick={onRightIconClick}
              className={`focus-visible:ring-dock-accent flex size-10 shrink-0 cursor-pointer touch-manipulation appearance-none items-center justify-center overflow-hidden rounded-full ring-0 outline-none focus-visible:ring-2 ${btnBg}`}
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
          )
        )}
      </div>
    </header>
  );
}
