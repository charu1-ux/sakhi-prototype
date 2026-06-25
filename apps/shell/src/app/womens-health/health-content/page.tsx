"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { HubHeader } from "@/app/jobs/design-prototype/HubHeader";
import { HubChatInput } from "@/app/jobs/design-prototype/HubChatInput";

// ─── Types ────────────────────────────────────────────────────────────────────

type Message = { role: "user" | "sakhi"; text: string };

// ─── Topic tiles ──────────────────────────────────────────────────────────────

const TOPICS = [
  {
    icon: "🔄",
    label: "अनियमित पीरियड / हॉर्मोन",
    desc: "अनियमित पीरियड, वजन बढ़ना, चेहरे पर बाल",
    bg: "#F0FDF4",
    href: "/womens-health/pcos",
  },
  {
    icon: "💊",
    label: "पीरियड दर्द",
    desc: "दर्द कितना सामान्य है? गर्भाशय की समस्याएं",
    bg: "#FFFBEB",
    href: "/womens-health/period-pain",
  },
  {
    icon: "🩺",
    label: "खून की कमी",
    desc: "57% महिलाओं को — लक्षण, आयरन युक्त भोजन, जाँच",
    bg: "#FEFCE8",
    href: "/womens-health/anaemia",
  },
  {
    icon: "🌡️",
    label: "रजोनिवृत्ति",
    desc: "35-55 की उम्र में हॉर्मोन बदलाव — लक्षण और देखभाल",
    bg: "#F9FAFB",
    href: null,
  },
  {
    icon: "🤱",
    label: "प्रसव के बाद",
    desc: "बच्चे के बाद मन भारी क्यों? देखभाल और सहायता",
    bg: "#F9FAFB",
    href: null,
  },
  {
    icon: "🛡️",
    label: "यौन स्वास्थ्य",
    desc: "गर्भनिरोधक, दर्द, संक्रमण — बिना झिझक के पूछें",
    bg: "#F9FAFB",
    href: null,
  },
];

const SUGGESTED = [
  "पीरियड में बहुत दर्द — क्या यह सामान्य है?",
  "अनियमित पीरियड क्यों होते हैं?",
  "खून की कमी के लक्षण क्या हैं?",
  "थायराइड और पीरियड का क्या संबंध है?",
];

// ─── Chat component ────────────────────────────────────────────────────────────

function SakhiChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function ask(question: string) {
    if (!question.trim() || loading) return;
    const q = question.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setLoading(true);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);

    try {
      const res = await fetch("/api/sakhi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "sakhi", text: data.answer || data.error || "सखी अभी उपलब्ध नहीं है।" },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "sakhi", text: "नेटवर्क में समस्या है। कृपया पुनः प्रयास करें।" },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }

  return (
    <div
      className="flex flex-col gap-3 rounded-2xl bg-white p-4"
      style={{ border: "1px solid #F3F4F6" }}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full text-[16px]"
          style={{ background: "#F0FDF4" }}
        >
          ✅
        </div>
        <div>
          <p
            className="text-[13px] font-bold text-zinc-900"
            style={{ fontFamily: "JioType, sans-serif" }}
          >
            सखी से पूछें
          </p>
          <p className="text-[10px] text-zinc-400" style={{ fontFamily: "JioType, sans-serif" }}>
            WHO · FOGSI · ICMR — सत्यापित जानकारी
          </p>
        </div>
      </div>

      {/* Suggested questions — shown only before first message */}
      {messages.length === 0 && (
        <div className="flex flex-wrap gap-2">
          {SUGGESTED.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => ask(s)}
              className="rounded-full px-3 py-1.5 text-left text-[11px] font-medium text-zinc-600 transition-all active:scale-95"
              style={{ background: "#F3F4F6", fontFamily: "JioType, sans-serif" }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      {messages.length > 0 && (
        <div className="flex max-h-72 flex-col gap-3 overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role === "sakhi" && (
                <div
                  className="mr-2 flex h-7 w-7 shrink-0 items-center justify-center self-end rounded-full text-[12px]"
                  style={{ background: "#F0FDF4" }}
                >
                  ✅
                </div>
              )}
              <div
                className="max-w-[82%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed"
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
          ))}
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
      )}

      {/* Input */}
      <div
        className="flex items-center gap-2 rounded-xl px-3 py-2"
        style={{ background: "#F9FAFB", border: "1px solid #E5E7EB" }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask(input)}
          placeholder="अपना सवाल लिखें..."
          className="flex-1 border-none bg-transparent text-[13px] outline-none placeholder:text-zinc-300"
          style={{ fontFamily: "JioType, sans-serif", color: "#111827" }}
        />
        <button
          type="button"
          onClick={() => ask(input)}
          disabled={!input.trim() || loading}
          className="flex h-7 w-7 items-center justify-center rounded-full text-[14px] text-white transition-all active:scale-95 disabled:opacity-40"
          style={{ background: "#6d17ce" }}
        >
          ↑
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HealthContentPage() {
  const router = useRouter();

  return (
    <div className="bg-canvas-grey relative flex h-full flex-col">
      <main
        className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 76px)" }}
      >
        <div className="mx-auto flex w-full max-w-md flex-col gap-5">
          {/* Trust badge */}
          <div
            className="flex items-center gap-3 rounded-2xl bg-white p-3.5"
            style={{ border: "1px solid #F3F4F6" }}
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[20px]"
              style={{ background: "#F0FDF4" }}
            >
              ✅
            </div>
            <div>
              <p
                className="text-[13px] font-bold text-zinc-900"
                style={{ fontFamily: "JioType, sans-serif" }}
              >
                जाँची-परखी जानकारी
              </p>
              <p
                className="text-[11px] text-zinc-500"
                style={{ fontFamily: "JioType, sans-serif" }}
              >
                WHO · FOGSI · ICMR · ACOG द्वारा सत्यापित
              </p>
            </div>
          </div>

          {/* Live Sakhi chat */}
          <SakhiChat />

          {/* Topic cards */}
          <div className="flex flex-col gap-3">
            <p
              className="text-[15px] font-bold text-zinc-900"
              style={{ fontFamily: "JioType, sans-serif" }}
            >
              विषय चुनें
            </p>
            <div className="flex flex-col gap-2">
              {TOPICS.map((t) => (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => t.href && router.push(t.href)}
                  className="flex items-center gap-3 rounded-xl p-3 text-left transition-opacity active:opacity-70"
                  style={{ background: t.bg, opacity: t.href ? 1 : 0.5 }}
                >
                  <span className="shrink-0 text-[24px]">{t.icon}</span>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span
                      className="text-[13px] font-semibold text-zinc-800"
                      style={{ fontFamily: "JioType, sans-serif" }}
                    >
                      {t.label}
                    </span>
                    <span
                      className="text-[11px] leading-snug text-zinc-500"
                      style={{ fontFamily: "JioType, sans-serif" }}
                    >
                      {t.desc}
                    </span>
                  </div>
                  {t.href && <span className="shrink-0 text-zinc-300">›</span>}
                  {!t.href && (
                    <span
                      className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold"
                      style={{
                        background: "#F3F4F6",
                        color: "#9CA3AF",
                        fontFamily: "JioType, sans-serif",
                      }}
                    >
                      जल्द आएगा
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div
            className="rounded-xl p-3"
            style={{ background: "#F9FAFB", border: "1px solid #F3F4F6" }}
          >
            <p
              className="text-[11px] leading-relaxed text-zinc-400"
              style={{ fontFamily: "JioType, sans-serif" }}
            >
              ⚠️ यह जानकारी केवल शैक्षिक उद्देश्य के लिए है। यह चिकित्सकीय सलाह नहीं है। कोई भी
              निर्णय लेने से पहले अपने डॉक्टर से अवश्य मिलें।
            </p>
          </div>
        </div>
      </main>

      <HubHeader title="जाँची-परखी जानकारी" backHref="/womens-health" scrolled={false} />
      <HubChatInput variant="sleek" placeholder="सखी से पूछें..." />
    </div>
  );
}
