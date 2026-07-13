"use client";

/**
 * Voice target registry.
 *
 * A chat screen (Content Hub, Period Tracker, Mood Tracker) registers its own
 * `handleSubmit` here while it is mounted. When the user speaks on that screen,
 * the mic feeds the transcript straight into that screen's chat — i.e. voice
 * behaves exactly like typing into the on-screen input, so it stays IN the
 * current flow (proxy question, mood picker, etc.) instead of navigating away.
 *
 * The home landing screen registers nothing, so there the mic falls back to
 * intent routing (see intents.ts) — "next period" opens the tracker, etc.
 *
 * Single module instance in the client bundle, so VoiceLayer and the pages
 * share the same `target`.
 */
import { useEffect, useRef } from "react";

type VoiceTarget = (text: string) => void;

let target: VoiceTarget | null = null;

export function getVoiceTarget(): VoiceTarget | null {
  return target;
}

/**
 * One-shot flag: set by VoiceLayer right before it feeds a SPOKEN transcript to
 * the current screen, so the screen knows the query came by voice and should
 * speak Sakhi's answer back. `consumeVoiceQuery` reads and clears it, so a
 * subsequent typed query (which doesn't set it) is never spoken.
 */
let spokenQuery = false;

export function markVoiceQuery(): void {
  spokenQuery = true;
}

export function consumeVoiceQuery(): boolean {
  const was = spokenQuery;
  spokenQuery = false;
  return was;
}

/**
 * Register the current screen's text handler for the lifetime of the component.
 * Uses a ref so the latest handler is always called without re-registering on
 * every render.
 */
export function useVoiceTarget(onText: (text: string) => void): void {
  const ref = useRef(onText);
  // Keep the ref pointing at the latest handler (updated after each render).
  useEffect(() => {
    ref.current = onText;
  });
  useEffect(() => {
    const handler: VoiceTarget = (text) => ref.current(text);
    target = handler;
    return () => {
      // Only clear if we're still the active target (avoids a race where the
      // next screen has already registered during navigation).
      if (target === handler) target = null;
    };
  }, []);
}
