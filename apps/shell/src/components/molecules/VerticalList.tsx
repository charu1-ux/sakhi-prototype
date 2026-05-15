"use client";

import Image from "next/image";
import Link from "next/link";

import { cn } from "@intelligence/ui";
import { impactLight } from "@/lib/haptics";

type Vertical = {
  name: string;
  slug: string;
  icon: string;
  gradientFrom: string;
  externalUrl?: string;
};

const verticals: Vertical[] = [
  {
    name: "News",
    slug: "news",
    icon: "/assets/shell/ico-news.svg",
    gradientFrom: "from-vertical-news",
  },
  {
    name: "Cricket",
    slug: "cricket",
    icon: "/assets/shell/ico-cricket.svg",
    gradientFrom: "from-vertical-cricket",
  },
  {
    name: "Devotion",
    slug: "devotion",
    icon: "/assets/shell/ico-devotion.svg",
    gradientFrom: "from-vertical-devotion",
  },
  {
    name: "Jobs and Career",
    slug: "jobs",
    icon: "/assets/shell/ico-jobs.svg",
    gradientFrom: "from-vertical-jobs",
  },
  {
    name: "Health",
    slug: "health",
    icon: "/assets/shell/ico-health.svg",
    gradientFrom: "from-vertical-health",
    // Explicit file path required for Capacitor: WKURLSchemeHandler does not
    // resolve directory URLs (e.g. /health/) to index.html — it falls back to
    // the shell's index.html instead. Pointing directly to /health/index.html
    // lets Capacitor find the file and serve the real health app.
    // Also bypasses Next.js client-side routing (which would render the
    // dev-only iframe page that tries localhost:3004 — unavailable on device).
    externalUrl: "/health/index.html",
  },
  {
    name: "Finance",
    slug: "finance",
    icon: "/assets/shell/ico-finance.svg",
    gradientFrom: "from-vertical-finance",
  },
  {
    name: "Astro",
    slug: "astro",
    icon: "/assets/shell/ico-astro.svg",
    gradientFrom: "from-vertical-astro",
    // Same Capacitor WKURLSchemeHandler fix as health — point directly to
    // index.html so the static file is served on device instead of falling
    // back to the shell. Also skips the Next.js dev iframe route on device.
    externalUrl: "/astro/jbiq-homepage.html",
  },
];

export function VerticalList() {
  return (
    <nav aria-label="Verticals">
      <ul className="flex flex-col gap-4">
        {verticals.map((v) => {
          const inner = (
            <>
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex size-16 shrink-0 items-center justify-center rounded-full",
                    "to-vertical-glow bg-gradient-to-r",
                    v.gradientFrom,
                  )}
                >
                  <Image src={v.icon} alt="" width={28} height={28} />
                </div>
                <span className="text-fg text-base">{v.name}</span>
              </div>
              {/* Inline SVG so currentColor inherits --color-fg token directly */}
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
                className="shrink-0"
              >
                <path
                  d="M7.5 3.33334L13.5774 9.41074C13.9028 9.73618 13.9028 10.2638 13.5774 10.5893L7.5 16.6667"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </>
          );

          return (
            <li key={v.slug}>
              {"externalUrl" in v && v.externalUrl ? (
                <a
                  href={v.externalUrl}
                  className="flex items-center justify-between no-underline transition-transform duration-100 active:scale-95"
                  onTouchStart={() => impactLight()}
                >
                  {inner}
                </a>
              ) : (
                <Link
                  href={`/${v.slug}`}
                  className="flex items-center justify-between no-underline transition-transform duration-100 active:scale-95"
                  onTouchStart={() => impactLight()}
                >
                  {inner}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
