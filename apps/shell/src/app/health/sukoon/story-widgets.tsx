"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Frown, Home, Meh, Smile, Wind } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@intelligence/ui";

import {
  BREATH_PHASES,
  CLARIFY_MOOD,
  CLARIFY_TIME,
  type ClarifyOption,
  EXERCISE,
  FEELINGS,
  FINISH,
  type StoryAction,
  TOTAL_CYCLES,
} from "./story-data";

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

// ── Clarify chips ─────────────────────────────────────────────────────────────────

export function ClarifyChips({
  which,
  onAction,
}: {
  which: "mood" | "time";
  onAction: (a: StoryAction) => void;
}) {
  const options: ClarifyOption[] = which === "mood" ? CLARIFY_MOOD : CLARIFY_TIME;
  const action: StoryAction = which === "mood" ? "clarify-mood" : "clarify-time";
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

// ── Exercise card ───────────────────────────────────────────────────────────────

export function BreathCardWidget({ onAction }: { onAction: (a: StoryAction) => void }) {
  const [acted, setActed] = useState(false);
  return (
    <Widget className="p-3.5">
      <div className="flex items-center gap-3">
        <span className="bg-primary-20 text-primary-50 flex size-10 shrink-0 items-center justify-center rounded-xl">
          <Wind size={20} strokeWidth={1.8} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-bold">{EXERCISE.title}</div>
          <div className="text-fg-muted mt-0.5 text-[12px]">{EXERCISE.meta}</div>
        </div>
      </div>
      <div className="text-fg-muted mt-2.5 flex items-center gap-1.5 text-[12px]">
        <Check className="text-success shrink-0" size={14} /> {EXERCISE.social}
      </div>
      {!acted && (
        <div className="mt-3">
          <SecondaryButton
            onClick={() => {
              setActed(true);
              onAction("start-breath");
            }}
          >
            चलो, साथ में करते हैं <ArrowRight size={18} />
          </SecondaryButton>
        </div>
      )}
    </Widget>
  );
}

// ── Guided breathing (self-contained animated exercise) ───────────────────────────

export function BreathingWidget({ onAction }: { onAction: (a: StoryAction) => void }) {
  // Absolute step index across all cycles. step = tick % 4, cycle = tick / 4.
  const [tick, setTick] = useState(0);
  const reduceMotion = useReducedMotion();

  const stepIdx = tick % BREATH_PHASES.length;
  const cycle = Math.floor(tick / BREATH_PHASES.length);
  const phase = BREATH_PHASES[stepIdx];

  useEffect(() => {
    if (cycle >= TOTAL_CYCLES) {
      const t = window.setTimeout(() => onAction("finish"), 600);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => setTick((n) => n + 1), phase.durationMs);
    return () => window.clearTimeout(t);
  }, [tick, cycle, phase.durationMs, onAction]);

  const done = cycle >= TOTAL_CYCLES;

  return (
    <Widget className="p-5">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-primary-50 text-[12px] font-bold">
          चक्र {Math.min(cycle + 1, TOTAL_CYCLES)} / {TOTAL_CYCLES}
        </span>
        <span className="text-fg-muted text-[12px]">{EXERCISE.title}</span>
      </div>

      {/* Breathing orb */}
      <div className="relative mx-auto my-6 flex h-[200px] w-[200px] items-center justify-center">
        <span className="bg-primary-20/60 absolute inset-0 rounded-full" />
        <motion.span
          className="bg-primary-30 absolute size-[140px] rounded-full"
          animate={reduceMotion ? { scale: 1 } : { scale: done ? 1 : phase.scale }}
          transition={{ duration: reduceMotion ? 0 : phase.durationMs / 1000, ease: "easeInOut" }}
        />
        <span className="bg-primary-50 text-primary-fg relative z-10 flex size-[88px] items-center justify-center rounded-full text-center text-[15px] leading-tight font-bold">
          {done ? <Check size={34} /> : phase.label}
        </span>
      </div>

      <p className="text-fg-muted text-center text-[13px] leading-relaxed">
        {done ? "बस हो गया — आराम से।" : "गोले के साथ धीरे-धीरे साँस लीजिए।"}
      </p>

      <div className="mt-5">
        <SecondaryButton onClick={() => onAction("finish")}>
          {done ? (
            <>
              पूरा हुआ <Check size={18} />
            </>
          ) : (
            "बस करो"
          )}
        </SecondaryButton>
      </div>
    </Widget>
  );
}

// ── Finish / how-do-you-feel-now ──────────────────────────────────────────────────

export function FeedbackWidget({ goHome }: { goHome: () => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  const glyph = (icon: "smile" | "meh" | "frown") =>
    icon === "meh" ? (
      <Meh size={24} />
    ) : icon === "frown" ? (
      <Frown size={24} />
    ) : (
      <Smile size={24} />
    );

  return (
    <Widget className="p-4">
      <div className="flex flex-col items-center text-center">
        <span className="bg-primary-20 text-primary-50 mb-3 flex size-[72px] items-center justify-center rounded-full">
          <Wind size={36} />
        </span>
        <div className="text-[20px] font-bold">{FINISH.headline}</div>
        <div className="text-fg-muted mt-1.5 max-w-[260px] text-[13px] leading-relaxed">
          {FINISH.body}
        </div>
      </div>

      <div className="bg-surface mt-5 rounded-2xl border border-black/10 p-4">
        <div className="mb-3 text-[14px] font-bold">अब कैसा लग रहा है?</div>
        <div className="flex gap-2.5">
          {FEELINGS.map((f) => {
            const active = picked === f.id;
            // Grey by default; on tap it takes its sentiment colour: smile = green, meh = orange, frown = red.
            const toneOn =
              f.icon === "smile"
                ? "bg-success/10 border-success/10 text-success"
                : f.icon === "meh"
                  ? "bg-warning/10 border-warning/10 text-warning"
                  : "bg-error/10 border-error/10 text-error";
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setPicked(f.id)}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 rounded-xl border px-1.5 py-3 text-[12px] transition-all",
                  active ? cn(toneOn, "font-bold") : "bg-surface text-fg border-black/12",
                )}
              >
                {glyph(f.icon)}
                {f.label}
              </button>
            );
          })}
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
