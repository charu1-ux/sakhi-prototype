"use client";

import { useRef } from "react";

import { CheckIcon, ChevronDownIcon, MicIcon } from "../../chat/icons";
import { fmtDate } from "../reminders/reminders-data";
import { useLang } from "../saathi-i18n";
import { CalendarIcon } from "../saathi-icons";

// ── Draft model (shared with the chat orchestrator) ──────────────────────────
export type DateChip = "today" | "tomorrow" | "custom";
export type ReminderDraft = {
  what: string;
  dateChip: DateChip | null;
  customDate: Date | null;
  time: { h: number; m: number } | null;
};
export const EMPTY_DRAFT: ReminderDraft = {
  what: "",
  dateChip: null,
  customDate: null,
  time: null,
};

// Required-field marker (module-level so it isn't recreated each render).
function Asterisk() {
  return <span className="text-error"> *</span>;
}

export function isWhatFilled(d: ReminderDraft) {
  return d.what.trim().length > 0;
}
export function isDateFilled(d: ReminderDraft) {
  return d.dateChip !== null && (d.dateChip !== "custom" || d.customDate !== null);
}
export function isTimeFilled(d: ReminderDraft) {
  return d.time !== null;
}
export function isComplete(d: ReminderDraft) {
  return isWhatFilled(d) && isDateFilled(d) && isTimeFilled(d);
}

export function formatHM(h: number, m: number): string {
  const ap = h < 12 ? "AM" : "PM";
  const hh = h % 12 || 12;
  return `${hh}:${String(m).padStart(2, "0")} ${ap}`;
}

// Resolve the chosen date to a concrete Date (date-only) for saving.
export function resolveDate(d: ReminderDraft, now: Date = new Date()): Date | null {
  if (d.dateChip === "today") {
    const x = new Date(now);
    x.setHours(0, 0, 0, 0);
    return x;
  }
  if (d.dateChip === "tomorrow") {
    const x = new Date(now);
    x.setDate(x.getDate() + 1);
    x.setHours(0, 0, 0, 0);
    return x;
  }
  if (d.dateChip === "custom" && d.customDate) {
    const x = new Date(d.customDate);
    x.setHours(0, 0, 0, 0);
    return x;
  }
  return null;
}

// 30-minute time options across the day.
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? 0 : 30;
  return { value: `${h}:${m}`, label: formatHM(h, m) };
});

type Props = {
  draft: ReminderDraft;
  onChange: (patch: Partial<ReminderDraft>) => void;
  onSubmit: () => void;
};

