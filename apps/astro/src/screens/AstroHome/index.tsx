"use client";
import React, { useState, useEffect } from "react";
import { ASTRO_HOME_CSS } from "./styles";
import { HeroCard, StoryCardPreview, StoryOverlay } from "./StorySection";
import { LivingSolarSystem, PlanetStoryCapsule } from "./SolarSystem";
import { ORBIT_PLANETS, type OrbitPlanet } from "./data";
import {
  CelestialRitualTimeline,
  RitualRevealOverlay,
  DestinyWalkV2,
  YearCapsuleOverlay,
} from "./Rituals";

// ─── Overlay type ────────────────────────────────────────────────────────────

export type Overlay =
  | null
  | { type: "story"; index: number }
  | { type: "planet"; planet: any; planetIndex: number }
  | { type: "ritual"; ritual: any }
  | { type: "yearCapsule"; age: number };

// ─── MiniHeader ──────────────────────────────────────────────────────────────

const MiniHeader = () => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "10px 16px",
      borderBottom: "1px solid var(--stroke-minimal)",
      background: "var(--white)",
      position: "sticky",
      top: 0,
      zIndex: 10,
    }}
  >
    <span style={{ fontSize: 18, color: "var(--primary-50)" }}>♏</span>
    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-high)" }}>Vrishchik</span>
    <div style={{ flex: 1 }} />
    <span style={{ fontSize: 11, fontWeight: 500, color: "var(--text-disabled)" }}>●</span>
  </div>
);

// ─── SectionHeader ───────────────────────────────────────────────────────────

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  delay?: number;
}

const SectionHeader = ({ title, subtitle, delay = 0 }: SectionHeaderProps) => (
  <div style={{ padding: "20px 16px 8px", animation: `fadeInUp 500ms ease-out ${delay}ms both` }}>
    <div
      style={{ fontSize: 18, fontWeight: 900, color: "var(--text-high)", letterSpacing: "-0.03em" }}
    >
      {title}
    </div>
    {subtitle && (
      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-low)", marginTop: 3 }}>
        {subtitle}
      </div>
    )}
  </div>
);

// ─── CelebrityKundliMatch ────────────────────────────────────────────────────

