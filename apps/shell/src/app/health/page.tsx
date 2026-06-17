import { BellRing, ChevronRight, Leaf, Stethoscope, Wind } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sehat Saathi — Health",
  description: "JBIQ Health — Sehat Saathi home, the four conversational experiences.",
};

/*
 * Sehat Saathi hub — the Health vertical landing. Lists the four home
 * experiences as tappable cards; each opens its auto-playing chat-story
 * prototype. This is the single entry point (tap Health → pick an experience),
 * so reviewers don't need the four routes individually.
 */
const EXPERIENCES = [
  {
    href: "/health/takleef",
    title: "क्या तकलीफ़ है?",
    subtitle: "बताओ — साथी सही नुस्खा बताएगा",
    Icon: Stethoscope,
    bg: "#FBEAE7",
    fg: "#C0492F",
  },
  {
    href: "/health/nuskha",
    title: "घर के नुस्खे",
    subtitle: "दादी के आज़माए · कदम-दर-कदम आराम",
    Icon: Leaf,
    bg: "#E3F3E9",
    fg: "#1E7A46",
  },
  {
    href: "/health/reminders",
    title: "खाना-पानी रिमाइंडर",
    subtitle: "समय पर खाना-पानी · रिमाइंडर",
    Icon: BellRing,
    bg: "#E6F1FB",
    fg: "#185FA5",
  },
  {
    href: "/health/sukoon",
    title: "साँस और सुकून",
    subtitle: "तनाव कम करें · अच्छी नींद",
    Icon: Wind,
    bg: "#EFE8FB",
    fg: "#6D17CE",
  },
];

export default function HealthPage() {
  return (
    <main className="bg-surface mx-auto flex min-h-dvh w-full max-w-[480px] flex-col px-5 pt-6 pb-12">
      <div className="text-fg text-[22px] font-bold">सेहत साथी</div>
      <h1 className="text-fg mt-3 text-[24px] font-bold">नमस्ते</h1>
      <p className="text-fg-muted mb-5 text-[14px]">आज मैं किसमें मदद करूँ?</p>

      <div className="flex flex-col gap-3">
        {EXPERIENCES.map((e) => {
          const Icon = e.Icon;
          return (
            <Link
              key={e.href}
              href={e.href}
              className="bg-surface dark:bg-bg-elev flex items-center gap-3.5 rounded-2xl border border-black/10 p-3.5 shadow-sm transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99] dark:border-white/10"
            >
              <span
                className="flex size-12 shrink-0 items-center justify-center rounded-full"
                style={{ background: e.bg, color: e.fg }}
              >
                <Icon size={24} strokeWidth={1.9} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="text-fg block text-[16px] font-bold">{e.title}</span>
                <span className="text-fg-muted block text-[13px]">{e.subtitle}</span>
              </span>
              <ChevronRight className="text-fg-muted shrink-0" size={20} />
            </Link>
          );
        })}
      </div>

      <p className="text-fg-muted mt-7 text-center text-[12px]">
        डिज़ाइन प्रोटोटाइप · कहानियाँ अपने-आप चलती हैं
      </p>
    </main>
  );
}
