"use client";

import { useState } from "react";
import { HubHeader } from "@/app/jobs/design-prototype/HubHeader";
import { HubChatInput } from "@/app/jobs/design-prototype/HubChatInput";

const MONTHS = ["जन", "फर", "मार", "अप्र", "मई", "जून", "जुल", "अग", "सित", "अक्त", "नव", "दिस"];
const DAYS = ["र", "सो", "मं", "बु", "गु", "शु", "श"];

function buildCalendar(year: number, month: number) {
  const first = new Date(year, month, 1).getDay();
  const total = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(first).fill(null),
    ...Array.from({ length: total }, (_, i) => i + 1),
  ];
  return cells;
}

// Simulated period days for demo
const PERIOD_DAYS = new Set([3, 4, 5, 6, 7]);
const FERTILE_DAYS = new Set([12, 13, 14, 15, 16]);
const PREDICTED_DAYS = new Set([31, 32, 33, 34, 35]);

export default function PeriodTrackerPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [logMode, setLogMode] = useState(false);

  const cells = buildCalendar(year, month);

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

  function dayStyle(day: number) {
    if (PERIOD_DAYS.has(day)) return { bg: "#FEE2E2", text: "#EF4444", dot: null };
    if (FERTILE_DAYS.has(day)) return { bg: "#D1FAE5", text: "#059669", dot: null };
    if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear())
      return { bg: "#C2185B", text: "white", dot: null };
    return { bg: "transparent", text: "#1F2937", dot: null };
  }

  return (
    <div className="bg-canvas-grey relative flex h-full flex-col">
      <main
        className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 76px)" }}
      >
        <div className="mx-auto flex w-full max-w-md flex-col gap-4">
          {/* Status cards */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "अगला पीरियड", value: "12 दिन", color: "#FEE2E2", text: "#EF4444" },
              { label: "साइकिल", value: "28 दिन", color: "#EDE9FE", text: "#7C3AED" },
              { label: "फर्टाइल विंडो", value: "3 दिन", color: "#D1FAE5", text: "#059669" },
            ].map((s) => (
              <div
                key={s.label}
                className="flex flex-col items-center gap-1 rounded-xl p-3"
                style={{ background: s.color }}
              >
                <span
                  className="text-[16px] font-black"
                  style={{ fontFamily: "JioType, sans-serif", color: s.text }}
                >
                  {s.value}
                </span>
                <span
                  className="text-center text-[10px] leading-tight"
                  style={{ fontFamily: "JioType, sans-serif", color: "#374151" }}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          {/* Calendar */}
          <div className="rounded-2xl bg-white p-4">
            {/* Month nav */}
            <div className="mb-3 flex items-center justify-between">
              <button
                onClick={prevMonth}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-lg font-bold text-zinc-700 active:scale-95"
              >
                ‹
              </button>
              <span
                className="text-[15px] font-bold text-zinc-900"
                style={{ fontFamily: "JioType, sans-serif" }}
              >
                {MONTHS[month]} {year}
              </span>
              <button
                onClick={nextMonth}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-lg font-bold text-zinc-700 active:scale-95"
              >
                ›
              </button>
            </div>

            {/* Day headers */}
            <div className="mb-1 grid grid-cols-7">
              {DAYS.map((d) => (
                <div
                  key={d}
                  className="text-center text-[11px] font-medium text-zinc-400"
                  style={{ fontFamily: "JioType, sans-serif" }}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 gap-y-1">
              {cells.map((day, i) => {
                if (!day) return <div key={`e-${i}`} />;
                const s = dayStyle(day);
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                    className="mx-auto flex h-9 w-9 flex-col items-center justify-center rounded-full transition-transform active:scale-90"
                    style={{ background: selectedDay === day ? "#880E4F" : s.bg }}
                  >
                    <span
                      className="text-[13px] font-medium"
                      style={{
                        color: selectedDay === day ? "white" : s.text,
                        fontFamily: "JioType, sans-serif",
                      }}
                    >
                      {day}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-3 flex items-center justify-center gap-4">
              {[
                { color: "#FEE2E2", label: "पीरियड" },
                { color: "#D1FAE5", label: "फर्टाइल" },
                { color: "#C2185B", label: "आज" },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-1">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{
                      background: l.color,
                      border: l.color === "#C2185B" ? "none" : "1px solid rgba(0,0,0,0.08)",
                    }}
                  />
                  <span
                    className="text-[10px] text-zinc-500"
                    style={{ fontFamily: "JioType, sans-serif" }}
                  >
                    {l.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Log button */}
          <button
            type="button"
            onClick={() => setLogMode((v) => !v)}
            className="w-full rounded-full py-3 text-[14px] font-semibold text-white transition-transform active:scale-[0.97]"
            style={{
              fontFamily: "JioType, sans-serif",
              background: "linear-gradient(90deg, #E91E8C 0%, #C2185B 100%)",
            }}
          >
            🩸 {logMode ? "बंद करें" : "आज का पीरियड लॉग करें"}
          </button>

          {/* Log panel */}
          {logMode && (
            <div className="flex flex-col gap-3 rounded-2xl bg-white p-4">
              <p
                className="text-[14px] font-bold text-zinc-800"
                style={{ fontFamily: "JioType, sans-serif" }}
              >
                आज कैसा महसूस हो रहा है?
              </p>
              <div className="flex flex-wrap gap-2">
                {["दर्द", "थकान", "मूड खराब", "सूजन", "सिरदर्द", "ठीक है"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="rounded-full px-3 py-1.5 text-[12px] font-medium transition-all active:scale-95"
                    style={{
                      fontFamily: "JioType, sans-serif",
                      background: "#FCE4EC",
                      color: "#C2185B",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="w-full rounded-full py-2.5 text-[13px] font-semibold text-white"
                style={{ fontFamily: "JioType, sans-serif", background: "#C2185B" }}
              >
                सेव करें ✓
              </button>
            </div>
          )}

          {/* Didi tip */}
          <div className="rounded-2xl p-4" style={{ background: "#FFF0F5" }}>
            <p
              className="mb-1 text-[12px] font-bold text-pink-700"
              style={{ fontFamily: "JioType, sans-serif" }}
            >
              💡 सखी की सलाह
            </p>
            <p
              className="text-[13px] leading-relaxed text-zinc-700"
              style={{ fontFamily: "JioType, sans-serif" }}
            >
              आपका अगला पीरियड{" "}
              <strong>
                ~
                {new Date(year, month, today.getDate() + 12).toLocaleDateString("hi-IN", {
                  day: "numeric",
                  month: "long",
                })}
              </strong>{" "}
              को आने की संभावना है। पानी खूब पिएं और हल्की एक्सरसाइज़ करें।
            </p>
          </div>
        </div>
      </main>

      <HubHeader title="पीरियड ट्रैकर" backHref="/womens-health" scrolled={false} />
      <HubChatInput variant="sleek" placeholder="पीरियड के बारे में पूछें..." />
    </div>
  );
}
