"use client";

import React, { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════
   PHASE 1 PROPS
   ═══════════════════════════════════════ */
interface Phase1Props {
  onComplete: () => void;
}

/* ═══════════════════════════════════════
   AUDIO SOURCES
   ═══════════════════════════════════════ */
const NARRATION_AUDIO_SRC = "/astro/narration.wav";
const COSMIC_BG_SRC = "/astro/cosmic_bg.wav";

/* ═══════════════════════════════════════
   KEYFRAME CSS (injected once)
   ═══════════════════════════════════════ */
const KEYFRAMES_CSS = `
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeInScale { from { opacity: 0; transform: scale(0.85); } to { opacity: 1; transform: scale(1); } }
  @keyframes scaleIn { from { opacity: 0; transform: scale(0); } to { opacity: 1; transform: scale(1); } }
  @keyframes planetDrop { 0% { transform: scale(0); opacity: 0; } 50% { transform: scale(1.3); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
  @keyframes planetGlow { 0%, 100% { filter: drop-shadow(0 0 0px transparent); } 50% { filter: drop-shadow(0 0 6px currentColor); } }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.38; } }
  @keyframes breathe { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.03); } }
  @keyframes drawLine { from { stroke-dashoffset: 500; } to { stroke-dashoffset: 0; } }
  @keyframes brightenLines { 0% { stroke: #ffd947; } 50% { stroke: #f7ab20; } 100% { stroke: #ffd947; } }
  @keyframes slideUpCard { from { opacity: 0; transform: translateY(60px) scale(0.9); } to { opacity: 1; transform: translateY(0) scale(1); } }
  @keyframes borderCycle { 0%, 100% { border-color: #9999ff; } 50% { border-color: #7aebd9; } }
  @keyframes chevronBounce { 0%, 100% { transform: translateY(0); opacity: 1; } 50% { transform: translateY(6px); opacity: 0.38; } }
  @keyframes typeReveal { from { max-height: 0; opacity: 0; } to { max-height: 200px; opacity: 1; } }
  @keyframes countUp { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
  @keyframes shimmerBg { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  @keyframes floatUp { 0% { transform: translateY(0); } 50% { transform: translateY(-4px); } 100% { transform: translateY(0); } }
  @keyframes textGlow { 0%, 100% { text-shadow: none; } 50% { text-shadow: 0 0 20px rgba(53,53,243,0.3); } }
  @keyframes waveform { 0%, 100% { height: 4px; } 50% { height: 16px; } }
  @keyframes rippleOut { 0% { transform: scale(0.8); opacity: 0.6; } 100% { transform: scale(2.5); opacity: 0; } }
  @keyframes sparkle { 0% { opacity: 0; transform: scale(0); } 50% { opacity: 1; transform: scale(1); } 100% { opacity: 0; transform: scale(0) translateY(-8px); } }
  @keyframes houseGlowPulse { 0%, 100% { opacity: 0.15; } 50% { opacity: 0.4; } }
  @keyframes slideInCaption { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
`;

/* ═══════════════════════════════════════
   NORTH INDIAN KUNDLI CHART (Diamond)
   ═══════════════════════════════════════ */
const PLANETS_IN_HOUSES: Record<
  number,
  { abbr: string; name: string; color: string; retro?: boolean }[]
> = {
  1: [{ abbr: "Ma", name: "Mars", color: "var(--planet-mars)" }],
  2: [
    { abbr: "Su", name: "Sun", color: "var(--planet-sun)" },
    { abbr: "Me", name: "Mercury", color: "var(--planet-mercury)" },
  ],
  3: [],
  4: [{ abbr: "Ve", name: "Venus", color: "var(--planet-venus)" }],
  5: [{ abbr: "Ju", name: "Jupiter", color: "var(--planet-jupiter)" }],
  6: [],
  7: [{ abbr: "Mo", name: "Moon", color: "var(--planet-moon)" }],
  8: [{ abbr: "Ke", name: "Ketu", color: "var(--planet-ketu)" }],
  9: [],
  10: [{ abbr: "Sa", name: "Saturn", color: "var(--planet-saturn)" }],
  11: [],
  12: [{ abbr: "Ra", name: "Rahu", color: "var(--planet-rahu)" }],
};

type AnimatePhase = "none" | "lines" | "houses" | "planets" | "complete" | "glow";

interface NorthIndianChartProps {
  size?: number;
  animatePhase?: AnimatePhase;
  highlightHouses?: number[];
  glowPlanets?: string[];
  dimOthers?: boolean;
}

const NorthIndianChart: React.FC<NorthIndianChartProps> = ({
  size = 260,
  animatePhase = "none",
  highlightHouses = [],
  glowPlanets = [],
  dimOthers = false,
}) => {
  const S = size;
  const pad = 2;
  const A = [pad, pad],
    B = [S - pad, pad],
    C = [S - pad, S - pad],
    D = [pad, S - pad];
  const E = [S / 2, pad],
    F = [S - pad, S / 2],
    G = [S / 2, S - pad],
    H = [pad, S / 2];
  const O = [S / 2, S / 2];
  const P1 = [S / 4, S / 4];
  const P2 = [(3 * S) / 4, S / 4];
  const P3 = [(3 * S) / 4, (3 * S) / 4];
  const P4 = [S / 4, (3 * S) / 4];

  const pts = (arr: number[][]) => arr.map((p) => p.join(",")).join(" ");

  const housePolygons: Record<number, number[][]> = {
    1: [E, P1, O, P2],
    2: [E, B, P2],
    3: [B, F, P2],
    4: [F, P2, O, P3],
    5: [F, C, P3],
    6: [C, G, P3],
    7: [G, P3, O, P4],
    8: [D, G, P4],
    9: [D, P4, H],
    10: [H, P1, O, P4],
    11: [A, P1, H],
    12: [A, E, P1],
  };

  const chartLines: number[][][] = [
    [A, B],
    [B, C],
    [C, D],
    [D, A],
    [E, F],
    [F, G],
    [G, H],
    [H, E],
    [A, C],
    [B, D],
  ];

  const housePositions: Record<number, number[]> = {
    1: [S / 2, S * 0.19],
    2: [S * 0.73, S * 0.08],
    3: [S * 0.91, S * 0.27],
    4: [S * 0.81, S / 2],
    5: [S * 0.91, S * 0.73],
    6: [S * 0.73, S * 0.92],
    7: [S / 2, S * 0.81],
    8: [S * 0.27, S * 0.92],
    9: [S * 0.09, S * 0.73],
    10: [S * 0.19, S / 2],
    11: [S * 0.09, S * 0.27],
    12: [S * 0.27, S * 0.08],
  };

  const getPlanetPos = (houseNum: number, index: number, total: number): number[] => {
    const base = housePositions[houseNum];
    if (!base) return [0, 0];
    const spacing = S < 180 ? 14 : 18;
    const offset = total > 1 ? (index - (total - 1) / 2) * spacing : 0;
    return [base[0] + offset, base[1] + (S < 180 ? 10 : 14)];
  };

  const showLines = animatePhase !== "none";
  const showPlanets =
    animatePhase === "planets" || animatePhase === "complete" || animatePhase === "glow";
  const pFontSize = S < 180 ? 7 : 9;
  const hasHighlights = highlightHouses.length > 0;

  return (
    <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id="houseGlow">
          <stop offset="0%" stopColor="#ffd947" stopOpacity={0.5} />
          <stop offset="100%" stopColor="#ffd947" stopOpacity={0.08} />
        </radialGradient>
        <filter id="planetFocusGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Cream background */}
      <rect
        x={pad}
        y={pad}
        width={S - pad * 2}
        height={S - pad * 2}
        fill="#fdf8ef"
        rx={2}
        style={{ opacity: showLines ? 1 : 0, transition: "opacity 400ms ease-out" }}
      />

      {/* House polygon fills */}
      {showLines &&
        Object.entries(housePolygons).map(([num, poly]) => {
          const isHighlighted = highlightHouses.includes(parseInt(num));
          return (
            <React.Fragment key={`hp${num}`}>
              <polygon
                points={pts(poly)}
                fill={isHighlighted ? "rgba(247,171,32,0.25)" : "transparent"}
                stroke={isHighlighted ? "rgba(247,171,32,0.6)" : "none"}
                strokeWidth={isHighlighted ? 2 : 0}
                style={{
                  transition: "fill 500ms ease-out, stroke 500ms ease-out",
                  animation: isHighlighted ? "houseGlowPulse 2s ease-in-out infinite" : "none",
                }}
              />
              {isHighlighted && (
                <polygon
                  points={pts(poly)}
                  fill="rgba(255,215,0,0.12)"
                  stroke="none"
                  style={{ animation: "breathe 1.5s ease-in-out infinite" }}
                />
              )}
            </React.Fragment>
          );
        })}

      {/* Chart lines */}
      {chartLines.map((pair, i) => {
        const p1 = pair[0];
        const p2 = pair[1];
        const len = Math.sqrt((p2[0] - p1[0]) ** 2 + (p2[1] - p1[1]) ** 2);
        return (
          <line
            key={`l${i}`}
            x1={p1[0]}
            y1={p1[1]}
            x2={p2[0]}
            y2={p2[1]}
            stroke="#a0783c"
            strokeWidth={S < 180 ? 1 : 1.5}
            strokeDasharray={len}
            strokeDashoffset={showLines ? 0 : len}
            style={{
              transition: `stroke-dashoffset 600ms ease-out ${i * 70}ms`,
              opacity: dimOthers && hasHighlights ? 0.4 : 1,
            }}
          />
        );
      })}

      {/* House numbers */}
      {showLines &&
        Object.entries(housePositions).map(([num, pos]) => {
          const isHighlighted = highlightHouses.includes(parseInt(num));
          return (
            <text
              key={`h${num}`}
              x={pos[0]}
              y={pos[1]}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#a0783c"
              fontSize={S < 180 ? 7 : 9}
              fontWeight="500"
              fontFamily="'JioType','Outfit',sans-serif"
              opacity={dimOthers && hasHighlights && !isHighlighted ? 0.1 : 0.5}
              style={{
                animation: `fadeIn 300ms ease-out ${600 + parseInt(num) * 50}ms both`,
                transition: "opacity 400ms ease-out",
              }}
            >
              {num}
            </text>
          );
        })}

      {/* Planet abbreviations */}
      {showPlanets &&
        Object.entries(PLANETS_IN_HOUSES).map(([house, planets]) =>
          planets.map((p, pi) => {
            const pos = getPlanetPos(parseInt(house), pi, planets.length);
            const isGlowing = glowPlanets.includes(p.name);
            const isDimmed = dimOthers && hasHighlights && !isGlowing;
            return (
              <g
                key={`${house}-${p.abbr}`}
                style={{
                  animation: `planetDrop 400ms ease-out ${
                    1200 + parseInt(house) * 100 + pi * 60
                  }ms both`,
                }}
              >
                {isGlowing && (
                  <>
                    <circle
                      cx={pos[0]}
                      cy={pos[1]}
                      r={S < 180 ? 18 : 26}
                      fill={p.color}
                      opacity={0.2}
                      style={{ animation: "breathe 1.5s ease-in-out infinite" }}
                    />
                    <circle
                      cx={pos[0]}
                      cy={pos[1]}
                      r={S < 180 ? 16 : 22}
                      fill="none"
                      stroke={p.color}
                      strokeWidth={2.5}
                      style={{
                        animation: "rippleOut 1.8s ease-out infinite",
                        transformOrigin: `${pos[0]}px ${pos[1]}px`,
                      }}
                    />
                    <circle
                      cx={pos[0]}
                      cy={pos[1]}
                      r={S < 180 ? 16 : 22}
                      fill="none"
                      stroke={p.color}
                      strokeWidth={2}
                      style={{
                        animation: "rippleOut 1.8s ease-out 600ms infinite",
                        transformOrigin: `${pos[0]}px ${pos[1]}px`,
                      }}
                    />
                    <circle
                      cx={pos[0]}
                      cy={pos[1]}
                      r={S < 180 ? 16 : 22}
                      fill="none"
                      stroke={p.color}
                      strokeWidth={1.5}
                      style={{
                        animation: "rippleOut 1.8s ease-out 1200ms infinite",
                        transformOrigin: `${pos[0]}px ${pos[1]}px`,
                      }}
                    />
                    <circle
                      cx={pos[0]}
                      cy={pos[1]}
                      r={S < 180 ? 13 : 18}
                      fill={p.color}
                      opacity={0.35}
                      style={{ animation: "breathe 1s ease-in-out infinite" }}
                    />
                    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, si) => {
                      const dist = S < 180 ? 24 : 34;
                      const sx = pos[0] + Math.cos((angle * Math.PI) / 180) * dist;
                      const sy = pos[1] + Math.sin((angle * Math.PI) / 180) * dist;
                      return (
                        <circle
                          key={`sp${si}`}
                          cx={sx}
                          cy={sy}
                          r={2}
                          fill={p.color}
                          style={{
                            animation: `sparkle 1.2s ease-in-out ${si * 150}ms infinite`,
                            transformOrigin: `${sx}px ${sy}px`,
                          }}
                        />
                      );
                    })}
                  </>
                )}
                <text
                  x={pos[0]}
                  y={pos[1] + 1}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={isGlowing ? "#fff" : p.color}
                  fontSize={isGlowing ? pFontSize + 6 : pFontSize}
                  fontWeight="900"
                  fontFamily="'JioType','Outfit',sans-serif"
                  opacity={isDimmed ? 0.15 : 1}
                  filter={isGlowing ? "url(#planetFocusGlow)" : "none"}
                  style={{
                    transition: "font-size 400ms ease-out, opacity 400ms ease-out",
                  }}
                >
                  {p.abbr}
                  {p.retro ? "ᴿ" : ""}
                </text>
              </g>
            );
          }),
        )}
    </svg>
  );
};

