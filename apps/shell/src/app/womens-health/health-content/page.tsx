"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HubHeader } from "@/app/jobs/design-prototype/HubHeader";
import { HubChatInput } from "@/app/jobs/design-prototype/HubChatInput";

const TOPICS = [
  {
    icon: "🔄",
    label: "PCOS / हॉर्मोन",
    desc: "अनियमित पीरियड, वजन बढ़ना, चेहरे पर बाल",
    tag: "P0",
    tagColor: "#D1FAE5",
    tagText: "#065F46",
    bg: "#F0FDF4",
    href: "/womens-health/pcos",
  },
  {
    icon: "💊",
    label: "पीरियड दर्द",
    desc: "दर्द कितना सामान्य है? Endometriosis क्या है?",
    tag: "P0",
    tagColor: "#FEF3C7",
    tagText: "#92400E",
    bg: "#FFFBEB",
    href: "/womens-health/period-pain",
  },
  {
    icon: "🩺",
    label: "खून की कमी",
    desc: "57% महिलाएं anaemic — iron-rich foods, CBC test",
    tag: "P0",
    tagColor: "#FEF9C3",
    tagText: "#B45309",
    bg: "#FEFCE8",
    href: "/womens-health/anaemia",
  },
  {
    icon: "🌡️",
    label: "Perimenopause",
    desc: "35-55 की उम्र में बदलाव — नाम भी नहीं मालूम था",
    tag: "जल्द आएगा",
    tagColor: "#F3F4F6",
    tagText: "#6B7280",
    bg: "#F9FAFB",
    href: null,
  },
  {
    icon: "🤱",
    label: "Postpartum (PPD)",
    desc: "बच्चे के बाद मन भारी क्यों? PPD क्या है?",
    tag: "जल्द आएगा",
    tagColor: "#F3F4F6",
    tagText: "#6B7280",
    bg: "#F9FAFB",
    href: null,
  },
  {
    icon: "🛡️",
    label: "Sexual Health",
    desc: "Contraception, STI, दर्द — बिना झिझक के पूछें",
    tag: "जल्द आएगा",
    tagColor: "#F3F4F6",
    tagText: "#6B7280",
    bg: "#F9FAFB",
    href: null,
  },
];

const QA_PAIRS = [
  {
    q: "पीरियड के दौरान इतना दर्द होता है — क्या यह सामान्य है?",
    a: "हल्का दर्द सामान्य है, लेकिन अगर दर्द इतना हो कि काम न हो सके — तो यह सामान्य नहीं है। यह Endometriosis हो सकता है। सखी की Period Pain guide देखें।",
    topic: "पीरियड दर्द",
  },
  {
    q: "मेरे पीरियड्स कभी 25 दिन, कभी 40 दिन — क्यों?",
    a: "अनियमित पीरियड्स PCOS का सबसे आम लक्षण है। इसके अलावा thyroid और stress भी कारण हो सकते हैं। PCOS guide में पूरी जानकारी है।",
    topic: "PCOS",
  },
  {
    q: "बहुत थकान रहती है, चक्कर आते हैं — क्या करूँ?",
    a: "यह Iron deficiency (anaemia) हो सकती है — भारत की 57% महिलाओं को होती है। CBC test करवाएं। Hemoglobin 12 से कम है तो डॉक्टर से मिलें।",
    topic: "खून की कमी",
  },
];

