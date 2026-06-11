"use client";

import { useSyncExternalStore } from "react";

import { CompanionExperience } from "./_components/CompanionExperience";
import { HappyFlowStory } from "./_components/HappyFlowStory";

// Route entry, decided from the URL on the client (useSyncExternalStore is the
// blessed pattern for browser state — works with static export, no hydration
// mismatch):
//   ?demo=happy → scripted Happy-Flow story
//   ?intro=0    → straight into the chat (skip the animated arrival)
//   (default)   → animated welcome arrival, then transitions to chat
const subscribe = () => () => {};
const getModeSnapshot = (): "demo" | "plain" | "welcome" => {
  const p = new URLSearchParams(window.location.search);
  if (p.get("demo") === "happy") return "demo";
  if (p.get("intro") === "0") return "plain";
  return "welcome";
};
const getServerSnapshot = () => "welcome" as const;

export default function PersonalCompanionChat() {
  const mode = useSyncExternalStore(subscribe, getModeSnapshot, getServerSnapshot);
  if (mode === "demo") return <HappyFlowStory />;
  return <CompanionExperience initialPhase={mode === "plain" ? "chat" : "welcome"} />;
}
