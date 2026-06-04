"use client";

import Image from "next/image";
import LottieReact from "lottie-react";
import { useEffect, useRef, useState } from "react";

import spinLoaderData from "./spin-loader.json";

import { JOBS_APP_BASE_PATH } from "@/lib/jobs-app-base-path";
import { HubChatInput } from "../../HubChatInput";
import { HubHeader } from "../../HubHeader";
import { MICROLEARN_ASSETS } from "../../hub-data";

// ── Constants ─────────────────────────────────────────────────────────────────

const USER_TRIGGER_TEXT =
  "Creator track. Tell me what's stuck - hooks, titles, thumbnails, or edits?";

const CHIPS = [
  { label: "Thumbnail not clicking?", iconSrc: `${MICROLEARN_ASSETS}/thumbnail.svg` },
  { label: "Titles are boring", iconSrc: `${MICROLEARN_ASSETS}/subtitle.svg` },
  { label: "ChatGPT prompt are not useful", iconSrc: `${MICROLEARN_ASSETS}/ai-sparkle.svg` },
  { label: "Views are dropping on videos", iconSrc: `${MICROLEARN_ASSETS}/views.svg` },
];

const SPINNER_DELAY_MS = 0;
const SPINNER_HOLD_MS = 1800;
const CHIP_STAGGER_MS = 140;
const AI_REPLY_DELAY_MS = 2000; // spinner → AI answer

// AI response for "Thumbnail not clicking?"
const THUMBNAIL_ANSWER = {
  text: "Likely your hook isn't visible in the thumbnail. The first 3 frames matter — face + text + tension.",
  planTitle: "My 12 minutes plan",
  steps: [
    "Hook patterns — what makes a face/text combo work",
    "Title-thumbnail match test — they should mean the same thing",
    "Thumbnail psychology — 1 emotion per thumbnail, not 3",
    "A/B mini-test — 3 thumbnails, pick winner in 24h",
    "Re-upload one old video with the new thumbnail",
  ],
};

const COURSE_STEPS = [
  {
    title: "Hook patterns — what makes a face/text combo work",
    content:
      'Hook = curiosity gap. First 3 seconds either tease something the viewer doesn\'t know yet, or shock them. "Most people miss this" is a hook. "Today I\'ll show you 5 tips" is not.',
  },
  {
    title: "Title-thumbnail match test — they should mean the same thing",
    content:
      'Your title and thumbnail should tell the same story. If the title says "I tried X for 30 days" — your face in the thumbnail should show surprise or transformation, not just a smile.',
  },
  {
    title: "Thumbnail psychology — 1 emotion per thumbnail, not 3",
    content:
      "Pick one dominant emotion: curiosity, shock, or desire. Cluttered thumbnails split attention. One face, one expression, one colour pop.",
  },
  {
    title: "A/B mini-test — 3 thumbnails, pick winner in 24h",
    content:
      "Upload 3 variations. Check CTR at 24h. Kill the two losers. The winner is your control — test against it next time.",
  },
  {
    title: "Re-upload one old video with the new thumbnail",
    content:
      "Pick a video with good watch time but low CTR. Swap the thumbnail using what you learned. Give it 48h and compare impressions vs clicks.",
  },
];

const BUBBLE_CSS = `@keyframes bubbleIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`;

// ── StepperCourse ─────────────────────────────────────────────────────────────

