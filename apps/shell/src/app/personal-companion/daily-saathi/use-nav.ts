"use client";

import { useRouter } from "next/navigation";

// Single navigation hook for the whole Daily Saathi flow. Uses Next's client
// router (SPA navigation) instead of hard `window.location` reloads, so React
// event handlers stay bound after a back/forward navigation — fixing the bug
// where the home CTAs went dead after returning from a chat (bfcache restore
// of a hard-loaded document doesn't reliably re-bind handlers).
export function useNav() {
  const router = useRouter();
  return {
    go: (href: string) => router.push(href),
    back: () => router.back(),
    appHome: () => {
      // Embedded in the shell frame → tell the parent to navigate; otherwise
      // route to the app root within this SPA.
      if (typeof window !== "undefined" && window.parent !== window) {
        window.parent.postMessage({ type: "jobs:navigate", href: "/" }, "*");
      } else {
        router.push("/");
      }
    },
  };
}
