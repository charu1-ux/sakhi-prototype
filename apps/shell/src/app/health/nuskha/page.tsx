import type { Metadata } from "next";

import { NuskhaStory } from "./NuskhaStory";

export const metadata: Metadata = {
  title: "Ghar ke Nushke — Sehat Saathi",
  description: "JBIQ Health — Sehat Saathi home-remedy conversation prototype.",
};

/*
 * Sehat Saathi "Home Remedy" chat story — a client component that auto-plays the
 * conversation (symptom → clarify → remedy → guided walkthrough → did-it-help)
 * with Framer Motion reveals and a Lottie loader. Static dressing, no backend.
 * Source of truth: ./NuskhaStory.tsx (data in ./story-data.ts, widgets in
 * ./story-widgets.tsx). Mirrors the JioMart reference (../commerce/jiomart).
 */
export default function GhareluNushkaPage() {
  return <NuskhaStory />;
}