function StepCard({
  stepIdx,
  isCurrent,
  onContinue,
  cardRef,
}: {
  stepIdx: number;
  isCurrent: boolean;
  onContinue: () => void;
  cardRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const step = COURSE_STEPS[stepIdx];
  const isLast = stepIdx === COURSE_STEPS.length - 1;

  return (
    <div
      ref={cardRef}
      style={{
        border: "1px solid #e0e0e0",
        borderRadius: "12px",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        animation: "bubbleIn 0.3s ease-out both",
      }}
    >
      {/* Step counter + title */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <span style={{ fontSize: "14px", color: "#b5b5b5" }}>
          Step {stepIdx + 1} of {COURSE_STEPS.length}
        </span>
        <span style={{ fontSize: "16px", fontWeight: 500, color: "#000", lineHeight: "1.4" }}>
          {step.title}
        </span>
      </div>

      {/* Video placeholder */}
      <div
        style={{
          background: "#000",
          borderRadius: "12px",
          height: "194px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.1)",
            borderRadius: "30px",
            padding: "10px",
            display: "flex",
          }}
        >
          <Image
            src={`${MICROLEARN_ASSETS}/play.svg`}
            alt="Play"
            width={24}
            height={24}
            className="size-6"
            unoptimized
          />
        </div>
      </div>

      {/* Content text */}
      <p style={{ fontSize: "14px", color: "#000", lineHeight: "20px", margin: 0 }}>
        {step.content}
      </p>

      {/* Button — only visible on the current (latest) step */}
      {isCurrent && (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onContinue}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "10px 12px",
              borderRadius: "40px",
              background: "#f0e8fa",
              border: "none",
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: "14px", color: "#1b0633", whiteSpace: "nowrap" }}>
              {isLast ? "Finish course" : "Continue"}
            </span>
            <Image
              src={`${MICROLEARN_ASSETS}/chevron-right.svg`}
              alt=""
              width={16}
              height={16}
              className="size-4 shrink-0"
              unoptimized
            />
          </button>
        </div>
      )}
    </div>
  );
}

const WHATS_NEXT_OPTIONS = [
  { label: "Excel : VLOOKUP + Pivot Table", iconSrc: `${MICROLEARN_ASSETS}/excel.svg` },
  { label: "Titles that get clicks — 5 formulas", iconSrc: `${MICROLEARN_ASSETS}/subtitle.svg` },
  { label: "ChatGPT prompts for creators", iconSrc: `${MICROLEARN_ASSETS}/ai-sparkle.svg` },
  { label: "Grow views with Shorts strategy", iconSrc: `${MICROLEARN_ASSETS}/views.svg` },
];

function WhatsNext() {
  return (
    <div
      className="flex flex-col gap-3 w-full"
      style={{ animation: "bubbleIn 0.3s ease-out both" }}
    >
      <span style={{ fontSize: "16px", fontWeight: 500, color: "#000" }}>What&apos;s next?</span>
      <div className="flex flex-col gap-2">
        {WHATS_NEXT_OPTIONS.map((opt) => (
          <button
            key={opt.label}
            type="button"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 12px",
              borderRadius: "30px",
              background: "#f0e8fa",
              border: "none",
              cursor: "pointer",
              width: "fit-content",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Image
                src={opt.iconSrc}
                alt=""
                width={20}
                height={20}
                className="size-5 shrink-0"
                unoptimized
              />
              <span style={{ fontSize: "14px", fontWeight: 400, color: "#310a5d" }}>
                {opt.label}
              </span>
            </div>
            <Image
              src={`${MICROLEARN_ASSETS}/chevron-right.svg`}
              alt=""
              width={16}
              height={16}
              className="size-4 shrink-0"
              unoptimized
            />
          </button>
        ))}
      </div>
    </div>
  );
}

function CourseComplete({ onRestart }: { onRestart: () => void }) {
  return (
    <div
      style={{
        border: "1px solid #e0e0e0",
        borderRadius: "12px",
        padding: "16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        animation: "bubbleIn 0.3s ease-out both",
      }}
    >
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <div
          style={{
            background: "#00b259",
            borderRadius: "40px",
            padding: "12px",
            display: "flex",
            flexShrink: 0,
          }}
        >
          <Image
            src={`${MICROLEARN_ASSETS}/check-white.svg`}
            alt=""
            width={16}
            height={16}
            className="size-4"
            unoptimized
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <span style={{ fontSize: "16px", fontWeight: 500, color: "#000", whiteSpace: "nowrap" }}>
            Course complete
          </span>
          <span style={{ fontSize: "12px", color: "#b5b5b5", whiteSpace: "nowrap" }}>
            YouTube Hook Patterns
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={onRestart}
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "10px 12px",
          borderRadius: "40px",
          background: "#f0e8fa",
          border: "none",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: "14px", color: "#1b0633", whiteSpace: "nowrap" }}>Restart</span>
      </button>
    </div>
  );
}

