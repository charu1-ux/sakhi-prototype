"use client";

import { useCallback, useRef, useState } from "react";

import { HubChatInput } from "@/app/jobs/design-prototype/HubChatInput";
import { HubHeader } from "@/app/jobs/design-prototype/HubHeader";

// ── Types ─────────────────────────────────────────────────────────────────────

type Verdict = "TRUE" | "FALSE" | "MISLEADING" | "UNVERIFIED";
type CheckState = "idle" | "loading" | "result";
type InputMode = "text" | "media";

type Claim = {
  id: string;
  claim: string;
  verdict: Verdict;
  confidence: number;
  source: string;
  explanation: string;
  checkedBy: string;
  time: string;
  category: string;
};

// ── Static data ───────────────────────────────────────────────────────────────

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

// Mock results for the check-a-claim prototype flow
const MOCK_CHECK_RESULTS: Claim[] = [
  {
    id: "user-1",
    claim: "",
    verdict: "MISLEADING",
    confidence: 76,
    source: "PIB Fact Check, ANI",
    explanation:
      "The claim contains a kernel of truth but omits critical context. The original statement was made in a different setting and has been selectively quoted to change its meaning. Multiple authoritative sources confirm the full picture is more nuanced.",
    checkedBy: "PIB Fact Check",
    time: "Just now",
    category: "General",
  },
  {
    id: "user-2",
    claim: "",
    verdict: "FALSE",
    confidence: 89,
    source: "Reuters, PTI, Official records",
    explanation:
      "This claim does not match any verified records. Cross-referencing with government databases, official press releases, and multiple independent news agencies confirms this is factually incorrect. The claim appears to have originated from a satire account.",
    checkedBy: "Reuters Fact Check",
    time: "Just now",
    category: "General",
  },
  {
    id: "user-3",
    claim: "",
    verdict: "UNVERIFIED",
    confidence: 34,
    source: "No primary source found",
    explanation:
      "We could not find a primary or authoritative source to confirm or deny this claim. The information may be too recent, too localised, or lack sufficient evidence. Exercise caution before sharing.",
    checkedBy: "FactChecker India",
    time: "Just now",
    category: "General",
  },
];

// ── Verdict config ────────────────────────────────────────────────────────────

const VERDICT_CONFIG: Record<
  Verdict,
  { icon: string; bg: string; textColor: string; barColor: string; label: string; tagBg: string }
> = {
  TRUE: {
    icon: "✓",
    bg: "bg-[#e6f7e6]",
    textColor: "text-[#25ab21]",
    barColor: "bg-[#25ab21]",
    label: "True",
    tagBg: "bg-[#25ab21]",
  },
  FALSE: {
    icon: "✕",
    bg: "bg-[#fde8ea]",
    textColor: "text-[#fa2f40]",
    barColor: "bg-[#fa2f40]",
    label: "False",
    tagBg: "bg-[#fa2f40]",
  },
  MISLEADING: {
    icon: "⚠",
    bg: "bg-[#fef3e8]",
    textColor: "text-[#f06d0f]",
    barColor: "bg-[#f06d0f]",
    label: "Misleading",
    tagBg: "bg-[#f06d0f]",
  },
  UNVERIFIED: {
    icon: "?",
    bg: "bg-[#f4f4f5]",
    textColor: "text-black/40",
    barColor: "bg-black/20",
    label: "Unverified",
    tagBg: "bg-black/30",
  },
};

// ── Check-a-claim input card ──────────────────────────────────────────────────

let mockResultIndex = 0;

