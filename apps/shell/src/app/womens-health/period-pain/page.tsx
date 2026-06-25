"use client";

import { useState } from "react";
import { HubHeader } from "@/app/jobs/design-prototype/HubHeader";
import { HubChatInput } from "@/app/jobs/design-prototype/HubChatInput";

const PAIN_LEVELS = [
  { level: 1, label: "हल्का", emoji: "😌", color: "#D1FAE5", text: "#059669" },
  { level: 2, label: "मध्यम", emoji: "😣", color: "#FEF3C7", text: "#D97706" },
  { level: 3, label: "तेज़", emoji: "😖", color: "#FEE2E2", text: "#EF4444" },
  { level: 4, label: "असहनीय", emoji: "😭", color: "#FCE7F3", text: "#DB2777" },
];

const REMEDIES = [
  {
    icon: "🌡️",
    title: "गर्म सिकाई",
    desc: "पेट पर हॉट वॉटर बैग रखें — 15-20 मिनट",
    tag: "तुरंत राहत",
  },
  {
    icon: "🫖",
    title: "अदरक की चाय",
    desc: "अदरक + तुलसी + गुड़ — सूजन और दर्द कम करे",
    tag: "घरेलू नुस्खा",
  },
  { icon: "🧘", title: "Child Pose", desc: "बालासन — पीठ और पेट का दर्द कम करे", tag: "योग" },
  {
    icon: "💊",
    title: "Ibuprofen / Meftal",
    desc: "डॉक्टर की सलाह से — पीरियड शुरू होते ही लें",
    tag: "दवाई",
  },
  {
    icon: "🚶",
    title: "हल्की सैर",
    desc: "10-15 मिनट की वॉक — एंडोर्फिन बढ़ाए",
    tag: "एक्सरसाइज़",
  },
  {
    icon: "🛁",
    title: "गर्म पानी से नहाएं",
    desc: "मसल्स रिलैक्स होती हैं, दर्द घटता है",
    tag: "आराम",
  },
];

const WARNING_SIGNS = [
  "पीरियड 7 दिन से ज़्यादा चले",
  "दर्द इतना हो कि काम न हो",
  "बहुत ज़्यादा ब्लीडिंग (हर घंटे पैड बदलना)",
  "बुखार के साथ दर्द",
  "पीरियड के बाहर भी दर्द",
];

export default function PeriodPainPage() {
  const [painLevel, setPainLevel] = useState<number | null>(null);
  const [chatText, setChatText] = useState("");
  const [didiResponse, setDidiResponse] = useState<string | null>(null);

  const RESPONSES: Record<number, string> = {
    1: "हल्का दर्द सामान्य है। गर्म चाय पिएं, आराम करें। 🌸",
    2: "मध्यम दर्द है — गर्म सिकाई और अदरक की चाय ज़रूर आज़माएं। अगर 2-3 दिन से ज़्यादा हो तो बताएं।",
    3: "तेज़ दर्द है। कृपया Meftal-Spas या Ibuprofen लें (डॉक्टर की सलाह से)। आराम ज़रूरी है। 💊",
    4: "इतना तेज़ दर्द ठीक नहीं है। यह Endometriosis या PCOS हो सकता है। कृपया डॉक्टर से मिलें। 🏥",
  };

  return (
    <div className="bg-canvas-grey relative flex h-full flex-col">
      <main
        className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 76px)" }}
      >
        <div className="mx-auto flex w-full max-w-md flex-col gap-5">
          {/* Pain level selector */}
          <div className="flex flex-col gap-3 rounded-2xl bg-white p-4">
            <p
              className="text-[14px] font-bold text-zinc-800"
              style={{ fontFamily: "JioType, sans-serif" }}
            >
              💊 दर्द कितना है?
            </p>
            <div className="grid grid-cols-2 gap-2">
              {PAIN_LEVELS.map((p) => (
                <button
                  key={p.level}
                  type="button"
                  onClick={() => {
                    setPainLevel(p.level);
                    setDidiResponse(RESPONSES[p.level]);
                  }}
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 transition-all active:scale-95"
                  style={{
                    background: painLevel === p.level ? p.text : p.color,
                    border: `2px solid ${painLevel === p.level ? p.text : "transparent"}`,
                  }}
                >
                  <span className="text-[20px]">{p.emoji}</span>
                  <span
                    className="text-[13px] font-semibold"
                    style={{
                      fontFamily: "JioType, sans-serif",
                      color: painLevel === p.level ? "white" : p.text,
                    }}
                  >
                    {p.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Didi response */}
            {didiResponse && (
              <div className="mt-1 rounded-xl p-3" style={{ background: "#FFF0F5" }}>
                <p
                  className="mb-1 text-[12px] font-bold text-pink-700"
                  style={{ fontFamily: "JioType, sans-serif" }}
                >
                  सखी कह रही हैं:
                </p>
                <p
                  className="text-[13px] leading-relaxed text-zinc-700"
                  style={{ fontFamily: "JioType, sans-serif" }}
                >
                  {didiResponse}
                </p>
              </div>
            )}
          </div>

          {/* Remedies */}
          <div className="flex flex-col gap-3">
            <p
              className="text-[15px] font-bold text-zinc-900"
              style={{ fontFamily: "JioType, sans-serif" }}
            >
              दर्द से राहत के उपाय
            </p>
            <div className="flex flex-col gap-2">
              {REMEDIES.map((r) => (
                <div key={r.title} className="flex items-start gap-3 rounded-xl bg-white p-3">
                  <span className="shrink-0 text-[24px]">{r.icon}</span>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[13px] font-bold text-zinc-800"
                        style={{ fontFamily: "JioType, sans-serif" }}
                      >
                        {r.title}
                      </span>
                      <span
                        className="rounded-full px-2 py-0.5 text-[9px] font-medium"
                        style={{
                          background: "#FCE4EC",
                          color: "#C2185B",
                          fontFamily: "JioType, sans-serif",
                        }}
                      >
                        {r.tag}
                      </span>
                    </div>
                    <span
                      className="text-[12px] leading-snug text-zinc-500"
                      style={{ fontFamily: "JioType, sans-serif" }}
                    >
                      {r.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Warning signs */}
          <div className="rounded-2xl p-4" style={{ background: "#FEF3C7" }}>
            <p
              className="mb-2 text-[13px] font-bold text-amber-700"
              style={{ fontFamily: "JioType, sans-serif" }}
            >
              ⚠️ डॉक्टर के पास कब जाएं?
            </p>
            <ul className="flex flex-col gap-1.5">
              {WARNING_SIGNS.map((w) => (
                <li
                  key={w}
                  className="flex items-start gap-2 text-[12px] text-amber-800"
                  style={{ fontFamily: "JioType, sans-serif" }}
                >
                  <span className="mt-0.5 shrink-0">•</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>

      <HubHeader title="पीरियड दर्द" backHref="/womens-health" scrolled={false} />
      <HubChatInput variant="sleek" placeholder="दर्द के बारे में पूछें..." />
    </div>
  );
}
