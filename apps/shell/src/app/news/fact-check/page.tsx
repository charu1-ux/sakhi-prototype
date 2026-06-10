"use client";

import { useCallback, useRef, useState } from "react";

import { HubChatInput } from "@/app/jobs/design-prototype/HubChatInput";
import { HubHeader } from "@/app/jobs/design-prototype/HubHeader";

// ── Types ─────────────────────────────────────────────────────────────────────

type Verdict = "TRUE" | "FALSE" | "MISLEADING" | "UNVERIFIED";

type Claim = {
  id: string;
  claim: string;
  verdict: Verdict;
  confidence: number; // 0–100
  source: string;
  explanation: string;
  checkedBy: string;
  time: string;
  category: string;
};

// ── Data ──────────────────────────────────────────────────────────────────────

const TRENDING_CLAIMS: string[] = [
  "India bans Chinese apps again",
  "RBI new UPI limit",
  "Petrol price cut ₹10",
  "Free ration extended 2027",
  "Aadhaar mandatory for SIM",
];

const CLAIMS: Claim[] = [
  {
    id: "1",
    claim: "India has banned 47 more Chinese apps including TikTok's new version",
    verdict: "FALSE",
    confidence: 94,
    source: "MeitY official statement",
    explanation:
      "No new ban has been issued. The claim circulates from a 2020 screenshot edited to show a 2025 date. MeitY has not issued any new app-ban order this year. The original 2020 ban on 59 apps remains in force.",
    checkedBy: "FactChecker India",
    time: "2 hr ago",
    category: "Technology",
  },
  {
    id: "2",
    claim: "Petrol prices cut by ₹10 per litre ahead of state elections",
    verdict: "MISLEADING",
    confidence: 88,
    source: "PPAC, IOC pricing data",
    explanation:
      "Petrol prices were cut by ₹2 per litre in three states (MP, Rajasthan, Chhattisgarh) by respective state governments reducing VAT — not a central government cut. The ₹10 figure is inaccurate and national prices remain unchanged.",
    checkedBy: "Alt News",
    time: "4 hr ago",
    category: "Economy",
  },
  {
    id: "3",
    claim: "Free ration under PM Garib Kalyan Anna Yojana extended until December 2027",
    verdict: "TRUE",
    confidence: 97,
    source: "Cabinet press release, PIB",
    explanation:
      "The Cabinet approved the extension of PMGKAY for two additional years on June 5, 2025. The scheme covers 80 crore beneficiaries and provides 5 kg free foodgrains per person per month. The official notification has been published in the Gazette.",
    checkedBy: "The Wire Fact Check",
    time: "6 hr ago",
    category: "Government",
  },
  {
    id: "4",
    claim: "Aadhaar biometric mandatory for new SIM activation starting July 2025",
    verdict: "UNVERIFIED",
    confidence: 41,
    source: "DoT consultation paper",
    explanation:
      "DoT released a consultation paper proposing mandatory Aadhaar OTP verification (not biometric) for SIM re-activation after 90-day inactivity. This is a proposal, not a policy. No gazette notification issued yet. Multiple news outlets conflated the proposal with enacted policy.",
    checkedBy: "MediaNama",
    time: "8 hr ago",
    category: "Technology",
  },
  {
    id: "5",
    claim: "India surpasses China in GDP growth rate for the first time since 1990",
    verdict: "TRUE",
    confidence: 91,
    source: "IMF World Economic Outlook, April 2025",
    explanation:
      "IMF projects India's GDP growth at 6.8% vs China's 4.5% for FY2025. While India's growth exceeding China's has occurred in several recent years, the IMF notes the gap is the widest since 1990 in absolute percentage points.",
    checkedBy: "Boom Live",
    time: "12 hr ago",
    category: "Economy",
  },
];

// ── Verdict config ────────────────────────────────────────────────────────────

const VERDICT_CONFIG: Record<
  Verdict,
  { icon: string; bg: string; textColor: string; barColor: string; label: string }
> = {
  TRUE: {
    icon: "✓",
    bg: "bg-[#e6f7e6]",
    textColor: "text-[#25ab21]",
    barColor: "bg-[#25ab21]",
    label: "True",
  },
  FALSE: {
    icon: "✕",
    bg: "bg-[#fde8ea]",
    textColor: "text-[#fa2f40]",
    barColor: "bg-[#fa2f40]",
    label: "False",
  },
  MISLEADING: {
    icon: "⚠",
    bg: "bg-[#fef3e8]",
    textColor: "text-[#f06d0f]",
    barColor: "bg-[#f06d0f]",
    label: "Misleading",
  },
  UNVERIFIED: {
    icon: "?",
    bg: "bg-[#f4f4f5]",
    textColor: "text-black/40",
    barColor: "bg-black/20",
    label: "Unverified",
  },
};