function CheckClaimCard() {
  const [checkState, setCheckState] = useState<CheckState>("idle");
  const [inputMode, setInputMode] = useState<InputMode>("text");
  const [claimText, setClaimText] = useState("");
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    type: "image" | "video";
  } | null>(null);
  const [result, setResult] = useState<Claim | null>(null);
  const [resultExpanded, setResultExpanded] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSubmit =
    (inputMode === "text" && claimText.trim().length > 4) ||
    (inputMode === "media" && uploadedFile !== null);

  function handleCheck() {
    if (!canSubmit) return;
    setCheckState("loading");

    setTimeout(() => {
      const mockResult = { ...MOCK_CHECK_RESULTS[mockResultIndex % MOCK_CHECK_RESULTS.length] };
      mockResultIndex++;
      mockResult.claim =
        inputMode === "text"
          ? claimText.trim()
          : `[${uploadedFile!.type === "image" ? "Image" : "Video"}: ${uploadedFile!.name}]`;
      setResult(mockResult);
      setCheckState("result");
      setResultExpanded(true);
    }, 2200);
  }

  function handleReset() {
    setCheckState("idle");
    setClaimText("");
    setUploadedFile(null);
    setResult(null);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith("video/");
    setUploadedFile({ name: file.name, type: isVideo ? "video" : "image" });
  }

  // ── Idle state ──────────────────────────────────────────────────────────────
  if (checkState === "idle") {
    return (
      <div className="flex flex-col gap-3 rounded-2xl bg-white p-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-bold text-[#0c0d10]">Check a claim</span>
          <span className="rounded-full bg-[#f6f3ff] px-2 py-0.5 text-[10px] font-bold text-[#6d17ce]">
            AI-powered
          </span>
        </div>

        {/* Mode toggle */}
        <div className="bg-surface-ghost flex gap-1 rounded-2xl p-1">
          {(["text", "media"] as InputMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => {
                setInputMode(mode);
                setClaimText("");
                setUploadedFile(null);
              }}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-[13px] font-bold transition-colors ${
                inputMode === mode ? "bg-white text-[#6d17ce] shadow-sm" : "text-black/40"
              }`}
            >
              <span>{mode === "text" ? "📝" : "🖼️"}</span>
              {mode === "text" ? "Paste text" : "Upload media"}
            </button>
          ))}
        </div>

        {/* Input area */}
        {inputMode === "text" ? (
          <textarea
            value={claimText}
            onChange={(e) => setClaimText(e.target.value)}
            placeholder="Type or paste any claim, headline, or WhatsApp forward…"
            rows={3}
            className="w-full resize-none rounded-xl bg-black/[0.03] px-3 py-2.5 text-[14px] leading-relaxed text-[#0c0d10] outline-none placeholder:text-black/35"
          />
        ) : (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileChange}
            />
            {uploadedFile ? (
              /* Uploaded file preview */
              <div className="flex items-center gap-3 rounded-xl bg-[#f6f3ff] px-3 py-3">
                <span className="text-2xl">{uploadedFile.type === "image" ? "🖼️" : "🎬"}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-[#0c0d10]">
                    {uploadedFile.name}
                  </p>
                  <p className="text-[11px] text-black/40 capitalize">
                    {uploadedFile.type} ready to check
                  </p>
                </div>
                <button
                  onClick={() => setUploadedFile(null)}
                  className="shrink-0 text-[11px] font-semibold text-[#fa2f40]"
                >
                  Remove
                </button>
              </div>
            ) : (
              /* Upload drop zone */
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-black/10 bg-black/[0.02] py-5 transition-colors active:bg-black/[0.05]"
              >
                <span className="text-3xl">📎</span>
                <p className="text-[13px] font-semibold text-[#0c0d10]">Tap to upload</p>
                <p className="text-[11px] text-black/40">Screenshot, photo, or video clip</p>
              </button>
            )}
            {/* Quick media type buttons */}
            {!uploadedFile && (
              <div className="mt-2 flex gap-2">
                {[
                  { label: "📷 Photo", accept: "image/*" },
                  { label: "🎬 Video", accept: "video/*" },
                  { label: "📸 Screenshot", accept: "image/*" },
                ].map((btn) => (
                  <button
                    key={btn.label}
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.accept = btn.accept;
                        fileInputRef.current.click();
                      }
                    }}
                    className="flex-1 rounded-xl border border-black/10 bg-white py-2 text-[11px] font-semibold text-[#0c0d10] active:bg-black/[0.04]"
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleCheck}
          disabled={!canSubmit}
          className={`flex items-center justify-center gap-2 rounded-xl py-3 text-[14px] font-bold transition-all ${
            canSubmit
              ? "bg-[#6d17ce] text-white active:opacity-80"
              : "bg-black/[0.05] text-black/25"
          }`}
        >
          <span>Check this claim</span>
          {canSubmit && (
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path
                d="M4 10h12M10 4l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>
    );
  }

  // ── Loading state ───────────────────────────────────────────────────────────
  if (checkState === "loading") {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-white px-4 py-8">
        {/* Pulsing icon */}
        <div className="relative flex size-14 items-center justify-center rounded-full bg-[#f6f3ff]">
          <span className="absolute inset-0 animate-ping rounded-full bg-[#6d17ce] opacity-10" />
          <span className="text-2xl">🔍</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="text-[15px] font-bold text-[#0c0d10]">Analysing claim…</p>
          <p className="text-[12px] text-black/40">Cross-checking with 50+ sources</p>
        </div>
        {/* Animated progress dots */}
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="size-2 rounded-full bg-[#6d17ce]"
              style={{
                animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                opacity: 0.3,
              }}
            />
          ))}
        </div>
        {/* Source chips */}
        <div className="flex flex-wrap justify-center gap-1.5">
          {["PIB Fact Check", "Alt News", "Boom Live", "Reuters", "PTI"].map((s) => (
            <span
              key={s}
              className="rounded-full bg-black/[0.04] px-2.5 py-1 text-[10px] font-medium text-black/40"
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    );
  }

  // ── Result state ────────────────────────────────────────────────────────────
  if (checkState === "result" && result) {
    const cfg = VERDICT_CONFIG[result.verdict];
    return (
      <div className="flex flex-col gap-0 overflow-hidden rounded-2xl bg-white">
        {/* Verdict header band */}
        <div className={`flex items-center gap-3 px-4 py-3 ${cfg.bg}`}>
          <span className={`text-[22px] font-black ${cfg.textColor}`}>{cfg.icon}</span>
          <div className="flex-1">
            <p className={`text-[14px] font-black ${cfg.textColor}`}>{cfg.label}</p>
            <p className="text-[11px] font-medium text-black/40">
              {result.confidence}% confidence · {result.checkedBy}
            </p>
          </div>
          {/* Confidence bar */}
          <div className="flex w-16 flex-col items-end gap-1">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/10">
              <div
                className={`h-full rounded-full ${cfg.barColor}`}
                style={{ width: `${result.confidence}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 p-4">
          {/* The claim */}
          <p className="text-[13px] leading-snug font-semibold text-[#0c0d10] italic">
            &ldquo;
            {result.claim.length > 120 ? result.claim.slice(0, 120) + "…" : result.claim}
            &rdquo;
          </p>

          {/* Explanation toggle */}
          <button
            onClick={() => setResultExpanded((v) => !v)}
            className="flex items-center gap-1 self-start text-[12px] font-semibold text-[#6d17ce]"
          >
            {resultExpanded ? "Hide explanation" : "Why?"}
            <svg
              width="12"
              height="12"
              viewBox="0 0 20 20"
              fill="none"
              className={`transition-transform ${resultExpanded ? "rotate-180" : ""}`}
            >
              <path
                d="M5 7.5l5 5 5-5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {resultExpanded && (
            <div className="rounded-xl bg-black/[0.03] p-3">
              <p className="text-[12px] leading-relaxed text-black/65">{result.explanation}</p>
              <p className="mt-1.5 text-[11px] font-medium text-black/40">
                Source: {result.source}
              </p>
            </div>
          )}

          {/* Footer actions */}
          <div className="flex items-center gap-2 border-t border-black/[0.06] pt-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-1 rounded-xl bg-[#f6f3ff] px-3 py-2 text-[12px] font-bold text-[#6d17ce] active:opacity-70"
            >
              ↩ Check another
            </button>
            <button className="rounded-xl border border-black/10 px-3 py-2 text-[12px] font-semibold text-black/55 active:opacity-70">
              Share result
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

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
        <div className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 ${cfg.bg}`}>
          <span className={`text-[13px] font-black ${cfg.textColor}`}>{cfg.icon}</span>
          <span className={`text-[12px] font-bold ${cfg.textColor}`}>{cfg.label}</span>
        </div>

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

      {expanded && (
        <div className="flex flex-col gap-2 rounded-xl bg-black/[0.03] p-3">
          <p className="text-[12px] leading-relaxed text-black/65">{claim.explanation}</p>
          <span className="text-[11px] font-medium text-black/40">Source: {claim.source}</span>
        </div>
      )}

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
          {/* ── Check-a-claim card ── */}
          <CheckClaimCard />

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-black/[0.06]" />
            <span className="text-[10px] font-semibold tracking-widest text-black/30 uppercase">
              Recent checks
            </span>
            <div className="h-px flex-1 bg-black/[0.06]" />
          </div>

          {/* Trending claims */}
          <div className="flex flex-col gap-2">
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
      <HubChatInput variant="sleek" placeholder="Paste a claim to fact-check…" />
    </div>
  );
}