const CelebrityKundliMatch = () => {
  const [expanded, setExpanded] = useState(false);
  const CELEB_IMG =
    "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/316600/316605.png";
  const USER_IMG = "https://i.pravatar.cc/150?img=47";

  const traits = [
    { label: "Rashi", you: "Vrishchik", celeb: "Vrishchik", match: true },
    { label: "Nakshatra", you: "Anuradha", celeb: "Anuradha", match: true },
    { label: "Lagna Lord", you: "Mangal", celeb: "Mangal", match: true },
    { label: "Dasha Now", you: "Shani", celeb: "Guru", match: false },
  ];

  return (
    <div
      style={{
        margin: "8px 16px 16px",
        borderRadius: 20,
        background: "var(--white)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        overflow: "hidden",
        border: "1px solid rgba(0,0,0,0.04)",
        animation: "fadeInUp 500ms ease-out 400ms both",
      }}
    >
      {/* Hero — Two photos side by side with match info */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{ cursor: "pointer", padding: "20px 16px 16px" }}
      >
        {/* Top label */}
        <div style={{ textAlign: "center", marginBottom: 14 }}>
          <span
            style={{
              fontSize: 9,
              fontWeight: 800,
              color: "var(--primary-50)",
              textTransform: "uppercase",
              letterSpacing: 1.5,
            }}
          >
            ♏ Kundli Twin
          </span>
        </div>

        {/* Photos side by side */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
          {/* You */}
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                overflow: "hidden",
                border: "3px solid var(--primary-50)",
                boxShadow: "0 4px 16px rgba(53,53,243,0.15)",
              }}
            >
              <img
                src={USER_IMG}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-high)", marginTop: 6 }}>
              You
            </div>
            <div style={{ fontSize: 9, fontWeight: 600, color: "var(--text-disabled)" }}>
              Vrishchik ♏
            </div>
          </div>

          {/* Match badge in center */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <div
              style={{
                background: "var(--primary-50)",
                borderRadius: 12,
                padding: "5px 12px",
                fontSize: 14,
                fontWeight: 900,
                color: "#fff",
              }}
            >
              87%
            </div>
            <div
              style={{
                fontSize: 8,
                fontWeight: 700,
                color: "var(--text-disabled)",
                letterSpacing: 0.5,
              }}
            >
              MATCH
            </div>
          </div>

          {/* Virat Kohli */}
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                overflow: "hidden",
                border: "3px solid var(--primary-50)",
                boxShadow: "0 4px 16px rgba(53,53,243,0.15)",
              }}
            >
              <img
                src={CELEB_IMG}
                alt="Virat Kohli"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-high)", marginTop: 6 }}>
              Virat Kohli
            </div>
            <div style={{ fontSize: 9, fontWeight: 600, color: "var(--text-disabled)" }}>
              Vrishchik ♏
            </div>
          </div>
        </div>

        {/* Tagline */}
        <div style={{ textAlign: "center", marginTop: 12 }}>
          <div
            style={{ fontSize: 14, fontWeight: 800, color: "var(--text-high)", lineHeight: 1.3 }}
          >
            Same rashi, same nakshatra, same fire
          </div>
          <div
            style={{ fontSize: 10, color: "var(--text-disabled)", marginTop: 3, fontWeight: 500 }}
          >
            Mars-ruled warriors — pressure mein aur sharp
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "var(--stroke-minimal)", margin: "0 16px" }} />

      {/* Bottom section */}
      <div style={{ padding: "12px 14px 14px" }}>
        {/* Quick trait comparison — always visible */}
        <div style={{ display: "flex", gap: 6 }}>
          {traits.map((t, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                textAlign: "center",
                padding: "6px 2px",
                background: t.match ? "rgba(53,53,243,0.03)" : "var(--surface-ghost)",
                borderRadius: 10,
                border: t.match ? "1px solid rgba(53,53,243,0.08)" : "1px solid transparent",
              }}
            >
              <div
                style={{
                  fontSize: 8,
                  fontWeight: 700,
                  color: "var(--text-disabled)",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                {t.label}
              </div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  marginTop: 2,
                  color: t.match ? "var(--primary-50)" : "var(--text-low)",
                }}
              >
                {t.match ? "✓ Same" : "≠ Diff"}
              </div>
            </div>
          ))}
        </div>

        {/* Expand / collapse insight */}
        {!expanded ? (
          <div
            onClick={() => setExpanded(true)}
            style={{ marginTop: 10, textAlign: "center", cursor: "pointer" }}
          >
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--primary-50)" }}>
              See full comparison ↓
            </span>
          </div>
        ) : (
          <div style={{ marginTop: 12, animation: "fadeInUp 300ms ease-out" }}>
            {/* Side-by-side comparison */}
            <div style={{ display: "flex", gap: 8 }}>
              {/* You column */}
              <div
                style={{
                  flex: 1,
                  background: "var(--surface-ghost)",
                  borderRadius: 12,
                  padding: "10px",
                }}
              >
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 800,
                    color: "var(--text-disabled)",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    marginBottom: 6,
                  }}
                >
                  You
                </div>
                {traits.map((t, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "var(--text-high)",
                      padding: "4px 0",
                      borderBottom:
                        i < traits.length - 1 ? "1px solid var(--stroke-minimal)" : "none",
                    }}
                  >
                    <span style={{ color: "var(--text-disabled)", fontSize: 9 }}>{t.label} </span>
                    {t.you}
                  </div>
                ))}
              </div>

              {/* Virat column */}
              <div
                style={{
                  flex: 1,
                  background: "var(--surface-ghost)",
                  borderRadius: 12,
                  padding: "10px",
                }}
              >
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 800,
                    color: "var(--text-disabled)",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    marginBottom: 6,
                  }}
                >
                  Virat
                </div>
                {traits.map((t, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "var(--text-high)",
                      padding: "4px 0",
                      borderBottom:
                        i < traits.length - 1 ? "1px solid var(--stroke-minimal)" : "none",
                    }}
                  >
                    <span style={{ color: "var(--text-disabled)", fontSize: 9 }}>{t.label} </span>
                    {t.celeb}
                  </div>
                ))}
              </div>
            </div>

            {/* Insight paragraph */}
            <div
              style={{
                marginTop: 10,
                padding: "10px 12px",
                background: "rgba(53,53,243,0.04)",
                borderRadius: 12,
                border: "1px solid rgba(53,53,243,0.06)",
              }}
            >
              <div
                style={{ fontSize: 11, fontWeight: 500, color: "var(--text-low)", lineHeight: 1.6 }}
              >
                Virat aur aap dono <b style={{ color: "var(--text-high)" }}>Vrishchik rashi</b> ke
                hain — Mars-ruled warrior energy jo pressure mein aur sharp hoti hai. Same Anuradha
                nakshatra means deep loyalty aur laser focus.
              </div>
            </div>

            <div
              onClick={() => setExpanded(false)}
              style={{ marginTop: 8, textAlign: "center", cursor: "pointer" }}
            >
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-disabled)" }}>
                Show less ↑
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── AvatarFigure ─────────────────────────────────────────────────────────────

