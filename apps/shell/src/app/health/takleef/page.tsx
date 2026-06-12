import type { Metadata } from "next";

import { TakleefStory } from "./TakleefStory";

export const metadata: Metadata = {
  title: "Kya takleef hai? — Sehat Saathi",
  description: "JBIQ Health — Sehat Saathi symptom-triage conversation prototype.",
};

/*
 * Sehat Saathi "Kya takleef hai?" chat story — a client component that auto-plays
 * the symptom-triage conversation (symptom → clarify duration/severity → safe
 * self-care + when-to-see-a-doctor → reassurance) with Framer Motion reveals and
 * a Lottie loader. Static dressing, no backend. Source of truth: ./TakleefStory.tsx
 * (data in ./story-data.ts, widgets in ./story-widgets.tsx). Mirrors ../nuskha.
 */
export default function TakleefPage() {
  return <TakleefStory />;
}
