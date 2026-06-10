"use client";

import { useCallback, useRef, useState } from "react";

import { HubHeader } from "@/app/jobs/design-prototype/HubHeader";

// ── Types ─────────────────────────────────────────────────────────────────────

type ReminderStatus = "active" | "fired" | "cancelled";
type ReminderCategory = "player" | "match" | "phase" | "custom";

type Reminder = {
  id: string;
  category: ReminderCategory;
  label: string;
  description: string;
  icon: string;
  status: ReminderStatus;
  createdAt: string;
};

// ── Quick-add templates ───────────────────────────────────────────────────────

type QuickTemplate = {
  id: string;
  category: ReminderCategory;
  label: string;
  description: string;
  icon: string;
};

const QUICK_TEMPLATES: QuickTemplate[] = [
  {
    id: "qt1",
    category: "player",
    label: "Kohli to bat",
    description: "Alert when Virat Kohli walks to the crease",
    icon: "🏏",
  },
  {
    id: "qt2",
    category: "player",
    label: "Bumrah bowling",
    description: "Alert when Bumrah starts his next over",
    icon: "🎯",
  },
  {
    id: "qt3",
    category: "match",
    label: "Match resumes",
    description: "Alert when play restarts after a break",
    icon: "▶️",
  },
  {
    id: "qt4",
    category: "phase",
    label: "Powerplay ends",
    description: "Alert at the end of the powerplay (over 6)",
    icon: "⚡",
  },
  {
    id: "qt5",
    category: "phase",
    label: "Death overs (16+)",
    description: "Alert when the death over phase begins",
    icon: "💥",
  },
  {
    id: "qt6",
    category: "phase",
    label: "Last 5 overs",
    description: "Alert when over 15 ends",
    icon: "⏱️",
  },
  {
    id: "qt7",
    category: "match",
    label: "Next wicket",
    description: "Alert as soon as the next wicket falls",
    icon: "🎉",
  },
  {
    id: "qt8",
    category: "match",
    label: "50-run partnership",
    description: "Alert when the current pair hits 50 together",
    icon: "🤝",
  },
];

// Pre-seeded fired reminder for demo
const SEEDED: Reminder[] = [
  {
    id: "seed1",
    category: "player",
    label: "Rohit Sharma to bat",
    description: "Alert when Rohit Sharma walks to the crease",
    icon: "🏏",
    status: "fired",
    createdAt: "16:02",
  },
];

const CATEGORY_LABELS: Record<ReminderCategory, string> = {
  player: "Player",
  match: "Match event",
  phase: "Phase",
  custom: "Custom",
};

const CATEGORY_COLORS: Record<ReminderCategory, string> = {
  player: "bg-[#f6f3ff] text-[#6d17ce]",
  match: "bg-[#ecf7ff] text-[#0078ad]",
  phase: "bg-[#fff7ed] text-[#c2410c]",
  custom: "bg-[#ddfef2] text-[#065f46]",
};

// ── Reminder card ─────────────────────────────────────────────────────────────