interface AvatarFigureProps {
  stage: "baby" | "child" | "teen" | "youngAdult" | "adult" | "elder";
  size: number;
  glowing?: boolean;
}

const AvatarFigure = ({ stage, size: s, glowing }: AvatarFigureProps) => {
  const glow = glowing
    ? "drop-shadow(0 0 6px rgba(53,53,243,0.4)) drop-shadow(0 0 12px rgba(53,53,243,0.2))"
    : "none";
  const fill = glowing ? "var(--primary-50)" : "rgba(0,0,0,0.3)";

  if (stage === "baby")
    return (
      <svg width={s} height={s} viewBox="0 0 24 32" style={{ filter: glow }}>
        <circle cx="12" cy="8" r="6" fill={fill} />
        <ellipse cx="12" cy="22" rx="6" ry="8" fill={fill} />
      </svg>
    );
  if (stage === "child")
    return (
      <svg width={s} height={s} viewBox="0 0 24 40" style={{ filter: glow }}>
        <circle cx="12" cy="7" r="5.5" fill={fill} />
        <rect x="7" y="13" width="10" height="14" rx="3" fill={fill} />
        <rect x="7" y="27" width="4" height="10" rx="2" fill={fill} />
        <rect x="13" y="27" width="4" height="10" rx="2" fill={fill} />
      </svg>
    );
  if (stage === "teen")
    return (
      <svg width={s} height={s} viewBox="0 0 24 48" style={{ filter: glow }}>
        <circle cx="12" cy="6" r="5" fill={fill} />
        <rect x="7" y="12" width="10" height="16" rx="3" fill={fill} />
        <rect x="7" y="28" width="4" height="14" rx="2" fill={fill} />
        <rect x="13" y="28" width="4" height="14" rx="2" fill={fill} />
        <rect x="2" y="14" width="5" height="3" rx="1.5" fill={fill} />
        <rect x="17" y="14" width="5" height="3" rx="1.5" fill={fill} />
      </svg>
    );
  if (stage === "youngAdult")
    return (
      <svg width={s} height={s} viewBox="0 0 24 52" style={{ filter: glow }}>
        <circle cx="12" cy="5.5" r="5" fill={fill} />
        <path d="M7 11 L5 28 L8 28 L9 18 L12 20 L15 18 L16 28 L19 28 L17 11 Z" fill={fill} />
        <rect x="6" y="28" width="4.5" height="16" rx="2" fill={fill} />
        <rect x="13.5" y="28" width="4.5" height="16" rx="2" fill={fill} />
      </svg>
    );
  if (stage === "adult")
    return (
      <svg width={s} height={s} viewBox="0 0 28 56" style={{ filter: glow }}>
        <circle cx="14" cy="6" r="5.5" fill={fill} />
        <path d="M8 12 L6 32 L10 32 L11 20 L14 22 L17 20 L18 32 L22 32 L20 12 Z" fill={fill} />
        <rect x="7" y="32" width="5" height="18" rx="2.5" fill={fill} />
        <rect x="16" y="32" width="5" height="18" rx="2.5" fill={fill} />
      </svg>
    );
  // elder
  return (
    <svg width={s} height={s} viewBox="0 0 28 52" style={{ filter: glow }}>
      <circle cx="14" cy="6" r="5" fill={fill} />
      <path d="M9 12 L8 30 L12 30 L12.5 20 L14 21 L15.5 20 L16 30 L20 30 L19 12 Z" fill={fill} />
      <rect x="8" y="30" width="5" height="15" rx="2" fill={fill} />
      <rect x="15" y="30" width="5" height="15" rx="2" fill={fill} />
      <line x1="5" y1="20" x2="9" y2="18" stroke={fill} strokeWidth="2" strokeLinecap="round" />
      <line x1="5" y1="20" x2="5" y2="34" stroke={fill} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
};

// ─── AskTheStars ──────────────────────────────────────────────────────────────

const AskTheStars = () => {
  const chips = [
    { text: "When should I change jobs?", highlighted: true },
    { text: "Will I find love soon?" },
    { text: "What health risks to watch?" },
    { text: "Is this a good year to invest?" },
    { text: "What's my life purpose?" },
  ];

  return (
    <div style={{ padding: "0 16px 24px", animation: "fadeInUp 500ms ease-out 1100ms both" }}>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div
          style={{
            fontSize: 22,
            fontWeight: 900,
            color: "var(--text-high)",
            letterSpacing: "-0.03em",
          }}
        >
          Ask the Stars
        </div>
        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-low)", marginTop: 4 }}>
          Your chart has answers. Just ask.
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {chips.map((c, i) => (
          <div
            key={i}
            style={{
              padding: "8px 14px",
              borderRadius: 999,
              cursor: "pointer",
              background: c.highlighted ? "var(--primary-20)" : "var(--surface-ghost)",
              color: c.highlighted ? "var(--primary-50)" : "var(--text-high)",
              fontSize: 13,
              fontWeight: c.highlighted ? 700 : 500,
              animation: `staggerIn 300ms ease-out ${1200 + i * 80}ms both`,
              transition: "transform 100ms",
            }}
            onMouseDown={(e) => ((e.currentTarget as HTMLElement).style.transform = "scale(0.95)")}
            onMouseUp={(e) => ((e.currentTarget as HTMLElement).style.transform = "scale(1)")}
          >
            {c.highlighted && <span style={{ marginRight: 4 }}>✦</span>}
            {c.text}
          </div>
        ))}
      </div>

      {/* Static chat input bar */}
      <div
        style={{
          marginTop: 16,
          background: "var(--surface-ghost)",
          borderRadius: 999,
          padding: "12px 18px",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-disabled)", flex: 1 }}>
          Ask about your life...
        </span>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            background: "var(--primary-50)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: 12, color: "white" }}>🎤</span>
        </div>
      </div>
    </div>
  );
};

// ─── DailyCompanionCTA ────────────────────────────────────────────────────────

interface DailyCompanionCTAProps {
  onDailyClick: () => void;
}

const DailyCompanionCTA = ({ onDailyClick }: DailyCompanionCTAProps) => (
  <div
    style={{
      margin: "24px 16px 0",
      paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)",
    }}
  >
    <div
      style={{
        padding: "24px 20px",
        borderRadius: 20,
        background: "linear-gradient(135deg, #0d0d2a 0%, #1a1a4e 50%, #0f3460 100%)",
        position: "relative",
        overflow: "hidden",
        animation: "fadeInUp 500ms ease-out both",
      }}
    >
      {/* Decorative stars */}
      <div style={{ position: "absolute", top: 12, right: 16, fontSize: 20, opacity: 0.15 }}>
        ✨
      </div>
      <div style={{ position: "absolute", bottom: 16, left: 20, fontSize: 14, opacity: 0.1 }}>
        ⭐
      </div>
      <div
        style={{
          position: "absolute",
          top: 30,
          right: 50,
          width: 3,
          height: 3,
          borderRadius: "50%",
          background: "#fff",
          opacity: 0.2,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 40,
          right: 30,
          width: 2,
          height: 2,
          borderRadius: "50%",
          background: "#fff",
          opacity: 0.15,
        }}
      />

      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 1.5,
          color: "var(--sparkle-50)",
          textTransform: "uppercase",
          marginBottom: 10,
          opacity: 0.8,
        }}
      >
        Next Step
      </div>

      <div
        style={{ fontSize: 18, fontWeight: 800, color: "#fff", lineHeight: 1.3, marginBottom: 8 }}
      >
        Aapka Daily Destiny Companion
      </div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 400,
          color: "rgba(255,255,255,0.6)",
          lineHeight: 1.6,
          marginBottom: 20,
        }}
      >
        Har din aapke liye personalized timeline, planet messages, remedies aur predictions taiyaar
        hain.
      </div>

      <button
        onClick={onDailyClick}
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: 14,
          border: "none",
          background: "linear-gradient(135deg, #3535f3, #5b5bf7)",
          color: "#fff",
          fontSize: 14,
          fontWeight: 700,
          fontFamily: "Outfit, sans-serif",
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(53,53,243,0.3)",
          transition: "transform 200ms ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
        onMouseDown={(e) => ((e.currentTarget as HTMLElement).style.transform = "scale(0.97)")}
        onMouseUp={(e) => ((e.currentTarget as HTMLElement).style.transform = "scale(1)")}
      >
        <span>✨</span>
        <span>Start Daily Guidance</span>
        <span>→</span>
      </button>
    </div>
  </div>
);