/* ═══════════════════════════════════════
   MOMENT 1 — Chart Assembly
   ═══════════════════════════════════════ */
interface ChartAssemblyProps {
  onComplete: () => void;
}

const ChartAssembly: React.FC<ChartAssemblyProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<AnimatePhase>("idle" as AnimatePhase);
  const [statusText, setStatusText] = useState("");
  const bgAudioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (bgAudioRef.current) {
      bgAudioRef.current.volume = 0.35;
      bgAudioRef.current.play().catch(() => {});
    }
    return () => {
      if (bgAudioRef.current) bgAudioRef.current.pause();
    };
  }, []);

  useEffect(() => {
    const timers = [
      setTimeout(() => {
        setPhase("lines");
        setStatusText("Kundli ki rekhaayein khich rahi hain...");
      }, 400),
      setTimeout(() => setStatusText("Bhaav sthaapit ho rahe hain..."), 2200),
      setTimeout(() => {
        setPhase("houses");
        setStatusText("Baara bhaav sthaapit ho gaye");
      }, 3500),
      setTimeout(() => {
        setPhase("planets");
        setStatusText("Grah apni jagah baith rahe hain...");
      }, 5000),
      setTimeout(() => setStatusText("Mangal... Surya... Budh... Shani..."), 6500),
      setTimeout(() => {
        setPhase("glow");
        setStatusText("Aapki kundli taiyaar hai ✦");
      }, 8500),
      setTimeout(() => onComplete(), 10500),
    ];
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chartPhase: AnimatePhase =
    phase === ("idle" as AnimatePhase)
      ? "none"
      : phase === "lines"
        ? "lines"
        : phase === "houses"
          ? "lines"
          : phase === "planets"
            ? "planets"
            : "glow";

  const progressWidth =
    phase === ("idle" as AnimatePhase)
      ? "0%"
      : phase === "lines"
        ? "25%"
        : phase === "houses"
          ? "45%"
          : phase === "planets"
            ? "70%"
            : "100%";

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a14",
        padding: 20,
      }}
    >
      <audio ref={bgAudioRef} src={COSMIC_BG_SRC} loop preload="auto" />

      <div
        style={{
          marginBottom: 28,
          textAlign: "center",
          animation: "fadeIn 500ms ease-out both",
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "#ffd947",
            marginBottom: 6,
          }}
        >
          Vedic Kundli
        </div>
        <div
          style={{
            fontSize: 18,
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: "-0.02em",
          }}
        >
          Aapki Kundli Ban Rahi Hai
        </div>
      </div>

      <NorthIndianChart
        size={250}
        animatePhase={chartPhase}
        highlightHouses={[]}
        glowPlanets={[]}
      />

      <div
        key={statusText}
        style={{
          marginTop: 28,
          textAlign: "center",
          animation: "fadeInUp 400ms ease-out both",
        }}
      >
        <span
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: "rgba(255,255,255,0.6)",
          }}
        >
          {statusText}
        </span>
      </div>

      <div
        style={{
          marginTop: 16,
          width: 120,
          height: 3,
          borderRadius: 999,
          background: "rgba(255,255,255,0.1)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            borderRadius: 999,
            background: "#ffd947",
            width: progressWidth,
            transition: "width 1.5s ease-out",
          }}
        />
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════
   MOMENT 2 — Grand Narrated Reveal
   ═══════════════════════════════════════ */
