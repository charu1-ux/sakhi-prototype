"use client";
import React, { useState, useEffect } from "react";
import { STORY_CARDS, CARD_NARRATIONS, USER } from "./data";
import type { Overlay } from "./index";

const PERSONALITY_TRAITS = [
  { icon: "🔥", text: "Log bolne se pehle padh leti hain" },
  { icon: "⚡", text: "Faisla jaldi. Galat kabhi nahi." },
  { icon: "🌊", text: "Sab mehsoos karti hain. Dikhati kuch nahi." },
];

export function HeroCard() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 300),
      setTimeout(() => setStep(2), 800),
      setTimeout(() => setStep(3), 1400),
      setTimeout(() => setStep(4), 2000),
      setTimeout(() => setStep(6), 2800),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div
      style={{
        margin: "12px 16px",
        borderRadius: 24,
        overflow: "hidden",
        background: "linear-gradient(135deg, #0a0020 0%, #1a0040 50%, #0a001a 100%)",
        padding: 20,
        minHeight: 200,
        opacity: step >= 1 ? 1 : 0,
        transition: "opacity 600ms",
        animation: step >= 1 ? "fadeInUp 600ms ease-out both" : "none",
      }}
    >
      {step >= 2 && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "radial-gradient(circle at 35% 30%, #ff9966, #ff6644 40%, #cc3311 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              boxShadow: "0 0 20px rgba(255,102,68,0.5)",
            }}
          >
            ♂
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>{USER.name}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>
              {USER.signSymbol} {USER.sign} · Mulank 9
            </div>
          </div>
        </div>
      )}
      {step >= 3 && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(255,102,68,0.2)",
            border: "1px solid rgba(255,102,68,0.4)",
            borderRadius: 20,
            padding: "4px 12px",
            marginBottom: 14,
          }}
        >
          <span style={{ fontSize: 12, color: "#ff9966", fontWeight: 700 }}>
            ⚡ {USER.archetype}
          </span>
        </div>
      )}
      {step >= 4 && (
        <div style={{ marginBottom: 16 }}>
          {PERSONALITY_TRAITS.map((t, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 6,
                opacity: step >= 4 ? 1 : 0,
                transition: `opacity 400ms ${i * 150}ms`,
              }}
            >
              <span style={{ fontSize: 14 }}>{t.icon}</span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", fontStyle: "italic" }}>
                {t.text}
              </span>
            </div>
          ))}
        </div>
      )}
      {step >= 6 && (
        <div
          style={{
            display: "flex",
            gap: 12,
            paddingTop: 12,
            borderTop: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {[
            { label: "Mulank", value: "9" },
            { label: "Nakshatra", value: "Anuradha" },
            { label: "Lucky Day", value: "Tuesday" },
          ].map((item) => (
            <div key={item.label} style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#fff" }}>{item.value}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function StoryCardPreview({ onCardTap }: { onCardTap: (index: number) => void }) {
  return (
    <div style={{ display: "flex", gap: 10, padding: "4px 16px", overflowX: "auto" }}>
      {STORY_CARDS.map((card, i) => (
        <div
          key={card.id}
          onClick={() => onCardTap(i)}
          style={{
            flexShrink: 0,
            width: 110,
            borderRadius: 20,
            overflow: "hidden",
            background: card.accentBg,
            cursor: "pointer",
            padding: "16px 12px",
            minHeight: 150,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: `0 4px 20px rgba(0,0,0,0.33)`,
          }}
        >
          <div style={{ fontSize: 28 }}>{card.planet}</div>
          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 800,
                color: card.isDark ? "#fff" : "#141414",
                letterSpacing: 0.5,
                lineHeight: 1.3,
                whiteSpace: "pre-line",
              }}
            >
              {card.title}
            </div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
              TAP TO REVEAL
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function StoryOverlay({ index, onClose }: { index: number; onClose: () => void }) {
  const [current, setCurrent] = useState(index);
  const card = STORY_CARDS[current];
  const narration = CARD_NARRATIONS[current] || "";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 500,
        background: "#000",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Progress bar */}
      <div
        style={{
          display: "flex",
          gap: 3,
          padding: "calc(env(safe-area-inset-top) + 8px) 12px 8px",
        }}
      >
        {STORY_CARDS.map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 2,
              borderRadius: 1,
              background: i <= current ? "#fff" : "rgba(255,255,255,0.25)",
            }}
          />
        ))}
      </div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", padding: "4px 16px 8px", gap: 8 }}>
        <button
          onClick={onClose}
          style={{
            border: "none",
            background: "transparent",
            color: "#fff",
            fontSize: 22,
            cursor: "pointer",
            padding: 0,
          }}
        >
          ✕
        </button>
        <span
          style={{
            flex: 1,
            fontSize: 11,
            fontWeight: 700,
            color: "rgba(255,255,255,0.5)",
            letterSpacing: 1,
          }}
        >
          KUNDLI KE RAHASYA
        </span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
          {current + 1}/{STORY_CARDS.length}
        </span>
      </div>
      {/* Content */}
      <div
        style={{
          flex: 1,
          background: card.accentBg,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 24,
          position: "relative",
        }}
      >
        {/* Tap zones */}
        <div style={{ position: "absolute", inset: 0, display: "flex" }}>
          <div style={{ flex: 1 }} onClick={() => setCurrent((c) => Math.max(0, c - 1))} />
          <div
            style={{ flex: 1 }}
            onClick={() => {
              if (current < STORY_CARDS.length - 1) setCurrent((c) => c + 1);
              else onClose();
            }}
          />
        </div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: card.isDark ? "#aaa" : "#444",
              letterSpacing: 2,
              marginBottom: 8,
            }}
          >
            CARD {current + 1} OF 7
          </div>
          <div
            style={{
              fontSize: 26,
              fontWeight: 900,
              color: card.isDark ? "#fff" : "#141414",
              lineHeight: 1.2,
              marginBottom: 16,
              whiteSpace: "pre-line",
            }}
          >
            {card.title}
          </div>
          <div
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.75)",
              lineHeight: 1.6,
              maxHeight: 180,
              overflowY: "auto",
            }}
          >
            {narration}
          </div>
        </div>
      </div>
    </div>
  );
}
