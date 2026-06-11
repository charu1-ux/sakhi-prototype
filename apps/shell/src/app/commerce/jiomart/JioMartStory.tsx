"use client";

import { motion, useReducedMotion } from "framer-motion";
import Lottie from "lottie-react";
import {
  ChevronLeft,
  Copy,
  MessageSquareText,
  PenLine,
  Plus,
  ThumbsDown,
  ThumbsUp,
  Volume2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@intelligence/ui";

import { HubChatInput } from "../../jobs/design-prototype/HubChatInput";
import spinLoaderData from "../../jobs/design-prototype/microlearning/creator/spin-loader.json";
import { type StoryAction, TIMING } from "./story-data";
import {
  CartWidget,
  ConfirmOrderWidget,
  DeliveryUpdatedWidget,
  NewAddressFormWidget,
  NewAddressLocationWidget,
  OrderPlacedWidget,
  SavedAddressesWidget,
  SwimLanes,
} from "./story-widgets";

// ── Transcript model ─────────────────────────────────────────────────────────────

type WidgetVariant =
  | "swimlanes"
  | "cart"
  | "saved"
  | "deliveryUpdated"
  | "newLoc"
  | "newForm"
  | "confirm"
  | "orderPlaced";

type Block =
  | { kind: "user"; id: string; text: string; mono?: boolean }
  | { kind: "asst"; id: string; text?: string; node?: ReactNode; feedback?: boolean }
  | { kind: "loader"; id: string; text: string }
  | { kind: "widget"; id: string; variant: WidgetVariant };

// ── Story orchestrator ───────────────────────────────────────────────────────────

export function JioMartStory() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [phase, setPhase] = useState(0);
  const scrollRef = useRef<HTMLElement | null>(null);
  // Ids that have already played their entrance — used so an existing block
  // (e.g. the first user prompt) never re-animates when later blocks appear.
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
    if (a === "checkout") setPhase(5);
    else if (a === "use-current-location") setPhase(13);
    else if (a === "save-address") setPhase(15);
    else if (a === "place-order") setPhase(17);
    // track-order: terminal, no-op
  }, []);

  // Mark every rendered block as "seen" after commit so it won't re-animate.
  useEffect(() => {
    blocks.forEach((b) => seenRef.current.add(b.id));
  }, [blocks]);

  // Auto-scroll to newest content whenever the transcript changes.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const id = requestAnimationFrame(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: reduceMotion ? "auto" : "smooth" });
    });
    return () => cancelAnimationFrame(id);
  }, [blocks, reduceMotion]);

  // Timeline state machine. Each phase appends its block(s) (idempotent by id) and
  // either schedules the next phase or waits for a gated button (via onAction).
  useEffect(() => {
    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
    // Defer the phase's immediate work off the effect body (avoids synchronous
    // setState-in-effect; idempotent appends keep Strict Mode double-runs safe).
    const now = (fn: () => void) => at(0, fn);
    const { initial, beat, searchHold, loaderHold, addressHold } = TIMING;

    switch (phase) {
      case 0:
        at(initial, () => {
          append({ kind: "user", id: "u-buy", text: "Buy apples and ghee" });
          setPhase(1);
        });
        break;

      case 1:
        now(() =>
          append({
            kind: "loader",
            id: "l-search",
            text: "Searching for apples and ghee on JioMart.",
          }),
        );
        at(searchHold, () => {
          remove("l-search");
          append({ kind: "widget", id: "w-lanes", variant: "swimlanes" });
        });
        at(searchHold + beat, () => setPhase(2));
        break;

      case 2:
        now(() =>
          append({
            kind: "asst",
            id: "a-offer",
            text: "Want me to add any of these to your cart?",
          }),
        );
        at(beat, () => setPhase(3));
        break;

      case 3:
        now(() =>
          append({
            kind: "user",
            id: "u-add",
            text: "Add the Royal Gala apples and the Milkfood ghee, then show my cart",
          }),
        );
        at(beat, () => setPhase(4));
        break;

      case 4:
        now(() =>
          append({ kind: "loader", id: "l-cart", text: "Adding both to your JioMart cart" }),
        );
        at(loaderHold, () => {
          replace("l-cart", {
            kind: "asst",
            id: "l-cart",
            text: "Added both to your JioMart cart. Here it is.",
          });
          append({ kind: "widget", id: "w-cart", variant: "cart" });
        });
        // gated: waits for Checkout → phase 5
        break;

      case 5:
        now(() =>
          append({
            kind: "user",
            id: "u-which-addr",
            text: "Which address is this being shipped to?",
          }),
        );
        at(beat, () => setPhase(6));
        break;

      case 6:
        now(() =>
          append({
            kind: "asst",
            id: "a-current-addr",
            feedback: true,
            node: (
              <>
                It&rsquo;s going to the address currently set as your JioMart delivery location{" "}
                <span className="text-fg-muted">(37 Cunningham Rd, Bengaluru — Home)</span>. Want me
                to keep it, or switch to a different saved address?
              </>
            ),
          }),
        );
        at(addressHold, () => setPhase(7));
        break;

      case 7:
        now(() =>
          append({ kind: "user", id: "u-show-saved", text: "Switch it — show my saved addresses" }),
        );
        at(beat, () => setPhase(8));
        break;

      case 8:
        now(() =>
          append({ kind: "loader", id: "l-saved", text: "Searching your saved JioMart addresses" }),
        );
        at(loaderHold, () => {
          replace("l-saved", {
            kind: "asst",
            id: "l-saved",
            text: "Here are your saved JioMart addresses. Tap one to make it the delivery address.",
          });
          append({ kind: "widget", id: "w-saved", variant: "saved" });
        });
        at(loaderHold + beat, () => setPhase(9));
        break;

      case 9:
        now(() => append({ kind: "user", id: "u-kanpur", text: "Use my Kanpur address" }));
        at(beat, () => setPhase(10));
        break;

      case 10:
        now(() => {
          append({
            kind: "asst",
            id: "a-switched",
            text: "Done — I’ve switched your delivery address to Kanpur.",
          });
          append({ kind: "widget", id: "w-delivery-updated", variant: "deliveryUpdated" });
        });
        at(beat, () => setPhase(11));
        break;

      case 11:
        now(() =>
          append({ kind: "user", id: "u-new-addr", text: "Actually, add a new address instead" }),
        );
        at(beat, () => setPhase(12));
        break;

      case 12:
        now(() => {
          append({
            kind: "asst",
            id: "a-share-loc",
            text: "Sure — share your location and I’ll capture the delivery address.",
          });
          append({ kind: "widget", id: "w-new-loc", variant: "newLoc" });
        });
        // gated: waits for "Use my current location" → phase 13
        break;

      case 13:
        now(() => append({ kind: "user", id: "u-use-loc", text: "Use my current location" }));
        at(beat, () => setPhase(14));
        break;

      case 14:
        now(() => {
          append({
            kind: "asst",
            id: "a-got-loc",
            text: "Got your location. Add a few details and I’ll save it.",
          });
          append({ kind: "widget", id: "w-new-form", variant: "newForm" });
        });
        // gated: waits for "Save & use this address" → phase 15
        break;

      case 15:
        now(() =>
          append({ kind: "user", id: "u-saved-checkout", text: "Saved it — take me to checkout" }),
        );
        at(beat, () => setPhase(16));
        break;

      case 16:
        now(() => {
          append({
            kind: "asst",
            id: "a-opening",
            text: "Saved and set as your delivery address. Opening your JioMart checkout.",
          });
          append({ kind: "widget", id: "w-confirm", variant: "confirm" });
        });
        // gated: waits for "Place Order" → phase 17
        break;

      case 17:
        now(() => append({ kind: "user", id: "u-place", text: "Place my order" }));
        at(beat, () => setPhase(18));
        break;

      case 18:
        now(() => append({ kind: "loader", id: "l-place", text: "Placing your order" }));
        at(loaderHold, () => {
          remove("l-place");
          append({ kind: "widget", id: "w-order-placed", variant: "orderPlaced" });
        });
        break;
    }

    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [phase, append, remove, replace]);

  return (
    <div className="bg-surface relative flex h-dvh flex-col overflow-hidden">
      {/* Header — gradient overlay */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[68px]">
        <div className="absolute inset-0 bg-gradient-to-b from-white from-[73%] to-transparent" />
        <div className="pointer-events-auto relative flex items-center gap-3 px-4 pt-3.5">
          <button
            type="button"
            aria-label="Back"
            onClick={() => {
              window.location.href = "/";
            }}
            className="bg-surface-minimal text-fg flex size-10 shrink-0 items-center justify-center rounded-full transition-transform duration-200 hover:scale-105 active:scale-95"
          >
            <ChevronLeft size={22} strokeWidth={2.4} />
          </button>
          <h1 className="flex-1 text-lg font-bold">Purchasing groceries</h1>
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

      {/* Chat thread */}
      <main ref={scrollRef} className="flex flex-1 flex-col overflow-y-auto px-4 pt-[68px] pb-5">
        {blocks.map((b, i) => {
          const prev = i > 0 ? blocks[i - 1] : null;
          // 32px before a new user prompt · 24px from a user prompt to the reply
          // · 12px between an AI prompt and its widget.
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
          // Animate the entrance only the first time a block id is rendered.
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

      {/* Dock — sleek variant: icon-only Speak button, fixed 48px height */}
      <HubChatInput variant="sleek" />
    </div>
  );
}

// ── Block renderer ───────────────────────────────────────────────────────────────

function BlockView({ block, onAction }: { block: Block; onAction: (a: StoryAction) => void }) {
  switch (block.kind) {
    case "user":
      return (
        <div
          className={cn(
            "bg-surface-minimal text-fg max-w-[80%] rounded-[18px_18px_4px_18px] px-3.5 py-2.5 text-[15px] leading-relaxed font-medium",
            block.mono && "font-mono text-[13px] break-all",
          )}
        >
          {block.text}
        </div>
      );

    case "asst":
      return (
        <div className="text-fg max-w-[92%] self-start text-[15px] leading-relaxed font-semibold">
          {block.node ?? block.text}
          {block.feedback && <FeedbackRow />}
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
    case "swimlanes":
      return <SwimLanes />;
    case "cart":
      return <CartWidget onAction={onAction} />;
    case "saved":
      return <SavedAddressesWidget />;
    case "deliveryUpdated":
      return <DeliveryUpdatedWidget />;
    case "newLoc":
      return <NewAddressLocationWidget onAction={onAction} />;
    case "newForm":
      return <NewAddressFormWidget onAction={onAction} />;
    case "confirm":
      return <ConfirmOrderWidget onAction={onAction} />;
    case "orderPlaced":
      return <OrderPlacedWidget onAction={onAction} />;
  }
}

function FeedbackRow() {
  const base =
    "text-fg-muted/70 transition-colors hover:text-primary-50 hover:scale-110 transition-transform";
  return (
    <div className="mt-2.5 flex items-center gap-[18px]">
      <button type="button" aria-label="Good" className={base}>
        <ThumbsUp size={18} />
      </button>
      <button type="button" aria-label="Bad" className={base}>
        <ThumbsDown size={18} />
      </button>
      <button type="button" aria-label="Copy" className={base}>
        <Copy size={18} />
      </button>
      <button type="button" aria-label="Read aloud" className={base}>
        <Volume2 size={18} />
      </button>
    </div>
  );
}
