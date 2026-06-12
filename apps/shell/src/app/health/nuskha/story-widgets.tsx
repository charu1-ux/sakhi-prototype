"use client";

import {
  ArrowRight,
  Check,
  ChevronLeft,
  CupSoda,
  Flame,
  Frown,
  Leaf,
  Meh,
  Smile,
  Volume2,
} from "lucide-react";
import { useState } from "react";

import { cn } from "@intelligence/ui";

import {
  CLARIFY_SINCE,
  CLARIFY_WHERE,
  type ClarifyOption,
  FEELINGS,
  FINISH,
  REMEDY,
  type StepIcon,
  STEPS,
  type StoryAction,
} from "./story-data";

// ── Shared building blocks (mirrors ../commerce/jiomart/story-widgets) ────────────

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

function StepGlyph({ icon, size = 26 }: { icon: StepIcon; size?: number }) {
  if (icon === "flame") return <Flame size={size} strokeWidth={1.8} />;
  if (icon === "cup") return <CupSoda size={size} strokeWidth={1.8} />;
  return <Leaf size={size} strokeWidth={1.8} />;
}

// ── Clarify chips ─────────────────────────────────────────────────────────────────

export function ClarifyChips({
  which,
  onAction,
}: {
  which: "where" | "since";
  onAction: (a: StoryAction) => void;
}) {
  const options: ClarifyOption[] = which === "where" ? CLARIFY_WHERE : CLARIFY_SINCE;
  const action: StoryAction = which === "where" ? "clarify-where" : "clarify-since";
  return (
    <div className="flex flex-wrap gap-2 self-start">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onAction(action)}
          className="bg-surface-minimal text-fg rounded-full px-3.5 py-2 text-[13px] font-medium transition-transform duration-200 hover:scale-[1.03] active:scale-95"
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ── Remedy card ─────────────────────────────────────────────────────────────────

export function RemedyCardWidget({ onAction }: { onAction: (a: StoryAction) => void }) {
  return (
    <Widget className="p-3.5">
      <div className="flex items-center gap-3">
        <span className="bg-success/10 text-success flex size-12 shrink-0 items-center justify-center rounded-xl">
          <Leaf size={24} strokeWidth={1.8} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-bold">{REMEDY.title}</div>
          <div className="text-fg-muted mt-0.5 text-[12px]">{REMEDY.meta}</div>
          <div className="text-fg-muted mt-1 flex items-center gap-1 text-[11px]">
            <Check size={13} /> {REMEDY.social}
          </div>
        </div>
      </div>
      <div className="mt-3">
        <SecondaryButton onClick={() => onAction("start-walkthrough")}>
          चलो, मैं आपके साथ करती हूँ <ArrowRight size={18} />
        </SecondaryButton>
      </div>
    </Widget>
  );
}

// ── Guided walkthrough (self-contained stepper) ──────────────────────────────────

export function WalkthroughWidget({ onAction }: { onAction: (a: StoryAction) => void }) {
  const [i, setI] = useState(0);
  const step = STEPS[i];
  const isLast = i === STEPS.length - 1;
  const pct = Math.round(((i + 1) / STEPS.length) * 100);

  return (
    <Widget className="p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-primary-50 text-[12px] font-bold">
          कदम {i + 1} / {STEPS.length}
        </span>
        <span className="text-fg-muted text-[12px]">~8 मिनट</span>
      </div>
      <div className="bg-surface-minimal h-1.5 overflow-hidden rounded-full">
        <div
          className="bg-primary-50 h-full rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="bg-success/10 text-success my-4 flex h-[150px] items-center justify-center rounded-2xl">
        <StepGlyph icon={step.icon} size={64} />
      </div>

      <div className="text-center text-[18px] font-bold">{step.title}</div>
      <div className="text-fg-muted mt-1.5 text-center text-[13px] leading-relaxed">
        {step.instruction}
      </div>

      <div className="mt-3 flex justify-center">
        <span className="bg-primary-20 text-primary-50 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-bold">
          <Volume2 size={18} /> दादी से सुनें
        </span>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          aria-label="पिछला"
          disabled={i === 0}
          onClick={() => setI((n) => Math.max(0, n - 1))}
          className="bg-surface-minimal text-fg flex size-12 shrink-0 items-center justify-center rounded-full transition-transform duration-200 hover:scale-105 active:scale-95 disabled:opacity-40"
        >
          <ChevronLeft size={22} />
        </button>
        <div className="flex-1">
          <SecondaryButton onClick={() => (isLast ? onAction("finish") : setI((n) => n + 1))}>
            {isLast ? (
              <>
                पूरा हुआ <Check size={18} />
              </>
            ) : (
              <>
                अगला कदम <ArrowRight size={18} />
              </>
            )}
          </SecondaryButton>
        </div>
      </div>
    </Widget>
  );
}

// ── Finish / did-it-help ─────────────────────────────────────────────────────────

export function FeedbackWidget() {
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
        <span className="bg-success/10 text-success mb-3 flex size-[72px] items-center justify-center rounded-full">
          <Check size={40} />
        </span>
        <div className="text-[20px] font-bold">{FINISH.headline}</div>
        <div className="text-fg-muted mt-1.5 max-w-[260px] text-[13px] leading-relaxed">
          {FINISH.body}
        </div>
      </div>

      <div className="bg-surface-minimal mt-5 rounded-2xl p-4">
        <div className="mb-3 text-[14px] font-bold">क्या थोड़ा आराम मिला?</div>
        <div className="flex gap-2.5">
          {FEELINGS.map((f) => {
            const active = picked === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setPicked(f.id)}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 rounded-xl border px-1.5 py-3 text-[12px] transition-colors",
                  active
                    ? "bg-success/10 border-success text-success font-bold"
                    : "bg-surface text-fg border-black/12",
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
        <SecondaryButton onClick={() => (window.location.href = "/")}>वापस घर</SecondaryButton>
      </div>
    </Widget>
  );
}
