"use client";

import {
  ArrowRight,
  Check,
  Droplet,
  Frown,
  Meh,
  Moon,
  Smile,
  Sun,
  Sunrise,
  Sunset,
  Utensils,
} from "lucide-react";
import { useState } from "react";

import { cn } from "@intelligence/ui";

import {
  CLARIFY_DIET,
  CLARIFY_GOAL,
  type ClarifyOption,
  FEELINGS,
  FINISH,
  type MealIcon,
  MEALS,
  PLAN,
  type StoryAction,
  WATER_GOAL,
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

function MealGlyph({ icon, size = 22 }: { icon: MealIcon; size?: number }) {
  if (icon === "sunrise") return <Sunrise size={size} strokeWidth={1.9} />;
  if (icon === "sun") return <Sun size={size} strokeWidth={1.9} />;
  if (icon === "sunset") return <Sunset size={size} strokeWidth={1.9} />;
  return <Moon size={size} strokeWidth={1.9} />;
}

// ── Clarify chips ─────────────────────────────────────────────────────────────────

export function ClarifyChips({
  which,
  onAction,
}: {
  which: "goal" | "diet";
  onAction: (a: StoryAction) => void;
}) {
  const options: ClarifyOption[] = which === "goal" ? CLARIFY_GOAL : CLARIFY_DIET;
  const action: StoryAction = which === "goal" ? "clarify-goal" : "clarify-diet";
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

// ── Meal plan card ─────────────────────────────────────────────────────────────────

export function MealPlanCardWidget({ onAction }: { onAction: (a: StoryAction) => void }) {
  return (
    <Widget className="p-3.5">
      <div className="flex items-center gap-3">
        <span className="bg-success/10 text-success flex size-12 shrink-0 items-center justify-center rounded-xl">
          <Utensils size={24} strokeWidth={1.8} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-bold">{PLAN.title}</div>
          <div className="text-fg-muted mt-0.5 text-[12px]">{PLAN.meta}</div>
        </div>
      </div>

      <div className="mt-3 space-y-2.5">
        {MEALS.map((m) => (
          <div key={m.id} className="bg-surface-minimal flex items-start gap-3 rounded-xl p-3">
            <span className="text-primary-50 mt-0.5 shrink-0">
              <MealGlyph icon={m.icon} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-fg-muted text-[12px] font-bold">{m.time}</span>
              </div>
              <div className="text-fg mt-0.5 text-[14px] font-medium">{m.dish}</div>
              <div className="text-fg-muted mt-0.5 text-[12px] leading-relaxed">{m.why}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3.5">
        <SecondaryButton onClick={() => onAction("start-tracker")}>
          आज का ट्रैकर शुरू करें <ArrowRight size={18} />
        </SecondaryButton>
      </div>
    </Widget>
  );
}

// ── Day tracker (self-contained: meal checkboxes + water counter) ─────────────────

export function MealTrackerWidget({ onAction }: { onAction: (a: StoryAction) => void }) {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [water, setWater] = useState(0);
  const eaten = MEALS.filter((m) => done[m.id]).length;
  const pct = Math.round(
    ((eaten + Math.min(water, WATER_GOAL) / WATER_GOAL) / (MEALS.length + 1)) * 100,
  );

  const toggle = (id: string) => setDone((d) => ({ ...d, [id]: !d[id] }));

  return (
    <Widget className="p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-primary-50 text-[12px] font-bold">आज का ट्रैकर</span>
        <span className="text-fg-muted text-[12px]">
          {eaten}/{MEALS.length} खाना
        </span>
      </div>
      <div className="bg-surface-minimal h-1.5 overflow-hidden rounded-full">
        <div
          className="bg-primary-50 h-full rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-3.5 space-y-2">
        {MEALS.map((m) => {
          const checked = !!done[m.id];
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => toggle(m.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors",
                checked
                  ? "bg-success/10 border-success/40"
                  : "bg-surface hover:bg-surface-minimal border-black/10",
              )}
            >
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors",
                  checked
                    ? "bg-success border-success text-white"
                    : "border-black/25 text-transparent",
                )}
              >
                <Check size={15} strokeWidth={3} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="text-fg-muted text-[12px] font-bold">{m.time}</span>
                <span
                  className={cn(
                    "block text-[14px] font-medium",
                    checked && "line-through opacity-70",
                  )}
                >
                  {m.dish}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Water counter */}
      <div className="bg-surface-minimal mt-3 rounded-xl p-3">
        <div className="flex items-center justify-between">
          <span className="text-fg flex items-center gap-2 text-[14px] font-medium">
            <Droplet size={18} className="text-primary-50" /> पानी
          </span>
          <span className="text-fg-muted text-[12px] font-bold">
            {water} / {WATER_GOAL} गिलास
          </span>
        </div>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {Array.from({ length: WATER_GOAL }).map((_, i) => {
            const filled = i < water;
            return (
              <button
                key={i}
                type="button"
                aria-label={`गिलास ${i + 1}`}
                onClick={() => setWater(filled ? i : i + 1)}
                className={cn(
                  "flex size-8 items-center justify-center rounded-full transition-colors",
                  filled
                    ? "bg-primary-50 text-white"
                    : "bg-surface hover:bg-primary-20 text-black/25",
                )}
              >
                <Droplet size={16} strokeWidth={2} />
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4">
        <SecondaryButton onClick={() => onAction("finish")}>
          हो गया <Check size={18} />
        </SecondaryButton>
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
        <div className="mb-3 text-[14px] font-bold">आज का प्लान कैसा लगा?</div>
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
