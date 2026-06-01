"use client";

import Image from "next/image";
import { useState } from "react";

import { HubChatInput } from "../../HubChatInput";
import { HubHeader } from "../../HubHeader";
import { JOBS_APP_BASE_PATH, MICROLEARN_ASSETS } from "../../hub-data";

type Chip = { label: string; iconSrc: string };

const CHIPS: Chip[] = [
  { label: "Thumbnail not clicking", iconSrc: `${MICROLEARN_ASSETS}/thumbnail.svg` },
  { label: "Titles are boring", iconSrc: `${MICROLEARN_ASSETS}/subtitle.svg` },
  { label: "ChatGPT prompts aren't useful", iconSrc: `${MICROLEARN_ASSETS}/ai.svg` },
  { label: "Views dropping on recent videos", iconSrc: `${MICROLEARN_ASSETS}/views.svg` },
];

type Message = { role: "ai" | "user"; text: string };

const INITIAL_MESSAGES: Message[] = [
  {
    role: "ai",
    text: "Creator track. Tell me what's stuck - hooks, titles, thumbnails, or edits?",
  },
];

export default function CreatorChatPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [chipsVisible, setChipsVisible] = useState(true);

  function sendMessage(text: string) {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { role: "user", text: text.trim() }]);
    setInput("");
    setChipsVisible(false);
  }

  return (
    <div className="relative flex h-full flex-col bg-white text-fg">
      {/* Scrollable chat area */}
      <main
        className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 72px)" }}
      >
        <div className="flex flex-col gap-6">
          {/* Message bubbles */}
          <div className="flex flex-col gap-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[83%] rounded-tl-2xl rounded-tr-2xl px-[10px] py-[10px] text-sm leading-normal ${
                    msg.role === "ai"
                      ? "rounded-br-2xl bg-[#f5f5f5] text-black"
                      : "rounded-bl-2xl bg-[#3e0084] text-white"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Suggestion chips — shown only until first user reply */}
          {chipsVisible && (
            <div className="flex flex-col gap-[6px]">
              {CHIPS.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => sendMessage(chip.label)}
                  className="flex w-fit items-center gap-2 rounded-[30px] bg-[#f0e8fa] px-3 py-2 text-sm text-[#1b0633] touch-manipulation select-none active:opacity-70 transition-opacity outline-none"
                >
                  <Image
                    src={chip.iconSrc}
                    alt=""
                    width={16}
                    height={16}
                    className="size-4 shrink-0 pointer-events-none"
                    unoptimized
                  />
                  {chip.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </main>

      <HubHeader
        title="Microlearning"
        backHref={`${JOBS_APP_BASE_PATH}/design-prototype/microlearning/index.html`}
        rightIconSrc={`${MICROLEARN_ASSETS}/magic-edit.svg`}
        rightIconLabel="Magic edit"
      />

      <HubChatInput placeholder="Ask me anything" onSpeak={() => {}} />
    </div>
  );
}
