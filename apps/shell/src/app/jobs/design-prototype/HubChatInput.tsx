"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { HOME_ASSETS } from "./hub-data";

// ─── Types ────────────────────────────────────────────────────────────────────

export type TagChipItem = { id: string; label: string };

type Props = {
  placeholder?: string;
  value?: string;
  onChange?: (v: string) => void;
  onSubmit?: (v: string) => void;
  onAdd?: () => void;
  onSpeak?: () => void;
  /** Hide the leading "+" Add button (e.g. when no attach use-case exists). */
  hideAdd?: boolean;
  /** Render the leading button as a paperclip (attach a document) instead of "+". */
  attachMode?: boolean;
  /** Show a mic (dictation → speech-to-text) button left of Speak. */
  onDictate?: () => void;
  /** "sleek" — icon-only Speak button (48×48 circle), fixed 48px input height, no multiline */
  variant?: "default" | "sleek";
  /** Voice/listening mode — replaces the input + Speak with a live waveform and an arrow-up Send. */
  voiceMode?: boolean;
  onVoiceSend?: () => void;
  onVoiceCancel?: () => void;
  /** Quick-reply tag chips shown above input; hidden while typing */
  chips?: TagChipItem[];
  onChipSelect?: (chip: TagChipItem) => void;
  /** Show a calendar date-picker trigger inside the input pill */
  showDatePicker?: boolean;
  onDateSelect?: (date: Date) => void;
  /** Optional hub context bar above the input (e.g. "Astrology ‹") */
  hubTitle?: string;
  hubBackHref?: string;
  onHubBack?: () => void;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const BTN_SIZE = 48;
const SEND_SIZE = 36;
const LINE_H = 21;
const PILL_PY = 6;
const PILL_PX_L = 10;
const PILL_PX_R = 6;
const MAX_LINES = 3;
const MAX_TA_H = LINE_H * MAX_LINES;

// power3.inOut equivalent
const EASE = [0.7, 0, 0.3, 1] as const;
const DUR = 0.28;

const btnMotion = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 16 },
  transition: { duration: DUR * 0.75, ease: EASE },
};

const slideUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 4 },
  transition: { duration: 0.22, ease: [0.2, 0, 0, 1] as const },
};

