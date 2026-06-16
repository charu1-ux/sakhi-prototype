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
import { AttachSheet } from "../_components/AttachSheet";
import { SaathiComposer } from "../_components/SaathiComposer";
import { StubHeader } from "../_components/StubHeader";
import { SuggestedReplies } from "../_components/SuggestedReplies";
import { VoiceChat } from "../_components/VoiceChat";
import { CheckIcon } from "../../chat/icons";
import { parseReminder } from "../reminders/parse";
import { filterForDate, fmtDate } from "../reminders/reminders-data";
import { addReminder } from "../reminders/reminders-store";
import { ASSETS, ROUTES } from "../saathi-data";
import { useLang } from "../saathi-i18n";
import { BellIcon, DocIcon, ImageIcon, TasksIcon } from "../saathi-icons";
import { useNav } from "../use-nav";

// Each chat item is a text bubble, a reminder success card, or an arbitrary
// result card node (generated image / doc summary).
type Msg = {
  id: number;
  role: "assistant" | "user";
  text?: string;
  card?: ReminderDraft;
  node?: ReactNode;
};
// "image" / "doc" run scripted, inline conversations in the same chat + header.
type Mode = "chat" | "reminder-editing" | "image" | "doc";
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
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const [storyTurn, setStoryTurn] = useState(0); // image / doc scripted-turn cursor

  const pushUser = (text: string) => setMessages((m) => [...m, { id: uid++, role: "user", text }]);
  const pushAssistant = (text: string) =>
    setMessages((m) => [...m, { id: uid++, role: "assistant", text }]);
  const pushNode = (node: ReactNode) =>
    setMessages((m) => [...m, { id: uid++, role: "assistant", node }]);

  // Stream assistant reply bubbles, then an optional result card.
  const playReply = (lines: string[], card?: ReactNode) => {
    lines.forEach((line, i) => setTimeout(() => pushAssistant(line), 400 + i * 450));
    if (card) setTimeout(() => pushNode(card), 400 + lines.length * 450);
  };

  // ── Result cards (no real generation in the prototype) ──────────────────────
  const imageCard = (prompt: string): ReactNode => (
    <div className="bg-surface w-full overflow-hidden rounded-xl border border-[rgba(12,13,16,0.08)] shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <div className="bg-surface-ghost-icon flex aspect-video items-center justify-center">
        <ImageIcon className="text-primary-50 size-9" />
      </div>
      <div className="flex flex-col gap-1 p-3">
        <span className="text-primary-60 text-[10px] font-bold tracking-wide uppercase">
          {t.image.resultTag}
        </span>
        <span className="text-[13px] text-[#0c0d10]">{prompt}</span>
        <span className="text-[11px] text-[rgba(12,13,16,0.55)]">{t.image.resultNote}</span>
      </div>
    </div>
  );
  const docCard = (): ReactNode => (
    <div className="bg-surface w-full rounded-xl border border-[rgba(12,13,16,0.08)] p-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <span className="text-primary-60 mb-2 block text-[10px] font-bold tracking-wide uppercase">
        {t.doc.summaryTag}
      </span>
      <ul className="flex flex-col gap-2">
        {t.doc.summary.map((point, i) => (
          <li key={i} className="flex items-start gap-2 text-[13px] leading-snug text-[#0c0d10]">
            <span className="bg-primary-50 mt-1.5 size-1.5 shrink-0 rounded-full" />
            {point}
          </li>
        ))}
      </ul>
    </div>
  );

  const enterReminder = () => {
    pushUser(t.kaam.pills.reminder);
    setDraft(EMPTY_DRAFT);
    setMode("reminder-editing");
  };

  // Inline "Create an image" — companion asks what to create, then a scripted
  // refine loop with a generated-image card. Same chat + header.
  const enterImage = () => {
    pushUser(t.kaam.pills.image);
    setMode("image");
    setStoryTurn(0);
    setTimeout(() => pushAssistant(t.image.greet), 400);
  };

  // Inline "Explain a doc" — companion asks for the document (with the "+" upload
  // option), then summarizes and answers follow-ups. Same chat + header.
  const enterDoc = () => {
    pushUser(t.kaam.pills.doc);
    setMode("doc");
    setStoryTurn(0);
    setTimeout(() => pushAssistant(t.doc.greet), 400);
  };

  // Advance the image/doc scripted story by one turn (result card on turn 0).
  const advanceStory = (kind: "image" | "doc", userText: string) => {
    const story = kind === "image" ? t.image.story : t.doc.story;
    const turn = storyTurn;
    const step = story[turn];
    if (!step) {
      setTimeout(() => pushAssistant(t.kaam.fallback), 400);
      return;
    }
    const card = turn === 0 ? (kind === "image" ? imageCard(userText) : docCard()) : undefined;
    playReply(step.reply, card);
    setStoryTurn(turn + 1);
  };

  // "+" attach → simulate a document upload landing in the chat, then summarize.
  const attachDocument = () => {
    setAttachOpen(false);
    setMessages((m) => [...m, { id: uid++, role: "user", text: "Rent agreement.pdf" }]);
    setMode("doc");
    setStoryTurn(1);
    playReply(t.doc.story[0].reply, docCard());
  };

  // Entry via deep-link: /kaam-ki-baat/?intent=reminder | image | doc
  useEffect(() => {
    const intent = new URLSearchParams(window.location.search).get("intent");
    if (intent === "reminder") {
      setDraft(EMPTY_DRAFT);
      setMode("reminder-editing");
    } else if (intent === "image") {
      enterImage();
    } else if (intent === "doc") {
      enterDoc();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const send = (text: string) => {
    const clean = text.trim();
    if (!clean) return;
    pushUser(clean);
    // Inline image/doc stories take precedence while their flow is active.
    if (mode === "image") return advanceStory("image", clean);
    if (mode === "doc") return advanceStory("doc", clean);
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

  // Close the loop: jump to the Daily Saathi home, opening the reminders widget
  // on the bucket where the just-saved reminder landed.
  const viewInReminders = (d: ReminderDraft) => {
    const date = resolveDate(d);
    if (!date) {
      go(ROUTES.home);
      return;
    }
    const dt = new Date(date);
    if (d.time) dt.setHours(d.time.h, d.time.m, 0, 0);
    go(`${ROUTES.home}?reminders=${filterForDate(dt.toISOString())}`);
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
    { label: t.kaam.pills.image, icon: <ImageIcon className="size-4" />, onClick: enterImage },
    { label: t.kaam.pills.doc, icon: <DocIcon className="size-4" />, onClick: enterDoc },
  ];

  // Suggested replies for the active image/doc story turn.
  const storySuggestions =
    mode === "image"
      ? (t.image.story[storyTurn]?.suggestions ?? [])
      : mode === "doc"
        ? (t.doc.story[storyTurn]?.suggestions ?? [])
        : [];

  return (
    <div className="bg-surface relative flex h-full flex-col text-[#0c0d10]">
      <StubHeader
        title={t.kaam.title}
        subtitle={t.kaam.headerSub}
        avatar={{
          src: ASSETS.kaamKiBaat,
          alt: t.kaam.title,
          fallback: <TasksIcon className="text-primary-50 size-4" />,
        }}
      />

      <main className="bg-surface-minimal min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto flex w-full max-w-md flex-col gap-3">
          {messages.map((m, i) => {
            if (m.node) {
              return (
                <div key={m.id} className="w-full self-start">
                  {m.node}
                </div>
              );
            }
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
                  <div className="mt-2.5 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(m.id, m.card!)}
                      className="border-primary-50 text-primary-50 focus-visible:ring-primary-60 cursor-pointer rounded-full border px-3 py-1.5 text-[12px] font-bold transition-transform duration-200 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.97]"
                    >
                      {w.edit}
                    </button>
                    <button
                      type="button"
                      onClick={() => viewInReminders(m.card!)}
                      className="bg-primary-50 focus-visible:ring-primary-60 cursor-pointer rounded-full px-3 py-1.5 text-[12px] font-bold text-white transition-transform duration-200 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.97]"
                    >
                      {w.viewInReminders}
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

      {/* Bottom dock: capability pills (chat) · story suggestions (image/doc) · composer */}
      <div className="bg-surface shrink-0">
        {mode === "chat" && (
          <div className="flex gap-2 overflow-x-auto px-4 pt-3 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
        {(mode === "image" || mode === "doc") && storySuggestions.length > 0 && (
          <SuggestedReplies
            items={storySuggestions.map((label) => ({ label, onPick: () => send(label) }))}
          />
        )}
        <SaathiComposer
          placeholder={t.kaam.placeholder}
          onSubmit={send}
          voiceFirst
          speakLabel={t.speak}
          onVoice={() => setVoiceOpen(true)}
          onAttach={() => setAttachOpen(true)}
          attachLabel={t.kaam.attach.title}
        />
      </div>

      {attachOpen && <AttachSheet onPick={attachDocument} onClose={() => setAttachOpen(false)} />}

      {voiceOpen && (
        <VoiceChat
          title={t.kaam.title}
          subtitle={t.kaam.headerSub}
          avatarBig={
            <Avatar
              src={ASSETS.kaamKiBaat}
              alt={t.kaam.title}
              fallback={<TasksIcon className="text-primary-50 size-9" />}
              className="bg-surface-ghost-icon size-28 rounded-full"
            />
          }
          avatarSmall={
            <Avatar
              src={ASSETS.kaamKiBaat}
              alt={t.kaam.title}
              fallback={<TasksIcon className="text-primary-50 size-4" />}
              className="bg-surface-ghost-icon size-11 shrink-0 rounded-full"
            />
          }
          strings={{
            connecting: t.kaam.voice.connecting,
            prompt: t.kaam.voice.prompt,
            listening: t.kaam.voice.listening,
            thinking: t.kaam.voice.thinking,
            exitToText: t.kaam.voice.exitToText,
            back: t.back,
          }}
          utterances={t.kaam.voice.utterances}
          replies={t.kaam.voice.replies}
          onUserUtterance={pushUser}
          onAssistantReply={pushAssistant}
          onExitToText={() => setVoiceOpen(false)}
        />
      )}
    </div>
  );
}
