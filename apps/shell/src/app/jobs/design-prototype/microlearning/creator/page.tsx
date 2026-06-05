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
const AI_REPLY_DELAY_MS = 2000;

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

// ── StepCard ──────────────────────────────────────────────────────────────────

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
      className="animate-bubble-in flex flex-col gap-4 rounded-xl p-4"
      style={{ border: "1px solid #E5E5E5" }}
    >
      {/* Step counter + title */}
      <div className="flex flex-col gap-3">
        <span className="text-fg-muted text-sm">
          Step {stepIdx + 1} of {COURSE_STEPS.length}
        </span>
        <span className="text-base leading-snug font-medium text-black">{step.title}</span>
      </div>

      {/* Video placeholder */}
      <div
        className="flex items-center justify-center overflow-hidden rounded-xl bg-black"
        style={{ height: "194px" }}
      >
        <div className="flex rounded-[30px] bg-white/10 p-[10px]">
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

      {/* Content */}
      <p className="m-0 text-sm leading-5 text-black">{step.content}</p>

      {/* Continue button — only on the current step */}
      {isCurrent && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onContinue}
            className="bg-chip-surface inline-flex cursor-pointer items-center gap-1.5 rounded-full border-none px-3 py-2.5"
          >
            <span className="text-sm whitespace-nowrap" style={{ color: "#1B0633" }}>
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

// ── WhatsNext ─────────────────────────────────────────────────────────────────

const WHATS_NEXT_OPTIONS = [
  { label: "Excel : VLOOKUP + Pivot Table", iconSrc: `${MICROLEARN_ASSETS}/excel.svg` },
  { label: "Titles that get clicks — 5 formulas", iconSrc: `${MICROLEARN_ASSETS}/subtitle.svg` },
  { label: "ChatGPT prompts for creators", iconSrc: `${MICROLEARN_ASSETS}/ai-sparkle.svg` },
  { label: "Grow views with Shorts strategy", iconSrc: `${MICROLEARN_ASSETS}/views.svg` },
];

function WhatsNext() {
  return (
    <div className="animate-bubble-in flex w-full flex-col gap-3">
      <span className="text-base font-medium text-black">What&apos;s next?</span>
      <div className="flex flex-col gap-2">
        {WHATS_NEXT_OPTIONS.map((opt) => (
          <button
            key={opt.label}
            type="button"
            className="bg-chip-surface inline-flex w-fit cursor-pointer items-center gap-2 rounded-[30px] border-none px-3 py-2"
          >
            <Image
              src={opt.iconSrc}
              alt=""
              width={20}
              height={20}
              className="size-5 shrink-0"
              unoptimized
            />
            <span className="text-sm" style={{ color: "#1B0633" }}>
              {opt.label}
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
        ))}
      </div>
    </div>
  );
}

// ── CourseComplete ─────────────────────────────────────────────────────────────

function CourseComplete({ onRestart }: { onRestart: () => void }) {
  return (
    <div
      className="animate-bubble-in flex items-center justify-between rounded-xl p-4"
      style={{ border: "1px solid #E5E5E5" }}
    >
      <div className="flex items-center gap-3">
        <div className="bg-course-done flex shrink-0 rounded-full p-3">
          <Image
            src={`${MICROLEARN_ASSETS}/check-white.svg`}
            alt=""
            width={16}
            height={16}
            className="size-4"
            unoptimized
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-base font-medium whitespace-nowrap text-black">
            Course complete
          </span>
          <span className="text-fg-muted text-xs whitespace-nowrap">YouTube Hook Patterns</span>
        </div>
      </div>
      <button
        type="button"
        onClick={onRestart}
        className="bg-chip-surface inline-flex shrink-0 cursor-pointer items-center rounded-full border-none px-3 py-2.5"
      >
        <span className="text-sm whitespace-nowrap" style={{ color: "#1B0633" }}>
          Restart
        </span>
      </button>
    </div>
  );
}

// ── StepperCourse ─────────────────────────────────────────────────────────────

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
              <div className="bg-canvas-grey my-1 h-px w-full" />
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

// ── Types & helpers ────────────────────────────────────────────────────────────

type Message = { id: number; role: "ai" | "user"; text: string };
type Stage = "ai" | "spinner" | "chips" | "user-spinner" | "ai-reply" | "done";
let _uid = 0;

function LottieSpinner() {
  return (
    <div className="flex justify-start">
      <LottieReact animationData={spinLoaderData} loop style={{ width: 32, height: 32 }} />
    </div>
  );
}

// ── AiReply ───────────────────────────────────────────────────────────────────

