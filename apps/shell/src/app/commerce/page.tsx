import type { Metadata } from "next";

import { JioMartStory } from "./jiomart/JioMartStory";

export const metadata: Metadata = {
  title: "Commerce",
  description: "JBIQ Commerce — JioMart purchase conversation prototype.",
};

/*
 * The Commerce section opens straight into the interactive JioMart purchase
 * story, so anyone with the prototype link can tap "Commerce" and walk the
 * entire thread. Source of truth: ./jiomart/JioMartStory.tsx
 */
export default function CommercePage() {
  return <JioMartStory />;
}
