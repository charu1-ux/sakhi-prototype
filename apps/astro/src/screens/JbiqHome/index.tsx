"use client";
import React, { useState, useEffect } from "react";
import { JBIQ_CSS } from "./styles";
import { FeedContent } from "./FeedContent";
import { MenuDrawer, ChatOverlay, VoiceOverlay } from "./Overlays";

interface JbiqHomeProps {
  onAstrologyClick: () => void;
}

export default function JbiqHome({ onAstrologyClick }: JbiqHomeProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ role: string; content: string }>>([]);
  const [dark, setDark] = useState(false);

  // Dark mode
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setDark(mq.matches);
    const handler = (e: MediaQueryListEvent) => setDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  function handleAstrologyClick() {
    setMenuOpen(false);
    onAstrologyClick();
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: JBIQ_CSS }} />
      <div
        className={dark ? "jh-root dark" : "jh-root"}
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          background: "var(--surface, #fff)",
          fontFamily: "'JioType', sans-serif",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <header
          className="jh-header"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 20,
            background: "var(--surface)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "calc(env(safe-area-inset-top) + 10px)",
            paddingBottom: "10px",
            paddingLeft: "12px",
            paddingRight: "12px",
            minHeight: "calc(env(safe-area-inset-top) + 56px)",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen(true)}
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: "none",
                background: "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 18h18M3 12h18M3 6h18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            {/* Jio logo placeholder */}
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "#3900ad",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              J
            </div>
          </div>
          <div style={{ position: "relative" }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "#e7e9ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" stroke="#3900ad" strokeWidth="2" />
                <path
                  d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
                  stroke="#3900ad"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div
              style={{
                position: "absolute",
                top: -4,
                right: -4,
                minWidth: 22,
                height: 22,
                borderRadius: "50%",
                background: "#3db88c",
                color: "#fff",
                fontSize: 11,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2.5px solid var(--surface)",
              }}
            >
              9
            </div>
          </div>
        </header>

        {/* Scrollable body */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            paddingBottom: "calc(env(safe-area-inset-bottom) + 120px)",
          }}
        >
          <FeedContent onAstrologyClick={handleAstrologyClick} />
        </div>

        {/* Bottom input */}
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            background: "var(--surface)",
            borderTop: "1px solid var(--stroke-subtle, rgba(36,38,43,.12))",
            padding: "10px 12px",
            paddingBottom: "calc(env(safe-area-inset-bottom) + 10px)",
            zIndex: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "var(--grey-20,#f5f5f5)",
              borderRadius: 999,
              padding: "8px 12px",
            }}
          >
            <input
              style={{
                flex: 1,
                border: "none",
                background: "transparent",
                fontSize: 14,
                fontFamily: "inherit",
                outline: "none",
              }}
              placeholder="Hey Deepak, what's on your mind?"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setChatOpen(true);
                }
              }}
            />
            <button
              onClick={() => setVoiceOpen(true)}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                padding: "0 4px",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="9" y="2" width="6" height="12" rx="3" stroke="#3900ad" strokeWidth="2" />
                <path
                  d="M5 10a7 7 0 0014 0"
                  stroke="#3900ad"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <line
                  x1="12"
                  y1="19"
                  x2="12"
                  y2="22"
                  stroke="#3900ad"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <button
              onClick={() => setVoiceOpen(true)}
              style={{
                background: "#3900ad",
                color: "#fff",
                border: "none",
                borderRadius: 999,
                padding: "6px 12px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Speak
            </button>
          </div>
        </div>

        {/* Overlays */}
        <MenuDrawer
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          onAstrologyClick={handleAstrologyClick}
        />
        <ChatOverlay
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          chatHistory={chatHistory}
          onHistoryUpdate={setChatHistory}
        />
        <VoiceOverlay
          open={voiceOpen}
          onClose={() => setVoiceOpen(false)}
          chatHistory={chatHistory}
          onHistoryUpdate={setChatHistory}
        />
      </div>
    </>
  );
}
