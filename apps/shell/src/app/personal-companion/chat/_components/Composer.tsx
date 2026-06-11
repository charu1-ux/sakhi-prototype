"use client";

import { type FormEvent } from "react";

import { MicIcon, SendIcon } from "../icons";
import { UI, type UiLanguage } from "../companion-data";

type Props = {
  uiLanguage: UiLanguage;
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onStartVoice: () => void;
};

export function Composer({ uiLanguage, value, onChange, onSend, onStartVoice }: Props) {
  const t = UI[uiLanguage];
  const hasText = value.trim().length > 0;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (hasText) onSend();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex shrink-0 items-end gap-2 border-t border-[rgba(12,13,16,0.06)] bg-white px-3 pt-2.5"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 10px)" }}
    >
      <div className="flex flex-1 items-center rounded-full border border-[rgba(12,13,16,0.12)] bg-[#fafafa] px-4 py-1">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t.composerPlaceholder}
          aria-label={t.composerPlaceholder}
          enterKeyHint="send"
          className="w-full bg-transparent py-2 text-[15px] text-[#0c0d10] outline-none placeholder:text-[rgba(12,13,16,0.4)]"
        />
      </div>

      {hasText ? (
        <button
          type="submit"
          aria-label="Send"
          className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#6d17ce] text-white transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] outline-none focus-visible:ring-2 focus-visible:ring-[#8B2FE8] focus-visible:ring-offset-2 active:scale-[0.97]"
        >
          <SendIcon className="size-5" />
        </button>
      ) : (
        <button
          type="button"
          onClick={onStartVoice}
          aria-label={t.tapToTalk}
          className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#6d17ce] text-white transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] outline-none focus-visible:ring-2 focus-visible:ring-[#8B2FE8] focus-visible:ring-offset-2 active:scale-[0.97]"
        >
          <MicIcon className="size-5" />
        </button>
      )}
    </form>
  );
}
