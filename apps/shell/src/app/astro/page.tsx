"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Dev-only astro frame.
 *
 * Production: the shell postbuild overwrites out/astro/index.html with the
 * @intelligence/astro static export. The shell home's <a href="/astro/index.html">
 * forces a full page load, so Capacitor serves that file directly — this
 * component is never rendered in production.
 *
 * Dev: Next.js serves this page at /astro/ and shows a full-screen iframe
 * pointing to the astro dev server (basePath=/astro). Because the iframe is
 * cross-origin (port 3002 vs 3000), the astro app cannot access window.top
 * directly and instead posts a 'astro:navigate' message — we handle it here.
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
    <iframe
      src="http://localhost:3002/astro/"
      title="Jio Astro"
      className="fixed inset-0 size-full border-0"
      allow="microphone; camera"
    />
  );
}
