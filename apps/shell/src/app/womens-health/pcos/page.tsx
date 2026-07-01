"use client";

import { useState } from "react";
import { HubHeader } from "@/app/jobs/design-prototype/HubHeader";
import { HubChatInput } from "@/app/jobs/design-prototype/HubChatInput";

const SYMPTOMS = [
  { id: "irregular", label: "अनियमित पीरियड", icon: "📅", color: "#FEE2E2", text: "#EF4444" },
  { id: "weight", label: "वजन बढ़ना", icon: "⚖️", color: "#FEF3C7", text: "#D97706" },
  { id: "hair", label: "चेहरे पर बाल", icon: "🪮", color: "#EDE9FE", text: "#7C3AED" },
  { id: "acne", label: "मुहांसे / पिम्पल", icon: "😣", color: "#FCE7F3", text: "#DB2777" },
  { id: "hairloss", label: "बाल झड़ना", icon: "💆", color: "#D1FAE5", text: "#059669" },
  { id: "fatigue", label: "बहुत थकान", icon: "😴", color: "#DBEAFE", text: "#2563EB" },
];

const MYTHS = [
  {
    myth: "PCOS होने पर बच्चा नहीं हो सकता",
    fact: "PCOS से प्रेगनेंसी मुश्किल हो सकती है, लेकिन असंभव नहीं। सही इलाज से अधिकतर महिलाएं माँ बनती हैं।",
  },
  {
    myth: "यह सिर्फ 'मोटी' महिलाओं को होता है",
    fact: "PCOS किसी भी वजन की महिला को हो सकता है। 30% PCOS पेशेंट का वजन सामान्य होता है।",
  },
  {
    myth: "पीरियड आ रहा है तो PCOS नहीं होगा",
    fact: "PCOS के साथ भी पीरियड आ सकता है — बस अनियमित या बहुत कम/ज़्यादा हो सकता है।",
  },
];

const ACTIONS_LIST = [
  {
    icon: "🥗",
    title: "Low-GI खाना खाएं",
    desc: "चावल कम, दाल-सब्ज़ी ज़्यादा — इंसुलिन कंट्रोल होगा",
    tag: "खानपान",
    tagColor: "#D1FAE5",
    tagText: "#059669",
  },
  {
    icon: "🚶",
    title: "30 मिनट रोज़ चलें",
    desc: "सिर्फ तेज़ चलना भी हॉर्मोन बैलेंस करता है",
    tag: "एक्सरसाइज़",
    tagColor: "#DBEAFE",
    tagText: "#2563EB",
  },
  {
    icon: "😴",
    title: "नींद पूरी करें",
    desc: "7-8 घंटे की नींद cortisol कम करती है — PCOS में ज़रूरी",
    tag: "नींद",
    tagColor: "#EDE9FE",
    tagText: "#7C3AED",
  },
  {
    icon: "🧪",
    title: "ये टेस्ट करवाएं",
    desc: "AMH, LH/FSH ratio, fasting insulin, thyroid — सखी बताएगी कब और क्यों",
    tag: "डॉक्टर",
    tagColor: "#FEF3C7",
    tagText: "#D97706",
  },
];

