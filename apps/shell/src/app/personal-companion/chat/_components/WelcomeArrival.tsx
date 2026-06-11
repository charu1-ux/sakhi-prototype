"use client";

import { useEffect, useRef, useState } from "react";

import { CompanionAvatar } from "./CompanionAvatar";
import { Composer } from "./Composer";
import { QuickChips } from "./QuickChips";
import { ChevronLeftIcon, DotsIcon, PhoneIcon } from "../icons";
import { COMPANION, UI, ttsLangFor, type UiLanguage } from "../companion-data";
import { speak } from "../tts";

type Props = {
  uiLanguage: UiLanguage;
  greetingLines: string[];
  isTyping: boolean;
  input: string;
  onInputChange: (v: string) => void;
  onSend: () => void;
  onStartVoice: () => void;
  onChip: (label: string) => void;
  onCall: () => void;
  onBack: () => void;
  onMenu: () => void;
};

// The "arrival" moment: a living-portrait avatar greets the user (spoken aloud),
// with text + voice + call right here. Replying transitions into the chat.
export function WelcomeArrival({
  uiLanguage,
  greetingLines,
  isTyping,
  input,
  onInputChange,
  onSend,
  onStartVoice,
  onChip,
  onCall,
  onBack,
  onMenu,
}: Props) {
  const t = UI[uiLanguage];
  const [speaking, setSpeaking] = useState(false);
  const spokeRef = useRef(false);

  // Speak the greeting aloud once it has fully arrived (voice-first arrival).
  // Deferred so it isn't a synchronous setState inside the effect body.
  useEffect(() => {
    if (spokeRef.current) return;
    const text = greetingLines.join(" ").trim();
    if (!text || isTyping) return;
    spokeRef.current = true;
    const to = setTimeout(() => {
      setSpeaking(true);
      void speak("dkb-welcome", text, ttsLangFor(uiLanguage), {
        onEnd: () => setSpeaking(false),
      });
    }, 250);
    return () => clearTimeout(to);
  }, [greetingLines, isTyping, uiLanguage]);

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#f5f5f5]">
      {/* soft purple ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 18%, rgba(139,47,232,0.16) 0%, rgba(245,245,245,0) 55%)",
        }}
      />

      {/* minimal top bar */}
      <div
        className="relative z-10 flex shrink-0 items-center justify-between px-3"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 10px)" }}
      >
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-white/70 text-[#0c0d10] backdrop-blur transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] outline-none focus-visible:ring-2 focus-visible:ring-[#8B2FE8] active:scale-[0.92]"
        >
          <ChevronLeftIcon className="size-5" />
        </button>
        <button
          type="button"
          onClick={onMenu}
          aria-label="Menu"
          className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-white/70 text-[#0c0d10] backdrop-blur transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] outline-none focus-visible:ring-2 focus-visible:ring-[#8B2FE8] active:scale-[0.92]"
        >
          <DotsIcon className="size-5" />
        </button>
      </div>

      {/* centre: living-portrait avatar + greeting */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center gap-6 overflow-y-auto px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div
          className="relative flex items-center justify-center"
          style={{ width: 220, height: 220 }}
        >
          {/* aura rings */}
          <span
            aria-hidden
            className="absolute rounded-full"
            style={{
              width: 200,
              height: 200,
              background:
                "radial-gradient(circle, rgba(109,23,206,0.18) 0%, rgba(109,23,206,0) 70%)",
              animation: `dkb-aura ${speaking ? "1.6s" : "3.2s"} ease-in-out infinite`,
            }}
          />
          <span
            aria-hidden
            className="absolute rounded-full border border-[#8B2FE8]/25"
            style={{
              width: 168,
              height: 168,
              animation: `dkb-aura2 ${speaking ? "1.8s" : "3.6s"} ease-in-out infinite`,
            }}
          />
          {/* breathing / floating avatar with shimmer sweep */}
          <span className="relative" style={{ animation: "dkb-float 6s ease-in-out infinite" }}>
            <span
              className="relative block"
              style={{
                animation: "dkb-breathe 4.5s ease-in-out infinite",
                filter: "drop-shadow(0 12px 28px rgba(109,23,206,0.28))",
              }}
            >
              <CompanionAvatar size={136} showActiveDot />
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
              >
                <span
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(115deg, transparent 38%, rgba(255,255,255,0.45) 50%, transparent 62%)",
                    transform: "translateX(-120%)",
                    animation: "dkb-shimmer 5.5s ease-in-out infinite",
                  }}
                />
              </span>
            </span>
          </span>
        </div>

        {/* status */}
        <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#25ab21]">
          <span className="size-1.5 rounded-full bg-[#25ab21]" />
          {COMPANION.name} · {t.activeNow}
        </span>

        {/* greeting text — rises in as it arrives */}
        <div className="flex max-w-[320px] flex-col items-center gap-1.5 text-center">
          {greetingLines.length === 0 ? (
            <span className="flex gap-1.5 py-2">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="size-2 rounded-full bg-[#6d17ce]/40"
                  style={{ animation: `dkb-aura 1.2s ${i * 0.18}s ease-in-out infinite` }}
                />
              ))}
            </span>
          ) : (
            greetingLines.map((line, i) => (
              <p
                key={i}
                className={
                  i === 0
                    ? "text-[24px] leading-tight font-bold text-[#0c0d10]"
                    : "text-[16px] leading-snug text-[rgba(12,13,16,0.7)]"
                }
                style={{ animation: `dkb-rise 500ms ${i * 0.12}s both ease-out` }}
              >
                {line}
              </p>
            ))
          )}
        </div>
      </div>

      {/* bottom: reply affordances (chips + composer + call) */}
      <div className="relative z-10 shrink-0">
        <div className="flex flex-col gap-2 pt-1">
          <QuickChips uiLanguage={uiLanguage} onPick={onChip} onCall={onCall} />
          <Composer
            uiLanguage={uiLanguage}
            value={input}
            onChange={onInputChange}
            onSend={onSend}
            onStartVoice={onStartVoice}
          />
          <button
            type="button"
            onClick={onCall}
            className="mx-3 mb-[max(env(safe-area-inset-bottom),10px)] flex cursor-pointer items-center justify-center gap-2 rounded-full bg-[#ede7ff] py-3 text-[14px] font-bold text-[#6d17ce] transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] outline-none focus-visible:ring-2 focus-visible:ring-[#8B2FE8] active:scale-[0.98]"
          >
            <PhoneIcon className="size-[18px]" />
            {t.call} {COMPANION.name}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes dkb-breathe { 0%,100% { transform: scale(1); } 50% { transform: scale(1.035); } }
        @keyframes dkb-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
        @keyframes dkb-aura { 0%,100% { transform: scale(0.9); opacity: 0.5; } 50% { transform: scale(1.12); opacity: 0.9; } }
        @keyframes dkb-aura2 { 0%,100% { transform: scale(1); opacity: 0.35; } 50% { transform: scale(1.18); opacity: 0.7; } }
        @keyframes dkb-shimmer { 0% { transform: translateX(-120%); } 55%,100% { transform: translateX(120%); } }
        @keyframes dkb-rise { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
}
