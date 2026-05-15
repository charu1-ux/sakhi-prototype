"use client";
import React, { useState, useEffect, useRef } from "react";
import { DESTINY_RITUALS, LIFE_ERAS, DESTINY_GATES } from "./data";
import type { DestinyRitual as Ritual } from "./data";

// Inline fallbacks in case data.ts doesn't export these
const BIRTH_YEAR = 1995;
const CURRENT_AGE = 29;
const getEraForAge = (age: number) =>
  LIFE_ERAS.find((e) => age >= e.range[0] && age <= e.range[1]) || LIFE_ERAS[LIFE_ERAS.length - 1];

// ─────────────────────────────────────────────
// 1. CelestialRitualTimeline
// ─────────────────────────────────────────────
const DAY_LABELS = ["रवि", "सोम", "मंगल", "बुध", "गुरु", "शुक्र", "शनि"];
// ritual days: Sun=0, Tue=2, Thu=4, Sat=6
const RITUAL_DAY_INDICES = [0, 2, 4, 6];

export function CelestialRitualTimeline({
  onRitualTap,
}: {
  onRitualTap: (ritual: Ritual, index: number) => void;
}) {
  const today = new Date().getDay(); // 0=Sun…6=Sat
  const [expanded, setExpanded] = useState<number | null>(null);

  const getRitualForDay = (dayIndex: number): { ritual: Ritual; ritualIndex: number } | null => {
    const pos = RITUAL_DAY_INDICES.indexOf(dayIndex);
    if (pos === -1) return null;
    const ritual = DESTINY_RITUALS[pos];
    if (!ritual) return null;
    return { ritual, ritualIndex: pos };
  };

  const handleDayTap = (dayIndex: number) => {
    const entry = getRitualForDay(dayIndex);
    if (!entry) return;
    if (expanded === dayIndex) {
      // second tap → open overlay
      onRitualTap(entry.ritual, entry.ritualIndex);
    } else {
      setExpanded(dayIndex);
    }
  };

  return (
    <div style={{ margin: "0 16px 20px" }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          color: "rgba(255,255,255,0.4)",
          letterSpacing: 1.5,
          marginBottom: 12,
        }}
      >
        CELESTIAL RITUALS
      </div>
      {/* 7-day row */}
      <div style={{ display: "flex", gap: 6 }}>
        {DAY_LABELS.map((label, i) => {
          const entry = getRitualForDay(i);
          const isRitualDay = !!entry;
          const isToday = i === today;
          return (
            <div
              key={i}
              onClick={() => handleDayTap(i)}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                cursor: isRitualDay ? "pointer" : "default",
              }}
            >
              {/* Circle */}
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: isRitualDay
                    ? `radial-gradient(circle at 35% 30%, ${entry!.ritual.color}cc, ${entry!.ritual.color}66)`
                    : "rgba(255,255,255,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: isRitualDay ? 18 : 10,
                  fontWeight: 700,
                  color: isRitualDay ? "#fff" : "rgba(255,255,255,0.35)",
                  boxShadow: isToday
                    ? `0 0 0 2px #fff, 0 0 12px ${isRitualDay ? entry!.ritual.color : "rgba(255,255,255,0.4)"}`
                    : isRitualDay
                      ? `0 0 10px ${entry!.ritual.color}66`
                      : "none",
                  transition: "box-shadow 200ms",
                }}
              >
                {isRitualDay ? entry!.ritual.planet.charAt(0) : label.charAt(0)}
              </div>
              {/* Label */}
              <div
                style={{
                  fontSize: 9,
                  fontWeight: isToday ? 800 : 600,
                  color: isToday ? "#fff" : "rgba(255,255,255,0.4)",
                  letterSpacing: 0.3,
                }}
              >
                {label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Inline preview panel */}
      {expanded !== null &&
        (() => {
          const entry = getRitualForDay(expanded);
          if (!entry) return null;
          const { ritual, ritualIndex } = entry;
          return (
            <div
              style={{
                marginTop: 14,
                background: `linear-gradient(135deg, ${ritual.color}22, ${ritual.color}0a)`,
                border: `1px solid ${ritual.color}44`,
                borderRadius: 16,
                padding: 16,
                animation: "fadeInUp 200ms ease-out both",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${ritual.color}cc, ${ritual.color}44)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                  }}
                >
                  {ritual.planet.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>
                    {ritual.title}
                  </div>
                  <div style={{ fontSize: 11, color: ritual.color, marginTop: 2, fontWeight: 700 }}>
                    {ritual.recurrence}
                  </div>
                </div>
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.7)",
                  lineHeight: 1.5,
                  marginBottom: 14,
                }}
              >
                {ritual.instruction?.slice(0, 120)}
                {ritual.instruction && ritual.instruction.length > 120 ? "…" : ""}
              </div>
              <button
                onClick={() => onRitualTap(ritual, ritualIndex)}
                style={{
                  background: ritual.color,
                  color: "#000",
                  border: "none",
                  borderRadius: 20,
                  padding: "8px 18px",
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: "pointer",
                  letterSpacing: 0.5,
                }}
              >
                Open Ritual →
              </button>
            </div>
          );
        })()}
    </div>
  );
}

