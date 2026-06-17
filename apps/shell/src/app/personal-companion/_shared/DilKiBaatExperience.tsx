"use client";

import { motion } from "framer-motion";
import { type ReactNode, useRef, useState } from "react";

import { HubChatInput } from "@/app/jobs/design-prototype/HubChatInput";
import { HubHeader } from "@/app/jobs/design-prototype/HubHeader";
import { AttachSheet } from "../daily-saathi/_components/AttachSheet";
import { VoiceChat } from "../daily-saathi/_components/VoiceChat";
import { SAATHI } from "../daily-saathi/saathi-data";
import { useLang } from "../daily-saathi/saathi-i18n";
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

// ── "Just here to talk" — a gentle, getting-to-know-the-user opener ───────────
// Dil Ki Baat is presented as an assistant (not a person) — no invented persona
// or human interests. Tapping the pill opens with a warm intro and then asks
// about the USER, so it can learn their context over time (later: saved to
// memory). The user's reply advances one turn; then the generic engine takes over.
const TALK_REPLIES: string[][] = [
  ["Thank you for sharing that.", "What's been on your mind the most lately?"],
  ["I hear you.", "When you get a little time for yourself, what do you like to do?"],
  [
    "That's good to know about you.",
    "Is there something you've been wanting to make more time for?",
  ],
  [
    "Got it — I'll keep that in mind for you.",
    "Who or what usually lifts your mood on a tough day?",
  ],
  ["Thank you for letting me get to know you a little.", "I'm here whenever you'd like to talk."],
];

const USER_NAME = SAATHI.firstName?.trim() || "there";

interface Msg {
  id: number;
  // "private" = centred privacy notice; companion = AI prompt; user = person
  role: "user" | "companion" | "private";
  text: string;
  chipId?: string; // when seeded from an intent chip → shared-layout morph
  node?: ReactNode; // result card (e.g. a document summary) instead of a text bubble
}

// Hinglish acknowledgement for an attached document (before the summary card).
const DOC_ACK = ["Theek hai — main ise padh raha hoon.", "Yeh raha summary 👇"];

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

// Stubbed speech-to-text results for the composer mic (dictation → chat).
const DICTATION_STUBS = [
  "I've been feeling a little low today",
  "Honestly, I just wanted to talk",
  "Work has been a lot lately",
];

