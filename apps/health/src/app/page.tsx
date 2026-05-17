"use client";

import Script from "next/script";

export default function SehatSaathi() {
  // NEXT_PUBLIC_ vars are inlined at build time by Next.js
  const openaiKey = process.env.NEXT_PUBLIC_OPENAI_KEY ?? "";
  const groqKey = process.env.NEXT_PUBLIC_GROQ_KEY ?? "";
  const sarvamKey = process.env.NEXT_PUBLIC_SARVAM_KEY ?? "";
  // v6.3: Cerebras Cloud — primary LLM provider, hosts Llama 3.3 70B, free tier
  const cerebrasKey = process.env.NEXT_PUBLIC_CEREBRAS_KEY ?? "";

  return (
    <>
      {/* 1. Config — inject API keys into window so runtime can pick them up */}
      <Script id="ss-config" strategy="afterInteractive">
        {`window.__SS_CONFIG__ = { openaiKey: "${openaiKey}", groqKey: "${groqKey}", sarvamKey: "${sarvamKey}", cerebrasKey: "${cerebrasKey}" };`}
      </Script>

      {/* 2. PDF.js — used by the Lab interpreter screen */}
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
        strategy="afterInteractive"
      />
      <Script id="pdfjs-worker" strategy="afterInteractive">
        {`if(window.pdfjsLib) pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";`}
      </Script>

      {/* 3. Sehat Saathi runtime — all app logic (navigation, AI calls, voice, state) */}
      {/* basePath=/health prefixes public files in dev AND the file lands at
          /health/sehat-saathi-runtime.js in the Capacitor bundle (via postbuild cpSync). */}
      <Script src="/health/sehat-saathi-runtime.js" strategy="afterInteractive" />

      {/* 4. v6.2: Lottie player for the Dadi Magic Walkthrough. Loaded lazily so
          chat-only sessions don't pay the kB. Runtime checks for window.lottie
          before using it; remedies without Lottie URLs fall back to inline SVG. */}
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.12.2/lottie.min.js"
        strategy="lazyOnload"
      />

      <div id="app">
        {/* ══════════════ HOME SCREEN ══════════════ */}
        <div className="screen active" id="s-home">
          <div className="hdr">
            <button
              id="btn-back-to-shell"
              className="hdr-btn"
              aria-label="Back to home"
              onClick={() => {
                if (window.history.length > 1) {
                  // There is a previous entry in the stack (came from shell or browser).
                  // Go back there — works correctly in Capacitor, PWA, and direct dev visits.
                  window.history.back();
                } else {
                  // No history (opened as the very first page).
                  // Dev cross-origin iframe: postMessage to the shell frame.
                  // Production / same-origin: navigate top frame directly.
                  try {
                    (window.top ?? window).location.href = "/";
                  } catch {
                    window.parent.postMessage({ type: "health:navigate", href: "/" }, "*");
                  }
                }
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 6L4 12L10 18M5 12H20"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div className="hdr-center" style={{ justifyContent: "center" }}></div>
            <button className="hdr-btn" onClick={() => showComingSoon()}>
              <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
                <path
                  d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <line
                  x1="4"
                  y1="22"
                  x2="4"
                  y2="15"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <button
              className="hdr-btn"
              style={{
                width: "36px",
                height: "36px",
                background: "var(--surface2)",
                borderRadius: "50%",
                fontSize: "14px",
                fontWeight: "700",
                color: "var(--text)",
              }}
            >
              N
            </button>
          </div>
          <div className="body" id="home-body">
            {/* Assistants row */}
            <div className="home-section">
              <h3 className="home-section-title">Your Assistants</h3>
              <div className="assistants-row" id="assistants-row">
                {/* Sehat Saathi — LIVE. v6.1: persona-health.png is a male doctor figure
                   which conflicts with the Dadi/Nani persona the system prompt + CLAUDE.md
                   define. Using an emoji-based Dadi avatar until a proper PNG is ready. */}
                <div className="assistant-card" onClick={() => enterHub()}>
                  <div className="assistant-avatar active-border" id="av-sehat">
                    <div
                      role="img"
                      aria-label="Sehat Saathi Dadi"
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background:
                          "linear-gradient(135deg, #fde68a 0%, #fb923c 55%, #b45309 100%)",
                        fontSize: "42px",
                        lineHeight: 1,
                      }}
                    >
                      👵🏽
                    </div>
                  </div>
                  <span className="assistant-name">
                    Sehat
                    <br />
                    Saathi
                  </span>
                </div>
                {/* Cricket Dost */}
                <div className="assistant-card" onClick={() => showComingSoon()}>
                  <div className="assistant-avatar">
                    <img
                      src="https://sunit1986.github.io/design-prototypes/Assets/persona-cricket.png"
                      alt="Cricket Dost"
                      loading="lazy"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  </div>
                  <span className="assistant-name">
                    Cricket
                    <br />
                    Dost
                  </span>
                </div>
                {/* Astro */}
                <div className="assistant-card" onClick={() => showComingSoon()}>
                  <div className="assistant-avatar">
                    <img
                      src="https://sunit1986.github.io/design-prototypes/Assets/persona-astrology.png"
                      alt="Astro Companion"
                      loading="lazy"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  </div>
                  <span className="assistant-name">
                    Astro
                    <br />
                    Companion
                  </span>
                </div>
                {/* Devotional */}
                <div className="assistant-card" onClick={() => showComingSoon()}>
                  <div className="assistant-avatar">
                    <img
                      src="https://sunit1986.github.io/design-prototypes/Assets/persona-devotion.png"
                      alt="Devotional Companion"
                      loading="lazy"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  </div>
                  <span className="assistant-name">
                    Devotional
                    <br />
                    Companion
                  </span>
                </div>
                {/* Career */}
                <div className="assistant-card" onClick={() => showComingSoon()}>
                  <div className="assistant-avatar">
                    <img
                      src="https://sunit1986.github.io/design-prototypes/Assets/persona-education.png"
                      alt="Career and Skills"
                      loading="lazy"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  </div>
                  <span className="assistant-name">
                    Career &<br />
                    Skills
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="section-hdr">
              <h3>Quick Actions</h3>
            </div>
            <div className="qa-grid" id="qa-grid">
              {/* JS renders */}
            </div>

            {/* Updates */}
            <div className="section-hdr">
              <h3>Updates</h3>
              <button className="see-all" onClick={() => showComingSoon()}>
                Aur dekho
              </button>
            </div>

            {/* Cricket card */}
            <div className="update-card">
              <div className="update-tag">Cricket Buzz</div>
              <div className="update-title">IPL 2026: MI vs CSK — Aaj Ki Mahasangram</div>
              <div className="update-body">
                Wankhede mein aaj sham 7:30 baje hoga dono dabbang teams ka muqabla. Rohit ne kaha —
                "Aaj kuch khaas hoga."
              </div>
              <div className="update-audio">
                <button
                  className="audio-play"
                  onClick={(e) => playUpdateAudio(e.currentTarget, "cricket")}
                >
                  <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                    <path d="M5 3l14 9-14 9V3z" fill="white" />
                  </svg>
                </button>
                <div className="audio-wave">
                  <div className="audio-bar" style={{ height: "40%" }}></div>
                  <div className="audio-bar"></div>
                  <div className="audio-bar"></div>
                  <div className="audio-bar"></div>
                  <div className="audio-bar"></div>
                  <div className="audio-bar"></div>
                  <div className="audio-bar"></div>
                  <div className="audio-bar"></div>
                </div>
                <span className="audio-time">00:23</span>
              </div>
            </div>

            {/* Seasonal health card */}
            <div className="update-card">
              <div className="update-tag">Garmi Alert — Aaj ke liye</div>
              <div className="update-title">42°C tak ja sakta hai aaj — teyar rahein</div>
              <div className="update-body">
                ORS ghar pe banao: 1 litre paani + 6 chammach cheeni + 1 chammach namak. Subah 10
                baje ke baad bahar nikalne se bachein. Nariyal paani sabse accha hai.
              </div>
            </div>

            {/* Festival card */}
            <div className="update-card" style={{ marginBottom: "24px" }}>
              <div className="update-tag">Aane Wala Tyohar</div>
              <div className="update-title">Buddha Purnima — 12 May</div>
              <div className="update-body">
                Vrat ke dauran saatvik khana khayein — fruits, sabudana, sendha namak. Sehat Saathi
                se poochho — kya khayein vrat mein?
              </div>
              <button
                className="flow-next-btn"
                style={{ margin: "0 16px 16px", width: "calc(100% - 32px)" }}
                onClick={() => goToFeature("nushke")}
              >
                Sehat Saathi se poochho →
              </button>
            </div>

            {/* Bottom padding */}
            <div style={{ height: "20px" }}></div>
          </div>
          {/* Home bottom bar */}
          <div className="bar">
            <div className="bar-inner">
              <input
                className="bar-input"
                placeholder="Kuch bhi poochho Sehat Saathi se..."
                readOnly
                onClick={() => enterHub()}
              />
              <button className="bar-speak" onClick={() => enterHub()}>
                <svg viewBox="0 0 24 24" fill="none" width="15" height="15">
                  <path
                    d="M12 2a1 1 0 00-1 1v18a1 1 0 002 0V3a1 1 0 00-1-1zM4 9a1 1 0 00-1 1v4a1 1 0 102 0v-4a1 1 0 00-1-1zm4-3a1 1 0 00-1 1v10a1 1 0 102 0V7a1 1 0 00-1-1zm12 3a1 1 0 00-1 1v4a1 1 0 002 0v-4a1 1 0 00-1-1zm-4-3a1 1 0 00-1 1v10a1 1 0 002 0V7a1 1 0 00-1-1z"
                    fill="currentColor"
                  />
                </svg>
                Speak
              </button>
            </div>
          </div>
        </div>

        {/* ══════════════ SEHAT HUB (v3 — 3-zone home) ══════════════ */}
        <div className="screen" id="s-hub">
          {/* v3 header: SS · Sehat Saathi · Dadi mode · streak · 3-dot menu */}
          <div className="hub3-hdr">
            <div className="hub3-hdr-left">
              <button className="hdr-btn" onClick={() => goBack()} aria-label="Back to home">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10 6L4 12L10 18M5 12H20"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <div>
                <div className="hub3-name">Sehat Saathi</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <button
                className="hub3-stat-chip"
                id="hub3-stat-chip"
                onClick={() => openVoicePicker()}
                aria-label="Awaaz aur score"
                style={{ background: "rgba(107,33,168,.12)", cursor: "pointer" }}
              >
                <span className="hsc-score" id="hsc-score">
                  💚 50
                </span>
                <span className="hsc-sep">·</span>
                <span className="hsc-streak">
                  <span id="hub3-streak-count">0</span>🔥
                </span>
                <span className="hsc-sep">·</span>
                <span style={{ fontSize: "13px" }}>🎙️</span>
              </button>
              <button
                className="hub3-menu-btn"
                onClick={() => openToolsSheet()}
                aria-label="Tools menu"
              >
                <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
                  <circle cx="5" cy="12" r="1.7" fill="currentColor" />
                  <circle cx="12" cy="12" r="1.7" fill="currentColor" />
                  <circle cx="19" cy="12" r="1.7" fill="currentColor" />
                </svg>
              </button>
            </div>
          </div>

          <div className="body">
            {/* v5.1: Aaj ki Sehat — Instagram-style daily stories rail (top of hub) */}
            <div className="hub-stories" id="hub-stories">
              {/* JS renders */}
            </div>

            {/* v5.3: Focus Mode home — shown when body.focus is set (active healing path) */}
            <div className="focus-home" id="focus-home">
              {/* JS renders renderFocusHome() */}
            </div>

            {/* v6.0: Warm hero — time-aware greeting hydrated by renderWarmHero() */}
            <div className="warm-hero" id="warm-hero">
              {/* JS renders */}
            </div>

            {/* v6.0: Active Choice — single contextual nudge picked from chatHistory / time / state */}
            <div className="active-choice-card" id="active-choice-card">
              {/* JS renders */}
            </div>

            {/* v6.1: Talk to Dadi — voice-first hero card with rotating placeholder + chip rail.
               Replaces the bottom bar's hub-input (input moved here so it sits prominent, not buried). */}
            <div className="talk-card">
              <div className="talk-card-row">
                <input
                  className="talk-card-input"
                  id="hub-input"
                  placeholder="Dadi se kuch bhi kahein…"
                  onKeyDown={(e) => hubKey(e)}
                />
                <button
                  className="talk-card-mic"
                  id="hub-speak"
                  onClick={() => toggleVoice("hub")}
                  aria-label="Dadi se awaaz mein baat karein"
                >
                  <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
                    <path
                      d="M12 2a3 3 0 00-3 3v6a3 3 0 006 0V5a3 3 0 00-3-3z"
                      fill="currentColor"
                    />
                    <path
                      d="M19 11a7 7 0 01-14 0M12 18v3"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
              <div className="talk-card-chip-rail" id="talk-chip-rail">
                {/* JS renders chip set */}
              </div>
            </div>

            {/* v6.0: Four warm exits — Tabiyat (nushka), Tan-Man (wellness), Report (lab), Dawai (rx) */}
            <div className="exit-section">
              <div className="exit-section-lbl">Aaj kya karna hai?</div>
              <div className="exit-grid">
                <button
                  className="exit-tile tile-nushka"
                  onClick={() => goToFeature("nushke")}
                  aria-label="Tabiyat poochho"
                >
                  <div className="exit-tile-emoji">🌿</div>
                  <div className="exit-tile-title">Tabiyat poochho</div>
                  <div className="exit-tile-sub">Sir dard, sardi, pet — Dadi se kahein</div>
                </button>
                <button
                  className="exit-tile tile-wellness"
                  onClick={() => goToFeature("wellness")}
                  aria-label="Tan-Man ke saath"
                >
                  <div className="exit-tile-emoji">🧘</div>
                  <div className="exit-tile-title">Tan-Man ke saath</div>
                  <div className="exit-tile-sub">Saans, neend, energy — chhote skills</div>
                </button>
                <button
                  className="exit-tile tile-lab"
                  onClick={() => startFeature("lab")}
                  aria-label="Report samjho"
                >
                  <div className="exit-tile-emoji">🧪</div>
                  <div className="exit-tile-title">Report samjho</div>
                  <div className="exit-tile-sub">Photo ya PDF — asaan zubaan</div>
                </button>
                <button
                  className="exit-tile tile-dawai"
                  onClick={() => startFeature("rx")}
                  aria-label="Dawai ka time"
                >
                  <div className="exit-tile-emoji">💊</div>
                  <div className="exit-tile-title">Dawai ka time</div>
                  <div className="exit-tile-sub">Parchi scan · reminder · ghar mangao</div>
                </button>
              </div>
            </div>

            {/* v6.0: Aaj ka safar — 6-step gentle path (visual breadcrumb, not habit-tracking) */}
            <div className="safar-path" id="safar-path">
              {/* JS renders */}
            </div>

            {/* v5.2 + v6.0: Sunita home — auto-shown when profile.age >= 40 OR profile.scope === 'household'.
               Hidden on body.sunita removal; the dense grids below get `dense-only` so they hide when Sunita mode is on.
               v6.0: the original 4-tile "Aham kaam" block (Dawai parchi + Lab samjho + Dadi ki kahani + Doctor se baat) was a
               near-duplicate of the new exit-grid above. Dawai + Lab are covered there; only kahani + doctor remain here. */}
            <div className="sunita-home">
              <div className="sun-lbl">Aur kuch?</div>
              <div className="sun-grid">
                <button className="sunita-tile" onClick={() => playStory("general")}>
                  <div className="sunita-tile-emoji">📖</div>
                  <div className="sunita-tile-name">Dadi ki kahani</div>
                  <div className="sunita-tile-sub">2 min · roz nayi kahani</div>
                </button>
                <button className="sunita-tile danger" onClick={() => openDoctor("Aap")}>
                  <div className="sunita-tile-emoji">🩺</div>
                  <div className="sunita-tile-name">Doctor se baat</div>
                  <div className="sunita-tile-sub">Call · Practo · 1mg</div>
                </button>
              </div>

              {/* v6.1: removed "Aaj kya takleef hai?" sun-grid + the Aur dekho details
                 block. The chip rail in .talk-card above (and free-form voice/text input)
                 covers these intents conversationally; the deeper Energy/Mann shanti/Pachhan
                 wellness paths reach via the "Tan-Man ke saath" exit tile or by speaking. */}
              {false && (
                <details className="sun-more">
                  <summary>Aur dekho — wellness aur baaki takleef</summary>
                  <div className="sun-more-body">
                    <div className="sun-lbl" style={{ paddingTop: "0" }}>
                      Sehat banao
                    </div>
                    <div className="sun-grid">
                      <button
                        className="sun-tak-tile"
                        onClick={() =>
                          triWellnessTap(
                            "Energy chahiye, thakaan kam",
                            "⚡ Mujhe din bhar thakaan rehti hai. Energy badhane ka 1 AYUSH nuska + 1 habit batao — short, practical, Hinglish.",
                          )
                        }
                      >
                        <div className="sun-tak-emoji">⚡</div>
                        <div className="sun-tak-name">Energy</div>
                      </button>
                      <button
                        className="sun-tak-tile"
                        onClick={() =>
                          triWellnessTap(
                            "Mann shanti, stress kam",
                            "🧠 Stress kam karke mann shanti ke liye 1 saans technique + 1 lifestyle tip do — short, Hinglish.",
                          )
                        }
                      >
                        <div className="sun-tak-emoji">🧠</div>
                        <div className="sun-tak-name">Mann shanti</div>
                      </button>
                      <button
                        className="sun-tak-tile"
                        onClick={() =>
                          triWellnessTap(
                            "Pachhan strong, pet halka",
                            "🌱 Pachhan strong, pet halka rakhne ke liye 1 ghar ka tarika + 1 daily habit batao — Hinglish, short.",
                          )
                        }
                      >
                        <div className="sun-tak-emoji">🌱</div>
                        <div className="sun-tak-name">Pachhan</div>
                      </button>
                      <button
                        className="sun-tak-tile"
                        onClick={() =>
                          triWellnessTap(
                            "Immunity strong banao",
                            "💪 Immunity strong banane ke liye 1 daily AYUSH nuska + 1 habit — Hinglish, short.",
                          )
                        }
                      >
                        <div className="sun-tak-emoji">💪</div>
                        <div className="sun-tak-name">Immunity</div>
                      </button>
                    </div>
                    <div className="sun-lbl">Aur takleef</div>
                    <div className="sun-grid">
                      <button
                        className="sun-tak-tile"
                        onClick={() =>
                          triSymptomTap(
                            "Ghutno/jodon mein dard",
                            "🦴 Ghutno aur jodon mein dard ka ghar ka nushka batao",
                          )
                        }
                      >
                        <div className="sun-tak-emoji">🦴</div>
                        <div className="sun-tak-name">Ghutno dard</div>
                      </button>
                      <button
                        className="sun-tak-tile"
                        onClick={() =>
                          triSymptomTap("Bukhar hai", "🌡 Halka bukhar hai, ghar ka nushka batao")
                        }
                      >
                        <div className="sun-tak-emoji">🌡</div>
                        <div className="sun-tak-name">Bukhar</div>
                      </button>
                      <button
                        className="sun-tak-tile"
                        onClick={() =>
                          triSymptomTap(
                            "Tension/chinta",
                            "😰 Tension aur chinta lagi hai, kya karein?",
                          )
                        }
                      >
                        <div className="sun-tak-emoji">😰</div>
                        <div className="sun-tak-name">Tension</div>
                      </button>
                      <button
                        className="sun-tak-tile"
                        onClick={() =>
                          triSymptomTap(
                            "Saans/galay ki dikkat",
                            "🌬 Galay mein khich-khich, saans bhaari — nushka batao",
                          )
                        }
                      >
                        <div className="sun-tak-emoji">🌬</div>
                        <div className="sun-tak-name">Saans/galay</div>
                      </button>
                    </div>
                  </div>
                </details>
              )}
            </div>

            {/* v6.1: removed dense-only wellness goals + symptom triage grids + "Aur kya kar sakte ho" tri-rail.
               Voice-first design — the talk-card above (input + mic + rotating placeholder + chip rail) and the
               exit-grid (Tabiyat/Tan-Man/Report/Dawai) cover every intent conversationally. Kept wrapped in {false}
               for now in case a section needs to come back; safe to delete in a follow-up cleanup. */}
            {false && (
              <>
                <div className="tri-rail-lbl dense-only">Aaj behtar feel karo</div>
                <div className="tri-grid dense-only" id="tri-well-grid">
                  <button
                    className="tri-btn"
                    onClick={() =>
                      triWellnessTap(
                        "Energy chahiye, thakaan kam",
                        "⚡ Mujhe din bhar thakaan rehti hai. Energy badhane ka 1 AYUSH nuska + 1 habit batao — short, practical, Hinglish.",
                      )
                    }
                  >
                    <div className="tri-btn-emoji">⚡</div>
                    <div className="tri-btn-text">
                      Energy<div className="tri-btn-sub">Thakaan kam</div>
                    </div>
                  </button>
                  <button
                    className="tri-btn"
                    onClick={() =>
                      triWellnessTap(
                        "Achi neend chahiye",
                        "😴 Achi gehri neend ke liye aaj raat ka ek ritual + 1 ghar ka nuska batao — short, Hinglish.",
                      )
                    }
                  >
                    <div className="tri-btn-emoji">😴</div>
                    <div className="tri-btn-text">
                      Achi neend<div className="tri-btn-sub">Gehri, sukoon</div>
                    </div>
                  </button>
                  <button
                    className="tri-btn"
                    onClick={() =>
                      triWellnessTap(
                        "Pachhan strong, pet halka",
                        "🌱 Pachhan strong, pet halka rakhne ke liye 1 ghar ka tarika + 1 daily habit batao — Hinglish, short.",
                      )
                    }
                  >
                    <div className="tri-btn-emoji">🌱</div>
                    <div className="tri-btn-text">
                      Pachhan<div className="tri-btn-sub">Pet halka</div>
                    </div>
                  </button>
                  <button
                    className="tri-btn"
                    onClick={() =>
                      triWellnessTap(
                        "Mann shanti, stress kam",
                        "🧠 Stress kam karke mann shanti ke liye 1 saans technique + 1 lifestyle tip do — short, Hinglish.",
                      )
                    }
                  >
                    <div className="tri-btn-emoji">🧠</div>
                    <div className="tri-btn-text">
                      Mann shanti<div className="tri-btn-sub">Stress kam</div>
                    </div>
                  </button>
                  <button
                    className="tri-btn"
                    onClick={() =>
                      triWellnessTap(
                        "Skin glow chahiye",
                        "✨ Skin glow ke liye Indian kitchen se 1 daily nuska + 1 habit batao — Hinglish, no chemicals talk.",
                      )
                    }
                  >
                    <div className="tri-btn-emoji">✨</div>
                    <div className="tri-btn-text">
                      Skin glow<div className="tri-btn-sub">Roz nikhar</div>
                    </div>
                  </button>
                  <button
                    className="tri-btn"
                    onClick={() =>
                      triWellnessTap(
                        "Healthy weight chahiye",
                        "⚖ Sustainable healthy weight ke liye 1 ghar ka tarika + 1 movement habit — no crash diet, Hinglish.",
                      )
                    }
                  >
                    <div className="tri-btn-emoji">⚖</div>
                    <div className="tri-btn-text">
                      Vajan<div className="tri-btn-sub">Healthy way</div>
                    </div>
                  </button>
                  <button
                    className="tri-btn"
                    onClick={() =>
                      triWellnessTap(
                        "Focus chahiye padhai/kaam mein",
                        "🎯 Padhai/kaam mein focus badhane ke 2 practical wellness tips — Hinglish, short, actionable.",
                      )
                    }
                  >
                    <div className="tri-btn-emoji">🎯</div>
                    <div className="tri-btn-text">
                      Focus<div className="tri-btn-sub">Padhai/kaam</div>
                    </div>
                  </button>
                  <button
                    className="tri-btn"
                    onClick={() =>
                      triWellnessTap(
                        "Immunity strong banao",
                        "💪 Immunity strong banane ke liye 1 daily AYUSH nuska + 1 habit — Hinglish, short.",
                      )
                    }
                  >
                    <div className="tri-btn-emoji">💪</div>
                    <div className="tri-btn-text">
                      Immunity<div className="tri-btn-sub">Strong rahein</div>
                    </div>
                  </button>
                </div>

                {/* v4: Symptom triage grid — for the unwell */}
                <div className="tri-rail-lbl dense-only">Koi takleef hai?</div>
                <div className="tri-grid dense-only" id="tri-grid">
                  <button className="tri-btn" onClick={() => startFocus("sir-dard")}>
                    <div className="tri-btn-emoji">🤕</div>
                    <div className="tri-btn-text">
                      Sir dard<div className="tri-btn-sub">Headache, migraine</div>
                    </div>
                  </button>
                  <button className="tri-btn" onClick={() => startFocus("sardi-khansi")}>
                    <div className="tri-btn-emoji">🤧</div>
                    <div className="tri-btn-text">
                      Sardi-khansi<div className="tri-btn-sub">Cold, cough</div>
                    </div>
                  </button>
                  <button className="tri-btn" onClick={() => startFocus("pet")}>
                    <div className="tri-btn-emoji">🤢</div>
                    <div className="tri-btn-text">
                      Pet ki dikkat<div className="tri-btn-sub">Acidity, gas, dard</div>
                    </div>
                  </button>
                  <button className="tri-btn" onClick={() => startFocus("neend")}>
                    <div className="tri-btn-emoji">😴</div>
                    <div className="tri-btn-text">
                      Neend nahi<div className="tri-btn-sub">Sleep issues</div>
                    </div>
                  </button>
                  <button
                    className="tri-btn"
                    onClick={() =>
                      triSymptomTap(
                        "Ghutno/jodon mein dard",
                        "🦴 Ghutno aur jodon mein dard ka ghar ka nushka batao",
                      )
                    }
                  >
                    <div className="tri-btn-emoji">🦴</div>
                    <div className="tri-btn-text">
                      Ghutno/jodon dard<div className="tri-btn-sub">Joints, knees</div>
                    </div>
                  </button>
                  <button
                    className="tri-btn"
                    onClick={() =>
                      triSymptomTap("Bukhar hai", "🌡 Halka bukhar hai, ghar ka nushka batao")
                    }
                  >
                    <div className="tri-btn-emoji">🌡</div>
                    <div className="tri-btn-text">
                      Bukhar<div className="tri-btn-sub">Fever</div>
                    </div>
                  </button>
                  <button
                    className="tri-btn"
                    onClick={() =>
                      triSymptomTap("Tension/chinta", "😰 Tension aur chinta lagi hai, kya karein?")
                    }
                  >
                    <div className="tri-btn-emoji">😰</div>
                    <div className="tri-btn-text">
                      Tension<div className="tri-btn-sub">Anxiety, stress</div>
                    </div>
                  </button>
                  <button
                    className="tri-btn"
                    onClick={() =>
                      triSymptomTap(
                        "Saans/galay ki dikkat",
                        "🌬 Galay mein khich-khich, saans bhaari — nushka batao",
                      )
                    }
                  >
                    <div className="tri-btn-emoji">🌬</div>
                    <div className="tri-btn-text">
                      Saans/galay<div className="tri-btn-sub">Throat, breath</div>
                    </div>
                  </button>
                </div>

                {/* v5.1: Mood pulse strip removed for de-cluttering — wellness goals + symptoms grid cover both intents */}

                {/* v4: Aur kya kar sakte ho — subtle horizontal rail of secondary use cases */}
                <div className="tri-rail-lbl">Aur kya kar sakte ho</div>
                <div className="tri-rail" id="tri-rail">
                  <button className="tri-rail-card" onClick={() => startFeature("bazaar")}>
                    <span className="tri-rail-emoji">🗂</span>
                    <span className="tri-rail-name">Mera Sehat</span>
                    <span className="tri-rail-sub" id="tri-rail-bazaar-sub">
                      Reminders · Orders
                    </span>
                  </button>
                  <button className="tri-rail-card" onClick={() => playStory("general")}>
                    <span className="tri-rail-emoji">📖</span>
                    <span className="tri-rail-name">Dadi ki kahani</span>
                    <span className="tri-rail-sub">2 min · Suno</span>
                  </button>
                  <button className="tri-rail-card" onClick={() => goTo("s-breathwork")}>
                    <span className="tri-rail-emoji">🌬</span>
                    <span className="tri-rail-name">Saans karein</span>
                    <span className="tri-rail-sub">2 min · Try</span>
                  </button>
                  <button className="tri-rail-card" onClick={() => startFeature("meal")}>
                    <span className="tri-rail-emoji">🍽</span>
                    <span className="tri-rail-name">Meal plan</span>
                    <span className="tri-rail-sub">3-din ka</span>
                  </button>
                  <button className="tri-rail-card" onClick={() => startFeature("family")}>
                    <span className="tri-rail-emoji">👨‍👩‍👧</span>
                    <span className="tri-rail-name">Parivaar</span>
                    <span className="tri-rail-sub">Sab ek jagah</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* v6.1: removed bottom hub `<div className="bar">` — hub-input moved into the prominent .talk-card above.
             s-chat retains its own .bar for in-chat messaging. */}
          {false && (
            <div className="bar">
              <div className="bar-inner">
                <input
                  className="bar-input"
                  id="hub-input"
                  placeholder="Kuch bhi batao..."
                  onKeyDown={(e) => hubKey(e)}
                />
                <button
                  className="bar-send"
                  id="hub-send-btn"
                  onClick={() => hubSend()}
                  style={{
                    display: "none",
                    background: "rgba(255,255,255,.12)",
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    border: "none",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
                    <path
                      d="M5 12l14 0M13 6l6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <button className="bar-speak" id="hub-speak" onClick={() => toggleVoice("hub")}>
                  <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
                    <path
                      d="M12 2a3 3 0 00-3 3v6a3 3 0 006 0V5a3 3 0 00-3-3z"
                      stroke="white"
                      strokeWidth="2"
                      fill="white"
                    />
                    <path
                      d="M19 10a7 7 0 01-14 0M12 17v4"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span id="hub-speak-lbl">Speak</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ══════════════ v6.2 MAGIC WALKTHROUGH OVERLAY ══════════════
           In-app player for "Dadi ke saath karein" experiences. Never leaves the
           app. Full-screen modal with animation viewport, Dadi-voiced narration,
           step progress, controls. Activated by openWalkthrough(experienceKey). */}
        <div className="wt-overlay" id="wt-overlay" aria-hidden="true">
          <div className="wt-modal" role="dialog" aria-label="Dadi ke saath">
            <button
              className="wt-close"
              onClick={() => closeWalkthrough()}
              aria-label="Band karein"
            >
              ×
            </button>

            {/* Top: title + step counter */}
            <div className="wt-hdr">
              <div className="wt-hdr-title" id="wt-title">
                {/* JS fills */}
              </div>
              <div className="wt-hdr-sub" id="wt-subtitle">
                {/* JS fills */}
              </div>
              <div className="wt-step-counter" id="wt-step-counter">
                {/* JS fills, e.g. "Step 1 / 5" */}
              </div>
            </div>

            {/* Animation viewport — either inline SVG or Lottie container */}
            <div className="wt-stage">
              <div className="wt-anim" id="wt-anim">
                {/* JS injects the active step's inline SVG OR a Lottie player */}
              </div>
              <div className="wt-stage-glow" aria-hidden="true"></div>
            </div>

            {/* Step caption + Dadi line */}
            <div className="wt-caption">
              <div className="wt-caption-step" id="wt-step-title">
                {/* JS fills */}
              </div>
              <div className="wt-caption-line" id="wt-step-line">
                {/* JS fills, e.g. "Pehle ek cup doodh halki aanch par garam karo" */}
              </div>
            </div>

            {/* Timer bar */}
            <div className="wt-timer">
              <div className="wt-timer-fill" id="wt-timer-fill"></div>
            </div>

            {/* Progress dots */}
            <div className="wt-dots" id="wt-dots">
              {/* JS renders dots */}
            </div>

            {/* Controls */}
            <div className="wt-controls">
              <button
                className="wt-btn wt-btn-pause"
                id="wt-pause-btn"
                onClick={() => walkthroughPauseToggle()}
                aria-label="Pause"
              >
                <span id="wt-pause-icon">⏸</span>
              </button>
              <button
                className="wt-btn wt-btn-next"
                id="wt-next-btn"
                onClick={() => walkthroughNext()}
              >
                Aage ›
              </button>
              <button
                className="wt-btn wt-btn-done"
                id="wt-done-btn"
                onClick={() => closeWalkthrough()}
              >
                Bas, ho gaya
              </button>
            </div>

            {/* Finish state — shown after last step. Hidden by default. */}
            <div className="wt-finish" id="wt-finish">
              <div className="wt-finish-emoji">🌿</div>
              <div className="wt-finish-line" id="wt-finish-line">
                {/* JS fills */}
              </div>
              <div className="wt-finish-citation" id="wt-finish-citation">
                {/* JS fills (CCRAS citation if applicable) */}
              </div>
              <div className="wt-finish-feedback">
                <button className="wt-feedback-btn" onClick={() => walkthroughFeedback("better")}>
                  👍 Acha laga
                </button>
                <button className="wt-feedback-btn" onClick={() => walkthroughFeedback("same")}>
                  Theek
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════ TOOLS BOTTOM SHEET ══════════════ */}
        <div className="bs-overlay" id="bs-overlay" onClick={() => closeToolsSheet()}></div>
        <div className="bs-sheet" id="bs-sheet">
          <div className="bs-handle"></div>
          <div className="bs-title">Sehat Tools</div>
          <button
            className="bs-row"
            onClick={() => {
              closeToolsSheet();
              startFeature("nushke");
            }}
          >
            <div
              className="bs-row-icon"
              style={{ background: "rgba(30,204,176,.15)", color: "#1eccb0" }}
            >
              🌿
            </div>
            <div className="bs-row-text">
              <div className="bs-row-name">Ghar ke Nushke</div>
              <div className="bs-row-sub">Koi takleef? Dadi batayegi</div>
            </div>
          </button>
          <div className="bs-divider"></div>
          <button
            className="bs-row"
            onClick={() => {
              closeToolsSheet();
              startFeature("lab");
            }}
          >
            <div
              className="bs-row-icon"
              style={{ background: "rgba(30,204,176,.15)", color: "#1eccb0" }}
            >
              🧪
            </div>
            <div className="bs-row-text">
              <div className="bs-row-name">Lab Report Padho</div>
              <div className="bs-row-sub">Apni report ka asaan matlab</div>
            </div>
          </button>
          <div className="bs-divider"></div>
          <button
            className="bs-row"
            onClick={() => {
              closeToolsSheet();
              startFeature("rx");
            }}
          >
            <div
              className="bs-row-icon"
              style={{ background: "rgba(251,146,60,.15)", color: "#fb923c" }}
            >
              💊
            </div>
            <div className="bs-row-text">
              <div className="bs-row-name">Dawai parchi · reminder · order</div>
              <div className="bs-row-sub">Scan, yaad dilao, ghar mangao</div>
            </div>
          </button>
          <div className="bs-divider"></div>
          <button
            className="bs-row"
            onClick={() => {
              closeToolsSheet();
              startFeature("bazaar");
            }}
          >
            <div
              className="bs-row-icon"
              style={{ background: "rgba(168,85,247,.16)", color: "#a855f7" }}
            >
              🗂
            </div>
            <div className="bs-row-text">
              <div className="bs-row-name">Mera Sehat</div>
              <div className="bs-row-sub">Reminders · Orders · Reports</div>
            </div>
          </button>
          <div className="bs-divider"></div>
          <button
            className="bs-row"
            onClick={() => {
              closeToolsSheet();
              startFeature("meal");
            }}
          >
            <div
              className="bs-row-icon"
              style={{ background: "rgba(251,146,60,.15)", color: "#fb923c" }}
            >
              🍽️
            </div>
            <div className="bs-row-text">
              <div className="bs-row-name">Meal Planning</div>
              <div className="bs-row-sub">Ghar ke khaane ka 3-din plan</div>
            </div>
          </button>
          <div className="bs-divider"></div>
          <button
            className="bs-row"
            onClick={() => {
              closeToolsSheet();
              startFeature("family");
            }}
          >
            <div
              className="bs-row-icon"
              style={{ background: "rgba(107,33,168,.18)", color: "#a855f7" }}
            >
              👨‍👩‍👧
            </div>
            <div className="bs-row-text">
              <div className="bs-row-name">Parivaar</div>
              <div className="bs-row-sub">Sab ke liye ek jagah dekhbhal</div>
            </div>
          </button>
          <div className="bs-divider"></div>
          <button className="bs-row disabled">
            <div
              className="bs-row-icon"
              style={{ background: "rgba(255,255,255,.06)", color: "#888" }}
            >
              💬
            </div>
            <div className="bs-row-text">
              <div className="bs-row-name">Sehat Charcha</div>
              <div className="bs-row-sub">Apke jaise logo se milo</div>
            </div>
            <div className="bs-row-tag">Jald aa raha hai</div>
          </button>
          <div className="bs-divider"></div>
          <button
            className="bs-row"
            onClick={() => {
              closeToolsSheet();
              startOnboarding("s-hub");
            }}
          >
            <div
              className="bs-row-icon"
              style={{ background: "rgba(255,255,255,.06)", color: "#fff" }}
            >
              ⚙️
            </div>
            <div className="bs-row-text">
              <div className="bs-row-name">Profile</div>
              <div className="bs-row-sub">Apni jaankari edit karein</div>
            </div>
          </button>
        </div>

        {/* ══════════════ CHAT SCREEN ══════════════ */}
        <div className="screen" id="s-chat">
          <div className="hdr">
            <button className="hdr-btn" onClick={() => goBack()}>
              <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
                <path
                  d="M15 20a1 1 0 01-.71-.29l-7-7a1 1 0 010-1.42l7-7a1.005 1.005 0 011.42 1.42L9.41 12l6.3 6.29a1 1 0 01-.71 1.71z"
                  fill="currentColor"
                />
              </svg>
            </button>
            <div className="hdr-center">
              {/* v6.1: emoji-based Dadi avatar replaces persona-health.png (male doctor figure)
                 to match the Dadi/Nani persona the system prompt defines. */}
              <div className="hdr-avatar">
                <div
                  role="img"
                  aria-label="Sehat Saathi Dadi"
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "2px solid #6D17CE",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(135deg, #fde68a 0%, #fb923c 55%, #b45309 100%)",
                    fontSize: "24px",
                    lineHeight: 1,
                  }}
                >
                  👵🏽
                </div>
                <div className="hdr-online"></div>
              </div>
              <div className="hdr-text">
                <h2>Sehat Saathi</h2>
                <p id="chat-ctx-label">Ghar ke Nushke</p>
              </div>
            </div>
            <button className="hdr-btn" onClick={() => clearChat()}>
              <img
                src="https://raw.githubusercontent.com/sunit1986/JioBharatIQ_Server/main/assets/icons/svg/ic_edit_pen.svg"
                width="20"
                height="20"
                style={{ filter: "invert(1)", opacity: ".8" }}
                alt="New"
              />
            </button>
          </div>
          <div className="chat-messages" id="chat-msgs"></div>
          <div className="bar">
            <div className="bar-inner">
              <input
                className="bar-input"
                id="chat-input"
                placeholder="Apni baat likhein..."
                onKeyDown={(e) => chatKey(e)}
              />
              <button className="bar-speak" id="chat-speak" onClick={() => toggleVoice("chat")}>
                <svg viewBox="0 0 24 24" fill="none" width="15" height="15">
                  <path
                    d="M12 2a1 1 0 00-1 1v18a1 1 0 002 0V3a1 1 0 00-1-1zM4 9a1 1 0 00-1 1v4a1 1 0 102 0v-4a1 1 0 00-1-1zm4-3a1 1 0 00-1 1v10a1 1 0 102 0V7a1 1 0 00-1-1zm12 3a1 1 0 00-1 1v4a1 1 0 002 0v-4a1 1 0 00-1-1zm-4-3a1 1 0 00-1 1v10a1 1 0 002 0V7a1 1 0 00-1-1z"
                    fill="currentColor"
                  />
                </svg>
                <span id="chat-speak-lbl">Speak</span>
              </button>
              <button className="bar-send" onClick={() => chatSend()}>
                <img
                  src="https://raw.githubusercontent.com/sunit1986/JioBharatIQ_Server/main/assets/icons/svg/ic_message_send.svg"
                  width="20"
                  height="20"
                  style={{ filter: "invert(1)" }}
                  alt="Send"
                />
              </button>
            </div>
          </div>
        </div>

        {/* ══════════════ ONBOARDING SCREEN ══════════════ */}
        <div className="screen" id="s-onboard">
          <div className="hdr">
            <button className="hdr-btn" onClick={() => skipOnboarding()} aria-label="Back">
              <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
                <path
                  d="M15 20a1 1 0 01-.71-.29l-7-7a1 1 0 010-1.42l7-7a1.005 1.005 0 011.42 1.42L9.41 12l6.3 6.29a1 1 0 01-.71 1.71z"
                  fill="currentColor"
                />
              </svg>
            </button>
            <div className="hdr-center">
              <div className="hdr-text">
                <h2>Sehat Saathi</h2>
                <p style={{ color: "var(--text2)" }}>Aap ko jaanne ke liye</p>
              </div>
            </div>
            <button className="ob-skip" onClick={() => skipOnboarding()}>
              Baad mein
            </button>
          </div>
          <div className="ob-progress" id="ob-progress">
            <div className="ob-progress-dot active"></div>
            <div className="ob-progress-dot"></div>
            <div className="ob-progress-dot"></div>
          </div>
          <div className="body" id="ob-body">
            {/* JS renders */}
          </div>
        </div>

        {/* ══════════════ COMMUNITY SCREEN (stub Phase 6) ══════════════ */}
        <div className="screen" id="s-community">
          <div className="hdr">
            <button className="hdr-btn" onClick={() => goBack()}>
              <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
                <path
                  d="M15 20a1 1 0 01-.71-.29l-7-7a1 1 0 010-1.42l7-7a1.005 1.005 0 011.42 1.42L9.41 12l6.3 6.29a1 1 0 01-.71 1.71z"
                  fill="currentColor"
                />
              </svg>
            </button>
            <div className="hdr-center">
              <div className="hdr-text">
                <h2>Sehat Charcha</h2>
                <p style={{ color: "var(--text2)" }}>Apke jaise log</p>
              </div>
            </div>
          </div>
          <div className="flow-screen" id="community-body"></div>
        </div>

        {/* ══════════════ LAB INTERPRETER SCREEN (stub Phase 7) ══════════════ */}
        <div className="screen" id="s-lab">
          <div className="hdr">
            <button className="hdr-btn" onClick={() => goBack()}>
              <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
                <path
                  d="M15 20a1 1 0 01-.71-.29l-7-7a1 1 0 010-1.42l7-7a1.005 1.005 0 011.42 1.42L9.41 12l6.3 6.29a1 1 0 01-.71 1.71z"
                  fill="currentColor"
                />
              </svg>
            </button>
            <div className="hdr-center">
              <div className="hdr-text">
                <h2>Lab Report Padho</h2>
                <p style={{ color: "var(--text2)" }}>PDF upload karein</p>
              </div>
            </div>
          </div>
          <div className="body" id="lab-body" style={{ overflowY: "auto" }}></div>
        </div>

        {/* ══════════════ MEDICINE SCREEN ══════════════ */}
        <div className="screen" id="s-medicine">
          <div className="hdr">
            <button className="hdr-btn" onClick={() => goBack()}>
              <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
                <path
                  d="M15 20a1 1 0 01-.71-.29l-7-7a1 1 0 010-1.42l7-7a1.005 1.005 0 011.42 1.42L9.41 12l6.3 6.29a1 1 0 01-.71 1.71z"
                  fill="currentColor"
                />
              </svg>
            </button>
            <div className="hdr-center">
              <div className="hdr-text">
                <h2>Dawai Reminder</h2>
              </div>
            </div>
          </div>
          <div className="flow-screen" id="med-flow">
            {/* JS renders */}
          </div>
        </div>

        {/* ══════════════ MEAL SCREEN ══════════════ */}
        <div className="screen" id="s-meal">
          <div className="hdr">
            <button className="hdr-btn" onClick={() => goBack()}>
              <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
                <path
                  d="M15 20a1 1 0 01-.71-.29l-7-7a1 1 0 010-1.42l7-7a1.005 1.005 0 011.42 1.42L9.41 12l6.3 6.29a1 1 0 01-.71 1.71z"
                  fill="currentColor"
                />
              </svg>
            </button>
            <div className="hdr-center">
              <div className="hdr-text">
                <h2>Meal Planning</h2>
              </div>
            </div>
          </div>
          <div className="flow-screen" id="meal-flow">
            {/* JS renders */}
          </div>
        </div>

        {/* ══════════════ FAMILY SCREEN ══════════════ */}
        <div className="screen" id="s-family">
          <div className="hdr">
            <button className="hdr-btn" onClick={() => goBack()}>
              <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
                <path
                  d="M15 20a1 1 0 01-.71-.29l-7-7a1 1 0 010-1.42l7-7a1.005 1.005 0 011.42 1.42L9.41 12l6.3 6.29a1 1 0 01-.71 1.71z"
                  fill="currentColor"
                />
              </svg>
            </button>
            <div className="hdr-center">
              <div className="hdr-text">
                <h2>Parivaar</h2>
              </div>
            </div>
            <button className="hdr-btn" onClick={() => showAddFamily()}>
              <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
                <path
                  d="M12 5v14M5 12h14"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
          <div className="flow-screen" id="family-list">
            {/* JS renders */}
          </div>
        </div>

        {/* ══════════════ BREATHWORK SCREEN ══════════════ */}
        <div className="screen" id="s-breathwork">
          <div className="hdr">
            <button
              className="hdr-btn"
              onClick={() => {
                goBack();
                stopBreath();
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
                <path
                  d="M15 20a1 1 0 01-.71-.29l-7-7a1 1 0 010-1.42l7-7a1.005 1.005 0 011.42 1.42L9.41 12l6.3 6.29a1 1 0 01-.71 1.71z"
                  fill="currentColor"
                />
              </svg>
            </button>
            <div className="hdr-center">
              <div className="hdr-text">
                <h2 id="breath-screen-title">Box Breathing</h2>
              </div>
            </div>
          </div>
          <div
            className="body"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "28px",
              padding: "40px 20px",
            }}
          >
            <p
              style={{ fontSize: "14px", color: "var(--text2)", textAlign: "center" }}
              id="breath-intro"
            >
              Box breathing ek scientifically proven technique hai jo tension, anxiety aur stress
              mein instant relief deta hai. Sirf 4 minute mein feel karoge fark.
            </p>
            <div className="breath-ring-wrap">
              <div className="breath-glow" id="breath-glow"></div>
              <div className="breath-ring" id="breath-ring">
                <div className="breath-ring-inner"></div>
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div className="breath-count" id="breath-count" style={{ display: "none" }}>
                4
              </div>
              <div className="breath-phase" id="breath-phase">
                Taiyar ho?
              </div>
            </div>
            <p className="breath-instruction" id="breath-instr">
              Naak se saans lo, andar rokho, bahar nikalo, bahar rokho — har step 4 second ka. 4
              rounds karein.
            </p>
            <button className="breath-start-btn" id="breath-btn" onClick={() => startBreath()}>
              Shuru Karo
            </button>
            <div id="stretch-steps-wrap" style={{ display: "none", width: "100%" }}></div>
          </div>
        </div>

        {/* ══════════════ v5: PRESCRIPTION SCAN + REMINDER + ORDER FLOW ══════════════ */}
        <div className="screen" id="s-rx">
          <div className="hdr">
            <button className="hdr-btn" onClick={() => rxBack()}>
              <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
                <path
                  d="M15 20a1 1 0 01-.71-.29l-7-7a1 1 0 010-1.42l7-7a1.005 1.005 0 011.42 1.42L9.41 12l6.3 6.29a1 1 0 01-.71 1.71z"
                  fill="currentColor"
                />
              </svg>
            </button>
            <div className="hdr-center">
              <div className="hdr-text">
                <h2 id="rx-hdr-title">Dawai Reminder</h2>
                <p style={{ color: "var(--text2)" }} id="rx-hdr-sub">
                  Prescription scan ya manual
                </p>
              </div>
            </div>
          </div>
          <div id="rx-progress-wrap"></div>
          <div className="body" id="rx-body" style={{ overflowY: "auto" }}></div>
        </div>

        {/* ══════════════ v5: SEHAT BAZAAR — ORDER FLOW (cart, address, payment, success) ══════════════ */}
        <div className="screen" id="s-order">
          <div className="hdr">
            <button className="hdr-btn" onClick={() => orderBack()}>
              <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
                <path
                  d="M15 20a1 1 0 01-.71-.29l-7-7a1 1 0 010-1.42l7-7a1.005 1.005 0 011.42 1.42L9.41 12l6.3 6.29a1 1 0 01-.71 1.71z"
                  fill="currentColor"
                />
              </svg>
            </button>
            <div className="hdr-center">
              <div className="hdr-text">
                <h2 id="order-hdr-title">Sehat Bazaar</h2>
                <p style={{ color: "var(--text2)" }} id="order-hdr-sub">
                  Reliance Netmeds ke saath
                </p>
              </div>
            </div>
          </div>
          <div id="order-progress-wrap"></div>
          <div className="body" id="order-body" style={{ overflowY: "auto" }}></div>
        </div>

        {/* ══════════════ v5: ORDER TRACKING SCREEN ══════════════ */}
        <div className="screen" id="s-track">
          <div className="hdr">
            <button className="hdr-btn" onClick={() => goBack()}>
              <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
                <path
                  d="M15 20a1 1 0 01-.71-.29l-7-7a1 1 0 010-1.42l7-7a1.005 1.005 0 011.42 1.42L9.41 12l6.3 6.29a1 1 0 01-.71 1.71z"
                  fill="currentColor"
                />
              </svg>
            </button>
            <div className="hdr-center">
              <div className="hdr-text">
                <h2>Order Track Karein</h2>
              </div>
            </div>
          </div>
          <div className="body" id="track-body" style={{ overflowY: "auto" }}></div>
        </div>

        {/* ══════════════ v5: MERA SEHAT — REMINDERS + ORDERS + REPORTS ══════════════ */}
        <div className="screen" id="s-bazaar">
          <div className="hdr">
            <button className="hdr-btn" onClick={() => goBack()}>
              <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
                <path
                  d="M15 20a1 1 0 01-.71-.29l-7-7a1 1 0 010-1.42l7-7a1.005 1.005 0 011.42 1.42L9.41 12l6.3 6.29a1 1 0 01-.71 1.71z"
                  fill="currentColor"
                />
              </svg>
            </button>
            <div className="hdr-center">
              <div className="hdr-text">
                <h2>Mera Sehat</h2>
                <p style={{ color: "var(--text2)" }}>Reminders, orders, reports</p>
              </div>
            </div>
          </div>
          <div className="body" id="bazaar-body" style={{ overflowY: "auto" }}></div>
        </div>

        {/* v5.3: Clarifying Q&A screen — fires before Focus Mode takes over the hub */}
        <div className="screen" id="s-focus-qa">
          <div className="hdr">
            <button className="hdr-btn" onClick={() => cancelFocusQA()} aria-label="Cancel">
              <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
                <path
                  d="M15 20a1 1 0 01-.71-.29l-7-7a1 1 0 010-1.42l7-7a1.005 1.005 0 011.42 1.42L9.41 12l6.3 6.29a1 1 0 01-.71 1.71z"
                  fill="currentColor"
                />
              </svg>
            </button>
            <div className="hdr-center">
              <div className="hdr-text">
                <h2 id="fq-hdr-title">Takleef ke baare mein</h2>
                <p style={{ color: "var(--text2)" }} id="fq-hdr-sub">
                  3 chote sawaal
                </p>
              </div>
            </div>
          </div>
          <div className="body" id="fq-body" style={{ overflowY: "auto" }}>
            {/* JS renders */}
          </div>
        </div>

        {/* v3.7: Movement skill player overlay */}
        <div id="move-ov" role="dialog" aria-label="Movement player">
          <button className="move-ov-close" onClick={() => closeMovement()} aria-label="Close">
            ✕
          </button>
          <div className="move-ov-anim pulse" id="move-ov-anim">
            🌬
          </div>
          <div className="move-ov-counter" id="move-ov-counter">
            3
          </div>
          <div className="move-ov-title" id="move-ov-title">
            Anulom-Vilom
          </div>
          <div className="move-ov-step-text" id="move-ov-step">
            Daahini naak band karke baayi se saans lo...
          </div>
          <div className="move-ov-progress" id="move-ov-progress"></div>
          <div className="move-ov-actions">
            <button className="move-ov-btn secondary" onClick={() => closeMovement()}>
              Bas
            </button>
            <button className="move-ov-btn" id="move-ov-next" onClick={() => moveNextStep()}>
              Aage badho
            </button>
          </div>
        </div>

        {/* v3.4: Voice picker overlay */}
        <div id="voice-picker-ov" role="dialog" aria-label="Voice picker">
          <div className="vp-title">Dadi ki awaaz chunein</div>
          <div className="vp-sub">
            Pehle suno, phir favourite pick karein. Yeh sab Sehat Saathi ki awaaz banegi.
          </div>
          <div className="vp-list" id="vp-list">
            {/* JS renders */}
          </div>
          <div style={{ margin: "10px 0 4px", width: "100%", maxWidth: "340px" }}>
            <button
              className="vp-btn secondary"
              style={{ width: "100%", fontSize: "12px", padding: "10px" }}
              onClick={() => setElevenLabsKey()}
            >
              🚀 ElevenLabs key paste karein (faster + warmer)
            </button>
          </div>
          <div className="vp-actions">
            <button className="vp-btn secondary" onClick={() => closeVoicePicker()}>
              Cancel
            </button>
            <button className="vp-btn" id="vp-save-btn" onClick={() => saveVoicePick()}>
              Pick yeh awaaz
            </button>
          </div>
        </div>

        {/* ══════════════ VOICE OVERLAY (v4: live conversation) ══════════════ */}
        <div id="voice-ov">
          <button className="voice-close" onClick={() => stopVoice()} aria-label="Band karein">
            <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <div className="voice-state-pill" id="voice-state-pill">
            Sun rahi hoon
          </div>
          <video
            className="voice-vid"
            id="voice-vid"
            autoPlay
            loop
            muted
            playsInline
            src="https://raw.githubusercontent.com/sunit1986/JioBharatIQ_Server/main/assets/states/Dark/HelloJio_Listening_242.mp4"
          ></video>
          <div className="voice-bars" id="voice-bars">
            <div className="voice-bar"></div>
            <div className="voice-bar"></div>
            <div className="voice-bar"></div>
            <div className="voice-bar"></div>
            <div className="voice-bar"></div>
          </div>
          <div className="voice-transcript-area" id="voice-transcript-area"></div>
          <div className="voice-hint" id="voice-hint">
            Bolein... ya rukne ke liye band karein
          </div>
          <button className="voice-stop" onClick={() => stopVoice()}>
            <span className="voice-stop-dot"></span>Band karein
          </button>
          {/* Legacy refs kept so other code that touches them doesn't break */}
          <p className="voice-txt" id="voice-txt"></p>
          <p className="voice-lbl" id="voice-lbl"></p>
        </div>

        {/* ══════════════ REMINDER OVERLAY ══════════════ */}
        <div id="reminder-ov">
          <div className="reminder-glow">
            <img
              src="https://raw.githubusercontent.com/sunit1986/JioBharatIQ_Server/main/assets/icons/svg/ic_alarm.svg"
              width="48"
              height="48"
              style={{ filter: "invert(1)" }}
              alt=""
            />
          </div>
          <div className="reminder-ov-title" id="rov-title">
            Dawai ka Waqt!
          </div>
          <div className="reminder-ov-sub" id="rov-sub">
            Aapki dawai lene ka waqt ho gaya
          </div>
          <div className="reminder-ov-actions">
            <button className="reminder-snooze" onClick={() => snoozeReminder()}>
              10 min baad
            </button>
            <button className="reminder-done" onClick={() => dismissReminder()}>
              Li Li
            </button>
          </div>
        </div>

        {/* v5.2: 48h symptom check-in (Dadi tone) */}
        <div id="checkin-ov" role="dialog" aria-modal="true" aria-labelledby="ci-title">
          <div className="ci-glow" id="ci-emoji">
            🤕
          </div>
          <div className="ci-title" id="ci-title">
            Beta, kal sir dard hua tha...
          </div>
          <div className="ci-sub">Ab kaisa lag raha hai?</div>
          <div className="ci-actions">
            <button className="ci-btn better" onClick={() => onCheckinBetter()}>
              <span className="ci-btn-emoji">💚</span>
              <span className="ci-btn-text">
                <span className="ci-btn-name">Bahut behtar</span>
                <span className="ci-btn-sub">Saathi ka nuskha kaam kar gaya</span>
              </span>
            </button>
            <button className="ci-btn same" onClick={() => onCheckinSame()}>
              <span className="ci-btn-emoji">🤔</span>
              <span className="ci-btn-text">
                <span className="ci-btn-name">Aisa hi hai</span>
                <span className="ci-btn-sub">Thoda waise hi laga, koi aur upay try karein</span>
              </span>
            </button>
            <button className="ci-btn worse" onClick={() => onCheckinWorse()}>
              <span className="ci-btn-emoji">😔</span>
              <span className="ci-btn-text">
                <span className="ci-btn-name">Aur kharaab</span>
                <span className="ci-btn-sub">Doctor se baat karein</span>
              </span>
            </button>
          </div>
          <button className="ci-skip" onClick={() => closeCheckin()}>
            Baad mein
          </button>
        </div>

        {/* v5.2: Blessing overlay — fires when check-in answer is "better" */}
        <div id="bless-ov" role="dialog" aria-modal="true" aria-labelledby="bless-title">
          <div className="bless-flower">🌸</div>
          <div className="bless-title" id="bless-title">
            Bahut accha beta 🙏
          </div>
          <div className="bless-sub" id="bless-sub">
            Saathi proud hai tum par.
            <br />
            Sehat banaye rakho.
          </div>
          <div className="bless-score" id="bless-score">
            +5 Sehat Score
          </div>
          {/* v5.3: Ayurvedic long-term upsell — appended dynamically by showAyurUpsell(sku) */}
          <div id="bless-ayur-slot"></div>
        </div>

        {/* v5.3: Focus-mode "kaisa hai ab?" validation modal — same pattern as #checkin-ov */}
        <div id="focus-validate-ov" role="dialog" aria-modal="true" aria-labelledby="fv-title">
          <div className="fv-glow" id="fv-emoji">
            🤕
          </div>
          <div className="fv-title" id="fv-title">
            Beta, sir kaisa hai ab?
          </div>
          <div className="fv-sub">Saathi ka rasta theek se chal raha hai ya nahi?</div>
          <div className="fv-actions">
            <button className="ci-btn better" onClick={() => onFocusBetter()}>
              <span className="ci-btn-emoji">💚</span>
              <span className="ci-btn-text">
                <span className="ci-btn-name">Bahut behtar</span>
                <span className="ci-btn-sub">Saathi ke nuske ne kaam kiya</span>
              </span>
            </button>
            <button className="ci-btn same" onClick={() => onFocusSame()}>
              <span className="ci-btn-emoji">🤔</span>
              <span className="ci-btn-text">
                <span className="ci-btn-name">Aisa hi hai</span>
                <span className="ci-btn-sub">Ek aur upay try karein</span>
              </span>
            </button>
            <button className="ci-btn worse" onClick={() => onFocusWorse()}>
              <span className="ci-btn-emoji">😔</span>
              <span className="ci-btn-text">
                <span className="ci-btn-name">Aur kharaab</span>
                <span className="ci-btn-sub">Doctor se baat karein</span>
              </span>
            </button>
          </div>
          <button className="ci-skip" onClick={() => closeFocusValidate()}>
            Baad mein puchho
          </button>
        </div>

        {/* v5.2: Doctor handoff — fires when check-in answer is "worse" OR Sunita home "Doctor se baat" CTA */}
        <div id="doctor-ov" role="dialog" aria-modal="true" aria-labelledby="dr-title">
          <div className="dr-glow">🩺</div>
          <div className="dr-title" id="dr-title">
            Beta, ab doctor zaroori hai
          </div>
          <div className="dr-sub">
            Ghar ka nuskha kafi nahi laga. Asli doctor se ek baar mil lo — saathi yahin hai,
            ghabraao mat.
          </div>
          <div className="dr-actions">
            <a
              className="dr-btn primary"
              href="tel:18001801104"
              onClick={() => trackFeature("doctor_call")}
            >
              <span className="dr-btn-emoji">📞</span>
              <span>
                <div className="dr-btn-name">Doctor ko call karo</div>
                <div className="dr-btn-sub">NDHM Helpline 1800-180-1104 (free)</div>
              </span>
            </a>
            <a
              className="dr-btn"
              href="https://www.practo.com"
              target="_blank"
              rel="noopener"
              onClick={() => trackFeature("doctor_practo")}
            >
              <span className="dr-btn-emoji">🩺</span>
              <span>
                <div className="dr-btn-name">Practo se appointment</div>
                <div className="dr-btn-sub">Online consultation · ₹199 se shuru</div>
              </span>
            </a>
            <a
              className="dr-btn"
              href="https://www.1mg.com"
              target="_blank"
              rel="noopener"
              onClick={() => trackFeature("doctor_1mg")}
            >
              <span className="dr-btn-emoji">💊</span>
              <span>
                <div className="dr-btn-name">Tata 1mg se baat</div>
                <div className="dr-btn-sub">Pharmacist consultation</div>
              </span>
            </a>
          </div>
          <button className="dr-close" onClick={() => closeDoctor()}>
            Abhi nahi, baad mein
          </button>
        </div>

        {/* ══════════════ TOAST ══════════════ */}
        <div id="toast"></div>
      </div>
    </>
  );
}
