"use client";

import Image from "next/image";
import { useState } from "react";

import { HOME_ASSETS } from "./hub-data";

type ResumeCard = {
  id: number;
  title: string;
  percent: number;
  steps?: string;
  tier: "front" | "mid" | "back";
};

const RESUME_CARDS: ResumeCard[] = [
  { id: 1, title: "Youtube hook pattern", percent: 76, steps: "Step 3/5", tier: "front" },
  { id: 2, title: "Micro Learning", percent: 60, tier: "mid" },
  { id: 3, title: "Reels script writing", percent: 40, tier: "back" },
];

const LEARNING_ICON_SRC = `${HOME_ASSETS}/learning.svg`;

const PEEK_PX = 6;
const OVERLAP_REM = 3.125;
const STUB_HEIGHT = `${OVERLAP_REM + PEEK_PX / 16}rem`;

const TIER_BG: Record<ResumeCard["tier"], string> = {
  front: "bg-white",
  mid: "bg-white",
  back: "bg-white",
};

const CARD_STYLE = {
  border: "1px solid #F0F0F0",
} as const;

function CardContent({ card }: { card: ResumeCard }) {
  return (
    <>
      <div className="flex min-w-0 flex-[75] flex-col gap-2">
        <div className="flex items-center gap-1.5">
          <span className="relative inline-flex size-[length:var(--size-activity-guide-icon)] shrink-0">
            <Image
              src={LEARNING_ICON_SRC}
              alt=""
              width={18}
              height={18}
              className="pointer-events-none size-[length:var(--size-activity-guide-icon)]"
              unoptimized
            />
          </span>
          <p className="text-activity-resume-fg m-0 truncate text-[length:var(--font-size-activity-title)] leading-normal font-normal">
            {card.title}
          </p>
        </div>
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-black/10"
          role="presentation"
          aria-hidden
        >
          <div
            style={{
              width: `${card.percent}%`,
              background: "linear-gradient(90deg, #A556FE 0%, #5600B7 81%, #310068 100%)",
            }}
            className="h-full rounded-full"
          />
        </div>
      </div>
      <span className="text-activity-percent flex-[35] shrink-0 text-right text-lg leading-normal font-medium">
        {card.steps ?? `${card.percent}%`}
      </span>
    </>
  );
}

// ─── Expanded overlay ─────────────────────────────────────────────────────────

export function ExpandedOverlay({ onClose }: { onClose: () => void }) {
  const [closing, setClosing] = useState(false);

  function handleClose() {
    setClosing(true);
    setTimeout(onClose, 220);
  }

  return (
    <div
      onClick={handleClose}
      className="absolute inset-0 z-[9999] flex flex-col bg-black/20 px-4 backdrop-blur-[6px]"
      style={{
        opacity: closing ? 0 : 1,
        transition: "opacity 220ms ease",
        WebkitBackdropFilter: "blur(6px)",
      }}
    >
      <ul
        onClick={(e) => e.stopPropagation()}
        className="flex list-none flex-col items-center gap-3 p-0"
        style={{ marginTop: "calc(env(safe-area-inset-top, 0px) + 24px)" }}
      >
        {RESUME_CARDS.map((card) => (
          <li
            key={card.id}
            className={`${TIER_BG[card.tier]} rounded-activity-card flex w-full items-center gap-3 p-3 select-none`}
            style={CARD_STYLE}
          >
            <CardContent card={card} />
          </li>
        ))}
      </ul>

      <div className="flex-1" />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ActivityCardStack({ onExpand }: { onExpand: () => void }) {
  return (
    <section
      className="flex w-full min-w-0 flex-col gap-2"
      aria-labelledby="resume-activities-heading"
    >
      <h2
        id="resume-activities-heading"
        className="m-0 w-full text-base leading-normal font-medium text-black"
      >
        Continue where you left off
      </h2>

      <div className="relative w-full cursor-pointer select-none">
        {/* Transparent click catcher — sits above all card stacking contexts */}
        <div
          aria-label="Expand activity cards"
          role="button"
          tabIndex={0}
          onClick={onExpand}
          onKeyDown={(e) => e.key === "Enter" && onExpand()}
          className="absolute inset-0 z-10 cursor-pointer touch-manipulation"
          style={{ WebkitTapHighlightColor: "transparent" }}
        />
        {RESUME_CARDS.map((card, idx) => {
          const isLast = idx === RESUME_CARDS.length - 1;
          const isFront = card.tier === "front";
          return (
            <div
              key={card.id}
              className={`${TIER_BG[card.tier]} rounded-activity-card relative ${
                isFront
                  ? "z-[3] flex items-center gap-3 p-3"
                  : card.tier === "mid"
                    ? "z-[2]"
                    : "z-[1]"
              }`}
              style={{
                ...CARD_STYLE,
                ...(isFront ? {} : { height: STUB_HEIGHT }),
                ...(!isLast
                  ? { marginBottom: `calc(-1 * var(--spacing-activity-stack-overlap, 3.125rem))` }
                  : {}),
              }}
            >
              {isFront && <CardContent card={card} />}
            </div>
          );
        })}
      </div>
    </section>
  );
}
