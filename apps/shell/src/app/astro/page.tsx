"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Dev-only astro frame.
 *
 * The iframe src uses a same-origin path proxied from the astro dev server
 * (port 3002) via shell rewrites, keeping everything on localhost:3000.
 *
 * Production: postbuild copies @intelligence/astro static export into
 * out/astro/. Capacitor loads that directly — this component is never
 * rendered in production.
 */
export default function AstroDevFrame() {
  const router = useRouter();

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === "astro:navigate" && typeof e.data.href === "string") {
        router.push(e.data.href);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [router]);

  return (
    <div className="flex h-full w-full flex-col">
      <iframe
        src="/astro/jbiq-homepage.html"
        title="Jio Astro"
        className="block min-h-0 w-full flex-1 border-0"
        allow="microphone; camera"
      />
    </div>
  );
}
