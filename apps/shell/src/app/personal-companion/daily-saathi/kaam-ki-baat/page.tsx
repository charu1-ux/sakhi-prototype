"use client";

import { type ReactNode, useEffect, useState } from "react";

import { Avatar } from "../_components/Avatar";
import {
  type DateChip,
  type ReminderDraft,
  EMPTY_DRAFT,
  formatHM,
  isDateFilled,
  isTimeFilled,
  isWhatFilled,
  ReminderWidget,
  resolveDate,
} from "../_components/ReminderWidget";
import { SaathiComposer } from "../_components/SaathiComposer";
import { StubHeader } from "../_components/StubHeader";
import { SuggestedReplies } from "../_components/SuggestedReplies";
import { CheckIcon } from "../../chat/icons";
import { parseReminder } from "../reminders/parse";
import { fmtDate } from "../reminders/reminders-data";
import { addReminder } from "../reminders/reminders-store";
import { ASSETS, ROUTES } from "../saathi-data";
import { useLang } from "../saathi-i18n";
import { BellIcon, DocIcon, ImageIcon, TasksIcon } from "../saathi-icons";
import { useNav } from "../use-nav";

// Each chat item is either a text bubble or a persisted reminder success card.
type Msg = { id: number; role: "assistant" | "user"; text?: string; card?: ReminderDraft };
type Mode = "chat" | "reminder-editing";
let uid = 0;

function dateToChip(date: Date, now = new Date()): { dateChip: DateChip; customDate: Date | null } {
  const day = new Date(date).setHours(0, 0, 0, 0);
  const today = new Date(now).setHours(0, 0, 0, 0);
  const diff = Math.round((day - today) / 86400000);
  if (diff === 0) return { dateChip: "today", customDate: null };
  if (diff === 1) return { dateChip: "tomorrow", customDate: null };
  return { dateChip: "custom", customDate: new Date(date) };
}

function mergeParse(base: ReminderDraft, text: string): ReminderDraft {
  const p = parseReminder(text);
  const next: ReminderDraft = { ...base };
  if (p.title) next.what = p.title;
  if (p.date) {
    const { dateChip, customDate } = dateToChip(p.date);
    next.dateChip = dateChip;
    next.customDate = customDate;
  }
  if (p.time) next.time = p.time;
  return next;
}