interface RevealBeat {
  time: number;
  text: string;
  planets: string[];
  houses: number[];
  type: string;
}

const REVEAL_BEATS: RevealBeat[] = [
  {
    time: 0,
    text: "Shivali ji, Namaskar!\nAapki kundli dekh kar hairaan hoon",
    planets: [],
    houses: [],
    type: "intro",
  },
  {
    time: 4500,
    text: "Ye Dekhiye — Vrishchik Lagna\nSabse powerful aur rahasyamayi raashi",
    planets: [],
    houses: [1],
    type: "sign",
  },
  {
    time: 10000,
    text: "Ye Dekhiye — Mangal, Lagna Mein\nAap bahadur hain, chunautiyon se kabhi nahi ghabrati",
    planets: ["Mars"],
    houses: [1],
    type: "planet",
  },
  {
    time: 17700,
    text: "Ye Dekhiye — Budhaditya Yog ✦\nSurya + Budh saath mein — sirf 8% mein milta hai",
    planets: ["Sun", "Mercury"],
    houses: [2],
    type: "yog",
  },
  {
    time: 26000,
    text: "Bemisal Buddhi\nAapki vaani aur buddhi dono asaadharan hain",
    planets: ["Sun", "Mercury"],
    houses: [2],
    type: "trait",
  },
  {
    time: 35200,
    text: "Ye Dekhiye — Raj Yog ✦✦\nShani Dev dasven bhaav mein — Raj Yog ban raha hai!",
    planets: ["Saturn"],
    houses: [10],
    type: "rajyog",
  },
  {
    time: 42000,
    text: "Career Ka Sabse Shubh Sthaan\nYe sabse mazboot position hai career ke liye",
    planets: ["Saturn"],
    houses: [10],
    type: "career",
  },
  {
    time: 47000,
    text: "Sunhara Daur Shuru Ho Raha Hai\n2026–27 mein badi safalta milegi",
    planets: ["Saturn"],
    houses: [10],
    type: "prediction",
  },
  {
    time: 51900,
    text: "Ye Dekhiye — Chandra, 7th House\nRishton mein aap bahut gehri hain",
    planets: ["Moon"],
    houses: [7],
    type: "planet",
  },
  {
    time: 60000,
    text: "Aapki Sabse Badi Taakat\nJab bharosa karti hain — poori jaan laga deti hain",
    planets: ["Moon"],
    houses: [7],
    type: "personality",
  },
  {
    time: 70500,
    text: "Cosmic Score: 78/100\nTop 15% — Sitaare aapke saath hain!",
    planets: [],
    houses: [],
    type: "score",
  },
  {
    time: 79000,
    text: "Shivali ji ✦\nAapka sunhara daur ab shuru hone wala hai",
    planets: [],
    houses: [],
    type: "closing",
  },
];