export function ReminderWidget({ draft, onChange, onSubmit }: Props) {
  const { t } = useLang();
  const w = t.rem.widget;
  const whatRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);

  const whatOk = isWhatFilled(draft);
  const dateOk = isDateFilled(draft);
  const timeOk = isTimeFilled(draft);
  const filledCount = [whatOk, dateOk, timeOk].filter(Boolean).length;
  const partial = filledCount > 0 && filledCount < 3;
  const hiWhat = partial && !whatOk;
  const hiDate = partial && !dateOk;
  const hiTime = partial && !timeOk;
  const complete = filledCount === 3;

  const openDatePicker = () => {
    const el = dateRef.current;
    if (!el) return;
    if (typeof el.showPicker === "function") el.showPicker();
    else el.click();
  };

  const labelCls = (hi: boolean) =>
    `mb-1.5 block text-[13px] font-medium ${hi ? "text-primary-50" : "text-[#0c0d10]"}`;
  const chipCls = (selected: boolean, accent: boolean) =>
    selected
      ? "border-primary-50 bg-primary-20 text-primary-50"
      : accent
        ? "border-primary-50/50 bg-surface text-[#0c0d10]"
        : "border-[rgba(12,13,16,0.12)] bg-surface text-[#0c0d10]";

  return (
    <div className="bg-surface w-full rounded-xl border border-[rgba(12,13,16,0.08)] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      {/* What to remind */}
      <div className="mb-4">
        <label className={labelCls(hiWhat)} htmlFor="rw-what">
          {w.whatLabel}
          <Asterisk />
        </label>
        <div
          className={`bg-surface-ghost flex items-center gap-2 rounded-md border px-3 ${
            hiWhat ? "border-primary-50" : "border-[rgba(12,13,16,0.12)]"
          }`}
        >
          <input
            id="rw-what"
            ref={whatRef}
            type="text"
            value={draft.what}
            onChange={(e) => onChange({ what: e.target.value })}
            placeholder={w.whatPh}
            className="min-w-0 flex-1 bg-transparent py-2.5 text-[14px] text-[#0c0d10] outline-none placeholder:text-[rgba(12,13,16,0.38)]"
          />
          {whatOk ? (
            <CheckIcon className="text-success size-5 shrink-0" />
          ) : (
            <button
              type="button"
              aria-label="Voice fill"
              onClick={() => whatRef.current?.focus()}
              className="text-primary-50 focus-visible:ring-primary-60 flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full outline-none focus-visible:ring-2 active:scale-[0.92]"
            >
              <MicIcon className="size-[18px]" />
            </button>
          )}
        </div>
      </div>

      {/* Date */}
      <div className="mb-4">
        <label className={labelCls(hiDate)}>
          {w.dateLabel}
          <Asterisk />
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onChange({ dateChip: "today", customDate: null })}
            className={`focus-visible:ring-primary-60 cursor-pointer rounded-full border px-4 py-2 text-[13px] font-medium transition-transform duration-200 outline-none focus-visible:ring-2 active:scale-[0.96] ${chipCls(draft.dateChip === "today", hiDate)}`}
          >
            {w.today}
          </button>
          <button
            type="button"
            onClick={() => onChange({ dateChip: "tomorrow", customDate: null })}
            className={`focus-visible:ring-primary-60 cursor-pointer rounded-full border px-4 py-2 text-[13px] font-medium transition-transform duration-200 outline-none focus-visible:ring-2 active:scale-[0.96] ${chipCls(draft.dateChip === "tomorrow", hiDate)}`}
          >
            {w.tomorrow}
          </button>
          <button
            type="button"
            aria-label="Pick a date"
            onClick={openDatePicker}
            className={`focus-visible:ring-primary-60 flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-2 text-[13px] font-medium transition-transform duration-200 outline-none focus-visible:ring-2 active:scale-[0.96] ${chipCls(draft.dateChip === "custom", hiDate)}`}
          >
            <CalendarIcon className="size-4" />
            {draft.dateChip === "custom" && draft.customDate
              ? fmtDate(draft.customDate.toISOString())
              : null}
          </button>
          {/* Hidden native date input */}
          <input
            ref={dateRef}
            type="date"
            className="pointer-events-none absolute size-0 opacity-0"
            onChange={(e) => {
              if (e.target.value) {
                onChange({
                  dateChip: "custom",
                  customDate: new Date(`${e.target.value}T00:00:00`),
                });
              }
            }}
          />
        </div>
      </div>

      {/* Time */}
      <div className="mb-4">
        <label className={labelCls(hiTime)} htmlFor="rw-time">
          {w.timeLabel}
          <Asterisk />
        </label>
        <div
          className={`bg-surface-ghost relative flex items-center rounded-md border ${
            hiTime ? "border-primary-50" : "border-[rgba(12,13,16,0.12)]"
          }`}
        >
          <select
            id="rw-time"
            value={draft.time ? `${draft.time.h}:${draft.time.m}` : ""}
            onChange={(e) => {
              const [h, m] = e.target.value.split(":").map(Number);
              onChange({ time: { h, m } });
            }}
            className={`w-full cursor-pointer appearance-none bg-transparent py-2.5 pr-9 pl-3 text-[14px] outline-none ${
              draft.time
                ? "text-[#0c0d10]"
                : hiTime
                  ? "text-primary-50"
                  : "text-[rgba(12,13,16,0.38)]"
            }`}
          >
            <option value="" disabled>
              {w.selectTime}
            </option>
            {TIME_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDownIcon
            className={`pointer-events-none absolute right-3 size-4 ${hiTime ? "text-primary-50" : "text-[rgba(12,13,16,0.5)]"}`}
          />
        </div>
      </div>

      {/* Submit */}
      <button
        type="button"
        disabled={!complete}
        onClick={onSubmit}
        className="bg-primary-50 focus-visible:ring-primary-60 w-full cursor-pointer rounded-full py-3 text-[14px] font-bold text-white transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] outline-none hover:scale-[1.01] focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
      >
        {w.submit}
      </button>
    </div>
  );
}
