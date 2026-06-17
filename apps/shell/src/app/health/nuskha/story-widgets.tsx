"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  CupSoda,
  Droplet,
  Flame,
  Frown,
  Home,
  Leaf,
  Meh,
  Moon,
  ShieldPlus,
  Smile,
  Soup,
  Sparkles,
  Thermometer,
  Volume2,
} from "lucide-react";
import { useState } from "react";

import { cn } from "@intelligence/ui";

import {
  type Bucket,
  type BucketIcon,
  BUCKETS,
  FEELINGS,
  type Remedy,
  type StepIcon,
} from "./story-data";

// ── Shared building blocks (mirrors ../../commerce/jiomart/story-widgets) ─────────

/** Gated CTA — full-width pill, light-purple bg, dark-purple text (JDS primary 30/60). */
function SecondaryButton({
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
      className="bg-primary-30 text-primary-60 dark:bg-primary-50/40 dark:text-primary-20 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-bold transition-transform duration-200 ease-out hover:scale-[1.02] active:scale-[0.97]"
    >
      {children}
    </button>
  );
}

function Widget({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "bg-surface self-stretch overflow-hidden rounded-2xl border border-black/10 dark:border-white/10",
        className,
      )}
    >
      {children}
    </div>
  );
}

function StepGlyph({ icon, size = 26 }: { icon: StepIcon; size?: number }) {
  const c = { size, strokeWidth: 1.8 };
  if (icon === "flame") return <Flame {...c} />;
  if (icon === "cup") return <CupSoda {...c} />;
  if (icon === "moon") return <Moon {...c} />;
  if (icon === "droplet") return <Droplet {...c} />;
  if (icon === "sparkles") return <Sparkles {...c} />;
  return <Leaf {...c} />;
}

function BucketGlyph({ icon, size = 26 }: { icon: BucketIcon; size?: number }) {
  const c = { size, strokeWidth: 1.9 };
  if (icon === "soup") return <Soup {...c} />;
  if (icon === "shield") return <ShieldPlus {...c} />;
  if (icon === "thermometer") return <Thermometer {...c} />;
  return <Sparkles {...c} />;
}

// ── Explore widget — self-contained wellness browse → remedy → walkthrough ─────────

type View = "buckets" | "remedies" | "walk" | "done";