interface NarrationRevealProps {
  onComplete: () => void;
  onSkip: () => void;
}

const NarrationReveal: React.FC<NarrationRevealProps> = ({ onComplete, onSkip }) => {
  const [beatIndex, setBeatIndex] = useState(-1);
  const [showSkip, setShowSkip] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const bgRef = useRef<HTMLAudioElement>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const startNarration = () => {
    if (started) return;
    setStarted(true);
    if (audioRef.current) {
      audioRef.current
        .play()
        .then(() => setAudioPlaying(true))
        .catch((e) => console.log("Audio err:", e));
    }
    if (bgRef.current) {
      bgRef.current.volume = 0.15;
      bgRef.current.play().catch(() => {});
    }
    REVEAL_BEATS.forEach((beat, i) => {
      const t = setTimeout(() => setBeatIndex(i), beat.time + 300);
      timersRef.current.push(t);
    });
    setBeatIndex(0);
    const skipT = setTimeout(() => setShowSkip(true), 5000);
    const endT = setTimeout(() => onComplete(), 89000);
    timersRef.current.push(skipT, endT);
  };

  useEffect(() => {
    return () => timersRef.current.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSkip = () => {
    timersRef.current.forEach(clearTimeout);
    if (audioRef.current) audioRef.current.pause();
    if (bgRef.current) bgRef.current.pause();
    onSkip();
  };

  const currentBeat = beatIndex >= 0 ? REVEAL_BEATS[beatIndex] : null;
  const glowPlanets = currentBeat ? currentBeat.planets : [];
  const highlightHouses = currentBeat ? currentBeat.houses : [];
  const hasFocus = glowPlanets.length > 0 || highlightHouses.length > 0;

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#0a0a14",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <audio
        ref={audioRef}
        src={NARRATION_AUDIO_SRC}
        preload="auto"
        onEnded={() => {
          setAudioPlaying(false);
          if (bgRef.current) bgRef.current.pause();
        }}
        onError={(e) => console.error("Audio load error:", (e.target as HTMLAudioElement).error)}
        onCanPlayThrough={() => console.log("Audio ready to play")}
      />
      <audio ref={bgRef} src={COSMIC_BG_SRC} loop preload="auto" />

      {/* Tap to start overlay */}
      {!started && (
        <div
          onClick={startNarration}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#0a0a14",
            cursor: "pointer",
          }}
        >
          <div style={{ animation: "breathe 3s ease-in-out infinite" }}>
            <NorthIndianChart
              size={200}
              animatePhase="complete"
              glowPlanets={[]}
              highlightHouses={[]}
            />
          </div>
          <div style={{ marginTop: 24, textAlign: "center" }}>
            <div
              style={{
                fontSize: 20,
                fontWeight: 900,
                color: "#ffffff",
                letterSpacing: "-0.03em",
                marginBottom: 6,
              }}
            >
              Aapki Kundli Ready Hai
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "#3535f3",
                color: "#ffffff",
                padding: "12px 24px",
                borderRadius: 999,
                fontSize: 14,
                fontWeight: 700,
                marginTop: 12,
                animation: "pulse 2s ease-in-out infinite",
              }}
            >
              <svg viewBox="0 0 24 24" width={18} height={18} fill="none">
                <path d="M8 5v14l11-7z" fill="currentColor" />
              </svg>
              Tap to Hear Your Reading
            </div>
          </div>
        </div>
      )}

      {/* Chart hero area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "12px 20px 0",
          opacity: started ? 1 : 0,
          transition: "opacity 600ms ease-out",
          position: "relative",
        }}
      >
        {hasFocus && (
          <div
            style={{
              position: "absolute",
              width: 300,
              height: 300,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(247,171,32,0.12) 0%, transparent 70%)",
              animation: "breathe 2s ease-in-out infinite",
              pointerEvents: "none",
            }}
          />
        )}

        <NorthIndianChart
          size={260}
          animatePhase="complete"
          glowPlanets={glowPlanets}
          highlightHouses={highlightHouses}
          dimOthers={hasFocus}
        />

        {audioPlaying && (
          <div
            style={{
              marginTop: 12,
              display: "flex",
              alignItems: "center",
              gap: 6,
              animation: "fadeIn 400ms ease-out both",
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: 999,
                background: "#ff6644",
                animation: "breathe 1.5s ease-in-out infinite",
              }}
            />
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: "rgba(255,255,255,0.35)",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              Live Reading
            </span>
          </div>
        )}
      </div>

      {/* Caption bar */}
      <div
        style={{
          padding: "16px 20px 20px",
          background: "linear-gradient(to top, #0a0a14 60%, transparent)",
          minHeight: 180,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 8,
        }}
      >
        {currentBeat && (
          <div
            key={beatIndex}
            style={{
              animation: "slideInCaption 450ms cubic-bezier(0.16, 1, 0.3, 1) both",
              textAlign: "center",
              width: "100%",
            }}
          >
            {["yog", "rajyog", "prediction", "career", "score", "closing"].includes(
              currentBeat.type,
            ) && (
              <div
                style={{
                  display: "inline-block",
                  marginBottom: 8,
                  background: ["yog", "rajyog"].includes(currentBeat.type)
                    ? "#fef7e9"
                    : ["prediction", "career"].includes(currentBeat.type)
                      ? "#e8faf7"
                      : "#e8e8fc",
                  padding: "3px 10px",
                  borderRadius: 999,
                  animation: "fadeInScale 300ms ease-out both",
                }}
              >
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: ["yog", "rajyog"].includes(currentBeat.type)
                      ? "#ac660c"
                      : ["prediction", "career"].includes(currentBeat.type)
                        ? "#1e7b74"
                        : "#3535f3",
                  }}
                >
                  {currentBeat.type === "yog"
                    ? "✦ Rare Yog Found"
                    : currentBeat.type === "rajyog"
                      ? "✦✦ Raj Yog!"
                      : currentBeat.type === "career"
                        ? "⟐ Career Insight"
                        : currentBeat.type === "prediction"
                          ? "⟐ Golden Period"
                          : currentBeat.type === "closing"
                            ? "✦ Shubh Aarambh"
                            : "◈ Your Cosmic Rank"}
                </span>
              </div>
            )}

            {currentBeat.text.split("\n").map((line, i) => (
              <div
                key={i}
                style={{
                  fontSize: i === 0 ? 24 : 15,
                  fontWeight: i === 0 ? 900 : 500,
                  letterSpacing: i === 0 ? "-0.02em" : "0.01em",
                  lineHeight: 1.25,
                  color: i === 0 ? "#ffffff" : "rgba(255,255,255,0.65)",
                  animation: `fadeInUp 350ms ease-out ${i * 150}ms both`,
                  marginTop: i > 0 ? 4 : 0,
                }}
              >
                {line}
              </div>
            ))}
          </div>
        )}

        {/* Beat progress dots */}
        <div style={{ display: "flex", gap: 4, marginTop: 10 }}>
          {REVEAL_BEATS.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === beatIndex ? 20 : 5,
                height: 5,
                borderRadius: 999,
                background: i <= beatIndex ? "#ffd947" : "rgba(255,255,255,0.2)",
                transition: "all 400ms ease-out",
              }}
            />
          ))}
        </div>
      </div>

      {/* Skip button */}
      {showSkip && (
        <button
          onClick={handleSkip}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            background: "rgba(255,255,255,0.1)",
            border: "none",
            cursor: "pointer",
            borderRadius: 999,
            padding: "6px 14px",
            fontSize: 12,
            fontWeight: 700,
            color: "rgba(255,255,255,0.6)",
            fontFamily: "'JioType','Outfit',sans-serif",
            animation: "fadeIn 300ms ease-out",
            backdropFilter: "blur(8px)",
          }}
        >
          Skip ›
        </button>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════
   MOMENT 3 — Grand Identity Card
   ═══════════════════════════════════════ */
