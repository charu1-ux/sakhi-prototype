"use client";

import { useCallback, useRef, useState } from "react";

import { HubChatInput } from "@/app/jobs/design-prototype/HubChatInput";
import { HubHeader } from "@/app/jobs/design-prototype/HubHeader";

// ── Types ─────────────────────────────────────────────────────────────────────

type IndexData = {
  id: string;
  name: string;
  shortName: string;
  value: string;
  change: string;
  changePct: number; // signed
  points: number[]; // sparkline
};

type Stock = {
  symbol: string;
  name: string;
  price: string;
  changePct: number;
};

type Asset = {
  name: string;
  value: string;
  change: string;
  changePct: number;
  unit: string;
};

// ── Data ──────────────────────────────────────────────────────────────────────

const MARKET_STATUS = { open: true, label: "Market Open", closeTime: "Closes 3:30 PM" };

const INDICES: IndexData[] = [
  {
    id: "sensex",
    name: "S&P BSE Sensex",
    shortName: "Sensex",
    value: "74,339.44",
    change: "+1,248.73",
    changePct: 1.71,
    points: [72900, 73100, 72800, 73400, 73200, 73700, 73500, 74100, 73900, 74339],
  },
  {
    id: "nifty50",
    name: "Nifty 50",
    shortName: "Nifty 50",
    value: "22,573.30",
    change: "+371.60",
    changePct: 1.67,
    points: [22050, 22100, 21980, 22200, 22150, 22300, 22250, 22450, 22400, 22573],
  },
  {
    id: "banknifty",
    name: "Nifty Bank",
    shortName: "Bank Nifty",
    value: "48,104.70",
    change: "-182.35",
    changePct: -0.38,
    points: [48450, 48300, 48500, 48200, 48350, 48100, 48280, 48150, 48220, 48105],
  },
];

const TOP_GAINERS: Stock[] = [
  { symbol: "ADANIPORTS", name: "Adani Ports", price: "₹1,342", changePct: 4.81 },
  { symbol: "TATAMOTORS", name: "Tata Motors", price: "₹926", changePct: 3.74 },
  { symbol: "WIPRO", name: "Wipro", price: "₹489", changePct: 3.12 },
  { symbol: "BAJFINANCE", name: "Bajaj Finance", price: "₹7,210", changePct: 2.95 },
  { symbol: "RELIANCE", name: "Reliance Ind.", price: "₹2,874", changePct: 2.23 },
];

const TOP_LOSERS: Stock[] = [
  { symbol: "HDFC", name: "HDFC Bank", price: "₹1,538", changePct: -2.14 },
  { symbol: "ICICIBANK", name: "ICICI Bank", price: "₹1,089", changePct: -1.67 },
  { symbol: "INFY", name: "Infosys", price: "₹1,622", changePct: -1.42 },
  { symbol: "TCS", name: "TCS", price: "₹3,808", changePct: -0.95 },
  { symbol: "SUNPHARMA", name: "Sun Pharma", price: "₹1,584", changePct: -0.72 },
];

const ASSETS: Asset[] = [
  { name: "USD/INR", value: "84.32", change: "+0.18", changePct: 0.21, unit: "₹" },
  { name: "Gold", value: "₹71,840", change: "+₹340", changePct: 0.48, unit: "/10g" },
  { name: "Silver", value: "₹89,200", change: "-₹620", changePct: -0.69, unit: "/kg" },
  { name: "Crude Oil", value: "$82.14", change: "+$0.94", changePct: 1.16, unit: "/bbl" },
];

// ── Discovery data ────────────────────────────────────────────────────────────

const TRENDING_SEARCHES: string[] = [
  "RBI rate cut impact on stocks",
  "Best SIP to start in June 2025",
  "Why is Sensex falling?",
  "Nifty 50 target end of 2025",
  "Gold vs Nifty which is better",
  "FII vs DII who is buying",
  "ELSS tax saving funds",
  "Should I buy Adani stocks",
  "Smallcap vs midcap 2025",
  "How to invest in US stocks from India",
];

type FinanceNewsItem = {
  id: string;
  category: string;
  headline: string;
  summary: string;
  time: string;
  source: string;
  positive: boolean; // market sentiment of the news
};

