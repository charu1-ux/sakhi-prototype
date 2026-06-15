"use client";

import { BellRing, ChevronLeft, Leaf, MessageSquareText, Stethoscope, Wind } from "lucide-react";
import { useState } from "react";

import { HubChatInput } from "../../jobs/design-prototype/HubChatInput";
import { NuskhaStory } from "../nuskha/NuskhaStory";
import { RemindersStory } from "../reminders/RemindersStory";
import { SukoonStory } from "../sukoon/SukoonStory";
import { TakleefStory } from "../takleef/TakleefStory";

type Key = "takleef" | "nuskha" | "reminders" | "sukoon";

// Same four experiences as the PM-design home, surfaced as quick-pick pills.
// Tapping one plays that story's chat, led by the topic line as the AI's
// opening prompt (passed via `intro`).
const OPTIONS = [
  {
    key: "takleef" as const,
    title: "क्या तकलीफ़ है?",
    subtitle: "बताओ — साथी सही नुस्खा बताएगा",
    Icon: Stethoscope,
    bg: "#FBEAE7",
    fg: "#C0492F",
  },
  {
    key: "nuskha" as const,
    title: "घर के नुस्खे",
    subtitle: "दादी के आज़माए · कदम-दर-कदम आराम",
    Icon: Leaf,
    bg: "#E3F3E9",
    fg: "#1E7A46",
  },
  {
    key: "reminders" as const,
    title: "खाना-पानी रिमाइंडर",
    subtitle: "समय पर खाना-पानी · रिमाइंडर",
    Icon: BellRing,
    bg: "#E6F1FB",
    fg: "#185FA5",
  },
  {
    key: "sukoon" as const,
    title: "साँस और सुकून",
    subtitle: "तनाव कम करें · अच्छी नींद",
    Icon: Wind,
    bg: "#EFE8FB",
    fg: "#6D17CE",
  },
];

export function HealthDesignPrototype() {
  const [selected, setSelected] = useState<Key | null>(null);
  const back = () => setSelected(null);

  // Selecting a pill hides the pills and plays that story (white chat, no edit
  // icon; back returns to the pills).
  if (selected === "takleef")
    return <TakleefStory intro="क्या तकलीफ़ है?" hideNewChat onBack={back} />;
  if (selected === "nuskha") return <NuskhaStory intro="घर के नुस्खे" hideNewChat onBack={back} />;
  if (selected === "reminders")
    return <RemindersStory intro="खाना-पानी रिमाइंडर" hideNewChat onBack={back} />;
  if (selected === "sukoon") return <SukoonStory intro="साँस और सुकून" hideNewChat onBack={back} />;

  // Pre-chat: chat shell + greeting, with the four sleek pills above the input.
  return (
    <div className="bg-surface relative flex h-dvh flex-col overflow-hidden">
      <header className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[68px]">
        <div className="absolute inset-0 bg-gradient-to-b from-white from-[73%] to-transparent" />
        <div className="pointer-events-auto relative flex items-center gap-3 px-4 pt-3.5">
          <button
            type="button"
            aria-label="Back"
            onClick={() => {
              window.location.href = "/";
            }}
            className="bg-surface-minimal text-fg flex size-10 shrink-0 items-center justify-center rounded-full transition-transform duration-200 hover:scale-105 active:scale-95"
          >
            <ChevronLeft size={22} strokeWidth={2.4} />
          </button>
          <h1 className="flex-1 text-lg font-bold">सेहत साथी</h1>
          <button
            type="button"
            aria-label="Chats"
            className="bg-surface-minimal text-fg flex size-10 shrink-0 items-center justify-center rounded-full transition-transform duration-200 hover:scale-105 active:scale-95"
          >
            <MessageSquareText size={20} strokeWidth={2} />
          </button>
        </div>
      </header>

      <main className="flex flex-1 flex-col overflow-y-auto px-4 pt-[80px] pb-5" />

      {/* Greeting title + four sleek pills — icon · title · description, no chevron, rounded-full */}
      <div className="flex shrink-0 flex-col gap-2.5 px-4 pb-2">
        <p className="text-fg px-1 pb-0.5 text-[15px] leading-relaxed font-semibold">
          नमस्ते, आज मैं किसमें मदद करूँ?
        </p>
        {OPTIONS.map((o) => {
          const Icon = o.Icon;
          return (
            <button
              key={o.key}
              type="button"
              onClick={() => setSelected(o.key)}
              className="bg-surface flex items-center gap-3 rounded-full border border-black/10 py-2 pr-4 pl-2 text-left transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99]"
            >
              <span
                className="flex size-10 shrink-0 items-center justify-center rounded-full"
                style={{ background: o.bg, color: o.fg }}
              >
                <Icon size={20} strokeWidth={1.9} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="text-fg block text-[15px] leading-tight font-bold">{o.title}</span>
                <span className="text-fg-muted block truncate text-[12px]">{o.subtitle}</span>
              </span>
            </button>
          );
        })}
      </div>

      <HubChatInput variant="sleek" />
    </div>
  );
}
