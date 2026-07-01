"use client";

import { useRef, useState } from "react";
import { HubHeader } from "@/app/jobs/design-prototype/HubHeader";
import { HubChatInput } from "@/app/jobs/design-prototype/HubChatInput";

const MOODS = [
  { emoji: "😊", label: "अच्छा", color: "#D1FAE5", text: "#059669" },
  { emoji: "😐", label: "ठीक-ठाक", color: "#FEF3C7", text: "#D97706" },
  { emoji: "😔", label: "उदास", color: "#EDE9FE", text: "#7C3AED" },
  { emoji: "😤", label: "चिड़चिड़ा", color: "#FEE2E2", text: "#EF4444" },
  { emoji: "😰", label: "घबराहट", color: "#DBEAFE", text: "#2563EB" },
  { emoji: "😭", label: "रोना आ रहा", color: "#FCE7F3", text: "#DB2777" },
];

const MOOD_REPLIES: Record<string, string> = {
  अच्छा:
    "यह सुनकर अच्छा लगा! 💚 अपने अच्छे दिनों को याद रखें — ये वापस आते हैं। क्या आज कुछ खास हुआ?",
  "ठीक-ठाक":
    "ठीक-ठाक भी एक जवाब है। 💛 कभी-कभी हम बीच में होते हैं। क्या कोई बात मन में चल रही है?",
  उदास: "उदासी को महसूस करना ज़रूरी है — इसे दबाएं नहीं। 💜 यह हॉर्मोन का उतार-चढ़ाव भी हो सकता है। बताइए — क्या हुआ?",
  चिड़चिड़ा:
    "चिड़चिड़ापन अक्सर पीरियड से पहले Progesterone के कारण होता है — यह आपकी गलती नहीं। 💜 क्या पीरियड आने वाले हैं?",
  घबराहट:
    "घबराहट बहुत थका देती है। 💙 गहरी साँस लें — 4 गिनती में अंदर, 4 में बाहर। क्या कोई खास चिंता है?",
  "रोना आ रहा":
    "रोना कमज़ोरी नहीं — यह भावनाओं का बहना है। 🌸 रो लें। फिर बताइए — मैं सुन रही हूँ।",
};

const MOOD_REPLIES_OTHER: Record<string, string> = {
  अच्छा: "यह जानकर अच्छा लगा! 💚 उनके लिए ऐसा माहौल बनाएं जहाँ वे अपनी भावनाएं share कर सकें।",
  "ठीक-ठाक":
    "कभी-कभी 'ठीक हूँ' का मतलब 'बस चल रहा है' होता है। 💛 उनसे धीरे से पूछें — क्या कुछ चाहिए?",
  उदास: "उदास इंसान को सबसे पहले सुनने की ज़रूरत होती है — fix करने की नहीं। 💜 उनके साथ बैठें।",
  चिड़चिड़ा: "हॉर्मोनल बदलाव से चिड़चिड़ापन आम है — उन्हें judge न करें। 💜 थोड़ी space दें।",
  घबराहट: "उनकी घबराहट को dismiss न करें। 💙 शांत रहें, सुनें, और ज़रूरत पड़े तो साथ जाएं।",
  "रोना आ रहा": "रोने दें — यह ज़रूरी है। 🌸 पास रहें, सुनें, कुछ fix करने की कोशिश न करें।",
};

type ForWhom = "self" | "other" | null;

type MessageKind =
  | { type: "text"; role: "user" | "sakhi"; text: string }
  | { type: "forWhomPicker" }
  | { type: "moodPicker"; forWhom: ForWhom };

function ForWhomCard({ onPick }: { onPick: (v: ForWhom) => void }) {
  return (
    <div className="mt-2 flex gap-2">
      <button
        type="button"
        onClick={() => onPick("self")}
        className="flex-1 rounded-full py-2.5 text-[13px] font-semibold text-white transition-all active:scale-95"
        style={{ background: "#6d17ce", fontFamily: "JioType, sans-serif" }}
      >
        मेरे लिए
      </button>
      <button
        type="button"
        onClick={() => onPick("other")}
        className="flex-1 rounded-full py-2.5 text-[13px] font-semibold transition-all active:scale-95"
        style={{ background: "#EDE9FE", color: "#6d17ce", fontFamily: "JioType, sans-serif" }}
      >
        किसी और के लिए
      </button>
    </div>
  );
}

function MoodPickerCard({ onPick }: { onPick: (mood: string) => void }) {
  return (
    <div className="mt-2 grid grid-cols-3 gap-2">
      {MOODS.map((m) => (
        <button
          key={m.label}
          type="button"
          onClick={() => onPick(m.label)}
          className="flex flex-col items-center gap-1 rounded-xl py-3 transition-all active:scale-95"
          style={{ background: m.color }}
        >
          <span className="text-[22px]">{m.emoji}</span>
          <span
            className="text-[11px] font-medium"
            style={{ fontFamily: "JioType, sans-serif", color: m.text }}
          >
            {m.label}
          </span>
        </button>
      ))}
    </div>
  );
}

