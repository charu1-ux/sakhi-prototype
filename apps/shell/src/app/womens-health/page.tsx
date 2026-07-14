"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { notFound, useRouter } from "next/navigation";

import { HubChatInput } from "@/app/jobs/design-prototype/HubChatInput";
import { HubHeader } from "@/app/jobs/design-prototype/HubHeader";
import { withBasePath } from "@/lib/base-path";
import { isBlocked } from "@/lib/sakhi-feature";
import { useLang } from "./LangContext";
import { playClip, stopSpeech, type Lang, type SpeechHandle } from "./voice/tts";

// Sakhi's spoken home walkthrough. Both languages play from a recorded female
// voice-over; English is written natively — not translated. The text below is
// kept in sync with the recordings and used as the TTS fallback. Both keep a
// warm, unhurried Sakhi tone.
const WALKTHROUGH_HI =
  "नमस्ते। मैं सखी हूं — आपकी अपनी सहेली। " +
  "यहां जल्दी की कोई बात नहीं, झिझक की भी नहीं। जो मन में हो, वो बोलिए। " +
  "आपका अगला period कब आ सकता है — यह मैं बता दूंगी। आजकल मन कैसा रहता है — यह हम " +
  "हफ्ते-दर-हफ्ते साथ देखेंगे, और हर हफ्ते थोड़ा और साफ होता जाएगा। " +
  "Period हो, सेहत हो, या रोज़मर्रा की कोई भी बात — बेझिझक पूछिए। कोई सवाल छोटा नहीं होता। " +
  "मैं यहीं हूं। बताइए — मैं सुन रही हूं।";
const WALKTHROUGH_EN =
  "Hi, I'm Sakhi — think of me as a friend you can talk to. There's no need to feel shy here, and " +
  "no need to rush. Ask me when your next period might come, and I'll let you know. If your mood " +
  "has been changing a lot lately, we can follow it together, week by week. And anything else on " +
  "your mind — your period, your health, or everyday life — just ask. No question is too small, " +
  "and none is wrong. I'm here with you. So go ahead — I'm listening.";

// ─── Sakhi Avatar (simple illustrated, relatable) ────────────────────────────

function SakhiAvatar({ speaking }: { speaking: boolean }) {
  return (
    <div className="relative flex items-center justify-center">
      {/* Pulse ring when speaking */}
      {speaking && (
        <div
          className="absolute animate-ping rounded-full"
          style={{ width: 76, height: 76, background: "rgba(225,29,72,0.15)" }}
        />
      )}
      {/* Avatar circle */}
      <div
        className="relative overflow-hidden rounded-full"
        style={{
          width: 72,
          height: 72,
          border: speaking ? "2.5px solid #E11D48" : "2.5px solid #FECDD3",
        }}
      >
        {/* withBasePath prefixes the app basePath so this resolves to
            /sakhi-prototype/sakhi-avatar.png on GitHub Pages. Images are
            unoptimized, so next/image does not add basePath on its own. */}
        <Image
          src={withBasePath("/sakhi-avatar.png")}
          alt="Sakhi"
          width={72}
          height={72}
          unoptimized
          className="h-full w-full object-cover"
          style={{ transform: "scale(1.08)" }}
        />
      </div>
    </div>
  );
}

// ─── Sakhi Card ───────────────────────────────────────────────────────────────

function SakhiCard() {
  const { lang } = useLang();
  const [speaking, setSpeaking] = useState(false);
  const handleRef = useRef<SpeechHandle | null>(null);
  const t = (hi: string, en: string) => (lang === "hi" ? hi : en);
  const ttsLang: Lang = lang === "en" ? "en" : "hi";

  // Stop Sakhi if the card unmounts (e.g. tapping through to a tile).
  useEffect(
    () => () => {
      handleRef.current?.stop();
      stopSpeech();
    },
    [],
  );

  // Tap Sakhi to hear her walkthrough (female voice); tap again to stop. The tap
  // is the user gesture browsers require before speech is allowed to play, so
  // the walkthrough plays reliably here — no autoplay, no full-screen takeover.
  const toggleWalkthrough = () => {
    if (speaking) {
      handleRef.current?.stop();
      stopSpeech();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    handleRef.current = playClip(
      "home_walkthrough",
      { hi: WALKTHROUGH_HI, en: WALKTHROUGH_EN },
      { lang: ttsLang, onEnd: () => setSpeaking(false), onError: () => setSpeaking(false) },
    );
  };

  return (
    <div className="rounded-2xl bg-white p-4" style={{ border: "1px solid #F3F4F6" }}>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleWalkthrough}
          className="shrink-0 cursor-pointer touch-manipulation border-none bg-transparent p-0 transition-transform duration-150 active:scale-95"
          aria-label={
            speaking ? t("सखी को रोकें", "Stop Sakhi") : t("सखी को सुनें", "Hear Sakhi speak")
          }
        >
          <SakhiAvatar speaking={speaking} />
        </button>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            <span
              className="text-[17px] font-bold tracking-tight text-zinc-900"
              style={{ fontFamily: "JioType, sans-serif" }}
            >
              {t("सखी", "Health Companion")}
            </span>
          </div>
          <p
            className="text-[13px] leading-snug text-zinc-500"
            style={{ fontFamily: "JioType, sans-serif" }}
          >
            {speaking
              ? t("मैं बता रही हूँ… (रोकने के लिए दबाएँ)", "I'm speaking… (tap to stop)")
              : t(
                  "नमस्ते! जानने के लिए मुझ पर टैप करें कि मैं कैसे मदद कर सकती हूँ।",
                  "Hello! Tap me to hear how I can help you.",
                )}
          </p>
        </div>
      </div>

      {/* Voice bars */}
      {speaking && (
        <div className="mt-3 flex items-center gap-1.5 pl-[80px]">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="rounded-full"
              style={{
                width: 4,
                height: 4 + ((i * 7) % 12),
                background: "#E11D48",
                opacity: 0.65,
                animation: `bounce 0.8s ease-in-out ${i * 0.1}s infinite alternate`,
              }}
            />
          ))}
          <style>{`@keyframes bounce{from{transform:scaleY(1)}to{transform:scaleY(2.2)}}`}</style>
        </div>
      )}
    </div>
  );
}

