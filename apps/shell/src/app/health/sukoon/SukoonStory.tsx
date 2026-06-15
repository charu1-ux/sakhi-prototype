"use client";

import { motion, useReducedMotion } from "framer-motion";
import Lottie from "lottie-react";
import { ChevronLeft, MessageSquareText, PenLine } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@intelligence/ui";

import { HubChatInput } from "../../jobs/design-prototype/HubChatInput";
import spinLoaderData from "../../jobs/design-prototype/microlearning/creator/spin-loader.json";
import { type StoryAction, TIMING } from "./story-data";
import { BreathCardWidget, BreathingWidget, ClarifyChips, FeedbackWidget } from "./story-widgets";

// ── Transcript model (mirrors ../nuskha) ──────────────────────────────────────────

type WidgetVariant = "clarifyMood" | "clarifyTime" | "exercise" | "breathing" | "feedback";

type Block =
  | { kind: "user"; id: string; text: string }
  | { kind: "asst"; id: string; text?: string; node?: ReactNode }
  | { kind: "loader"; id: string; text: string }
  | { kind: "widget"; id: string; variant: WidgetVariant };

// ── Story orchestrator ─────────────────────────────────────────────────────────────

export function SukoonStory({
  intro,
  onBack,
  hideNewChat,
}: {
  intro?: string;
  onBack?: () => void;
  hideNewChat?: boolean;
} = {}) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [phase, setPhase] = useState(0);
  const scrollRef = useRef<HTMLElement | null>(null);
  const seenRef = useRef<Set<string>>(new Set());
  const reduceMotion = useReducedMotion();

  const append = useCallback((b: Block) => {
    setBlocks((prev) => (prev.some((x) => x.id === b.id) ? prev : [...prev, b]));
  }, []);
  const replace = useCallback((id: string, b: Block) => {
    setBlocks((prev) => prev.map((x) => (x.id === id ? b : x)));
  }, []);
  const remove = useCallback((id: string) => {
    setBlocks((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const onAction = useCallback((a: StoryAction) => {
    if (a === "clarify-mood") setPhase(2);
    else if (a === "clarify-time") setPhase(4);
    else if (a === "start-breath") setPhase(6);
    else if (a === "finish") setPhase(8);
  }, []);

  // वापस घर / back: in the design prototype this returns to the pills home
  // (onBack); in PM design it falls back to the health landing.
  const goHome = useCallback(() => {
    if (onBack) onBack();
    else window.location.href = "/health";
  }, [onBack]);

  // Optional AI intro (the design prototype leads with the topic line).
  useEffect(() => {
    if (intro) append({ kind: "asst", id: "a-intro", text: intro });
  }, [intro, append]);

  useEffect(() => {
    blocks.forEach((b) => seenRef.current.add(b.id));
  }, [blocks]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const id = requestAnimationFrame(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: reduceMotion ? "auto" : "smooth" });
    });
    return () => cancelAnimationFrame(id);
  }, [blocks, reduceMotion]);

  // Timeline state machine. Each phase appends block(s) (idempotent by id) and
  // either schedules the next phase or waits for a gated button (via onAction).
  useEffect(() => {
    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
    const now = (fn: () => void) => at(0, fn);
    const { initial, beat, clarifyBeat, searchHold, loaderHold } = TIMING;

    switch (phase) {
      case 0:
        at(initial, () => {
          append({ kind: "user", id: "u-symptom", text: "मन बहुत बेचैन है, नींद नहीं आ रही" });
          setPhase(1);
        });
        break;

      case 1:
        now(() => append({ kind: "loader", id: "l-q1", text: "आपकी बात समझ रही हूँ…" }));
        at(searchHold, () => {
          replace("l-q1", {
            kind: "asst",
            id: "l-q1",
            text: "एक गहरी साँस लीजिए — मैं हूँ ना। बताओ, अभी सबसे ज़्यादा क्या महसूस हो रहा है?",
          });
          append({ kind: "widget", id: "w-mood", variant: "clarifyMood" });
        });
        // gated: ClarifyChips → "clarify-mood" → phase 2
        break;

      case 2:
        now(() => append({ kind: "user", id: "u-mood", text: "घबराहट" }));
        at(clarifyBeat, () => setPhase(3));
        break;

      case 3:
        now(() => {
          append({ kind: "asst", id: "a-time", text: "ठीक है। अभी कितना समय निकाल सकती हैं?" });
          append({ kind: "widget", id: "w-time", variant: "clarifyTime" });
        });
        // gated: ClarifyChips → "clarify-time" → phase 4
        break;

      case 4:
        now(() => append({ kind: "user", id: "u-time", text: "5 मिनट" }));
        at(clarifyBeat, () => setPhase(5));
        break;

      case 5:
        now(() =>
          append({ kind: "loader", id: "l-find", text: "आपके लिए एक आसान अभ्यास चुन रही हूँ…" }),
        );
        at(loaderHold, () => {
          replace("l-find", {
            kind: "asst",
            id: "l-find",
            text: "चलिए, एक आसान साँस का अभ्यास करते हैं — 'बॉक्स ब्रीदिंग'। घबराहट में यह तुरंत मन को शांत करता है।",
          });
          append({ kind: "widget", id: "w-exercise", variant: "exercise" });
        });
        // gated: BreathCard → "start-breath" → phase 6
        break;

      case 6:
        now(() => append({ kind: "user", id: "u-start", text: "हाँ, शुरू करो" }));
        at(beat, () => setPhase(7));
        break;

      case 7:
        now(() => append({ kind: "widget", id: "w-breathing", variant: "breathing" }));
        // gated: Breathing finishes → "finish" → phase 8
        break;

      case 8:
        now(() => {
          append({ kind: "asst", id: "a-done", text: "धीरे-धीरे, सब ठीक हो जाएगा।" });
          append({ kind: "widget", id: "w-feedback", variant: "feedback" });
        });
        break;
    }

    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [phase, append, remove, replace]);

  return (
    <div className="bg-surface relative flex h-dvh flex-col overflow-hidden">
      <header className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[68px]">
        <div className="absolute inset-0 bg-gradient-to-b from-white from-[73%] to-transparent" />
        <div className="pointer-events-auto relative flex items-center gap-3 px-4 pt-3.5">
          <button
            type="button"
            aria-label="Back"
            onClick={() => {
              if (onBack) onBack();
              else window.location.href = "/health";
            }}
            className="bg-surface-minimal text-fg flex size-10 shrink-0 items-center justify-center rounded-full transition-transform duration-200 hover:scale-105 active:scale-95"
          >
            <ChevronLeft size={22} strokeWidth={2.4} />
          </button>
          <h1 className="flex-1 text-lg font-bold">साँस और सुकून</h1>
          <button
            type="button"
            aria-label="Chats"
            className="bg-surface-minimal text-fg flex size-10 shrink-0 items-center justify-center rounded-full transition-transform duration-200 hover:scale-105 active:scale-95"
          >
            <MessageSquareText size={20} strokeWidth={2} />
          </button>
          {!hideNewChat && (
            <button
              type="button"
              aria-label="New chat"
              className="bg-surface-minimal text-fg flex size-10 shrink-0 items-center justify-center rounded-full transition-transform duration-200 hover:scale-105 active:scale-95"
            >
              <PenLine size={19} strokeWidth={2} />
            </button>
          )}
        </div>
      </header>

      <main
        ref={scrollRef}
        className="isolate flex flex-1 flex-col overflow-y-auto px-4 pt-[80px] pb-5"
      >
        {blocks.map((b, i) => {
          const prev = i > 0 ? blocks[i - 1] : null;
          const gap =
            i === 0
              ? ""
              : b.kind === "user"
                ? "mt-4"
                : prev?.kind === "user"
                  ? "mt-6"
                  : b.kind === "widget"
                    ? "mt-3"
                    : "mt-6";
          const seen = seenRef.current.has(b.id);
          return (
            <motion.div
              key={b.id}
              initial={seen ? false : { opacity: 0, y: reduceMotion ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
              className={cn(
                "flex w-full min-w-0 shrink-0 flex-col",
                gap,
                b.kind === "user" ? "items-end" : "items-stretch",
              )}
            >
              <BlockView block={b} onAction={onAction} goHome={goHome} />
            </motion.div>
          );
        })}
      </main>

      <HubChatInput variant="sleek" />
    </div>
  );
}

// ── Block renderer ───────────────────────────────────────────────────────────────

function BlockView({
  block,
  onAction,
  goHome,
}: {
  block: Block;
  onAction: (a: StoryAction) => void;
  goHome: () => void;
}) {
  switch (block.kind) {
    case "user":
      return (
        <div className="bg-surface-ghost text-fg max-w-[80%] rounded-[18px_18px_4px_18px] px-3.5 py-2.5 text-[15px] leading-relaxed font-medium">
          {block.text}
        </div>
      );
    case "asst":
      return (
        <div className="text-fg max-w-[92%] self-start text-[15px] leading-relaxed font-semibold">
          {block.node ?? block.text}
        </div>
      );
    case "loader":
      return (
        <div className="flex items-center gap-2.5 self-start">
          <Lottie animationData={spinLoaderData} loop className="size-8 shrink-0" />
          <span className="text-md text-fg font-medium">{block.text}</span>
        </div>
      );
    case "widget":
      return <WidgetView variant={block.variant} onAction={onAction} goHome={goHome} />;
  }
}

function WidgetView({
  variant,
  onAction,
  goHome,
}: {
  variant: WidgetVariant;
  onAction: (a: StoryAction) => void;
  goHome: () => void;
}) {
  switch (variant) {
    case "clarifyMood":
      return <ClarifyChips which="mood" onAction={onAction} />;
    case "clarifyTime":
      return <ClarifyChips which="time" onAction={onAction} />;
    case "exercise":
      return <BreathCardWidget onAction={onAction} />;
    case "breathing":
      return <BreathingWidget onAction={onAction} />;
    case "feedback":
      return <FeedbackWidget goHome={goHome} />;
  }
}
