"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FileText, ImagePlus, Newspaper, X } from "lucide-react";
import { useRef, useState } from "react";

import { HubChatInput } from "@/app/jobs/design-prototype/HubChatInput";
import { HubHeader } from "@/app/jobs/design-prototype/HubHeader";
import { ChatIcon, PhoneIcon, PlayIcon, PrivacyIcon, VoiceWaveIcon } from "../chat/icons";

const AVATAR = "/assets/personal-companion/avatar-welcome.mp4";
const POSTER = "/assets/personal-companion/avatar.png";

type Lang = "en" | "hi";

// Companion copy — toggled by the header EN ↔ हिं switch.
const COPY: Record<
  Lang,
  {
    greetName: string;
    greetLine: string;
    speak: string;
    message: string;
    actions: [string, string, string];
    chatOpen: string;
  }
> = {
  en: {
    greetName: "Hi Akshay",
    greetLine: "How are you doing?",
    speak: "Talk to me",
    message: "Message",
    actions: ["Explain a document", "Create an image", "Today's briefing"],
    chatOpen: "Hey — tell me, how's it going?",
  },
  hi: {
    greetName: "नमस्ते अक्षय!",
    greetLine: "आज कैसा चल रहा है?",
    speak: "मुझसे बात करें",
    message: "मैसेज",
    actions: ["डॉक्यूमेंट समझाएँ", "इमेज बनाएँ", "आज की ब्रीफ़िंग"],
    chatOpen: "बताओ कैसे चल रहा है?",
  },
};

// Per-action quick-start chips — shown above the chat input inside each flow.
const DOC_CHIPS = [
  { id: "rent", label: "Summarize the rent agreement" },
  { id: "sms", label: "Explain the bank SMS" },
  { id: "form", label: "What does this form ask for?" },
];
const IMAGE_CHIPS = [
  { id: "diwali", label: "Diwali greeting card" },
  { id: "poster", label: "Poster for my shop" },
  { id: "bday", label: "Birthday card for my mom" },
];
const BRIEFING_CHIPS = [
  { id: "today", label: "What's new today?" },
  { id: "schedule", label: "My schedule today" },
  { id: "headlines", label: "Top headlines" },
];

// Landing quick-actions — 3×1 grid under the avatar. Labels come from COPY[lang].actions.
const QUICK_ACTIONS = [
  { icon: FileText, chips: DOC_CHIPS },
  { icon: ImagePlus, chips: IMAGE_CHIPS },
  { icon: Newspaper, chips: BRIEFING_CHIPS },
];

// Emotion-scaffolding quick replies. Tapping one continues the chat.
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