function ReminderCard({
  reminder,
  onCancel,
}: {
  reminder: Reminder;
  onCancel: (id: string) => void;
}) {
  const isActive = reminder.status === "active";
  const isFired = reminder.status === "fired";

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl px-4 py-3.5 transition-all ${
        isFired ? "bg-[#f6f3ff]" : isActive ? "bg-white" : "bg-[#f5f5f5] opacity-50"
      }`}
    >
      {/* Icon */}
      <div
        className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full text-lg ${
          isFired ? "bg-[#6d17ce]/10" : "bg-surface-ghost"
        }`}
      >
        {reminder.icon}
      </div>

      {/* Text */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <p
            className={`text-[14px] font-bold ${
              reminder.status === "cancelled" ? "text-black/30 line-through" : "text-[#0c0d10]"
            }`}
          >
            {reminder.label}
          </p>
          {isFired && (
            <span className="shrink-0 rounded-full bg-[#6d17ce] px-2 py-0.5 text-[10px] font-bold text-white">
              FIRED
            </span>
          )}
        </div>
        <p className="text-[11px] font-medium text-black/40">{reminder.description}</p>
        <div className="mt-1 flex items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${CATEGORY_COLORS[reminder.category]}`}
          >
            {CATEGORY_LABELS[reminder.category]}
          </span>
          <span className="text-[10px] font-medium text-black/30">Set at {reminder.createdAt}</span>
        </div>
      </div>

      {/* Cancel / status */}
      {isActive && (
        <button
          onClick={() => onCancel(reminder.id)}
          className="mt-0.5 shrink-0 rounded-full p-1.5 text-black/25 transition-colors active:text-[#fa2f40]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

// ── Custom input modal ────────────────────────────────────────────────────────

function CustomInputSheet({
  onAdd,
  onClose,
}: {
  onAdd: (label: string) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState("");

  const examples = [
    "Remind me when Maxwell gets out",
    "Alert when IND are 10 runs away from winning",
    "When first DRS is taken",
    "When Starc bowls his last over",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative flex w-full max-w-md flex-col gap-4 rounded-t-3xl bg-white px-5 pt-5 pb-10">
        <div className="mx-auto h-1 w-10 rounded-full bg-black/10" />
        <p className="text-[16px] font-black text-[#0c0d10]">Custom reminder</p>
        <p className="text-[13px] font-medium text-black/50">
          Type anything — JBIQ will figure out when to alert you.
        </p>

        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g. When Kohli hits a six…"
          className="bg-surface-ghost w-full resize-none rounded-2xl px-4 py-3 text-[14px] font-medium text-[#0c0d10] placeholder:text-black/30 focus:ring-2 focus:ring-[#6d17ce] focus:outline-none"
          rows={3}
          autoFocus
        />

        {/* Example chips */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-bold tracking-wide text-black/35 uppercase">
            Try one of these
          </span>
          <div className="flex flex-wrap gap-2">
            {examples.map((ex) => (
              <button
                key={ex}
                onClick={() => setValue(ex)}
                className="bg-surface-ghost rounded-full px-3 py-1.5 text-[11px] font-medium text-[#0c0d10] transition-colors active:bg-[#f6f3ff] active:text-[#6d17ce]"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        <button
          disabled={value.trim().length < 5}
          onClick={() => {
            onAdd(value.trim());
            onClose();
          }}
          className="mt-1 w-full rounded-full bg-[#6d17ce] py-4 text-[15px] font-bold text-white transition-opacity active:opacity-80 disabled:opacity-30"
        >
          Set reminder →
        </button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>(SEEDED);
  const [customOpen, setCustomOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const scrollRef = useRef(false);
  const counterRef = useRef(100);

  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    const past = e.currentTarget.scrollTop > 8;
    if (past !== scrollRef.current) {
      scrollRef.current = past;
      setScrolled(past);
    }
  }, []);

  const addReminder = useCallback((template: QuickTemplate | null, customLabel?: string) => {
    const now = new Date();
    const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
    const newId = String(counterRef.current++);

    if (template) {
      setReminders((prev) => [
        {
          id: newId,
          category: template.category,
          label: template.label,
          description: template.description,
          icon: template.icon,
          status: "active",
          createdAt: timeStr,
        },
        ...prev,
      ]);
    } else if (customLabel) {
      setReminders((prev) => [
        {
          id: newId,
          category: "custom",
          label: customLabel,
          description: "JBIQ will alert you when this happens",
          icon: "🔔",
          status: "active",
          createdAt: timeStr,
        },
        ...prev,
      ]);
    }
  }, []);

  const cancelReminder = useCallback((id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "cancelled" as ReminderStatus } : r)),
    );
  }, []);

  const active = reminders.filter((r) => r.status === "active");
  const fired = reminders.filter((r) => r.status === "fired");
  const past = reminders.filter((r) => r.status === "cancelled");

  // Which templates are already active
  const activeLabels = new Set(active.map((r) => r.label));

  return (
    <div className="bg-canvas-grey text-fg relative flex h-full flex-col">
      <main
        className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 68px)" }}
        onScroll={handleScroll}
      >
        <div className="mx-auto flex w-full max-w-md flex-col gap-5 px-4">
          {/* Match context */}
          <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold tracking-wide text-black/40 uppercase">
                Following
              </span>
              <p className="text-[14px] font-bold text-[#0c0d10]">IND vs AUS · 3rd T20I</p>
              <p className="text-[12px] font-medium text-black/50">
                IND need 22 off 15 · 17.3 overs
              </p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <div className="flex items-center gap-1">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#fa2f40] opacity-75" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-[#fa2f40]" />
                </span>
                <span className="text-[10px] font-bold tracking-wide text-[#fa2f40] uppercase">
                  Live
                </span>
              </div>
              <span className="text-[12px] font-bold text-[#0c0d10]">
                {active.length} active alert{active.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Quick-add grid */}
          <section className="flex flex-col gap-3">
            <span className="text-[10px] font-bold tracking-widest text-black/40 uppercase">
              Quick alerts
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              {QUICK_TEMPLATES.map((t) => {
                const alreadyActive = activeLabels.has(t.label);
                return (
                  <button
                    key={t.id}
                    onClick={() => !alreadyActive && addReminder(t)}
                    className={`flex flex-col gap-1.5 rounded-2xl px-3.5 py-3 text-left transition-all active:scale-[0.97] ${
                      alreadyActive ? "bg-[#f6f3ff] opacity-50" : "bg-white active:bg-[#f6f3ff]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl leading-none">{t.icon}</span>
                      {alreadyActive && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M5 12l5 5L19 7"
                            stroke="#6d17ce"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                    <p className="text-[13px] leading-tight font-bold text-[#0c0d10]">{t.label}</p>
                    <span
                      className={`w-fit rounded-full px-2 py-0.5 text-[10px] font-bold ${CATEGORY_COLORS[t.category]}`}
                    >
                      {CATEGORY_LABELS[t.category]}
                    </span>
                  </button>
                );
              })}

              {/* Custom button */}
              <button
                onClick={() => setCustomOpen(true)}
                className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-[#6d17ce]/30 px-3.5 py-3 transition-all active:border-[#6d17ce] active:bg-[#f6f3ff]"
              >
                <div className="flex size-8 items-center justify-center rounded-full bg-[#f6f3ff]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 5v14M5 12h14"
                      stroke="#6d17ce"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <p className="text-[13px] font-bold text-[#6d17ce]">Custom</p>
                <p className="text-center text-[10px] font-medium text-black/35">
                  Anything you want
                </p>
              </button>
            </div>
          </section>

          {/* Active reminders */}
          {active.length > 0 && (
            <section className="flex flex-col gap-3">
              <span className="text-[10px] font-bold tracking-widest text-black/40 uppercase">
                Active alerts ({active.length})
              </span>
              <div className="flex flex-col gap-2">
                {active.map((r) => (
                  <ReminderCard key={r.id} reminder={r} onCancel={cancelReminder} />
                ))}
              </div>
            </section>
          )}

          {/* Fired reminders */}
          {fired.length > 0 && (
            <section className="flex flex-col gap-3">
              <span className="text-[10px] font-bold tracking-widest text-black/40 uppercase">
                Fired
              </span>
              <div className="flex flex-col gap-2">
                {fired.map((r) => (
                  <ReminderCard key={r.id} reminder={r} onCancel={cancelReminder} />
                ))}
              </div>
            </section>
          )}

          {/* Past / cancelled */}
          {past.length > 0 && (
            <section className="flex flex-col gap-3">
              <span className="text-[10px] font-bold tracking-widest text-black/40 uppercase">
                Cancelled
              </span>
              <div className="flex flex-col gap-2">
                {past.map((r) => (
                  <ReminderCard key={r.id} reminder={r} onCancel={cancelReminder} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Custom input sheet */}
      {customOpen && (
        <CustomInputSheet
          onAdd={(label) => addReminder(null, label)}
          onClose={() => setCustomOpen(false)}
        />
      )}

      <HubHeader title="Event Reminders" backHref="/cricket" scrolled={scrolled} />
    </div>
  );
}
