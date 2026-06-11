"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  type ChatMessage,
  type UiLanguage,
  estimateVoiceDuration,
  FIRST_TIME_GREETING,
  generateReply,
  RETURNING_GREETING,
  RETURNING_MEMORY_GREETING,
  ttsLangFor,
} from "./companion-data";

const LANG_KEY = "dkb_ui_language";
const SESSION_COUNT_KEY = "dkb_session_count";

let uid = 0;
const newId = () => `m${Date.now()}_${uid++}`;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function loadLanguage(): UiLanguage {
  if (typeof window === "undefined") return "hinglish";
  const v = window.localStorage.getItem(LANG_KEY);
  return v === "hi" || v === "en" || v === "hinglish" ? v : "hinglish";
}

export function useCompanion() {
  const [uiLanguage, setUiLanguageState] = useState<UiLanguage>("hinglish");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [crisisActive, setCrisisActive] = useState(false);

  const greetedRef = useRef(false); // guard against React StrictMode double-mount
  const langRef = useRef<UiLanguage>("hinglish");

  const setUiLanguage = useCallback((lang: UiLanguage) => {
    langRef.current = lang;
    setUiLanguageState(lang);
    if (typeof window !== "undefined") window.localStorage.setItem(LANG_KEY, lang);
  }, []);

  // Stream a set of companion bubbles with human-like typing pauses.
  const streamCompanion = useCallback(
    async (bubbles: { text: string; delayMs: number }[], crisis = false) => {
      for (const b of bubbles) {
        setIsTyping(true);
        await sleep(b.delayMs);
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          { id: newId(), sender: "companion", text: b.text, kind: "text", crisis },
        ]);
        await sleep(120);
      }
    },
    [],
  );

  // Companion always sends the first message — first-time vs. returning differ.
  useEffect(() => {
    if (greetedRef.current) return;
    greetedRef.current = true;

    const lang = loadLanguage();
    langRef.current = lang;
    setUiLanguageState(lang);

    const prevCount = Number(window.sessionStorage.getItem(SESSION_COUNT_KEY) ?? "0");
    setSessionCount(prevCount);
    window.sessionStorage.setItem(SESSION_COUNT_KEY, String(prevCount + 1));

    let greeting: string[];
    if (prevCount === 0) {
      greeting = FIRST_TIME_GREETING[lang];
    } else {
      // Returning users: reference a remembered mood ~half the time (the trust trigger).
      greeting = Math.random() < 0.5 ? RETURNING_MEMORY_GREETING[lang] : RETURNING_GREETING[lang];
    }

    (async () => {
      await sleep(300 + Math.random() * 600); // 0.3–0.9s before greeting
      await streamCompanion(greeting.map((text, i) => ({ text, delayMs: i === 0 ? 600 : 450 })));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendUserMessage = useCallback(
    async (text: string, opts?: { voice?: boolean }) => {
      const clean = text.trim();
      if (!clean) return;
      const voice = !!opts?.voice;

      setMessages((prev) => [
        ...prev,
        {
          id: newId(),
          sender: "user",
          text: clean,
          kind: "text",
          voice,
          durationSec: voice ? estimateVoiceDuration(clean) : undefined,
        },
      ]);

      const { bubbles, crisis, replyLanguage } = generateReply(clean, langRef.current);
      if (crisis) setCrisisActive(true);

      if (voice) {
        // Voice-first: reply comes back as a single spoken voice note + transcript.
        const joined = bubbles.map((b) => b.text).join(" ");
        setIsTyping(true);
        await sleep(700);
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: newId(),
            sender: "companion",
            text: joined,
            kind: "text",
            crisis,
            voice: true,
            durationSec: estimateVoiceDuration(joined),
            voiceLang: ttsLangFor(replyLanguage),
          },
        ]);
      } else {
        await streamCompanion(bubbles, crisis);
      }
    },
    [streamCompanion],
  );

  // Append a hands-free voice-chat turn (user + companion) to the thread as
  // voice bubbles. The companion bubble reuses the id the Voice Chat screen
  // already spoke, so the chat won't auto-replay it on mount.
  const appendVoiceExchange = useCallback(
    (userText: string, companionText: string, voiceLang: "hi" | "en", companionId: string) => {
      setMessages((prev) => [
        ...prev,
        {
          id: newId(),
          sender: "user",
          text: userText,
          kind: "text",
          voice: true,
          durationSec: estimateVoiceDuration(userText),
        },
        {
          id: companionId,
          sender: "companion",
          text: companionText,
          kind: "text",
          voice: true,
          durationSec: estimateVoiceDuration(companionText),
          voiceLang,
        },
      ]);
    },
    [],
  );

  const appendCallRecord = useCallback((durationLabel: string) => {
    setMessages((prev) => [
      ...prev,
      { id: newId(), sender: "companion", text: durationLabel, kind: "call-record" },
    ]);
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    setCrisisActive(false);
    greetedRef.current = false;
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(SESSION_COUNT_KEY, "0");
    }
    // Re-greet as a fresh first-time user.
    setTimeout(() => {
      greetedRef.current = true;
      const lang = langRef.current;
      window.sessionStorage.setItem(SESSION_COUNT_KEY, "1");
      setSessionCount(0);
      void streamCompanion(
        FIRST_TIME_GREETING[lang].map((text, i) => ({ text, delayMs: i === 0 ? 500 : 400 })),
      );
    }, 250);
  }, [streamCompanion]);

  return {
    uiLanguage,
    setUiLanguage,
    messages,
    isTyping,
    sessionCount,
    crisisActive,
    sendUserMessage,
    appendVoiceExchange,
    appendCallRecord,
    clearChat,
  };
}
