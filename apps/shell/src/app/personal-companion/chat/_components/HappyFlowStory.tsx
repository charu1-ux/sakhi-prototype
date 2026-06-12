"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { CallScreen } from "./CallScreen";
import { CompanionHeader } from "./CompanionHeader";
import { MessageList } from "./MessageList";
import { PhoneIcon, RefreshIcon } from "../icons";
import type { ChatMessage, UiLanguage } from "../companion-data";
import { HAPPY_FLOW, type StoryStep } from "../story-data";

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

let sid = 0;
const newId = () => `s${Date.now()}_${sid++}`;

function loadLanguage(): UiLanguage {
  if (typeof window === "undefined") return "hinglish";
  const v = window.localStorage.getItem("dkb_ui_language");
  return v === "hi" || v === "en" || v === "hinglish" ? v : "hinglish";
}

// Auto-playing scripted demo. Drives the SAME chat components as the live flow;
// the only difference is that turns are scripted and the call is a gated step.
export function HappyFlowStory({ uiLanguage: initialLang }: { uiLanguage?: UiLanguage }) {
  const [uiLanguage] = useState<UiLanguage>(initialLang ?? loadLanguage());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [gated, setGated] = useState<{
    index: number;
    step: Extract<StoryStep, { type: "call" | "end" }>;
  } | null>(null);
  const [callOpen, setCallOpen] = useState(false);

  const startedRef = useRef(false);
  const callResumeIndexRef = useRef<number | null>(null);
  const steps = HAPPY_FLOW[uiLanguage];

  const push = useCallback((m: ChatMessage) => setMessages((prev) => [...prev, m]), []);

  // Play auto steps from `startIdx` until a gated step (call/end) is reached.
  const playFrom = useCallback(
    async (startIdx: number) => {
      for (let i = startIdx; i < steps.length; i++) {
        const step = steps[i];
        if (step.type === "loader") {
          setIsTyping(true);
          await sleep(step.hold);
          setIsTyping(false);
        } else if (step.type === "companion") {
          for (const text of step.bubbles) {
            setIsTyping(true);
            await sleep(450 + Math.random() * 250);
            setIsTyping(false);
            push({ id: newId(), sender: "companion", text, kind: "text" });
            await sleep(160);
          }
        } else if (step.type === "user") {
          await sleep(step.delay);
          push({ id: newId(), sender: "user", text: step.text, kind: "text" });
        } else {
          // gated: stop here and surface the CTA
          setGated({ index: i, step });
          return;
        }
      }
    },
    [push, steps],
  );

  useEffect(() => {
    if (startedRef.current) return; // StrictMode guard
    startedRef.current = true;
    void playFrom(0);
  }, [playFrom]);

  const handleCta = () => {
    if (!gated) return;
    if (gated.step.type === "call") {
      callResumeIndexRef.current = gated.index + 1;
      setGated(null);
      setCallOpen(true);
    } else {
      // replay
      setGated(null);
      setMessages([]);
      void playFrom(0);
    }
  };

  const handleCallEnd = (label: string) => {
    setCallOpen(false);
    push({ id: newId(), sender: "companion", text: label, kind: "call-record" });
    const resume = callResumeIndexRef.current;
    callResumeIndexRef.current = null;
    if (resume != null) void playFrom(resume);
  };

  const goHome = () => {
    if (window.parent !== window) {
      window.parent.postMessage({ type: "jobs:navigate", href: "/" }, "*");
    } else {
      window.location.href = "/";
    }
  };

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#f5f5f5]">
      <CompanionHeader
        uiLanguage={uiLanguage}
        onBack={goHome}
        onCall={() => {
          // In the demo, the header Call also drives the gated call if pending.
          if (gated?.step.type === "call") handleCta();
          else setCallOpen(true);
        }}
        onTitleClick={goHome}
        privateMode={false}
        onTogglePrivate={() => {}}
        canEnterPrivate={false}
      />

      <MessageList messages={messages} isTyping={isTyping} />

      {/* Footer: gated CTA, or a muted auto-play indicator */}
      <div
        className="flex shrink-0 flex-col gap-2 border-t border-[rgba(12,13,16,0.06)] bg-white px-4 pt-3"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" }}
      >
        {gated ? (
          <button
            type="button"
            onClick={handleCta}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#ede7ff] py-3.5 text-[15px] font-bold text-[#6d17ce] transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] outline-none focus-visible:ring-2 focus-visible:ring-[#8B2FE8] focus-visible:ring-offset-2 active:scale-[0.98]"
          >
            {gated.step.type === "call" ? (
              <PhoneIcon className="size-[18px]" />
            ) : (
              <RefreshIcon className="size-[18px]" />
            )}
            {gated.step.cta}
          </button>
        ) : (
          <div className="flex items-center justify-center gap-2 py-1.5 text-[12px] font-medium text-[rgba(12,13,16,0.4)]">
            <span className="inline-flex gap-1">
              <span className="size-1.5 animate-pulse rounded-full bg-[#6d17ce]/50" />
              <span className="size-1.5 animate-pulse rounded-full bg-[#6d17ce]/50 [animation-delay:200ms]" />
              <span className="size-1.5 animate-pulse rounded-full bg-[#6d17ce]/50 [animation-delay:400ms]" />
            </span>
            Demo · auto-playing
          </div>
        )}
      </div>

      {callOpen && <CallScreen uiLanguage={uiLanguage} onEnd={handleCallEnd} />}
    </div>
  );
}
