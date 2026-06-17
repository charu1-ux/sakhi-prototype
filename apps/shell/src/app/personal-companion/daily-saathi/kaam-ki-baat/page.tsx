"use client";

import { type ReactNode, useEffect, useState } from "react";

import { Avatar } from "../_components/Avatar";
import { AttachSheet } from "../_components/AttachSheet";
import { SaathiComposer } from "../_components/SaathiComposer";
import { StubHeader } from "../_components/StubHeader";
import { SuggestedReplies } from "../_components/SuggestedReplies";
import { VoiceChat } from "../_components/VoiceChat";
import { ASSETS } from "../saathi-data";
import { useLang } from "../saathi-i18n";
import { DocIcon, ImageIcon, SunIcon, TasksIcon } from "../saathi-icons";

// ─────────────────────────────────────────────────────────────────────────────
// PARKED: Reminders flow (commented out while "Today's Briefing" is WIP).
// Reminders are being replaced by the Briefing capability. The full reminder
// flow is preserved below so it can be restored; the ReminderWidget, parser and
// store files remain in the repo.
//
// import {
//   type DateChip, type ReminderDraft, EMPTY_DRAFT, formatHM, isDateFilled,
//   isTimeFilled, isWhatFilled, ReminderWidget, resolveDate,
// } from "../_components/ReminderWidget";
// import { CheckIcon } from "../../chat/icons";
// import { parseReminder } from "../reminders/parse";
// import { filterForDate, fmtDate } from "../reminders/reminders-data";
// import { addReminder } from "../reminders/reminders-store";
// import { ROUTES } from "../saathi-data";
// import { BellIcon } from "../saathi-icons";
// import { useNav } from "../use-nav";
//
// function dateToChip(date, now = new Date()) { … today/tomorrow/custom … }
// function mergeParse(base, text) { … parseReminder → patch draft … }
//
//   const { go } = useNav();
//   const w = t.rem.widget;
//   const [draft, setDraft] = useState<ReminderDraft>(EMPTY_DRAFT);
//
//   const enterReminder = () => { pushUser(t.kaam.pills.reminder); setDraft(EMPTY_DRAFT); setMode("reminder-editing"); };
//   // send(): reminder-intent branch
//   const p = parseReminder(clean);
//   const reminderIntent = mode === "reminder-editing" || /\bremind|reminder\b/i.test(clean) || (!!p.title && (!!p.date || !!p.time));
//   if (reminderIntent) { setDraft(mergeParse(mode === "reminder-editing" ? draft : EMPTY_DRAFT, clean)); setMode("reminder-editing"); }
//   const onSubmit = () => { addReminder({ title, datetime, list:"Personal", priority:"none" }); push success card; setMode("chat"); };
//   const onEdit = (cardId, snapshot) => { remove card; setDraft(snapshot); setMode("reminder-editing"); };
//   const viewInReminders = (d) => go(`${ROUTES.home}?reminders=${filterForDate(dt)}`);
//   const leadIn = () => …; const summary = (d) => w.success(what, datePhrase, time);
//   // ?intent=reminder → setMode("reminder-editing")
//   // Pills: { label: t.kaam.pills.reminder, icon: <BellIcon/>, onClick: enterReminder }
//   // Render: {mode === "reminder-editing" && (<lead-in/> <ReminderWidget/>)}
//   // Render: success card (CheckIcon + summary + Edit / View in Reminders)
// ─────────────────────────────────────────────────────────────────────────────

// Each chat item is a text bubble or a result-card node (generated image / doc).
type Msg = { id: number; role: "assistant" | "user"; text?: string; node?: ReactNode };
// "image" / "doc" run scripted, inline conversations in the same chat + header.
type Mode = "chat" | "image" | "doc";
let uid = 0;

export default function KaamKiBaatChat() {
  const { t } = useLang();

  const [messages, setMessages] = useState<Msg[]>([
    { id: uid++, role: "assistant", text: t.kaam.greet },
  ]);
  const [mode, setMode] = useState<Mode>("chat");
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

  // "Today's Briefing" — placeholder (work in progress).
  const showBriefingSoon = () => {
    pushUser(t.briefing.pill);
    setTimeout(() => pushAssistant(t.briefing.comingSoon), 400);
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

  // Entry via deep-link: /kaam-ki-baat/?intent=image | doc
  useEffect(() => {
    const intent = new URLSearchParams(window.location.search).get("intent");
    if (intent === "image") enterImage();
    else if (intent === "doc") enterDoc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const send = (text: string) => {
    const clean = text.trim();
    if (!clean) return;
    pushUser(clean);
    // Inline image/doc stories take precedence while their flow is active.
    if (mode === "image") return advanceStory("image", clean);
    if (mode === "doc") return advanceStory("doc", clean);
    setTimeout(() => pushAssistant(t.kaam.fallback), 400);
  };

  const pills: { label: string; icon: ReactNode; onClick: () => void; muted?: boolean }[] = [
    {
      label: t.briefing.pill,
      icon: <SunIcon className="size-4" />,
      onClick: showBriefingSoon,
      muted: true,
    },
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
                className={
                  p.muted
                    ? "bg-surface-ghost flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-medium text-[rgba(12,13,16,0.45)] transition-transform duration-200 outline-none active:scale-[0.96]"
                    : "border-primary-50/30 bg-surface text-primary-50 focus-visible:ring-primary-60 flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 py-2 text-[13px] font-medium transition-transform duration-200 outline-none hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-offset-1 active:scale-[0.96]"
                }
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