const PERSONALITY_TRAITS = [
  "You feel everything deeply but show nothing",
  "People either love you or fear you",
  "You think 10 steps ahead of everyone",
];

const RARITY_ITEMS = [
  {
    label: "Budhaditya Yog",
    detail: "Only 8% have this",
    color: "#f7ab20",
  },
  {
    label: "Mars in Lagna",
    detail: "Natural born leader",
    color: "#ff6644",
  },
];

const CountUpNumber: React.FC<{ target: number; duration?: number }> = ({
  target,
  duration = 1000,
}) => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const interval = setInterval(() => {
      start += step;
      if (start >= target) {
        setValue(target);
        clearInterval(interval);
      } else {
        setValue(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(interval);
  }, [target, duration]);
  return <span>{value}</span>;
};

const ArcGauge: React.FC<{ score: number; animate: boolean }> = ({ score, animate }) => {
  const r = 44,
    sw = 5,
    cx = 50,
    cy = 48;
  const circ = Math.PI * r;
  const target = circ - (circ * score) / 100;
  return (
    <div style={{ position: "relative", width: 100, height: 60, margin: "0 auto" }}>
      <svg width={100} height={60} viewBox="0 0 100 60">
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="#00004c"
          strokeWidth={sw}
          opacity={0.38}
          strokeLinecap="round"
        />
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="#1eccb0"
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={animate ? target : circ}
          style={{
            transition: animate ? "stroke-dashoffset 1.2s ease-out" : "none",
          }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 900,
            letterSpacing: "-0.03em",
            color: "#ffffff",
            lineHeight: 1,
          }}
        >
          {animate ? <CountUpNumber target={score} duration={1200} /> : 0}
        </div>
      </div>
    </div>
  );
};