export default function LowMoodPage() {
  const [forWhom, setForWhom] = useState<ForWhom>(null);
  const [messages, setMessages] = useState<MessageKind[]>([
    {
      type: "text",
      role: "sakhi",
      text: "नमस्ते! 💜 मैं सखी हूँ — आपकी AI सहेली। पहले बताइए —",
    },
    { type: "forWhomPicker" },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scroll = () =>
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);

  function handleForWhom(v: ForWhom) {
    setForWhom(v);
    const userText = v === "self" ? "मेरे लिए" : "किसी और के लिए";
    const sakhiText =
      v === "self"
        ? "समझ गई। 💜 आज आप कैसा महसूस कर रही हैं?"
        : "समझ गई। उनके लिए मैं मदद करूँगी। वे अभी कैसा महसूस कर रहे/रही हैं?";
    setMessages((prev) => [
      ...prev.filter((m) => m.type !== "forWhomPicker"),
      { type: "text", role: "user", text: userText },
      { type: "text", role: "sakhi", text: sakhiText },
      { type: "moodPicker", forWhom: v },
    ]);
    scroll();
  }

  function handleMoodPick(mood: string) {
    const replies = forWhom === "other" ? MOOD_REPLIES_OTHER : MOOD_REPLIES;
    setMessages((prev) => [
      ...prev.filter((m) => m.type !== "moodPicker"),
      { type: "text", role: "user", text: mood },
      { type: "text", role: "sakhi", text: replies[mood] ?? "मैं समझती हूँ। 💜 और बताइए।" },
    ]);
    scroll();
  }

  function handleSubmit(text: string) {
    if (!text.trim()) return;
    setMessages((prev) => [
      ...prev.filter((m) => m.type !== "forWhomPicker" && m.type !== "moodPicker"),
      { type: "text", role: "user", text: text.trim() },
      {
        type: "text",
        role: "sakhi",
        text: "आपकी बात सुन रही हूँ। 💜 यह महसूस करना बिल्कुल सामान्य है। अपना ख्याल रखें — पर्याप्त पानी पिएं, हल्का व्यायाम करें, और ज़रूरत पड़े तो किसी से बात करें।",
      },
    ]);
    scroll();
  }

  return (
    <div className="bg-canvas-grey relative flex h-full flex-col">
      <HubHeader title="मूड ट्रैकर" backHref="/womens-health" scrolled={false} />
      <main
        className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 76px)" }}
      >
        <div className="mx-auto flex w-full max-w-md flex-col gap-3">
          {messages.map((m, i) => {
            if (m.type === "forWhomPicker") {
              return (
                <div key={i} className="flex items-start gap-2">
                  <div
                    className="mr-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px]"
                    style={{ background: "#F5F3FF" }}
                  >
                    💜
                  </div>
                  <div
                    className="max-w-[88%] min-w-0 rounded-2xl rounded-tl-sm px-3 py-2.5"
                    style={{ background: "#F9FAFB", border: "1px solid #EDE9FE" }}
                  >
                    <p
                      className="mb-0.5 text-[13px] text-zinc-700"
                      style={{ fontFamily: "JioType, sans-serif" }}
                    >
                      क्या यह आपके लिए है या किसी और के लिए?
                    </p>
                    <ForWhomCard onPick={handleForWhom} />
                  </div>
                </div>
              );
            }
            if (m.type === "moodPicker") {
              return (
                <div key={i} className="flex items-start gap-2">
                  <div
                    className="mr-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px]"
                    style={{ background: "#F5F3FF" }}
                  >
                    💜
                  </div>
                  <div
                    className="max-w-[88%] min-w-0 rounded-2xl rounded-tl-sm px-3 py-2.5"
                    style={{ background: "#F9FAFB", border: "1px solid #EDE9FE" }}
                  >
                    <MoodPickerCard onPick={handleMoodPick} />
                  </div>
                </div>
              );
            }
            return (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} w-full`}
              >
                {m.role === "sakhi" && (
                  <div
                    className="mr-2 flex h-7 w-7 shrink-0 items-center justify-center self-end rounded-full text-[12px]"
                    style={{ background: "#F5F3FF" }}
                  >
                    💜
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
            );
          })}
          <div ref={bottomRef} />
        </div>
      </main>
      <HubChatInput
        variant="sleek"
        placeholder="मन की बात सखी को बताएं..."
        onSubmit={handleSubmit}
      />
    </div>
  );
}
