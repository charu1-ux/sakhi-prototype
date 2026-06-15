"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { HubChatInput } from "@/app/jobs/design-prototype/HubChatInput";
import { HubHeader } from "@/app/jobs/design-prototype/HubHeader";
import {
  ChatIcon,
  MuteIcon,
  MuteOffIcon,
  PhoneEndIcon,
  PhoneIcon,
  PhoneStrokeIcon,
  PlayIcon,
  PrivacyIcon,
  SpeakerIcon,
  VoiceWaveIcon,
} from "../chat/icons";

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

interface Msg {
  id: number;
  // "call"/"incognito" = centred system pills; companion = AI prompt; user = person
  role: "user" | "companion" | "call" | "incognito";
  text: string;
  chipId?: string; // when seeded from an intent chip → shared-layout morph
  voice?: boolean; // user voice note → waveform bubble instead of text
}

const COMPANION_REPLIES = [
  "Sun rahi hoon... bata, kya chal raha hai?",
  "Hmm, samajh sakti hoon. Aur batao.",
  "Main yahin hoon. Jo bhi mann mein hai, keh do.",
];

// mm:ss for the active-call timer.
function formatCall(total: number) {
  const m = Math.floor(total / 60)
    .toString()
    .padStart(2, "0");
  const s = (total % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function PersonalCompanionDesignPrototypePage() {
  const [view, setView] = useState<"home" | "chat">("home");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const idRef = useRef(0);
  const replyRef = useRef(0);
  const voiceStartRef = useRef(0);

  // Call screen state — `callActive` shows the call as an overlay over the
  // current view, so the chat underneath is never unmounted.
  const [callActive, setCallActive] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(false);

  const goHome = () => {
    window.location.href = "/";
  };

  // Tick the call timer for the lifetime of the call.
  useEffect(() => {
    if (!callActive) return;
    setCallSeconds(0);
    const id = window.setInterval(() => setCallSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [callActive]);

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
  // chipId drives the chip→bubble morph; the reply is delayed so it lands
  // after the morph settles (no abrupt loader pop).
  function startChat(text: string, chipId?: string) {
    const t = text.trim();
    setInput("");
    setVoiceMode(false);
    setView("chat");
    if (t) {
      setMessages([{ id: idRef.current++, role: "user", text: t, chipId }]);
      setTimeout(pushCompanionReply, 650);
    }
  }

  // From home (chat icon): open the chat, then let the first companion prompt
  // rise in from the bottom (no abrupt loader), then a typing beat → 2nd prompt.
  function openChatGreeting() {
    setInput("");
    setVoiceMode(false);
    setMessages([]);
    setTyping(false);
    setView("chat");
    window.setTimeout(() => {
      setMessages([
        { id: idRef.current++, role: "companion", text: "Hi, how was your day today?" },
      ]);
      window.setTimeout(() => {
        setTyping(true);
        window.setTimeout(() => {
          setTyping(false);
          setMessages((m) => [
            ...m,
            {
              id: idRef.current++,
              role: "companion",
              text: "Do you want to share anything today?",
            },
          ]);
        }, 1100);
      }, 800);
    }, 260);
  }

  // Chat-header incognito button → a fresh chat fronted by a centred
  // "Incognito chat" pill (same treatment as the call pill).
  function startIncognito() {
    setInput("");
    setVoiceMode(false);
    setTyping(false);
    setMessages([{ id: idRef.current++, role: "incognito", text: "Incognito chat" }]);
    setView("chat");
  }

  // Speak button (home or chat) → voice/listening mode: the composer becomes a
  // live waveform and the Speak icon becomes an arrow-up Send.
  function openVoiceChat() {
    setInput("");
    setMessages([]);
    setTyping(false);
    voiceStartRef.current = Date.now();
    setView("chat");
    setVoiceMode(true);
  }

  function enterVoice() {
    voiceStartRef.current = Date.now();
    setVoiceMode(true);
  }

  // Cancel listening → back to the text composer (or home if nothing was said yet).
  function cancelVoice() {
    setVoiceMode(false);
    if (messages.length === 0) setView("home");
  }

  // Send the voice note → a user waveform bubble with its duration, then a reply.
  function sendVoiceNote() {
    const sec = Math.max(1, Math.round((Date.now() - voiceStartRef.current) / 1000));
    const dur = `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
    setVoiceMode(false);
    setMessages((m) => [...m, { id: idRef.current++, role: "user", text: dur, voice: true }]);
    setTimeout(pushCompanionReply, 450);
  }

  function openCall() {
    setVoiceMode(false);
    setMuted(false);
    setSpeaker(false);
    setCallActive(true);
  }

  // Hang up → drop a centred call-ended timestamp pill into the chat, then
  // return to the chat so the call reads as part of the conversation.
  function endCall() {
    const now = new Date();
    const day = now.getDate();
    const month = now.toLocaleDateString("en-IN", { month: "short" });
    const time = now.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    const stamp = `Today, ${day} ${month} · ${time}`;
    setVoiceMode(false);
    setCallActive(false);
    setMessages((m) => [...m, { id: idRef.current++, role: "call", text: stamp }]);
    setView("chat");
  }

  function sendInChat() {
    const t = input.trim();
    if (!t) return;
    setMessages((m) => [...m, { id: idRef.current++, role: "user", text: t }]);
    setInput("");
    setTimeout(pushCompanionReply, 450);
  }

  // ── Call overlay — rendered ABOVE the current view (absolute, z-50) so the
  // chat underneath is never unmounted. Returning from a call therefore does
  // NOT re-load/animate the chat — only the new call pill appears.
  const callOverlay = (
    <AnimatePresence>
      {callActive && (
        <motion.div
          key="call"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 z-50 flex h-full flex-col overflow-hidden bg-white"
        >
          {/* top — name + running timer */}
          <div
            className="relative z-10 flex flex-col items-center gap-1"
            style={{ paddingTop: "calc(env(safe-area-inset-top,0px) + 30px)" }}
          >
            <p className="font-jio text-[18px] font-bold text-[#0c0d10]">Dil Ki Baat</p>
            <p className="text-body-s font-jio text-[rgba(12,13,16,0.45)] tabular-nums">
              {formatCall(callSeconds)}
            </p>
          </div>

          {/* centre — GIF inside a breathing border ring */}
          <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center gap-8">
            <div
              className="relative flex items-center justify-center"
              style={{ width: 240, height: 240 }}
            >
              {/* breathing ring — clean 1px light-grey border, ~20px offset from the GIF */}
              <motion.span
                aria-hidden
                className="absolute rounded-full"
                style={{ width: 200, height: 200, border: "1px solid rgba(12,13,16,0.14)" }}
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 3.2, ease: "easeInOut", repeat: Infinity }}
              />
              <span className="relative inline-flex" style={{ width: 160, height: 160 }}>
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
              </span>
            </div>

            {/* listening / speaking animation + subtext */}
            <div className="flex flex-col items-center gap-2.5">
              <VoiceWaveIcon className="size-6 text-[rgba(12,13,16,0.32)]" />
              <p className="text-body-m font-jio text-[rgba(12,13,16,0.45)]">
                Dil Ki Baat is listening
              </p>
            </div>
          </div>

          {/* bottom — Mute · Hang up (red, larger) · Speaker */}
          <div
            className="relative z-10 flex items-center justify-center gap-7"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom,0px) + 34px)" }}
          >
            <button
              type="button"
              aria-label={muted ? "Unmute" : "Mute"}
              onClick={() => setMuted((m) => !m)}
              className="focus-visible:ring-primary-60 flex size-14 items-center justify-center rounded-full border border-[rgba(12,13,16,0.12)] bg-white text-[#0c0d10] transition-transform duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.95]"
            >
              {muted ? <MuteOffIcon className="size-6" /> : <MuteIcon className="size-6" />}
            </button>

            <button
              type="button"
              aria-label="End call"
              onClick={endCall}
              className="flex size-[68px] items-center justify-center rounded-full bg-[#FA2F40] text-white transition-transform duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FA2F40] focus-visible:ring-offset-2 active:scale-[0.95]"
            >
              <PhoneEndIcon className="size-7" />
            </button>

            <button
              type="button"
              aria-label={speaker ? "Speaker off" : "Speaker on"}
              onClick={() => setSpeaker((s) => !s)}
              className={`focus-visible:ring-primary-60 flex size-14 items-center justify-center rounded-full border transition-transform duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.95] ${
                speaker
                  ? "bg-primary-30 text-primary-50 border-transparent"
                  : "border-[rgba(12,13,16,0.12)] bg-white text-[#0c0d10]"
              }`}
            >
              <SpeakerIcon className="size-6" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ── Chat view ──
  if (view === "chat") {
    return (
      <div className="relative h-full">
        <div className="relative flex h-full flex-col bg-white">
          <HubHeader
            title="Dil Ki Baat"
            pageBg="white"
            onBack={() => {
              setVoiceMode(false);
              setView("home");
            }}
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
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Incognito chat"
                  onClick={startIncognito}
                  className="focus-visible:ring-primary-60 flex size-10 items-center justify-center rounded-full bg-[#f5f5f5] text-[#0c0d10] transition-transform duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.95]"
                >
                  <PrivacyIcon className="size-[22px]" />
                </button>
                <button
                  type="button"
                  aria-label="Call Dil Ki Baat"
                  onClick={openCall}
                  className="focus-visible:ring-primary-60 flex size-10 items-center justify-center rounded-full bg-[#f5f5f5] text-[#0c0d10] transition-transform duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.95]"
                >
                  <PhoneStrokeIcon className="size-5" />
                </button>
              </div>
            }
          />

          {/* messages */}
          <div
            className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{ paddingTop: "calc(env(safe-area-inset-top,0px) + 72px)" }}
          >
            {messages.map((m, i) => {
              // Call-ended / Incognito — centred light-grey pill with an icon + label
              if (m.role === "call" || m.role === "incognito") {
                return (
                  <div key={m.id} className="flex justify-center py-1">
                    <span className="text-body-2xs font-jio inline-flex items-center gap-1.5 rounded-full bg-[#eeeeef] px-3 py-1.5 font-medium text-[rgba(12,13,16,0.55)]">
                      {m.role === "call" ? (
                        <PhoneIcon className="size-3.5" />
                      ) : (
                        <PrivacyIcon className="size-3.5" />
                      )}
                      {m.text}
                    </span>
                  </div>
                );
              }
              // User — light grey pill, dark text, right (text or a voice note)
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
                      {m.voice ? (
                        <span className="flex items-center gap-2">
                          <PlayIcon className="size-4 shrink-0" />
                          <span className="flex items-center gap-[2px]" aria-hidden>
                            {[6, 11, 15, 9, 16, 7, 13, 8, 5, 12, 15, 8, 6].map((h, k) => (
                              <span
                                key={k}
                                className="w-[2px] rounded-full bg-[rgba(12,13,16,0.45)]"
                                style={{ height: h }}
                              />
                            ))}
                          </span>
                          <span className="text-[rgba(12,13,16,0.55)] tabular-nums">{m.text}</span>
                        </span>
                      ) : (
                        m.text
                      )}
                    </motion.div>
                  </div>
                );
              }
              // Companion — rises in from the bottom; avatar only on the LAST bubble
              // of a consecutive companion run (earlier ones get a spacer so the run
              // stays indented and the avatar bottom-aligns to the last bubble).
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

            {/* Companion typing — rises in (avatar + three dots), then the reply replaces it */}
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
            voiceMode={voiceMode}
            value={input}
            onChange={setInput}
            onSubmit={sendInChat}
            onSpeak={enterVoice}
            onVoiceSend={sendVoiceNote}
            onVoiceCancel={cancelVoice}
            placeholder="Type a message…"
          />
        </div>
        {callOverlay}
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

        {/* Centre — three sections with a uniform gap: avatar · content block · actions */}
        <div
          className="flex min-h-0 flex-1 flex-col items-center justify-center gap-5 overflow-y-auto px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ paddingTop: "calc(env(safe-area-inset-top,0px) + 64px)" }}
        >
          {/* 1 · avatar — static, no float, no shadow */}
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

          {/* 2 · content block — greeting + status */}
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

          {/* 3 · actions — chat · call */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              aria-label="Chat"
              onClick={openChatGreeting}
              className="focus-visible:ring-primary-60 flex size-14 items-center justify-center rounded-full border border-[rgba(12,13,16,0.12)] bg-white text-[#0c0d10] transition-transform duration-150 ease-out hover:scale-[1.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.95]"
            >
              <ChatIcon className="size-6" />
            </button>
            <button
              type="button"
              aria-label="Call"
              onClick={openCall}
              className="focus-visible:ring-primary-60 flex size-14 items-center justify-center rounded-full border border-[rgba(12,13,16,0.12)] bg-white text-[#0c0d10] transition-transform duration-150 ease-out hover:scale-[1.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.95]"
            >
              <PhoneStrokeIcon className="size-6" />
            </button>
          </div>
        </div>

        {/* Intent chips — above the input separator; tapping opens the chat */}
        {input.trim() === "" && (
          <div className="flex shrink-0 gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
          </div>
        )}

        <HubChatInput
          variant="sleek"
          value={input}
          onChange={setInput}
          onSubmit={(v) => startChat(v)}
          onSpeak={openVoiceChat}
          placeholder="Type a message…"
        />
      </div>
      {callOverlay}
    </div>
  );
}
