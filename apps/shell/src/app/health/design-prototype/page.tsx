import type { Metadata } from "next";

import { HealthDesignPrototype } from "./HealthDesignPrototype";

export const metadata: Metadata = {
  title: "Sehat Saathi — Design Prototype",
  description: "JBIQ Health — Sehat Saathi design prototype: pick a topic, the chat plays.",
};

/*
 * Sehat Saathi design prototype — one chat interface that surfaces the four
 * experiences as sleek pills above the composer. Selecting a pill hides the
 * pills and plays that story (../takleef · ../nuskha · ../reminders · ../sukoon),
 * led by the topic line as the AI's opening prompt.
 */
export default function HealthDesignPrototypePage() {
  return <HealthDesignPrototype />;
}
