"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { CompanionAvatar } from "./CompanionAvatar";
import { ChatIcon, ChevronDownIcon, MicIcon, MuteOffIcon } from "../icons";
import {
  COMPANION,
  STUB_TRANSCRIPTIONS,
  UI,
  generateReply,
  ttsLangFor,
  type UiLanguage,
} from "../companion-data";
import { speak, stopSpeaking } from "../tts";

type Props = {
  uiLanguage: UiLanguage;
  onExchange: (
    userText: string,
    companionText: string,
    voiceLang: "hi" | "en",
    companionId: string,
  ) => void;
  onClose: () => void;
};

type Phase = "listening" | "thinking" | "speaking";

// Module-level guard against a double loop under React StrictMode.
let voiceChatActive = false;

// Immersive, hands-free voice companion (Grok-style, JBIQ language). The avatar
// listens (aura reacts to the user's voice), then replies in voice that
// auto-plays with its transcript, looping until the user switches to text.
export function VoiceChatScreen({ uiLanguage, onExchange, onClose }: Props) {
  const t = UI[uiLanguage];
  const [phase, setPhase] = useState<Phase>("listening");
  const [paused, setPaused] = useState(false);
  const [amp, setAmp] = useState(0);
  const [caption, setCaption] = useState<{ who: "user" | "companion"; text: string } | null>(null);

  const endedRef = useRef(false);
  const pausedRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

  const stopAudio = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
    void ctxRef.current?.close().catch(() => {});
    streamRef.current = null;
    ctxRef.current = null;
  }, []);

  // Listen via mic RMS; resolves after ~0.9s of silence (post-speech) or a hard
  // timeout. Degrades to a timed wait when the mic is unavailable.
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
        if (endedRef.current || pausedRef.current) return finish();
        const dt = now - last;
        last = now;
        if (analyser && data) {
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
          setTimeout(resolve, 3200); // no mic → scripted pause
          return;
        }
        rafRef.current = requestAnimationFrame(loop);
      })();
    });
  }, []);

  // Speak the reply while animating the aura with a synthetic pulse.
  const speakTurn = useCallback((id: string, text: string, lang: "hi" | "en") => {
    return new Promise<void>((resolve) => {
      const start = performance.now();
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        setAmp(0);
        resolve();
      };
      const tick = (now: number) => {
        if (endedRef.current) return finish();
        const e = now - start;
        const a = 0.45 + 0.35 * Math.abs(Math.sin(e / 150)) + 0.18 * Math.sin(e / 49);
        setAmp(Math.min(1, Math.max(0, a)));
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
      void speak(id, text, lang, { onEnd: finish });
      // Safety: if speech is blocked and never ends, cap the turn.
      setTimeout(finish, Math.min(9000, 1800 + text.length * 55));
    });
  }, []);

  useEffect(() => {
    if (voiceChatActive) return;
    voiceChatActive = true;
    endedRef.current = false;

    (async () => {
      let turn = 0;
      while (!endedRef.current) {
        if (pausedRef.current) {
          await sleep(200);
          continue;
        }
        setPhase("listening");
        await listenTurn();
        if (endedRef.current || pausedRef.current) continue;

        setPhase("thinking");
        const pool = STUB_TRANSCRIPTIONS[uiLanguage];
        const userText = pool[turn % pool.length];
        setCaption({ who: "user", text: userText });
        await sleep(550);
        if (endedRef.current) break;

        const { bubbles, replyLanguage } = generateReply(userText, uiLanguage);
        const reply = bubbles.map((b) => b.text).join(" ");
        const lang = ttsLangFor(replyLanguage);
        const cid = `vc_${Date.now()}_${turn}`;
        setPhase("speaking");
        setCaption({ who: "companion", text: reply });
        await speakTurn(cid, reply, lang);
        onExchange(userText, reply, lang, cid);
        turn++;
      }
    })();

    return () => {
      voiceChatActive = false;
      endedRef.current = true;
      stopSpeaking();
      stopAudio();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => {
    endedRef.current = true;
    voiceChatActive = false;
    stopSpeaking();
    stopAudio();
    onClose();
  };

  const togglePause = () => {
    setPaused((p) => {
      const next = !p;
      if (next) stopSpeaking();
      return next;
    });
  };

  const ring1 = 1 + amp * 0.5;
  const ring2 = 1 + amp * 0.85;
  const listeningShort = `${t.listening.split("…")[0]}…`;
  const statusText = paused
    ? t.tapToTalk
    : phase === "listening"
      ? listeningShort
      : phase === "thinking"
        ? "…"
        : `${COMPANION.name} ${t.speaking}`;

  return (
    <div className="absolute inset-0 z-50 flex flex-col overflow-hidden">
      {/* warm JBIQ ambient backdrop (white-dominant, soft purple glow) */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: "radial-gradient(110% 70% at 50% 12%, #efe7ff 0%, #f6f3ff 38%, #ffffff 78%)",
        }}
      />

      {/* top bar — minimise to chat */}
      <div
        className="relative z-10 flex shrink-0 items-center justify-between px-3"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 10px)" }}
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label="Minimise"
          className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-white/70 text-[#0c0d10] backdrop-blur transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] outline-none focus-visible:ring-2 focus-visible:ring-[#8B2FE8] active:scale-[0.92]"
        >
          <ChevronDownIcon className="size-5" />
        </button>
        <span className="text-[14px] font-bold text-[#0c0d10]">{COMPANION.name}</span>
        <span className="size-9" />
      </div>

      {/* avatar + status */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center gap-7 px-6">
        <div
          className="relative flex items-center justify-center"
          style={{ width: 280, height: 280 }}
        >
          <span
            aria-hidden
            className="absolute rounded-full"
            style={{
              width: 260,
              height: 260,
              transform: `scale(${ring2})`,
              transition: "transform 90ms linear",
              background:
                "radial-gradient(circle, rgba(109,23,206,0.16) 0%, rgba(109,23,206,0) 70%)",
            }}
          />
          <span
            aria-hidden
            className="absolute rounded-full border border-[#8B2FE8]/25"
            style={{
              width: 210,
              height: 210,
              transform: `scale(${ring1})`,
              transition: "transform 90ms linear",
            }}
          />
          <span
            className="relative"
            style={{
              animation: "dkb-vc-float 6s ease-in-out infinite",
              filter: "drop-shadow(0 14px 32px rgba(109,23,206,0.25))",
            }}
          >
            <CompanionAvatar size={176} showActiveDot />
          </span>
        </div>

        <span className="text-[14px] font-medium tracking-wide text-[rgba(12,13,16,0.55)]">
          {statusText}
        </span>
      </div>

      {/* live caption */}
      <div className="relative z-10 flex min-h-[92px] shrink-0 items-start justify-center px-8">
        {caption && (
          <p
            className={`max-w-[330px] text-center text-[18px] leading-snug ${
              caption.who === "user"
                ? "text-[rgba(12,13,16,0.5)] italic"
                : "font-medium text-[#0c0d10]"
            }`}
          >
            {caption.who === "user" ? `“${caption.text}”` : caption.text}
          </p>
        )}
      </div>

      {/* controls */}
      <div
        className="relative z-10 flex shrink-0 items-center justify-center gap-5 px-6 pt-2"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 22px)" }}
      >
        <button
          type="button"
          onClick={togglePause}
          aria-label={paused ? "Resume" : "Pause mic"}
          className={`relative flex size-16 cursor-pointer items-center justify-center rounded-full text-white transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] outline-none focus-visible:ring-2 focus-visible:ring-[#8B2FE8] focus-visible:ring-offset-2 active:scale-[0.95] ${
            paused ? "bg-[rgba(12,13,16,0.35)]" : "bg-[#6d17ce]"
          }`}
        >
          {!paused && (
            <span
              aria-hidden
              className="absolute inset-0 rounded-full bg-[#6d17ce]/30"
              style={{ transform: `scale(${1 + amp * 0.6})`, transition: "transform 90ms linear" }}
            />
          )}
          <span className="relative">
            {paused ? <MuteOffIcon className="size-7" /> : <MicIcon className="size-7" />}
          </span>
        </button>

        <button
          type="button"
          onClick={handleClose}
          className="flex h-12 cursor-pointer items-center gap-2 rounded-full bg-white px-5 text-[14px] font-bold text-[#6d17ce] shadow-[0_1px_3px_rgba(12,13,16,0.08)] transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] outline-none focus-visible:ring-2 focus-visible:ring-[#8B2FE8] active:scale-[0.97]"
        >
          <ChatIcon className="size-[18px]" />
          Text
        </button>
      </div>

      <style>{`
        @keyframes dkb-vc-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
      `}</style>
    </div>
  );
}