export default function HealthContentPage() {
  const router = useRouter();
  const [activeQ, setActiveQ] = useState<number | null>(null);

  return (
    <div className="bg-canvas-grey relative flex h-full flex-col">
      <main
        className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 76px)" }}
      >
        <div className="mx-auto flex w-full max-w-md flex-col gap-5">
          {/* Intro */}
          <div className="rounded-2xl p-4" style={{ background: "#FFF0F5" }}>
            <p
              className="mb-1 text-[12px] font-bold text-pink-700"
              style={{ fontFamily: "JioType, sans-serif" }}
            >
              📖 सखी की जानकारी
            </p>
            <p
              className="text-[13px] leading-relaxed text-zinc-700"
              style={{ fontFamily: "JioType, sans-serif" }}
            >
              कोई भी सवाल बेझिझक पूछें। यहाँ FOGSI-reviewed जानकारी है — Hindi में, बिना judgment
              के। हर जवाब में ज़रूरत पर डॉक्टर से मिलने की सलाह दी जाएगी।
            </p>
          </div>

          {/* Quick Q&A */}
          <div className="flex flex-col gap-3 rounded-2xl bg-white p-4">
            <p
              className="text-[14px] font-bold text-zinc-800"
              style={{ fontFamily: "JioType, sans-serif" }}
            >
              अक्सर पूछे जाने वाले सवाल
            </p>
            <div className="flex flex-col gap-2">
              {QA_PAIRS.map((qa, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-0 overflow-hidden rounded-xl"
                  style={{ border: "1px solid #F3F4F6" }}
                >
                  <button
                    type="button"
                    onClick={() => setActiveQ(activeQ === i ? null : i)}
                    className="flex items-start justify-between gap-3 p-3 text-left transition-colors active:bg-pink-50"
                  >
                    <p
                      className="text-[13px] leading-snug font-medium text-zinc-800"
                      style={{ fontFamily: "JioType, sans-serif" }}
                    >
                      {qa.q}
                    </p>
                    <span className="shrink-0 text-[16px] text-zinc-400">
                      {activeQ === i ? "▲" : "▼"}
                    </span>
                  </button>
                  {activeQ === i && (
                    <div
                      className="border-t px-3 pt-2 pb-3"
                      style={{ borderColor: "#F3F4F6", background: "#FFF9FB" }}
                    >
                      <p
                        className="mb-2 text-[12px] font-bold text-pink-600"
                        style={{ fontFamily: "JioType, sans-serif" }}
                      >
                        सखी कह रही हैं:
                      </p>
                      <p
                        className="text-[12px] leading-relaxed text-zinc-700"
                        style={{ fontFamily: "JioType, sans-serif" }}
                      >
                        {qa.a}
                      </p>
                      <span
                        className="mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{
                          background: "#FCE4EC",
                          color: "#C2185B",
                          fontFamily: "JioType, sans-serif",
                        }}
                      >
                        {qa.topic}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

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
                  className="flex items-center gap-3 rounded-xl p-3 text-left transition-transform active:scale-[0.98]"
                  style={{ background: t.bg, opacity: t.href ? 1 : 0.55 }}
                >
                  <span className="shrink-0 text-[28px]">{t.icon}</span>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[13px] font-bold text-zinc-800"
                        style={{ fontFamily: "JioType, sans-serif" }}
                      >
                        {t.label}
                      </span>
                      <span
                        className="rounded-full px-2 py-0.5 text-[9px] font-semibold"
                        style={{
                          background: t.tagColor,
                          color: t.tagText,
                          fontFamily: "JioType, sans-serif",
                        }}
                      >
                        {t.tag}
                      </span>
                    </div>
                    <span
                      className="text-[11px] leading-snug text-zinc-500"
                      style={{ fontFamily: "JioType, sans-serif" }}
                    >
                      {t.desc}
                    </span>
                  </div>
                  {t.href && <span className="shrink-0 text-zinc-400">›</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="rounded-xl p-3" style={{ background: "#F3F4F6" }}>
            <p
              className="text-[11px] leading-relaxed text-zinc-500"
              style={{ fontFamily: "JioType, sans-serif" }}
            >
              ⚠️ सखी जानकारी देती है, diagnosis नहीं। कोई भी दवाई या इलाज शुरू करने से पहले डॉक्टर
              से ज़रूर मिलें।
            </p>
          </div>
        </div>
      </main>

      <HubHeader title="महिला स्वास्थ्य" backHref="/womens-health" scrolled={false} />
      <HubChatInput variant="sleek" placeholder="कोई भी सवाल पूछें..." />
    </div>
  );
}
