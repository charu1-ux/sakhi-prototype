"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { HubHeader } from "@/app/jobs/design-prototype/HubHeader";
import { HubChatInput } from "@/app/jobs/design-prototype/HubChatInput";
import { askSakhi } from "@/lib/sakhi";

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
  return (
    <div
      className="mt-1.5 ml-9 overflow-hidden rounded-xl"
      style={{ maxWidth: "82%", border: "1px solid #FECACA", background: "#FEF2F2" }}
    >
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
      {expanded && video.embedId && (
        <div className="w-full" style={{ aspectRatio: "16/9" }}>
          <iframe
            src={`https://www.youtube.com/embed/${video.embedId}?rel=0`}
            title={video.label}
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            className="h-full w-full border-0"
          />
        </div>
      )}
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

// ── Suggested prompts ─────────────────────────────────────────────────────────

const SUGGESTED = [
  "पीरियड में बहुत दर्द — क्या यह सामान्य है?",
  "अनियमित पीरियड क्यों होते हैं?",
  "खून की कमी के लक्षण क्या हैं?",
  "PCOS क्या होता है?",
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HealthContentPage() {
  return (
    <Suspense>
      <HealthContentInner />
    </Suspense>
  );
}

function HealthContentInner() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "sakhi",
      text: "नमस्ते! मैं सखी हूँ — आपकी स्वास्थ्य सहेली। 💜\n\nआपका राज़ मेरा राज़ है। जो भी आप मुझसे पूछेंगी — वो सिर्फ हमारे बीच रहेगा। कोई विज्ञापन नहीं, कोई जानकारी किसी के साथ साझा नहीं।\n\nकोई भी सवाल पूछिए — बिना झिझक।",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const autoSubmittedRef = useRef(false);

  const scroll = () =>
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q && !autoSubmittedRef.current) {
      autoSubmittedRef.current = true;
      handleSubmit(decodeURIComponent(q));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(question: string) {
    if (!question.trim() || loading) return;
    const q = question.trim();
    const history: SakhiTurn[] = messages.map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.text,
    }));
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setLoading(true);
    scroll();
    try {
      const data = await askSakhi(q, history);
      setMessages((prev) => [
        ...prev,
        {
          role: "sakhi",
          text: data.answer || "सखी अभी उपलब्ध नहीं है।",
          video: data.video,
          article: data.article,
          isLlm: data.isLlm,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "sakhi", text: "नेटवर्क में समस्या है। कृपया पुनः प्रयास करें।" },
      ]);
    } finally {
      setLoading(false);
      scroll();
    }
  }

  return (
    <div className="bg-canvas-grey relative flex h-full flex-col">
      <main
        className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 76px)" }}
      >
        <div className="mx-auto flex w-full max-w-md flex-col gap-3">
          {/* Conversation */}
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
            >
              <div className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} w-full`}>
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
                  {m.text}
                </div>
              </div>
              {m.role === "sakhi" && m.isLlm && (
                <div
                  className="mt-1 ml-9 flex items-center gap-1 text-[10px]"
                  style={{ color: "#9CA3AF" }}
                >
                  <span>⚠️</span>
                  <span style={{ fontFamily: "JioType, sans-serif" }}>
                    यह जवाब AI द्वारा उत्पन्न है। यह जानकारी सामान्य शिक्षा के लिए है और किसी योग्य
                    डॉक्टर की व्यक्तिगत सलाह का विकल्प नहीं है। स्वास्थ्य संबंधी कोई भी निर्णय लेने
                    से पहले अपनी डॉक्टर से अवश्य परामर्श करें।
                  </span>
                </div>
              )}
              {m.role === "sakhi" && m.video && <VideoCard video={m.video} />}
              {m.role === "sakhi" && !m.video && m.article && <ArticleCard article={m.article} />}
            </div>
          ))}

          {/* Suggested pills — shown after disclaimer, until user asks something */}
          {!messages.some((m) => m.role === "user") && (
            <div className="flex flex-wrap gap-2 px-1 pb-1">
              {SUGGESTED.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSubmit(s)}
                  className="rounded-full border px-3 py-1.5 text-left text-[12px] font-medium transition-all active:scale-95"
                  style={{
                    background: "#FDF2F4",
                    borderColor: "#F4B8C1",
                    color: "#C0415A",
                    fontFamily: "JioType, sans-serif",
                  }}
                >
                  {s}
                </button>
              ))}
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

      <HubHeader title="जाँची-परखी जानकारी" backHref="/womens-health" scrolled={false} />
      <HubChatInput variant="sleek" placeholder="सखी से पूछें..." onSubmit={handleSubmit} />
    </div>
  );
}
