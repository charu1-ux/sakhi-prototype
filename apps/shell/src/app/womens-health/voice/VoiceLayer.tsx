"use client";

/**
 * Sakhi voice INPUT layer — mounted once in the Women's Health layout so the mic
 * lives on EVERY screen. Purely additive: tap / swipe / toggle stay exactly as
 * they were. Voice never replaces them, it sits on top.
 *
 * The spoken home walkthrough lives on the home screen itself (the Sakhi card in
 * page.tsx — tap Sakhi to hear her, in a female voice). This layer is only about
 * voice INPUT:
 *   1. Mic FAB — a floating button on every screen that starts listening.
 *   2. Listening sheet — a live "I'm listening" state with waveform + the
 *      transcript shown as it is captured, so the user confirms before sending.
 *
 * Spoken input is matched to existing actions (see intents.ts) and routed with
 * the normal router, so each destination runs its own unchanged flow (including
 * the "for me / for someone else" proxy question — voice never skips it).
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { useLang } from "../LangContext";
import { speak, stopSpeech, type Lang } from "./tts";
import { isRecognitionSupported, startRecognition, type RecognitionSession } from "./recognition";
import { matchIntent } from "./intents";
import { getVoiceTarget, markVoiceQuery } from "./voiceBus";

const ROUTES = {
  period: "/womens-health/period-tracker",
  mood: "/womens-health/mood-tracker",
  ask: "/womens-health/health-content",
};

// ─── Icons (inline SVG — no icon lib) ─────────────────────────────────────────
function MicIcon({ size = 26 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <line x1="12" y1="18" x2="12" y2="21" />
      <line x1="8" y1="21" x2="16" y2="21" />
    </svg>
  );
}

function CloseIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden
    >
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  );
}

// Animated waveform shown while actively listening.
function Waveform() {
  return (
    <div className="flex items-center gap-1.5" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className="rounded-full"
          style={{
            width: 5,
            height: 10 + ((i * 7) % 16),
            background: "#E11D48",
            animation: `sakhiWave 0.8s ease-in-out ${i * 0.1}s infinite alternate`,
          }}
        />
      ))}
      <style>{`@keyframes sakhiWave{from{transform:scaleY(0.6)}to{transform:scaleY(1.8)}}`}</style>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export function VoiceLayer() {
  const router = useRouter();
  const { lang } = useLang();
  const t = useCallback((hi: string, en: string) => (lang === "hi" ? hi : en), [lang]);
  const ttsLang: Lang = lang === "en" ? "en" : "hi";

  // Render nothing until mounted — the Web Speech APIs are client-only, and
  // this avoids any server/client hydration mismatch.
  const [mounted, setMounted] = useState(false);
  const [recSupported, setRecSupported] = useState(false);
  useEffect(() => {
    // One-time feature detection after mount (Web Speech APIs are client-only).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    setRecSupported(isRecognitionSupported());
  }, []);

  // Always stop any speech when the voice layer unmounts (e.g. navigation away).
  useEffect(() => () => stopSpeech(), []);

  // ── Voice input ─────────────────────────────────────────────────────────────
  const [sheetOpen, setSheetOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const sessionRef = useRef<RecognitionSession | null>(null);

  const speakApology = useCallback(() => {
    speak(
      t(
        "माफ़ कीजिए, मैं ठीक से समझ नहीं पाई। आप दुबारा बोल सकती हैं, या नीचे टैप करके बता सकती हैं।",
        "Sorry, I didn't quite understand. You can speak again, or tap below to tell me.",
      ),
      { lang: ttsLang },
    );
  }, [ttsLang, t]);

  const startListening = useCallback(() => {
    stopSpeech(); // never talk over the user
    setTranscript("");
    setErrorMsg(null);
    const session = startRecognition(ttsLang, {
      onStart: () => setListening(true),
      onTranscript: (text) => setTranscript(text),
      onError: (code) => {
        setListening(false);
        if (code === "not-allowed" || code === "service-not-allowed") {
          setErrorMsg(
            t(
              "माइक की अनुमति नहीं मिली। कृपया ब्राउज़र में माइक चालू करें, या नीचे टैप करके बताएं।",
              "Mic permission was denied. Please allow the mic in your browser, or tap below to tell me.",
            ),
          );
        } else if (code === "no-speech") {
          setErrorMsg(t("मुझे कुछ सुनाई नहीं दिया।", "I didn't hear anything."));
          speakApology();
        } else {
          setErrorMsg(
            t(
              "आवाज़ पकड़ने में दिक्कत हुई। दुबारा कोशिश करें।",
              "Trouble catching your voice. Please try again.",
            ),
          );
        }
      },
      onEnd: () => setListening(false),
    });
    if (!session) {
      setErrorMsg(
        t(
          "यह ब्राउज़र आवाज़ नहीं पकड़ पाता। कृपया नीचे टैप करके बताएं।",
          "This browser can't capture voice. Please tap below to tell me.",
        ),
      );
      return;
    }
    sessionRef.current = session;
  }, [ttsLang, t, speakApology]);

  const openMic = useCallback(() => {
    setSheetOpen(true);
    startListening();
  }, [startListening]);

  const closeMic = useCallback(() => {
    sessionRef.current?.abort();
    sessionRef.current = null;
    setListening(false);
    setSheetOpen(false);
    setTranscript("");
    setErrorMsg(null);
  }, []);

  const dispatch = useCallback(() => {
    const text = transcript.trim();
    if (!text) return;
    stopSpeech();
    sessionRef.current?.abort();
    sessionRef.current = null;
    setSheetOpen(false);
    setListening(false);
    setTranscript("");

    // On a chat screen (Content Hub / Period / Mood) the mic feeds that screen's
    // own chat — voice = typing, so the user stays in the current flow and is
    // never yanked to another page. Only the home launcher (no target) routes
    // by intent.
    const target = getVoiceTarget();
    if (target) {
      // Tell the screen this query came by voice so it speaks the answer back.
      markVoiceQuery();
      target(text);
      return;
    }

    const intent = matchIntent(text);
    if (intent.kind === "period") router.push(ROUTES.period);
    else if (intent.kind === "mood") router.push(ROUTES.mood);
    else if (intent.kind === "ask")
      router.push(`${ROUTES.ask}?q=${encodeURIComponent(intent.query)}`);
    else speakApology(); // "none" — nothing usable; tap UI stays available
  }, [transcript, router, speakApology]);

  // The mic UI is gated on recognition support (recSupported).
  if (!mounted) return null;

  const showRetry = !listening && (transcript.trim().length > 0 || errorMsg);

  return (
    <>
      {/* ── Mic FAB (every screen; only where voice input is supported) ── */}
      {recSupported && !sheetOpen && (
        <button
          type="button"
          onClick={openMic}
          aria-label={t("बोलकर बताएं", "Speak to Sakhi")}
          className="absolute z-40 flex items-center justify-center rounded-full text-white transition-transform active:scale-95"
          style={{
            right: 16,
            bottom: "calc(env(safe-area-inset-bottom, 0px) + 88px)",
            width: 56,
            height: 56,
            background: "#E11D48",
            boxShadow: "0 6px 20px rgba(225,29,72,0.4)",
          }}
        >
          <MicIcon />
        </button>
      )}

      {/* ── Listening sheet ── */}
      {recSupported && sheetOpen && (
        <div
          className="absolute inset-0 z-50 flex flex-col justify-end"
          style={{ background: "rgba(24,10,20,0.45)" }}
          onClick={closeMic}
        >
          <div
            className="rounded-t-3xl bg-white px-5 pt-4"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 20px)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-full"
                  style={{ background: listening ? "#FFE4E6" : "#F4F4F5", color: "#E11D48" }}
                >
                  <MicIcon size={20} />
                </span>
                <span
                  className="text-[15px] font-bold text-zinc-900"
                  style={{ fontFamily: "JioType, sans-serif" }}
                >
                  {listening ? t("मैं सुन रही हूँ…", "I'm listening…") : t("आपने कहा", "You said")}
                </span>
              </div>
              <button
                type="button"
                onClick={closeMic}
                aria-label={t("बंद करें", "Close")}
                className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500"
                style={{ background: "#F4F4F5" }}
              >
                <CloseIcon />
              </button>
            </div>

            {listening && (
              <div className="mb-3 flex h-8 items-center justify-center">
                <Waveform />
              </div>
            )}

            {/* Live transcript — visible confirmation before it is submitted */}
            <div
              className="min-h-[52px] rounded-2xl px-4 py-3 text-[15px] leading-relaxed"
              style={{
                background: "#FAFAFA",
                border: "1px solid #F0F0F0",
                color: transcript ? "#18181B" : "#A1A1AA",
                fontFamily: "JioType, sans-serif",
              }}
            >
              {transcript ||
                t('…बोलिए, जैसे "अगला पीरियड कब है"', '…speak, e.g. "when is my next period"')}
            </div>

            {errorMsg && (
              <p
                className="mt-2 text-[12px] leading-snug text-rose-500"
                style={{ fontFamily: "JioType, sans-serif" }}
              >
                {errorMsg}
              </p>
            )}

            {/* Actions */}
            <div className="mt-4 flex items-center gap-2.5">
              {listening ? (
                <button
                  type="button"
                  onClick={() => sessionRef.current?.stop()}
                  className="flex-1 rounded-full py-3 text-[14px] font-semibold text-zinc-700"
                  style={{ background: "#F4F4F5", fontFamily: "JioType, sans-serif" }}
                >
                  {t("रुकें", "Stop")}
                </button>
              ) : (
                <>
                  {showRetry && (
                    <button
                      type="button"
                      onClick={startListening}
                      className="flex-1 rounded-full py-3 text-[14px] font-semibold text-zinc-700"
                      style={{ background: "#F4F4F5", fontFamily: "JioType, sans-serif" }}
                    >
                      {t("दुबारा बोलें", "Speak again")}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={dispatch}
                    disabled={!transcript.trim()}
                    className="flex-1 rounded-full py-3 text-[14px] font-semibold text-white"
                    style={{
                      background: transcript.trim() ? "#E11D48" : "#F3B8C2",
                      fontFamily: "JioType, sans-serif",
                    }}
                  >
                    {t("भेजें", "Send")}
                  </button>
                </>
              )}
            </div>

            {/* Reassurance: tap still works */}
            <p
              className="mt-3 text-center text-[11px] text-zinc-400"
              style={{ fontFamily: "JioType, sans-serif" }}
            >
              {t("आप टैप करके भी सब कुछ कर सकती हैं", "You can also do everything by tapping")}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
