"use client";

import { useState } from "react";
import { HubHeader } from "@/app/jobs/design-prototype/HubHeader";
import { HubChatInput } from "@/app/jobs/design-prototype/HubChatInput";

const SIGNS = [
  { id: "tired", label: "बहुत थकान", icon: "😴", color: "#FEF9C3", text: "#B45309" },
  { id: "breathless", label: "सांस फूलना", icon: "😮‍💨", color: "#FEE2E2", text: "#EF4444" },
  { id: "pale", label: "चेहरा पीला / नाखून सफ़ेद", icon: "🪨", color: "#F1F5F9", text: "#475569" },
  { id: "dizzy", label: "चक्कर आना", icon: "💫", color: "#EDE9FE", text: "#7C3AED" },
  { id: "headache", label: "बार-बार सिरदर्द", icon: "🤕", color: "#FCE7F3", text: "#DB2777" },
  { id: "cold", label: "हाथ-पैर ठंडे रहना", icon: "🥶", color: "#DBEAFE", text: "#2563EB" },
];

const IRON_FOODS = [
  {
    food: "पालक / मेथी",
    tip: "नींबू के साथ खाएं — iron 3x ज़्यादा absorb होगा",
    icon: "🥬",
    level: "उच्च",
  },
  { food: "मूंगफली / तिल", tip: "रोज़ एक मुट्ठी काफी है", icon: "🥜", level: "मध्यम" },
  { food: "चना / राजमा", tip: "रात भर भिगोकर पकाएं", icon: "🫘", level: "उच्च" },
  { food: "गुड़", tip: "चीनी की जगह गुड़ — और iron भी", icon: "🍫", level: "मध्यम" },
  {
    food: "आंवला / अमरूद",
    tip: "Vitamin C से iron absorption बढ़ता है",
    icon: "🍊",
    level: "Vitamin C",
  },
  { food: "अजवाइन का पानी", tip: "सुबह खाली पेट — hemoglobin बढ़ाए", icon: "🌿", level: "घरेलू" },
];

const BLOCKERS = [
  {
    item: "चाय / कॉफ़ी खाने के साथ",
    why: "Tannin iron absorption को 60% तक कम करता है",
    icon: "☕",
  },
  { item: "कैल्शियम के साथ iron", why: "दूध और iron supplements एक साथ न लें", icon: "🥛" },
  { item: "खाने के बाद तुरंत चाय", why: "खाने के 1 घंटे बाद ही चाय पिएं", icon: "⏰" },
];

