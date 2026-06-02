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
  front: "#ffffff",
  mid: "#f9f9f9",
  back: "#f3f3f3",
};

const ACTIVITY_COLORS = {
  titleFg: "#1B0633",
  progress: "#310A5D",
  progressTrack: "rgba(0,0,0,0.10)",
  percent: "#141414",
} as const;

function CardContent({ card }: { card: ResumeCard }) {
  return (
    <>
      <div className="flex-[75] min-w-0 flex flex-col gap-2">
        <div className="flex items-center gap-1.5">
          <span className="relative inline-flex shrink-0 size-[length:var(--size-activity-guide-icon)]">
            <Image
              src={LEARNING_ICON_SRC}
              alt=""
              width={18}
              height={18}
              className="pointer-events-none size-[length:var(--size-activity-guide-icon)]"
              unoptimized
            />
          </span>
          <p
            style={{ color: ACTIVITY_COLORS.titleFg }}
            className="m-0 truncate text-[length:var(--font-size-activity-title)] font-normal leading-normal"
          >
            {card.title}
          </p>
        </div>
        <div
          style={{ backgroundColor: ACTIVITY_COLORS.progressTrack }}
          className="h-1.5 w-full overflow-hidden rounded-full"
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
      <span
        style={{ color: ACTIVITY_COLORS.percent }}
        className="flex-[35] shrink-0 text-right text-[18px] font-medium leading-normal"
      >
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
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        padding: "0 16px",
        backgroundColor: "rgba(0,0,0,0.2)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        opacity: closing ? 0 : 1,
        transition: "opacity 220ms ease",
      }}
    >
      <ul
        onClick={(e) => e.stopPropagation()}
        style={{
          marginTop: "calc(env(safe-area-inset-top, 0px) + 24px)",
          padding: 0,
          listStyle: "none",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
        }}
      >
        {RESUME_CARDS.map((card) => (
          <li
            key={card.id}
            style={{
              backgroundColor: TIER_BG[card.tier],
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: 12,
              borderRadius: "var(--radius-activity-card, 12px)",
              userSelect: "none",
              width: "100%",
            }}
          >
            <CardContent card={card} />
          </li>
        ))}
      </ul>

      <div style={{ flex: 1 }} />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ActivityCardStack({ onExpand }: { onExpand: () => void }) {
  return (
    <>
      <section
        className="flex w-full min-w-0 flex-col gap-2"
        aria-labelledby="resume-activities-heading"
      >
        <h2
          id="resume-activities-heading"
          className="m-0 w-full text-base font-medium leading-normal text-black"
        >
          Continue where you left off
        </h2>

        <div style={{ position: "relative", cursor: "pointer" }} className="w-full select-none">
          {/* Transparent click catcher — sits above all card stacking contexts */}
          <div
            aria-label="Expand activity cards"
            role="button"
            tabIndex={0}
            onClick={onExpand}
            onKeyDown={(e) => e.key === "Enter" && onExpand()}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 10,
              cursor: "pointer",
              touchAction: "manipulation",
              WebkitTapHighlightColor: "transparent",
            }}
          />
          {RESUME_CARDS.map((card, idx) => {
            const isLast = idx === RESUME_CARDS.length - 1;
            const isFront = card.tier === "front";
            return (
              <div
                key={card.id}
                style={{
                  backgroundColor: TIER_BG[card.tier],
                  borderRadius: "var(--radius-activity-card, 12px)",
                  position: "relative",
                  zIndex: isFront ? 3 : card.tier === "mid" ? 2 : 1,
                  ...(isFront
                    ? { display: "flex", alignItems: "center", gap: 12, padding: 12 }
                    : { height: STUB_HEIGHT }),
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
    </>
  );
}
