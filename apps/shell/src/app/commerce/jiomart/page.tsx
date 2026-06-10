import type { Metadata } from "next";

import { JIOMART_THREAD_HTML } from "./thread-source";

export const metadata: Metadata = {
  title: "JioMart flow — Commerce",
  description: "JBIQ Commerce — JioMart purchase conversation prototype.",
};

/*
 * Renders the approved JioMart conversation prototype inside an isolated iframe.
 * `srcDoc` sandboxes all of the prototype's CSS/JS, so nothing here can affect
 * the shell or any other vertical. Lives entirely inside apps/shell/src/app/commerce/.
 * Source of truth for the markup: ./thread-source.ts
 */
export default function JioMartFlowPage() {
  return (
    <iframe
      title="JioMart purchase flow"
      srcDoc={JIOMART_THREAD_HTML}
      style={{ border: 0, width: "100%", height: "100dvh", display: "block" }}
    />
  );
}