export default function PersonalCompanionDesignPrototypePage() {
  const [view, setView] = useState<"home" | "chat">("home");
  const [lang, setLang] = useState<Lang>("en");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [chatChips, setChatChips] = useState(CHIPS);
  const [chatAutoFocus, setChatAutoFocus] = useState(false);
  const idRef = useRef(0);
  const replyRef = useRef(0);
  const voiceStartRef = useRef(0);

  // Call screen state — `callActive` shows the call as an overlay over the
  // current view, so the chat underneath is never unmounted.
  const [callActive, setCallActive] = useState(false);

  const copy = COPY[lang];

  const goHome = () => {
    window.location.href = "/";
  };

  function pushCompanionReply() {
    const text = COMPANION_REPLIES[replyRef.current % COMPANION_REPLIES.length];
    replyRef.current += 1;
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { id: idRef.current++, role: "companion", text }]);
    }, 1100);
  }

  // Quick-action (doc / image / briefing) → open the chat with that flow's
  // quick-start chips above the input (no seeded message).
  function openAction(prompt: string, actionChips: { id: string; label: string }[]) {
    // Trailing space so the caret sits one space after the pre-filled prompt.
    setInput(`${prompt} `);
    setVoiceMode(false);
    setTyping(false);
    setChatChips(actionChips);
    setChatAutoFocus(true);
    setMessages([]);
    setView("chat");
  }

  // Message button → open the chat fronted by the companion's opening line
  // (in the current language), which rises in from the bottom.
  function openChatGreeting() {
    setInput("");
    setVoiceMode(false);
    setMessages([]);
    setTyping(false);
    setChatChips(CHIPS);
    setChatAutoFocus(false);
    setView("chat");
    const greeting = copy.chatOpen;
    window.setTimeout(() => {
      setMessages([{ id: idRef.current++, role: "companion", text: greeting }]);
    }, 260);
  }

  // Chat-header incognito button → a fresh chat fronted by a centred
  // "Incognito chat" pill (same treatment as the call pill).
  function startIncognito() {
    setInput("");
    setVoiceMode(false);
    setTyping(false);
    setMessages([{ id: idRef.current++, role: "incognito", text: "Incognito chat" }]);
    setChatChips(CHIPS);
    setChatAutoFocus(false);
    setView("chat");
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
    setCallActive(true);
  }

  function sendInChat() {
    const t = input.trim();
    if (!t) return;
    setMessages((m) => [...m, { id: idRef.current++, role: "user", text: t }]);
    setInput("");
    setTimeout(pushCompanionReply, 450);
  }

  // Quick-reply chip tapped inside the chat → send it as a user message.
  function sendChip(label: string) {
    setMessages((m) => [...m, { id: idRef.current++, role: "user", text: label }]);
    setTimeout(pushCompanionReply, 450);
  }

  const langToggle = (
    <div className="dark:bg-bg-elev flex items-center gap-0.5 rounded-full bg-[#eeeeef] p-0.5">
      {(["en", "hi"] as const).map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={lang === l}
          aria-label={l === "en" ? "English" : "Hindi"}
          onClick={() => setLang(l)}
          className={`focus-visible:ring-primary-60 rounded-full px-3 py-1.5 text-[13px] font-semibold transition-colors focus:outline-none focus-visible:ring-2 ${
            lang === l
              ? "dark:bg-bg-panel dark:text-ink bg-white text-[#0c0d10] shadow-sm"
              : "dark:text-ink-mute text-[rgba(12,13,16,0.5)]"
          }`}
        >
          {l === "en" ? "EN" : "हिं"}
        </button>
      ))}
    </div>
  );

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
          className="dark:bg-bg-panel absolute inset-0 z-50 flex h-full flex-col overflow-hidden bg-white"
        >
          {/* top — name */}
          <div
            className="relative z-10 flex flex-col items-center gap-1"
            style={{ paddingTop: "calc(env(safe-area-inset-top,0px) + 30px)" }}
          >
            <p className="font-jio dark:text-ink text-[18px] font-bold text-[#0c0d10]">
              Dil Ki Baat
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
              <VoiceWaveIcon className="dark:text-ink-mute size-6 text-[rgba(12,13,16,0.32)]" />
              <p className="text-body-m font-jio dark:text-ink-mute text-[rgba(12,13,16,0.45)]">
                Dil Ki Baat is listening
              </p>
            </div>
          </div>

          {/* bottom — close the call */}
          <div
            className="relative z-10 flex items-center justify-center"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom,0px) + 34px)" }}
          >
            <button
              type="button"
              aria-label="Close"
              onClick={() => setCallActive(false)}
              className="focus-visible:ring-primary-60 dark:bg-bg-elev dark:text-ink flex size-14 items-center justify-center rounded-full border border-[rgba(12,13,16,0.12)] bg-white text-[#0c0d10] transition-transform duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.95] dark:border-white/10"
            >
              <X className="size-6" strokeWidth={1.75} />
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
        <div className="dark:bg-bg-panel relative flex h-full flex-col bg-white">
          <HubHeader
            title="Daily Saathi"
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
                </span>
                <span className="flex flex-col">
                  <span className="font-jio dark:text-ink text-[16px] leading-tight font-semibold text-[#0c0d10]">
                    Daily Saathi
                  </span>
                  <span className="text-body-2xs font-jio inline-flex items-center gap-1 font-medium text-[#25ab21]">
                    <span className="size-1.5 rounded-full bg-[#25ab21]" />
                    Active now
                  </span>
                </span>
              </div>
            }
            rightSlot={
              <button
                type="button"
                aria-label="Incognito chat"
                onClick={startIncognito}
                className="focus-visible:ring-primary-60 dark:bg-bg-elev dark:text-ink flex size-10 items-center justify-center rounded-full bg-[#f5f5f5] text-[#0c0d10] transition-transform duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.95]"
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
              // Call-ended / Incognito — centred light-grey pill with an icon + label
              if (m.role === "call" || m.role === "incognito") {
                return (
                  <div key={m.id} className="flex justify-center py-1">
                    <span className="text-body-2xs font-jio dark:bg-bg-elev dark:text-ink-mute inline-flex items-center gap-1.5 rounded-full bg-[#eeeeef] px-3 py-1.5 font-medium text-[rgba(12,13,16,0.55)]">
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
                      className="text-body-s font-jio dark:text-ink max-w-[80%] bg-[#eeeeef] px-3 py-2 text-[#0c0d10] dark:bg-[#2a2d40]"
                      style={{ borderRadius: "14px 14px 4px 14px" }}
                    >
                      {m.voice ? (
                        <span className="flex items-center gap-2">
                          <PlayIcon className="size-4 shrink-0" />
                          <span className="flex items-center gap-[2px]" aria-hidden>
                            {[6, 11, 15, 9, 16, 7, 13, 8, 5, 12, 15, 8, 6].map((h, k) => (
                              <span
                                key={k}
                                className="dark:bg-ink-mute w-[2px] rounded-full bg-[rgba(12,13,16,0.45)]"
                                style={{ height: h }}
                              />
                            ))}
                          </span>
                          <span className="dark:text-ink-mute text-[rgba(12,13,16,0.55)] tabular-nums">
                            {m.text}
                          </span>
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
                    className="bg-primary-30 text-body-s font-jio dark:bg-primary-60/40 dark:text-ink max-w-[78%] px-3 py-2 text-[#0c0d10]"
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
                  className="bg-primary-30 dark:bg-primary-60/40 inline-flex gap-1 px-3.5 py-3.5"
                  style={{ borderRadius: "14px 14px 14px 4px" }}
                >
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="bg-primary-50 dark:bg-primary-20 size-1.5 animate-bounce rounded-full"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Intent chips — a separate row ABOVE the input (hidden while typing) */}
          {input.trim() === "" && (
            <div className="flex shrink-0 gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {chatChips.map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => sendChip(chip.label)}
                  className="bg-primary-30 text-primary-50 text-body-s font-jio focus-visible:ring-primary-60 dark:bg-primary-60/40 dark:text-primary-20 flex shrink-0 items-center rounded-full px-4 py-2 font-medium whitespace-nowrap focus:outline-none focus-visible:ring-2"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          )}

          <HubChatInput
            variant="companion"
            voiceMode={voiceMode}
            autoFocus={chatAutoFocus}
            value={input}
            onChange={setInput}
            onSubmit={sendInChat}
            onMic={enterVoice}
            onSpeak={openCall}
            onVoiceSend={sendVoiceNote}
            onVoiceCancel={cancelVoice}
            placeholder="Type a message…"
          />
        </div>
        {callOverlay}
      </div>
    );
  }

  // ── Landing (welcome) view ──
  return (
    <div className="relative h-full">
      <div className="dark:bg-bg-panel relative flex h-full flex-col bg-white">
        <HubHeader title="Daily Saathi" pageBg="white" onBack={goHome} rightSlot={langToggle} />

        {/* Upper cluster — greeting · avatar+ripple · quick-action cards */}
        <div
          className="flex min-h-0 flex-1 flex-col items-center gap-6 overflow-y-auto px-6 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ paddingTop: "calc(env(safe-area-inset-top,0px) + 76px)" }}
        >
          {/* 1 · greeting — addresses the user by name */}
          <div className="flex max-w-[320px] flex-col items-center gap-1 text-center">
            <p className="font-jio dark:text-ink text-2xl font-bold text-[#0c0d10]">
              {copy.greetName}
            </p>
            <p className="text-body-l font-jio dark:text-ink-soft text-[rgba(12,13,16,0.65)]">
              {copy.greetLine}
            </p>
          </div>

          {/* 2 · avatar with ripple — no status dot; rings emanate (call-screen pulse) */}
          <div
            className="relative flex shrink-0 items-center justify-center"
            style={{ width: 160, height: 160 }}
          >
            {[0, 1].map((i) => (
              <motion.span
                key={i}
                aria-hidden
                className="absolute top-1/2 left-1/2 rounded-full border border-[#6d17ce]"
                style={{ x: "-50%", y: "-50%", width: 136, height: 136 }}
                animate={{ width: [136, 192], height: [136, 192], opacity: [0, 0.3, 0] }}
                transition={{ duration: 3, ease: "easeOut", repeat: Infinity, delay: i * 1.5 }}
              />
            ))}
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
            </span>
          </div>

          {/* 3 · quick actions — 3×1 grid, plain stroke icons */}
          <div className="grid w-full max-w-[340px] grid-cols-3 gap-2.5">
            {QUICK_ACTIONS.map((action, i) => {
              const Icon = action.icon;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => openAction(copy.actions[i], action.chips)}
                  className="focus-visible:ring-primary-60 dark:bg-bg-elev flex flex-col items-center gap-2 rounded-3xl border border-[rgba(12,13,16,0.1)] bg-white px-2 py-4 text-center transition-transform duration-150 ease-out hover:scale-[1.02] focus:outline-none focus-visible:ring-2 active:scale-[0.97] dark:border-white/10"
                >
                  <Icon className="dark:text-ink size-5 text-[#0c0d10]" strokeWidth={1.5} />
                  <span className="text-body-2xs font-jio dark:text-ink-soft leading-tight font-medium text-[rgba(12,13,16,0.7)]">
                    {copy.actions[i]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom — Speak + Message */}
        <div
          className="flex shrink-0 items-start justify-center gap-6 px-6 pt-2"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom,0px) + 28px)" }}
        >
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              aria-label={copy.message}
              onClick={openChatGreeting}
              className="focus-visible:ring-primary-60 dark:bg-bg-elev dark:text-ink flex size-14 items-center justify-center rounded-full border border-[rgba(12,13,16,0.12)] bg-white text-[#0c0d10] transition-transform duration-150 ease-out hover:scale-[1.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.95] dark:border-white/10"
            >
              <ChatIcon className="size-6" />
            </button>
            <span className="text-body-2xs font-jio dark:text-ink-soft font-medium text-[rgba(12,13,16,0.7)]">
              {copy.message}
            </span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              aria-label={copy.speak}
              onClick={openCall}
              className="focus-visible:ring-primary-60 flex size-14 items-center justify-center rounded-full bg-[#3e0084] text-white transition-transform duration-150 ease-out hover:scale-[1.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.95]"
            >
              <VoiceWaveIcon className="size-6" />
            </button>
            <span className="text-body-2xs font-jio dark:text-ink-soft font-medium text-[rgba(12,13,16,0.7)]">
              {copy.speak}
            </span>
          </div>
        </div>
      </div>
      {callOverlay}
    </div>
  );
}
