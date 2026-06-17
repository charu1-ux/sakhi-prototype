"use client";

import { type FormEvent, useRef, useState } from "react";

import { MicIcon, SendIcon, VoiceWaveIcon } from "../../chat/icons";
import { PaperclipIcon } from "../saathi-icons";

// Bottom composer dock. Pill input + Send when text present. When empty it shows
// either a plain mic (default) or, in `voiceFirst` mode, an animated "Speak"
// pill (mirroring Dil Ki Baat) to lead with voice. Reused across screens.
type Props = {
  placeholder?: string;
  // Called with the typed text on send.
  onSubmit: (text: string) => void;
  // Voice-first: show the animated "Speak" pill instead of a mic circle.
  voiceFirst?: boolean;
  speakLabel?: string;
  // Tapped Speak/mic while empty. Defaults to focusing the input.
  onVoice?: () => void;
  // When set, a leading "+" button appears to attach a doc/photo (opens a sheet).
  onAttach?: () => void;
  attachLabel?: string;
};

export function SaathiComposer({
  placeholder = "Speak or type…",
  onSubmit,
  voiceFirst = false,
  speakLabel = "Speak",
  onVoice,
  onAttach,
  attachLabel = "Add",
}: Props) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const hasText = value.trim().length > 0;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (hasText) {
      onSubmit(value.trim());
      setValue("");
    }
  };

  return (
    <form
      onSubmit={submit}
      className="bg-surface flex shrink-0 items-center gap-2 border-t border-[rgba(12,13,16,0.08)] px-3 pt-2.5"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 10px)" }}
    >
      {onAttach && (
        <button
          type="button"
          onClick={onAttach}
          aria-label={attachLabel}
          className="bg-primary-20 text-primary-50 focus-visible:ring-primary-60 flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] outline-none hover:scale-[1.05] focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.95]"
        >
          <PaperclipIcon className="size-5" />
        </button>
      )}

      <div className="bg-surface-ghost flex flex-1 items-center rounded-full border border-[rgba(12,13,16,0.12)] px-4">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          enterKeyHint="send"
          className="w-full bg-transparent py-2.5 text-[15px] text-[#0c0d10] outline-none placeholder:text-[rgba(12,13,16,0.38)]"
        />
      </div>

      {hasText ? (
        <button
          type="submit"
          aria-label="Send"
          className="bg-primary-50 focus-visible:ring-primary-60 flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-white transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.97]"
        >
          <SendIcon className="size-5" />
        </button>
      ) : voiceFirst ? (
        // Voice-first "Speak" pill with the animated equaliser (Dil Ki Baat style).
        <button
          type="button"
          onClick={onVoice ?? (() => inputRef.current?.focus())}
          aria-label={speakLabel}
          className="bg-primary-50 focus-visible:ring-primary-60 flex h-11 shrink-0 cursor-pointer items-center gap-1.5 rounded-full pr-4 pl-3.5 text-white transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.97]"
        >
          <VoiceWaveIcon className="size-[18px]" />
          <span className="text-[14px] font-bold">{speakLabel}</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => onSubmit("")}
          aria-label={speakLabel}
          className="bg-primary-50 focus-visible:ring-primary-60 flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-white transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.97]"
        >
          <MicIcon className="size-5" />
        </button>
      )}
    </form>
  );
}
