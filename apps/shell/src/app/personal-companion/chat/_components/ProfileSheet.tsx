"use client";

import { useEffect, useRef, useState } from "react";

import { CompanionAvatar } from "./CompanionAvatar";
import { CheckIcon } from "../icons";
import { COMPANION, LANGUAGE_OPTIONS, UI, type UiLanguage } from "../companion-data";

type Props = {
  uiLanguage: UiLanguage;
  messageCount: number;
  onSelectLanguage: (lang: UiLanguage) => void;
  onClearChat: () => void;
  onClose: () => void;
};

export function ProfileSheet({
  uiLanguage,
  messageCount,
  onSelectLanguage,
  onClearChat,
  onClose,
}: Props) {
  const t = UI[uiLanguage];
  const [dragY, setDragY] = useState(0);
  const [entered, setEntered] = useState(false);
  const [dragging, setDragging] = useState(false);
  const startY = useRef<number | null>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    startY.current = e.clientY;
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (startY.current == null) return;
    setDragY(Math.max(0, e.clientY - startY.current));
  };
  const onPointerUp = () => {
    if (dragY > 110) onClose();
    else setDragY(0);
    startY.current = null;
    setDragging(false);
  };

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end">
      {/* Scrim */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/40 transition-opacity duration-300"
        style={{ opacity: entered ? 1 : 0 }}
      />

      {/* Sheet */}
      <div
        className="relative flex max-h-[88%] flex-col overflow-hidden rounded-t-3xl bg-white"
        style={{
          transform: entered ? `translateY(${dragY}px)` : "translateY(100%)",
          transition: dragging ? "none" : "transform 300ms cubic-bezier(0.05,0.7,0.1,1)",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)",
        }}
      >
        {/* Drag handle */}
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          className="flex cursor-grab justify-center pt-3 pb-1 active:cursor-grabbing"
        >
          <span className="h-1.5 w-10 rounded-full bg-[rgba(12,13,16,0.18)]" />
        </div>

        <div className="overflow-y-auto px-5 pt-2">
          {/* Identity */}
          <div className="flex flex-col items-center gap-2 pb-4 text-center">
            <CompanionAvatar size={80} showActiveDot />
            <div>
              <p className="text-[20px] font-bold text-[#0c0d10]">{COMPANION.name}</p>
              <p className="text-[14px] text-[rgba(12,13,16,0.6)]">{t.profileTagline}</p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#25ab21]">
              <span className="size-1.5 rounded-full bg-[#25ab21]" />
              {t.activeNow}
            </span>
          </div>

          {/* Interests */}
          <p className="mb-2 text-[11px] font-bold tracking-wide text-[rgba(12,13,16,0.4)] uppercase">
            {t.interests}
          </p>
          <div className="flex flex-wrap gap-2 pb-4">
            {COMPANION.interests.map((i) => (
              <span
                key={i}
                className="rounded-full bg-[#ede7ff] px-3 py-1.5 text-[13px] font-medium text-[#6d17ce]"
              >
                {i}
              </span>
            ))}
          </div>

          {/* Friendship stat */}
          <div className="mb-4 rounded-2xl bg-[#f5f5f5] px-4 py-3 text-[13px] font-medium text-[rgba(12,13,16,0.7)]">
            {messageCount} messages · friends since today
          </div>

          <hr className="mb-4 border-0 border-t border-[rgba(12,13,16,0.08)]" />

          {/* Language selector */}
          <p className="mb-2 text-[11px] font-bold tracking-wide text-[rgba(12,13,16,0.4)] uppercase">
            {t.language}
          </p>
          <div className="flex flex-col gap-2 pb-4">
            {LANGUAGE_OPTIONS.map((opt) => {
              const active = opt.value === uiLanguage;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onSelectLanguage(opt.value)}
                  className={`flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 text-left transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] outline-none focus-visible:ring-2 focus-visible:ring-[#8B2FE8] active:scale-[0.99] ${
                    active
                      ? "border-[#6d17ce] bg-[#f6f3ff]"
                      : "border-[rgba(12,13,16,0.1)] bg-white"
                  }`}
                >
                  <span
                    className={`text-[15px] ${active ? "font-bold text-[#6d17ce]" : "text-[#0c0d10]"}`}
                  >
                    {opt.label}
                  </span>
                  {active && <CheckIcon className="size-5 text-[#6d17ce]" />}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onClearChat}
            className="mb-3 w-full cursor-pointer rounded-full bg-[#eeeeef] py-3 text-[14px] font-bold text-[#0c0d10] transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] outline-none focus-visible:ring-2 focus-visible:ring-[#8B2FE8] active:scale-[0.98]"
          >
            {t.clearChat}
          </button>

          <p className="pb-2 text-center text-[12px] text-[rgba(12,13,16,0.4)]">
            {COMPANION.name} {COMPANION.version}
          </p>
        </div>
      </div>
    </div>
  );
}