// ─────────────────────────────────────────────
// 2. RitualRevealOverlay
// ─────────────────────────────────────────────
export function RitualRevealOverlay({ ritual, onClose }: { ritual: Ritual; onClose: () => void }) {
  const [step, setStep] = useState(0);

  const STEPS = [
    { key: "invoke", titleHi: "आह्वान", titleEn: "Invoke" },
    { key: "ritual", titleHi: "विधि", titleEn: "The Ritual" },
    { key: "blessing", titleHi: "आशीर्वाद", titleEn: "Blessing" },
  ];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 600,
        background: `linear-gradient(160deg, #0a0020 0%, ${ritual.color}33 50%, #0a001a 100%)`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: "calc(env(safe-area-inset-top) + 16px)",
          right: 20,
          border: "none",
          background: "rgba(255,255,255,0.1)",
          color: "#fff",
          width: 36,
          height: 36,
          borderRadius: "50%",
          fontSize: 18,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
        }}
      >
        ✕
      </button>

      {/* Tap zones */}
      <div style={{ position: "absolute", inset: 0, display: "flex", zIndex: 1 }}>
        <div style={{ flex: 1 }} onClick={() => setStep((s) => Math.max(0, s - 1))} />
        <div
          style={{ flex: 1 }}
          onClick={() => {
            if (step < 2) setStep((s) => s + 1);
            else onClose();
          }}
        />
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px 28px 80px",
          position: "relative",
          zIndex: 2,
          pointerEvents: "none",
        }}
      >
        {/* Step label */}
        <div
          style={{
            fontSize: 10,
            fontWeight: 800,
            color: ritual.color,
            letterSpacing: 2,
            marginBottom: 8,
          }}
        >
          {STEPS[step].titleHi} / {STEPS[step].titleEn}
        </div>

        {step === 0 && (
          <div>
            <div
              style={{
                width: 90,
                height: 90,
                borderRadius: "50%",
                background: `radial-gradient(circle at 35% 30%, ${ritual.color}, ${ritual.color}66)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 44,
                marginBottom: 24,
                boxShadow: `0 0 40px ${ritual.color}66`,
              }}
            >
              {ritual.planet.charAt(0)}
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", marginBottom: 10 }}>
              {ritual.planet}
            </div>
            <div style={{ fontSize: 15, color: "rgba(255,255,255,0.75)", lineHeight: 1.7 }}>
              {ritual.why}
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 900,
                color: "#fff",
                marginBottom: 16,
                lineHeight: 1.3,
              }}
            >
              {ritual.title}
            </div>
            <div
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.8)",
                lineHeight: 1.7,
                marginBottom: 16,
              }}
            >
              {ritual.instruction}
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: `${ritual.color}22`,
                border: `1px solid ${ritual.color}44`,
                borderRadius: 20,
                padding: "4px 12px",
              }}
            >
              <span style={{ fontSize: 12, color: ritual.color, fontWeight: 700 }}>
                🔁 {ritual.recurrence}
              </span>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 16 }}>
              Improves:
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
              {(ritual.improves || []).map((item: string, i: number) => (
                <div
                  key={i}
                  style={{
                    background: `${ritual.color}33`,
                    border: `1px solid ${ritual.color}55`,
                    borderRadius: 20,
                    padding: "6px 14px",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#fff",
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
            <div
              style={{
                background: "rgba(255,255,255,0.05)",
                borderRadius: 16,
                padding: 16,
                borderLeft: `3px solid ${ritual.color}`,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: ritual.color,
                  fontWeight: 800,
                  letterSpacing: 1,
                  marginBottom: 8,
                }}
              >
                WHISPER
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: "rgba(255,255,255,0.8)",
                  lineHeight: 1.6,
                  fontStyle: "italic",
                }}
              >
                {ritual.whisper}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Step dots */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 8,
          paddingBottom: "calc(env(safe-area-inset-bottom) + 24px)",
          position: "relative",
          zIndex: 2,
        }}
      >
        {STEPS.map((_, i) => (
          <div
            key={i}
            onClick={() => setStep(i)}
            style={{
              width: i === step ? 20 : 6,
              height: 6,
              borderRadius: 3,
              background: i === step ? ritual.color : "rgba(255,255,255,0.25)",
              transition: "width 200ms, background 200ms",
              cursor: "pointer",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 3. DestinyWalkV2
// ─────────────────────────────────────────────
export function DestinyWalkV2({ onYearOpen }: { onYearOpen: (age: number) => void }) {
  const currentEra = getEraForAge(CURRENT_AGE);
  const [selectedEra, setSelectedEra] = useState(currentEra);
  const eraScrollRef = useRef<HTMLDivElement>(null);
  const yearScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to current era on mount
  useEffect(() => {
    const currentIndex = LIFE_ERAS.findIndex((e) => e === currentEra);
    if (eraScrollRef.current && currentIndex > 0) {
      const cardWidth = 120 + 10; // approx card width + gap
      eraScrollRef.current.scrollLeft = Math.max(0, (currentIndex - 1) * cardWidth);
    }
  }, []);

  // Auto-scroll year rail to current age when era changes
  useEffect(() => {
    if (yearScrollRef.current && selectedEra === currentEra) {
      const ageOffset = CURRENT_AGE - selectedEra.range[0];
      const itemWidth = 56 + 8;
      yearScrollRef.current.scrollLeft = Math.max(0, (ageOffset - 1) * itemWidth);
    } else if (yearScrollRef.current) {
      yearScrollRef.current.scrollLeft = 0;
    }
  }, [selectedEra]);

  return (
    <div style={{ margin: "0 0 20px" }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          color: "rgba(255,255,255,0.4)",
          letterSpacing: 1.5,
          margin: "0 16px 12px",
        }}
      >
        DESTINY WALK
      </div>

      {/* Era strip */}
      <div
        ref={eraScrollRef}
        style={{
          display: "flex",
          gap: 10,
          padding: "4px 16px 12px",
          overflowX: "auto",
          scrollbarWidth: "none",
        }}
      >
        {LIFE_ERAS.map((era, i) => {
          const isSelected = selectedEra === era;
          const isCurrent = era === currentEra;
          return (
            <div
              key={i}
              onClick={() => setSelectedEra(era)}
              style={{
                flexShrink: 0,
                width: 110,
                borderRadius: 16,
                padding: "12px 14px",
                background: isSelected
                  ? `linear-gradient(135deg, ${era.roadColor || "#6644cc"}33, ${era.roadColor || "#6644cc"}11)`
                  : "rgba(255,255,255,0.05)",
                border: isCurrent
                  ? `2px solid ${era.roadColor || "#6644cc"}`
                  : isSelected
                    ? `1px solid ${era.roadColor || "#6644cc"}66`
                    : "1px solid rgba(255,255,255,0.08)",
                cursor: "pointer",
                boxShadow: isCurrent ? `0 0 16px ${era.roadColor || "#6644cc"}44` : "none",
                transition: "all 200ms",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: isCurrent ? era.roadColor || "#9977ff" : "rgba(255,255,255,0.4)",
                  letterSpacing: 0.5,
                  marginBottom: 4,
                }}
              >
                {isCurrent ? "● NOW" : era.label?.toUpperCase() || ""}
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 900,
                  color: "#fff",
                  lineHeight: 1.2,
                  marginBottom: 4,
                }}
              >
                {era.labelHi || era.label}
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
                {era.range[0]}–{era.range[1]}
              </div>
            </div>
          );
        })}
      </div>

      {/* Year rail */}
      <div
        ref={yearScrollRef}
        style={{
          display: "flex",
          gap: 8,
          padding: "4px 16px",
          overflowX: "auto",
          scrollbarWidth: "none",
        }}
      >
        {Array.from(
          { length: selectedEra.range[1] - selectedEra.range[0] + 1 },
          (_, i) => selectedEra.range[0] + i,
        ).map((age) => {
          const gate = (DESTINY_GATES || []).find((g: any) => g.age === age);
          const isCurrentAge = age === CURRENT_AGE;
          const eraColor = selectedEra.roadColor || "#6644cc";
          return (
            <div
              key={age}
              onClick={() => onYearOpen(age)}
              style={{
                flexShrink: 0,
                width: 52,
                borderRadius: 14,
                padding: "10px 6px",
                background: isCurrentAge
                  ? `linear-gradient(135deg, ${eraColor}55, ${eraColor}22)`
                  : "rgba(255,255,255,0.05)",
                border: isCurrentAge
                  ? `2px solid ${eraColor}`
                  : gate
                    ? `1px solid ${eraColor}55`
                    : "1px solid rgba(255,255,255,0.07)",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                boxShadow: isCurrentAge ? `0 0 14px ${eraColor}44` : "none",
                transition: "all 200ms",
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: isCurrentAge ? 900 : 600,
                  color: isCurrentAge ? "#fff" : "rgba(255,255,255,0.5)",
                }}
              >
                {age}
              </div>
              {gate && (
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: eraColor,
                    boxShadow: `0 0 4px ${eraColor}`,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 4. YearCapsuleOverlay
// ─────────────────────────────────────────────
const AGE_29_ASPECTS = [
  { icon: "🔥", label: "Career", text: "Peak — मंगल + राहु combo, bold moves, leadership natural" },
  {
    icon: "💪",
    label: "Health",
    text: "Strong — Physical prime, stress peak, Sleep + exercise important",
  },
  {
    icon: "💑",
    label: "Relationship",
    text: "Serious — शादी के discussions, Right partner choose करना important",
  },
  { icon: "💰", label: "Money", text: "Growing — EMI से बचें, 20% save करें" },
  {
    icon: "🧘",
    label: "Spiritual",
    text: "Awakening — मंगल + राहु, inner peace career को boost करेगी",
  },
];

export function YearCapsuleOverlay({ age, onClose }: { age: number; onClose: () => void }) {
  const era = getEraForAge(age);
  const gate = (DESTINY_GATES || []).find((g: any) => g.age === age);
  const eraColor = era.roadColor || "#6644cc";
  const aspects = age === CURRENT_AGE ? AGE_29_ASPECTS : AGE_29_ASPECTS; // fallback to age-29 content

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 700,
        background: `linear-gradient(160deg, #0a0020 0%, ${eraColor}22 60%, #050010 100%)`,
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: "fixed",
          top: "calc(env(safe-area-inset-top) + 16px)",
          right: 20,
          border: "none",
          background: "rgba(255,255,255,0.1)",
          color: "#fff",
          width: 36,
          height: 36,
          borderRadius: "50%",
          fontSize: 18,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
        }}
      >
        ✕
      </button>

      <div
        style={{
          padding:
            "calc(env(safe-area-inset-top) + 60px) 20px calc(env(safe-area-inset-bottom) + 40px)",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: eraColor,
              letterSpacing: 1.5,
              marginBottom: 6,
            }}
          >
            {era.labelHi || era.label} · AGE {age}
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 900,
              color: "#fff",
              lineHeight: 1.1,
              marginBottom: 4,
            }}
          >
            Year {age}
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
            {BIRTH_YEAR + age} · {era.label}
          </div>
        </div>

        {/* Gate card */}
        {gate && (
          <div
            style={{
              background: `linear-gradient(135deg, ${eraColor}33, ${eraColor}11)`,
              border: `1px solid ${eraColor}55`,
              borderRadius: 20,
              padding: 18,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 800,
                color: eraColor,
                letterSpacing: 2,
                marginBottom: 8,
              }}
            >
              DESTINY GATE
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", marginBottom: 6 }}>
              {gate.label}
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>
              {gate.desc}
            </div>
          </div>
        )}

        {/* Aspect cards */}
        <div
          style={{
            fontSize: 11,
            fontWeight: 800,
            color: "rgba(255,255,255,0.4)",
            letterSpacing: 1.5,
            marginBottom: 12,
          }}
        >
          LIFE READING
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {aspects.map((aspect, i) => (
            <div
              key={i}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: 16,
                padding: "14px 16px",
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: `${eraColor}22`,
                  border: `1px solid ${eraColor}33`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  flexShrink: 0,
                }}
              >
                {aspect.icon}
              </div>
              <div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: eraColor,
                    letterSpacing: 0.5,
                    marginBottom: 4,
                  }}
                >
                  {aspect.label.toUpperCase()}
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.5 }}>
                  {aspect.text}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