export function ExploreWidget({ goHome }: { goHome: () => void }) {
  const [view, setView] = useState<View>("buckets");
  const [bucket, setBucket] = useState<Bucket | null>(null);
  const [remedy, setRemedy] = useState<Remedy | null>(null);
  const [step, setStep] = useState(0);
  const [mood, setMood] = useState<string | null>(null);

  const restart = () => {
    setBucket(null);
    setRemedy(null);
    setStep(0);
    setMood(null);
    setView("buckets");
  };

  // ── View: pick a wellness bucket ──────────────────────────────────────────────
  if (view === "buckets") {
    return (
      <Widget className="rounded-3xl p-4">
        <div className="mb-3 text-[14px] font-bold">किस चीज़ के लिए नुस्खा देखना है?</div>
        <div className="grid grid-cols-2 gap-2.5">
          {BUCKETS.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => {
                setBucket(b);
                setView("remedies");
              }}
              className="bg-surface dark:bg-bg-elev flex flex-col items-start gap-2 rounded-xl border border-black/10 p-3 text-left transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] dark:border-white/10"
            >
              <span
                className="flex size-10 items-center justify-center rounded-full"
                style={{ background: b.bg, color: b.fg }}
              >
                <BucketGlyph icon={b.icon} size={22} />
              </span>
              <span className="text-fg text-[14px] font-bold">{b.title}</span>
              <span className="text-fg-muted text-[11px] leading-tight">{b.hint}</span>
            </button>
          ))}
        </div>
      </Widget>
    );
  }

  // ── View: remedies inside the chosen bucket ───────────────────────────────────
  if (view === "remedies" && bucket) {
    return (
      <Widget className="p-4">
        {/* Back row carries the bucket identity — chevron + icon + title + hint */}
        <button
          type="button"
          onClick={restart}
          className="mb-3 flex w-full items-center gap-2.5 text-left"
        >
          <ChevronLeft className="text-fg-muted shrink-0" size={20} />
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-full"
            style={{ background: bucket.bg, color: bucket.fg }}
          >
            <BucketGlyph icon={bucket.icon} size={18} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-bold">{bucket.title}</span>
            <span className="text-fg-muted block text-[12px]">इनमें से कोई चुनें</span>
          </span>
        </button>
        <div className="space-y-2">
          {bucket.remedies.map((r) => {
            const open = remedy?.id === r.id;
            return (
              <div
                key={r.id}
                className="bg-surface overflow-hidden rounded-xl border border-black/10 dark:border-white/10"
              >
                <button
                  type="button"
                  onClick={() => setRemedy(open ? null : r)}
                  className="flex w-full items-center gap-3 p-3 text-left"
                >
                  <span className="bg-success/10 text-success flex size-10 shrink-0 items-center justify-center rounded-xl">
                    <StepGlyph icon={r.icon} size={20} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="text-fg block text-[14px] font-bold">{r.title}</span>
                    <span className="text-fg-muted block text-[12px]">{r.meta}</span>
                  </span>
                  <ChevronRight
                    className={cn(
                      "text-fg-muted shrink-0 transition-transform duration-200",
                      open && "rotate-90",
                    )}
                    size={18}
                  />
                </button>
                {/* Accordion body — social proof + CTA expand in place, no navigation */}
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      key="body"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 460, damping: 40 }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 pb-3">
                        <div className="text-fg-muted mb-2.5 flex items-center gap-1.5 text-[12px]">
                          <Check className="text-success shrink-0" size={14} /> {r.social}
                        </div>
                        <SecondaryButton
                          onClick={() => {
                            setStep(0);
                            setView("walk");
                          }}
                        >
                          चलो, मैं आपके साथ करती हूँ <ArrowRight size={18} />
                        </SecondaryButton>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </Widget>
    );
  }

  // ── View: guided walkthrough for the chosen remedy ────────────────────────────
  if (view === "walk" && remedy) {
    const s = remedy.steps[step];
    const isLast = step === remedy.steps.length - 1;
    const pct = Math.round(((step + 1) / remedy.steps.length) * 100);
    return (
      <Widget className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-primary-50 text-[12px] font-bold">
            कदम {step + 1} / {remedy.steps.length}
          </span>
          <span className="text-fg-muted text-[12px]">{remedy.title}</span>
        </div>
        <div className="bg-surface-minimal h-1.5 overflow-hidden rounded-full dark:bg-white/10">
          <div
            className="bg-primary-50 h-full rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="bg-success/10 text-success my-4 flex h-[150px] items-center justify-center rounded-2xl">
          <StepGlyph icon={s.icon} size={64} />
        </div>

        <div className="text-center text-[18px] font-bold">{s.title}</div>
        <div className="text-fg-muted mt-1.5 text-center text-[13px] leading-relaxed">
          {s.instruction}
        </div>

        <div className="mt-3 flex justify-center">
          <span className="bg-primary-20 text-primary-50 dark:bg-primary-60/40 dark:text-primary-20 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-bold">
            <Volume2 size={18} /> दादी से सुनें
          </span>
        </div>

        <div className="mt-4 flex items-center">
          {/* Back chevron only from step 2 — slides in from the left, अगला कदम shrinks. */}
          <AnimatePresence initial={false}>
            {step > 0 && (
              <motion.button
                key="back"
                type="button"
                aria-label="पिछला"
                onClick={() => setStep((n) => Math.max(0, n - 1))}
                initial={{ width: 0, marginRight: 0, opacity: 0 }}
                animate={{ width: 48, marginRight: 12, opacity: 1 }}
                exit={{ width: 0, marginRight: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 460, damping: 38 }}
                className="bg-surface-ghost dark:text-ink text-fg flex h-12 shrink-0 items-center justify-center overflow-hidden rounded-full transition-transform duration-200 hover:scale-105 active:scale-95 dark:bg-[#2a2d40]"
              >
                <ChevronLeft size={22} className="shrink-0" />
              </motion.button>
            )}
          </AnimatePresence>
          <div className="flex-1">
            <SecondaryButton onClick={() => (isLast ? setView("done") : setStep((n) => n + 1))}>
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

  // ── View: done + did-it-help ──────────────────────────────────────────────────
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
        <div className="text-[20px] font-bold">बस, हो गया!</div>
        <div className="text-fg-muted mt-1.5 max-w-[260px] text-[13px] leading-relaxed">
          {remedy?.title} पूरा हुआ। थोड़ा आराम करें — जल्दी फ़ायदा दिखेगा।
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-3 text-[14px] font-bold">क्या थोड़ा आराम मिला?</div>
        <div className="flex gap-2.5">
          {FEELINGS.map((f) => {
            const active = mood === f.id;
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
                onClick={() => setMood(f.id)}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 rounded-xl border px-1.5 py-3 text-[12px] transition-all",
                  active
                    ? cn(toneOn, "font-bold")
                    : "bg-surface dark:bg-bg-elev text-fg border-black/12 dark:border-white/10",
                )}
              >
                {glyph(f.icon)}
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2.5">
        <SecondaryButton onClick={restart}>और नुस्खे देखें</SecondaryButton>
        <button
          type="button"
          onClick={goHome}
          className="bg-surface-ghost dark:text-ink text-fg inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-bold transition-transform duration-200 ease-out hover:scale-[1.02] active:scale-[0.97] dark:bg-[#2a2d40]"
        >
          <Home size={17} /> वापस घर
        </button>
      </div>
    </Widget>
  );
}