// ─── STORY_CARDS data (needed for StoryCardPreview row) ──────────────────────

const STORY_CARDS = [
  {
    id: "superpower",
    title: "Why people follow your lead",
    subtitle: "without you even asking",
    planet: "Mars",
    accentBg: "linear-gradient(135deg, #1a0500 0%, #0d0200 100%)",
    isDark: true,
    visual: "mars",
  },
  {
    id: "mulank",
    title: "Mulank 9 + Makar",
    subtitle: "a rare powerful combination",
    planet: "Mars",
    accentBg: "linear-gradient(135deg, #1a0a00 0%, #0d0500 100%)",
    isDark: true,
    visual: "numerology",
  },
  {
    id: "blindspot",
    title: "The trait that pushes people away",
    subtitle: "and you don't see it",
    planet: "Moon",
    accentBg: "linear-gradient(135deg, #0d0d18 0%, #080810 100%)",
    isDark: true,
    visual: "moon",
  },
  {
    id: "misunderstood",
    title: "Why people think you're intimidating",
    subtitle: "when you're not",
    planet: "Saturn",
    accentBg: "linear-gradient(135deg, #0a0a14 0%, #050508 100%)",
    isDark: true,
    visual: "saturn",
  },
  {
    id: "destiny",
    title: "The rare pattern in your chart",
    subtitle: "only 5% have this",
    planet: "Mars",
    accentBg: "linear-gradient(135deg, var(--surface-bold) 0%, #1a0066 100%)",
    isDark: true,
    visual: "triangle",
  },
  {
    id: "twin",
    title: "Your kundli matches Dhoni's",
    subtitle: "89% cosmic overlap",
    planet: "Jupiter",
    accentBg: "linear-gradient(135deg, #001a15 0%, #000d0a 100%)",
    isDark: true,
    visual: "twin",
  },
  {
    id: "future",
    title: "In 14 months, something shifts",
    subtitle: "your biggest career window",
    planet: "Jupiter",
    accentBg: "linear-gradient(135deg, #0a0020 0%, #050010 100%)",
    isDark: true,
    visual: "clock",
  },
];

