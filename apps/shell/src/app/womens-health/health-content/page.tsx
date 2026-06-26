"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { HubHeader } from "@/app/jobs/design-prototype/HubHeader";
import { HubChatInput } from "@/app/jobs/design-prototype/HubChatInput";

type Message = { role: "user" | "sakhi"; text: string };

const SUGGESTED = [
  "पीरियड में बहुत दर्द — क्या यह सामान्य है?",
  "अनियमित पीरियड क्यों होते हैं?",
  "खून की कमी के लक्षण क्या हैं?",
  "थायराइड और पीरियड का क्या संबंध है?",
];

// Personal signals — first-person pronouns
const PERSONAL_WORDS = [
  "mujhe",
  "mera",
  "meri",
  "mere",
  "main",
  "मुझे",
  "मेरा",
  "मेरी",
  "मेरे",
  "मैं",
  "mujhe bhi",
  "mere saath",
  "main feel",
  "मेरे साथ",
  "मुझको",
  "महसूस",
];

// Mood words
const MOOD_WORDS = [
  "mood",
  "feel",
  "sad",
  "udaas",
  "उदास",
  "irritable",
  "chidchid",
  "चिड़चिड़",
  "anxious",
  "घबराहट",
  "gussa",
  "गुस्सा",
  "rone",
  "cry",
  "रोना",
  "tanav",
  "तनाव",
  "stress",
  "thaka",
  "थका",
  "uthne ka mann",
  "मन नहीं",
];

// Period words
const PERIOD_WORDS = [
  "cycle",
  "period",
  "mahavari",
  "माहवारी",
  "मासिक",
  "late",
  "miss",
  "irregular",
  "lmp",
  "flow",
  "bleeding",
  "spotting",
  "पीरियड",
  "अनियमित",
];

// Pain words
const PAIN_WORDS = ["dard", "दर्द", "cramp", "ऐंठन", "taklif", "तकलीफ", "period pain"];

// Clarification signals
const CLARIFICATION_WORDS = [
  "kya hai",
  "क्या है",
  "matlab",
  "मतलब",
  "kaise hota",
  "कैसे होता",
  "difference",
  "अंतर",
  "explain",
  "samjhao",
  "समझाओ",
  "iska matlab",
  "yeh kya",
  "यह क्या",
  "what is",
  "how does",
  "kyun hota",
  "kya fark",
  "kya hota hai",
  "बताओ",
];

function containsAny(text: string, words: string[]): boolean {
  const lower = text.toLowerCase();
  return words.some((w) => lower.includes(w.toLowerCase()));
}

type Outcome = "personal" | "clarification" | "ambiguous";

function classify(query: string): Outcome {
  const isPersonal = containsAny(query, PERSONAL_WORDS);
  const isClarification = containsAny(query, CLARIFICATION_WORDS);
  if (isPersonal) return "personal";
  if (isClarification) return "clarification";
  return "ambiguous";
}

function subRoute(query: string): { path: string; params: Record<string, string> } {
  const params: Record<string, string> = { from: "content", query: encodeURIComponent(query) };
  if (containsAny(query, PAIN_WORDS)) {
    return { path: "/womens-health/low-mood", params: { ...params, pain: "1" } };
  }
  if (containsAny(query, PERIOD_WORDS)) {
    return { path: "/womens-health/period-tracker", params };
  }
  if (containsAny(query, MOOD_WORDS)) {
    return { path: "/womens-health/low-mood", params };
  }
  return { path: "/womens-health/low-mood", params };
}

export default function HealthContentPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [ambiguousPending, setAmbiguousPending] = useState<{ query: string } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  function routePersonal(query: string) {
    const { path, params } = subRoute(query);
    const qs = new URLSearchParams(params).toString();
    router.push(`${path}?${qs}`);
  }

  async function callSakhi(query: string) {
    setMessages((prev) => [...prev, { role: "user", text: query }]);
    setLoading(true);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    try {
      const res = await fetch("/api/sakhi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: query }),
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

  function handleSubmit(question: string) {
    if (!question.trim() || loading) return;
    const q = question.trim();
    setAmbiguousPending(null);
    const outcome = classify(q);
    if (outcome === "personal") {
      routePersonal(q);
    } else if (outcome === "clarification") {
      callSakhi(q);
    } else {
      // ambiguous
      setAmbiguousPending({ query: q });
    }
  }

  return (
    <div className="bg-canvas-grey relative flex h-full flex-col">
      <main
        className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 76px)" }}
      >
        <div className="mx-auto flex w-full max-w-md flex-col gap-3">
          {/* Suggested chips — shown before first message */}
          {messages.length === 0 && !ambiguousPending && (
            <div className="flex flex-wrap gap-2 pt-2">
              {SUGGESTED.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSubmit(s)}
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

          {/* Ambiguous routing card */}
          {ambiguousPending && (
            <div
              className="flex items-start gap-3 rounded-2xl p-4"
              style={{ background: "#F9FAFB", border: "1px solid #EDE9FE" }}
            >
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[14px]"
                style={{ background: "#F0FDF4" }}
              >
                ✅
              </div>
              <div className="flex flex-1 flex-col gap-3">
                <p
                  className="text-[13px] leading-relaxed text-zinc-800"
                  style={{ fontFamily: "JioType, sans-serif" }}
                >
                  क्या यह सवाल आप अपने बारे में पूछ रही हैं?
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const q = ambiguousPending.query;
                      setAmbiguousPending(null);
                      routePersonal(q);
                    }}
                    className="flex-1 rounded-full py-2 text-[12px] font-semibold text-white transition-all active:scale-95"
                    style={{ background: "#6d17ce", fontFamily: "JioType, sans-serif" }}
                  >
                    हाँ, अपने बारे में
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const q = ambiguousPending.query;
                      setAmbiguousPending(null);
                      callSakhi(q);
                    }}
                    className="flex-1 rounded-full py-2 text-[12px] font-semibold transition-all active:scale-95"
                    style={{
                      background: "#EDE9FE",
                      color: "#6d17ce",
                      fontFamily: "JioType, sans-serif",
                    }}
                  >
                    नहीं, जानकारी चाहिए
                  </button>
                </div>
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
