"use client";

import { type ReactNode, useRef, useState } from "react";

import { SaathiComposer } from "./SaathiComposer";
import { StubHeader } from "./StubHeader";
import { SuggestedReplies } from "./SuggestedReplies";
import { useLang } from "../saathi-i18n";
import type { StoryTurn } from "../saathi-i18n";

// Response-driven scripted conversation. Seeds one assistant greeting, then
// plays a fixed sequence of exchanges: each turn shows tappable suggested
// replies, and once the user responds (tap or free type) the assistant's
// scripted bubbles stream in. A result card (image/doc) can be injected after
// a chosen turn. JDS bubbles throughout; mirrors AssistantChatStub's styling.
type Msg = { id: number; role: "assistant" | "user"; text?: string; node?: ReactNode };

let uid = 0;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function ScriptedChatStub({
  title,
  subtitle,
  greet,
  turns,
  placeholder,
  resultCard,
  resultTurnIndex = 0,
}: {
  title: string;
  subtitle?: string;
  greet: string;
  turns: StoryTurn[];
  placeholder?: string;
  resultCard?: (firstUserText: string) => ReactNode;
  resultTurnIndex?: number;
}) {
  const { t } = useLang();
  const [messages, setMessages] = useState<Msg[]>([{ id: uid++, role: "assistant", text: greet }]);
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const firstUserRef = useRef("");
  const busyRef = useRef(false);

  const send = async (text: string) => {
    const clean = text.trim();
    if (!clean || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);

    const turnIdx = index;
    if (turnIdx === 0) firstUserRef.current = clean;
    setMessages((m) => [...m, { id: uid++, role: "user", text: clean }]);

    const turn = turns[turnIdx];
    await sleep(550);

    if (turn) {
      for (const line of turn.reply) {
        setMessages((m) => [...m, { id: uid++, role: "assistant", text: line }]);
        await sleep(420);
      }
      if (resultCard && turnIdx === resultTurnIndex) {
        setMessages((m) => [
          ...m,
          { id: uid++, role: "assistant", node: resultCard(firstUserRef.current) },
        ]);
      }
      setIndex(turnIdx + 1);
    }
    // Past the scripted turns the composer stays open but no further auto-reply.

    busyRef.current = false;
    setBusy(false);
  };

  const suggestions =
    !busy && index < turns.length
      ? turns[index].suggestions.map((label) => ({ label, onPick: () => void send(label) }))
      : [];

  return (
    <div className="bg-surface relative flex h-full flex-col text-[#0c0d10]">
      <StubHeader title={title} subtitle={subtitle} />

      <main className="bg-surface-minimal min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto flex w-full max-w-md flex-col gap-3">
          {messages.map((m) => {
            if (m.node) {
              return (
                <div key={m.id} className="w-full self-start">
                  {m.node}
                </div>
              );
            }
            return m.role === "assistant" ? (
              <div
                key={m.id}
                className="bg-surface max-w-[84%] self-start rounded-[4px_18px_18px_18px] border border-[rgba(12,13,16,0.08)] px-3.5 py-2.5 text-[14px] leading-relaxed text-[#0c0d10] shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
              >
                {m.text}
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

      <div className="bg-surface shrink-0">
        <SuggestedReplies items={suggestions} />
        <SaathiComposer placeholder={placeholder ?? t.composer} onSubmit={(s) => void send(s)} />
      </div>
    </div>
  );
}
