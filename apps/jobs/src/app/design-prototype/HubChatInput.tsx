"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import gsap from "gsap";

import { HOME_ASSETS } from "./hub-data";

type Props = {
  placeholder?: string;
  value?: string;
  onChange?: (v: string) => void;
  onSubmit?: (v: string) => void;
  onAdd?: () => void;
  onSpeak?: () => void;
};

// Figma measurements
const BTN_SIZE = 48; // add + speak buttons
const SEND_SIZE = 36; // send (arrow-up) button inside pill
const LINE_H = 21; // lineHeight per row
const PILL_PY = 6; // pill paddingTop + paddingBottom each
const PILL_PX_L = 10;
const PILL_PX_R = 6;
const MAX_LINES = 3;
const MAX_TA_H = LINE_H * MAX_LINES; // 63px textarea max
const EASE = "power3.inOut";
const DUR = 0.28;

export function HubChatInput({
  placeholder = "Ask me anything",
  value,
  onChange,
  onSubmit,
  onAdd,
  onSpeak,
}: Props) {
  const isControlled = onChange !== undefined;
  const [localVal, setLocalVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const text = isControlled ? (value ?? "") : localVal;
  const multiLine = useRef(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const addRef = useRef<HTMLButtonElement>(null);
  const speakRef = useRef<HTMLButtonElement>(null);
  const sendRef = useRef<HTMLButtonElement>(null);
  const prevTyping = useRef(false);

  // Resize textarea — snaps at line boundaries, animates between them
  useEffect(() => {
    const ta = textareaRef.current;
    const pill = pillRef.current;
    const add = addRef.current;
    if (!ta || !pill || !add) return;

    // Measure actual content height
    ta.style.height = "auto";
    const scrollH = ta.scrollHeight;

    // Snap to discrete line count (1, 2 or 3)
    const lines = scrollH <= LINE_H ? 1 : scrollH <= LINE_H * 2 ? 2 : 3;
    const taTarget = LINE_H * lines; // textarea target height
    const isNowMulti = lines > 1;
    const wasMulti = multiLine.current;
    multiLine.current = isNowMulti;

    // Set height instantly — no animation
    ta.style.height = `${taTarget}px`;
    ta.style.overflowY = lines >= MAX_LINES ? "auto" : "hidden";

    // Morph pill border-radius at first multi-line crossing
    gsap.to(pill, {
      borderRadius: isNowMulti ? "18px" : "40px",
      duration: DUR,
      ease: EASE,
      overwrite: "auto",
    });

    // Flip alignment only on boundary crossing
    if (isNowMulti !== wasMulti) {
      pill.style.alignItems = isNowMulti ? "flex-end" : "center";
      add.style.alignSelf = isNowMulti ? "flex-end" : "center";
    }
  }, [text]);

  // Sequential speak ↔ send swap
  useEffect(() => {
    const wasTyping = prevTyping.current;
    prevTyping.current = isTyping;
    if (wasTyping === isTyping) return;

    const speak = speakRef.current;
    const send = sendRef.current;

    if (isTyping) {
      // Speak slides out → send slides in
      gsap
        .timeline()
        .to(speak, {
          opacity: 0,
          x: 16,
          duration: DUR * 0.75,
          ease: EASE,
          onComplete: () => {
            if (speak) speak.style.display = "none";
          },
        })
        .call(() => {
          if (send) {
            send.style.display = "flex";
            gsap.set(send, { opacity: 0, x: 16 });
          }
        })
        .to(send, { opacity: 1, x: 0, duration: DUR * 0.75, ease: EASE });
    } else {
      // Send slides out → speak slides in
      gsap
        .timeline()
        .to(send, {
          opacity: 0,
          x: 16,
          duration: DUR * 0.75,
          ease: EASE,
          onComplete: () => {
            if (send) send.style.display = "none";
          },
        })
        .call(() => {
          if (speak) {
            speak.style.display = "flex";
            gsap.set(speak, { opacity: 0, x: 16 });
          }
        })
        .to(speak, { opacity: 1, x: 0, duration: DUR * 0.75, ease: EASE });
    }
  }, [isTyping]);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const v = e.target.value;
    if (isControlled) onChange!(v);
    else setLocalVal(v);
    setIsTyping(v.length > 0);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function handleSubmit() {
    if (!text.trim()) return;
    onSubmit?.(text.trim());
    if (!isControlled) setLocalVal("");
    setIsTyping(false);
  }

  return (
    <footer
      className="sticky bottom-0 w-full bg-white"
      style={{ borderTop: "1px solid #EAEAEA", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center gap-[6px] px-4 py-3">
        {/* Add button — always BTN_SIZE, anchors to bottom in multiline via GSAP */}
        <button
          ref={addRef}
          type="button"
          aria-label="Add"
          onClick={onAdd}
          className="flex shrink-0 cursor-pointer appearance-none items-center justify-center overflow-hidden rounded-full touch-manipulation outline-none"
          style={{ width: BTN_SIZE, height: BTN_SIZE, backgroundColor: "#f0e8fa", flexShrink: 0 }}
        >
          <Image
            src={`${HOME_ASSETS}/add.svg`}
            alt=""
            width={20}
            height={20}
            className="pointer-events-none size-5"
            unoptimized
          />
        </button>

        {/* Input pill */}
        <div
          ref={pillRef}
          className="flex flex-1 min-w-0 overflow-hidden"
          style={{
            backgroundColor: "#f5f5f5",
            borderRadius: "40px",
            paddingLeft: PILL_PX_L,
            paddingRight: PILL_PX_R,
            paddingTop: PILL_PY,
            paddingBottom: PILL_PY,
            gap: "8px",
            alignItems: "center",
            display: "flex",
            minHeight: BTN_SIZE,
          }}
        >
          <textarea
            ref={textareaRef}
            rows={1}
            placeholder={placeholder}
            aria-label={placeholder}
            autoComplete="off"
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="flex-1 min-w-0 border-none bg-transparent outline-none ring-0 resize-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{
              fontSize: "16px",
              lineHeight: `${LINE_H}px`,
              color: text ? "#141414" : "rgba(0,0,0,0.65)",
              height: LINE_H,
              maxHeight: MAX_TA_H,
              overflowY: "hidden",
              padding: 0,
              margin: 0,
              display: "block",
            }}
          />

          {/* Send (arrow-up) — hidden by default, GSAP reveals */}
          <button
            ref={sendRef}
            type="button"
            aria-label="Send"
            onClick={handleSubmit}
            className="shrink-0 cursor-pointer appearance-none items-center justify-center overflow-hidden rounded-full touch-manipulation outline-none"
            style={{
              width: SEND_SIZE,
              height: SEND_SIZE,
              backgroundColor: "#3e0084",
              display: "none",
              opacity: 0,
              flexShrink: 0,
            }}
          >
            <Image
              src={`${HOME_ASSETS}/arrow-up.svg`}
              alt=""
              width={20}
              height={20}
              className="pointer-events-none size-5"
              unoptimized
            />
          </button>
        </div>

        {/* Speak button — BTN_SIZE, GSAP hides when typing */}
        <button
          ref={speakRef}
          type="button"
          aria-label="Speak"
          onClick={onSpeak}
          className="shrink-0 cursor-pointer appearance-none items-center gap-[5px] overflow-hidden rounded-full px-3 touch-manipulation outline-none"
          style={{
            height: BTN_SIZE,
            backgroundColor: "#3e0084",
            display: "flex",
            flexShrink: 0,
          }}
        >
          <Image
            src={`${HOME_ASSETS}/speak.svg`}
            alt=""
            width={20}
            height={20}
            className="pointer-events-none size-5"
            unoptimized
          />
          <span className="whitespace-nowrap text-base text-white leading-normal">Speak</span>
        </button>
      </div>
    </footer>
  );
}
