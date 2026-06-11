"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { CloseIcon, SendIcon } from "../icons";
import { STUB_TRANSCRIPTIONS, UI, type UiLanguage } from "../companion-data";

// Minimal typing for the Web Speech API (not in lib.dom by default).
type SRAlternative = { transcript: string };
type SRResult = { 0: SRAlternative; isFinal: boolean };
type SREvent = { resultIndex: number; results: ArrayLike<SRResult> };
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: SREvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

const BAR_COUNT = 30;

type Props = {
  uiLanguage: UiLanguage;
  onTranscript: (text: string) => void; // live partials → pending chat bubble
  onSend: (finalText: string) => void;
  onCancel: () => void;
};

// WhatsApp-style voice note, upgraded: a live transcript streams into the chat
// as the user speaks (Web Speech API). On send it posts the voice note; on
// cancel it backs out. Falls back to a canned transcript if STT is unavailable.
export function VoiceNoteRecorder({ uiLanguage, onTranscript, onSend, onCancel }: Props) {
  const t = UI[uiLanguage];
  const [levels, setLevels] = useState<number[]>(() => Array(BAR_COUNT).fill(5));

  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const recogRef = useRef<SpeechRecognitionLike | null>(null);
  const transcriptRef = useRef("");
  const finishedRef = useRef(false);

  const cleanup = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    try {
      recogRef.current?.stop();
    } catch {
      /* ignore */
    }
    recogRef.current = null;
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
    void ctxRef.current?.close().catch(() => {});
    streamRef.current = null;
    ctxRef.current = null;
  }, []);

  const handleSend = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    cleanup();
    const pool = STUB_TRANSCRIPTIONS[uiLanguage];
    const text = transcriptRef.current.trim() || pool[Math.floor(Math.random() * pool.length)];
    onSend(text);
  }, [cleanup, onSend, uiLanguage]);

  const handleCancel = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    cleanup();
    onCancel();
  }, [cleanup, onCancel]);

  useEffect(() => {
    let cancelled = false;

    // Live speech-to-text (if supported).
    const SR =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike })
        .SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike })
        .webkitSpeechRecognition;
    if (SR) {
      const recog = new SR();
      recog.lang = uiLanguage === "en" ? "en-IN" : "hi-IN";
      recog.continuous = true;
      recog.interimResults = true;
      recog.onresult = (e: SREvent) => {
        let text = "";
        for (let i = 0; i < e.results.length; i++) {
          text += e.results[i][0].transcript;
        }
        transcriptRef.current = text;
        onTranscript(text);
      };
      recog.onerror = () => {};
      recogRef.current = recog;
      try {
        recog.start();
      } catch {
        /* already started */
      }
    }

    // Mic RMS for the live waveform.
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) {
          stream.getTracks().forEach((tr) => tr.stop());
          return;
        }
        streamRef.current = stream;
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioCtx();
        ctxRef.current = ctx;
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        source.connect(analyser);
        const data = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));
        const tick = () => {
          analyser.getByteTimeDomainData(data);
          let sum = 0;
          for (let i = 0; i < data.length; i++) {
            const v = (data[i] - 128) / 128;
            sum += v * v;
          }
          const rms = Math.sqrt(sum / data.length);
          setLevels((prev) => {
            const next = prev.slice(1);
            next.push(Math.max(5, Math.min(36, rms * 200)));
            return next;
          });
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      } catch {
        /* no mic — waveform stays flat, stub transcript on send */
      }
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="flex shrink-0 items-center gap-3 border-t border-[rgba(12,13,16,0.06)] bg-white px-3 pt-2.5"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 10px)" }}
    >
      <button
        type="button"
        onClick={handleCancel}
        aria-label={t.cancel}
        className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#f5f5f5] text-[#0c0d10] transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] outline-none focus-visible:ring-2 focus-visible:ring-[#8B2FE8] active:scale-[0.94]"
      >
        <CloseIcon className="size-5" />
      </button>

      <div className="flex h-11 flex-1 items-center gap-2.5 rounded-full bg-[#fafafa] px-4">
        <span className="size-2.5 shrink-0 animate-pulse rounded-full bg-[#fa2f40]" aria-hidden />
        <div className="flex h-6 flex-1 items-center gap-[2px] overflow-hidden" aria-hidden>
          {levels.map((h, i) => (
            <span
              key={i}
              className="w-[3px] shrink-0 rounded-full bg-[#6d17ce]"
              style={{ height: `${h}px`, opacity: 0.35 + (i / BAR_COUNT) * 0.65 }}
            />
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={handleSend}
        aria-label={t.send}
        className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#6d17ce] text-white transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] outline-none focus-visible:ring-2 focus-visible:ring-[#8B2FE8] focus-visible:ring-offset-2 active:scale-[0.97]"
      >
        <SendIcon className="size-5" />
      </button>
    </div>
  );
}
