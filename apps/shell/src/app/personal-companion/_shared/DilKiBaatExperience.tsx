"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { HubChatInput } from "@/app/jobs/design-prototype/HubChatInput";
import { HubHeader } from "@/app/jobs/design-prototype/HubHeader";
import { VoiceChat } from "../daily-saathi/_components/VoiceChat";
import { PrivacyIcon } from "../chat/icons";

const AVATAR = "/assets/personal-companion/avatar-welcome.mp4";
const POSTER = "/assets/personal-companion/avatar.png";

// Emotion-scaffolding quick replies. Tapping one opens the chat with that text.
const CHIPS = [
  { id: "talk", label: "Just here to talk" },
  { id: "mind", label: "Got a lot on my mind" },
  { id: "good", label: "Something good happened" },
  { id: "overwhelmed", label: "Feeling overwhelmed" },
  { id: "noreason", label: "No reason, just felt like it" },
  { id: "vent", label: "Need to vent" },
];

// ── Companion persona ────────────────────────────────────────────────────────
// Dil Ki Baat starts with its own personality + interests. These stay stable for
// the first few sessions, then grow toward the user's interests over time so the
// companion can lead the user better. In V1 this drives the scripted "Get to know
// me" intro; later it seeds the AI system prompt (the persona the model plays).
export const PERSONA = {
  name: "Dil Ki Baat",
  interests: ["old Bollywood music (Kishore Kumar)", "chai", "cricket", "shayari"],
  recentlyInto: "re-watching classic 90s films",
  voice: "warm, curious, Hinglish-friendly; leads gently, never preachy",
  // Grows over sessions: 1–N stay on PERSONA.interests; later sessions blend in
  // the user's stated interests so suggestions feel personal.
};

// Companion-led "Get to know me" intro (companion speaks first).
const GTKM_INTRO = [
  "Arre, I'd love that — let me introduce myself properly.",
  "I'm Dil Ki Baat. Lately I'm a little obsessed with old Bollywood songs — Kishore Kumar on loop — and I never say no to chai.",
  "I also follow cricket and enjoy a good shayari now and then. What about you — what are you into these days?",
];

// Each user reply advances one turn; then it falls back to the generic engine.
const GTKM_REPLIES: string[][] = [
  ["Oh, I like that already.", "What got you into it?"],
  [
    "Love that — I'll remember it. Might even pick it up myself.",
    "What else makes your day a little better?",
  ],
  [
    "Noted. The more we chat, the more I'll get your vibe — and I'll start suggesting things you'd actually enjoy.",
    "Anything you wish you had more time for?",
  ],
  [
    "That's lovely. I'll keep gently nudging you toward it.",
    "For now — want to just talk, or tell me about your day?",
  ],
];

interface Msg {
  id: number;
  // "incognito" = centred system pill; companion = AI prompt; user = person
  role: "user" | "companion" | "incognito";
  text: string;
  chipId?: string; // when seeded from an intent chip → shared-layout morph
}

const COMPANION_REPLIES = [
  "Sun rahi hoon... bata, kya chal raha hai?",
  "Hmm, samajh sakti hoon. Aur batao.",
  "Main yahin hoon. Jo bhi mann mein hai, keh do.",
];

// Stubbed voice transcripts for the live voice-chat (no real STT in the prototype).
const VOICE_UTTERANCES = [
  "Aaj kaafi thaka hua feel kar raha hoon",
  "Pata nahi kyun mann udaas hai aaj",
  "Office mein bahut stress tha aaj",
];

