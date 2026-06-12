import type { Metadata } from "next";

import { RemindersStory } from "./RemindersStory";

export const metadata: Metadata = {
  title: "Khana-paani reminder — Sehat Saathi",
  description: "JBIQ Health — Sehat Saathi food & water reminder conversation prototype.",
};

/*
 * Sehat Saathi "Khana-paani reminder" chat story — a client component that
 * auto-plays a reminder-setup conversation (how often for water → which meals →
 * an editable reminder list with on/off toggles → "now I'll remind you" + a
 * sample notification) with Framer Motion reveals and a Lottie loader. Static
 * dressing, no backend. Source of truth: ./RemindersStory.tsx (data in
 * ./story-data.ts, widgets in ./story-widgets.tsx). Mirrors ../nuskha.
 */
export default function RemindersPage() {
  return <RemindersStory />;
}
