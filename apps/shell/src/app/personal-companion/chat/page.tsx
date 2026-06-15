"use client";

import DilKiBaatPrototype from "../design-prototype/page";

// PM Design's "Dil Ki Baat" is intentionally identical to the Design Prototype's
// Dil Ki Baat. Rather than maintain a second design, this route renders the exact
// same experience component. The Design Prototype itself is left untouched.
//
// (The richer chat/_components experience — CompanionExperience, HappyFlowStory,
// scripted chip stories, etc. — remains in this folder for reference but is no
// longer the surface shown from PM Design.)
export default function PersonalCompanionChat() {
  return <DilKiBaatPrototype />;
}
