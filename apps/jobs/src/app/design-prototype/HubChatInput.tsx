"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

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
const BTN_SIZE = 48;
const SEND_SIZE = 36;
const LINE_H = 21;
const PILL_PY = 6;
const PILL_PX_L = 10;
const PILL_PX_R = 6;
const MAX_LINES = 3;
const MAX_TA_H = LINE_H * MAX_LINES;

// power3.inOut equivalent in cubic-bezier
const EASE = [0.7, 0, 0.3, 1] as const;
const DUR = 0.28;
// Duration for speak exit + pill expansion — they run simultaneously
const SPEAK_DUR = DUR * 0.75;

const btnMotion = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 16 },
  transition: { duration: SPEAK_DUR, ease: EASE },
};

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
  const [isMultiLine, setIsMultiLine] = useState(false);

  const text = isControlled ? (value ?? "") : localVal;

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const addRef = useRef<HTMLButtonElement>(null);

  // Resize textarea and sync multi-line state
  useEffect(() => {
    const ta = textareaRef.current;
    const add = addRef.current;
    if (!ta || !add) return;

    ta.style.height = "auto";
    const scrollH = ta.scrollHeight;

    const lines = scrollH <= LINE_H ? 1 : scrollH <= LINE_H * 2 ? 2 : 3;
    const taTarget = LINE_H * lines;
    const nowMulti = lines > 1;

    ta.style.height = `${taTarget}px`;
    ta.style.overflowY = lines >= MAX_LINES ? "auto" : "hidden";

    setIsMultiLine(nowMulti);
    add.style.alignSelf = nowMulti ? "flex-end" : "center";
  }, [text]);

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
        {/* Add button — anchors to bottom in multiline via alignSelf ref update */}
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

        {/* Input pill — expands as speak exits, border-radius morphs on multi-line */}
        <motion.div
          layout
          className="flex min-w-0 flex-1 overflow-hidden"
          animate={{ borderRadius: isMultiLine ? 18 : 40 }}
          transition={{
            layout: { duration: SPEAK_DUR, ease: EASE },
            default: { duration: DUR, ease: EASE },
          }}
          style={{
            backgroundColor: "#f5f5f5",
            borderRadius: 40,
            paddingLeft: PILL_PX_L,
            paddingRight: PILL_PX_R,
            paddingTop: PILL_PY,
            paddingBottom: PILL_PY,
            gap: "8px",
            alignItems: isMultiLine ? "flex-end" : "center",
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

          {/* Send (arrow-up) — slides in after pill finishes expanding */}
          <AnimatePresence>
            {isTyping && (
              <motion.button
                key="send"
                type="button"
                aria-label="Send"
                onClick={handleSubmit}
                className="flex shrink-0 cursor-pointer appearance-none items-center justify-center overflow-hidden rounded-full touch-manipulation outline-none"
                style={{
                  width: SEND_SIZE,
                  height: SEND_SIZE,
                  backgroundColor: "#3e0084",
                  flexShrink: 0,
                }}
                initial={{ opacity: 0, x: 16 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  transition: { duration: SPEAK_DUR, ease: EASE, delay: SPEAK_DUR },
                }}
                exit={{ opacity: 0, x: 16, transition: { duration: SPEAK_DUR * 0.6, ease: EASE } }}
              >
                <Image
                  src={`${HOME_ASSETS}/arrow-up.svg`}
                  alt=""
                  width={20}
                  height={20}
                  className="pointer-events-none size-5"
                  unoptimized
                />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Speak — slides out + pill expands simultaneously when typing begins */}
        <AnimatePresence mode="popLayout">
          {!isTyping && (
            <motion.button
              key="speak"
              type="button"
              aria-label="Speak"
              onClick={onSpeak}
              className="flex shrink-0 cursor-pointer appearance-none items-center gap-[5px] overflow-hidden rounded-full px-3 touch-manipulation outline-none"
              style={{ height: BTN_SIZE, backgroundColor: "#3e0084", flexShrink: 0 }}
              {...btnMotion}
            >
              <Image
                src={`${HOME_ASSETS}/speak.svg`}
                alt=""
                width={20}
                height={20}
                className="pointer-events-none size-5"
                unoptimized
              />
              <span className="whitespace-nowrap text-base leading-normal text-white">Speak</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </footer>
  );
}
