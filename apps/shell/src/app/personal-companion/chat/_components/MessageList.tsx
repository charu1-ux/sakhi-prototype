"use client";

import { useEffect, useRef } from "react";

import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import type { ChatMessage } from "../companion-data";

type Props = {
  messages: ChatMessage[];
  isTyping: boolean;
};

export function MessageList({ messages, isTyping }: Props) {
  const endRef = useRef<HTMLDivElement>(null);

  // Snap to the bottom whenever a new message or the typing indicator appears.
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isTyping]);

  return (
    <div className="flex flex-1 flex-col gap-1.5 overflow-y-auto px-4 py-4">
      {messages.map((m, i) => {
        const prev = messages[i - 1];
        // Show avatar on the first companion bubble of a grouped run.
        const showAvatar =
          m.sender === "companion" &&
          m.kind !== "call-record" &&
          (!prev || prev.sender !== "companion" || prev.kind === "call-record");
        return <MessageBubble key={m.id} message={m} showAvatar={showAvatar} />;
      })}
      {isTyping && <TypingIndicator />}
      <div ref={endRef} />
      <style>{`
        @keyframes dkb-pop {
          from { transform: translateY(6px) scale(0.98); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
