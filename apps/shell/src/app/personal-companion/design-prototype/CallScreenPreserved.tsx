"use client";

/**
 * PRESERVED SNAPSHOT — Personal Companion "Dil Ki Baat" call screen.
 *
 * This is a faithful copy of the call screen as it stands before the redesign
 * (2026-06). It is intentionally NOT imported by the live page — it exists so
 * the current design can be referenced or restored later. Drop it back into
 * `page.tsx` (or import + render it) to bring this version back:
 *
 *   <CallScreenPreserved open={callActive} onEnd={endCall} />
 */

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import { MuteIcon, MuteOffIcon, PhoneEndIcon, SpeakerIcon, VoiceWaveIcon } from "../chat/icons";

const AVATAR = "/assets/personal-companion/avatar-welcome.mp4";
const POSTER = "/assets/personal-companion/avatar.png";

// mm:ss for the active-call timer.
function formatCall(total: number) {
  const m = Math.floor(total / 60)
    .toString()
    .padStart(2, "0");
  const s = (total % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function CallScreenPreserved({ open, onEnd }: { open: boolean; onEnd: () => void }) {
  const [callSeconds, setCallSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(false);

  // Reset + tick the call timer for the lifetime of the call.
  useEffect(() => {
    if (!open) return;
    setCallSeconds(0);
    setMuted(false);
    setSpeaker(false);
    const id = window.setInterval(() => setCallSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="call"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 z-50 flex h-full flex-col overflow-hidden bg-white"
        >
          {/* top — name + running timer */}
          <div
            className="relative z-10 flex flex-col items-center gap-1"
            style={{ paddingTop: "calc(env(safe-area-inset-top,0px) + 30px)" }}
          >
            <p className="font-jio text-[18px] font-bold text-[#0c0d10]">Dil Ki Baat</p>
            <p className="text-body-s font-jio text-[rgba(12,13,16,0.45)] tabular-nums">
              {formatCall(callSeconds)}
            </p>
          </div>

          {/* centre — GIF inside a breathing border ring */}
          <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center gap-8">
            <div
              className="relative flex items-center justify-center"
              style={{ width: 240, height: 240 }}
            >
              <motion.span
                aria-hidden
                className="absolute rounded-full"
                style={{ width: 200, height: 200, border: "1px solid rgba(12,13,16,0.14)" }}
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 3.2, ease: "easeInOut", repeat: Infinity }}
              />
              <span className="relative inline-flex" style={{ width: 160, height: 160 }}>
                <video
                  src={AVATAR}
                  poster={POSTER}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  className="size-full rounded-full object-cover"
                  aria-label="Dil Ki Baat"
                />
              </span>
            </div>

            <div className="flex flex-col items-center gap-2.5">
              <VoiceWaveIcon className="size-6 text-[rgba(12,13,16,0.32)]" />
              <p className="text-body-m font-jio text-[rgba(12,13,16,0.45)]">
                Dil Ki Baat is listening
              </p>
            </div>
          </div>

          {/* bottom — Mute · Hang up (red, larger) · Speaker */}
          <div
            className="relative z-10 flex items-center justify-center gap-7"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom,0px) + 34px)" }}
          >
            <button
              type="button"
              aria-label={muted ? "Unmute" : "Mute"}
              onClick={() => setMuted((m) => !m)}
              className="focus-visible:ring-primary-60 flex size-14 items-center justify-center rounded-full border border-[rgba(12,13,16,0.12)] bg-white text-[#0c0d10] transition-transform duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.95]"
            >
              {muted ? <MuteOffIcon className="size-6" /> : <MuteIcon className="size-6" />}
            </button>

            <button
              type="button"
              aria-label="End call"
              onClick={onEnd}
              className="flex size-[68px] items-center justify-center rounded-full bg-[#FA2F40] text-white transition-transform duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FA2F40] focus-visible:ring-offset-2 active:scale-[0.95]"
            >
              <PhoneEndIcon className="size-7" />
            </button>

            <button
              type="button"
              aria-label={speaker ? "Speaker off" : "Speaker on"}
              onClick={() => setSpeaker((s) => !s)}
              className={`focus-visible:ring-primary-60 flex size-14 items-center justify-center rounded-full border transition-transform duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.95] ${
                speaker
                  ? "bg-primary-30 text-primary-50 border-transparent"
                  : "border-[rgba(12,13,16,0.12)] bg-white text-[#0c0d10]"
              }`}
            >
              <SpeakerIcon className="size-6" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
