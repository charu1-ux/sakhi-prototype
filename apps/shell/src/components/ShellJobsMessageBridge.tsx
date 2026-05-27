"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Listens for cross-origin postMessage events from the jobs iframe (dev only,
 * port 3003 vs 3000) and handles navigation on behalf of the shell.
 *
 * Message shape: { type: "jobs:navigate", href: string }
 */
export function ShellJobsMessageBridge() {
  const router = useRouter();

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (!event.data || typeof event.data !== "object") return;
      if (event.data.type === "jobs:navigate" && typeof event.data.href === "string") {
        router.push(event.data.href);
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [router]);

  return null;
}
