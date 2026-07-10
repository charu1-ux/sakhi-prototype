/**
 * Sakhi voice input (STT) — Stage 1.
 *
 * A thin, feature-detected wrapper over the Web Speech API SpeechRecognition.
 * Primary locale is Hindi (hi-IN); we fall back to en-IN when the UI is in
 * English. Tap/type input always stays available, so if this is unsupported
 * (e.g. Firefox, some in-app webviews) the caller simply hides the mic.
 *
 * NOTE for user testing: hi-IN recognition quality varies a lot by browser and
 * device. Chrome/Android is usually decent; iOS Safari and many low-end webviews
 * are unreliable. The caller surfaces a graceful fallback either way.
 */
import type { Lang } from "./tts";

// The Web Speech API is not in TS's lib DOM types on all targets, so we type
// the bits we use loosely rather than pulling in extra ambient declarations.
type RecognitionResultLike = { isFinal: boolean; 0: { transcript: string } };
type RecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<RecognitionResultLike>;
};
type RecognitionErrorLike = { error?: string };

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: RecognitionEventLike) => void) | null;
  onerror: ((e: RecognitionErrorLike) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
};

type WindowWithSpeech = Window & {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
};

function getCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as WindowWithSpeech;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function isRecognitionSupported(): boolean {
  return getCtor() !== null;
}

export type RecognitionCallbacks = {
  /** Fired as words come in — interim (grey) then final. */
  onTranscript: (text: string, isFinal: boolean) => void;
  onStart?: () => void;
  onEnd?: () => void;
  /** error code, e.g. "no-speech", "not-allowed", "network". */
  onError?: (code: string) => void;
};

export type RecognitionSession = { stop: () => void; abort: () => void };

/**
 * Start a one-shot listening session. Returns null if unsupported.
 * `continuous` is false — one utterance, then it ends, so the user can review
 * the transcript before it is submitted.
 */
export function startRecognition(lang: Lang, cb: RecognitionCallbacks): RecognitionSession | null {
  const Ctor = getCtor();
  if (!Ctor) return null;

  const rec = new Ctor();
  rec.lang = lang === "en" ? "en-IN" : "hi-IN";
  rec.continuous = false;
  rec.interimResults = true;
  rec.maxAlternatives = 1;

  rec.onstart = () => cb.onStart?.();
  rec.onresult = (e: RecognitionEventLike) => {
    let interim = "";
    let final = "";
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const res = e.results[i];
      if (res.isFinal) final += res[0].transcript;
      else interim += res[0].transcript;
    }
    if (final) cb.onTranscript(final.trim(), true);
    else if (interim) cb.onTranscript(interim.trim(), false);
  };
  rec.onerror = (e: RecognitionErrorLike) => cb.onError?.(e?.error ?? "unknown");
  rec.onend = () => cb.onEnd?.();

  try {
    rec.start();
  } catch {
    // start() throws if called while already running — treat as a no-op.
    return null;
  }

  return {
    stop: () => {
      try {
        rec.stop();
      } catch {
        /* ignore */
      }
    },
    abort: () => {
      try {
        rec.abort();
      } catch {
        /* ignore */
      }
    },
  };
}
