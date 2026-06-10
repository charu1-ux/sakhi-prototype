import type { Metadata } from "next";

import { JIOMART_THREAD_HTML } from "./jiomart/thread-source";

export const metadata: Metadata = {
  title: "Commerce",
  description: "JBIQ Commerce — JioMart purchase conversation prototype.",
};

/*
 * The Commerce section opens straight into the JioMart purchase flow, so anyone
 * with the app prototype link can tap "Commerce" and walk the entire thread.
 * Rendered in an isolated iframe; all styles are sandboxed and cannot affect the
 * shell or other verticals. Markup source of truth: ./jiomart/thread-source.ts
 */
export default function CommercePage() {
  return (
    <iframe
      title="JioMart purchase flow"
      srcDoc={JIOMART_THREAD_HTML}
      style={{ border: 0, width: "100%", height: "100dvh", display: "block" }}
    />
  );
}
