"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

import { INTERVAL_MAX, INTERVAL_MIN, type Reminder } from "./story-data";

// ─── ScrollPicker — mirrors ../../astro/design-prototype scroll-wheel picker ──────

function ScrollPicker({
  items,
  value,
  onChange,
  flex = "flex-1",
}: {
  items: string[];
  value: string;
  onChange: (v: string) => void;
  flex?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const ITEM_H = 48;
  const VISIBLE = 5;
  const PAD = ITEM_H * 2;

  useEffect(() => {
    if (!ref.current) return;
    const idx = Math.max(0, items.indexOf(value));
    requestAnimationFrame(() => {
      if (ref.current) ref.current.scrollTop = idx * ITEM_H;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleScroll() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (!ref.current) return;
      const idx = Math.round(ref.current.scrollTop / ITEM_H);
      const clamped = Math.max(0, Math.min(idx, items.length - 1));
      onChange(items[clamped]);
      ref.current.scrollTo({ top: clamped * ITEM_H, behavior: "smooth" });
    }, 80);
  }

  return (
    <div className={`relative ${flex} overflow-hidden`}>
      {/* Selection band */}
      <div
        className="bg-surface-ghost-icon pointer-events-none absolute right-1 left-1 rounded-xl"
        style={{ top: PAD, height: ITEM_H }}
      />
      {/* Fades */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-10"
        style={{
          height: PAD,
          background: "linear-gradient(to bottom,rgba(255,255,255,0.97),rgba(255,255,255,0))",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10"
        style={{
          height: PAD,
          background: "linear-gradient(to top,rgba(255,255,255,0.97),rgba(255,255,255,0))",
        }}
      />

      <div
        ref={ref}
        onScroll={handleScroll}
        style={{ height: VISIBLE * ITEM_H, scrollSnapType: "y mandatory" }}
        className="overflow-y-scroll [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div style={{ height: PAD }} />
        {items.map((item) => {
          const active = item === value;
          return (
            <div
              key={item}
              style={{
                height: ITEM_H,
                scrollSnapAlign: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                userSelect: "none",
                position: "relative",
                zIndex: active ? 30 : undefined,
                fontSize: active ? 20 : 15,
                fontWeight: active ? 700 : 400,
                color: active ? "#0c0d10" : "rgba(12,13,16,0.55)",
                transition: "font-size 75ms, color 75ms",
              }}
              className="font-jio"
            >
              {item}
            </div>
          );
        })}
        <div style={{ height: PAD }} />
      </div>
    </div>
  );
}

// ─── ReminderTimeSheet — astro-style bottom sheet for a reminder's time/interval ──

export function ReminderTimeSheet({
  reminder,
  value,
  onConfirm,
  onClose,
}: {
  reminder: Reminder;
  /** Interval hours (water) or minutes-from-midnight (meals). */
  value: number;
  onConfirm: (value: number) => void;
  onClose: () => void;
}) {
  const isInterval = reminder.kind === "interval";

  // Interval picker (water): "हर N घंटे".
  const intervalItems = useMemo(
    () =>
      Array.from(
        { length: INTERVAL_MAX - INTERVAL_MIN + 1 },
        (_, i) => `हर ${i + INTERVAL_MIN} घंटे`,
      ),
    [],
  );
  const [intervalLabel, setIntervalLabel] = useState(`हर ${value} घंटे`);

  // Clock picker (meals): hour / minute / AM-PM.
  const hours = useMemo(
    () => Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")),
    [],
  );
  const minutes = useMemo(
    () => Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")),
    [],
  );
  const h24 = Math.floor(value / 60);
  const [hour, setHour] = useState(String(h24 % 12 || 12).padStart(2, "0"));
  const [minute, setMinute] = useState(String(value % 60).padStart(2, "0"));
  const [period, setPeriod] = useState<"AM" | "PM">(h24 < 12 ? "AM" : "PM");

  const confirm = () => {
    if (isInterval) {
      onConfirm(parseInt(intervalLabel.replace(/\D/g, ""), 10));
    } else {
      const h = (parseInt(hour, 10) % 12) + (period === "PM" ? 12 : 0);
      onConfirm(h * 60 + parseInt(minute, 10));
    }
  };

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col justify-end"
      style={{ background: "rgba(12,13,16,0.5)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto w-full max-w-[480px] rounded-t-xl bg-white px-5 pt-3 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="bg-surface-moderate mx-auto mb-4 h-1 w-10 rounded-full" />

        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <p className="font-jio text-[17px] font-bold text-[#0c0d10]">
            {reminder.label} · {isInterval ? "कितनी देर में?" : "समय चुनें"}
          </p>
          <button
            type="button"
            aria-label="बंद करें"
            onClick={onClose}
            className="bg-surface-ghost inline-flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-150 ease-out active:scale-[0.95]"
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path
                d="M1 1l9 9M10 1L1 10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {isInterval ? (
          <div className="flex justify-center">
            <ScrollPicker
              items={intervalItems}
              value={intervalLabel}
              onChange={setIntervalLabel}
              flex="w-[220px]"
            />
          </div>
        ) : (
          <>
            <div className="font-jio mb-0 flex text-[rgba(12,13,16,0.38)]" style={{ fontSize: 11 }}>
              <div className="flex-1 text-center">घंटा</div>
              <div className="flex-1 text-center">मिनट</div>
              <div className="w-[72px] text-center">AM / PM</div>
            </div>
            <div className="flex items-start gap-2">
              <ScrollPicker items={hours} value={hour} onChange={setHour} flex="flex-1" />
              <span
                className="shrink-0 text-[22px] font-bold text-[rgba(12,13,16,0.35)]"
                style={{ marginTop: "109px" }}
              >
                :
              </span>
              <ScrollPicker items={minutes} value={minute} onChange={setMinute} flex="flex-1" />
              <div
                className="flex w-[68px] flex-col gap-2 transition-all duration-200 ease-out"
                style={{ marginTop: period === "AM" ? "94px" : "34px" }}
              >
                {(["AM", "PM"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriod(p)}
                    className={`font-jio h-[52px] rounded-full border text-sm transition-transform duration-150 ease-out active:scale-[0.97] ${
                      period === p
                        ? "bg-primary-20 border-transparent font-bold text-[#0c0d10]"
                        : "border-[rgba(12,13,16,0.12)] bg-white text-[rgba(12,13,16,0.45)]"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <button
          type="button"
          onClick={confirm}
          className="bg-primary-50 font-jio mt-6 inline-flex h-14 w-full items-center justify-center rounded-full text-sm font-bold text-white transition-transform duration-150 ease-out hover:scale-[1.02] active:scale-[0.97]"
        >
          सेट करें
        </button>
      </motion.div>
    </div>
  );
}
