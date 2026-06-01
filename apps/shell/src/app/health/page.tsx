"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Dev-only health frame.
 *
 * The iframe src uses a same-origin path (/health/index.html) which the shell
 * dev server proxies to the health app (port 3004) via next.config rewrites.
 * This eliminates cross-origin restrictions and lets browser history work
 * correctly — the URL bar always stays on localhost:3000.
 *
 * Production: postbuild copies @intelligence/health static export into
 * out/health/. Capacitor loads that directly — this component is never
 * rendered in production.
 */
export default function HealthDevFrame() {
  const router = useRouter();

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === "health:navigate" && typeof e.data.href === "string") {
        router.push(e.data.href);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [router]);

  return (
    <div className="flex h-full w-full flex-col">
      <iframe
        src="/health/index.html"
        title="Sehat Saathi"
        className="block min-h-0 w-full flex-1 border-0"
        allow="microphone; camera"
      />
    </div>
  );
}
