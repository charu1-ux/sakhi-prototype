"use client";

import { type ReactNode, useRef, useState } from "react";

import { SaathiComposer } from "./SaathiComposer";
import { StubHeader } from "./StubHeader";
import { useLang } from "../saathi-i18n";

// Lightweight assistant-mode chat used by Kaam Ki Baat capability screens.
// Seeds one assistant message + an optional context card, then on the user's
// reply either echoes a canned ack (reminders/briefing) or renders a result
// card via `replyCard` (image/doc). JDS bubbles throughout.
type Msg = { id: number; role: "assistant" | "user"; text?: string; node?: ReactNode };

let uid = 0;

export function AssistantChatStub({
  title,
  subtitle,
  seededText,
  card,
  ack = "Done.",
  placeholder,
  replyCard,
}: {
  title: string;
  subtitle?: string;
  seededText: string;
  card?: ReactNode;
  ack?: string;
  placeholder?: string;
  replyCard?: (userText: string) => ReactNode;
}) {
  const { t } = useLang();
  const [messages, setMessages] = useState<Msg[]>([
    { id: uid++, role: "assistant", text: seededText },
  ]);
  const repliedRef = useRef(false);

  const send = (text: string) => {
    const clean = text.trim();
    if (!clean) return;
    setMessages((prev) => [...prev, { id: uid++, role: "user", text: clean }]);
    setTimeout(() => {
      setMessages((prev) => {
        const out: Msg[] = [...prev, { id: uid++, role: "assistant", text: ack }];
        if (replyCard && !repliedRef.current) {
          repliedRef.current = true;
          out.push({ id: uid++, role: "assistant", node: replyCard(clean) });
        }
        return out;
      });
    }, 600);
  };

  return (
    <div className="bg-surface relative flex h-full flex-col text-[#0c0d10]">
      <StubHeader title={title} subtitle={subtitle} />

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
              <div key={m.id} className="flex flex-col gap-3">
                <div className="bg-surface max-w-[84%] self-start rounded-[4px_18px_18px_18px] border border-[rgba(12,13,16,0.08)] px-3.5 py-2.5 text-[14px] leading-relaxed text-[#0c0d10] shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                  {m.text}
                </div>
                {i === 0 && card}
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

      <SaathiComposer placeholder={placeholder ?? t.composer} onSubmit={send} />
    </div>
  );
}

// Small JDS context card used inside the stubs — primary-tinted info block.
export function StubCard({ heading, rows }: { heading: string; rows: [string, string][] }) {
  return (
    <div className="bg-primary-20 w-full self-start rounded-md p-3.5">
      <p className="text-primary-60 mb-2 text-[12px] font-bold tracking-wide uppercase">
        {heading}
      </p>
      <div className="flex flex-col gap-1.5">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-3">
            <span className="text-[13px] text-[rgba(12,13,16,0.65)]">{label}</span>
            <span className="text-[14px] font-medium text-[#0c0d10]">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
