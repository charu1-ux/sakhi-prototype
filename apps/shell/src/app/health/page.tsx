"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Dev-only health frame.
 *
 * Production: the shell postbuild overwrites out/health/index.html with the
 * @intelligence/health static export. The shell home's <a href="/health/">
 * forces a full page load, so Capacitor serves that file directly — this
 * component is never rendered in production.
 *
 * Dev: Next.js serves this page at /health/ and shows a full-screen iframe
 * pointing to the health dev server (basePath=/health). Because the iframe is
 * cross-origin (port 3004 vs 3000), the health app cannot access window.top
 * directly and instead posts a 'health:navigate' message — we handle it here.
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
    <iframe
      src="http://localhost:3004/health/"
      title="Sehat Saathi"
      className="fixed inset-0 size-full border-0"
      allow="microphone; camera"
    />
  );
}
