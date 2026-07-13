/**
 * Sakhi voice output (TTS) — Stage 1.
 *
 * We use the browser SpeechSynthesis API with a Hindi locale for now, because
 * we do not yet have a production voice-actor recording. The `AUDIO_CLIPS` map
 * lets a real recording swap in later WITHOUT changing any trigger logic: fill
 * in a clip URL for a key and `playClip` plays the file instead of speaking.
 *
 * All spoken lines keep "aap" + female verb forms (सुन रही हूँ, समझ नहीं पाई).
 */
import { withBasePath } from "@/lib/base-path";

export type Lang = "hi" | "en";

/** A running playback we can stop (audio element OR speech synthesis). */
export type SpeechHandle = { stop: () => void };

/**
 * Pre-recorded clips, keyed by a stable id. Empty for now (we speak via TTS).
 * To swap in a real recording later, add its URL here — nothing else changes:
 *   home_walkthrough: { hi: withBasePath("/voice/home-walkthrough-hi.mp3") },
 */
const AUDIO_CLIPS: Record<string, Partial<Record<Lang, string>>> = {
  // Recorded female voice-over for the home walkthrough (Hindi). English has no
  // recording yet, so `en` falls back to TTS automatically.
  home_walkthrough: { hi: withBasePath("/voice/home-walkthrough-hi.mp3") },
};

export function isTtsSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/**
 * Voices load asynchronously in most browsers. Resolve once they are available
 * (or after a short timeout, so we never block forever).
 */
function ensureVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (!isTtsSupported()) return resolve([]);
    const existing = window.speechSynthesis.getVoices();
    if (existing.length) return resolve(existing);
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      resolve(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.addEventListener("voiceschanged", finish, { once: true });
    setTimeout(finish, 1200);
  });
}

// Sakhi is a woman, so we always want a female voice. The Web Speech API does
// not expose a gender field, so we match on known female voice names across the
// common engines (Google / Apple / Microsoft). MALE_NAMES lets us actively skip
// the default male voices (e.g. hi-IN "Hemant", en-IN "Rishi"/"Ravi") when no
// explicitly-female voice is present.
const FEMALE_NAMES =
  /(female|kalpana|lekha|swara|kanya|heera|veena|aditi|raveena|neerja|priya|google हिन्दी|google हिंदी|samantha|victoria|karen|moira|tessa|fiona|zira|susan|hazel)/i;
const MALE_NAMES = /(male|hemant|rishi|ravi|prabhat|madhur|ravindra)/i;

/**
 * Pick the best available voice for a locale, preferring a FEMALE voice.
 * Order: female + region (hi-IN) → female + language → any non-male + region →
 * region → language. Falls back gracefully so we always return something usable.
 */
function pickVoice(voices: SpeechSynthesisVoice[], lang: Lang): SpeechSynthesisVoice | undefined {
  const prefix = lang === "hi" ? "hi" : "en";
  const inRegion = (v: SpeechSynthesisVoice) => v.lang?.toLowerCase().startsWith(prefix + "-in");
  const inLang = (v: SpeechSynthesisVoice) => v.lang?.toLowerCase().startsWith(prefix);
  const isFemale = (v: SpeechSynthesisVoice) => FEMALE_NAMES.test(v.name);
  const notMale = (v: SpeechSynthesisVoice) => !MALE_NAMES.test(v.name);
  return (
    voices.find((v) => inRegion(v) && isFemale(v)) ||
    voices.find((v) => inLang(v) && isFemale(v)) ||
    voices.find((v) => inRegion(v) && notMale(v)) ||
    voices.find((v) => inRegion(v)) ||
    voices.find((v) => inLang(v)) ||
    undefined
  );
}

type SpeakOpts = { lang: Lang; onStart?: () => void; onEnd?: () => void; onError?: () => void };

/** Speak a string via SpeechSynthesis. Returns a handle to stop mid-way. */
export function speak(text: string, opts: SpeakOpts): SpeechHandle {
  if (!isTtsSupported() || !text.trim()) {
    // Nothing to play — still fire onEnd so callers can advance their UI state.
    opts.onEnd?.();
    return { stop: () => {} };
  }
  const synth = window.speechSynthesis;
  // Cancel anything already queued so lines never overlap.
  synth.cancel();
  let stopped = false;

  void ensureVoices().then((voices) => {
    if (stopped) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = opts.lang === "hi" ? "hi-IN" : "en-IN";
    const voice = pickVoice(voices, opts.lang);
    if (voice) utter.voice = voice;
    utter.rate = 0.98;
    utter.pitch = 1.0;
    utter.onstart = () => opts.onStart?.();
    utter.onend = () => opts.onEnd?.();
    utter.onerror = () => opts.onError?.();
    synth.speak(utter);
  });

  return {
    stop: () => {
      stopped = true;
      if (isTtsSupported()) window.speechSynthesis.cancel();
    },
  };
}

/**
 * Play a named clip if a recording exists for the id+lang, otherwise speak the
 * provided text via TTS. This is the single entry point triggers should use, so
 * that dropping in a real recording never touches the trigger code.
 */
export function playClip(id: string, texts: Record<Lang, string>, opts: SpeakOpts): SpeechHandle {
  const url = AUDIO_CLIPS[id]?.[opts.lang];
  if (url && typeof Audio !== "undefined") {
    const audio = new Audio(url);
    audio.addEventListener("play", () => opts.onStart?.());
    audio.addEventListener("ended", () => opts.onEnd?.());
    audio.addEventListener("error", () => opts.onError?.());
    void audio.play().catch(() => opts.onError?.());
    return {
      stop: () => {
        audio.pause();
        audio.currentTime = 0;
      },
    };
  }
  return speak(texts[opts.lang], opts);
}

/** Stop any Sakhi speech immediately (used before navigation / on mute). */
export function stopSpeech(): void {
  if (isTtsSupported()) window.speechSynthesis.cancel();
}