// ─── CalendarModal ────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function CalendarModal({
  onSelect,
  onClose,
}: {
  onSelect: (d: Date) => void;
  onClose: () => void;
}) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [picked, setPicked] = useState<Date | null>(null);

  function prevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  }
  function nextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  }

  const totalDays = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();
  const cells: (number | null)[] = [
    ...Array(startDay).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];

  const isToday = (d: number) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  const isPicked = (d: number) =>
    picked?.getDate() === d && picked?.getMonth() === month && picked?.getFullYear() === year;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.26, ease: [0.05, 0.7, 0.1, 1] }}
      className="absolute right-4 bottom-full left-4 mb-2 overflow-hidden rounded-[20px] bg-white"
      style={{
        border: "1px solid rgba(12,13,16,0.08)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        zIndex: 50,
      }}
    >
      {/* Month nav */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <button
          onClick={prevMonth}
          aria-label="Previous month"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eeeeef] text-[18px] font-medium text-[#0c0d10] transition-transform duration-[150ms] hover:scale-[1.06] focus:outline-none active:scale-[0.94]"
        >
          ‹
        </button>
        <span className="font-[JioType,sans-serif] text-[15px] font-medium text-[#0c0d10]">
          {MONTH_NAMES[month]} {year}
        </span>
        <button
          onClick={nextMonth}
          aria-label="Next month"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eeeeef] text-[18px] font-medium text-[#0c0d10] transition-transform duration-[150ms] hover:scale-[1.06] focus:outline-none active:scale-[0.94]"
        >
          ›
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 px-4 pb-1">
        {DAY_LABELS.map((d) => (
          <div
            key={d}
            className="text-center font-[JioType,sans-serif] text-[11px] font-medium text-[rgba(12,13,16,0.38)]"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-y-1 px-4 pb-4">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const sel = isPicked(day);
          const tod = isToday(day);
          return (
            <button
              key={day}
              onClick={() => setPicked(new Date(year, month, day))}
              className={[
                "mx-auto flex h-9 w-9 items-center justify-center rounded-full font-[JioType,sans-serif] text-[13px] font-medium transition-transform duration-[150ms] hover:scale-[1.08] focus:outline-none active:scale-[0.93]",
                sel
                  ? "bg-[#6d17ce] text-white"
                  : tod
                    ? "border border-[#6d17ce] text-[#6d17ce]"
                    : "text-[#0c0d10] hover:bg-[#f5f5f5]",
              ].join(" ")}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Actions — JDS button pattern */}
      <div className="flex gap-2 px-4 pb-4">
        <button
          onClick={onClose}
          className="h-11 flex-1 rounded-full bg-[#eeeeef] font-[JioType,sans-serif] text-[14px] font-medium text-[rgba(12,13,16,0.65)] transition-transform duration-[200ms] hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#310064] focus-visible:ring-offset-2 active:scale-[0.97]"
        >
          Cancel
        </button>
        <button
          disabled={!picked}
          onClick={() => {
            if (picked) {
              onSelect(picked);
              onClose();
            }
          }}
          className="h-11 flex-1 rounded-full bg-[#6d17ce] font-[JioType,sans-serif] text-[14px] font-medium text-white transition-transform duration-[200ms] hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#310064] focus-visible:ring-offset-2 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50"
        >
          Confirm
        </button>
      </div>
    </motion.div>
  );
}

// ─── HubContextBar ────────────────────────────────────────────────────────────
// Compact hub identity strip — shows current hub title with optional back nav.

function HubContextBar({
  title,
  backHref,
  onBack,
}: {
  title: string;
  backHref?: string;
  onBack?: () => void;
}) {
  return (
    <div
      className="flex items-center gap-2 px-4 py-2"
      style={{ borderBottom: "1px solid rgba(12,13,16,0.06)" }}
    >
      {(onBack || backHref) && (
        <a
          href={backHref ?? "#"}
          onClick={(e) => {
            if (onBack) {
              e.preventDefault();
              onBack();
            }
          }}
          aria-label="Back"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#eeeeef] text-[16px] font-medium text-[#0c0d10] transition-transform duration-[150ms] hover:scale-[1.06] focus:outline-none active:scale-[0.94]"
        >
          ‹
        </a>
      )}
      <span className="flex-1 truncate font-[JioType,sans-serif] text-[13px] font-medium text-[rgba(12,13,16,0.65)]">
        {title}
      </span>
    </div>
  );
}

// ─── CloseIcon ────────────────────────────────────────────────────────────────

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M5 5l10 10M15 5L5 15"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── PaperclipGlyph ───────────────────────────────────────────────────────────

function PaperclipGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M18.4 11.8 12 18.2a4.2 4.2 0 0 1-5.94-5.94l6.9-6.9a2.8 2.8 0 0 1 3.96 3.96l-6.9 6.9a1.4 1.4 0 0 1-1.98-1.98l6.18-6.18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── MicGlyph ─────────────────────────────────────────────────────────────────

function MicGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M5.5 11a6.5 6.5 0 0 0 13 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path d="M12 17.5V21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

// ─── Waveform ─────────────────────────────────────────────────────────────────
// A row of neutral-grey dots spanning the box end-to-end. At rest a bright pulse
// travels right→left; while "speaking" the dots stretch into amplitude lines.
// Speech is simulated in natural bursts so both states read in the prototype.

const WAVE_DOTS = Array.from({ length: 26 }, (_, i) => i);
const WAVE_DOT = "rgba(12,13,16,0.5)";

function Waveform() {
  const [speaking, setSpeaking] = useState(true);

  useEffect(() => {
    let alive = true;
    let on = true;
    function loop() {
      if (!alive) return;
      setSpeaking(on);
      const next = on ? 1300 + Math.random() * 900 : 650 + Math.random() * 600;
      on = !on;
      window.setTimeout(loop, next);
    }
    loop();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div
      className="flex h-7 w-full items-center justify-between"
      aria-label={speaking ? "Listening — speaking" : "Listening"}
    >
      {WAVE_DOTS.map((i) => {
        const dur = speaking ? 0.7 : 1.5;
        // Negative, increasing-with-index delay → the crest sweeps right→left.
        const delay = -(i / WAVE_DOTS.length) * dur;
        // Per-bar peak so the speaking oscillation reads as an organic waveform.
        const peak = 3 + (((i * 37) % 11) / 10) * 2.6;
        return (
          <span
            key={i}
            className="rounded-full"
            style={
              {
                width: 3.5,
                height: 3.5,
                backgroundColor: WAVE_DOT,
                transformOrigin: "center",
                animationName: speaking ? "wf-osc" : "wf-travel",
                animationDuration: `${dur}s`,
                animationTimingFunction: "ease-in-out",
                animationIterationCount: "infinite",
                animationDelay: `${delay}s`,
                "--wf-peak": peak,
              } as CSSProperties
            }
          />
        );
      })}
      <style>{`
        @keyframes wf-osc {
          0%, 100% { transform: scaleY(1); opacity: 0.55; }
          50% { transform: scaleY(var(--wf-peak, 3)); opacity: 1; }
        }
        @keyframes wf-travel {
          0%, 100% { opacity: 0.25; }
          50% { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) { span { animation: none !important; } }
      `}</style>
    </div>
  );
}

// ─── HubChatInput ─────────────────────────────────────────────────────────────

export function HubChatInput({
  placeholder = "Ask me anything",
  value,
  onChange,
  onSubmit,
  onAdd,
  onSpeak,
  hideAdd = false,
  attachMode = false,
  onDictate,
  variant = "default",
  voiceMode = false,
  onVoiceSend,
  onVoiceCancel,
  chips,
  onChipSelect,
  showDatePicker = false,
  onDateSelect,
  hubTitle,
  hubBackHref,
  onHubBack,
}: Props) {
  const isSleek = variant === "sleek";
  const isControlled = onChange !== undefined;

  const [localVal, setLocalVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isMultiLine, setIsMultiLine] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [activeChip, setActiveChip] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);

  const text = isControlled ? (value ?? "") : localVal;

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const addRef = useRef<HTMLButtonElement>(null);

  // Resize textarea and sync multi-line state
  useEffect(() => {
    const ta = textareaRef.current;
    const add = addRef.current;
    if (!ta) return;

    ta.style.height = "auto";
    const scrollH = ta.scrollHeight;
    const lines = scrollH <= LINE_H ? 1 : scrollH <= LINE_H * 2 ? 2 : 3;
    ta.style.height = `${LINE_H * lines}px`;
    ta.style.overflowY = lines >= MAX_LINES ? "auto" : "hidden";

    const nowMulti = lines > 1;
    setIsMultiLine(nowMulti);
    if (add) add.style.alignSelf = nowMulti ? "flex-end" : "center";
  }, [text]);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const v = e.target.value;
    if (isControlled) onChange!(v);
    else setLocalVal(v);
    setIsTyping(v.length > 0);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function handleSubmit() {
    if (!text.trim()) return;
    onSubmit?.(text.trim());
    if (!isControlled) setLocalVal("");
    setIsTyping(false);
    setActiveChip(null);
  }

  function handleChipClick(chip: TagChipItem) {
    const next = activeChip === chip.id ? null : chip.id;
    setActiveChip(next);
    onChipSelect?.(chip);
    textareaRef.current?.focus();
  }

  function handleDateSelect(date: Date) {
    const fmt = date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const newVal = text ? `${text} ${fmt}` : fmt;
    if (isControlled) onChange?.(newVal);
    else setLocalVal(newVal);
    setIsTyping(true);
    onDateSelect?.(date);
  }

  const hasChips = !!chips?.length;

  // JDS field focus: bg flips surface-ghost → surface; border darkens
  const pillBg = isFocused ? "#ffffff" : "#f5f5f5";
  const pillBorder = isFocused ? "rgba(12,13,16,0.24)" : "rgba(12,13,16,0.10)";

  return (
    <footer
      className="sticky bottom-0 w-full bg-white"
      style={{
        borderTop: "1px solid rgba(12,13,16,0.08)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        position: "relative",
      }}
    >
      {/* CalendarModal — floats above footer */}
      <AnimatePresence>
        {showCalendar && (
          <CalendarModal onSelect={handleDateSelect} onClose={() => setShowCalendar(false)} />
        )}
      </AnimatePresence>

      {/* Hub context bar */}
      {hubTitle && <HubContextBar title={hubTitle} backHref={hubBackHref} onBack={onHubBack} />}

      {/* Tag chips row — slides in/out; hidden while typing */}
      <AnimatePresence>
        {hasChips && !isTyping && !voiceMode && (
          <motion.div
            key="chips"
            {...slideUp}
            className="flex gap-[8px] overflow-x-auto px-4 pt-3 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {chips!.map((chip) => {
              const active = activeChip === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => handleChipClick(chip)}
                  className={[
                    "shrink-0 rounded-full px-[14px] py-[7px] font-[JioType,sans-serif] text-[12px] font-medium whitespace-nowrap transition-all duration-[200ms] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#310064] focus-visible:ring-offset-2 active:scale-[0.96]",
                    active
                      ? "bg-[#6d17ce] text-white"
                      : "bg-[#eeeeef] text-[#0c0d10] hover:bg-[#ede7ff] hover:text-[#6d17ce]",
                  ].join(" ")}
                >
                  {chip.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main input row — voice mode shows a live waveform + arrow-up Send */}
      {voiceMode ? (
        <div className="flex items-center gap-[6px] px-4 py-3">
          {/* Cancel — light-grey circle, dark-grey ✕; exits voice mode */}
          <button
            type="button"
            aria-label="Cancel voice"
            onClick={onVoiceCancel}
            className="flex shrink-0 cursor-pointer touch-manipulation appearance-none items-center justify-center rounded-full transition-transform duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-[#310064] focus-visible:ring-offset-2 active:scale-[0.94]"
            style={{
              width: BTN_SIZE,
              height: BTN_SIZE,
              backgroundColor: "#eeeeef",
              color: "rgba(12,13,16,0.55)",
              flexShrink: 0,
            }}
          >
            <CloseIcon className="size-5" />
          </button>
          <div
            className="flex min-w-0 flex-1 items-center overflow-hidden"
            style={{
              backgroundColor: "#eeeeef",
              borderRadius: 40,
              paddingLeft: 12,
              paddingRight: 12,
              minHeight: BTN_SIZE,
            }}
          >
            <Waveform />
          </div>
          <button
            type="button"
            aria-label="Send voice message"
            onClick={onVoiceSend}
            className="flex shrink-0 cursor-pointer touch-manipulation appearance-none items-center justify-center overflow-hidden rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#310064] focus-visible:ring-offset-2"
            style={{ width: BTN_SIZE, height: BTN_SIZE, backgroundColor: "#3e0084", flexShrink: 0 }}
          >
            <Image
              src={`${HOME_ASSETS}/arrow-up.svg`}
              alt=""
              width={20}
              height={20}
              className="pointer-events-none size-5"
              unoptimized
            />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-[6px] px-4 py-3">
          {/* Add button — shrinks when typing (hidden when hideAdd) */}
          {!hideAdd && (
            <motion.button
              ref={addRef}
              type="button"
              aria-label={attachMode ? "Attach a document" : "Add"}
              onClick={onAdd}
              className="flex shrink-0 cursor-pointer touch-manipulation appearance-none items-center justify-center overflow-hidden rounded-full outline-none"
              animate={{
                width: isTyping ? SEND_SIZE : BTN_SIZE,
                height: isTyping ? SEND_SIZE : BTN_SIZE,
              }}
              transition={{ duration: DUR, ease: EASE }}
              style={{ backgroundColor: "#f0e8fa", flexShrink: 0, color: "#6d17ce" }}
            >
              {attachMode ? (
                <PaperclipGlyph className="pointer-events-none size-5" />
              ) : (
                <Image
                  src={`${HOME_ASSETS}/add.svg`}
                  alt=""
                  width={20}
                  height={20}
                  className="pointer-events-none size-5"
                  unoptimized
                />
              )}
            </motion.button>
          )}

          {/* Input pill — borderRadius morphs on multi-line; border + bg change on focus (JDS field-focus pattern) */}
          <motion.div
            className="flex min-w-0 flex-1 overflow-hidden"
            animate={{ borderRadius: isMultiLine ? 18 : 40 }}
            transition={{ duration: DUR, ease: EASE }}
            style={{
              backgroundColor: pillBg,
              border: `1px solid ${pillBorder}`,
              borderRadius: 40,
              paddingLeft: PILL_PX_L,
              paddingRight: PILL_PX_R,
              paddingTop: PILL_PY,
              paddingBottom: PILL_PY,
              gap: "8px",
              alignItems: isMultiLine ? "flex-end" : "center",
              display: "flex",
              minHeight: BTN_SIZE,
              transition: "background-color 0.2s ease, border-color 0.2s ease",
            }}
          >
            {/* Date picker trigger — calendar icon, slides in when showDatePicker=true and not typing */}
            <AnimatePresence>
              {showDatePicker && !isTyping && (
                <motion.button
                  key="calendar"
                  type="button"
                  aria-label="Pick date"
                  onClick={() => setShowCalendar((v) => !v)}
                  {...slideUp}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-transform duration-[150ms] hover:scale-[1.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#310064] focus-visible:ring-offset-1 active:scale-[0.93]"
                  style={{
                    backgroundColor: showCalendar ? "#6d17ce" : "#ede7ff",
                    color: showCalendar ? "#ffffff" : "#6d17ce",
                  }}
                >
                  {/* Calendar SVG icon */}
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="0.65"
                      y="2.15"
                      width="12.7"
                      height="10.7"
                      rx="1.85"
                      stroke="currentColor"
                      strokeWidth="1.3"
                    />
                    <line
                      x1="0.65"
                      y1="5.35"
                      x2="13.35"
                      y2="5.35"
                      stroke="currentColor"
                      strokeWidth="1.2"
                    />
                    <line
                      x1="4.5"
                      y1="0.7"
                      x2="4.5"
                      y2="3.5"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                    <line
                      x1="9.5"
                      y1="0.7"
                      x2="9.5"
                      y2="3.5"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>
                </motion.button>
              )}
            </AnimatePresence>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              rows={1}
              placeholder={placeholder}
              aria-label={placeholder}
              autoComplete="off"
              value={text}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="min-w-0 flex-1 resize-none border-none bg-transparent ring-0 outline-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&::placeholder]:truncate [&::placeholder]:overflow-hidden"
              style={{
                fontSize: "16px",
                lineHeight: `${LINE_H}px`,
                color: text ? "#0c0d10" : "rgba(12,13,16,0.38)",
                height: LINE_H,
                maxHeight: MAX_TA_H,
                overflowY: "hidden",
                padding: 0,
                margin: 0,
                display: "block",
                fontFamily: "JioType, -apple-system, sans-serif",
              }}
            />

            {/* Send button — slides in inside pill when typing */}
            <AnimatePresence>
              {isTyping && (
                <motion.button
                  key="send"
                  type="button"
                  aria-label="Send"
                  onClick={handleSubmit}
                  className="flex shrink-0 cursor-pointer touch-manipulation appearance-none items-center justify-center overflow-hidden rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#310064] focus-visible:ring-offset-2"
                  style={{
                    width: SEND_SIZE,
                    height: SEND_SIZE,
                    backgroundColor: "#3e0084",
                    flexShrink: 0,
                  }}
                  {...btnMotion}
                >
                  <Image
                    src={`${HOME_ASSETS}/arrow-up.svg`}
                    alt=""
                    width={20}
                    height={20}
                    className="pointer-events-none size-5"
                    unoptimized
                  />
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Dictation mic — speech-to-text into the chat; left of Speak */}
          <AnimatePresence>
            {!isTyping && onDictate && (
              <motion.button
                key="dictate"
                type="button"
                aria-label="Dictate"
                onClick={onDictate}
                className="flex shrink-0 cursor-pointer touch-manipulation appearance-none items-center justify-center overflow-hidden rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#310064] focus-visible:ring-offset-2"
                style={{
                  width: BTN_SIZE,
                  height: BTN_SIZE,
                  backgroundColor: "#f0e8fa",
                  color: "#6d17ce",
                  flexShrink: 0,
                }}
                {...btnMotion}
              >
                <MicGlyph className="size-5" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Speak button — slides out when typing begins */}
          <AnimatePresence>
            {!isTyping &&
              (isSleek ? (
                <motion.button
                  key="speak"
                  type="button"
                  aria-label="Speak"
                  onClick={onSpeak}
                  className="flex shrink-0 cursor-pointer touch-manipulation appearance-none items-center justify-center overflow-hidden rounded-full outline-none"
                  style={{
                    width: BTN_SIZE,
                    height: BTN_SIZE,
                    backgroundColor: "#3e0084",
                    flexShrink: 0,
                  }}
                  {...btnMotion}
                >
                  <Image
                    src={`${HOME_ASSETS}/speak.svg`}
                    alt=""
                    width={20}
                    height={20}
                    className="pointer-events-none size-5"
                    unoptimized
                  />
                </motion.button>
              ) : (
                <motion.button
                  key="speak"
                  type="button"
                  aria-label="Speak"
                  onClick={onSpeak}
                  className="flex shrink-0 cursor-pointer touch-manipulation appearance-none items-center gap-[5px] overflow-hidden rounded-full px-3 outline-none"
                  style={{ height: BTN_SIZE, backgroundColor: "#3e0084", flexShrink: 0 }}
                  {...btnMotion}
                >
                  <Image
                    src={`${HOME_ASSETS}/speak.svg`}
                    alt=""
                    width={20}
                    height={20}
                    className="pointer-events-none size-5"
                    unoptimized
                  />
                  <span className="font-[JioType,sans-serif] text-base leading-normal whitespace-nowrap text-white">
                    Speak
                  </span>
                </motion.button>
              ))}
          </AnimatePresence>
        </div>
      )}
    </footer>
  );
}
