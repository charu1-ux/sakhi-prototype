"use client";

import { Check, Home, Stethoscope, TriangleAlert } from "lucide-react";

import { cn } from "@intelligence/ui";

import {
  CLARIFY_DURATION,
  CLARIFY_SEVERITY,
  CLOSE,
  type ClarifyOption,
  type StoryAction,
  TRIAGE,
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
  which: "duration" | "severity";
  onAction: (a: StoryAction) => void;
}) {
  const options: ClarifyOption[] = which === "duration" ? CLARIFY_DURATION : CLARIFY_SEVERITY;
  const action: StoryAction = which === "duration" ? "clarify-duration" : "clarify-severity";
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

// ── Triage card — "ghar pe ye karein" + "doctor ko kab dikhayein" ─────────────────

export function TriageCardWidget({ onAction }: { onAction: (a: StoryAction) => void }) {
  return (
    <Widget className="p-4">
      {/* Safe self-care */}
      <div className="text-success flex items-center gap-2 text-[14px] font-bold">
        <Check size={18} strokeWidth={2.4} /> घर पे ये करें
      </div>
      <ul className="mt-2.5 space-y-2">
        {TRIAGE.selfCare.map((t) => (
          <li key={t} className="text-fg flex items-start gap-2 text-[13px] leading-relaxed">
            <span className="bg-success/10 text-success mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full">
              <Check size={13} strokeWidth={3} />
            </span>
            {t}
          </li>
        ))}
      </ul>

      {/* Red flags */}
      <div className="bg-warning/10 mt-4 rounded-2xl p-3.5">
        <div className="text-warning flex items-center gap-2 text-[14px] font-bold">
          <TriangleAlert size={18} strokeWidth={2.4} /> डॉक्टर को कब दिखाएँ
        </div>
        <ul className="mt-2.5 space-y-2">
          {TRIAGE.redFlags.map((t) => (
            <li key={t} className="text-fg flex items-start gap-2 text-[13px] leading-relaxed">
              <span className="text-warning mt-0.5 shrink-0">
                <TriangleAlert size={15} strokeWidth={2.4} />
              </span>
              {t}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <SecondaryButton onClick={() => onAction("acknowledge")}>
          ठीक है, समझ गई <Check size={18} />
        </SecondaryButton>
      </div>
    </Widget>
  );
}

// ── Closing care card ─────────────────────────────────────────────────────────────

export function CloseCardWidget() {
  return (
    <Widget className="p-5">
      <div className="flex flex-col items-center text-center">
        <span className="bg-primary-20 text-primary-50 mb-3 flex size-[64px] items-center justify-center rounded-full">
          <Stethoscope size={34} strokeWidth={1.8} />
        </span>
        <div className="text-[19px] font-bold">{CLOSE.headline}</div>
        <div className="text-fg-muted mt-1.5 max-w-[280px] text-[13px] leading-relaxed">
          {CLOSE.body}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2.5">
        <SecondaryButton onClick={() => undefined}>
          <Stethoscope size={18} /> पास के डॉक्टर खोजें
        </SecondaryButton>
        <button
          type="button"
          onClick={() => {
            window.location.href = "/health";
          }}
          className="text-fg-muted hover:bg-surface-minimal inline-flex h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-medium transition-colors"
        >
          <Home size={17} /> वापस घर
        </button>
      </div>
    </Widget>
  );
}
