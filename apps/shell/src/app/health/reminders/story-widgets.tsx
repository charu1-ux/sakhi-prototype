"use client";

import { AnimatePresence } from "framer-motion";
import { BellRing, Check, Droplet, Home, Minus, Moon, Plus, Sun, Sunrise } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";

import { cn } from "@intelligence/ui";

import {
  CLARIFY_MEALS,
  CLARIFY_WATER,
  type ClarifyOption,
  FINISH,
  formatClock,
  INTERVAL_MAX,
  INTERVAL_MIN,
  type Reminder,
  type ReminderIcon,
  REMINDERS,
  type StoryAction,
  TIME_STEP,
} from "./story-data";
import { ReminderTimeSheet } from "./TimeSheet";

// ── Shared building blocks (mirrors ../nuskha/story-widgets) ──────────────────────

/** Gated CTA — full-width pill, light-purple bg, dark-purple text (JDS primary 30/60). */
export function SecondaryButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-primary-30 text-primary-60 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-bold transition-transform duration-200 ease-out hover:scale-[1.02] active:scale-[0.97]"
    >
      {children}
    </button>
  );
}

function Widget({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "bg-surface self-stretch overflow-hidden rounded-2xl border border-black/10",
        className,
      )}
    >
      {children}
    </div>
  );
}

function ReminderGlyph({ icon, size = 22 }: { icon: ReminderIcon; size?: number }) {
  if (icon === "droplet") return <Droplet size={size} strokeWidth={1.9} />;
  if (icon === "sunrise") return <Sunrise size={size} strokeWidth={1.9} />;
  if (icon === "sun") return <Sun size={size} strokeWidth={1.9} />;
  return <Moon size={size} strokeWidth={1.9} />;
}

// ── Clarify chips ─────────────────────────────────────────────────────────────────