// ─── P0 Tiles ─────────────────────────────────────────────────────────────────

const P0_TILES = [
  {
    icon: "✅",
    iconBg: "#F0FDF4",
    label: "सेहत के सवालों के जवाब",
    labelEn: "Your health queries, answered",
    desc: "PCOS, पीरियड दर्द, एनीमिया — विशेषज्ञों द्वारा सत्यापित लेख और वीडियो",
    descEn: "PCOS, period pain, anaemia — articles & videos verified by experts",
    href: "/womens-health/health-content",
  },
  {
    icon: "🗓️",
    iconBg: "#FFF1F2",
    label: "अगले पीरियड की तारीख जानें",
    labelEn: "Know your next period date",
    desc: "पीरियड लॉग करें, अगला पीरियड कब — सखी याद रखती है",
    descEn: "Log your period, know when next — your Health Companion remembers",
    href: "/womens-health/period-tracker",
  },
  {
    icon: "💜",
    iconBg: "#F5F3FF",
    label: "मूड के उतार-चढ़ाव समझें",
    labelEn: "Understand your mood swings",
    desc: "मासिक धर्म से पहले मूड खराब, चिड़चिड़ापन — हॉर्मोन से जोड़कर समझें",
    descEn: "Low mood, irritability before periods — understand the hormone link",
    href: "/womens-health/mood-tracker",
  },
];

function P0Tiles() {
  const { lang } = useLang();
  const router = useRouter();
  const t = (hi: string, en: string) => (lang === "hi" ? hi : en);
  return (
    <div className="flex flex-col gap-3">
      <h2
        className="text-[15px] font-bold text-zinc-900"
        style={{ fontFamily: "JioType, sans-serif" }}
      >
        {t("आज क्या करना है?", "What do you want to do today?")}
      </h2>
      <div className="flex flex-col gap-2">
        {P0_TILES.map((tile) => (
          <button
            key={tile.label}
            type="button"
            onClick={() => router.push(tile.href)}
            className="flex items-center gap-3 rounded-2xl bg-white p-3.5 text-left transition-opacity active:opacity-70"
            style={{ border: "1px solid #F3F4F6" }}
          >
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[22px]"
              style={{ background: tile.iconBg }}
            >
              {tile.icon}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span
                className="text-[14px] font-semibold text-zinc-900"
                style={{ fontFamily: "JioType, sans-serif" }}
              >
                {t(tile.label, tile.labelEn)}
              </span>
              <span
                className="text-[12px] leading-snug text-zinc-500"
                style={{ fontFamily: "JioType, sans-serif" }}
              >
                {t(tile.desc, tile.descEn)}
              </span>
            </div>
            <span className="shrink-0 text-[18px] text-zinc-300">›</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WomensHealthPage() {
  // Isolated single-feature builds must never show the shared 3-tile landing.
  if (isBlocked("landing")) notFound();
  const { lang, setLang } = useLang();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const scrollRef = useRef(false);
  const t = (hi: string, en: string) => (lang === "hi" ? hi : en);

  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    const past = e.currentTarget.scrollTop > 8;
    if (past !== scrollRef.current) {
      scrollRef.current = past;
      setScrolled(past);
    }
  }, []);

  // Landing chat box: send the question into the health-content chat page,
  // which auto-submits the `q` param to the LLM (askSakhi) on load.
  const handleChatSubmit = useCallback(
    (q: string) => {
      const query = q.trim();
      if (!query) return;
      router.push(`/womens-health/health-content?q=${encodeURIComponent(query)}`);
    },
    [router],
  );

  const langToggle = (
    <button
      type="button"
      onClick={() => setLang(lang === "hi" ? "en" : "hi")}
      className="flex h-9 items-center rounded-full px-3 text-[13px] font-semibold"
      style={{ background: "#FFF1F2", color: "#BE123C", fontFamily: "JioType, sans-serif" }}
    >
      {lang === "hi" ? "EN" : "हिं"}
    </button>
  );

  return (
    <div className="bg-canvas-grey text-fg relative flex h-full flex-col">
      <main
        className="min-h-0 flex-1 [scrollbar-width:none] overflow-x-hidden overflow-y-auto px-4 pb-6 [&::-webkit-scrollbar]:hidden"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 76px)" }}
        onScroll={handleScroll}
      >
        <div className="mx-auto flex w-full max-w-md flex-col gap-6">
          <SakhiCard />
          <P0Tiles />
        </div>
      </main>

      <HubHeader
        title={t("महिला स्वास्थ्य", "Women's Health")}
        scrolled={scrolled}
        onBack={() => {}}
        rightSlot={langToggle}
      />
      <HubChatInput
        variant="sleek"
        placeholder={t("सखी से पूछें...", "Ask Sakhi...")}
        onSubmit={handleChatSubmit}
      />
    </div>
  );
}
