"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { PauseIcon, PlayIcon } from "../icons";
import { alreadySpoken, speak, stopSpeaking } from "../tts";

const BARS = 26;

// Deterministic bar heights so a given message always looks the same.
function barHeights(seed: string): number[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const out: number[] = [];
  for (let i = 0; i < BARS; i++) {
    h = (Math.imul(h, 1103515245) + 12345) >>> 0;
    out.push(7 + (h % 15));
  }
  return out;
}

function fmt(sec: number) {
  const s = Math.max(0, Math.round(sec));
  return `0:${s.toString().padStart(2, "0")}`;
}

type Props = {
  id: string;
  isCompanion: boolean;
  text: string;
  durationSec?: number;
  voiceLang?: "hi" | "en";
  autoPlay?: boolean;
};

// A voice-note bubble: play/pause + waveform + duration, with the transcript
// shown beneath. Companion messages speak aloud (TTS) and auto-play on arrival.
export function VoiceMessage({
  id,
  isCompanion,
  text,
  durationSec = 4,
  voiceLang = "en",
  autoPlay = false,
}: Props) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1
  const bars = useMemo(() => barHeights(id + text), [id, text]);
  const rafRef = useRef<number | null>(null);
  const startedRef = useRef(false);

  const stopProgress = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, []);

  const runProgress = useCallback(
    (onDone?: () => void) => {
      const start = performance.now();
      const dur = durationSec * 1000;
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / dur);
        setProgress(p);
        if (p >= 1) {
          stopProgress();
          onDone?.();
          return;
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    },
    [durationSec, stopProgress],
  );

  const stop = useCallback(() => {
    stopProgress();
    if (isCompanion) stopSpeaking();
    setPlaying(false);
  }, [isCompanion, stopProgress]);

  const play = useCallback(() => {
    setProgress(0);
    setPlaying(true);
    if (isCompanion) {
      runProgress();
      void speak(id, text, voiceLang, {
        onEnd: () => {
          stopProgress();
          setProgress(1);
          setPlaying(false);
        },
      });
    } else {
      // User voice note: visual replay only (the recording isn't retained).
      runProgress(() => setPlaying(false));
    }
  }, [id, isCompanion, runProgress, stopProgress, text, voiceLang]);

  // Companion auto-plays once on arrival (deferred so it's not a synchronous
  // setState inside the effect body).
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    let to: ReturnType<typeof setTimeout> | undefined;
    if (autoPlay && isCompanion && !alreadySpoken(id)) {
      to = setTimeout(() => play(), 150);
    }
    return () => {
      if (to) clearTimeout(to);
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const accent = isCompanion ? "bg-[#6d17ce]" : "bg-white";
  const dim = isCompanion ? "bg-[rgba(12,13,16,0.18)]" : "bg-white/40";
  const transcriptCls = isCompanion ? "text-[rgba(12,13,16,0.6)]" : "text-white/80";
  const playBtnCls = isCompanion ? "bg-[#6d17ce] text-white" : "bg-white/20 text-white";
  const playHead = Math.round(progress * BARS);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={playing ? stop : play}
          aria-label={playing ? "Pause" : "Play"}
          className={`flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] outline-none active:scale-[0.94] ${playBtnCls}`}
        >
          {playing ? <PauseIcon className="size-[18px]" /> : <PlayIcon className="size-[18px]" />}
        </button>

        <div className="flex h-7 flex-1 items-center gap-[2px]" aria-hidden="true">
          {bars.map((h, i) => {
            const played = i <= playHead && progress > 0;
            const atHead = playing && i === playHead;
            return (
              <span
                key={i}
                className={`w-[3px] rounded-full ${played ? accent : dim} ${atHead ? "animate-pulse" : ""}`}
                style={{ height: `${h}px` }}
              />
            );
          })}
        </div>

        <span
          className={`shrink-0 text-[12px] tabular-nums ${isCompanion ? "text-[rgba(12,13,16,0.5)]" : "text-white/70"}`}
        >
          {fmt(durationSec)}
        </span>
      </div>

      <p className={`text-[13px] leading-snug ${transcriptCls}`}>{text}</p>
    </div>
  );
}
