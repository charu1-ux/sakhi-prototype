"use client";

import { useEffect, useState } from "react";

// Dil Ki Baat avatar. Shows the persona photo if present at AVATAR_SRC;
// otherwise falls back to a warm purple gradient orb with a heart glyph.
//
// To set the persona image, save a square image (PNG) at:
//   apps/shell/public/assets/personal-companion/avatar.png
// The image is preloaded first, so a missing file shows the heart cleanly
// (never a broken-image icon).
const AVATAR_SRC = "/assets/personal-companion/avatar.png";

// Module-level cache so we only probe the image once per session.
let avatarStatus: "unknown" | "ok" | "missing" = "unknown";

type Props = {
  size?: number;
  className?: string;
  showActiveDot?: boolean;
};

export function CompanionAvatar({ size = 40, className, showActiveDot = false }: Props) {
  const [status, setStatus] = useState<"unknown" | "ok" | "missing">(avatarStatus);
  const dot = Math.max(8, Math.round(size * 0.26));

  useEffect(() => {
    // Initial state already reflects the cache; only probe if still unknown.
    if (avatarStatus !== "unknown") return;
    const probe = new window.Image();
    probe.onload = () => {
      avatarStatus = "ok";
      setStatus("ok");
    };
    probe.onerror = () => {
      avatarStatus = "missing";
      setStatus("missing");
    };
    probe.src = AVATAR_SRC;
  }, []);

  return (
    <span
      className={`relative inline-flex shrink-0 ${className ?? ""}`}
      style={{ width: size, height: size }}
    >
      <span
        className="flex size-full items-center justify-center overflow-hidden rounded-full"
        style={{ background: "linear-gradient(140deg, #8B2FE8 0%, #6d17ce 60%, #4a0e93 100%)" }}
      >
        {status === "ok" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={AVATAR_SRC}
            alt=""
            width={size}
            height={size}
            className="size-full object-cover"
            style={{ objectPosition: "50% 22%" }}
          />
        ) : (
          <svg
            viewBox="0 0 24 24"
            width={size * 0.56}
            height={size * 0.56}
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M12 20s-6.5-4.35-8.5-8.2C2.2 9.1 3.4 6 6.4 6c1.8 0 2.9 1.1 3.6 2.2C10.7 7.1 11.8 6 13.6 6c3 0 4.2 3.1 2.9 5.8C14.5 15.65 12 20 12 20Z"
              fill="#ffffff"
              fillOpacity="0.95"
            />
          </svg>
        )}
      </span>
      {showActiveDot && (
        <span
          className="absolute right-0 bottom-0 rounded-full border-2 border-white bg-[#25ab21]"
          style={{ width: dot, height: dot }}
          aria-hidden="true"
        />
      )}
    </span>
  );
}