interface IdentityCardProps {
  onComplete: () => void;
  screenRef: React.RefObject<HTMLDivElement | null>;
}

const IdentityCard: React.FC<IdentityCardProps> = ({ onComplete, screenRef }) => {
  const [step, setStep] = useState(0);
  const [arcAnimate, setArcAnimate] = useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 400),
      setTimeout(() => setStep(2), 1800),
      setTimeout(() => setStep(3), 3000),
      setTimeout(() => setStep(4), 5500),
      setTimeout(() => setStep(5), 7500),
      setTimeout(() => {
        setStep(6);
        setArcAnimate(true);
      }, 9000),
      setTimeout(() => {
        setStep(7);
        setTimeout(() => {
          if (screenRef.current) {
            screenRef.current.scrollTo({
              top: screenRef.current.scrollHeight,
              behavior: "smooth",
            });
          }
        }, 500);
      }, 12000),
    ];
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      id="identity-scroll"
      style={{
        minHeight: "100%",
        background: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 20,
        paddingBottom: 60,
      }}
    >
      {/* The Card */}
      <div
        style={{
          width: "85%",
          maxWidth: 290,
          background: "#3900ad",
          borderRadius: 24,
          border: step >= 1 ? "2px solid #9999ff" : "2px solid transparent",
          animation:
            step >= 1
              ? "slideUpCard 700ms ease-out both, borderCycle 4s ease-in-out infinite"
              : "none",
          padding: "24px 20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          position: "relative",
          overflow: "hidden",
          opacity: step >= 1 ? 1 : 0,
        }}
      >
        {/* Step 1: Archetype Title */}
        {step >= 1 && (
          <div
            style={{
              textAlign: "center",
              animation: "fadeInScale 500ms ease-out both",
            }}
          >
            <div
              style={{
                fontSize: 40,
                lineHeight: 1,
                marginBottom: 4,
                opacity: 0.85,
                color: "#ffffff",
              }}
            >
              ♏
            </div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "#7aebd9",
                marginBottom: 4,
              }}
            >
              Your Cosmic Archetype
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 900,
                letterSpacing: "-0.03em",
                color: "#ffffff",
                lineHeight: 1.1,
              }}
            >
              The Deep
              <br />
              Strategist
            </div>
          </div>
        )}

        {/* Step 2: Sign + Element */}
        {step >= 2 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              justifyContent: "center",
              animation: "fadeInUp 400ms ease-out both",
            }}
          >
            <span style={{ fontSize: 16, fontWeight: 700, color: "#ffffff" }}>
              Vrishchik · Scorpio
            </span>
            <span
              style={{
                background: "#ffd947",
                color: "#141414",
                fontSize: 11,
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: 999,
              }}
            >
              Water
            </span>
          </div>
        )}

        {/* Step 3: Personality Mirror */}
        {step >= 3 && (
          <div
            style={{
              width: "100%",
              padding: "12px 16px",
              background: "rgba(255,255,255,0.08)",
              borderRadius: 16,
              animation: "fadeInUp 500ms ease-out both",
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "#7aebd9",
                marginBottom: 8,
              }}
            >
              Your Stars Say About You
            </div>
            {PERSONALITY_TRAITS.map((trait, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                  marginBottom: i < PERSONALITY_TRAITS.length - 1 ? 8 : 0,
                  animation: `fadeInUp 300ms ease-out ${i * 200}ms both`,
                }}
              >
                <div
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: 999,
                    marginTop: 6,
                    background: "#7aebd9",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    lineHeight: 1.4,
                    color: "#ffffff",
                  }}
                >
                  {trait}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Step 4: Rarity Badges */}
        {step >= 4 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              justifyContent: "center",
              animation: "fadeInUp 400ms ease-out both",
            }}
          >
            {RARITY_ITEMS.map((item, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 12,
                  padding: "8px 12px",
                  textAlign: "center",
                  animation: `fadeInScale 400ms ease-out ${i * 150}ms both`,
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: item.color }}>{item.label}</div>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    color: "#ffffff",
                    opacity: 0.65,
                    marginTop: 2,
                  }}
                >
                  {item.detail}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 5: Ruling Planet + Life Path */}
        {step >= 5 && (
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              animation: "fadeInUp 400ms ease-out both",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 999,
                  background: "#ff6644",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  color: "#ffffff",
                  fontWeight: 700,
                }}
              >
                ♂
              </div>
              <div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#ffffff",
                  }}
                >
                  Mars
                </div>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    color: "#ffffff",
                    opacity: 0.38,
                  }}
                >
                  Ruling Planet
                </div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                  color: "#ffffff",
                  lineHeight: 1,
                }}
              >
                7
              </div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#ffffff",
                  opacity: 0.38,
                }}
              >
                Life Path
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Cosmic Score */}
        {step >= 6 && (
          <div style={{ width: "100%", animation: "fadeIn 500ms ease-out both" }}>
            <ArcGauge score={78} animate={arcAnimate} />
            <div
              style={{
                textAlign: "center",
                marginTop: 4,
                fontSize: 12,
                fontWeight: 700,
                color: "#7aebd9",
              }}
            >
              Harmonious
            </div>
            <div
              style={{
                textAlign: "center",
                marginTop: 2,
                fontSize: 11,
                fontWeight: 700,
                color: "#ffffff",
                opacity: 0.38,
              }}
            >
              Cosmic Score
            </div>
          </div>
        )}

        {/* Step 7: Year Promise */}
        {step >= 7 && (
          <div
            style={{
              width: "100%",
              textAlign: "center",
              background: "rgba(122,235,217,0.12)",
              borderRadius: 12,
              padding: "10px 16px",
              animation: "fadeInUp 400ms ease-out both",
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "#7aebd9",
                marginBottom: 4,
              }}
            >
              Coming Up For You
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#ffffff" }}>
              2026-27: Career Golden Period
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: "#ffffff",
                opacity: 0.65,
                marginTop: 2,
              }}
            >
              Saturn activating your 10th house
            </div>
          </div>
        )}
      </div>

      {/* CTA — below card */}
      {step >= 7 && (
        <div
          style={{
            marginTop: 24,
            textAlign: "center",
            animation: "fadeInUp 500ms ease-out 400ms both",
          }}
        >
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#3535f3",
              marginBottom: 16,
              animation: "textGlow 3s ease-in-out infinite",
            }}
          >
            Your identity is just the beginning
          </div>
          <button
            onClick={() => onComplete()}
            style={{
              padding: "14px 36px",
              borderRadius: 30,
              border: "none",
              background: "linear-gradient(135deg, #3535f3, #5b5bf7)",
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              fontFamily: "'JioType','Outfit',sans-serif",
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(53,53,243,0.35)",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              transition: "transform 200ms ease",
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.96)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <span>✨</span>
            <span>Explore My Stars</span>
            <span>→</span>
          </button>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════
   ROOT — Phase1 Component
   ═══════════════════════════════════════ */
export default function Phase1({ onComplete }: Phase1Props) {
  const [moment, setMoment] = useState<"assembly" | "narration" | "card">("assembly");
  const screenRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES_CSS }} />
      <div
        ref={screenRef}
        style={{
          height: "100%",
          overflowY: "auto",
          overflowX: "hidden",
          position: "relative",
          background: "#0a0a14",
          scrollBehavior: "smooth",
          fontFamily: "'JioType','Outfit',sans-serif",
          WebkitFontSmoothing: "antialiased",
          paddingTop: "env(safe-area-inset-top)",
        }}
      >
        {moment === "assembly" && <ChartAssembly onComplete={() => setMoment("narration")} />}
        {moment === "narration" && (
          <NarrationReveal onComplete={() => setMoment("card")} onSkip={() => setMoment("card")} />
        )}
        {moment === "card" && <IdentityCard onComplete={onComplete} screenRef={screenRef} />}
      </div>
    </>
  );
}
