// Lightweight text-to-speech for the voice-first chat, using the browser's
// built-in SpeechSynthesis (no key needed). In production this is where a
// Sarvam bulbul:v2 / ElevenLabs audio stream would play instead.

let voicesCache: SpeechSynthesisVoice[] = [];

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return resolve([]);
    const existing = window.speechSynthesis.getVoices();
    if (existing.length) {
      voicesCache = existing;
      return resolve(existing);
    }
    const handler = () => {
      voicesCache = window.speechSynthesis.getVoices();
      resolve(voicesCache);
    };
    window.speechSynthesis.onvoiceschanged = handler;
    // Fallback in case the event never fires.
    setTimeout(() => resolve(window.speechSynthesis.getVoices()), 600);
  });
}

// Guard so React StrictMode double-mounts don't speak the same bubble twice.
const spokenIds = new Set<string>();

export function alreadySpoken(id: string): boolean {
  return spokenIds.has(id);
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Speak `text` in the given voice family. Resolves (and calls onEnd) when done
 * or if speech is unavailable, so callers can always sequence UI off it.
 */
export async function speak(
  id: string,
  text: string,
  lang: "hi" | "en",
  opts?: { onEnd?: () => void; volume?: number },
): Promise<void> {
  spokenIds.add(id);
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    opts?.onEnd?.();
    return;
  }
  window.speechSynthesis.cancel();
  const voices = voicesCache.length ? voicesCache : await loadVoices();
  const prefix = lang === "hi" ? "hi" : "en";
  const voice =
    voices.find((v) => v.lang?.toLowerCase().startsWith(prefix)) ??
    voices.find((v) => v.lang?.toLowerCase().startsWith("en")) ??
    null;

  const u = new SpeechSynthesisUtterance(text);
  if (voice) u.voice = voice;
  u.lang = voice?.lang ?? (lang === "hi" ? "hi-IN" : "en-IN");
  u.rate = 0.97;
  u.pitch = 1.02;
  if (typeof opts?.volume === "number") u.volume = Math.max(0, Math.min(1, opts.volume));
  u.onend = () => opts?.onEnd?.();
  u.onerror = () => opts?.onEnd?.();
  window.speechSynthesis.speak(u);
}
