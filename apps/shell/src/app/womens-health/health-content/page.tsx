"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { HubHeader } from "@/app/jobs/design-prototype/HubHeader";
import { HubChatInput } from "@/app/jobs/design-prototype/HubChatInput";
import { askSakhi, splitDisclaimer } from "@/lib/sakhi";
import { isBlocked, isIsolated } from "@/lib/sakhi-feature";
import { useLang } from "../LangContext";
import { consumeVoiceQuery, useVoiceTarget } from "../voice/voiceBus";
import { speak, stopSpeech } from "../voice/tts";
import { SessionPrivacyNote } from "../SessionPrivacyNote";
import { pickSuggestions, type Suggestion } from "./suggestions";

type SakhiTurn = { role: "user" | "assistant"; content: string };

type Video = { label: string; channel: string; url: string; embedId?: string };
type Article = { title: string; source: string; url: string; summary?: string };
type Message = {
  role: "user" | "sakhi";
  text: string;
  video?: Video;
  article?: Article;
  isLlm?: boolean;
};

// ── Video card — expandable inline player ─────────────────────────────────────

function VideoCard({ video }: { video: Video }) {
  const [expanded, setExpanded] = useState(false);
  const [thumbFailed, setThumbFailed] = useState(false);
  const showThumb = !expanded && video.embedId && !thumbFailed;
  return (
    <div
      className="mt-1.5 ml-9 overflow-hidden rounded-xl"
      style={{ maxWidth: "82%", border: "1px solid #FECACA", background: "#FEF2F2" }}
    >
      {/* Preview: tapping the thumbnail expands into the inline player. */}
      {showThumb && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="relative block w-full transition-opacity active:opacity-90"
          style={{ aspectRatio: "16/9" }}
        >
          {/* hqdefault is 4:3 with letterbox bars; object-cover crops them to 16:9. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://img.youtube.com/vi/${video.embedId}/hqdefault.jpg`}
            alt={video.label}
            onError={() => setThumbFailed(true)}
            className="h-full w-full object-cover"
          />
          {/* Play button overlay */}
          <span className="absolute inset-0 flex items-center justify-center">
            <span
              className="flex h-11 w-11 items-center justify-center rounded-full shadow-md"
              style={{ background: "rgba(239,68,68,0.92)" }}
            >
              <span style={{ color: "white", fontSize: 16, marginLeft: 2 }}>▶</span>
            </span>
          </span>
        </button>
      )}
      {expanded && video.embedId && (
        <div className="w-full" style={{ aspectRatio: "16/9" }}>
          <iframe
            src={`https://www.youtube.com/embed/${video.embedId}?rel=0&autoplay=1`}
            title={video.label}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            className="h-full w-full border-0"
          />
        </div>
      )}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-opacity active:opacity-70"
      >
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{ background: "#EF4444" }}
        >
          <span style={{ color: "white", fontSize: 14 }}>{expanded ? "▼" : "▶"}</span>
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <span
            className="text-[11px] leading-snug font-semibold text-zinc-800"
            style={{ fontFamily: "JioType, sans-serif" }}
          >
            {video.label}
          </span>
          <span className="text-[10px] text-zinc-400" style={{ fontFamily: "JioType, sans-serif" }}>
            {video.channel} · YouTube
          </span>
        </div>
        <span className="ml-auto shrink-0 text-[12px] text-zinc-400">
          {expanded ? "बंद करें" : "देखें"}
        </span>
      </button>
    </div>
  );
}

// ── Article card — expandable in-app iframe ───────────────────────────────────