// ─── AstroHome (main exported component) ─────────────────────────────────────

interface AstroHomeProps {
  onDailyClick: () => void;
}

export default function AstroHome({ onDailyClick }: AstroHomeProps) {
  const [overlay, setOverlay] = useState<Overlay>(null);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: ASTRO_HOME_CSS }} />
      <div
        style={{
          height: "100%",
          overflowY: "auto",
          position: "relative",
          paddingTop: "env(safe-area-inset-top)",
        }}
      >
        {/* 1. MiniHeader */}
        <MiniHeader />

        {/* 2. HeroCard */}
        <HeroCard />

        {/* 3. Kundli ke Rahasya — story cards */}
        <SectionHeader
          title="Kundli ke Rahasya"
          subtitle="Tap karke jaano apne baare mein"
          delay={300}
        />
        <div
          style={{
            display: "flex",
            gap: 12,
            padding: "4px 16px 16px",
            overflowX: "auto",
            msOverflowStyle: "none",
            scrollbarWidth: "none",
          }}
        >
          <StoryCardPreview
            onCardTap={(idx: number) => setOverlay({ type: "story", index: idx })}
          />
        </div>

        {/* 4. Apka Graha Mandal — living solar system */}
        <SectionHeader
          title="Apka Graha Mandal"
          subtitle="Tap karke suniye — aapke grah kya keh rahe hain"
          delay={500}
        />
        <LivingSolarSystem
          onPlanetClick={(planet) => {
            const idx = ORBIT_PLANETS.findIndex((p) => p.id === planet.id);
            setOverlay({
              type: "planet",
              planet: planet as unknown as OrbitPlanet,
              planetIndex: idx,
            });
          }}
        />

        {/* 5. CelebrityKundliMatch */}
        <CelebrityKundliMatch />

        {/* 6. Graha Upay — rituals */}
        <SectionHeader
          title="Graha Upay"
          subtitle="Aapki kundli ke powerful upay — life 10x better"
          delay={700}
        />
        <CelestialRitualTimeline
          onRitualTap={(ritual: any) => setOverlay({ type: "ritual", ritual })}
        />

        {/* 7. Meri Life Graph — destiny walk */}
        <SectionHeader
          title="Meri Life Graph"
          subtitle="Past se future tak — apni life ka cosmic map"
          delay={800}
        />
        <DestinyWalkV2 onYearOpen={(age: number) => setOverlay({ type: "yearCapsule", age })} />

        {/* Divider */}
        <div style={{ height: 24 }} />
        <div style={{ borderTop: "1px solid var(--stroke-minimal)", margin: "0 16px" }} />
        <div style={{ height: 20 }} />

        {/* 8. AskTheStars */}
        <AskTheStars />

        {/* 9. DailyCompanionCTA */}
        <DailyCompanionCTA onDailyClick={onDailyClick} />

        <div style={{ height: 20 }} />

        {/* ── Overlays ── */}

        {overlay?.type === "story" && (
          <StoryOverlay
            index={(overlay as { type: "story"; index: number }).index}
            onClose={() => setOverlay(null)}
          />
        )}

        {overlay?.type === "planet" &&
          (() => {
            const o = overlay as { type: "planet"; planet: OrbitPlanet; planetIndex: number };
            return (
              <PlanetStoryCapsule
                planet={o.planet}
                currentIndex={o.planetIndex}
                total={ORBIT_PLANETS.length}
                onNext={
                  o.planetIndex < ORBIT_PLANETS.length - 1
                    ? () =>
                        setOverlay({
                          type: "planet",
                          planet: ORBIT_PLANETS[o.planetIndex + 1],
                          planetIndex: o.planetIndex + 1,
                        })
                    : null
                }
                onPrev={
                  o.planetIndex > 0
                    ? () =>
                        setOverlay({
                          type: "planet",
                          planet: ORBIT_PLANETS[o.planetIndex - 1],
                          planetIndex: o.planetIndex - 1,
                        })
                    : null
                }
                onClose={() => setOverlay(null)}
              />
            );
          })()}

        {overlay?.type === "ritual" && (
          <RitualRevealOverlay
            ritual={(overlay as { type: "ritual"; ritual: any }).ritual}
            onClose={() => setOverlay(null)}
          />
        )}

        {overlay?.type === "yearCapsule" && (
          <YearCapsuleOverlay
            age={(overlay as { type: "yearCapsule"; age: number }).age}
            onClose={() => setOverlay(null)}
          />
        )}
      </div>
    </>
  );
}