export default function AnaemiaPage() {
  const [selectedSigns, setSelectedSigns] = useState<Set<string>>(new Set());
  const [showAdvice, setShowAdvice] = useState(false);

  function toggle(id: string) {
    setSelectedSigns((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="bg-canvas-grey relative flex h-full flex-col">
      <main
        className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 76px)" }}
      >
        <div className="mx-auto flex w-full max-w-md flex-col gap-5">
          {/* Stat card */}
          <div
            className="rounded-2xl p-4"
            style={{ background: "linear-gradient(135deg, #FEFCE8 0%, #FEF9C3 100%)" }}
          >
            <div className="flex items-start gap-3">
              <span className="text-[32px]">🩺</span>
              <div>
                <p
                  className="text-[22px] leading-tight font-black"
                  style={{ fontFamily: "JioType, sans-serif", color: "#92400E" }}
                >
                  57% महिलाएं
                </p>
                <p
                  className="text-[13px] font-semibold text-amber-800"
                  style={{ fontFamily: "JioType, sans-serif" }}
                >
                  भारत में खून की कमी से पीड़ित हैं
                </p>
                <p
                  className="mt-1 text-[12px] leading-relaxed text-amber-700"
                  style={{ fontFamily: "JioType, sans-serif" }}
                >
                  थकान, कमज़ोरी, सांस फूलना — यह weakness नहीं, यह <strong>Iron deficiency</strong>{" "}
                  हो सकती है। और इसका इलाज है।
                </p>
              </div>
            </div>
          </div>

          {/* Symptom checker */}
          <div className="flex flex-col gap-3 rounded-2xl bg-white p-4">
            <p
              className="text-[14px] font-bold text-zinc-800"
              style={{ fontFamily: "JioType, sans-serif" }}
            >
              क्या आप ये महसूस करती हैं?
            </p>
            <div className="grid grid-cols-2 gap-2">
              {SIGNS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggle(s.id)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-left transition-all active:scale-95"
                  style={{
                    background: selectedSigns.has(s.id) ? s.text : s.color,
                    border: `2px solid ${selectedSigns.has(s.id) ? s.text : "transparent"}`,
                  }}
                >
                  <span className="text-[18px]">{s.icon}</span>
                  <span
                    className="text-[12px] leading-tight font-semibold"
                    style={{
                      fontFamily: "JioType, sans-serif",
                      color: selectedSigns.has(s.id) ? "white" : s.text,
                    }}
                  >
                    {s.label}
                  </span>
                </button>
              ))}
            </div>

            {selectedSigns.size >= 2 && (
              <button
                type="button"
                onClick={() => setShowAdvice(true)}
                className="w-full rounded-full py-2.5 text-[13px] font-semibold text-white transition-transform active:scale-[0.97]"
                style={{
                  fontFamily: "JioType, sans-serif",
                  background: "linear-gradient(90deg, #B45309 0%, #92400E 100%)",
                }}
              >
                सखी से जानें — क्या करें?
              </button>
            )}

            {showAdvice && (
              <div className="rounded-xl p-3" style={{ background: "#FEF9C3" }}>
                <p
                  className="mb-1 text-[11px] font-bold text-amber-700"
                  style={{ fontFamily: "JioType, sans-serif" }}
                >
                  सखी कह रही हैं:
                </p>
                <p
                  className="text-[13px] leading-relaxed text-amber-900"
                  style={{ fontFamily: "JioType, sans-serif" }}
                >
                  {selectedSigns.size >= 4
                    ? "आपके कई लक्षण गंभीर एनीमिया की ओर इशारा करते हैं। कृपया CBC (Complete Blood Count) test करवाएं। Hemoglobin अगर 10 से कम है तो डॉक्टर से मिलें। इसे ignore करना खतरनाक हो सकता है। 🏥"
                    : "आपके लक्षण mild anemia की ओर इशारा कर सकते हैं। नीचे दिए iron-rich foods खाना शुरू करें, चाय खाने के साथ बंद करें, और 1 महीने में फर्क महसूस होगा। अगर सुधार न हो तो CBC test करवाएं। 💛"}
                </p>
              </div>
            )}
          </div>

          {/* Iron-rich foods */}
          <div className="flex flex-col gap-3">
            <p
              className="text-[15px] font-bold text-zinc-900"
              style={{ fontFamily: "JioType, sans-serif" }}
            >
              Iron से भरपूर देसी खाना
            </p>
            <div className="flex flex-col gap-2">
              {IRON_FOODS.map((f) => (
                <div key={f.food} className="flex items-start gap-3 rounded-xl bg-white p-3">
                  <span className="shrink-0 text-[24px]">{f.icon}</span>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[13px] font-bold text-zinc-800"
                        style={{ fontFamily: "JioType, sans-serif" }}
                      >
                        {f.food}
                      </span>
                      <span
                        className="rounded-full px-2 py-0.5 text-[9px] font-medium"
                        style={{
                          background: "#FEF9C3",
                          color: "#B45309",
                          fontFamily: "JioType, sans-serif",
                        }}
                      >
                        {f.level}
                      </span>
                    </div>
                    <span
                      className="text-[12px] leading-snug text-zinc-500"
                      style={{ fontFamily: "JioType, sans-serif" }}
                    >
                      {f.tip}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Iron blockers */}
          <div className="flex flex-col gap-3 rounded-2xl p-4" style={{ background: "#FEF2F2" }}>
            <p
              className="text-[13px] font-bold text-red-700"
              style={{ fontFamily: "JioType, sans-serif" }}
            >
              ⚠️ ये चीज़ें iron को absorb होने से रोकती हैं
            </p>
            {BLOCKERS.map((b) => (
              <div key={b.item} className="flex items-start gap-3">
                <span className="shrink-0 text-[18px]">{b.icon}</span>
                <div>
                  <p
                    className="text-[13px] font-semibold text-red-800"
                    style={{ fontFamily: "JioType, sans-serif" }}
                  >
                    {b.item}
                  </p>
                  <p
                    className="text-[12px] text-red-700"
                    style={{ fontFamily: "JioType, sans-serif" }}
                  >
                    {b.why}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Test info */}
          <div className="rounded-2xl p-4" style={{ background: "#FFF0F5" }}>
            <p
              className="mb-1 text-[12px] font-bold text-pink-700"
              style={{ fontFamily: "JioType, sans-serif" }}
            >
              💡 सखी का सुझाव
            </p>
            <p
              className="text-[13px] leading-relaxed text-zinc-700"
              style={{ fontFamily: "JioType, sans-serif" }}
            >
              साल में एक बार <strong>CBC test</strong> (₹150-300) करवाएं। Hemoglobin 12 से कम हो तो
              doctor से मिलें। Iron tablet लेने से पहले test ज़रूर करें — ज़रूरत से ज़्यादा iron भी
              नुकसानदायक है।
            </p>
          </div>
        </div>
      </main>

      <HubHeader title="खून की कमी" backHref="/womens-health" scrolled={false} />
      <HubChatInput variant="sleek" placeholder="खून की कमी के बारे में पूछें..." />
    </div>
  );
}
