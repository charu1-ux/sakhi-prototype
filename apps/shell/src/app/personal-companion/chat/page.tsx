"use client";

import { DilKiBaatExperience } from "../_shared/DilKiBaatExperience";

// PM Design's "Dil Ki Baat" — the same experience as the Design Prototype, plus a
// lead "Get to know me" pill that opens a companion-led personality intro. This
// divergence is PM-Design-only; the Design Prototype route stays without it.
export default function PersonalCompanionChat() {
  return <DilKiBaatExperience getToKnowMe />;
}
