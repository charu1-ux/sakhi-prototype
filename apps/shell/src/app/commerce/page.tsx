"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Dev-only commerce vertical frame.
 *
 * Production: the shell postbuild copies `../commerce/out` into `out/commerce`.
 * VerticalList uses externalUrl `/commerce/index.html` so Capacitor serves the
 * static export; this iframe page is not used there.
 *
 * Dev: iframe to the commerce app (basePath `/commerce`) on port 3006,
 * analogous to `/health/` and Jobs.
 *
 * Override with NEXT_PUBLIC_COMMERCE_DEV_URL (full URL incl. trailing path), e.g.
 * `http://localhost:3006/commerce/` if the port changes.
 */
export default function CommerceDevFrame() {
  const router = useRouter();

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === "commerce:navigate" && typeof e.data.href === "string") {
        router.push(e.data.href);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [router]);

  const iframeSrc = process.env.NEXT_PUBLIC_COMMERCE_DEV_URL ?? "http://localhost:3006/commerce/";

  return (
    <iframe
      src={iframeSrc}
      title="Commerce"
      className="fixed inset-0 size-full border-0"
      allow="microphone; camera"
    />
  );
}