// ── Claim card ────────────────────────────────────────────────────────────────

function ClaimCard({ claim }: { claim: Claim }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = VERDICT_CONFIG[claim.verdict];

  return (
    <div
      className="flex flex-col gap-3 rounded-2xl bg-white p-4 transition-opacity select-none active:opacity-70"
      onClick={() => setExpanded((v) => !v)}
    >
      {/* Category */}
      <span className="text-[11px] font-semibold tracking-wide text-black/40 uppercase">
        {claim.category}
      </span>

      {/* Claim text */}
      <p className="text-[14px] leading-snug font-semibold text-[#0c0d10]">
        &ldquo;{claim.claim}&rdquo;
      </p>

      {/* Verdict row */}
      <div className="flex items-center gap-3">
        {/* Verdict badge */}
        <div className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 ${cfg.bg}`}>
          <span className={`text-[13px] font-black ${cfg.textColor}`}>{cfg.icon}</span>
          <span className={`text-[12px] font-bold ${cfg.textColor}`}>{cfg.label}</span>
        </div>

        {/* Confidence bar */}
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-black/35">Confidence</span>
            <span className={`text-[11px] font-bold ${cfg.textColor}`}>{claim.confidence}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/[0.06]">
            <div
              className={`h-full rounded-full ${cfg.barColor}`}
              style={{ width: `${claim.confidence}%` }}
            />
          </div>
        </div>
      </div>

      {/* Explanation — expanded */}
      {expanded && (
        <div className="flex flex-col gap-2 rounded-xl bg-black/[0.03] p-3">
          <p className="text-[12px] leading-relaxed text-black/65">{claim.explanation}</p>
          <span className="text-[11px] font-medium text-black/40">Source: {claim.source}</span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-2 border-t border-black/[0.06] pt-2">
        <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-black/35">
          {claim.checkedBy} · {claim.time}
        </span>
        <span className="text-[11px] font-semibold text-[#6d17ce]">
          {expanded ? "Show less" : "See why"}
        </span>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function FactCheckPage() {
  const [scrolled, setScrolled] = useState(false);
  const scrollRef = useRef(false);
  const [activeFilter, setActiveFilter] = useState<Verdict | "ALL">("ALL");

  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    const past = e.currentTarget.scrollTop > 8;
    if (past !== scrollRef.current) {
      scrollRef.current = past;
      setScrolled(past);
    }
  }, []);

  const filters: Array<{ key: Verdict | "ALL"; label: string }> = [
    { key: "ALL", label: "All" },
    { key: "TRUE", label: "True" },
    { key: "FALSE", label: "False" },
    { key: "MISLEADING", label: "Misleading" },
    { key: "UNVERIFIED", label: "Unverified" },
  ];

  const filtered =
    activeFilter === "ALL" ? CLAIMS : CLAIMS.filter((c) => c.verdict === activeFilter);

  return (
    <div className="bg-canvas-grey text-fg relative flex h-full flex-col">
      <main
        className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 68px)" }}
        onScroll={handleScroll}
      >
        <div className="mx-auto flex w-full max-w-md flex-col gap-5 px-4">
          {/* Trending claims */}
          <div className="flex flex-col gap-2 pt-2">
            <p className="text-xs font-semibold tracking-widest text-black/40 uppercase">
              Trending claims
            </p>
            <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {TRENDING_CLAIMS.map((c) => (
                <span
                  key={c}
                  className="shrink-0 rounded-full border border-black/10 bg-white px-3 py-1.5 text-[12px] font-medium text-[#0c0d10]"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* Verdict filter */}
          <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                  activeFilter === f.key ? "bg-[#6d17ce] text-white" : "bg-white text-black/55"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Claims list */}
          <ul className="flex list-none flex-col gap-3 p-0">
            {filtered.map((c) => (
              <li key={c.id}>
                <ClaimCard claim={c} />
              </li>
            ))}
          </ul>
        </div>
      </main>

      <HubHeader title="Fact Check" backHref="/news" scrolled={scrolled} />
      <HubChatInput placeholder="Paste a claim to fact-check…" />
    </div>
  );
}
