"use client";

import { useCallback, useRef, useState } from "react";

import { HubHeader } from "@/app/jobs/design-prototype/HubHeader";

// ── Types ─────────────────────────────────────────────────────────────────────

type PredictCategory = "this-ball" | "this-over" | "match" | "wild";
type PredictStatus = "open" | "locked" | "won" | "lost";

type Prediction = {
  id: string;
  category: PredictCategory;
  label: string;
  description: string;
  probability: number; // 0–100
  pointsMultiplier: number; // inverse of probability
  status: PredictStatus;
  resolvedAt?: string;
  pointsEarned?: number;
};

type ActiveBet = {
  predictionId: string;
  label: string;
  probability: number;
  pointsMultiplier: number;
  lockedAt: string;
};

// ── Predictions catalogue ──────────────────────────────────────────────────

const PREDICTIONS: Prediction[] = [
  // This ball
  {
    id: "b1",
    category: "this-ball",
    label: "Wicket",
    description: "Batter out this delivery",
    probability: 8,
    pointsMultiplier: 12.5,
    status: "open",
  },
  {
    id: "b2",
    category: "this-ball",
    label: "Dot ball",
    description: "No runs scored",
    probability: 32,
    pointsMultiplier: 3.1,
    status: "open",
  },
  {
    id: "b3",
    category: "this-ball",
    label: "Boundary (4)",
    description: "Four runs off this ball",
    probability: 18,
    pointsMultiplier: 5.6,
    status: "open",
  },
  {
    id: "b4",
    category: "this-ball",
    label: "Six",
    description: "Maximum this delivery",
    probability: 11,
    pointsMultiplier: 9.1,
    status: "open",
  },
  // This over
  {
    id: "o1",
    category: "this-over",
    label: "Bumrah ≤ 5 runs",
    description: "Bumrah gives fewer than 5 runs in this over",
    probability: 22,
    pointsMultiplier: 4.5,
    status: "open",
  },
  {
    id: "o2",
    category: "this-over",
    label: "2+ boundaries",
    description: "At least 2 fours or sixes this over",
    probability: 35,
    pointsMultiplier: 2.9,
    status: "open",
  },
  {
    id: "o3",
    category: "this-over",
    label: "No wicket this over",
    description: "All 6 balls pass without a dismissal",
    probability: 62,
    pointsMultiplier: 1.6,
    status: "open",
  },
  // Match
  {
    id: "m1",
    category: "match",
    label: "India win",
    description: "India chase down the target",
    probability: 54,
    pointsMultiplier: 1.9,
    status: "open",
  },
  {
    id: "m2",
    category: "match",
    label: "Super Over",
    description: "Match tied and goes to Super Over",
    probability: 4,
    pointsMultiplier: 25,
    status: "open",
  },
  {
    id: "m3",
    category: "match",
    label: "Kohli top scorer",
    description: "Kohli ends as India's highest scorer",
    probability: 28,
    pointsMultiplier: 3.6,
    status: "open",
  },
  // Wild
  {
    id: "w1",
    category: "wild",
    label: "Rain delay before over 19",
    description: "Play stops for weather before the 19th over",
    probability: 6,
    pointsMultiplier: 16.7,
    status: "open",
  },
  {
    id: "w2",
    category: "wild",
    label: "Next DRS overturned",
    description: "The next review taken reverses the on-field decision",
    probability: 12,
    pointsMultiplier: 8.3,
    status: "open",
  },
];

const CATEGORY_LABELS: Record<PredictCategory, string> = {
  "this-ball": "This ball",
  "this-over": "This over",
  match: "Match",
  wild: "Wild card",
};

const CATEGORIES: PredictCategory[] = ["this-ball", "this-over", "match", "wild"];

// ── Helpers ───────────────────────────────────────────────────────────────────

function getBoldness(prob: number): { label: string; color: string } {
  if (prob <= 10) return { label: "Legendary call", color: "text-[#fa2f40]" };
  if (prob <= 20) return { label: "Bold call", color: "text-[#f97316]" };
  if (prob <= 35) return { label: "Risky", color: "text-[#eab308]" };
  if (prob <= 55) return { label: "Even money", color: "text-[#6b7280]" };
  return { label: "Safe bet", color: "text-[#25ab21]" };
}

function getProbabilityBarColor(prob: number): string {
  if (prob <= 15) return "bg-[#fa2f40]";
  if (prob <= 30) return "bg-[#f97316]";
  if (prob <= 50) return "bg-[#eab308]";
  return "bg-[#25ab21]";
}

