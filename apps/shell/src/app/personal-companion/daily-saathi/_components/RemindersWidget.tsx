"use client";

import { useEffect, useRef, useState } from "react";

import { CheckIcon, ChevronDownIcon } from "../../chat/icons";
import {
  type Filter,
  type Reminder,
  LIST_DOT,
  bucketOf,
  chipLabel,
  counts,
  dateKey,
  defaultFilter,
} from "../reminders/reminders-data";
import { useReminders } from "../reminders/reminders-store";
import { ROUTES } from "../saathi-data";
import { useLang } from "../saathi-i18n";
import { AlertIcon, BellIcon, ChevronRightIcon, ClockIcon, PlusIcon } from "../saathi-icons";
import { useNav } from "../use-nav";

const MAX = 4;
const ORDER: Filter[] = ["overdue", "today", "upcoming", "all"];

export function RemindersWidget({ initialFilter }: { initialFilter?: Filter }) {
  const { t } = useLang();
  const { go } = useNav();
  const { reminders, toggle } = useReminders();
  const [filter, setFilter] = useState<Filter>(initialFilter ?? "today");
  const [expanded, setExpanded] = useState(false);
  const didInit = useRef(false);

  // Auto-jump: when a reminder is saved, the home passes the target filter.
  useEffect(() => {
    if (!initialFilter) return;
    didInit.current = true;
    setFilter(initialFilter);
    setExpanded(false);
  }, [initialFilter]);

  // Otherwise pick the smart default once reminders have loaded.
  useEffect(() => {
    if (didInit.current || !reminders.length) return;
    didInit.current = true;
    if (!initialFilter) setFilter(defaultFilter(reminders));
  }, [reminders, initialFilter]);

  const now = new Date();
  const c = counts(reminders, now);

  const parts: string[] = [];
  if (c.overdue > 0) parts.push(`${c.overdue} ${t.rem.overdueWord}`);
  if (c.today > 0) parts.push(`${c.today} ${t.rem.todayWord}`);
  if (!parts.length)
    parts.push(c.doneToday > 0 ? `${c.doneToday} ${t.rem.doneTodayWord}` : t.rem.allClear);
  const sub = parts.join(" · ");

  const match = (r: Reminder) => (filter === "all" ? true : !r.done && bucketOf(r, now) === filter);
  let items = reminders.filter(match).sort((a, b) => +new Date(a.datetime) - +new Date(b.datetime));
  if (filter === "all") {
    items = items.sort((a, b) =>
      a.done === b.done ? +new Date(a.datetime) - +new Date(b.datetime) : a.done ? 1 : -1,
    );
  }

  const total = items.length;
  const shown = expanded ? items : items.slice(0, MAX);
  const hidden = total - shown.length;

  const chipCls = (f: Filter): string => {
    if (f !== filter) return "bg-surface-ghost text-[rgba(12,13,16,0.55)]";
    return {
      overdue: "bg-[#fde8ea] text-error",
      today: "bg-secondary-20 text-secondary-50",
      upcoming: "bg-sparkle-20 text-sparkle-50",
      all: "bg-surface-moderate text-[#0c0d10]",
    }[f];
  };

  const Row = ({ r }: { r: Reminder }) => {
    const b = bucketOf(r, now);
    const od = b === "overdue" && !r.done;
    const timeTone = od
      ? "bg-[#fde8ea] text-error"
      : b === "today"
        ? "bg-sparkle-20 text-sparkle-50"
        : "bg-surface-ghost text-[rgba(12,13,16,0.65)]";
    return (
      <button
        type="button"
        onClick={() => toggle(r.id)}
        className="focus-visible:ring-primary-60 active:bg-surface-minimal flex w-full items-start gap-2.5 rounded-lg px-2 py-2.5 text-left transition-colors outline-none focus-visible:ring-2"
      >
        <span
          className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors ${
            r.done
              ? "border-primary-50 bg-primary-50"
              : od
                ? "border-error"
                : "border-[rgba(12,13,16,0.24)]"
          }`}
        >
          {r.done && <CheckIcon className="size-3 text-white" />}
        </span>
        <span className="min-w-0 flex-1">
          <span
            className={`block text-[14px] leading-snug ${
              r.done ? "text-[rgba(12,13,16,0.38)] line-through" : "text-[#0c0d10]"
            }`}
          >
            {r.title}
          </span>
          <span className="mt-1 flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ${timeTone}`}
            >
              <ClockIcon className="size-3" />
              {chipLabel(r, now)}
            </span>
            {r.priority === "high" && (
              <span className="text-error inline-flex items-center rounded-full bg-[#fde8ea] px-1.5 py-0.5 text-[11px] font-bold">
                !
              </span>
            )}
            {filter === "all" && (
              <span className="bg-surface-ghost inline-flex items-center rounded-full px-2 py-0.5 text-[11px] text-[rgba(12,13,16,0.65)]">
                {t.rem.lists[r.list]}
              </span>
            )}
          </span>
        </span>
        <span className={`mt-1.5 size-[7px] shrink-0 rounded-full ${LIST_DOT[r.list]}`} />
      </button>
    );
  };

  // Group the shown slice by date for the Upcoming filter.
  const groups: [string, Reminder[]][] = [];
  if (filter === "upcoming") {
    const map = new Map<string, Reminder[]>();
    shown.forEach((r) => {
      const k = dateKey(r);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(r);
    });
    groups.push(...map.entries());
  }

  return (
    <div className="bg-surface overflow-hidden rounded-xl border border-[rgba(12,13,16,0.08)] shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      {/* Header */}
      <div className="flex items-start justify-between px-4 pt-3.5">
        <div className="flex flex-col gap-0.5">
          <span className="flex items-center gap-1.5 text-[14px] font-bold text-[#0c0d10]">
            <BellIcon className="text-primary-50 size-[15px]" />
            {t.rem.title}
          </span>
          <span className="text-[11px] text-[rgba(12,13,16,0.55)]">{sub}</span>
        </div>
        <button
          type="button"
          onClick={() => go(ROUTES.reminders)}
          aria-label={t.rem.add}
          className="bg-primary-50 focus-visible:ring-primary-60 flex shrink-0 cursor-pointer items-center gap-1 rounded-full px-3 py-1.5 text-white transition-transform duration-200 outline-none hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.96]"
        >
          <PlusIcon className="size-3.5" />
          <span className="text-[12px] font-bold">{t.rem.add}</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 overflow-x-auto px-4 pt-3 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {ORDER.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => {
              setFilter(f);
              setExpanded(false);
            }}
            className={`focus-visible:ring-primary-60 shrink-0 cursor-pointer rounded-full px-3 py-1 text-[12px] font-medium transition-colors outline-none focus-visible:ring-2 ${chipCls(f)}`}
          >
            {t.rem.filters[f]}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="px-2 pb-1">
        {/* Overdue nudge on Today */}
        {filter === "today" && c.overdue > 0 && (
          <button
            type="button"
            onClick={() => setFilter("overdue")}
            className="mb-1 flex w-full cursor-pointer items-center gap-2 rounded-lg bg-[#fde8ea] px-3 py-2 text-left transition-transform duration-200 active:scale-[0.99]"
          >
            <AlertIcon className="text-error size-4 shrink-0" />
            <span className="text-error flex-1 text-[12px] font-medium">
              {c.overdue} {t.rem.overdueWord} {t.rem.nudgeSuffix}
            </span>
            <ChevronRightIcon className="text-error size-4 shrink-0" />
          </button>
        )}

        {total === 0 ? (
          <div className="flex flex-col items-center gap-1.5 px-4 py-7">
            <CheckIcon className="size-6 text-[rgba(12,13,16,0.24)]" />
            <span className="text-[13px] text-[rgba(12,13,16,0.55)]">{t.rem.allClear}</span>
          </div>
        ) : filter === "upcoming" ? (
          groups.map(([label, rows]) => (
            <div key={label}>
              <div className="px-2 pt-2 pb-0.5 text-[11px] font-medium tracking-wide text-[rgba(12,13,16,0.55)] uppercase">
                {label}
              </div>
              <div className="divide-y divide-[rgba(12,13,16,0.06)]">
                {rows.map((r) => (
                  <Row key={r.id} r={r} />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="divide-y divide-[rgba(12,13,16,0.06)]">
            {shown.map((r) => (
              <Row key={r.id} r={r} />
            ))}
          </div>
        )}

        {/* Overflow expand */}
        {!expanded && hidden > 0 && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="active:bg-surface-minimal mt-0.5 flex w-full cursor-pointer items-center justify-between border-t border-[rgba(12,13,16,0.06)] px-3 py-2.5 transition-colors"
          >
            <span className="text-primary-50 flex items-center gap-1 text-[12px] font-medium">
              <ChevronDownIcon className="size-3.5" />
              {hidden} {t.rem.moreSuffix}
            </span>
            <span className="text-[11px] text-[rgba(12,13,16,0.55)]">{t.rem.tapExpand}</span>
          </button>
        )}
      </div>
    </div>
  );
}
