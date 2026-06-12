"use client";

import { useEffect } from "react";

// Per PRD (PC-01): the home entry point routes directly to the chat window.
// There is no landing page for Personal Companion — open Dil Ki Baat straight away.
export default function PersonalCompanionPage() {
  useEffect(() => {
    window.location.replace("/personal-companion/chat/");
  }, []);
  return null;
}
