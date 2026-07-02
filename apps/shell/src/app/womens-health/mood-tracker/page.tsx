"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { HubHeader } from "@/app/jobs/design-prototype/HubHeader";
import { HubChatInput } from "@/app/jobs/design-prototype/HubChatInput";
import { askSakhi } from "@/lib/sakhi";

type SakhiTurn = { role: "user" | "assistant"; content: string };

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  gulabi: "#E8536A",
  gulabiLight: "#FDEEF0",
  gulabiMid: "#F0899A",
  raat: "#2D1B4E",
  raatMid: "#5A3E7A",
  raatLight: "#F2EDF8",
  chai: "#C4884A",
  mint: "#2AAF7A",
  mintLight: "#E5F7F0",
  sky: "#4A90D9",
  skyLight: "#EBF4FC",
  amber: "#E8A020",
  violet: "#8B5CF6",
  violetLight: "#F3EEFF",
  surface: "#FFFFFF",
  surface2: "#F9F4FF",
  chatBg: "#F2EDF8",
  textPrimary: "#1A0E2E",
  textSecondary: "#6B5580",
  textTertiary: "#9E8BB0",
  border: "rgba(45,27,78,0.09)",
};

// ─── Phase data (mock — would come from period tracker in real app) ────────────
const PHASE = {
  name: "Luteal Phase",
  day: 18,
  cycleLength: 28,
  hint: "Mood thoda heavy ho sakta hai — yeh normal hai",
};

// ─── Mood options ─────────────────────────────────────────────────────────────
const MOODS = [
  { face: "😄", label: "Bahut achha", score: 5 },
  { face: "🙂", label: "Achha", score: 4 },
  { face: "😐", label: "Theek hai", score: 3 },
  { face: "😔", label: "Tanav", score: 2 },
  { face: "😞", label: "Bura", score: 1 },
];

// ─── Energy options ───────────────────────────────────────────────────────────
const ENERGIES = [
  { icon: "🪫", label: "Bahut kam", score: 1 },
  { icon: "⚡", label: "Theek hai", score: 2 },
  { icon: "🔋", label: "Zyada", score: 3 },
];

// ─── For whom ─────────────────────────────────────────────────────────────────
type ForWhom = "self" | "other";

