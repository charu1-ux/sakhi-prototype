"use client";

import { motion, useReducedMotion } from "framer-motion";
import Lottie from "lottie-react";
import { PenLine } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@intelligence/ui";

import { HubChatInput } from "../../jobs/design-prototype/HubChatInput";
import { HubHeader } from "../../jobs/design-prototype/HubHeader";
import spinLoaderData from "../../jobs/design-prototype/microlearning/creator/spin-loader.json";
import { DeliveryAddressMenu, type DeliveryAddressMenuHandle } from "./DeliveryAddressMenu";
import { CURRENT_LOCATION_SAVED, type StoryAction, TIMING } from "./story-data";
import {
  CartWidget,
  ConfirmAddressActions,
  ConfirmOrderWidget,
  DeliveryAddressWidget,
  NewAddressLocationWidget,
  OrderPlacedWidget,
  SwimLanes,
} from "./story-widgets";

// ── Transcript model ─────────────────────────────────────────────────────────────

type WidgetVariant =
  | "swimlanes"
  | "cart"
  | "confirmAddress"
  | "deliveryAddress"
  | "newLoc"
  | "confirm"
  | "orderPlaced";

type Block =
  | { kind: "user"; id: string; text: string; mono?: boolean }
  | { kind: "asst"; id: string; text?: string; node?: ReactNode }
  | { kind: "loader"; id: string; text: string }
  | { kind: "widget"; id: string; variant: WidgetVariant };

// ── Story orchestrator ───────────────────────────────────────────────────────────

export function JioMartStory() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [phase, setPhase] = useState(0);
  const scrollRef = useRef<HTMLElement | null>(null);
  const addressMenuRef = useRef<DeliveryAddressMenuHandle>(null);
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
    else if (a === "confirm-address") setPhase(6);
    else if (a === "change-address") setPhase(7);
    else if (a === "use-current-location") {
      // Saved location → show that address; else capture it via the sheet.
      // Either way it lands on the confirmed-address step (8).
      if (CURRENT_LOCATION_SAVED) setPhase(8);
      else addressMenuRef.current?.openAddNew({ onSaved: () => setPhase(8) });
    } else if (a === "add-new-address") {
      addressMenuRef.current?.openAddNew({ manual: true, onSaved: () => setPhase(8) });
    } else if (a === "place-order") setPhase(10);
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
    const { initial, beat, searchHold, loaderHold } = TIMING;

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
        // After checkout, the AI states where it's shipping (the header address)
        // and offers Confirm / Change — no "which address?" user turn, no feedback row.
        now(() =>
          append({
            kind: "asst",
            id: "a-deliver-to",
            text: "Okay — this order is going to your JioMart delivery location (Home — 37, Cunningham Rd, Bengaluru). Do you want me to keep it, or switch to a different saved address?",
          }),
        );
        at(beat, () => append({ kind: "widget", id: "w-confirm-addr", variant: "confirmAddress" }));
        // gated: Confirm address → 6 · Change address → 7
        break;

      case 6:
        // Confirm → show the delivery address, then straight to "Confirm your order".
        now(() => {
          append({
            kind: "asst",
            id: "a-addr-confirmed",
            text: "Done — I’ve confirmed your delivery address as the one shown on your header.",
          });
          append({ kind: "widget", id: "w-delivery-addr", variant: "deliveryAddress" });
        });
        at(beat, () => setPhase(9));
        break;

      case 7:
        now(() => {
          append({
            kind: "asst",
            id: "a-share-loc",
            text: "Sure — share your location and I’ll capture the new delivery address.",
          });
          append({ kind: "widget", id: "w-new-loc", variant: "newLoc" });
        });
        // gated: Use current location → 8
        break;

      case 8:
        // Address captured/selected → confirm it, then continue to checkout.
        now(() => {
          append({
            kind: "asst",
            id: "a-loc-saved",
            text: "Done. I have confirmed your delivery address.",
          });
          append({ kind: "widget", id: "w-delivery-addr-loc", variant: "deliveryAddress" });
        });
        at(beat, () => setPhase(9));
        break;

      case 9:
        now(() => {
          append({
            kind: "asst",
            id: "a-opening",
            text: "Saved and set as your delivery address. Opening your JioMart checkout.",
          });
          append({ kind: "widget", id: "w-confirm", variant: "confirm" });
        });
        // gated: Place Order → 10
        break;

      case 10:
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
      <HubHeader
        title=""
        pageBg="white"
        onBack={() => {
          window.location.href = "/";
        }}
        titleSlot={<DeliveryAddressMenu ref={addressMenuRef} />}
        rightSlot={
          <button
            type="button"
            aria-label="New chat"
            onClick={() => {
              seenRef.current = new Set();
              setBlocks([]);
              setPhase(0);
            }}
            className="focus-visible:ring-primary-60 dark:bg-bg-elev dark:text-ink flex size-10 shrink-0 items-center justify-center rounded-full bg-[#f5f5f5] text-[#0c0d10] transition-transform duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.95]"
          >
            <PenLine size={19} strokeWidth={2} />
          </button>
        }
      />

      {/* Chat thread */}
      <main
        ref={scrollRef}
        className="isolate flex flex-1 flex-col overflow-y-auto px-4 pb-5"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 80px)" }}
      >
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
            "bg-surface-ghost text-fg max-w-[80%] rounded-[18px_18px_4px_18px] px-3.5 py-2.5 text-[15px] leading-relaxed font-medium dark:bg-[#2a2d40]",
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
    case "confirmAddress":
      return <ConfirmAddressActions onAction={onAction} />;
    case "deliveryAddress":
      return <DeliveryAddressWidget />;
    case "newLoc":
      return <NewAddressLocationWidget onAction={onAction} />;
    case "confirm":
      return <ConfirmOrderWidget onAction={onAction} />;
    case "orderPlaced":
      return <OrderPlacedWidget onAction={onAction} />;
  }
}
