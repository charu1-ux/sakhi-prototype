"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { CompanionAvatar } from "./CompanionAvatar";
import {
  ChevronDownIcon,
  EarpieceIcon,
  MicIcon,
  MuteOffIcon,
  PhoneEndIcon,
  SpeakerIcon,
} from "../icons";
import {
  CALL_GREETING,
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
  onEnd: (durationLabel: string) => void;
};

type Phase = "connecting" | "listening" | "thinking" | "speaking";

// Module-level guard against a double loop under React StrictMode.
let callActive = false;

function fmt(totalSec: number) {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// Immersive companion call — avatar-forward (JBIQ light), captioned, hands-free.
// In-call controls: Mute/unmute, Speaker/Earpiece, Cut call.
export function CallScreen({ uiLanguage, onEnd }: Props) {
  const t = UI[uiLanguage];
  const [phase, setPhase] = useState<Phase>("connecting");
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(true);
  const [amp, setAmp] = useState(0);
  const [caption, setCaption] = useState<{ who: "user" | "companion"; text: string } | null>(null);

  const endedRef = useRef(false);
  const mutedRef = useRef(false);
  const speakerRef = useRef(true);
  const secondsRef = useRef(0);
  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const secTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);
  useEffect(() => {
    speakerRef.current = speaker;
  }, [speaker]);

  const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

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
    stopSpeaking();
    stopAudio();
    if (secTimerRef.current) clearInterval(secTimerRef.current);
    onEnd(`${t.callEnded} · ${fmt(secondsRef.current)}`);
  }, [onEnd, stopAudio, t.callEnded]);

  // Listen via mic RMS (drives aura + VAD). Idles while muted; degrades to a
  // timed wait when the mic is unavailable.
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
        if (endedRef.current) return finish();
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
          setTimeout(resolve, 3200);
          return;
        }
        rafRef.current = requestAnimationFrame(loop);
      })();
    });
  }, []);

  // Speak a line with a synthetic aura pulse; honours the speaker/earpiece volume.
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
      void speak(id, text, lang, { onEnd: finish, volume: speakerRef.current ? 1 : 0.4 });
      setTimeout(finish, Math.min(9000, 1800 + text.length * 55));
    });
  }, []);

  useEffect(() => {
    if (callActive) return;
    callActive = true;
    endedRef.current = false;

    (async () => {
      await sleep(1100); // connecting (<2s)
      if (endedRef.current) return;

      secTimerRef.current = setInterval(() => {
        secondsRef.current += 1;
        setSeconds(secondsRef.current);
      }, 1000);

      // Companion greets first.
      setPhase("speaking");
      setCaption({ who: "companion", text: CALL_GREETING[uiLanguage] });
      await speakTurn(`call_hi_${Date.now()}`, CALL_GREETING[uiLanguage], ttsLangFor(uiLanguage));

      let turn = 0;
      while (!endedRef.current) {
        setPhase("listening");
        await listenTurn();
        if (endedRef.current) break;
        if (mutedRef.current) {
          await sleep(250);
          continue;
        }

        setPhase("thinking");
        const pool = STUB_TRANSCRIPTIONS[uiLanguage];
        const userText = pool[turn % pool.length];
        setCaption({ who: "user", text: userText });
        await sleep(550);
        if (endedRef.current) break;

        const { bubbles, replyLanguage } = generateReply(userText, uiLanguage);
        const reply = bubbles.map((b) => b.text).join(" ");
        setPhase("speaking");
        setCaption({ who: "companion", text: reply });
        await speakTurn(`call_${Date.now()}_${turn}`, reply, ttsLangFor(replyLanguage));
        turn++;
      }
    })();

    return () => {
      callActive = false;
      endedRef.current = true;
      stopSpeaking();
      stopAudio();
      if (secTimerRef.current) clearInterval(secTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ring1 = 1 + amp * 0.5;
  const ring2 = 1 + amp * 0.85;
  const statusText =
    phase === "connecting"
      ? t.connecting
      : muted
        ? t.muted
        : phase === "listening"
          ? `${t.listening.split("…")[0]}…`
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

      {/* top bar */}
      <div
        className="relative z-10 flex shrink-0 items-center justify-between px-3"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 10px)" }}
      >
        <button
          type="button"
          onClick={endCall}
          aria-label="Minimise"
          className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-white/70 text-[#0c0d10] backdrop-blur transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] outline-none focus-visible:ring-2 focus-visible:ring-[#8B2FE8] active:scale-[0.92]"
        >
          <ChevronDownIcon className="size-5" />
        </button>
        <span className="text-[14px] font-bold text-[#0c0d10]">{COMPANION.name}</span>
        <span className="size-9" />
      </div>

      {/* avatar + status + timer */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center gap-6 px-6">
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
              animation: "dkb-call-float 6s ease-in-out infinite",
              filter: "drop-shadow(0 14px 32px rgba(109,23,206,0.25))",
            }}
          >
            <CompanionAvatar size={176} showActiveDot />
          </span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className="text-[14px] font-medium tracking-wide text-[rgba(12,13,16,0.55)]">
            {statusText}
          </span>
          <span className="text-[13px] text-[rgba(12,13,16,0.4)] tabular-nums">
            {phase === "connecting" ? "" : fmt(seconds)}
          </span>
        </div>
      </div>

      {/* live caption */}
      <div className="relative z-10 flex min-h-[84px] shrink-0 items-start justify-center px-8">
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

      {/* controls: mute · speaker · cut */}
      <div
        className="relative z-10 flex shrink-0 items-center justify-center gap-8 px-6 pt-2"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 24px)" }}
      >
        <ControlButton
          label={muted ? t.unmute : t.mute}
          active={muted}
          onClick={() => setMuted((m) => !m)}
        >
          {muted ? <MuteOffIcon className="size-6" /> : <MicIcon className="size-6" />}
        </ControlButton>

        <button
          type="button"
          onClick={endCall}
          aria-label={t.endCall}
          className="flex size-[68px] cursor-pointer items-center justify-center rounded-full bg-[#fa2f40] text-white shadow-[0_8px_24px_rgba(250,47,64,0.35)] transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] outline-none focus-visible:ring-2 focus-visible:ring-[#fa2f40] focus-visible:ring-offset-2 active:scale-[0.95]"
        >
          <PhoneEndIcon className="size-7" />
        </button>

        <ControlButton
          label={speaker ? t.speaker : t.earpiece}
          active={speaker}
          onClick={() => setSpeaker((s) => !s)}
        >
          {speaker ? <SpeakerIcon className="size-6" /> : <EarpieceIcon className="size-6" />}
        </ControlButton>
      </div>

      <style>{`
        @keyframes dkb-call-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
      `}</style>
    </div>
  );
}

function ControlButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        className={`flex size-14 cursor-pointer items-center justify-center rounded-full transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] outline-none focus-visible:ring-2 focus-visible:ring-[#8B2FE8] focus-visible:ring-offset-2 active:scale-[0.94] ${
          active
            ? "bg-[#6d17ce] text-white"
            : "bg-white text-[#0c0d10] shadow-[0_1px_3px_rgba(12,13,16,0.1)]"
        }`}
      >
        {children}
      </button>
      <span className="text-[11px] font-medium text-[rgba(12,13,16,0.55)]">{label}</span>
    </div>
  );
}
