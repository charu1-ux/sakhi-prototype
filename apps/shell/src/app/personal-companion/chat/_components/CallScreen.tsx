"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { CompanionAvatar } from "./CompanionAvatar";
import { MuteIcon, MuteOffIcon, PhoneEndIcon } from "../icons";
import {
  CALL_GREETING,
  COMPANION,
  STUB_TRANSCRIPTIONS,
  UI,
  generateCallReply,
  type UiLanguage,
} from "../companion-data";

type Props = {
  uiLanguage: UiLanguage;
  onEnd: (durationLabel: string) => void;
};

type Phase = "connecting" | "speaking" | "listening";

// Module-level guard — prevents a second concurrent loop under React StrictMode.
let callActive = false;

function fmt(totalSec: number) {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function CallScreen({ uiLanguage, onEnd }: Props) {
  const t = UI[uiLanguage];
  const [phase, setPhase] = useState<Phase>("connecting");
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [caption, setCaption] = useState<{ who: "companion" | "user"; text: string } | null>(null);
  const [amp, setAmp] = useState(0); // 0..1 drives the rings

  const endedRef = useRef(false);
  const mutedRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const secTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const secondsRef = useRef(0);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  const sleep = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));

  const stopAudio = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
    void ctxRef.current?.close().catch(() => {});
    streamRef.current = null;
    ctxRef.current = null;
  }, []);

  const endCall = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    callActive = false;
    stopAudio();
    if (secTimerRef.current) clearInterval(secTimerRef.current);
    const label = `${t.callEnded} · ${fmt(secondsRef.current)}`;
    onEnd(label);
  }, [onEnd, stopAudio, t.callEnded]);

  // Synthetic "speaking" amplitude animation.
  const animateSpeaking = useCallback((durationMs: number) => {
    return new Promise<void>((resolve) => {
      const start = performance.now();
      const loop = (now: number) => {
        if (endedRef.current) return resolve();
        const elapsed = now - start;
        if (elapsed >= durationMs) {
          setAmp(0);
          return resolve();
        }
        // layered sines → lively but smooth
        const a = 0.45 + 0.35 * Math.abs(Math.sin(elapsed / 140)) + 0.18 * Math.sin(elapsed / 47);
        setAmp(Math.min(1, Math.max(0, a)));
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    });
  }, []);

  // Listen via mic RMS (drives rings + VAD). Resolves after ~0.9s silence post-speech,
  // or a hard timeout. Degrades to a timed wait if the mic is unavailable.
  const listenTurn = useCallback(() => {
    return new Promise<void>((resolve) => {
      let analyser: AnalyserNode | null = null;
      let data: Uint8Array<ArrayBuffer> | null = null;
      let spoke = false;
      let silence = 0;
      let last = performance.now();
      const hardStop = performance.now() + 9000;

      const finish = () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        setAmp(0);
        resolve();
      };

      const loop = (now: number) => {
        if (endedRef.current) return resolve();
        const dt = now - last;
        last = now;
        if (analyser && data && !mutedRef.current) {
          analyser.getByteTimeDomainData(data);
          let sum = 0;
          for (let i = 0; i < data.length; i++) {
            const v = (data[i] - 128) / 128;
            sum += v * v;
          }
          const rms = Math.sqrt(sum / data.length);
          setAmp(Math.min(1, rms * 4));
          if (rms > 0.06) {
            spoke = true;
            silence = 0;
          } else if (spoke) {
            silence += dt;
          }
          if (spoke && silence > 900) return finish();
        } else {
          setAmp(0);
        }
        if (now > hardStop) return finish();
        rafRef.current = requestAnimationFrame(loop);
      };

      (async () => {
        try {
          if (!streamRef.current) {
            streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
          }
          const AudioCtx =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          if (!ctxRef.current) ctxRef.current = new AudioCtx();
          const src = ctxRef.current.createMediaStreamSource(streamRef.current);
          analyser = ctxRef.current.createAnalyser();
          analyser.fftSize = 512;
          src.connect(analyser);
          data = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));
        } catch {
          // No mic: fall back to a scripted pause.
          setTimeout(resolve, 3200);
          return;
        }
        rafRef.current = requestAnimationFrame(loop);
      })();
    });
  }, []);

  useEffect(() => {
    if (callActive) return; // StrictMode / double-mount guard
    callActive = true;
    endedRef.current = false;

    (async () => {
      await sleep(1200); // connecting (<2s)
      if (endedRef.current) return;

      // Timer starts once connected.
      secTimerRef.current = setInterval(() => {
        secondsRef.current += 1;
        setSeconds(secondsRef.current);
      }, 1000);

      // Companion greets first.
      setPhase("speaking");
      setCaption({ who: "companion", text: CALL_GREETING[uiLanguage] });
      await animateSpeaking(2000);

      let turn = 0;
      while (!endedRef.current) {
        // Listen
        setPhase("listening");
        setCaption({ who: "user", text: "…" });
        await listenTurn();
        if (endedRef.current) break;

        // "STT" → stub transcription as the user caption
        const pool = STUB_TRANSCRIPTIONS[uiLanguage];
        const userText = pool[turn % pool.length];
        setCaption({ who: "user", text: `"${userText}"` });
        await sleep(500);
        if (endedRef.current) break;

        // Companion reply (short call-turn) → "TTS" caption + speaking rings
        const reply = generateCallReply(userText, uiLanguage);
        setPhase("speaking");
        setCaption({ who: "companion", text: reply });
        await animateSpeaking(Math.min(4200, 1400 + reply.length * 45));
        turn++;
      }
    })();

    return () => {
      callActive = false;
      endedRef.current = true;
      stopAudio();
      if (secTimerRef.current) clearInterval(secTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ringScale = 1 + amp * 0.55;
  const ringScale2 = 1 + amp * 0.9;
  const statusText =
    phase === "connecting"
      ? t.connecting
      : phase === "speaking"
        ? `${COMPANION.name} ${t.speaking}`
        : t.listening;

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-between bg-zinc-950 px-6 pt-[max(env(safe-area-inset-top),40px)] pb-[max(env(safe-area-inset-bottom),32px)] text-white">
      {/* Top: name + timer */}
      <div className="flex flex-col items-center gap-1 pt-6">
        <span className="text-[20px] font-bold">{COMPANION.name}</span>
        <span className="text-[14px] text-white/55 tabular-nums">
          {phase === "connecting" ? t.connecting : fmt(seconds)}
        </span>
      </div>

      {/* Centre: avatar with two concentric amplitude rings */}
      <div className="relative flex items-center justify-center">
        <span
          className="absolute rounded-full border border-[#8B2FE8]/30"
          style={{
            width: 200,
            height: 200,
            transform: `scale(${ringScale2})`,
            transition: "transform 90ms linear",
            opacity: 0.5 - amp * 0.2,
          }}
        />
        <span
          className="absolute rounded-full"
          style={{
            width: 160,
            height: 160,
            transform: `scale(${ringScale})`,
            transition: "transform 90ms linear",
            background: "radial-gradient(circle, rgba(109,23,206,0.45) 0%, rgba(109,23,206,0) 70%)",
          }}
        />
        <span
          className={phase === "connecting" ? "animate-pulse" : ""}
          style={{ filter: "drop-shadow(0 0 24px rgba(109,23,206,0.5))" }}
        >
          <CompanionAvatar size={120} />
        </span>
      </div>

      {/* Live caption */}
      <div className="flex min-h-[88px] w-full flex-col items-center justify-end gap-1">
        <span className="text-[13px] font-medium tracking-wide text-white/45">{statusText}</span>
        {caption && caption.text !== "…" && (
          <p
            className={`max-w-[300px] text-center text-[16px] leading-snug ${
              caption.who === "user" ? "text-white/70 italic" : "text-white"
            }`}
          >
            {caption.text}
          </p>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-10 pt-2">
        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? "Unmute" : "Mute"}
          className="flex size-14 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] outline-none focus-visible:ring-2 focus-visible:ring-white/60 active:scale-[0.95]"
        >
          {muted ? <MuteOffIcon className="size-6" /> : <MuteIcon className="size-6" />}
        </button>
        <button
          type="button"
          onClick={endCall}
          aria-label="End call"
          className="flex size-16 cursor-pointer items-center justify-center rounded-full bg-[#fa2f40] text-white transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] outline-none focus-visible:ring-2 focus-visible:ring-white/60 active:scale-[0.95]"
        >
          <PhoneEndIcon className="size-7" />
        </button>
      </div>
    </div>
  );
}
