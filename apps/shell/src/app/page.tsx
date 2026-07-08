import Image from "next/image";

import { VerticalList } from "@/components/molecules/VerticalList";
import { SakhiRedirect } from "@/components/SakhiRedirect";
import { isIsolated } from "@/lib/sakhi-feature";

export default function HomePage() {
  // Isolated single-feature build: the root redirects straight into the one
  // feature instead of showing the multi-vertical list.
  if (isIsolated) return <SakhiRedirect />;
  return (
    <main className="bg-bg text-fg pt-safe pb-safe flex min-h-dvh flex-col overflow-y-auto">
      {/* Top bar */}
      <header className="flex items-center gap-3 px-4 pt-4">
        <button
          type="button"
          aria-label="Open menu"
          className="text-fg flex size-6 shrink-0 items-center justify-center"
        >
          {/* Inline SVG so currentColor inherits --color-fg token directly */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 12H20M4 19H20M4 5H20"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="square"
            />
          </svg>
        </button>
        <Image
          src="/assets/shell/jio-logo.png"
          alt="Jio"
          width={44}
          height={44}
          className="rounded-full"
          priority
        />
      </header>

      {/* Page content */}
      <div className="flex flex-col gap-6 px-4 pt-10">
        {/* Heading */}
        <div className="flex flex-col gap-2">
          <h1 className="text-fg text-xl font-medium">Consumer Intelligence Core</h1>
          <p className="text-fg-muted text-sm">Select a vertical to preview</p>
        </div>

        {/* Vertical list */}
        <VerticalList />
      </div>
    </main>
  );
}