const FINANCE_NEWS: FinanceNewsItem[] = [
  {
    id: "fn1",
    category: "Policy",
    headline: "RBI's 50 bps cut could unlock ₹12,000 Cr in loan savings for retail borrowers",
    summary:
      "Analysts estimate the surprise rate cut will reduce EMIs for 4 crore home loan customers. Banks are expected to pass on the cut within 30–60 days as MCLR adjusts.",
    time: "32 min ago",
    source: "Economic Times",
    positive: true,
  },
  {
    id: "fn2",
    category: "FII Activity",
    headline: "Foreign investors pump ₹8,200 Cr into Indian equities in a single session",
    summary:
      "FIIs turned net buyers after three weeks of outflows, with IT and BFSI sectors attracting the most inflows. Analysts attribute the reversal to dovish Fed signals and the RBI rate cut.",
    time: "1 hr ago",
    source: "Mint",
    positive: true,
  },
  {
    id: "fn3",
    category: "Global Markets",
    headline: "US Fed signals two more cuts in 2025; Asia markets rally on cue",
    summary:
      "Fed Chair's comments at the FOMC presser were interpreted as dovish, with futures markets pricing in 50 bps of cuts before year-end. Nikkei and Hang Seng both rose over 1.5%.",
    time: "2 hr ago",
    source: "Bloomberg",
    positive: true,
  },
  {
    id: "fn4",
    category: "Commodities",
    headline: "Crude oil edges lower as OPEC+ hints at further production increase",
    summary:
      "Brent crude slipped 0.8% to $81.50 as Saudi Arabia signalled readiness to raise output if prices stay above $80. Lower crude is net positive for India's CAD and inflation outlook.",
    time: "3 hr ago",
    source: "Reuters",
    positive: false,
  },
];

type FAQItem = {
  id: string;
  question: string;
  answer: string;
  tag: string;
};

const PEOPLE_ARE_ASKING: FAQItem[] = [
  {
    id: "q1",
    question: "Why did the market surge today?",
    answer:
      "Today's rally was driven by the RBI's surprise 50 bps rate cut, which boosted banking and rate-sensitive stocks. FII buying of ₹8,200 Cr added fuel. Globally, dovish Fed signals and falling crude oil prices provided a tailwind.",
    tag: "Markets",
  },
  {
    id: "q2",
    question: "Will the RBI rate cut help home loan EMIs?",
    answer:
      "Yes — for floating rate home loans linked to MCLR or repo rate. Banks typically pass on cuts within 30–60 days. On a ₹50L, 20-year loan, a 50 bps cut reduces the EMI by roughly ₹1,500–1,800/month.",
    tag: "Loans",
  },
  {
    id: "q3",
    question: "Is this a good time to invest in Nifty 50?",
    answer:
      "Nifty is trading at ~21x forward P/E — slightly above its long-term average of 18x but below the peak of 24x. Rate cuts historically support equity multiples. Most analysts maintain a 12-month Nifty target of 24,000–25,000. Systematic investing (SIP) remains the safest approach.",
    tag: "Investing",
  },
  {
    id: "q4",
    question: "Why is the Rupee weakening against the Dollar?",
    answer:
      "The Rupee dipped slightly as the rate cut narrowed the interest rate differential with the US. However, strong FII inflows and RBI's forex buffer (~$650B) are limiting the downside. Most analysts see the Rupee stabilising in the 83.80–84.50 range.",
    tag: "Forex",
  },
  {
    id: "q5",
    question: "Should I move money from FD to equity now?",
    answer:
      "With rate cuts reducing FD returns over time, equities look more attractive on a risk-adjusted basis. Financial planners suggest keeping 6–12 months of expenses in liquid/FD, and gradually shifting surplus into diversified equity funds via SIP rather than lump sum.",
    tag: "Personal Finance",
  },
];

// ── Sparkline ─────────────────────────────────────────────────────────────────

function Sparkline({ points, positive }: { points: number[]; positive: boolean }) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const W = 72;
  const H = 28;
  const coords = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * W;
      const y = H - ((p - min) / range) * H;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="shrink-0">
      <polyline
        points={coords}
        fill="none"
        stroke={positive ? "#25ab21" : "#fa2f40"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── Index card ────────────────────────────────────────────────────────────────

function IndexCard({ index }: { index: IndexData }) {
  const positive = index.changePct >= 0;

  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] font-medium text-black/40">{index.name}</span>
          <span className="text-[18px] font-black tracking-tight text-[#0c0d10]">
            {index.value}
          </span>
        </div>
        <Sparkline points={index.points} positive={positive} />
      </div>
      <div className="flex items-center gap-1.5">
        <span className={`text-[13px] font-bold ${positive ? "text-[#25ab21]" : "text-[#fa2f40]"}`}>
          {positive ? "▲" : "▼"} {Math.abs(index.changePct).toFixed(2)}%
        </span>
        <span className="text-[12px] font-medium text-black/40">{index.change} pts</span>
      </div>
    </div>
  );
}