export default function PCOSPage() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showResult, setShowResult] = useState(false);

  function toggle(id: string) {
    setSelected((prev) => {
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
          {/* Intro card */}
          <div className="rounded-2xl p-4" style={{ background: "#F0FDF4" }}>
            <p
              className="mb-1 text-[12px] font-bold text-green-700"
              style={{ fontFamily: "JioType, sans-serif" }}
            >
              🔄 PCOS क्या है?
            </p>
            <p
              className="text-[13px] leading-relaxed text-zinc-700"
              style={{ fontFamily: "JioType, sans-serif" }}
            >
              Polycystic Ovary Syndrome — भारत की हर <strong>5 में से 1 महिला</strong> को होता है।
              यह हॉर्मोन का असंतुलन है, जिसमें अंडाशय ठीक से काम नहीं करते। यह{" "}
              <em>आपकी गलती नहीं है।</em>
            </p>
          </div>

          {/* Symptom checker */}
          <div className="flex flex-col gap-3 rounded-2xl bg-white p-4">
            <p
              className="text-[14px] font-bold text-zinc-800"
              style={{ fontFamily: "JioType, sans-serif" }}
            >
              आपको कौन से लक्षण हैं?
            </p>
            <p className="text-[12px] text-zinc-500" style={{ fontFamily: "JioType, sans-serif" }}>
              जो भी हो, सब चुनें — सखी आपको सही दिशा देगी
            </p>
            <div className="grid grid-cols-2 gap-2">
              {SYMPTOMS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggle(s.id)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-left transition-all active:scale-95"
                  style={{
                    background: selected.has(s.id) ? s.text : s.color,
                    border: `2px solid ${selected.has(s.id) ? s.text : "transparent"}`,
                  }}
                >
                  <span className="text-[18px]">{s.icon}</span>
                  <span
                    className="text-[12px] leading-tight font-semibold"
                    style={{
                      fontFamily: "JioType, sans-serif",
                      color: selected.has(s.id) ? "white" : s.text,
                    }}
                  >
                    {s.label}
                  </span>
                </button>
              ))}
            </div>

            {selected.size > 0 && (
              <button
                type="button"
                onClick={() => setShowResult(true)}
                className="w-full rounded-full py-2.5 text-[13px] font-semibold text-white transition-transform active:scale-[0.97]"
                style={{
                  fontFamily: "JioType, sans-serif",
                  background: "linear-gradient(90deg, #059669 0%, #047857 100%)",
                }}
              >
                सखी से पूछें — क्या यह PCOS है?
              </button>
            )}

            {showResult && selected.size > 0 && (
              <div className="rounded-xl p-3" style={{ background: "#F0FDF4" }}>
                <p
                  className="mb-1 text-[11px] font-bold text-green-700"
                  style={{ fontFamily: "JioType, sans-serif" }}
                >
                  सखी कह रही हैं:
                </p>
                <p
                  className="text-[13px] leading-relaxed text-zinc-700"
                  style={{ fontFamily: "JioType, sans-serif" }}
                >
                  {selected.size >= 3
                    ? "आपने कई लक्षण बताए हैं जो PCOS की ओर इशारा कर सकते हैं। कृपया एक gynecologist से मिलें और AMH + LH/FSH test करवाएं। यह जल्दी पता चले तो इलाज आसान होता है। 💚"
                    : "कुछ लक्षण PCOS से मिलते-जुलते हैं। अभी घबराएं नहीं — पर अपने periods की diary रखें और अगर ये लक्षण बढ़ें तो डॉक्टर से बात करें। 🌿"}
                </p>
              </div>
            )}
          </div>

          {/* What to do */}
          <div className="flex flex-col gap-3">
            <p
              className="text-[15px] font-bold text-zinc-900"
              style={{ fontFamily: "JioType, sans-serif" }}
            >
              PCOS को manage करें
            </p>
            <div className="flex flex-col gap-2">
              {ACTIONS_LIST.map((a) => (
                <div key={a.title} className="flex items-start gap-3 rounded-xl bg-white p-3">
                  <span className="shrink-0 text-[24px]">{a.icon}</span>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[13px] font-bold text-zinc-800"
                        style={{ fontFamily: "JioType, sans-serif" }}
                      >
                        {a.title}
                      </span>
                      <span
                        className="rounded-full px-2 py-0.5 text-[9px] font-medium"
                        style={{
                          background: a.tagColor,
                          color: a.tagText,
                          fontFamily: "JioType, sans-serif",
                        }}
                      >
                        {a.tag}
                      </span>
                    </div>
                    <span
                      className="text-[12px] leading-snug text-zinc-500"
                      style={{ fontFamily: "JioType, sans-serif" }}
                    >
                      {a.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Myth busting */}
          <div className="flex flex-col gap-3 rounded-2xl bg-white p-4">
            <p
              className="text-[14px] font-bold text-zinc-800"
              style={{ fontFamily: "JioType, sans-serif" }}
            >
              🚫 PCOS के बारे में गलतफहमियाँ
            </p>
            {MYTHS.map((m, i) => (
              <div
                key={i}
                className="flex flex-col gap-1 border-b border-zinc-100 pb-3 last:border-0 last:pb-0"
              >
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 text-[14px]">❌</span>
                  <p
                    className="text-[12px] font-semibold text-zinc-600 line-through"
                    style={{ fontFamily: "JioType, sans-serif" }}
                  >
                    {m.myth}
                  </p>
                </div>
                <div className="flex items-start gap-2 pl-6">
                  <p
                    className="text-[12px] leading-relaxed text-zinc-700"
                    style={{ fontFamily: "JioType, sans-serif" }}
                  >
                    ✅ {m.fact}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Sakhi stat */}
          <div className="rounded-2xl p-4" style={{ background: "#FFF0F5" }}>
            <p
              className="mb-1 text-[12px] font-bold text-pink-700"
              style={{ fontFamily: "JioType, sans-serif" }}
            >
              💡 सखी का नोट
            </p>
            <p
              className="text-[13px] leading-relaxed text-zinc-700"
              style={{ fontFamily: "JioType, sans-serif" }}
            >
              PCOS का कोई permanent &quot;cure&quot; नहीं है — पर lifestyle से{" "}
              <strong>80% लक्षण</strong> कम हो सकते हैं। आप इसे manage कर सकती हैं। यह आपकी ताकत है,
              कमज़ोरी नहीं।
            </p>
          </div>
        </div>
      </main>

      <HubHeader title="PCOS / हॉर्मोन" backHref="/womens-health" scrolled={false} />
      <HubChatInput variant="sleek" placeholder="PCOS के बारे में पूछें..." />
    </div>
  );
}
