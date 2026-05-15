"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";

interface DailyHomeProps {
  onKundliClick: () => void;
}

// ─── Planet color map ──────────────────────────────────────────────────────────

const PLANET_COLORS: Record<string, string> = {
  Sun: "#f5a623",
  Mercury: "#4caf50",
  Mars: "#ff5722",
  Jupiter: "#2196f3",
  Venus: "#e91e8c",
  Saturn: "#607d8b",
  Moon: "#9c27b0",
  Rahu: "#ff9800",
};

// ─── Orbit Clock data ──────────────────────────────────────────────────────────

const TIME_SLOTS = [
  {
    startH: 5,
    endH: 7,
    glyph: "☉",
    planet: "Sun",
    name: "Surya",
    advice: "Surya ko jal dein — din ka shuruaat powerful hogi",
    color: "#f5a623",
  },
  {
    startH: 7,
    endH: 9,
    glyph: "☿",
    planet: "Mercury",
    name: "Budh",
    advice: "Meetings, calls, writing — sabse productive time",
    color: "#4caf50",
  },
  {
    startH: 9,
    endH: 11,
    glyph: "♂",
    planet: "Mars",
    name: "Mangal",
    advice: "Bold decisions, gym, action items — abhi karo",
    color: "#ff5722",
  },
  {
    startH: 11,
    endH: 14,
    glyph: "♃",
    planet: "Jupiter",
    name: "Guru",
    advice: "Learning, expansion — naye ideas explore karo",
    color: "#2196f3",
  },
  {
    startH: 14,
    endH: 16,
    glyph: "♀",
    planet: "Venus",
    name: "Shukra",
    advice: "Creative work, relationships — warm conversations",
    color: "#e91e8c",
  },
  {
    startH: 16,
    endH: 18,
    glyph: "♄",
    planet: "Saturn",
    name: "Shani",
    advice: "Focused deep work, long-term planning",
    color: "#607d8b",
  },
  {
    startH: 18,
    endH: 20,
    glyph: "☽",
    planet: "Moon",
    name: "Chandra",
    advice: "Family time, self-care, emotional reset",
    color: "#9c27b0",
  },
  {
    startH: 20,
    endH: 23,
    glyph: "☊",
    planet: "Rahu",
    name: "Rahu",
    advice: "Avoid major decisions — rest and reflect",
    color: "#ff9800",
  },
];

// ─── Planet Mood data ─────────────────────────────────────────────────────────

const PLANET_MOODS = [
  {
    glyph: "☿",
    name: "Budh",
    mood: "aligned",
    glowColor: "#4caf50",
    detail:
      "Budh aaj bahut strong position mein hai — communication aur clarity ke liye best time. Koi important email ya call karo.",
  },
  {
    glyph: "♂",
    name: "Mangal",
    mood: "energized",
    glowColor: "#ff5722",
    detail:
      "Mangal ki energy peak par hai. Physical work, bold decisions aur new initiatives ke liye perfect day. Gym zaroor jao.",
  },
  {
    glyph: "♀",
    name: "Shukra",
    mood: "resting",
    glowColor: "#888",
    detail:
      "Shukra aaj thoda passive hai — romantic moves ke liye wait karo. Creative projects ke liye energy moderate rahegi.",
  },
  {
    glyph: "♃",
    name: "Guru",
    mood: "aligned",
    glowColor: "#2196f3",
    detail:
      "Guru ki blessings investments aur learning par hain. Koi naya course ya financial decision aaj favorable rahega.",
  },
  {
    glyph: "♄",
    name: "Shani",
    mood: "strict",
    glowColor: "#37474f",
    detail:
      "Shani discipline demand kar raha hai. Shortcuts avoid karo, methodical approach se kaam karo aur responsibilities nibhao.",
  },
  {
    glyph: "☽",
    name: "Chandra",
    mood: "intense",
    glowColor: "#9c27b0",
    detail:
      "Chandra 8th house mein hai — emotions intense hain. Family ke saath careful communication karo, reactive mat hona.",
  },
];

// ─── Mood color helper ────────────────────────────────────────────────────────

function moodLabel(mood: string): string {
  const map: Record<string, string> = {
    aligned: "✓ Aligned",
    energized: "⚡ Energized",
    resting: "💤 Resting",
    strict: "⚠ Strict",
    intense: "🌑 Intense",
  };
  return map[mood] ?? mood;
}

