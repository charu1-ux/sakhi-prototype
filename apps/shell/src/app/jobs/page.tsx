"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Dev-only jobs frame.
 *
 * Production: the shell postbuild overwrites out/jobs/index.html with the
 * @intelligence/jobs static export. The shell home's externalUrl="/jobs/index.html"
 * forces a full page load, so Capacitor serves that file directly — this
 * component is never rendered in production.
 *
 * Dev: Next.js serves this page at /jobs/ and shows a full-screen iframe
 * pointing to the jobs dev server (basePath=/jobs). Because the iframe is
 * cross-origin (port 3003 vs 3000), the jobs app cannot access window.top
 * directly and instead posts a 'jobs:navigate' message — we handle it here.
 */
export default function JobsDevFrame() {
  const router = useRouter();

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === "jobs:navigate" && typeof e.data.href === "string") {
        router.push(e.data.href);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [router]);

  return (
    <iframe
      src="http://localhost:3003/index.html"
      title="Jobs & Career"
      className="fixed inset-0 size-full border-0"
      allow="microphone; camera"
    />
  );
}