function ForWhomCard({
  onPick,
  locked,
  selected,
}: {
  onPick: (v: ForWhom) => void;
  locked: boolean;
  selected?: ForWhom;
}) {
  return (
    <div
      className="mt-1 rounded-tr-2xl rounded-b-2xl p-3"
      style={{ background: C.surface, boxShadow: "0 1px 6px rgba(45,27,78,0.08)", maxWidth: 252 }}
    >
      <div className="mb-2.5 text-[11px] font-semibold" style={{ color: C.textTertiary }}>
        Yeh log kiske liye hai? 👇
      </div>
      <div className="flex gap-2">
        {(["self", "other"] as ForWhom[]).map((v) => {
          const isSelected = selected === v;
          return (
            <button
              key={v}
              type="button"
              disabled={locked}
              onClick={() => !locked && onPick(v)}
              className="flex-1 rounded-2xl py-2.5 text-[13px] font-semibold transition-all active:scale-95"
              style={{
                background: isSelected ? C.raat : C.raatLight,
                color: isSelected ? "#fff" : C.raatMid,
                border: "none",
                opacity: locked && !isSelected ? 0.4 : 1,
                fontFamily: "JioType, sans-serif",
              }}
            >
              {v === "self" ? "Mere liye" : "Kisi aur ke liye"}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Message kinds ────────────────────────────────────────────────────────────

type MessageKind =
  | { type: "text"; role: "user" | "sakhi"; text: string }
  | { type: "forWhomPicker"; locked: boolean; selected?: ForWhom }
  | { type: "moodPicker"; locked: boolean; selected?: (typeof MOODS)[0] }
  | { type: "energyPicker"; locked: boolean; selected?: (typeof ENERGIES)[0] }
  | { type: "confirmation"; mood: (typeof MOODS)[0]; energy: (typeof ENERGIES)[0] }
  | { type: "contentLink"; query: string };

// ─── Content redirect card ────────────────────────────────────────────────────
function ContentLinkCard({ onTap }: { onTap: () => void }) {
  return (
    <button
      type="button"
      onClick={onTap}
      className="mt-1 w-full rounded-tr-2xl rounded-b-2xl p-3 text-left transition-all active:scale-[0.98]"
      style={{
        background: C.violetLight,
        border: `1.5px solid rgba(139,92,246,0.25)`,
        maxWidth: 252,
        boxShadow: "0 1px 6px rgba(45,27,78,0.08)",
      }}
    >
      <div className="mb-1 flex items-center gap-2">
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[14px]"
          style={{ background: C.violet }}
        >
          ✅
        </div>
        <span
          className="text-[12px] font-bold"
          style={{ color: C.raat, fontFamily: "JioType, sans-serif" }}
        >
          जाँची-परखी जानकारी देखें
        </span>
      </div>
      <p
        className="text-[11px] leading-relaxed"
        style={{ color: C.textSecondary, fontFamily: "JioType, sans-serif" }}
      >
        PMS, तनाव, और हॉर्मोन से जुड़ी जानकारी — WHO और FOGSI द्वारा सत्यापित
      </p>
      <div
        className="mt-2 flex items-center gap-1 text-[11px] font-semibold"
        style={{ color: C.violet }}
      >
        अभी पढ़ें →
      </div>
    </button>
  );
}

// ─── Phase banner ─────────────────────────────────────────────────────────────
function PhaseBanner() {
  return (
    <div
      className="flex items-center gap-2 px-4 py-2"
      style={{
        background: "linear-gradient(90deg, #3D2560 0%, #2D1B4E 100%)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ background: C.violet, boxShadow: "0 0 6px rgba(139,92,246,0.6)" }}
      />
      <div className="flex-1">
        <div className="text-[11px] font-bold" style={{ color: "rgba(255,255,255,0.85)" }}>
          {PHASE.name} · Din {PHASE.day}
        </div>
        <div className="mt-0.5 text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>
          {PHASE.hint}
        </div>
      </div>
      <div
        className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold"
        style={{
          background: "rgba(232,83,106,0.2)",
          border: "1px solid rgba(232,83,106,0.35)",
          color: C.gulabiMid,
        }}
      >
        D{PHASE.day}
      </div>
    </div>
  );
}

// ─── Mood face selector ───────────────────────────────────────────────────────
function MoodPicker({
  onPick,
  locked,
  selected,
}: {
  onPick: (m: (typeof MOODS)[0]) => void;
  locked: boolean;
  selected?: (typeof MOODS)[0];
}) {
  return (
    <div
      className="mt-1 rounded-tr-2xl rounded-b-2xl p-3"
      style={{ background: C.surface, boxShadow: "0 1px 6px rgba(45,27,78,0.08)", maxWidth: 252 }}
    >
      <div className="mb-2 text-[11px] font-semibold" style={{ color: C.textTertiary }}>
        Ek tap karo 👇
      </div>
      <div className="flex gap-1.5">
        {MOODS.map((m) => {
          const isSelected = selected?.score === m.score;
          return (
            <button
              key={m.score}
              type="button"
              disabled={locked}
              onClick={() => !locked && onPick(m)}
              className="flex flex-1 flex-col items-center gap-1 rounded-xl py-2 transition-all active:scale-95"
              style={{
                border: `1.5px solid ${isSelected ? C.sky : C.border}`,
                background: isSelected ? C.skyLight : C.surface,
                opacity: locked && !isSelected ? 0.45 : 1,
              }}
            >
              <span style={{ fontSize: 22, lineHeight: 1 }}>{m.face}</span>
              <span
                className="text-center text-[8px] leading-tight font-bold tracking-wide uppercase"
                style={{ color: isSelected ? C.sky : C.textTertiary }}
              >
                {m.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Energy picker ────────────────────────────────────────────────────────────
function EnergyPicker({
  onPick,
  locked,
  selected,
}: {
  onPick: (e: (typeof ENERGIES)[0]) => void;
  locked: boolean;
  selected?: (typeof ENERGIES)[0];
}) {
  return (
    <div
      className="mt-1 rounded-tr-2xl rounded-b-2xl p-3"
      style={{ background: C.surface, boxShadow: "0 1px 6px rgba(45,27,78,0.08)", maxWidth: 252 }}
    >
      <div className="mb-2 text-[11px] font-semibold" style={{ color: C.textTertiary }}>
        Energy level 👇
      </div>
      <div className="flex gap-2">
        {ENERGIES.map((e) => {
          const isSelected = selected?.score === e.score;
          return (
            <button
              key={e.score}
              type="button"
              disabled={locked}
              onClick={() => !locked && onPick(e)}
              className="flex flex-1 flex-col items-center gap-1.5 rounded-xl py-2 transition-all active:scale-95"
              style={{
                border: `1.5px solid ${isSelected ? C.gulabi : C.border}`,
                background: isSelected ? C.gulabiLight : C.surface,
                opacity: locked && !isSelected ? 0.45 : 1,
              }}
            >
              <span style={{ fontSize: 18, lineHeight: 1 }}>{e.icon}</span>
              <span
                className="text-[9px] font-bold tracking-wide uppercase"
                style={{ color: isSelected ? C.gulabi : C.textTertiary }}
              >
                {e.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Confirmation card ────────────────────────────────────────────────────────
function ConfirmationCard({
  mood,
  energy,
}: {
  mood: (typeof MOODS)[0];
  energy: (typeof ENERGIES)[0];
}) {
  const dots = Array.from({ length: 5 }, (_, i) => i < energy.score + 1);
  return (
    <div
      className="relative mt-1 overflow-hidden rounded-tr-2xl rounded-b-2xl p-3.5"
      style={{
        background: "linear-gradient(135deg, #3D2560 0%, #2D1B4E 100%)",
        maxWidth: 252,
        boxShadow: "0 2px 10px rgba(45,27,78,0.20)",
      }}
    >
      {/* bg decoration */}
      <div
        className="absolute -right-5 -bottom-5 h-16 w-16 rounded-full"
        style={{ background: "rgba(232,83,106,0.12)" }}
      />

      {/* Title */}
      <div className="mb-2.5 flex items-center gap-2">
        <div
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
          style={{ background: C.mint }}
        >
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
            <polyline
              points="2,7 5,10 12,3"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className="text-[12px] font-bold" style={{ color: "rgba(255,255,255,0.9)" }}>
          Aaj ka mood note ho gaya ✓
        </span>
      </div>

      {/* Mood row */}
      <div className="mb-2.5 flex items-center gap-2.5">
        <span style={{ fontSize: 28, lineHeight: 1 }}>{mood.face}</span>
        <div>
          <div className="text-[14px] font-extrabold text-white">{mood.label}</div>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.45)" }}>
              Energy
            </span>
            <div className="flex gap-1">
              {dots.map((on, i) => (
                <div
                  key={i}
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: on ? C.gulabi : "rgba(255,255,255,0.15)" }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Cycle correlation */}
      <div
        className="relative z-10 rounded-xl p-2.5"
        style={{ background: "rgba(255,255,255,0.08)" }}
      >
        <div className="flex items-start gap-1.5">
          <span style={{ fontSize: 13, flexShrink: 0, marginTop: 1 }}>💡</span>
          <p className="text-[11px] leading-relaxed" style={{ color: "rgba(255,255,255,0.70)" }}>
            <strong style={{ color: "rgba(255,255,255,0.90)" }}>
              {PHASE.name} mein yeh common hai.
            </strong>{" "}
            Aaj se log karna shuru ho gaya — agli baar Sakhi aapka pattern bata sakegi.
          </p>
        </div>
        <div
          className="mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5"
          style={{
            background: "rgba(139,92,246,0.25)",
            border: "1px solid rgba(139,92,246,0.35)",
          }}
        >
          <div className="h-1.5 w-1.5 rounded-full" style={{ background: C.violet }} />
          <span
            className="text-[9px] font-bold tracking-wide uppercase"
            style={{ color: "rgba(139,92,246,0.9)" }}
          >
            {PHASE.name} · Din {PHASE.day} of {PHASE.cycleLength}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Sakhi bubble wrapper ─────────────────────────────────────────────────────
function SakhiRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-end gap-1.5">
      <div
        className="mb-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px]"
        style={{ background: C.raat }}
      >
        💜
      </div>
      <div className="flex flex-col gap-0.5" style={{ maxWidth: 252 }}>
        <span
          className="pl-0.5 text-[9px] font-bold tracking-wider uppercase"
          style={{ color: C.textTertiary }}
        >
          Sakhi
        </span>
        {children}
      </div>
    </div>
  );
}

// ─── Text bubble ─────────────────────────────────────────────────────────────
function Bubble({ text, time }: { text: string; time?: string }) {
  return (
    <>
      <div
        className="rounded-tl-sm rounded-tr-2xl rounded-b-2xl px-3 py-2.5 text-[13px] leading-relaxed"
        style={{
          background: C.surface,
          color: C.textPrimary,
          boxShadow: "0 1px 4px rgba(45,27,78,0.08)",
          fontFamily: "JioType, sans-serif",
        }}
      >
        {text}
      </div>
      {time && (
        <span className="pl-0.5 text-[9px]" style={{ color: C.textTertiary }}>
          {time}
        </span>
      )}
    </>
  );
}

// ─── Loading dots ─────────────────────────────────────────────────────────────
function LoadingDots() {
  return (
    <SakhiRow>
      <div
        className="flex items-center gap-1.5 rounded-tl-sm rounded-tr-2xl rounded-b-2xl px-4 py-3"
        style={{ background: C.surface, boxShadow: "0 1px 4px rgba(45,27,78,0.08)" }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full"
            style={{
              background: C.textTertiary,
              animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
        <style>{`@keyframes pulse{0%,100%{opacity:0.3}50%{opacity:1}}`}</style>
      </div>
    </SakhiRow>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function MoodTrackerPage() {
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);
  const scroll = () =>
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);

  const [forWhomLocked, setForWhomLocked] = useState(false);
  const [selectedForWhom, setSelectedForWhom] = useState<ForWhom | undefined>();
  const [moodLocked, setMoodLocked] = useState(false);
  const [energyLocked, setEnergyLocked] = useState(false);
  const [selectedMood, setSelectedMood] = useState<(typeof MOODS)[0] | undefined>();
  const [selectedEnergy, setSelectedEnergy] = useState<(typeof ENERGIES)[0] | undefined>();
  const [loading, setLoading] = useState(false); // API call only
  const [flowLoading, setFlowLoading] = useState(false); // between picker steps

  const [messages, setMessages] = useState<MessageKind[]>([
    {
      type: "text",
      role: "sakhi",
      text: "Namaste! Main Sakhi hoon — aapki swasthya saheli. 💜\n\nAapka raaz mera raaz hai. Jo bhi aap mujhse kehein — woh sirf hamare beech rehta hai. Koi vigyapan nahi, koi jaankari kisi ke saath saajha nahi.",
    },
    { type: "forWhomPicker", locked: false },
  ]);

  function push(msg: MessageKind) {
    setMessages((prev) => [...prev, msg]);
    scroll();
  }

  function handleForWhomPick(v: ForWhom) {
    if (forWhomLocked) return;
    setForWhomLocked(true);
    setSelectedForWhom(v);
    push({ type: "text", role: "user", text: v === "self" ? "Mere liye" : "Kisi aur ke liye" });
    setFlowLoading(true);
    scroll();
    setTimeout(() => {
      setFlowLoading(false);
      const opening =
        v === "other" ? "Zaroor! Unka mood kaisa hai aaj?" : "Achha! Aaj kaisa feel ho raha hai?";
      push({ type: "text", role: "sakhi", text: opening });
      push({ type: "moodPicker", locked: false });
      scroll();
    }, 900);
  }

  function handleMoodPick(m: (typeof MOODS)[0]) {
    if (moodLocked) return;
    setMoodLocked(true);
    setSelectedMood(m);
    push({ type: "text", role: "user", text: `${m.face} ${m.label}` });
    setFlowLoading(true);
    scroll();
    setTimeout(() => {
      setFlowLoading(false);
      push({
        type: "text",
        role: "sakhi",
        text: `${m.label} — samajh gayi. Energy kaisi hai aaj?`,
      });
      push({ type: "energyPicker", locked: false });
      scroll();
    }, 900);
  }

  function handleEnergyPick(e: (typeof ENERGIES)[0]) {
    if (energyLocked) return;
    setEnergyLocked(true);
    setSelectedEnergy(e);
    push({ type: "text", role: "user", text: `${e.icon} ${e.label}` });
    setFlowLoading(true);
    scroll();
    setTimeout(() => {
      setFlowLoading(false);
      push({ type: "confirmation", mood: selectedMood!, energy: e });
      push({
        type: "text",
        role: "sakhi",
        text: "Kal bhi log karo — pattern samajhna helpful hoga. Koi aur baat karni hai? 🌸",
      });
      scroll();
    }, 900);
  }

  async function handleSubmit(text: string) {
    if (!text.trim() || loading) return;
    const q = text.trim();
    const history: SakhiTurn[] = messages
      .filter((m): m is Extract<MessageKind, { type: "text" }> => m.type === "text")
      .map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.text }));
    push({ type: "text", role: "user", text: q });
    setLoading(true);
    scroll();
    try {
      const data = await askSakhi(q, history);
      if (data.video || data.article) {
        push({
          type: "text",
          role: "sakhi",
          text: "Samajh gayi. Is baare mein kuch verified jankari hai — yahan dekho:",
        });
        push({ type: "contentLink", query: q });
      } else {
        push({
          type: "text",
          role: "sakhi",
          text: "Samajh gayi. Mood aur mental health ke baare mein yahan kuch verified jankari hai:",
        });
        push({ type: "contentLink", query: "low mood mann udaas kyun hota hai" });
      }
    } catch {
      push({
        type: "text",
        role: "sakhi",
        text: "Network mein thodi problem hai. Dobara try karo. 💜",
      });
    } finally {
      setLoading(false);
      scroll();
    }
  }

  // Render messages
  function renderMessage(msg: MessageKind, i: number) {
    if (msg.type === "text" && msg.role === "user") {
      return (
        <div key={i} className="flex justify-end">
          <div
            className="max-w-[64%] rounded-2xl rounded-tr-sm px-3 py-2.5 text-[13px] leading-relaxed text-white"
            style={{ background: C.raat, fontFamily: "JioType, sans-serif" }}
          >
            {msg.text}
          </div>
        </div>
      );
    }

    if (msg.type === "text" && msg.role === "sakhi") {
      return (
        <SakhiRow key={i}>
          <Bubble text={msg.text} />
        </SakhiRow>
      );
    }

    if (msg.type === "forWhomPicker") {
      return (
        <SakhiRow key={i}>
          <Bubble text="Namaste! Yeh mood log aapke liye hai ya kisi aur ke liye?" />
          <ForWhomCard
            locked={forWhomLocked}
            selected={selectedForWhom}
            onPick={handleForWhomPick}
          />
        </SakhiRow>
      );
    }

    if (msg.type === "moodPicker") {
      return (
        <SakhiRow key={i}>
          <MoodPicker locked={moodLocked} selected={selectedMood} onPick={handleMoodPick} />
        </SakhiRow>
      );
    }

    if (msg.type === "energyPicker") {
      return (
        <SakhiRow key={i}>
          <EnergyPicker locked={energyLocked} selected={selectedEnergy} onPick={handleEnergyPick} />
        </SakhiRow>
      );
    }

    if (msg.type === "confirmation") {
      return (
        <SakhiRow key={i}>
          <ConfirmationCard mood={msg.mood} energy={msg.energy} />
        </SakhiRow>
      );
    }

    if (msg.type === "contentLink") {
      return (
        <SakhiRow key={i}>
          <ContentLinkCard
            onTap={() =>
              router.push(`/womens-health/health-content?q=${encodeURIComponent(msg.query)}`)
            }
          />
        </SakhiRow>
      );
    }

    return null;
  }

  return (
    <div className="relative flex h-full flex-col" style={{ background: C.chatBg }}>
      <main
        className="min-h-0 flex-1 overflow-y-auto px-3 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 76px + 40px)" }}
      >
        <div className="mx-auto flex w-full max-w-md flex-col gap-3">
          {/* Date separator */}
          <div
            className="py-1 text-center text-[10px] font-semibold tracking-wide"
            style={{ color: C.textTertiary }}
          >
            Aaj · {new Date().toLocaleDateString("hi-IN", { day: "numeric", month: "long" })}
          </div>

          {messages.map((m, i) => renderMessage(m, i))}

          {(loading || flowLoading) && <LoadingDots />}

          <div ref={bottomRef} />
        </div>
      </main>

      {/* Phase banner sits just below the HubHeader */}
      <div
        className="fixed right-0 left-0 z-10"
        style={{ top: "calc(env(safe-area-inset-top, 0px) + 76px)" }}
      >
        <PhaseBanner />
      </div>

      <HubHeader title="मूड ट्रैकर" backHref="/womens-health" scrolled={false} />
      <HubChatInput
        variant="sleek"
        placeholder="Kuch aur batana chahti ho..."
        onSubmit={handleSubmit}
      />
    </div>
  );
}