// ─── Star background helper ───────────────────────────────────────────────────

function StarBg({ count, seed }: { count: number; seed: number }) {
  const stars = useMemo(() => {
    const arr: { x: number; y: number; r: number; o: number }[] = [];
    let s = seed;
    for (let i = 0; i < count; i++) {
      s = (s * 1664525 + 1013904223) & 0xffffffff;
      const x = ((s >>> 0) % 1000) / 10;
      s = (s * 1664525 + 1013904223) & 0xffffffff;
      const y = ((s >>> 0) % 1000) / 10;
      s = (s * 1664525 + 1013904223) & 0xffffffff;
      const r = 0.5 + (((s >>> 0) % 10) / 10) * 1.5;
      s = (s * 1664525 + 1013904223) & 0xffffffff;
      const o = 0.2 + ((s >>> 0) % 60) / 100;
      arr.push({ x, y, r, o });
    }
    return arr;
  }, [count, seed]);

  return (
    <svg
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
    >
      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="white" opacity={s.o} />
      ))}
    </svg>
  );
}

// ─── Section heading helper ───────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 18,
        fontWeight: 800,
        color: "#fff",
        letterSpacing: "-0.02em",
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  );
}

// ─── Aura ring SVG ────────────────────────────────────────────────────────────

function AuraRing({ score, size = 56 }: { score: number; size?: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={3}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#3535f3"
        strokeWidth={3}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── Score bar ────────────────────────────────────────────────────────────────

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div
      style={{
        height: 4,
        background: "rgba(255,255,255,0.1)",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${score}%`,
          background: color,
          borderRadius: 2,
          transition: "width 800ms ease",
        }}
      />
    </div>
  );
}

// ─── Stars display ────────────────────────────────────────────────────────────

function Stars({ count }: { count: number }) {
  return (
    <span style={{ fontSize: 11, letterSpacing: 1 }}>
      {Array.from({ length: 4 }, (_, i) => (
        <span key={i} style={{ color: i < count ? "#f5a623" : "rgba(255,255,255,0.2)" }}>
          ★
        </span>
      ))}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function DailyHome({ onKundliClick }: DailyHomeProps) {
  const [upayRevealed, setUpayRevealed] = useState(false);
  const [expandedPlanet, setExpandedPlanet] = useState<number | null>(null);
  const [checkinVote, setCheckinVote] = useState<"yes" | "no" | null>(null);
  const [chatInput, setChatInput] = useState("");
  const orbitScrollRef = useRef<HTMLDivElement>(null);

  // Determine current hour slot
  const currentHour = useMemo(() => new Date().getHours(), []);
  const currentSlotIndex = useMemo(() => {
    const idx = TIME_SLOTS.findIndex((s) => currentHour >= s.startH && currentHour < s.endH);
    return idx === -1 ? 0 : idx;
  }, [currentHour]);

  // Scroll orbit to current slot on mount
  useEffect(() => {
    if (orbitScrollRef.current) {
      const slotWidth = 140 + 12;
      const target = Math.max(0, currentSlotIndex * slotWidth - 20);
      orbitScrollRef.current.scrollLeft = target;
    }
  }, [currentSlotIndex]);

  const chips = [
    "Aaj mera din?",
    "Career advice",
    "Lucky number",
    "Kya invest karein?",
    "Love life",
  ];

  return (
    <div
      style={{
        height: "100%",
        overflowY: "auto",
        background: "#0a0a1a",
        fontFamily: "'Outfit', sans-serif",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {/* ── CSS Keyframes ── */}
      <style>{`
        @keyframes dailyFadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes dailyPulse {
          0%, 100% { opacity: 0.7; }
          50%       { opacity: 1; }
        }
        @keyframes dailyGlow {
          0%, 100% { box-shadow: 0 0 8px 2px rgba(53,53,243,0.25); }
          50%       { box-shadow: 0 0 18px 6px rgba(53,53,243,0.45); }
        }
        @keyframes dailyOrbitSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes dailyShimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes dailyBounce {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.05); }
        }
      `}</style>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 1 — HEADER
      ════════════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          paddingTop: "env(safe-area-inset-top)",
          padding: `calc(env(safe-area-inset-top) + 16px) 16px 16px`,
          display: "flex",
          alignItems: "center",
          gap: 14,
          background: "linear-gradient(180deg, #0d0d2a 0%, #0a0a1a 100%)",
          position: "sticky",
          top: 0,
          zIndex: 20,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          animation: "dailyFadeUp 400ms ease-out both",
        }}
      >
        {/* Avatar with aura ring */}
        <div style={{ position: "relative", width: 56, height: 56, flexShrink: 0 }}>
          <div style={{ position: "absolute", inset: 0 }}>
            <AuraRing score={76} size={56} />
          </div>
          <div
            style={{
              position: "absolute",
              inset: 6,
              background: "linear-gradient(135deg, #3535f3, #7b5bf7)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              fontWeight: 800,
              color: "#fff",
            }}
          >
            S
          </div>
        </div>

        {/* Name + date */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
            Shivali
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 1 }}>
            गुरुवार, 15 मई 2025
          </div>
        </div>

        {/* Aura score badge */}
        <div
          style={{
            background: "rgba(53,53,243,0.15)",
            border: "1px solid rgba(53,53,243,0.3)",
            borderRadius: 20,
            padding: "4px 10px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 900, color: "#5b8fff" }}>76</div>
          <div
            style={{
              fontSize: 8,
              color: "rgba(255,255,255,0.4)",
              letterSpacing: 0.5,
              textTransform: "uppercase",
            }}
          >
            Aura
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 2 — COSMIC TAGLINE
      ════════════════════════════════════════════════════════════════════════ */}
      <div style={{ padding: "16px 16px 0", animation: "dailyFadeUp 400ms ease-out 80ms both" }}>
        <div
          style={{
            background:
              "linear-gradient(135deg, rgba(53,53,243,0.12) 0%, rgba(91,91,247,0.08) 100%)",
            border: "1px solid rgba(53,53,243,0.2)",
            borderRadius: 16,
            padding: "14px 16px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <StarBg count={15} seed={42} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#fff",
                marginBottom: 6,
              }}
            >
              ⚡ आज की सबसे strong energy: <span style={{ color: "#5b8fff" }}>Career</span>
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(245,166,35,0.12)",
                borderRadius: 10,
                padding: "4px 10px",
                border: "1px solid rgba(245,166,35,0.2)",
              }}
            >
              <span style={{ fontSize: 10 }}>🟡</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#f5a623" }}>
                Golden Window: Jupiter, 2:18–3:07 PM
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 3 — TODAY'S ENERGY GRID
      ════════════════════════════════════════════════════════════════════════ */}
      <div style={{ padding: "20px 16px 0", animation: "dailyFadeUp 400ms ease-out 160ms both" }}>
        <SectionTitle>🔮 Aaj ki Energy</SectionTitle>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
          }}
        >
          {[
            {
              label: "Career",
              score: 82,
              stars: 4,
              color: "#ff5722",
              text: "मंगल strong — bold decisions लो",
              planet: "♂ Mars",
            },
            {
              label: "Love",
              score: 65,
              stars: 3,
              color: "#e91e8c",
              text: "Moon 8th house — patience रखें",
              planet: "☽ Moon",
            },
            {
              label: "Wealth",
              score: 85,
              stars: 4,
              color: "#2196f3",
              text: "गुरु transit — investments favorable",
              planet: "♃ Jupiter",
            },
            {
              label: "Health",
              score: 71,
              stars: 4,
              color: "#4caf50",
              text: "Energy high — workout अच्छा रहेगा",
              planet: "♂ Mars",
            },
          ].map((card) => (
            <div
              key={card.label}
              style={{
                background: "rgba(255,255,255,0.05)",
                borderRadius: 16,
                padding: "14px",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.6)",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  {card.label}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: card.color,
                    background: `${card.color}18`,
                    borderRadius: 8,
                    padding: "2px 6px",
                  }}
                >
                  {card.score}/100
                </div>
              </div>
              <ScoreBar score={card.score} color={card.color} />
              <div style={{ marginTop: 8, marginBottom: 6 }}>
                <Stars count={card.stars} />
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.65)",
                  lineHeight: 1.5,
                  marginBottom: 6,
                }}
              >
                {card.text}
              </div>
              <div
                style={{
                  display: "inline-block",
                  fontSize: 10,
                  fontWeight: 700,
                  color: card.color,
                  background: `${card.color}18`,
                  borderRadius: 20,
                  padding: "2px 8px",
                }}
              >
                {card.planet}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 4 — ORBIT CLOCK
      ════════════════════════════════════════════════════════════════════════ */}
      <div style={{ padding: "20px 16px 0", animation: "dailyFadeUp 400ms ease-out 220ms both" }}>
        <SectionTitle>⏰ आज का Planet Timeline</SectionTitle>
      </div>
      <div
        ref={orbitScrollRef}
        style={{
          display: "flex",
          gap: 12,
          padding: "0 16px 16px",
          overflowX: "auto",
          msOverflowStyle: "none",
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {TIME_SLOTS.map((slot, i) => {
          const isCurrent = i === currentSlotIndex;
          return (
            <div
              key={i}
              style={{
                flexShrink: 0,
                width: 140,
                background: isCurrent
                  ? `linear-gradient(135deg, ${slot.color}22, ${slot.color}0a)`
                  : "rgba(255,255,255,0.04)",
                border: isCurrent
                  ? `1.5px solid ${slot.color}55`
                  : "1px solid rgba(255,255,255,0.07)",
                borderRadius: 16,
                padding: "14px 12px",
                animation: isCurrent ? "dailyGlow 2.5s ease-in-out infinite" : "none",
                transition: "all 300ms ease",
              }}
            >
              {/* Time range */}
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.4)",
                  marginBottom: 6,
                }}
              >
                {slot.startH < 12
                  ? `${slot.startH} AM`
                  : slot.startH === 12
                    ? "12 PM"
                    : `${slot.startH - 12} PM`}
                {" – "}
                {slot.endH < 12
                  ? `${slot.endH} AM`
                  : slot.endH === 12
                    ? "12 PM"
                    : `${slot.endH - 12} PM`}
              </div>
              {/* Planet glyph */}
              <div
                style={{
                  fontSize: 26,
                  marginBottom: 4,
                  filter: isCurrent ? `drop-shadow(0 0 8px ${slot.color})` : "none",
                  animation: isCurrent ? "dailyBounce 2s ease-in-out infinite" : "none",
                }}
              >
                {slot.glyph}
              </div>
              {/* Planet name */}
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: isCurrent ? slot.color : "#fff",
                  marginBottom: 6,
                }}
              >
                {slot.name}
              </div>
              {/* Advice */}
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
                {slot.advice}
              </div>
              {isCurrent && (
                <div
                  style={{
                    marginTop: 8,
                    display: "inline-block",
                    fontSize: 9,
                    fontWeight: 800,
                    background: slot.color,
                    color: "#fff",
                    borderRadius: 20,
                    padding: "2px 8px",
                    letterSpacing: 0.5,
                  }}
                >
                  ● ABHI
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 5 — DAILY UPAY (RITUAL)
      ════════════════════════════════════════════════════════════════════════ */}
      <div style={{ padding: "4px 16px 0", animation: "dailyFadeUp 400ms ease-out 300ms both" }}>
        <SectionTitle>🪬 Aaj ka Upay</SectionTitle>
        <div
          onClick={() => setUpayRevealed(true)}
          style={{
            background: upayRevealed
              ? "linear-gradient(135deg, rgba(76,175,80,0.12), rgba(76,175,80,0.06))"
              : "rgba(255,255,255,0.05)",
            border: upayRevealed
              ? "1px solid rgba(76,175,80,0.25)"
              : "1px solid rgba(255,255,255,0.08)",
            borderRadius: 20,
            padding: "20px",
            cursor: upayRevealed ? "default" : "pointer",
            transition: "all 400ms ease",
            minHeight: 120,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {!upayRevealed ? (
            <>
              <div
                style={{
                  fontSize: 36,
                  marginBottom: 10,
                  animation: "dailyBounce 2s ease-in-out infinite",
                }}
              >
                🗝️
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>
                Tap karke aaj ka upay jaanein
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>
                🔒 Locked — tap to reveal
              </div>
            </>
          ) : (
            <div style={{ animation: "dailyFadeUp 400ms ease-out both" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>☿</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 8 }}>
                हरा रंग पहनें
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#4caf50", marginBottom: 10 }}>
                बुध की shakti badhegi
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.6)",
                  lineHeight: 1.6,
                  background: "rgba(76,175,80,0.08)",
                  borderRadius: 12,
                  padding: "10px 14px",
                  border: "1px solid rgba(76,175,80,0.15)",
                }}
              >
                बुध aapke doosre ghar mein hai — career aur communication ke liye green powerful hai
                aaj
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 6 — PLANET MOOD RINGS
      ════════════════════════════════════════════════════════════════════════ */}
      <div style={{ padding: "20px 16px 0", animation: "dailyFadeUp 400ms ease-out 370ms both" }}>
        <SectionTitle>🪐 Planet Moods Today</SectionTitle>

        {/* Planet circles row */}
        <div
          style={{
            display: "flex",
            gap: 10,
            overflowX: "auto",
            paddingBottom: 4,
            msOverflowStyle: "none",
            scrollbarWidth: "none",
          }}
        >
          {PLANET_MOODS.map((p, i) => (
            <div
              key={i}
              onClick={() => setExpandedPlanet(expandedPlanet === i ? null : i)}
              style={{
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                cursor: "pointer",
              }}
            >
              {/* Circle with mood glow */}
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.06)",
                  border:
                    expandedPlanet === i
                      ? `2px solid ${p.glowColor}`
                      : "1.5px solid rgba(255,255,255,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  boxShadow:
                    expandedPlanet === i
                      ? `0 0 16px 4px ${p.glowColor}55`
                      : `0 0 8px 2px ${p.glowColor}33`,
                  transition: "all 300ms ease",
                }}
              >
                {p.glyph}
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#fff", textAlign: "center" }}>
                {p.name}
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: p.glowColor,
                  fontWeight: 600,
                  background: `${p.glowColor}18`,
                  borderRadius: 10,
                  padding: "2px 6px",
                  whiteSpace: "nowrap",
                }}
              >
                {moodLabel(p.mood)}
              </div>
            </div>
          ))}
        </div>

        {/* Expanded detail panel */}
        {expandedPlanet !== null && (
          <div
            style={{
              marginTop: 12,
              background: `linear-gradient(135deg, ${PLANET_MOODS[expandedPlanet].glowColor}18, ${PLANET_MOODS[expandedPlanet].glowColor}08)`,
              border: `1px solid ${PLANET_MOODS[expandedPlanet].glowColor}30`,
              borderRadius: 16,
              padding: "14px 16px",
              animation: "dailyFadeUp 300ms ease-out both",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 24 }}>{PLANET_MOODS[expandedPlanet].glyph}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>
                  {PLANET_MOODS[expandedPlanet].name}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: PLANET_MOODS[expandedPlanet].glowColor,
                    fontWeight: 600,
                  }}
                >
                  {moodLabel(PLANET_MOODS[expandedPlanet].mood)}
                </div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>
              {PLANET_MOODS[expandedPlanet].detail}
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 7 — YESTERDAY'S CHECK-IN
      ════════════════════════════════════════════════════════════════════════ */}
      <div style={{ padding: "20px 16px 0", animation: "dailyFadeUp 400ms ease-out 430ms both" }}>
        <SectionTitle>📊 Kal ki Prediction</SectionTitle>
        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 18,
            padding: "16px",
          }}
        >
          {/* Prediction text */}
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              borderRadius: 12,
              padding: "12px 14px",
              fontSize: 13,
              fontWeight: 500,
              color: "rgba(255,255,255,0.75)",
              lineHeight: 1.6,
              marginBottom: 14,
              borderLeft: "3px solid rgba(53,53,243,0.5)",
            }}
          >
            "Aaj career mein koi unexpected opportunity aa sakti hai"
          </div>

          {checkinVote === null ? (
            <div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 10 }}>
                Kya yeh prediction sahi tha?
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => setCheckinVote("yes")}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: 12,
                    border: "1px solid rgba(76,175,80,0.3)",
                    background: "rgba(76,175,80,0.1)",
                    color: "#4caf50",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all 200ms ease",
                  }}
                  onMouseDown={(e) =>
                    ((e.currentTarget as HTMLElement).style.transform = "scale(0.96)")
                  }
                  onMouseUp={(e) => ((e.currentTarget as HTMLElement).style.transform = "scale(1)")}
                >
                  ✓ Haan, sahi tha
                </button>
                <button
                  onClick={() => setCheckinVote("no")}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: 12,
                    border: "1px solid rgba(244,67,54,0.3)",
                    background: "rgba(244,67,54,0.1)",
                    color: "#f44336",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all 200ms ease",
                  }}
                  onMouseDown={(e) =>
                    ((e.currentTarget as HTMLElement).style.transform = "scale(0.96)")
                  }
                  onMouseUp={(e) => ((e.currentTarget as HTMLElement).style.transform = "scale(1)")}
                >
                  ✗ Nahi, nahi hua
                </button>
              </div>
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "12px",
                animation: "dailyFadeUp 300ms ease-out both",
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 6 }}>
                {checkinVote === "yes" ? "🌟" : "🙏"}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
                {checkinVote === "yes" ? "Bahut badhiya!" : "Shukriya feedback ke liye!"}
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                {checkinVote === "yes"
                  ? "Stars ne sahi predict kiya — aapki chart strong hai ✨"
                  : "Aapka feedback humari accuracy improve karta hai 🔮"}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 8 — EXPLORE KUNDLI CTA
      ════════════════════════════════════════════════════════════════════════ */}
      <div style={{ padding: "20px 16px 0", animation: "dailyFadeUp 400ms ease-out 500ms both" }}>
        <div
          style={{
            background: "linear-gradient(135deg, #0d0d2a, #1a1a4e)",
            borderRadius: 20,
            padding: "22px 20px",
            border: "1px solid rgba(91,91,247,0.2)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <StarBg count={30} seed={137} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 1.5,
                color: "#7b5bf7",
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              ✦ Deep Dive
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 900,
                color: "#fff",
                letterSpacing: "-0.03em",
                marginBottom: 6,
              }}
            >
              आपकी कुंडली के राज़
            </div>
            <div
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.55)",
                lineHeight: 1.6,
                marginBottom: 18,
              }}
            >
              7 secrets about your birth chart — tap to explore
            </div>
            <button
              onClick={onKundliClick}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: 14,
                border: "none",
                background: "linear-gradient(135deg, #3535f3, #5b5bf7)",
                color: "#fff",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                boxShadow: "0 4px 20px rgba(53,53,243,0.35)",
                transition: "transform 200ms ease",
                letterSpacing: 0.2,
              }}
              onMouseDown={(e) =>
                ((e.currentTarget as HTMLElement).style.transform = "scale(0.97)")
              }
              onMouseUp={(e) => ((e.currentTarget as HTMLElement).style.transform = "scale(1)")}
            >
              Explore Kundli →
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          BOTTOM SPACER (for fixed chat bar)
      ════════════════════════════════════════════════════════════════════════ */}
      <div style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 80px)", height: 20 }} />

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 9 — FIXED BOTTOM CHAT BAR
      ════════════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 30,
          background: "linear-gradient(180deg, transparent 0%, #0a0a1a 28%)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {/* Chip suggestions */}
        <div
          style={{
            display: "flex",
            gap: 8,
            padding: "8px 16px 6px",
            overflowX: "auto",
            msOverflowStyle: "none",
            scrollbarWidth: "none",
          }}
        >
          {chips.map((chip) => (
            <button
              key={chip}
              onClick={() => setChatInput(chip)}
              style={{
                flexShrink: 0,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 20,
                padding: "6px 12px",
                color: "rgba(255,255,255,0.8)",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 150ms ease",
                whiteSpace: "nowrap",
              }}
              onMouseDown={(e) =>
                ((e.currentTarget as HTMLElement).style.background = "rgba(53,53,243,0.25)")
              }
              onMouseUp={(e) =>
                ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)")
              }
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Chat input */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "6px 16px 10px",
            background: "#0f0f22",
            borderTop: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.07)",
              borderRadius: 24,
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Stars se poochho..."
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#fff",
                fontSize: 13,
                fontFamily: "inherit",
              }}
            />
            {chatInput && (
              <button
                onClick={() => setChatInput("")}
                style={{
                  background: "none",
                  border: "none",
                  color: "rgba(255,255,255,0.4)",
                  cursor: "pointer",
                  fontSize: 14,
                  padding: 0,
                }}
              >
                ✕
              </button>
            )}
          </div>
          <button
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: "none",
              background: "linear-gradient(135deg, #3535f3, #5b5bf7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
              boxShadow: "0 2px 12px rgba(53,53,243,0.4)",
              fontSize: 16,
            }}
          >
            🎤
          </button>
        </div>
      </div>
    </div>
  );
}
