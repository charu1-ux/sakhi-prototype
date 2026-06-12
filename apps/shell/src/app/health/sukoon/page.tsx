import type { Metadata } from "next";

import { SukoonStory } from "./SukoonStory";

export const metadata: Metadata = {
  title: "Saans aur sukoon — Sehat Saathi",
  description: "JBIQ Health — Sehat Saathi breathe-and-calm conversation prototype.",
};

/*
 * Sehat Saathi "Saans aur sukoon" chat story — a client component that auto-plays
 * the calm conversation (mood → time → a recommended breathing exercise → an
 * animated guided box-breathing round → how-do-you-feel-now) with Framer Motion
 * reveals and a Lottie loader. Static dressing, no backend. Source of truth:
 * ./SukoonStory.tsx (data in ./story-data.ts, widgets in ./story-widgets.tsx).
 * Mirrors ../nuskha.
 */
export default function SukoonPage() {
  return <SukoonStory />;
}
