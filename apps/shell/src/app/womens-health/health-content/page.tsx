"use client";

import { useRef, useState } from "react";
import { HubHeader } from "@/app/jobs/design-prototype/HubHeader";
import { HubChatInput } from "@/app/jobs/design-prototype/HubChatInput";

type Message = { role: "user" | "sakhi"; text: string };

const SUGGESTED = [
  "पीरियड में बहुत दर्द — क्या यह सामान्य है?",
  "अनियमित पीरियड क्यों होते हैं?",
  "खून की कमी के लक्षण क्या हैं?",
  "थायराइड और पीरियड का क्या संबंध है?",
];

export default function HealthContentPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function ask(question: string) {
    if (!question.trim() || loading) return;
    const q = question.trim();
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
    <div className="bg-canvas-grey relative flex h-full flex-col">
      {/* Messages area */}
      <main
        className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 76px)" }}
      >
        <div className="mx-auto flex w-full max-w-md flex-col gap-3">
          {/* Suggested chips — shown before first message */}
          {messages.length === 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {SUGGESTED.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => ask(s)}
                  className="rounded-full px-3 py-2 text-left text-[12px] font-medium text-zinc-600 transition-all active:scale-95"
                  style={{ background: "#F3F4F6", fontFamily: "JioType, sans-serif" }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Conversation */}
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
          ))}

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
      <HubChatInput variant="sleek" placeholder="सखी से पूछें..." onSubmit={ask} />
    </div>
  );
}
