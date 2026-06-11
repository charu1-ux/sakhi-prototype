"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { MicIcon } from "../icons";
import { STUB_TRANSCRIPTIONS, UI, type UiLanguage } from "../companion-data";

type Props = {
  uiLanguage: UiLanguage;
  onTranscribed: (text: string) => void;
  onCancel: () => void;
};

type Phase = "recording" | "transcribing" | "denied";

const BAR_COUNT = 28;

// Voice-note capture. Uses a real mic + RMS for the live waveform and VAD
// auto-stop; STT itself is stubbed (no key in this prototype) and resolves to a
// canned transcription. Falls back gracefully if mic permission is denied.
export function VoiceNoteMode({ uiLanguage, onTranscribed, onCancel }: Props) {
  const t = UI[uiLanguage];
  const [phase, setPhase] = useState<Phase>("recording");
  const [levels, setLevels] = useState<number[]>(() => Array(BAR_COUNT).fill(6));

  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const silenceMsRef = useRef(0);
  const spokeRef = useRef(false);
  const lastTsRef = useRef(0);
  const stoppedRef = useRef(false);

  const cleanup = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
    void ctxRef.current?.close().catch(() => {});
    streamRef.current = null;
    ctxRef.current = null;
  }, []);

  const finishToTranscribe = useCallback(() => {
    if (stoppedRef.current) return;
    stoppedRef.current = true;
    cleanup();
    setPhase("transcribing");
    const pool = STUB_TRANSCRIPTIONS[uiLanguage];
    const text = pool[Math.floor(Math.random() * pool.length)];
    setTimeout(() => onTranscribed(text), 1200);
  }, [cleanup, onTranscribed, uiLanguage]);

  useEffect(() => {
    let cancelled = false;

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
        lastTsRef.current = performance.now();

        const tick = (ts: number) => {
          analyser.getByteTimeDomainData(data);
          let sum = 0;
          for (let i = 0; i < data.length; i++) {
            const v = (data[i] - 128) / 128;
            sum += v * v;
          }
          const rms = Math.sqrt(sum / data.length); // ~0..1
          const dt = ts - lastTsRef.current;
          lastTsRef.current = ts;

          if (rms > 0.06) {
            spokeRef.current = true;
            silenceMsRef.current = 0;
          } else if (spokeRef.current) {
            silenceMsRef.current += dt;
          }

          setLevels((prev) => {
            const next = prev.slice(1);
            next.push(Math.max(6, Math.min(40, rms * 220)));
            return next;
          });

          // VAD: auto-stop after ~0.8s of silence once the user has spoken.
          if (spokeRef.current && silenceMsRef.current > 800) {
            finishToTranscribe();
            return;
          }
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      } catch {
        if (!cancelled) setPhase("denied");
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
      className="flex shrink-0 flex-col gap-3 border-t border-[rgba(12,13,16,0.06)] bg-white px-4 pt-4"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 14px)" }}
    >
      {phase === "denied" ? (
        <div className="flex flex-col gap-3">
          <div className="rounded-xl bg-[#fef0e6] px-4 py-3 text-[13px] font-medium text-[#b14a00]">
            {t.micDenied}
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="self-center text-[14px] font-bold text-[#6d17ce] underline-offset-2 outline-none focus-visible:underline"
          >
            {t.typeInstead}
          </button>
        </div>
      ) : phase === "transcribing" ? (
        <div className="flex flex-col items-center gap-3 py-2">
          <div
            className="size-7 animate-spin rounded-full border-[3px] border-[#ede7ff] border-t-[#6d17ce]"
            aria-hidden="true"
          />
          <span className="text-[14px] font-medium text-[rgba(12,13,16,0.65)]">
            {t.transcribing}
          </span>
        </div>
      ) : (
        <>
          <div className="flex h-12 items-center justify-center gap-[3px]" aria-hidden="true">
            {levels.map((h, i) => (
              <span
                key={i}
                className="w-1 rounded-full bg-[#6d17ce] transition-[height] duration-75"
                style={{ height: `${h}px`, opacity: 0.4 + (i / BAR_COUNT) * 0.6 }}
              />
            ))}
          </div>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onCancel}
              className="text-[14px] font-bold text-[#6d17ce] outline-none focus-visible:underline"
            >
              {t.typeInstead}
            </button>
            <button
              type="button"
              onClick={finishToTranscribe}
              aria-label={t.listening}
              className="flex items-center gap-2 rounded-full bg-[#6d17ce] px-4 py-2.5 text-white transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] outline-none focus-visible:ring-2 focus-visible:ring-[#8B2FE8] focus-visible:ring-offset-2 active:scale-[0.97]"
            >
              <MicIcon className="size-[18px]" />
              <span className="text-[13px] font-bold">{t.listening}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
