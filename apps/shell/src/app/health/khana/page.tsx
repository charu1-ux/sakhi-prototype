import type { Metadata } from "next";

import { KhanaStory } from "./KhanaStory";

export const metadata: Metadata = {
  title: "Khane ka dhyaan — Sehat Saathi",
  description: "JBIQ Health — Sehat Saathi meal-care conversation prototype.",
};

/*
 * Sehat Saathi "Khane ka dhyaan" chat story — a client component that auto-plays
 * the meal-care conversation (goal → diet → a day's meal plan → an interactive
 * day tracker with water counter → did-it-help) with Framer Motion reveals and a
 * Lottie loader. Static dressing, no backend. Source of truth: ./KhanaStory.tsx
 * (data in ./story-data.ts, widgets in ./story-widgets.tsx). Mirrors ../nuskha.
 */
export default function KhanaPage() {
  return <KhanaStory />;
}