function ArticleCard({ article }: { article: Article }) {
  const [expanded, setExpanded] = useState(false);
  const BADGE_COLORS: Record<string, string> = {
    WHO: "#2563EB",
    ACOG: "#7C3AED",
    FOGSI: "#059669",
    ICMR: "#B45309",
    "Mayo Clinic": "#DC2626",
    NHS: "#0891B2",
    MoHFW: "#EA580C",
    NCBI: "#475569",
  };
  const BADGE_LABELS: Record<string, string> = {
    WHO: "WHO",
    ACOG: "ACOG",
    FOGSI: "FOG",
    ICMR: "ICM",
    "Mayo Clinic": "MCL",
    NHS: "NHS",
    MoHFW: "MoH",
    NCBI: "NCBI",
  };
  const badge = BADGE_LABELS[article.source] ?? "📄";
  const badgeBg = BADGE_COLORS[article.source] ?? "#6B7280";
  return (
    <div
      className="mt-1.5 ml-9 overflow-hidden rounded-xl"
      style={{ maxWidth: "82%", border: "1px solid #BFDBFE", background: "#EFF6FF" }}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-opacity active:opacity-70"
      >
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold"
          style={{ background: badgeBg, color: "white" }}
        >
          {badge}
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <span
            className="text-[11px] leading-snug font-semibold text-zinc-800"
            style={{ fontFamily: "JioType, sans-serif" }}
          >
            {article.title}
          </span>
          <span className="text-[10px] text-zinc-400" style={{ fontFamily: "JioType, sans-serif" }}>
            {article.source} · सत्यापित स्रोत
          </span>
        </div>
        <span className="ml-auto shrink-0 text-[12px] text-zinc-400">
          {expanded ? "बंद करें" : "पढ़ें"}
        </span>
      </button>
      {expanded && (
        <div className="px-3 pb-3">
          <p
            className="mb-2 text-[12px] leading-relaxed text-zinc-700"
            style={{ fontFamily: "JioType, sans-serif" }}
          >
            {article.summary}
          </p>
          <div
            className="flex items-center gap-1.5 pt-2"
            style={{ borderTop: "1px solid #BFDBFE" }}
          >
            <div
              className="flex h-4 w-4 items-center justify-center rounded text-[8px] font-bold"
              style={{ background: badgeBg, color: "white" }}
            >
              {badge}
            </div>
            <span
              className="text-[10px] text-zinc-400"
              style={{ fontFamily: "JioType, sans-serif" }}
            >
              स्रोत: {article.source} — {article.title}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Value note — "why this pick is better than a random search" ──────────────
// A deliberately distinct UI (dashed lavender, sparkle) so it reads as Sakhi's
// personal framing, NOT as the content itself. Builds perceived value: verified,
// personalised, time-saving — helping the user decide with confidence.

const VALUE_VIDEO_HI =
  "हमने कई वीडियो में से खास आपके लिए यह एक चुना है — आपके सवाल के अनुसार पूरी तरह पर्सनलाइज़्ड, और आपके लिए सबसे प्रासंगिक और उपयोगी। न घंटों स्क्रॉल करना, न गलत जानकारी।";
const VALUE_VIDEO_EN =
  "We searched through many videos and picked this one specially for you — personalised to your question, and the most relevant and useful for you. No endless scrolling, no misinformation.";
const VALUE_INFO_HI =
  "यह कोई आम इंटरनेट सर्च नहीं है — यह भरोसेमंद संस्थाओं (WHO, FOGSI) से सत्यापित और आपके सवाल के लिए चुनी गई जानकारी है, ताकि आप पूरे भरोसे के साथ सही फैसला ले सकें। 💜";
const VALUE_INFO_EN =
  "This isn't a random internet search — it's verified by trusted bodies like WHO and FOGSI and matched to your question, so you can decide with real confidence. 💜";

// Doctor disclaimer — rendered as a distinct, muted footnote (not blended into
// the answer text) so it reads clearly as a standing note, not as content.
function DisclaimerNote({ text }: { text: string }) {
  return (
    <div
      className="mt-1.5 ml-9 flex items-start gap-1.5 rounded-lg px-2.5 py-1.5"
      style={{ maxWidth: "82%", background: "#FFFBEB", border: "1px solid #FDE68A" }}
    >
      <span className="shrink-0 text-[11px] leading-[15px]">ⓘ</span>
      <span
        className="text-[10px] leading-snug italic"
        style={{ color: "#92400E", fontFamily: "JioType, sans-serif" }}
      >
        {text}
      </span>
    </div>
  );
}

function ValueNote({ text }: { text: string }) {
  return (
    <div
      className="mt-2 ml-9 flex items-start gap-2 rounded-xl px-3 py-2"
      style={{ maxWidth: "82%", background: "#FAF5FF", border: "1px dashed #D8B4FE" }}
    >
      <span className="shrink-0 text-[13px] leading-[18px]">✨</span>
      <span
        className="text-[11px] leading-snug font-medium"
        style={{ color: "#7C3AED", fontFamily: "JioType, sans-serif" }}
      >
        {text}
      </span>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HealthContentPage() {
  // Isolated builds for the other two features must not expose this page.
  if (isBlocked("health")) notFound();
  return (
    <Suspense>
      <HealthContentInner />
    </Suspense>
  );
}

function HealthContentInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { lang, ready } = useLang();
  const t = (hi: string, en: string) => (lang === "hi" ? hi : en);

  // Back-button gate: show the privacy note once per session, then navigate.
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const goHome = () => router.push("/womens-health");
  const handleBack = () => setPrivacyOpen(true);
  const assistantName = t("सखी", "Health Companion");
  const disclaimerHi =
    "नमस्ते! मैं सखी हूँ — आपकी स्वास्थ्य सहेली। 💜\n\nआपका राज़ मेरा राज़ है। जो भी आप मुझसे पूछेंगी — वो सिर्फ हमारे बीच रहेगा। कोई विज्ञापन नहीं, कोई जानकारी किसी के साथ साझा नहीं।\n\nकोई भी सवाल पूछिए — बिना झिझक।";
  const disclaimerEn =
    "Hi! I'm your Health Companion. 💜\n\nYour privacy is my priority. Everything you share with me stays between us. No ads, no data shared with anyone.\n\nAsk me anything — no hesitation needed.";
  const [messages, setMessages] = useState<Message[]>([
    { role: "sakhi", text: lang === "en" ? disclaimerEn : disclaimerHi },
  ]);
  // Update disclaimer when lang toggles (only if it's still the only message)
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].role === "sakhi") {
        return [{ role: "sakhi", text: lang === "en" ? disclaimerEn : disclaimerHi }];
      }
      return prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const autoSubmittedRef = useRef(false);

  // Suggested pills — chosen fresh on each return to suit her profile (life
  // stage + interests, backend-provided in the real product) and her real
  // signals (cycle phase, recent mood). Picked once per mount so toggling the
  // language only re-labels the same four, and reads localStorage after mount
  // to avoid a hydration mismatch. See ./suggestions.ts.
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  useEffect(() => {
    setSuggestions(pickSuggestions());
  }, []);

  // Voice input on this screen goes straight into the chat (same as typing).
  useVoiceTarget((text) => handleSubmit(text));

  const scroll = () =>
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);

  // Wait for the saved language to be applied before auto-submitting a `?q=`
  // deep link — otherwise askSakhi runs with the default "hi" and the answer
  // (and its disclaimer) come back in Hindi even when the user is in English.
  useEffect(() => {
    if (!ready) return;
    const q = searchParams.get("q");
    if (q && !autoSubmittedRef.current) {
      autoSubmittedRef.current = true;
      handleSubmit(decodeURIComponent(q));
    }
  }, [ready]);

  async function handleSubmit(question: string) {
    if (!question.trim() || loading) return;
    // If this query arrived by voice, speak Sakhi's answer back.
    const viaVoice = consumeVoiceQuery();
    const q = question.trim();
    const history: SakhiTurn[] = messages.map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.text,
    }));
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setLoading(true);
    scroll();
    try {
      const data = await askSakhi(q, history, lang);
      const answerText =
        data.answer ||
        t("सखी अभी उपलब्ध नहीं है।", "Your Health Companion is unavailable right now.");
      setMessages((prev) => [
        ...prev,
        {
          role: "sakhi",
          text: answerText,
          video: data.video,
          article: data.article,
          isLlm: data.isLlm,
        },
      ]);
      // Speak the answer body (not the doctor disclaimer) when asked by voice.
      if (viaVoice) {
        stopSpeech();
        speak(splitDisclaimer(answerText).body, { lang });
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "sakhi",
          text: t(
            "नेटवर्क में समस्या है। कृपया पुनः प्रयास करें।",
            "Network error. Please try again.",
          ),
        },
      ]);
    } finally {
      setLoading(false);
      scroll();
    }
  }

  return (
    <div className="bg-canvas-grey relative flex h-full flex-col">
      <main
        className="min-h-0 flex-1 [scrollbar-width:none] overflow-y-auto px-4 pb-4 [&::-webkit-scrollbar]:hidden"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 76px)" }}
      >
        <div className="mx-auto flex w-full max-w-md flex-col gap-3">
          {/* Conversation */}
          {messages.map((m, i) => {
            const { body, disclaimer } =
              m.role === "sakhi" ? splitDisclaimer(m.text) : { body: m.text, disclaimer: null };
            return (
              <div
                key={i}
                className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
              >
                {/* Video first — the clip is shown before any text answer. */}
                {m.role === "sakhi" && m.video && (
                  <>
                    <ValueNote text={t(VALUE_VIDEO_HI, VALUE_VIDEO_EN)} />
                    <VideoCard video={m.video} />
                  </>
                )}
                <div
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} w-full`}
                >
                  {m.role === "sakhi" && (
                    <div
                      className="mr-2 flex h-7 w-7 shrink-0 items-center justify-center self-end rounded-full text-[12px]"
                      style={{ background: "#F0FDF4" }}
                    >
                      ✅
                    </div>
                  )}
                  <div
                    className="max-w-[82%] px-3 py-2 text-[13px] leading-relaxed"
                    style={{
                      background: m.role === "user" ? "#6d17ce" : "#F9FAFB",
                      color: m.role === "user" ? "white" : "#1F2937",
                      borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                      fontFamily: "JioType, sans-serif",
                      border: m.role === "sakhi" ? "1px solid #F3F4F6" : "none",
                    }}
                  >
                    {body}
                  </div>
                </div>
                {m.role === "sakhi" && disclaimer && <DisclaimerNote text={disclaimer} />}
                {m.role === "sakhi" && m.isLlm && (
                  <div
                    className="mt-1 ml-9 flex items-center gap-1 text-[10px]"
                    style={{ color: "#9CA3AF" }}
                  >
                    <span>⚠️</span>
                    <span style={{ fontFamily: "JioType, sans-serif" }}>
                      यह जवाब AI द्वारा उत्पन्न है। यह जानकारी सामान्य शिक्षा के लिए है और किसी
                      योग्य डॉक्टर की व्यक्तिगत सलाह का विकल्प नहीं है। स्वास्थ्य संबंधी कोई भी
                      निर्णय लेने से पहले अपनी डॉक्टर से अवश्य परामर्श करें।
                    </span>
                  </div>
                )}
                {m.role === "sakhi" && !m.video && m.article && (
                  <>
                    <ValueNote text={t(VALUE_INFO_HI, VALUE_INFO_EN)} />
                    <ArticleCard article={m.article} />
                  </>
                )}
              </div>
            );
          })}

          {/* Suggested pills — shown after the greeting, until she asks something */}
          {!messages.some((m) => m.role === "user") && suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2 px-1 pb-1">
              {suggestions.map((s) => {
                const label = lang === "en" ? s.en : s.hi;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSubmit(label)}
                    className="rounded-full border px-3 py-1.5 text-left text-[12px] font-medium transition-all active:scale-95"
                    style={{
                      background: "#FDF2F4",
                      borderColor: "#F4B8C1",
                      color: "#C0415A",
                      fontFamily: "JioType, sans-serif",
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Loading dots */}
          {loading && (
            <div className="flex justify-start">
              <div
                className="mr-2 flex h-7 w-7 shrink-0 items-center justify-center self-end rounded-full text-[12px]"
                style={{ background: "#F0FDF4" }}
              >
                ✅
              </div>
              <div
                className="flex items-center gap-1.5 rounded-2xl px-4 py-3"
                style={{ background: "#F9FAFB", border: "1px solid #F3F4F6" }}
              >
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-zinc-400"
                    style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
                  />
                ))}
                <style>{`@keyframes pulse{0%,100%{opacity:0.3}50%{opacity:1}}`}</style>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </main>

      <HubHeader
        title={t("सेहत के सवालों के जवाब", "Your health queries, answered")}
        backHref="/womens-health"
        onBack={handleBack}
        hideBack={isIsolated}
        scrolled={false}
      />
      <HubChatInput
        variant="sleek"
        placeholder={t("सखी से पूछें...", `Ask ${assistantName}...`)}
        onSubmit={handleSubmit}
      />
      <SessionPrivacyNote lang={lang} open={privacyOpen} onResolved={goHome} />
    </div>
  );
}
