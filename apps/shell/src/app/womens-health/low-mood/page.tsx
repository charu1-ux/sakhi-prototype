"use client";

import { useState } from "react";
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

const TIPS = [
  { icon: "🌞", title: "धूप में बैठें", desc: "विटामिन D और सेरोटोनिन बढ़ाए — 15 मिनट काफी है" },
  { icon: "🎵", title: "पसंदीदा गाना सुनें", desc: "दिमाग को डोपामिन मिलेगा, मूड लिफ्ट होगा" },
  { icon: "📔", title: "डायरी लिखें", desc: "मन की बात लिखने से हल्का महसूस होता है" },
  { icon: "🤗", title: "किसी से बात करें", desc: "दोस्त, मम्मी, या दीदी — सुनने वाला ज़रूरी है" },
  { icon: "🧘", title: "5 मिनट की सांस", desc: "4 सेकंड साँस लें, 4 रोकें, 4 में छोड़ें" },
  { icon: "🍫", title: "थोड़ी डार्क चॉकलेट", desc: "सच में! एंडोर्फिन बढ़ाती है। थोड़ी सी खाएं" },
];

const AFFIRMATIONS = [
  "आपकी भावनाएं सच्ची हैं और ये ठीक है।",
  "हॉर्मोन बदलते हैं — यह आपकी कमज़ोरी नहीं है।",
  "आप अकेली नहीं हैं। करोड़ों महिलाएं यही महसूस करती हैं।",
  "यह दौर गुज़र जाएगा। आप मज़बूत हैं। 🌸",
];

export default function LowMoodPage() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [affirmIdx, setAffirmIdx] = useState(0);

  return (
    <div className="bg-canvas-grey relative flex h-full flex-col">
      <main
        className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 76px)" }}
      >
        <div className="mx-auto flex w-full max-w-md flex-col gap-5">
          {/* Affirmation card */}
          <div
            className="flex flex-col gap-3 rounded-2xl p-4"
            style={{ background: "linear-gradient(135deg, #fff0f5 0%, #fce4ec 100%)" }}
          >
            <p
              className="text-[13px] font-bold text-pink-700"
              style={{ fontFamily: "JioType, sans-serif" }}
            >
              💜 दीदी आपसे कहना चाहती हैं...
            </p>
            <p
              className="text-[15px] leading-relaxed font-semibold text-zinc-800"
              style={{ fontFamily: "JioType, sans-serif" }}
            >
              "{AFFIRMATIONS[affirmIdx]}"
            </p>
            <button
              type="button"
              onClick={() => setAffirmIdx((i) => (i + 1) % AFFIRMATIONS.length)}
              className="self-start rounded-full px-3 py-1.5 text-[12px] font-medium transition-all active:scale-95"
              style={{ fontFamily: "JioType, sans-serif", background: "#FCE4EC", color: "#C2185B" }}
            >
              अगला →
            </button>
          </div>

          {/* Mood check-in */}
          <div className="flex flex-col gap-3 rounded-2xl bg-white p-4">
            <p
              className="text-[14px] font-bold text-zinc-800"
              style={{ fontFamily: "JioType, sans-serif" }}
            >
              अभी कैसा महसूस हो रहा है?
            </p>
            <div className="grid grid-cols-3 gap-2">
              {MOODS.map((m) => (
                <button
                  key={m.label}
                  type="button"
                  onClick={() => setSelectedMood(m.label)}
                  className="flex flex-col items-center gap-1 rounded-xl py-3 transition-all active:scale-95"
                  style={{
                    background: selectedMood === m.label ? m.text : m.color,
                  }}
                >
                  <span className="text-[22px]">{m.emoji}</span>
                  <span
                    className="text-[11px] font-medium"
                    style={{
                      fontFamily: "JioType, sans-serif",
                      color: selectedMood === m.label ? "white" : m.text,
                    }}
                  >
                    {m.label}
                  </span>
                </button>
              ))}
            </div>
            {selectedMood && (
              <div className="rounded-xl p-3" style={{ background: "#FFF0F5" }}>
                <p
                  className="text-[13px] leading-relaxed text-zinc-700"
                  style={{ fontFamily: "JioType, sans-serif" }}
                >
                  आपने "{selectedMood}" चुना। 💜 यह महसूस करना बिल्कुल सामान्य है। नीचे कुछ सुझाव
                  देखें जो मदद कर सकते हैं।
                </p>
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="flex flex-col gap-3">
            <p
              className="text-[15px] font-bold text-zinc-900"
              style={{ fontFamily: "JioType, sans-serif" }}
            >
              मूड बेहतर करने के तरीके
            </p>
            <div className="flex flex-col gap-2">
              {TIPS.map((t) => (
                <div key={t.title} className="flex items-start gap-3 rounded-xl bg-white p-3">
                  <span className="shrink-0 text-[24px]">{t.icon}</span>
                  <div className="flex flex-col gap-0.5">
                    <span
                      className="text-[13px] font-bold text-zinc-800"
                      style={{ fontFamily: "JioType, sans-serif" }}
                    >
                      {t.title}
                    </span>
                    <span
                      className="text-[12px] leading-snug text-zinc-500"
                      style={{ fontFamily: "JioType, sans-serif" }}
                    >
                      {t.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PMS note */}
          <div className="rounded-2xl p-4" style={{ background: "#EDE9FE" }}>
            <p
              className="mb-2 text-[13px] font-bold text-purple-700"
              style={{ fontFamily: "JioType, sans-serif" }}
            >
              💜 PMS के बारे में जानें
            </p>
            <p
              className="text-[13px] leading-relaxed text-purple-900"
              style={{ fontFamily: "JioType, sans-serif" }}
            >
              पीरियड से 1-2 हफ्ते पहले मूड खराब होना, रोना आना, चिड़चिड़ापन — यह{" "}
              <strong>PMS</strong> है। यह Progesterone और Estrogen के बदलाव से होता है। आप इसे
              कंट्रोल नहीं कर सकतीं — यह आपकी गलती नहीं है।
            </p>
          </div>
        </div>
      </main>

      <HubHeader title="मूड खराब" backHref="/womens-health" scrolled={false} />
      <HubChatInput variant="sleek" placeholder="मन की बात दीदी को बताएं..." />
    </div>
  );
}
