import type { Metadata } from "next";

import { JioMartStory } from "./JioMartStory";

export const metadata: Metadata = {
  title: "JioMart flow — Commerce",
  description: "JBIQ Commerce — JioMart purchase conversation prototype.",
};

/*
 * Interactive JioMart purchase story — a React client component that auto-plays
 * the conversation (search → cart → address → checkout → order placed) with
 * Framer Motion reveals and Lottie loaders. Source of truth: ./JioMartStory.tsx
 * (data in ./story-data.ts, widgets in ./story-widgets.tsx).
 */
export default function JioMartFlowPage() {
  return <JioMartStory />;
}
