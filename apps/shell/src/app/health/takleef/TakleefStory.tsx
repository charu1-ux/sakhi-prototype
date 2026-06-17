"use client";

import { motion, useReducedMotion } from "framer-motion";
import Lottie from "lottie-react";
import { PenLine } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@intelligence/ui";

import { HubChatInput } from "../../jobs/design-prototype/HubChatInput";
import { HubHeader } from "../../jobs/design-prototype/HubHeader";
import spinLoaderData from "../../jobs/design-prototype/microlearning/creator/spin-loader.json";
import { type StoryAction, TIMING } from "./story-data";
import { ClarifyChips, CloseCardWidget, TriageCardWidget } from "./story-widgets";

// ── Transcript model (mirrors ../nuskha) ──────────────────────────────────────────

type WidgetVariant = "clarifyDuration" | "clarifySeverity" | "triage" | "close";

type Block =
  | { kind: "user"; id: string; text: string }
  | { kind: "asst"; id: string; text?: string; node?: ReactNode }
  | { kind: "loader"; id: string; text: string }
  | { kind: "widget"; id: string; variant: WidgetVariant };

// ── Story orchestrator ─────────────────────────────────────────────────────────────

export function TakleefStory({
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
    if (a === "clarify-duration") setPhase(2);
    else if (a === "clarify-severity") setPhase(4);
    else if (a === "acknowledge") setPhase(6);
    else if (a === "finish") setPhase(8);
  }, []);

  // वापस घर / back: design prototype → pills home (onBack); PM design → health landing.
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
          append({ kind: "user", id: "u-symptom", text: "मुझे तेज़ बुखार और बदन दर्द है" });
          setPhase(1);
        });
        break;

      case 1:
        now(() => append({ kind: "loader", id: "l-q1", text: "आपकी तकलीफ़ समझ रही हूँ…" }));
        at(searchHold, () => {
          replace("l-q1", {
            kind: "asst",
            id: "l-q1",
            text: "ओह, बुखार में बदन टूटता है — आराम चाहिए। बताओ, यह कब से है?",
          });
          append({ kind: "widget", id: "w-duration", variant: "clarifyDuration" });
        });
        // gated: ClarifyChips → "clarify-duration" → phase 2
        break;

      case 2:
        now(() => append({ kind: "user", id: "u-duration", text: "2–3 दिन से" }));
        at(clarifyBeat, () => setPhase(3));
        break;

      case 3:
        now(() => {
          append({ kind: "asst", id: "a-sev", text: "अच्छा। और बुखार कितना तेज़ है?" });
          append({ kind: "widget", id: "w-severity", variant: "clarifySeverity" });
        });
        // gated: ClarifyChips → "clarify-severity" → phase 4
        break;

      case 4:
        now(() => append({ kind: "user", id: "u-severity", text: "तेज़ — 101° के आसपास" }));
        at(clarifyBeat, () => setPhase(5));
        break;

      case 5:
        now(() => append({ kind: "loader", id: "l-find", text: "आपके लक्षण देख रही हूँ…" }));
        at(loaderHold, () => {
          replace("l-find", {
            kind: "asst",
            id: "l-find",
            text: "समझ गई — 2 दिन का तेज़ बुखार। अक्सर यह वायरल होता है। घर पे ध्यान रखें, और इन बातों पे डॉक्टर ज़रूर दिखाएँ।",
          });
          append({ kind: "widget", id: "w-triage", variant: "triage" });
        });
        // gated: TriageCard → "acknowledge" → phase 6
        break;

      case 6:
        now(() => append({ kind: "user", id: "u-ack", text: "ठीक है, समझ गई" }));
        at(beat, () => setPhase(7));
        break;

      case 7:
        now(() => {
          append({
            kind: "asst",
            id: "a-close",
            text: "ध्यान रखिएगा — तबीयत और बिगड़े तो बिल्कुल देर मत कीजिए।",
          });
          append({ kind: "widget", id: "w-close", variant: "close" });
        });
        break;
    }

    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [phase, append, remove, replace]);

  return (
    <div className="bg-surface relative flex h-dvh flex-col overflow-hidden">
      <HubHeader
        title="क्या तकलीफ़ है?"
        pageBg="white"
        onBack={onBack}
        backHref="/health"
        rightSlot={
          !hideNewChat && (
            <button
              type="button"
              aria-label="New chat"
              className="focus-visible:ring-primary-60 dark:bg-bg-elev dark:text-ink flex size-10 shrink-0 items-center justify-center rounded-full bg-[#f5f5f5] text-[#0c0d10] transition-transform duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.95]"
            >
              <PenLine size={19} strokeWidth={2} />
            </button>
          )
        }
      />

      <main
        ref={scrollRef}
        className="flex flex-1 flex-col overflow-y-auto px-4 pb-5"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 80px)" }}
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
        <div className="bg-surface-ghost text-fg max-w-[80%] rounded-[18px_18px_4px_18px] px-3.5 py-2.5 text-[15px] leading-relaxed font-medium dark:bg-[#2a2d40]">
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
    case "clarifyDuration":
      return <ClarifyChips which="duration" onAction={onAction} />;
    case "clarifySeverity":
      return <ClarifyChips which="severity" onAction={onAction} />;
    case "triage":
      return <TriageCardWidget onAction={onAction} />;
    case "close":
      return <CloseCardWidget goHome={goHome} />;
  }
}