function StepperCourse({
  containerRef,
  initialComplete = false,
}: {
  containerRef: React.RefObject<HTMLElement | null>;
  initialComplete?: boolean;
}) {
  const [visibleCount, setVisibleCount] = useState(initialComplete ? COURSE_STEPS.length : 1);
  const [finished, setFinished] = useState(initialComplete);
  const [showWhatsNext, setShowWhatsNext] = useState(initialComplete);
  const newCardRef = useRef<HTMLDivElement>(null);
  const whatsNextRef = useRef<HTMLDivElement>(null);

  function scrollToTop(el: HTMLDivElement | null) {
    const container = containerRef.current;
    if (!el || !container) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const elTop = el.getBoundingClientRect().top;
        const containerTop = container.getBoundingClientRect().top;
        container.scrollTo({
          top: container.scrollTop + (elTop - containerTop),
          behavior: "smooth",
        });
      });
    });
  }

  function scrollNewCardToTop() {
    scrollToTop(newCardRef.current);
  }

  function scrollWhatsNextToBottom() {
    const el = whatsNextRef.current;
    const container = containerRef.current;
    if (!el || !container) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Scroll so the bottom of whatsNext aligns with the bottom of the container
        const elBottom = el.getBoundingClientRect().bottom;
        const containerBottom = container.getBoundingClientRect().bottom;
        container.scrollTo({
          top: container.scrollTop + (elBottom - containerBottom),
          behavior: "smooth",
        });
      });
    });
  }

  // Scroll first card into view on mount — skip on resume
  useEffect(() => {
    if (initialComplete) return;
    scrollNewCardToTop();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleContinue() {
    if (visibleCount >= COURSE_STEPS.length) {
      setFinished(true);
      setTimeout(scrollNewCardToTop, 80);
      setTimeout(() => {
        setShowWhatsNext(true);
        setTimeout(() => scrollToTop(whatsNextRef.current), 80);
      }, 1200);
    } else {
      setVisibleCount((n) => n + 1);
      setTimeout(scrollNewCardToTop, 80);
    }
  }

  function handleRestart() {
    setVisibleCount(1);
    setFinished(false);
    setShowWhatsNext(false);
    setTimeout(scrollNewCardToTop, 80);
  }

  return (
    <div className="flex w-full flex-col gap-4">
      {Array.from({ length: visibleCount }).map((_, i) => (
        <StepCard
          key={i}
          stepIdx={i}
          isCurrent={i === visibleCount - 1 && !finished}
          onContinue={handleContinue}
          cardRef={i === visibleCount - 1 && !finished ? newCardRef : undefined}
        />
      ))}
      {finished && (
        <>
          <div ref={newCardRef}>
            <CourseComplete onRestart={handleRestart} />
          </div>
          {showWhatsNext && (
            <>
              {/* Divider between completed course and what's next */}
              <div
                style={{ height: "1px", background: "#f5f5f5", width: "100%", margin: "4px 0" }}
              />
              <div ref={whatsNextRef}>
                <WhatsNext />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

type Message = { id: number; role: "ai" | "user"; text: string };
type Stage = "ai" | "spinner" | "chips" | "user-spinner" | "ai-reply" | "done";
let _uid = 0;

// ── Components ────────────────────────────────────────────────────────────────

function LottieSpinner() {
  return (
    <div style={{ display: "flex", justifyContent: "flex-start" }}>
      <LottieReact animationData={spinLoaderData} loop style={{ width: 32, height: 32 }} />
    </div>
  );
}

function AiReply({ onStart, started }: { onStart: () => void; started: boolean }) {
  return (
    <div
      className="flex flex-col gap-4 items-start w-full"
      style={{ animation: "bubbleIn 0.3s ease-out both" }}
    >
      {/* Answer text */}
      <p
        style={{ fontSize: "16px", fontWeight: 500, lineHeight: "22px", color: "#000", margin: 0 }}
      >
        {THUMBNAIL_ANSWER.text}
      </p>

      {/* Plan section */}
      <div className="flex flex-col gap-[10px] w-full items-start">
        <p
          style={{
            fontSize: "16px",
            fontWeight: 500,
            lineHeight: "22px",
            color: "#000",
            margin: 0,
          }}
        >
          {THUMBNAIL_ANSWER.planTitle}
        </p>

        {/* Steps card */}
        <div
          style={{
            border: "1px solid #e0e0e0",
            borderRadius: "12px",
            padding: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {THUMBNAIL_ANSWER.steps.map((step, i) => (
            <div key={i}>
              <div style={{ display: "flex", gap: "13px", alignItems: "center" }}>
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "#e0e0e0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontSize: "12px",
                    color: "#141414",
                  }}
                >
                  {i + 1}
                </div>
                <span style={{ fontSize: "14px", color: "#000", lineHeight: "1.4", flex: 1 }}>
                  {step}
                </span>
              </div>
              {i < THUMBNAIL_ANSWER.steps.length - 1 && (
                <div style={{ height: 1, background: "#e0e0e0", marginTop: "16px" }} />
              )}
            </div>
          ))}
        </div>

        {/* Start course button — hidden once course started */}
        {!started && (
          <button
            type="button"
            onClick={onStart}
            style={{
              display: "inline-flex",
              alignItems: "center",
              alignSelf: "flex-start",
              gap: "6px",
              padding: "10px 12px",
              borderRadius: "40px",
              background: "#6d17ce",
              border: "none",
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: "14px", color: "#fff", whiteSpace: "nowrap" }}>
              Start course
            </span>
            <Image
              src={`${MICROLEARN_ASSETS}/chevron-right-white.svg`}
              alt=""
              width={16}
              height={16}
              className="size-4 shrink-0"
              unoptimized
            />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CreatorChatPage() {
  const [mounted, setMounted] = useState(false);
  const [isResume, setIsResume] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => [
    { id: 0, role: "user" as const, text: USER_TRIGGER_TEXT },
  ]);
  const [stage, setStage] = useState<Stage>("ai");
  const [input, setInput] = useState("");
  const [showStepper, setShowStepper] = useState(false);

  const mainRef = useRef<HTMLElement>(null);
  const lastMsgRef = useRef<HTMLDivElement>(null);
  const scrollPending = useRef(false);

  // First effect: detect URL, set all state, then mark mounted
  // Nothing renders until this fires — no flash of wrong state
  useEffect(() => {
    const resume = new URLSearchParams(window.location.search).get("resume") === "true";
    if (resume) {
      setIsResume(true);
      setStage("ai-reply");
      setShowStepper(true);
    }
    setMounted(true);
  }, []);

  // Initial sequence: spinner → chips (skip if resuming)
  useEffect(() => {
    if (!mounted || isResume) return;
    const t1 = setTimeout(() => setStage("spinner"), SPINNER_DELAY_MS);
    const t2 = setTimeout(() => setStage("chips"), SPINNER_DELAY_MS + SPINNER_HOLD_MS);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [mounted, isResume]); // eslint-disable-line react-hooks/exhaustive-deps

  // After every render — only scroll when user just sent a message
  useEffect(() => {
    if (!scrollPending.current) return;
    // Only consume the flag when stage === "user-spinner" (right after sendMessage rendered)
    if (stage !== "user-spinner") return;
    scrollPending.current = false;
    const el = lastMsgRef.current;
    const container = mainRef.current;
    if (!el || !container) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const elTop = el.getBoundingClientRect().top;
        const containerTop = container.getBoundingClientRect().top;
        container.scrollTo({
          top: container.scrollTop + (elTop - containerTop),
          behavior: "smooth",
        });
      });
    });
  });

  function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    scrollPending.current = true;
    setMessages((prev) => [...prev, { id: ++_uid, role: "user", text: trimmed }]);
    setInput("");
    // Show spinner after user message, then AI reply
    setStage("user-spinner");
    setTimeout(() => setStage("ai-reply"), AI_REPLY_DELAY_MS);
  }

  // Don't render until mounted so we know the URL (prevents SSR flash)
  if (!mounted) return null;

  return (
    <div className="relative flex flex-col bg-white text-fg" style={{ minHeight: "100dvh" }}>
      <style>{BUBBLE_CSS}</style>

      <main
        ref={mainRef}
        className="min-h-0 flex-1 overflow-y-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 72px)" }}
      >
        <div className="flex w-full flex-col gap-4" style={{ paddingBottom: "10vh" }}>
          {!isResume &&
            messages.map((msg, idx) => {
              const isUser = msg.role === "user";
              const isLast = idx === messages.length - 1;
              return (
                <div key={`wrap-${msg.id}`}>
                  <div
                    ref={isLast ? lastMsgRef : undefined}
                    style={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: isUser ? "flex-end" : "flex-start",
                    }}
                  >
                    <div
                      style={{
                        maxWidth: "75%",
                        padding: "10px 12px",
                        fontSize: "14px",
                        lineHeight: "1.5",
                        borderRadius: isUser ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
                        background: isUser ? "#f5f5f5" : "#f0e8fa",
                        color: "#1b0633",
                        animation: "bubbleIn 0.3s ease-out both",
                      }}
                    >
                      {msg.text}
                    </div>
                  </div>
                </div>
              );
            })}

          {/* Initial spinner (before chips) */}
          {!isResume && stage === "spinner" && <LottieSpinner />}

          {/* Chips */}
          {!isResume && stage === "chips" && (
            <div className="flex flex-col gap-[6px]">
              {CHIPS.map((chip, i) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => sendMessage(chip.label)}
                  className="w-fit select-none touch-manipulation outline-none active:opacity-70 transition-opacity"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 12px",
                    borderRadius: "30px",
                    background: "#f0e8fa",
                    animation: `bubbleIn 0.3s ease-out both`,
                    animationDelay: `${i * CHIP_STAGGER_MS}ms`,
                  }}
                >
                  <Image
                    src={chip.iconSrc}
                    alt=""
                    width={16}
                    height={16}
                    className="size-4 shrink-0 pointer-events-none"
                    unoptimized
                  />
                  <span style={{ fontSize: "14px", color: "#1b0633", whiteSpace: "nowrap" }}>
                    {chip.label}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Spinner after user sends a message */}
          {!isResume && stage === "user-spinner" && (
            <div>
              <LottieSpinner />
            </div>
          )}

          {/* AI reply — no scroll, stays in place */}
          {stage === "ai-reply" && (
            <div className="w-full">
              <AiReply onStart={() => setShowStepper(true)} started={showStepper} />
            </div>
          )}

          {/* Stepper course — shown after Start course tapped */}
          {showStepper && <StepperCourse containerRef={mainRef} initialComplete={isResume} />}
        </div>
      </main>

      <HubHeader
        title="Microlearning"
        backHref={`${JOBS_APP_BASE_PATH}/design-prototype/microlearning/`}
        rightIconSrc={`${MICROLEARN_ASSETS}/magic-edit.svg`}
        rightIconLabel="Magic edit"
        pageBg="white"
      />

      <HubChatInput
        placeholder="Ask me anything"
        value={input}
        onChange={setInput}
        onSubmit={sendMessage}
      />
    </div>
  );
}
