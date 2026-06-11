// ────────────────────────────────────────────────────────────────────────────
// Happy-Flow "chat story" — a scripted, auto-playing demo of Dil Ki Baat.
//
// Follows the Chat Story Playbook (turns auto-advance on a timer; the story
// pauses only at a GATED step until the viewer taps a CTA). The script is the
// PRD §8 "Happy Flow": returning user → remembered → switches to live call →
// feels heard → ends resolved. Reachable at /personal-companion/chat?demo=happy
// so it never touches the free-form chat.
// ────────────────────────────────────────────────────────────────────────────

import type { UiLanguage } from "./companion-data";

export type StoryStep =
  // Typing indicator held for `hold` ms, then replaced by what follows.
  | { type: "loader"; hold: number }
  // One or more companion bubbles, each preceded by a typing beat.
  | { type: "companion"; bubbles: string[] }
  // A user message that auto-appears `delay` ms after the previous step.
  | { type: "user"; text: string; delay: number }
  // GATED: renders a Call CTA; tapping opens the live call screen. On call end
  // the story resumes from the next step (a call record is appended).
  | { type: "call"; cta: string }
  // GATED terminal: renders a replay CTA.
  | { type: "end"; cta: string };

export const HAPPY_FLOW: Record<UiLanguage, StoryStep[]> = {
  hinglish: [
    { type: "loader", hold: 800 },
    {
      type: "companion",
      bubbles: ["Wapas aa gaye!", "Kal kaafi tense lag rahe the — aaj kaisa feel ho raha hai?"],
    },
    { type: "user", text: "Haan yaar… wahi baat hai. Mann nahi lag raha.", delay: 1600 },
    { type: "loader", hold: 700 },
    {
      type: "companion",
      bubbles: [
        "Samajh raha hoon. Kal jaisa hi bhaari lag raha hai na.",
        "Main yahin hoon — jo mann mein hai, bata.",
      ],
    },
    { type: "call", cta: "Call Dil Ki Baat" },
    { type: "loader", hold: 800 },
    {
      type: "companion",
      bubbles: [
        "Achha laga sun ke ki thoda halka feel ho raha hai.",
        "Kab bhi baat karni ho — main yahan hoon.",
      ],
    },
    { type: "end", cta: "Replay demo" },
  ],
  hi: [
    { type: "loader", hold: 800 },
    {
      type: "companion",
      bubbles: ["फिर आ गए!", "कल आप काफ़ी परेशान लग रहे थे — आज कैसा लग रहा है?"],
    },
    { type: "user", text: "हाँ यार… वही बात है। मन नहीं लग रहा।", delay: 1600 },
    { type: "loader", hold: 700 },
    {
      type: "companion",
      bubbles: ["समझ रहा हूँ। कल जैसा ही भारी लग रहा है ना।", "मैं यहीं हूँ — जो मन में है, बताओ।"],
    },
    { type: "call", cta: "कॉल करें" },
    { type: "loader", hold: 800 },
    {
      type: "companion",
      bubbles: ["अच्छा लगा सुनकर कि थोड़ा हल्का लग रहा है।", "जब भी बात करनी हो — मैं यहाँ हूँ।"],
    },
    { type: "end", cta: "फिर से चलाएँ" },
  ],
  en: [
    { type: "loader", hold: 800 },
    {
      type: "companion",
      bubbles: [
        "Hey, you're back.",
        "You seemed pretty tense yesterday — how are you feeling today?",
      ],
    },
    { type: "user", text: "Yeah… same thing. I just can't shake it off.", delay: 1600 },
    { type: "loader", hold: 700 },
    {
      type: "companion",
      bubbles: [
        "I hear you. It's sitting just as heavy as yesterday.",
        "I'm right here — tell me what's on your mind.",
      ],
    },
    { type: "call", cta: "Call Dil Ki Baat" },
    { type: "loader", hold: 800 },
    {
      type: "companion",
      bubbles: ["I'm glad it feels a little lighter now.", "Whenever you want to talk — I'm here."],
    },
    { type: "end", cta: "Replay demo" },
  ],
};