// ── Stock row ─────────────────────────────────────────────────────────────────

function StockRow({ stock }: { stock: Stock }) {
  const positive = stock.changePct >= 0;
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[13px] font-bold text-[#0c0d10]">{stock.symbol}</span>
        <span className="truncate text-[11px] font-medium text-black/40">{stock.name}</span>
      </div>
      <div className="flex flex-col items-end gap-0.5">
        <span className="text-[13px] font-bold text-[#0c0d10]">{stock.price}</span>
        <span className={`text-[12px] font-bold ${positive ? "text-[#25ab21]" : "text-[#fa2f40]"}`}>
          {positive ? "+" : ""}
          {stock.changePct.toFixed(2)}%
        </span>
      </div>
    </div>
  );
}

// ── Finance news card ─────────────────────────────────────────────────────────

function FinanceNewsCard({ item }: { item: FinanceNewsItem }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      className="flex flex-col gap-2 rounded-2xl bg-white p-4 transition-opacity select-none active:opacity-70"
      onClick={() => setExpanded((v) => !v)}
    >
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold tracking-wide text-black/40 uppercase">
          {item.category}
        </span>
        <span className="ml-auto text-[10px] font-medium text-black/30">{item.time}</span>
      </div>
      <p className="text-[13px] leading-snug font-bold text-[#0c0d10]">{item.headline}</p>
      {expanded && <p className="text-[12px] leading-relaxed text-black/55">{item.summary}</p>}
      <div className="flex items-center gap-2 border-t border-black/[0.06] pt-2">
        <span
          className={`text-[11px] font-bold ${item.positive ? "text-[#25ab21]" : "text-[#fa2f40]"}`}
        >
          {item.positive ? "▲ Positive" : "▼ Negative"}
        </span>
        <span className="text-black/20">·</span>
        <span className="text-[11px] font-medium text-black/35">{item.source}</span>
        <span className="ml-auto text-[11px] font-semibold text-[#6d17ce]">
          {expanded ? "Less" : "Read more"}
        </span>
      </div>
    </div>
  );
}

// ── FAQ card ──────────────────────────────────────────────────────────────────