// ── Confirmation sheet ────────────────────────────────────────────────────────

function ConfirmSheet({
  prediction,
  onConfirm,
  onCancel,
}: {
  prediction: Prediction;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const boldness = getBoldness(prediction.probability);
  const samplePoints = Math.round(100 * prediction.pointsMultiplier);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Scrim */}
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />

      {/* Sheet */}
      <div className="relative flex w-full max-w-md flex-col gap-5 rounded-t-3xl bg-white px-5 pt-5 pb-10">
        {/* Handle */}
        <div className="mx-auto h-1 w-10 rounded-full bg-black/10" />

        {/* Header */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-bold tracking-widest text-black/35 uppercase">
            Lock in prediction
          </span>
          <p className="text-[20px] leading-tight font-black text-[#0c0d10]">{prediction.label}</p>
          <p className="text-[13px] font-medium text-black/50">{prediction.description}</p>
        </div>

        {/* Probability gauge */}
        <div className="flex flex-col gap-2 rounded-2xl bg-[#f5f5f5] p-4">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-black/50">Probability</span>
            <span className={`text-[13px] font-bold ${boldness.color}`}>{boldness.label}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-black/10">
            <div
              className={`h-full rounded-full transition-all ${getProbabilityBarColor(prediction.probability)}`}
              style={{ width: `${prediction.probability}%` }}
            />
          </div>
          <p className="text-[13px] font-medium text-black/60">
            {prediction.probability}% chance based on Bumrah's last 6 death overs
          </p>
        </div>

        {/* Points preview */}
        <div className="flex items-center justify-between rounded-2xl bg-[#f6f3ff] px-4 py-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] font-bold tracking-wide text-[#6d17ce] uppercase">
              Points if correct
            </span>
            <span className="text-[28px] leading-none font-black text-[#6d17ce]">
              +{samplePoints}
            </span>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-[11px] font-medium text-black/40">Multiplier</span>
            <span className="text-[22px] font-black text-[#0c0d10]">
              {prediction.pointsMultiplier}×
            </span>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={onConfirm}
          className="w-full rounded-full bg-[#6d17ce] py-4 text-[15px] font-bold text-white transition-opacity active:opacity-80"
        >
          Lock it in →
        </button>
        <button
          onClick={onCancel}
          className="w-full text-center text-[13px] font-medium text-black/40 active:text-black/60"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Prediction card ───────────────────────────────────────────────────────────

function PredictionCard({
  prediction,
  onTap,
  isLocked,
}: {
  prediction: Prediction;
  onTap: () => void;
  isLocked: boolean;
}) {
  const boldness = getBoldness(prediction.probability);

  return (
    <button
      onClick={onTap}
      disabled={isLocked}
      className={`flex w-full flex-col gap-2.5 rounded-2xl bg-white p-4 text-left transition-all active:scale-[0.98] ${
        isLocked ? "opacity-40" : ""
      }`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-1 flex-col gap-0.5">
          <p className="text-[14px] font-bold text-[#0c0d10]">{prediction.label}</p>
          <p className="text-[11px] font-medium text-black/40">{prediction.description}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-0.5">
          <span className="text-[18px] leading-none font-black text-[#6d17ce]">
            {prediction.pointsMultiplier}×
          </span>
          <span className="text-[10px] font-medium text-black/35">multiplier</span>
        </div>
      </div>

      {/* Probability bar */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className={`text-[11px] font-bold ${boldness.color}`}>{boldness.label}</span>
          <span className="text-[11px] font-medium text-black/40">
            {prediction.probability}% chance
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-black/8">
          <div
            className={`h-full rounded-full ${getProbabilityBarColor(prediction.probability)}`}
            style={{ width: `${prediction.probability}%` }}
          />
        </div>
      </div>
    </button>
  );
}

// ── Active bet card ───────────────────────────────────────────────────────────

function ActiveBetCard({ bet }: { bet: ActiveBet }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-[#f6f3ff] px-4 py-3">
      <div className="flex flex-col gap-0.5">
        <p className="text-[13px] font-bold text-[#0c0d10]">{bet.label}</p>
        <p className="text-[11px] font-medium text-black/40">Locked at {bet.lockedAt}</p>
      </div>
      <div className="flex flex-col items-end gap-0.5">
        <span className="text-[15px] font-black text-[#6d17ce]">
          +{Math.round(100 * bet.pointsMultiplier)}
        </span>
        <span className="text-[10px] font-medium text-[#6d17ce]/60">if correct</span>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PredictPage() {
  const [activeCategory, setActiveCategory] = useState<PredictCategory>("this-ball");
  const [confirming, setConfirming] = useState<Prediction | null>(null);
  const [activeBets, setActiveBets] = useState<ActiveBet[]>([]);
  const [lockedIds, setLockedIds] = useState<Set<string>>(new Set());
  const [totalPoints, setTotalPoints] = useState(340);
  const [scrolled, setScrolled] = useState(false);
  const scrollRef = useRef(false);

  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    const past = e.currentTarget.scrollTop > 8;
    if (past !== scrollRef.current) {
      scrollRef.current = past;
      setScrolled(past);
    }
  }, []);

  const handleConfirm = useCallback(() => {
    if (!confirming) return;
    const now = new Date();
    const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;

    setActiveBets((prev) => [
      {
        predictionId: confirming.id,
        label: confirming.label,
        probability: confirming.probability,
        pointsMultiplier: confirming.pointsMultiplier,
        lockedAt: timeStr,
      },
      ...prev,
    ]);
    setLockedIds((prev) => new Set([...prev, confirming.id]));
    setConfirming(null);
  }, [confirming]);

  const filtered = PREDICTIONS.filter((p) => p.category === activeCategory);

  return (
    <div className="bg-canvas-grey text-fg relative flex h-full flex-col">
      <main
        className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 68px)" }}
        onScroll={handleScroll}
      >
        <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4">
          {/* Points banner */}
          <div className="flex items-center justify-between rounded-2xl bg-[#310064] px-4 py-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-bold tracking-wide text-white/50 uppercase">
                Your points
              </span>
              <span className="text-[28px] leading-none font-black text-white">{totalPoints}</span>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-[11px] font-medium text-white/40">Active predictions</span>
              <span className="text-[22px] leading-none font-black text-[#c084fc]">
                {activeBets.length}
              </span>
            </div>
          </div>

          {/* Match context */}
          <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold tracking-wide text-black/40 uppercase">
                Live now
              </span>
              <p className="text-[14px] font-bold text-[#0c0d10]">IND vs AUS · 17.3 overs</p>
              <p className="text-[12px] font-medium text-black/50">Need 22 off 15 balls</p>
            </div>
            <div className="flex items-center gap-1">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#fa2f40] opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-[#fa2f40]" />
              </span>
              <span className="text-[10px] font-bold tracking-wide text-[#fa2f40] uppercase">
                Live
              </span>
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-bold transition-all ${
                  activeCategory === cat
                    ? "bg-[#6d17ce] text-white"
                    : "bg-white text-[#0c0d10] active:bg-[#f6f3ff]"
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>

          {/* Predictions list */}
          <section className="flex flex-col gap-3">
            <span className="text-[10px] font-bold tracking-widest text-black/40 uppercase">
              Pick your prediction
            </span>
            {filtered.map((p) => (
              <PredictionCard
                key={p.id}
                prediction={p}
                onTap={() => setConfirming(p)}
                isLocked={lockedIds.has(p.id)}
              />
            ))}
          </section>

          {/* Active bets */}
          {activeBets.length > 0 && (
            <section className="flex flex-col gap-3">
              <span className="text-[10px] font-bold tracking-widest text-black/40 uppercase">
                Locked in
              </span>
              <div className="flex flex-col gap-2">
                {activeBets.map((b) => (
                  <ActiveBetCard key={b.predictionId + b.lockedAt} bet={b} />
                ))}
              </div>
            </section>
          )}

          {/* How points work */}
          <div className="flex flex-col gap-2 rounded-2xl bg-white p-4">
            <p className="text-[12px] font-bold text-[#0c0d10]">How points work</p>
            <p className="text-[12px] leading-relaxed font-medium text-black/50">
              Points are inversely proportional to probability. A correct 8% call scores{" "}
              <strong className="text-[#0c0d10]">12×</strong> more than a correct 50% one. The
              bolder the call, the bigger the reward.
            </p>
          </div>
        </div>
      </main>

      {/* Confirmation sheet */}
      {confirming && (
        <ConfirmSheet
          prediction={confirming}
          onConfirm={handleConfirm}
          onCancel={() => setConfirming(null)}
        />
      )}

      <HubHeader title="Predict Anything" backHref="/cricket" scrolled={scrolled} />
    </div>
  );
}
