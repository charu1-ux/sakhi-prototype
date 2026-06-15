"use client";

import { motion, useReducedMotion } from "framer-motion";
import Lottie from "lottie-react";
import { ChevronLeft, MessageSquareText, PenLine } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@intelligence/ui";

import { HubChatInput } from "../../jobs/design-prototype/HubChatInput";
import spinLoaderData from "../../jobs/design-prototype/microlearning/creator/spin-loader.json";
import { type StoryAction, TIMING } from "./story-data";
import { ClarifyChips, FinishWidget, ReminderSetupWidget } from "./story-widgets";

// ── Transcript model (mirrors ../nuskha) ──────────────────────────────────────────

type WidgetVariant = "clarifyWater" | "clarifyMeals" | "setup" | "finish";

type Block =
  | { kind: "user"; id: string; text: string }
  | { kind: "asst"; id: string; text?: string; node?: ReactNode }
  | { kind: "loader"; id: string; text: string }
  | { kind: "widget"; id: string; variant: WidgetVariant };

// ── Story orchestrator ─────────────────────────────────────────────────────────────

export function RemindersStory() {
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
    if (a === "clarify-water") setPhase(2);
    else if (a === "clarify-meals") setPhase(4);
    else if (a === "confirm") setPhase(6);
    else if (a === "finish") setPhase(8);
  }, []);

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
          append({
            kind: "user",
            id: "u-symptom",
            text: "खाना-पानी पीना याद नहीं रहता, रिमाइंडर लगा दो",
          });
          setPhase(1);
        });
        break;

      case 1:
        now(() => append({ kind: "loader", id: "l-q1", text: "ठीक है, सेट कर रही हूँ…" }));
        at(searchHold, () => {
          replace("l-q1", {
            kind: "asst",
            id: "l-q1",
            text: "बहुत अच्छा सोचा! अब मैं ख्याल रखूँगी 🙂 पहले बताओ — पानी कितनी-कितनी देर में याद दिलाऊँ?",
          });
          append({ kind: "widget", id: "w-water", variant: "clarifyWater" });
        });
        // gated: ClarifyChips → "clarify-water" → phase 2
        break;

      case 2:
        now(() => append({ kind: "user", id: "u-water", text: "हर 2 घंटे" }));
        at(clarifyBeat, () => setPhase(3));
        break;

      case 3:
        now(() => {
          append({ kind: "asst", id: "a-meals", text: "और खाने पे? किन वक़्त याद दिलाऊँ?" });
          append({ kind: "widget", id: "w-meals", variant: "clarifyMeals" });
        });
        // gated: ClarifyChips → "clarify-meals" → phase 4
        break;

      case 4:
        now(() => append({ kind: "user", id: "u-meals", text: "तीनों वक़्त" }));
        at(clarifyBeat, () => setPhase(5));
        break;

      case 5:
        now(() =>
          append({ kind: "loader", id: "l-find", text: "आपके रिमाइंडर तैयार कर रही हूँ…" }),
        );
        at(loaderHold, () => {
          replace("l-find", {
            kind: "asst",
            id: "l-find",
            text: "लीजिए — ये रहे आपके रिमाइंडर। कोई नहीं चाहिए तो बस बंद कर दीजिए, फिर 'सेट करें' दबा दीजिए।",
          });
          append({ kind: "widget", id: "w-setup", variant: "setup" });
        });
        // gated: ReminderSetup → "confirm" → phase 6
        break;

      case 6:
        now(() => append({ kind: "user", id: "u-confirm", text: "हाँ, सेट कर दो" }));
        at(beat, () => setPhase(7));
        break;

      case 7:
        now(() => {
          append({ kind: "asst", id: "a-done", text: "हो गया! अब याद दिलाती रहूँगी 🔔" });
          append({ kind: "widget", id: "w-finish", variant: "finish" });
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
              window.location.href = "/health";
            }}
            className="bg-surface-minimal text-fg flex size-10 shrink-0 items-center justify-center rounded-full transition-transform duration-200 hover:scale-105 active:scale-95"
          >
            <ChevronLeft size={22} strokeWidth={2.4} />
          </button>
          <h1 className="flex-1 text-lg font-bold">खाना-पानी रिमाइंडर</h1>
          <button
            type="button"
            aria-label="Chats"
            className="bg-surface-minimal text-fg flex size-10 shrink-0 items-center justify-center rounded-full transition-transform duration-200 hover:scale-105 active:scale-95"
          >
            <MessageSquareText size={20} strokeWidth={2} />
          </button>
          <button
            type="button"
            aria-label="New chat"
            className="bg-surface-minimal text-fg flex size-10 shrink-0 items-center justify-center rounded-full transition-transform duration-200 hover:scale-105 active:scale-95"
          >
            <PenLine size={19} strokeWidth={2} />
          </button>
        </div>
      </header>

      <main ref={scrollRef} className="flex flex-1 flex-col overflow-y-auto px-4 pt-[68px] pb-5">
        {blocks.map((b, i) => {
          const prev = i > 0 ? blocks[i - 1] : null;
          const gap =
            i === 0
              ? ""
              : b.kind === "user"
                ? "mt-8"
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
              <BlockView block={b} onAction={onAction} />
            </motion.div>
          );
        })}
      </main>

      <HubChatInput variant="sleek" />
    </div>
  );
}

// ── Block renderer ───────────────────────────────────────────────────────────────

function BlockView({ block, onAction }: { block: Block; onAction: (a: StoryAction) => void }) {
  switch (block.kind) {
    case "user":
      return (
        <div className="bg-surface-minimal text-fg max-w-[80%] rounded-[18px_18px_4px_18px] px-3.5 py-2.5 text-[15px] leading-relaxed font-medium">
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
      return <WidgetView variant={block.variant} onAction={onAction} />;
  }
}

function WidgetView({
  variant,
  onAction,
}: {
  variant: WidgetVariant;
  onAction: (a: StoryAction) => void;
}) {
  switch (variant) {
    case "clarifyWater":
      return <ClarifyChips which="water" onAction={onAction} />;
    case "clarifyMeals":
      return <ClarifyChips which="meals" onAction={onAction} />;
    case "setup":
      return <ReminderSetupWidget onAction={onAction} />;
    case "finish":
      return <FinishWidget />;
  }
}