export default function KaamKiBaatChat() {
  const { t } = useLang();
  const { go } = useNav();
  const w = t.rem.widget;

  const [messages, setMessages] = useState<Msg[]>([
    { id: uid++, role: "assistant", text: t.kaam.greet },
  ]);
  const [mode, setMode] = useState<Mode>("chat");
  const [draft, setDraft] = useState<ReminderDraft>(EMPTY_DRAFT);

  const pushUser = (text: string) => setMessages((m) => [...m, { id: uid++, role: "user", text }]);

  // Entry via the home "+ Add" → /kaam-ki-baat/?intent=reminder
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("intent") === "reminder") {
      setDraft(EMPTY_DRAFT);
      setMode("reminder-editing");
    }
  }, []);

  const enterReminder = () => {
    pushUser(t.kaam.pills.reminder);
    setDraft(EMPTY_DRAFT);
    setMode("reminder-editing");
  };

  // Scripted reminder demos — each lands the widget in one of the three states
  // (empty / partially filled / fully filled) without relying on the parser, so
  // it reads correctly in both languages.
  const demoReminder = (line: string, next: ReminderDraft) => {
    pushUser(line);
    setDraft(next);
    setMode("reminder-editing");
  };
  const ex = t.kaam.examples;
  const reminderExamples = [
    { label: ex.empty.chip, onPick: () => demoReminder(ex.empty.line, EMPTY_DRAFT) },
    {
      label: ex.partial.chip,
      onPick: () =>
        demoReminder(ex.partial.line, {
          what: ex.partial.what,
          dateChip: null,
          customDate: null,
          time: null,
        }),
    },
    {
      label: ex.full.chip,
      onPick: () =>
        demoReminder(ex.full.line, {
          what: ex.full.what,
          dateChip: "tomorrow",
          customDate: null,
          time: { h: 9, m: 0 },
        }),
    },
  ];

  const send = (text: string) => {
    const clean = text.trim();
    if (!clean) return;
    pushUser(clean);
    const p = parseReminder(clean);
    const reminderIntent =
      mode === "reminder-editing" ||
      /\bremind|reminder\b/i.test(clean) ||
      (!!p.title && (!!p.date || !!p.time));
    if (reminderIntent) {
      const base = mode === "reminder-editing" ? draft : EMPTY_DRAFT;
      setDraft(mergeParse(base, clean));
      setMode("reminder-editing");
    } else {
      setTimeout(
        () => setMessages((m) => [...m, { id: uid++, role: "assistant", text: t.kaam.fallback }]),
        400,
      );
    }
  };

  const onSubmit = () => {
    const date = resolveDate(draft);
    if (!date || !draft.time) return;
    const dt = new Date(date);
    dt.setHours(draft.time.h, draft.time.m, 0, 0);
    addReminder({
      title: draft.what.trim(),
      datetime: dt.toISOString(),
      list: "Personal",
      priority: "none",
    });
    // Persist a success card into the stream; return to base chat.
    setMessages((m) => [...m, { id: uid++, role: "assistant", card: draft }]);
    setMode("chat");
  };

  const onEdit = (cardId: number, snapshot: ReminderDraft) => {
    setMessages((m) => m.filter((x) => x.id !== cardId));
    setDraft(snapshot);
    setMode("reminder-editing");
  };

  const leadIn = (): string => {
    const count = [isWhatFilled(draft), isDateFilled(draft), isTimeFilled(draft)].filter(
      Boolean,
    ).length;
    if (count === 0) return w.leadEmpty;
    if (count === 3) return w.leadAllSet;
    const missing = [
      !isWhatFilled(draft) && "what",
      !isDateFilled(draft) && "date",
      !isTimeFilled(draft) && "time",
    ].filter(Boolean) as string[];
    if (missing.length > 1) return w.needMore;
    return missing[0] === "what" ? w.needWhat : missing[0] === "date" ? w.needDate : w.needTime;
  };

  const summary = (d: ReminderDraft): string => {
    const datePhrase =
      d.dateChip === "today"
        ? w.dpToday
        : d.dateChip === "tomorrow"
          ? w.dpTomorrow
          : `${w.dpOn}${d.customDate ? fmtDate(d.customDate.toISOString()) : ""}`.trim();
    const time = d.time ? formatHM(d.time.h, d.time.m) : "";
    const what = d.what.trim().replace(/^./, (c) => c.toLowerCase());
    return w.success(what, datePhrase, time);
  };

  const pills: { label: string; icon: ReactNode; onClick: () => void }[] = [
    { label: t.kaam.pills.reminder, icon: <BellIcon className="size-4" />, onClick: enterReminder },
    {
      label: t.kaam.pills.image,
      icon: <ImageIcon className="size-4" />,
      onClick: () => go(ROUTES.createImage),
    },
    {
      label: t.kaam.pills.doc,
      icon: <DocIcon className="size-4" />,
      onClick: () => go(ROUTES.explainDoc),
    },
  ];

  return (
    <div className="bg-surface relative flex h-full flex-col text-[#0c0d10]">
      <StubHeader title={t.kaam.title} subtitle={t.kaam.headerSub} />

      <main className="bg-surface-minimal min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto flex w-full max-w-md flex-col gap-3">
          {messages.map((m, i) => {
            if (m.card) {
              return (
                <div
                  key={m.id}
                  className="bg-surface w-full self-start rounded-xl border border-[rgba(12,13,16,0.08)] p-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="bg-secondary-20 text-secondary-50 flex size-7 shrink-0 items-center justify-center rounded-full">
                      <CheckIcon className="size-4" />
                    </span>
                    <p className="flex-1 text-[14px] leading-snug text-[#0c0d10]">
                      {summary(m.card)}
                    </p>
                  </div>
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => onEdit(m.id, m.card!)}
                      className="border-primary-50 text-primary-50 focus-visible:ring-primary-60 cursor-pointer rounded-full border px-3 py-1.5 text-[12px] font-bold transition-transform duration-200 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.97]"
                    >
                      {w.edit}
                    </button>
                  </div>
                </div>
              );
            }
            return m.role === "assistant" ? (
              <div key={m.id} className="flex items-end gap-2 self-start">
                {i === 0 && (
                  <Avatar
                    src={ASSETS.kaamKiBaat}
                    alt=""
                    fallback={<TasksIcon className="text-primary-50 size-4" />}
                    className="bg-surface-ghost-icon size-7 shrink-0 rounded-full"
                  />
                )}
                <div className="bg-surface max-w-[84%] rounded-[4px_18px_18px_18px] border border-[rgba(12,13,16,0.08)] px-3.5 py-2.5 text-[14px] leading-relaxed text-[#0c0d10] shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                  {m.text}
                </div>
              </div>
            ) : (
              <div
                key={m.id}
                className="bg-primary-50 max-w-[84%] self-end rounded-[18px_18px_4px_18px] px-3.5 py-2.5 text-[14px] leading-relaxed text-white"
              >
                {m.text}
              </div>
            );
          })}

          {/* Reminder widget (editing) — lead-in + card */}
          {mode === "reminder-editing" && (
            <>
              <div className="bg-surface max-w-[84%] self-start rounded-[4px_18px_18px_18px] border border-[rgba(12,13,16,0.08)] px-3.5 py-2.5 text-[14px] leading-relaxed text-[#0c0d10] shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                {leadIn()}
              </div>
              <ReminderWidget
                draft={draft}
                onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))}
                onSubmit={onSubmit}
              />
            </>
          )}
        </div>
      </main>

      {/* Pills (hidden while actively filling the widget) + composer */}
      <div className="bg-surface shrink-0">
        {mode !== "reminder-editing" && <SuggestedReplies items={reminderExamples} />}
        {mode !== "reminder-editing" && (
          <div className="flex gap-2 overflow-x-auto px-4 pt-2 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {pills.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={p.onClick}
                className="border-primary-50/30 bg-surface text-primary-50 focus-visible:ring-primary-60 flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 py-2 text-[13px] font-medium transition-transform duration-200 outline-none hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-offset-1 active:scale-[0.96]"
              >
                {p.icon}
                <span className="whitespace-nowrap">{p.label}</span>
              </button>
            ))}
          </div>
        )}
        <SaathiComposer
          placeholder={t.kaam.placeholder}
          onSubmit={send}
          voiceFirst
          speakLabel={t.speak}
        />
      </div>
    </div>
  );
}