// Shared Dil Ki Baat experience. `getToKnowMe` adds a lead "Get to know me" pill
// that opens a companion-led personality intro (PM Design only).
export function DilKiBaatExperience({ getToKnowMe = false }: { getToKnowMe?: boolean }) {
  const [view, setView] = useState<"home" | "chat">("home");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const [voiceChatOpen, setVoiceChatOpen] = useState(false);
  const idRef = useRef(0);
  const replyRef = useRef(0);
  const gtkmRef = useRef(false); // in the get-to-know-me scripted flow
  const gtkmTurnRef = useRef(0);
  // First-time users see "Get to know me" first; returning users see it last.
  const [firstVisit, setFirstVisit] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem("dkb_seen") != null) setFirstVisit(false);
    window.localStorage.setItem("dkb_seen", "1");
  }, []);

  const goHome = () => {
    window.location.href = "/";
  };

  // Stream one or more companion bubbles with human-like typing beats.
  function streamCompanion(bubbles: string[]) {
    let i = 0;
    const step = () => {
      if (i >= bubbles.length) return;
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        const text = bubbles[i++];
        setMessages((m) => [...m, { id: idRef.current++, role: "companion", text }]);
        setTimeout(step, 220);
      }, 700);
    };
    step();
  }

  function pushCompanionReply() {
    const text = COMPANION_REPLIES[replyRef.current % COMPANION_REPLIES.length];
    replyRef.current += 1;
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { id: idRef.current++, role: "companion", text }]);
    }, 1100);
  }

  // From home: open the chat, seeding it with the user's text/chip.
  function startChat(text: string, chipId?: string) {
    const t = text.trim();
    setInput("");
    gtkmRef.current = false;
    setView("chat");
    if (t) {
      setMessages([{ id: idRef.current++, role: "user", text: t, chipId }]);
      setTimeout(pushCompanionReply, 650);
    }
  }

  // "Get to know me" → companion introduces itself, then a two-way exchange.
  function startGetToKnowMe() {
    setInput("");
    setTyping(false);
    setMessages([]);
    setView("chat");
    gtkmRef.current = true;
    gtkmTurnRef.current = 0;
    setTimeout(() => streamCompanion(GTKM_INTRO), 280);
  }

  // Chat-header incognito button → a fresh chat fronted by a centred pill.
  function startIncognito() {
    setInput("");
    setTyping(false);
    gtkmRef.current = false;
    setMessages([{ id: idRef.current++, role: "incognito", text: "Incognito chat" }]);
    setView("chat");
  }

  // Speak → the live voice-chat overlay (same experience as Kaam Ki Baat).
  function openVoice() {
    setView("chat");
    setVoiceChatOpen(true);
  }

  function sendInChat() {
    const t = input.trim();
    if (!t) return;
    setMessages((m) => [...m, { id: idRef.current++, role: "user", text: t }]);
    setInput("");
    // In the get-to-know-me flow, advance the scripted persona turns.
    if (gtkmRef.current) {
      const turn = gtkmTurnRef.current++;
      if (turn < GTKM_REPLIES.length) {
        setTimeout(() => streamCompanion(GTKM_REPLIES[turn]), 450);
        return;
      }
      gtkmRef.current = false; // script exhausted → generic engine
    }
    setTimeout(pushCompanionReply, 450);
  }

  // ── Live voice-chat overlay (shared VoiceChat) — rendered above the current
  // view so the chat underneath is never unmounted.
  const voiceOverlay = voiceChatOpen && (
    <VoiceChat
      title="Dil Ki Baat"
      subtitle="Active now"
      avatarBig={
        <video
          src={AVATAR}
          poster={POSTER}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="size-28 rounded-full object-cover"
          aria-label="Dil Ki Baat"
        />
      }
      avatarSmall={
        <video
          src={AVATAR}
          poster={POSTER}
          autoPlay
          muted
          loop
          playsInline
          className="size-11 shrink-0 rounded-full object-cover"
          aria-label="Dil Ki Baat"
        />
      }
      strings={{
        connecting: "Connecting…",
        prompt: "Say something",
        listening: "Listening…",
        thinking: "Thinking…",
        exitToText: "Switch to typing",
        back: "Back",
      }}
      utterances={VOICE_UTTERANCES}
      replies={COMPANION_REPLIES}
      onUserUtterance={(text) =>
        setMessages((m) => [...m, { id: idRef.current++, role: "user", text }])
      }
      onAssistantReply={(text) =>
        setMessages((m) => [...m, { id: idRef.current++, role: "companion", text }])
      }
      onExitToText={() => {
        setVoiceChatOpen(false);
        setView("chat");
      }}
    />
  );

  // ── Chat view ──
  if (view === "chat") {
    return (
      <div className="relative h-full">
        <div className="relative flex h-full flex-col bg-white">
          <HubHeader
            title="Dil Ki Baat"
            pageBg="white"
            onBack={() => setView("home")}
            titleSlot={
              <div className="flex items-center gap-2.5">
                <span className="relative inline-flex size-9 shrink-0">
                  <video
                    src={AVATAR}
                    poster={POSTER}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="size-full rounded-full object-cover"
                    aria-label="Dil Ki Baat"
                  />
                  <span
                    aria-hidden
                    className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-white bg-[#25ab21]"
                  />
                </span>
                <span className="font-jio text-[16px] font-semibold text-[#0c0d10]">
                  Dil Ki Baat
                </span>
              </div>
            }
            rightSlot={
              <button
                type="button"
                aria-label="Incognito chat"
                onClick={startIncognito}
                className="focus-visible:ring-primary-60 flex size-10 items-center justify-center rounded-full bg-[#f5f5f5] text-[#0c0d10] transition-transform duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.95]"
              >
                <PrivacyIcon className="size-[22px]" />
              </button>
            }
          />

          {/* messages */}
          <div
            className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{ paddingTop: "calc(env(safe-area-inset-top,0px) + 72px)" }}
          >
            {messages.map((m, i) => {
              // Incognito — centred light-grey pill with an icon + label
              if (m.role === "incognito") {
                return (
                  <div key={m.id} className="flex justify-center py-1">
                    <span className="text-body-2xs font-jio inline-flex items-center gap-1.5 rounded-full bg-[#eeeeef] px-3 py-1.5 font-medium text-[rgba(12,13,16,0.55)]">
                      <PrivacyIcon className="size-3.5" />
                      {m.text}
                    </span>
                  </div>
                );
              }
              // User — light grey pill, dark text, right
              if (m.role === "user") {
                return (
                  <div key={m.id} className="flex justify-end">
                    <motion.div
                      layoutId={m.chipId ? `intent-${m.chipId}` : undefined}
                      initial={m.chipId ? false : { opacity: 0, y: 12 }}
                      animate={m.chipId ? undefined : { opacity: 1, y: 0 }}
                      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                      className="text-body-s font-jio max-w-[80%] bg-[#eeeeef] px-3 py-2 text-[#0c0d10]"
                      style={{ borderRadius: "14px 14px 4px 14px" }}
                    >
                      {m.text}
                    </motion.div>
                  </div>
                );
              }
              // Companion — rises in from the bottom; avatar only on the LAST bubble
              // of a consecutive companion run.
              const isLast = i === messages.length - 1;
              const nextIsCompanion = !isLast && messages[i + 1].role === "companion";
              const showAvatar = !nextIsCompanion && !(isLast && typing);
              return (
                <motion.div
                  key={m.id}
                  className="flex items-end justify-start gap-2"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                >
                  {showAvatar ? (
                    <span
                      aria-hidden
                      className="size-7 shrink-0 rounded-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${POSTER})` }}
                    />
                  ) : (
                    <span aria-hidden className="size-7 shrink-0" />
                  )}
                  <div
                    className="bg-primary-30 text-body-s font-jio max-w-[78%] px-3 py-2 text-[#0c0d10]"
                    style={{ borderRadius: "14px 14px 14px 4px" }}
                  >
                    {m.text}
                  </div>
                </motion.div>
              );
            })}

            {/* Companion typing — rises in (avatar + three dots) */}
            {typing && (
              <motion.div
                className="flex items-end justify-start gap-2"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <span
                  aria-hidden
                  className="size-7 shrink-0 rounded-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${POSTER})` }}
                />
                <div
                  className="bg-primary-30 inline-flex gap-1 px-3.5 py-3.5"
                  style={{ borderRadius: "14px 14px 14px 4px" }}
                >
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="bg-primary-50 size-1.5 animate-bounce rounded-full"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          <HubChatInput
            variant="sleek"
            value={input}
            onChange={setInput}
            onSubmit={sendInChat}
            onSpeak={openVoice}
            placeholder="Type a message…"
          />
        </div>
        {voiceOverlay}
      </div>
    );
  }

  // ── Home (welcome) view ──
  return (
    <div className="relative h-full">
      <div className="relative flex h-full flex-col bg-white">
        <HubHeader
          title="Dil Ki Baat"
          pageBg="white"
          onBack={goHome}
          rightSlot={
            <button
              type="button"
              aria-label="Incognito chat"
              onClick={startIncognito}
              className="focus-visible:ring-primary-60 flex size-10 items-center justify-center rounded-full bg-[#f5f5f5] text-[#0c0d10] transition-transform duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.95]"
            >
              <PrivacyIcon className="size-[22px]" />
            </button>
          }
        />

        {/* Centre — avatar · content block */}
        <div
          className="flex min-h-0 flex-1 flex-col items-center justify-center gap-5 overflow-y-auto px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ paddingTop: "calc(env(safe-area-inset-top,0px) + 64px)" }}
        >
          {/* avatar */}
          <div
            className="relative flex items-center justify-center"
            style={{ width: 150, height: 150 }}
          >
            <span
              aria-hidden
              className="absolute rounded-full"
              style={{
                width: 150,
                height: 150,
                background:
                  "radial-gradient(circle, rgba(109,23,206,0.14) 0%, rgba(109,23,206,0) 70%)",
              }}
            />
            <span className="relative inline-flex" style={{ width: 136, height: 136 }}>
              <video
                src={AVATAR}
                poster={POSTER}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                className="size-full rounded-full object-cover"
                aria-label="Dil Ki Baat"
              />
              <span
                aria-hidden
                className="absolute right-1.5 bottom-1.5 size-5 rounded-full border-2 border-white bg-[#25ab21]"
              />
            </span>
          </div>

          {/* greeting + status */}
          <div className="flex flex-col items-center gap-2.5">
            <div className="flex max-w-[320px] flex-col items-center gap-1 text-center">
              <p className="font-jio text-2xl font-bold text-[#0c0d10]">Arre, aa gaye!</p>
              <p className="text-body-l font-jio text-[rgba(12,13,16,0.65)]">
                Batao, kaisa chal raha hai?
              </p>
            </div>
            <span className="text-body-2xs font-jio inline-flex items-center gap-1.5 font-medium text-[#25ab21]">
              <span className="size-1.5 rounded-full bg-[#25ab21]" />
              Active now
            </span>
          </div>
        </div>

        {/* Intent chips — above the input separator; tapping opens the chat.
            "Get to know me" leads for first-time users, trails for returning ones. */}
        {input.trim() === "" && (
          <div className="flex shrink-0 gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {getToKnowMe && firstVisit && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={startGetToKnowMe}
                className="bg-primary-30 text-primary-50 text-body-s font-jio focus-visible:ring-primary-60 flex shrink-0 items-center px-4 py-2 font-medium whitespace-nowrap focus:outline-none focus-visible:ring-2"
                style={{ borderRadius: 9999 }}
              >
                Get to know me
              </motion.button>
            )}
            {CHIPS.map((chip) => (
              <motion.button
                key={chip.id}
                layoutId={`intent-${chip.id}`}
                transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() => startChat(chip.label, chip.id)}
                className="bg-primary-30 text-primary-50 text-body-s font-jio focus-visible:ring-primary-60 flex shrink-0 items-center px-4 py-2 font-medium whitespace-nowrap focus:outline-none focus-visible:ring-2"
                style={{ borderRadius: 9999 }}
              >
                {chip.label}
              </motion.button>
            ))}
            {getToKnowMe && !firstVisit && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={startGetToKnowMe}
                className="bg-primary-30 text-primary-50 text-body-s font-jio focus-visible:ring-primary-60 flex shrink-0 items-center px-4 py-2 font-medium whitespace-nowrap focus:outline-none focus-visible:ring-2"
                style={{ borderRadius: 9999 }}
              >
                Get to know me
              </motion.button>
            )}
          </div>
        )}

        <HubChatInput
          variant="sleek"
          value={input}
          onChange={setInput}
          onSubmit={(v) => startChat(v)}
          onSpeak={openVoice}
          placeholder="Type a message…"
        />
      </div>
      {voiceOverlay}
    </div>
  );
}