export function ClarifyChips({
  which,
  onAction,
}: {
  which: "water" | "meals";
  onAction: (a: StoryAction) => void;
}) {
  const options: ClarifyOption[] = which === "water" ? CLARIFY_WATER : CLARIFY_MEALS;
  const action: StoryAction = which === "water" ? "clarify-water" : "clarify-meals";
  return (
    <div className="flex flex-wrap gap-2 self-start">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onAction(action)}
          className="bg-surface-ghost text-fg rounded-full px-3.5 py-2 text-[13px] font-medium transition-transform duration-200 hover:scale-[1.03] active:scale-95"
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ── Time / interval stepper (− value +) ───────────────────────────────────────────

function Stepper({
  value,
  onDec,
  onInc,
  onPick,
  decDisabled,
  incDisabled,
}: {
  value: string;
  onDec: () => void;
  onInc: () => void;
  onPick: () => void;
  decDisabled?: boolean;
  incDisabled?: boolean;
}) {
  const btn =
    "flex size-9 shrink-0 items-center justify-center rounded-full bg-surface text-primary-50 border border-black/10 transition-transform duration-150 hover:scale-105 active:scale-90 disabled:opacity-30 disabled:hover:scale-100";
  return (
    <div className="mt-2.5 flex items-center gap-2">
      <button
        type="button"
        aria-label="कम करें"
        onClick={onDec}
        disabled={decDisabled}
        className={btn}
      >
        <Minus size={18} strokeWidth={2.4} />
      </button>
      <button
        type="button"
        onClick={onPick}
        className="bg-surface text-fg flex-1 rounded-full border border-black/10 py-2 text-center text-[15px] font-bold transition-transform duration-150 active:scale-[0.98]"
      >
        {value}
      </button>
      <button
        type="button"
        aria-label="बढ़ाएँ"
        onClick={onInc}
        disabled={incDisabled}
        className={btn}
      >
        <Plus size={18} strokeWidth={2.4} />
      </button>
    </div>
  );
}

// ── Reminder setup card (self-contained: per-reminder time + on/off) ──────────────

export function ReminderSetupWidget({ onAction }: { onAction: (a: StoryAction) => void }) {
  const [acted, setActed] = useState(false);
  const [editing, setEditing] = useState<Reminder | null>(null);
  const [on, setOn] = useState<Record<string, boolean>>(
    Object.fromEntries(REMINDERS.map((r) => [r.id, r.on])),
  );
  // Editable value per reminder: interval hours (water) or minutes-from-midnight (meals).
  const [vals, setVals] = useState<Record<string, number>>(
    Object.fromEntries(
      REMINDERS.map((r) => [r.id, r.kind === "interval" ? r.intervalHours : r.minutes]),
    ),
  );

  const count = REMINDERS.filter((r) => on[r.id]).length;
  const toggle = (id: string) => setOn((s) => ({ ...s, [id]: !s[id] }));
  const stepInterval = (id: string, dir: number) =>
    setVals((v) => ({ ...v, [id]: Math.min(INTERVAL_MAX, Math.max(INTERVAL_MIN, v[id] + dir)) }));
  const stepTime = (id: string, dir: number) =>
    setVals((v) => ({ ...v, [id]: (((v[id] + dir * TIME_STEP) % 1440) + 1440) % 1440 }));

  const displayValue = (r: Reminder) =>
    r.kind === "interval" ? `हर ${vals[r.id]} घंटे` : formatClock(vals[r.id]);

  return (
    <Widget className="p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="bg-primary-20 text-primary-50 flex size-9 shrink-0 items-center justify-center rounded-full">
          <BellRing size={18} strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-bold">आपके रिमाइंडर</div>
          <div className="text-fg-muted text-[12px]">{count} चालू · समय खुद बदलें</div>
        </div>
      </div>

      <div className="space-y-2">
        {REMINDERS.map((r) => {
          const active = !!on[r.id];
          return (
            <div
              key={r.id}
              className={cn(
                "rounded-xl border px-3 py-2.5 transition-colors",
                active ? "bg-surface border-black/10" : "bg-surface-minimal border-transparent",
              )}
            >
              <div className="flex items-center gap-3">
                <span className={cn("shrink-0", active ? "text-primary-50" : "text-black/30")}>
                  <ReminderGlyph icon={r.icon} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className={cn("text-[14px] font-medium", !active && "opacity-50")}>
                    {r.label}
                  </div>
                  <div className={cn("text-fg-muted text-[12px]", !active && "opacity-50")}>
                    {displayValue(r)}
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={active}
                  aria-label={`${r.label} रिमाइंडर`}
                  onClick={() => toggle(r.id)}
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full px-0.5 transition-colors duration-200",
                    active ? "bg-primary-50" : "bg-black/15",
                  )}
                >
                  <span
                    className={cn(
                      "size-5 rounded-full bg-white shadow transition-transform duration-200",
                      active ? "translate-x-5" : "translate-x-0",
                    )}
                  />
                </button>
              </div>

              {active &&
                (r.kind === "interval" ? (
                  <Stepper
                    value={displayValue(r)}
                    onDec={() => stepInterval(r.id, -1)}
                    onInc={() => stepInterval(r.id, +1)}
                    onPick={() => setEditing(r)}
                    decDisabled={vals[r.id] <= INTERVAL_MIN}
                    incDisabled={vals[r.id] >= INTERVAL_MAX}
                  />
                ) : (
                  <Stepper
                    value={displayValue(r)}
                    onDec={() => stepTime(r.id, -1)}
                    onInc={() => stepTime(r.id, +1)}
                    onPick={() => setEditing(r)}
                  />
                ))}
            </div>
          );
        })}
      </div>

      {!acted && (
        <div className="mt-4">
          <SecondaryButton
            onClick={() => {
              setActed(true);
              onAction("confirm");
            }}
          >
            रिमाइंडर सेट करें <Check size={18} />
          </SecondaryButton>
        </div>
      )}

      {/* Time picker — astro-style bottom sheet, portalled past the chat's transformed blocks */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {editing && (
              <ReminderTimeSheet
                reminder={editing}
                value={vals[editing.id]}
                onConfirm={(v) => {
                  setVals((s) => ({ ...s, [editing.id]: v }));
                  setEditing(null);
                }}
                onClose={() => setEditing(null)}
              />
            )}
          </AnimatePresence>,
          document.getElementById("reminders-chat-root") ?? document.body,
        )}
    </Widget>
  );
}

// ── Finish — "now I'll remind you" + a sample notification ────────────────────────

export function FinishWidget({ goHome }: { goHome: () => void }) {
  return (
    <Widget className="p-4">
      <div className="flex flex-col items-center text-center">
        <span className="bg-success/10 text-success mb-3 flex size-[72px] items-center justify-center rounded-full">
          <Check size={40} />
        </span>
        <div className="text-[20px] font-bold">{FINISH.headline}</div>
        <div className="text-fg-muted mt-1.5 max-w-[270px] text-[13px] leading-relaxed">
          {FINISH.body}
        </div>
      </div>

      {/* Sample notification preview */}
      <div className="bg-surface mt-5 rounded-2xl border border-black/10 p-3.5">
        <div className="text-fg-muted mb-2 text-[11px] font-bold tracking-wide uppercase">
          ऐसे याद दिलाऊँगी
        </div>
        <div className="bg-surface flex items-start gap-3 rounded-xl border border-black/10 p-3">
          <span className="bg-primary-20 text-primary-50 flex size-9 shrink-0 items-center justify-center rounded-full">
            <Droplet size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[14px] font-bold">{FINISH.sampleTitle}</div>
            <div className="text-fg-muted mt-0.5 text-[12px] leading-relaxed">
              {FINISH.sampleBody}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={goHome}
          className="bg-surface-ghost text-fg inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-bold transition-transform duration-200 ease-out hover:scale-[1.02] active:scale-[0.97]"
        >
          <Home size={17} /> वापस घर
        </button>
      </div>
    </Widget>
  );
}