// Shared Dil Ki Baat experience.
export function DilKiBaatExperience() {
  const { t } = useLang();
  const [view, setView] = useState<"home" | "chat">("home");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const [voiceChatOpen, setVoiceChatOpen] = useState(false);
  const [dictating, setDictating] = useState(false); // composer mic → speech-to-text
  const [attachOpen, setAttachOpen] = useState(false); // attach (upload-doc) sheet
  const idRef = useRef(0);
  const replyRef = useRef(0);
  const talkRef = useRef(false); // in the "Just here to talk" scripted opener
  const talkTurnRef = useRef(0);
  const dictRef = useRef(0);

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
    talkRef.current = false;
    setView("chat");
    if (t) {
      setMessages([{ id: idRef.current++, role: "user", text: t, chipId }]);
      setTimeout(pushCompanionReply, 650);
    }
  }

  // "Just here to talk" → a warm intro, then a gentle get-to-know-the-user chat.
  function startTalk() {
    setInput("");
    setTyping(false);
    setView("chat");
    talkRef.current = true;
    talkTurnRef.current = 0;
    setMessages([{ id: idRef.current++, role: "user", text: "Just here to talk", chipId: "talk" }]);
    setTimeout(
      () =>
        streamCompanion([
          `Hi ${USER_NAME}, I'm your Daily Saathi. I'm glad you're here.`,
          "How are you doing today?",
        ]),
      500,
    );
  }

  // Chat-header privacy button → a fresh chat fronted by a centred privacy notice.
  function startPrivate() {
    setInput("");
    setTyping(false);
    talkRef.current = false;
    setMessages([{ id: idRef.current++, role: "private", text: "Private chat" }]);
    setView("chat");
  }

  // Speak → the live voice-chat overlay (same experience as Kaam Ki Baat).
  function openVoice() {
    setView("chat");
    setVoiceChatOpen(true);
  }

  function sendText(raw: string) {
    const t = raw.trim();
    if (!t) return;
    setMessages((m) => [...m, { id: idRef.current++, role: "user", text: t }]);
    setInput("");
    // In the "Just here to talk" opener, advance the scripted getting-to-know turns.
    if (talkRef.current) {
      const turn = talkTurnRef.current++;
      if (turn < TALK_REPLIES.length) {
        setTimeout(() => streamCompanion(TALK_REPLIES[turn]), 450);
        return;
      }
      talkRef.current = false; // script exhausted → generic engine
    }
    setTimeout(pushCompanionReply, 450);
  }

  function sendInChat() {
    sendText(input);
  }

  // Composer mic → speech-to-text. Opens a listening waveform; on send the
  // transcript posts as the user's message (no real STT in the prototype).
  function startDictation() {
    setView("chat");
    setDictating(true);
  }
  function cancelDictation() {
    setDictating(false);
  }
  function endDictation() {
    setDictating(false);
    sendText(DICTATION_STUBS[dictRef.current++ % DICTATION_STUBS.length]);
  }

  // Attach (paperclip) → upload-doc sheet, same as Kaam Ki Baat. Picking any
  // option drops the file into the chat and the companion summarises it.
  function openAttach() {
    setView("chat");
    setAttachOpen(true);
  }

  // A document summary card (mirrors the Kaam Ki Baat explain-a-doc result).
  const docSummaryCard = (
    <div className="bg-surface w-full rounded-xl border border-[rgba(12,13,16,0.08)] p-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <span className="text-primary-60 mb-2 block text-[10px] font-bold tracking-wide uppercase">
        {t.doc.summaryTag}
      </span>
      <ul className="flex flex-col gap-2">
        {t.doc.summary.map((point, i) => (
          <li
            key={i}
            className="font-jio flex items-start gap-2 text-[13px] leading-snug text-[#0c0d10]"
          >
            <span className="bg-primary-50 mt-1.5 size-1.5 shrink-0 rounded-full" />
            {point}
          </li>
        ))}
      </ul>
    </div>
  );

  function handleAttachPick() {
    setAttachOpen(false);
    talkRef.current = false;
    // Drop the document into the chat, then stream a warm ack + the summary card.
    setMessages((m) => [...m, { id: idRef.current++, role: "user", text: "Rent agreement.pdf" }]);
    let i = 0;
    const step = () => {
      if (i < DOC_ACK.length) {
        setTyping(true);
        setTimeout(() => {
          setTyping(false);
          setMessages((m) => [
            ...m,
            { id: idRef.current++, role: "companion", text: DOC_ACK[i++] },
          ]);
          setTimeout(step, 220);
        }, 650);
        return;
      }
      setMessages((m) => [
        ...m,
        { id: idRef.current++, role: "companion", text: "", node: docSummaryCard },
      ]);
    };
    setTimeout(step, 450);
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
                aria-label="Private chat"
                onClick={startPrivate}
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
              // Private chat — centred privacy notice (icon + title + reassurance)
              if (m.role === "private") {
                return (
                  <motion.div
                    key={m.id}
                    className="flex flex-col items-center gap-2 px-6 py-5 text-center"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <span className="flex size-11 items-center justify-center rounded-full bg-[#f0e8fa] text-[#6d17ce]">
                      <PrivacyIcon className="size-[22px]" />
                    </span>
                    <span className="font-jio text-[15px] font-bold text-[#0c0d10]">{m.text}</span>
                    <span className="font-jio max-w-[270px] text-[12px] leading-snug text-[rgba(12,13,16,0.5)]">
                      This chat won&rsquo;t appear in history and will be erased from memory.
                    </span>
                  </motion.div>
                );
              }
              // Result card (e.g. document summary) — left-aligned, avatar gutter
              if (m.node) {
                return (
                  <motion.div
                    key={m.id}
                    className="flex justify-start pl-9"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="w-full max-w-[88%]">{m.node}</div>
                  </motion.div>
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
            onAdd={openAttach}
            attachMode
            onDictate={startDictation}
            voiceMode={dictating}
            onVoiceSend={endDictation}
            onVoiceCancel={cancelDictation}
            placeholder="Type a message…"
          />
        </div>
        {attachOpen && (
          <AttachSheet onPick={handleAttachPick} onClose={() => setAttachOpen(false)} />
        )}
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
              aria-label="Private chat"
              onClick={startPrivate}
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
            "Just here to talk" opens a gentle getting-to-know-you conversation. */}
        {input.trim() === "" && (
          <div className="flex shrink-0 gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CHIPS.map((chip) => (
              <motion.button
                key={chip.id}
                layoutId={`intent-${chip.id}`}
                transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() => (chip.id === "talk" ? startTalk() : startChat(chip.label, chip.id))}
                className="bg-primary-30 text-primary-50 text-body-s font-jio focus-visible:ring-primary-60 flex shrink-0 items-center px-4 py-2 font-medium whitespace-nowrap focus:outline-none focus-visible:ring-2"
                style={{ borderRadius: 9999 }}
              >
                {chip.label}
              </motion.button>
            ))}
          </div>
        )}

        <HubChatInput
          variant="sleek"
          value={input}
          onChange={setInput}
          onSubmit={(v) => startChat(v)}
          onSpeak={openVoice}
          onAdd={openAttach}
          attachMode
          onDictate={startDictation}
          voiceMode={dictating}
          onVoiceSend={endDictation}
          onVoiceCancel={cancelDictation}
          placeholder="Type a message…"
        />
      </div>
      {attachOpen && <AttachSheet onPick={handleAttachPick} onClose={() => setAttachOpen(false)} />}
      {voiceOverlay}
    </div>
  );
}