function AiReply({ onStart, started }: { onStart: () => void; started: boolean }) {
  return (
    <div className="animate-bubble-in flex w-full flex-col items-start gap-4">
      <p className="m-0 text-base leading-snug font-medium text-black">{THUMBNAIL_ANSWER.text}</p>

      <div className="flex w-full flex-col items-start gap-[10px]">
        <p className="m-0 text-base leading-snug font-medium text-black">
          {THUMBNAIL_ANSWER.planTitle}
        </p>

        {/* Steps card */}
        <div
          className="flex w-full flex-col gap-4 rounded-xl p-3"
          style={{ border: "1px solid #E5E5E5" }}
        >
          {THUMBNAIL_ANSWER.steps.map((step, i) => (
            <div key={i}>
              <div className="flex items-center gap-[13px]">
                <div className="bg-step-track text-activity-percent flex size-5 shrink-0 items-center justify-center rounded-full text-xs">
                  {i + 1}
                </div>
                <span className="flex-1 text-sm leading-snug text-black">{step}</span>
              </div>
              {i < THUMBNAIL_ANSWER.steps.length - 1 && (
                <div className="mt-4 h-px" style={{ backgroundColor: "#F0F0F0" }} />
              )}
            </div>
          ))}
        </div>

        {/* Start course button */}
        {!started && (
          <button
            type="button"
            onClick={onStart}
            className="inline-flex cursor-pointer items-center gap-1.5 self-start rounded-full border-none px-3 py-2.5"
            style={{ backgroundColor: "#3E0084" }}
          >
            <span className="text-sm whitespace-nowrap text-white">Start course</span>
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
  const [messages, setMessages] = useState<Message[]>(() => {
    const isResume =
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("resume") === "true";
    const base: Message[] = [{ id: 0, role: "user" as const, text: USER_TRIGGER_TEXT }];
    if (isResume) {
      base.push({ id: 1, role: "user" as const, text: "Thumbnail not clicking?" });
      base.push({ id: 2, role: "ai" as const, text: THUMBNAIL_ANSWER.text });
    }
    return base;
  });
  const [stage, setStage] = useState<Stage>("ai");
  const [input, setInput] = useState("");
  const [showStepper, setShowStepper] = useState(false);

  const mainRef = useRef<HTMLElement>(null);
  const lastMsgRef = useRef<HTMLDivElement>(null);
  const scrollPending = useRef(false);

  useEffect(() => {
    const resume = new URLSearchParams(window.location.search).get("resume") === "true";
    if (resume) {
      setIsResume(true);
      setStage("ai-reply");
      setShowStepper(true);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || isResume) return;
    const t1 = setTimeout(() => setStage("spinner"), SPINNER_DELAY_MS);
    const t2 = setTimeout(() => setStage("chips"), SPINNER_DELAY_MS + SPINNER_HOLD_MS);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [mounted, isResume]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!scrollPending.current) return;
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

  function scrollToBottom(smooth = true) {
    const el = mainRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "instant" });
    });
  }

  useEffect(() => {
    if (stage !== "ai-reply") return;
    const t = setTimeout(() => scrollToBottom(true), 80);
    return () => clearTimeout(t);
  }, [stage]); // eslint-disable-line react-hooks/exhaustive-deps

  function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    scrollPending.current = true;
    setMessages((prev) => [...prev, { id: ++_uid, role: "user", text: trimmed }]);
    setInput("");
    setStage("user-spinner");
    setTimeout(() => setStage("ai-reply"), AI_REPLY_DELAY_MS);
  }

  if (!mounted) return null;

  return (
    <div className="text-fg relative flex min-h-dvh flex-col bg-white">
      <main
        ref={mainRef}
        className="min-h-0 flex-1 overflow-y-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 72px)" }}
      >
        <div className="flex w-full flex-col gap-4 pb-6">
          {/* Message bubbles */}
          {(isResume ? messages.filter((m) => m.role === "user") : messages).map((msg, idx) => {
            const isUser = msg.role === "user";
            const isLast = !isResume && idx === messages.length - 1;
            return (
              <div key={`wrap-${msg.id}`}>
                <div
                  ref={isLast ? lastMsgRef : undefined}
                  className={`flex w-full flex-row ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className="animate-bubble-in max-w-[75%] px-3 py-2.5 text-sm leading-relaxed"
                    style={{
                      borderRadius: isUser ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
                      background: isUser ? "#F5F5F5" : "rgb(var(--color-chip-surface))",
                      color: isUser ? "#404040" : "rgb(62 0 132)",
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Initial spinner */}
          {!isResume && stage === "spinner" && <LottieSpinner />}

          {/* Chips */}
          {!isResume && stage === "chips" && (
            <div className="flex flex-col gap-1.5">
              {CHIPS.map((chip, i) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => sendMessage(chip.label)}
                  className="bg-chip-surface flex w-fit cursor-pointer touch-manipulation items-center gap-2 rounded-[30px] border-none px-3 py-2 transition-opacity outline-none select-none active:opacity-70"
                  style={{
                    animation: "bubbleIn 0.3s ease-out both",
                    animationDelay: `${i * CHIP_STAGGER_MS}ms`,
                  }}
                >
                  <Image
                    src={chip.iconSrc}
                    alt=""
                    width={16}
                    height={16}
                    className="pointer-events-none size-4 shrink-0"
                    unoptimized
                  />
                  <span className="text-sm whitespace-nowrap" style={{ color: "#1B0633" }}>
                    {chip.label}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Spinner after user message */}
          {!isResume && stage === "user-spinner" && <LottieSpinner />}

          {/* AI reply */}
          {stage === "ai-reply" && (
            <div className="w-full">
              <AiReply onStart={() => setShowStepper(true)} started={showStepper} />
            </div>
          )}

          {/* Stepper course */}
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
