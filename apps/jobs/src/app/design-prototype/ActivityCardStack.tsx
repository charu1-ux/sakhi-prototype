import Image from "next/image";

import { cn } from "@/lib/cn";

import { DESIGN_ASSETS_PREFIX } from "./hub-data";

type ResumeCard = {
  id: number;
  title: string;
  percent: number;
  tier: "front" | "mid" | "back";
};

const RESUME_CARDS: ResumeCard[] = [
  { id: 1, title: "Youtube hook pattern", percent: 76, tier: "front" },
  { id: 2, title: "Micro Learning", percent: 76, tier: "mid" },
  { id: 3, title: "Micro Learning", percent: 76, tier: "back" },
];

const LEARNING_ICON_SRC = `${DESIGN_ASSETS_PREFIX}/learning.svg`;

// front→mid→back: front at top, mid/back peek below it
const STACKED_CARDS = RESUME_CARDS;

// 6px peek per card; overlap is 3.125rem (50px), so stub height = 50+6 = 56px = 3.5rem
const PEEK_PX = 6;
const OVERLAP_REM = 3.125;
const STUB_HEIGHT = `${OVERLAP_REM + PEEK_PX / 16}rem`;

const TIER_BG: Record<ResumeCard["tier"], string> = {
  front: "#E3CBFF",
  mid: "#EEDFFF",
  back: "#F1EAFA",
};

const ACTIVITY_COLORS = {
  titleFg: "#1B0633",
  progress: "#310A5D",
  progressTrack: "rgba(49,10,93,0.24)",
  percent: "#141414",
} as const;

function tierWidthClass(tier: ResumeCard["tier"]) {
  if (tier === "front") return "w-full";
  if (tier === "mid") return "w-[95%]";
  return "w-[90%]";
}

function tierZClass(tier: ResumeCard["tier"]) {
  if (tier === "front") return "z-[3]";
  if (tier === "mid") return "z-[2]";
  return "z-[1]";
}

export function ActivityCardStack() {
  return (
    <section
      className={cn("flex w-full min-w-0 flex-col", "gap-2")}
      aria-labelledby="resume-activities-heading"
    >
      <h2
        id="resume-activities-heading"
        className="m-0 w-full text-base font-base leading-normal text-fg"
      >
        Continue where you left off
      </h2>
      <ul className="relative isolate m-0 flex list-none flex-col items-center p-0">
        {STACKED_CARDS.map((card, idx) => {
          const isLast = idx === STACKED_CARDS.length - 1;
          const isFront = card.tier === "front";

          return (
            <li
              key={card.id}
              style={{
                backgroundColor: TIER_BG[card.tier],
                ...(isFront ? {} : { height: STUB_HEIGHT }),
              }}
              className={cn(
                "relative flex shrink-0 rounded-activity-card",
                tierWidthClass(card.tier),
                tierZClass(card.tier),
                !isLast && "-mb-[length:var(--space-activity-stack-overlap)]",
                isFront ? "pointer-events-auto items-center gap-3 p-3" : "pointer-events-none",
              )}
            >
              {isFront && (
                <>
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
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
                          backgroundColor: ACTIVITY_COLORS.progress,
                        }}
                        className="h-full rounded-full"
                      />
                    </div>
                  </div>
                  <span
                    style={{ color: ACTIVITY_COLORS.percent }}
                    className="shrink-0 whitespace-nowrap text-[length:var(--font-size-activity-percent)] font-medium leading-normal"
                  >
                    {card.percent}%
                  </span>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
