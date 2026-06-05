"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@intelligence/ui";
import { impactLight } from "@/lib/haptics";

type DropdownItem = {
  label: string;
  url: string; // web URL (shell Next.js route)
  capacitorUrl?: string; // Capacitor URL (explicit index.html path)
};

type Vertical = {
  name: string;
  slug: string;
  icon: string;
  gradientFrom: string;
  externalUrl?: string;
  dropdownItems?: DropdownItem[];
};

const verticalJobs: Vertical = {
  name: "Jobs and Career",
  slug: "jobs",
  icon: "/assets/shell/ico-jobs.svg",
  gradientFrom: "from-vertical-jobs",
  // Full-page loads so the shell's server rewrites proxy to the jobs app.
  // Client-side <Link> would skip server-side rewrites.
  dropdownItems: [
    {
      label: "Design Prototype",
      url: "/jobs/design-prototype/",
      capacitorUrl: "/jobs/design-prototype/index.html",
    },
  ],
};

const verticalHealth: Vertical = {
  name: "Health",
  slug: "health",
  icon: "/assets/shell/ico-health.svg",
  gradientFrom: "from-vertical-health",
  externalUrl: "/health/index.html",
};

const verticalAstrology: Vertical = {
  name: "Astrology",
  slug: "astro",
  icon: "/assets/shell/ico-astro.svg",
  gradientFrom: "from-vertical-astro",
  externalUrl: "/astro/index.html",
};

const verticalCommerce: Vertical = {
  name: "Commerce",
  slug: "commerce",
  icon: "/assets/shell/ico-commerce.svg",
  gradientFrom: "from-vertical-commerce",
  externalUrl: "/commerce/index.html",
};

const verticalFinance: Vertical = {
  name: "Finance",
  slug: "finance",
  icon: "/assets/shell/ico-finance.svg",
  gradientFrom: "from-vertical-finance",
  externalUrl: "/finance/index.html",
};

const verticalNews: Vertical = {
  name: "News",
  slug: "news",
  icon: "/assets/shell/ico-news.svg",
  gradientFrom: "from-vertical-news",
  externalUrl: "/news/index.html",
};

const verticalsFeatured: Vertical[] = [
  verticalJobs,
  verticalHealth,
  verticalAstrology,
  verticalCommerce,
  verticalFinance,
  verticalNews,
];

const verticalsComingSoon: Vertical[] = [
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
];

type VerticalListItemProps = {
  v: Vertical;
  isOpen: boolean;
  setOpenSlug: (slug: string | null) => void;
  interactive: boolean;
};

function VerticalListItem({ v, isOpen, setOpenSlug, interactive }: VerticalListItemProps) {
  const iconAndLabel = (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-full",
          "to-vertical-glow bg-gradient-to-r",
          v.gradientFrom,
        )}
      >
        <Image src={v.icon} alt="" width={20} height={20} />
      </div>
      <span className="text-fg text-base">{v.name}</span>
    </div>
  );

  const chevron = (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className={cn("shrink-0 transition-transform duration-200", isOpen && "rotate-90")}
    >
      <path
        d="M7.5 3.33334L13.5774 9.41074C13.9028 9.73618 13.9028 10.2638 13.5774 10.5893L7.5 16.6667"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  if (!interactive) {
    return (
      <div className="text-fg flex w-full items-center justify-between" aria-disabled="true">
        {iconAndLabel}
        {chevron}
      </div>
    );
  }

  if (v.dropdownItems) {
    return (
      <>
        <button
          type="button"
          onClick={() => {
            impactLight();
            setOpenSlug(isOpen ? null : v.slug);
          }}
          className="flex w-full cursor-pointer items-center justify-between border-none bg-transparent p-0 transition-transform duration-100 active:scale-95"
          aria-expanded={isOpen}
        >
          {iconAndLabel}
          {chevron}
        </button>
        {isOpen && (
          <ul className="mt-2 ml-12 grid grid-cols-2 gap-2">
            {v.dropdownItems!.map((item, index) => {
              const items = v.dropdownItems!;
              const oddLastSpansFullRow = index === items.length - 1 && items.length % 2 === 1;
              return (
                <li key={item.label} className={cn(oddLastSpansFullRow && "col-span-2")}>
                  <button
                    type="button"
                    onClick={() => {
                      const isCapacitor = window.location.protocol === "capacitor:";
                      window.location.href =
                        isCapacitor && item.capacitorUrl ? item.capacitorUrl : item.url;
                    }}
                    onTouchStart={() => impactLight()}
                    className="border-border flex w-full cursor-pointer items-center justify-center rounded-md border bg-transparent px-3 py-2.5 text-center transition-transform duration-100 active:scale-95"
                  >
                    <span className="text-fg-muted text-sm">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </>
    );
  }

  if ("externalUrl" in v && v.externalUrl) {
    // Capacitor: protocol is "capacitor:" — use explicit index.html path so
    // WKURLSchemeHandler can resolve the file directly.
    // Web: navigate to the shell route (Next.js page with phone frame wrapper).
    const isCapacitor = typeof window !== "undefined" && window.location.protocol === "capacitor:";
    const href = isCapacitor ? v.externalUrl : `/${v.slug}/`;
    return (
      <button
        type="button"
        onClick={() => {
          window.location.href = href;
        }}
        onTouchStart={() => impactLight()}
        className="flex w-full cursor-pointer items-center justify-between border-none bg-transparent p-0 transition-transform duration-100 active:scale-95"
      >
        {iconAndLabel}
        {chevron}
      </button>
    );
  }

  return (
    <Link
      href={`/${v.slug}`}
      className="flex items-center justify-between no-underline transition-transform duration-100 active:scale-95"
      onTouchStart={() => impactLight()}
    >
      {iconAndLabel}
      {chevron}
    </Link>
  );
}

export function VerticalList() {
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  return (
    <nav aria-label="Verticals">
      <ul className="flex flex-col gap-4">
        {verticalsFeatured.map((v) => {
          const isOpen = openSlug === v.slug;
          return (
            <li key={v.slug}>
              <VerticalListItem v={v} isOpen={isOpen} setOpenSlug={setOpenSlug} interactive />
            </li>
          );
        })}
      </ul>

      <hr className="border-border my-5 border-0 border-t" />

      <section aria-labelledby="verticals-coming-soon-heading">
        <h2
          id="verticals-coming-soon-heading"
          className="text-fg-muted mb-3 text-xs font-semibold tracking-wide uppercase"
        >
          Coming soon
        </h2>
        <ul className="flex flex-col gap-4">
          {verticalsComingSoon.map((v) => (
            <li key={v.slug}>
              <VerticalListItem
                v={v}
                isOpen={false}
                setOpenSlug={setOpenSlug}
                interactive={false}
              />
            </li>
          ))}
        </ul>
      </section>
    </nav>
  );
}