function FAQCard({ item }: { item: FAQItem }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      className="flex flex-col gap-0 overflow-hidden rounded-2xl bg-white transition-opacity select-none active:opacity-70"
      onClick={() => setExpanded((v) => !v)}
    >
      <div className="flex items-start gap-3 p-4">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="self-start rounded-full bg-[#f6f3ff] px-2 py-0.5 text-[9px] font-bold tracking-wide text-[#6d17ce] uppercase">
            {item.tag}
          </span>
          <p className="text-[13px] leading-snug font-semibold text-[#0c0d10]">{item.question}</p>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 20 20"
          fill="none"
          className={`mt-0.5 shrink-0 text-[#6d17ce] transition-transform ${expanded ? "rotate-180" : ""}`}
        >
          <path
            d="M5 7.5l5 5 5-5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {expanded && (
        <div className="border-t border-black/[0.06] bg-[#fafafa] px-4 py-3">
          <p className="text-[12px] leading-relaxed text-black/65">{item.answer}</p>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MarketPulsePage() {
  const [scrolled, setScrolled] = useState(false);
  const scrollRef = useRef(false);
  const [activeTab, setActiveTab] = useState<"gainers" | "losers">("gainers");

  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    const past = e.currentTarget.scrollTop > 8;
    if (past !== scrollRef.current) {
      scrollRef.current = past;
      setScrolled(past);
    }
  }, []);

  return (
    <div className="bg-canvas-grey text-fg relative flex h-full flex-col">
      <main
        className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 68px)" }}
        onScroll={handleScroll}
      >
        <div className="mx-auto flex w-full max-w-md flex-col gap-5 px-4">
          {/* Market status bar */}
          <div className="flex items-center gap-2 rounded-xl bg-[#e6f7e6] px-3 py-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25ab21] opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-[#25ab21]" />
            </span>
            <span className="text-[12px] font-bold text-[#25ab21]">{MARKET_STATUS.label}</span>
            <span className="text-[12px] text-black/40">· {MARKET_STATUS.closeTime}</span>
            <span className="ml-auto text-[11px] font-medium text-black/40">NSE · BSE</span>
          </div>

          {/* Index cards */}
          <section className="flex flex-col gap-3">
            <span className="text-[10px] font-bold tracking-widest text-black/40 uppercase">
              Indices
            </span>
            <div className="grid grid-cols-1 gap-3">
              {INDICES.map((idx) => (
                <IndexCard key={idx.id} index={idx} />
              ))}
            </div>
          </section>

          {/* Movers */}
          <section className="flex flex-col gap-3">
            <span className="text-[10px] font-bold tracking-widest text-black/40 uppercase">
              Top movers
            </span>
            {/* Tab toggle */}
            <div className="bg-surface-ghost flex gap-1 rounded-2xl p-1">
              {(["gainers", "losers"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 rounded-xl py-2 text-[13px] font-bold transition-colors ${
                    activeTab === tab
                      ? tab === "gainers"
                        ? "bg-white text-[#25ab21] shadow-sm"
                        : "bg-white text-[#fa2f40] shadow-sm"
                      : "text-black/40"
                  }`}
                >
                  {tab === "gainers" ? "Gainers" : "Losers"}
                </button>
              ))}
            </div>
            <div className="divide-y divide-black/[0.05] rounded-2xl bg-white px-4">
              {(activeTab === "gainers" ? TOP_GAINERS : TOP_LOSERS).map((s) => (
                <StockRow key={s.symbol} stock={s} />
              ))}
            </div>
          </section>

          {/* Currencies & Commodities */}
          <section className="flex flex-col gap-3">
            <span className="text-[10px] font-bold tracking-widest text-black/40 uppercase">
              Currencies &amp; Commodities
            </span>
            <div className="grid grid-cols-2 gap-3">
              {ASSETS.map((a) => {
                const positive = a.changePct >= 0;
                return (
                  <div key={a.name} className="flex flex-col gap-1.5 rounded-2xl bg-white p-3">
                    <span className="text-[11px] font-semibold text-black/40">
                      {a.name}
                      <span className="font-normal"> {a.unit}</span>
                    </span>
                    <span className="text-[16px] font-black text-[#0c0d10]">{a.value}</span>
                    <span
                      className={`text-[12px] font-bold ${
                        positive ? "text-[#25ab21]" : "text-[#fa2f40]"
                      }`}
                    >
                      {positive ? "▲" : "▼"} {Math.abs(a.changePct).toFixed(2)}%
                      <span className="ml-1 font-normal text-black/40">{a.change}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── Discovery sections ── */}

          {/* Trending searches */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-widest text-black/40 uppercase">
                Trending searches
              </span>
              <span className="text-base leading-none">🔥</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {TRENDING_SEARCHES.map((q) => (
                <button
                  key={q}
                  className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-left text-[12px] font-medium text-[#0c0d10] transition-colors active:border-[#6d17ce] active:bg-[#f6f3ff] active:text-[#6d17ce]"
                >
                  {q}
                </button>
              ))}
            </div>
          </section>

          {/* Finance news */}
          <section className="flex flex-col gap-3">
            <span className="text-[10px] font-bold tracking-widest text-black/40 uppercase">
              Finance in the news
            </span>
            <ul className="flex list-none flex-col gap-3 p-0">
              {FINANCE_NEWS.map((item) => (
                <li key={item.id}>
                  <FinanceNewsCard item={item} />
                </li>
              ))}
            </ul>
          </section>

          {/* People are asking */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-widest text-black/40 uppercase">
                People are asking
              </span>
              <span className="text-base leading-none">💬</span>
            </div>
            <ul className="flex list-none flex-col gap-2 p-0">
              {PEOPLE_ARE_ASKING.map((item) => (
                <li key={item.id}>
                  <FAQCard item={item} />
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>

      <HubHeader title="Market Pulse" backHref="/news" scrolled={scrolled} />
      <HubChatInput placeholder="Ask about any stock or market…" />
    </div>
  );
}
