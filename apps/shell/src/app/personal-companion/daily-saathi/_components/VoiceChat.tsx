"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

import { ChevronLeftIcon, MicIcon } from "../../chat/icons";

// Shared live voice-chat mode (tap Speak). Used by Kaam Ki Baat and Dil Ki Baat
// so the experience is identical. A breathing avatar orb + status ("Connecting…"
// → "Say something" → "Listening…" → "Thinking…"); the spoken line is transcribed
// into the chat and the assistant replies; the keyboard button switches back to
// text. No real STT in the prototype — tapping the mic plays a stubbed turn.
// Fully prop-driven (avatar nodes, copy, content) — no i18n/avatar coupling.
type Phase = "connecting" | "ready" | "listening" | "thinking";
type VMsg = { id: number; role: "user" | "assistant"; text: string };

let vid = 0;

export type VoiceStrings = {
  connecting: string;
  prompt: string;
  listening: string;
  thinking: string;
  exitToText: string;
  back: string;
};

// Keyboard glyph (switch-to-typing) — no keyboard icon in the shared icon set.
function KeyboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2.5" y="6" width="19" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M7 10h.01M11 10h.01M15 10h.01M17 10h.01M8 14h8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

type Props = {
  title: string;
  subtitle?: string;
  // Pre-sized avatar nodes (image or video) for the large orb and the small orb.
  avatarBig: ReactNode;
  avatarSmall: ReactNode;
  strings: VoiceStrings;
  // Stubbed speech transcripts + canned replies (cycled per turn).
  utterances: string[];
  replies: string[];
  // Sync each turn back into the underlying chat so it persists on exit.
  onUserUtterance: (text: string) => void;
  onAssistantReply: (text: string) => void;
  onExitToText: () => void;
};

export function VoiceChat({
  title,
  subtitle,
  avatarBig,
  avatarSmall,
  strings,
  utterances,
  replies,
  onUserUtterance,
  onAssistantReply,
  onExitToText,
}: Props) {
  const [phase, setPhase] = useState<Phase>("connecting");
  const [msgs, setMsgs] = useState<VMsg[]>([]);

  const turnRef = useRef(0);
  const busyRef = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const after = (ms: number, fn: () => void) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
  };

  // Boot: connecting → ready.
  useEffect(() => {
    after(900, () => setPhase("ready"));
    const t = timers.current;
    return () => t.forEach(clearTimeout);
  }, []);

  // Tap mic → one scripted turn: listening → transcribe → thinking → reply.
  const speak = () => {
    if (busyRef.current || phase === "connecting") return;
    busyRef.current = true;
    setPhase("listening");
    after(1500, () => {
      const i = turnRef.current++;
      const userText = utterances[i % utterances.length];
      setMsgs((m) => [...m, { id: vid++, role: "user", text: userText }]);
      onUserUtterance(userText);
      setPhase("thinking");
      after(1300, () => {
        const reply = replies[i % replies.length];
        setMsgs((m) => [...m, { id: vid++, role: "assistant", text: reply }]);
        onAssistantReply(reply);
        setPhase("ready");
        busyRef.current = false;
      });
    });
  };

  const status =
    phase === "connecting"
      ? strings.connecting
      : phase === "listening"
        ? strings.listening
        : phase === "thinking"
          ? strings.thinking
          : strings.prompt;

  const started = msgs.length > 0;
  const orbActive = phase === "listening" || phase === "thinking";

  const orb = (big: boolean) => (
    <span
      className="relative flex items-center justify-center"
      style={{ width: big ? 168 : 56, height: big ? 168 : 56 }}
    >
      <span
        aria-hidden
        className="absolute rounded-full border border-[rgba(109,23,206,0.30)]"
        style={{
          width: big ? 140 : 52,
          height: big ? 140 : 52,
          animation: `vc-breathe ${orbActive ? "1.4s" : "3.2s"} ease-in-out infinite`,
        }}
      />
      {big ? avatarBig : avatarSmall}
    </span>
  );

  return (
    <div className="bg-surface absolute inset-0 z-50 flex flex-col text-[#0c0d10]">
      {/* Header */}
      <header
        className="bg-surface flex shrink-0 items-center gap-2.5 px-3 pb-3"
        style={{
          paddingTop: "calc(env(safe-area-inset-top, 0px) + 12px)",
          borderBottom: "1px solid rgba(12,13,16,0.08)",
        }}
      >
        <button
          type="button"
          aria-label={strings.back}
          onClick={onExitToText}
          className="bg-surface-ghost focus-visible:ring-primary-60 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#0c0d10] transition-transform duration-200 outline-none hover:scale-[1.05] focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.95]"
        >
          <ChevronLeftIcon className="size-5" />
        </button>
        {avatarSmall}
        <div className="min-w-0">
          <h1 className="text-title-s text-[#0c0d10]">{title}</h1>
          {subtitle && <p className="text-[12px] text-[rgba(12,13,16,0.65)]">{subtitle}</p>}
        </div>
      </header>

      {/* Stage — big orb when idle/empty; transcript once a turn has happened */}
      <main className="bg-surface-minimal min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {started ? (
          <div className="mx-auto flex w-full max-w-md flex-col gap-3">
            {msgs.map((m) =>
              m.role === "assistant" ? (
                <div
                  key={m.id}
                  className="bg-surface max-w-[84%] self-start rounded-[4px_18px_18px_18px] border border-[rgba(12,13,16,0.08)] px-3.5 py-2.5 text-[14px] leading-relaxed text-[#0c0d10] shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
                >
                  {m.text}
                </div>
              ) : (
                <div
                  key={m.id}
                  className="bg-primary-50 max-w-[84%] self-end rounded-[18px_18px_4px_18px] px-3.5 py-2.5 text-[14px] leading-relaxed text-white"
                >
                  {m.text}
                </div>
              ),
            )}
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-6">
            {orb(true)}
            <p className="text-[15px] font-medium text-[rgba(12,13,16,0.55)]">{status}</p>
          </div>
        )}
      </main>

      {/* Dock — small orb + status (when chatting) over the mic/keyboard row */}
      <div
        className="bg-surface flex shrink-0 flex-col items-center gap-3 border-t border-[rgba(12,13,16,0.08)] px-4 pt-3"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" }}
      >
        {started && (
          <div className="flex flex-col items-center gap-1.5">
            {orb(false)}
            <p className="text-[13px] font-medium text-[rgba(12,13,16,0.55)]">{status}</p>
          </div>
        )}
        <div className="flex items-center justify-center gap-6">
          <button
            type="button"
            aria-label={orbActive ? strings.listening : strings.prompt}
            onClick={speak}
            className={`focus-visible:ring-primary-60 flex size-14 cursor-pointer items-center justify-center rounded-full transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.95] ${
              phase === "listening"
                ? "bg-primary-50 animate-pulse text-white"
                : "bg-primary-20 text-primary-50 hover:scale-[1.05]"
            }`}
          >
            <MicIcon className="size-6" />
          </button>
          <button
            type="button"
            aria-label={strings.exitToText}
            onClick={onExitToText}
            className="bg-primary-20 text-primary-50 focus-visible:ring-primary-60 flex size-12 cursor-pointer items-center justify-center rounded-full transition-transform duration-200 outline-none hover:scale-[1.05] focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.95]"
          >
            <KeyboardIcon className="size-6" />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes vc-breathe {
          0%, 100% { transform: scale(1); opacity: 0.55; }
          50%      { transform: scale(1.12); opacity: 0.25; }
        }
        @media (prefers-reduced-motion: reduce) {
          [aria-hidden] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
