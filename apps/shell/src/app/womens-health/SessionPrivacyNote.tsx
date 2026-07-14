"use client";

/**
 * End-of-conversation privacy note (all Women's Health chat features).
 *
 * Triggered by the BACK button — leaving a feature is the one unambiguous
 * "the conversation has ended" signal (an idle timer was too fuzzy). Once per
 * browser session, when the user taps back, Sakhi first explains that — to
 * protect her privacy — this chat clears itself when she reopens the app, and
 * asks whether that's okay or she'd like to see her previous chats. After she
 * answers, the app navigates back. "Show previous chats" just records the
 * preference for now (actual restore is wired later).
 *
 * Scoped to the CHAT conversation only — it never claims the saved period/mood
 * data is cleared (that persists, by design), so the promise stays honest.
 *
 * Usage in a chat screen: route the header's back through the note. It shows at
 * the end of EVERY conversation (every feature), then navigates once she answers.
 *   const [privacyOpen, setPrivacyOpen] = useState(false);
 *   const goHome = () => router.push("/womens-health");
 *   const handleBack = () => setPrivacyOpen(true);
 *   <HubHeader onBack={handleBack} ... />
 *   <SessionPrivacyNote lang={lang} open={privacyOpen} onResolved={goHome} />
 */
import { useState } from "react";

const HISTORY_PREF = "sakhi_history_pref"; // "keep" if she opted to retain chats

export function SessionPrivacyNote({
  lang,
  open,
  onResolved,
}: {
  lang: "hi" | "en";
  open: boolean;
  /** Called once the user has answered — the screen then navigates back. */
  onResolved: () => void;
}) {
  const t = (hi: string, en: string) => (lang === "hi" ? hi : en);
  const [chose, setChose] = useState(false);

  if (!open) return null;

  const acknowledge = () => onResolved();
  const keepHistory = () => {
    try {
      localStorage.setItem(HISTORY_PREF, "keep");
    } catch {
      /* ignore storage errors */
    }
    setChose(true);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("आपकी निजता", "Your privacy")}
      className="absolute inset-0 z-50 flex flex-col justify-end"
      style={{ background: "rgba(24,10,20,0.45)" }}
      onClick={acknowledge}
    >
      <div
        className="rounded-t-3xl bg-white px-5 pt-5"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 20px)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center gap-2.5">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[16px]"
            style={{ background: "#FFE4E6" }}
            aria-hidden
          >
            🔒
          </span>
          <span
            className="text-[15px] font-bold text-zinc-900"
            style={{ fontFamily: "JioType, sans-serif" }}
          >
            {t("आपकी निजता", "Your privacy")}
          </span>
        </div>

        {!chose ? (
          <>
            <p
              className="text-[14px] leading-relaxed text-zinc-600"
              style={{ fontFamily: "JioType, sans-serif" }}
            >
              {t(
                "आपकी निजता का ध्यान रखते हुए — जब आप ऐप दुबारा खोलेंगी, यह बातचीत अपने आप मिट जाएगी। आज की कोई बात यहाँ नहीं रहेगी। क्या यह आपके लिए ठीक है, या आप अपनी पिछली बातचीत देखना चाहेंगी?",
                "To keep things private, this chat clears itself when you open the app again — nothing from today stays here. Does that work for you, or would you like to see your previous chats?",
              )}
            </p>
            <div className="mt-4 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={acknowledge}
                className="rounded-full py-3 text-[14px] font-bold text-white transition-transform active:scale-95"
                style={{ background: "#E11D48", fontFamily: "JioType, sans-serif" }}
              >
                {t("हाँ, यह ठीक है", "Yes, that works")}
              </button>
              <button
                type="button"
                onClick={keepHistory}
                className="rounded-full py-3 text-[14px] font-semibold text-zinc-700 transition-transform active:scale-95"
                style={{ background: "#F4F4F5", fontFamily: "JioType, sans-serif" }}
              >
                {t("मेरी पिछली बातचीत दिखाएँ", "Show my previous chats")}
              </button>
            </div>
          </>
        ) : (
          <>
            <p
              className="text-[14px] leading-relaxed text-zinc-600"
              style={{ fontFamily: "JioType, sans-serif" }}
            >
              {t(
                "ठीक है 💜 आपकी पसंद सहेज ली गई है — अगली बार मैं आपकी पिछली बातचीत दिखाने की कोशिश करूँगी।",
                "Okay 💜 Your choice is saved — next time I'll show your previous chats.",
              )}
            </p>
            <button
              type="button"
              onClick={onResolved}
              className="mt-4 w-full rounded-full py-3 text-[14px] font-bold text-white transition-transform active:scale-95"
              style={{ background: "#E11D48", fontFamily: "JioType, sans-serif" }}
            >
              {t("ठीक है", "Got it")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
