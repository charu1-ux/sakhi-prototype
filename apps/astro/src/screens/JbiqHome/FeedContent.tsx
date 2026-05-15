"use client";

import { JBIQ_CSS } from "./styles";

interface FeedContentProps {
  onAstrologyClick: () => void;
}

export function FeedContent({ onAstrologyClick }: FeedContentProps) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: JBIQ_CSS }} />

      <div className="jh-body-scroll">
        {/* ── YOUR ASSISTANTS ── */}
        <div className="jh-section-title jh-anim-2">Your Assistants</div>
        <div className="jh-assistants-row jh-anim-2">
          {/* Astrology — triggers onAstrologyClick */}
          <div
            className="jh-assistant-item"
            id="assistant-astrology"
            onClick={onAstrologyClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onAstrologyClick()}
          >
            <div className="jh-assistant-avatar-wrap">
              <div className="jh-assistant-ring" />
              <div className="jh-assistant-img-inner">
                <img
                  className="jh-assistant-img jh-assistant-img-scaled"
                  src="https://sunit1986.github.io/design-prototypes/Assets/persona-astrology.png"
                  alt="Astrology"
                />
              </div>
            </div>
            <span className="jh-assistant-label">Astrology</span>
          </div>

          {/* Career */}
          <a className="jh-assistant-item" href="javascript:void(0)" id="assistant-career">
            <div className="jh-assistant-avatar-wrap">
              <div className="jh-assistant-ring" />
              <div className="jh-assistant-img-inner">
                <img
                  className="jh-assistant-img jh-assistant-img-scaled"
                  src="https://sunit1986.github.io/design-prototypes/Assets/persona-career.png"
                  alt="Career"
                />
              </div>
            </div>
            <span className="jh-assistant-label">Career</span>
          </a>

          {/* Entertainment */}
          <a className="jh-assistant-item" href="javascript:void(0)">
            <div className="jh-assistant-avatar-wrap">
              <div className="jh-assistant-ring" />
              <img
                className="jh-assistant-img"
                src="https://sunit1986.github.io/design-prototypes/Assets/persona-bollywood.png"
                alt="Entertainment"
              />
            </div>
            <span className="jh-assistant-label">Entertainment</span>
          </a>

          {/* Cricket */}
          <a className="jh-assistant-item" href="javascript:void(0)">
            <div className="jh-assistant-avatar-wrap">
              <div className="jh-assistant-ring" />
              <img
                className="jh-assistant-img"
                src="https://sunit1986.github.io/design-prototypes/Assets/persona-cricket.png"
                alt="Cricket"
              />
            </div>
            <span className="jh-assistant-label">Cricket</span>
          </a>

          {/* Devotion */}
          <a
            className="jh-assistant-item jh-highlighted"
            href="javascript:void(0)"
            id="assistant-devotion"
          >
            <div className="jh-assistant-avatar-wrap">
              <div className="jh-assistant-ring" />
              <img
                className="jh-assistant-img"
                src="https://sunit1986.github.io/design-prototypes/Assets/persona-devotion.png"
                alt="Devotion"
              />
            </div>
            <span className="jh-assistant-label">Devotion</span>
          </a>

          {/* News */}
          <a className="jh-assistant-item" href="javascript:void(0)" id="assistant-news">
            <div className="jh-assistant-avatar-wrap">
              <div className="jh-assistant-ring" />
              <img
                className="jh-assistant-img"
                src="https://sunit1986.github.io/design-prototypes/Assets/persona-education.png"
                alt="News"
              />
            </div>
            <span className="jh-assistant-label">News</span>
          </a>

          {/* Finance — inactive */}
          <div className="jh-assistant-item jh-inactive">
            <div className="jh-assistant-avatar-wrap">
              <div className="jh-assistant-ring jh-grey" />
              <img
                className="jh-assistant-img"
                src="https://sunit1986.github.io/design-prototypes/Assets/persona-finance.png"
                alt="Finance"
              />
            </div>
            <span className="jh-assistant-label">Finance</span>
          </div>

          {/* Government — inactive */}
          <div className="jh-assistant-item jh-inactive">
            <div className="jh-assistant-avatar-wrap">
              <div className="jh-assistant-ring jh-grey" />
              <img
                className="jh-assistant-img"
                src="https://sunit1986.github.io/design-prototypes/Assets/persona-govt.png"
                alt="Government"
              />
            </div>
            <span className="jh-assistant-label">Government</span>
          </div>

          {/* Shopping */}
          <a
            className="jh-assistant-item jh-highlighted"
            href="javascript:void(0)"
            id="assistant-shopping"
          >
            <div className="jh-assistant-avatar-wrap">
              <div className="jh-assistant-ring" />
              <div className="jh-assistant-img-inner">
                <svg viewBox="0 0 48 48" fill="none" width="44" height="44">
                  <defs>
                    <linearGradient id="shopGrad" x1="0" y1="0" x2="48" y2="48">
                      <stop offset="0%" stopColor="#1eccb0" />
                      <stop offset="100%" stopColor="#25ab21" />
                    </linearGradient>
                  </defs>
                  <circle cx="24" cy="24" r="24" fill="url(#shopGrad)" />
                  <g transform="translate(12,12) scale(1)">
                    <path
                      d="M8.5 19a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm9 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm4.12-12.17A2 2 0 0020 6H6.58l-.41-1.52A2 2 0 004.23 3H3a1 1 0 000 2h1.23l2.83 10.48A2 2 0 009 17h8.67a2 2 0 001.89-1.37l2.34-7a2 2 0 00-.28-1.8z"
                      fill="#fff"
                    />
                  </g>
                </svg>
              </div>
            </div>
            <span className="jh-assistant-label">Shopping</span>
          </a>
        </div>

        {/* ── TOOLS ── */}
        <div className="jh-tools-section jh-anim-3">
          <div className="jh-section-title-row">
            <div className="jh-section-title">Tools</div>
            <span className="jh-tools-coming-soon">Coming soon</span>
          </div>
          <div className="jh-tools-row">
            <div className="jh-tool-chip">💬 Quick Translate</div>
            <div className="jh-tool-chip">🎨 Create image</div>
            <div className="jh-tool-chip">🛒 Grocery Assistant</div>
          </div>
          <div className="jh-tools-row">
            <div className="jh-tool-chip">🎬 Generate videos</div>
            <div className="jh-tool-chip">📑 Analyse docs</div>
            <div className="jh-tool-chip">🛍️ Smart Shopping</div>
          </div>
        </div>

        {/* ── UPDATES ── */}
        <div className="jh-section-title jh-anim-4" style={{ paddingTop: 20 }}>
          Updates
        </div>
        <div className="jh-updates-section jh-anim-4">
          {/* 1. JioMart Delivery */}
          <div className="jh-ucard">
            <div className="jh-ucard-title">JioMart</div>
            <div className="jh-ucard-row">
              <div className="jh-ucard-text">
                <span className="jh-main">Order arriving by 3PM today</span>
                <span className="jh-sub">Lakme foundation</span>
              </div>
              <div className="jh-ucard-img">
                <img
                  src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=108&h=108&fit=crop"
                  alt="Lakme"
                />
              </div>
            </div>
            <div className="jh-ucard-action">
              <span>Mahesh kumar is on the way</span>
              <button className="jh-ucard-action-btn" aria-label="Call">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M19.44 13c-.22 0-.45-.07-.67-.12a9.44 9.44 0 01-1.31-.39 2 2 0 00-2.48 1l-.22.45a12.18 12.18 0 01-2.66-2 12.18 12.18 0 01-2-2.66l.42-.28a2 2 0 001-2.48 10.33 10.33 0 01-.39-1.31c-.05-.22-.09-.45-.12-.68a3 3 0 00-3-2.49h-3a3 3 0 00-3 3.41 19 19 0 0016.52 16.46h.38a3 3 0 002-.76 3 3 0 001-2.25v-3a3 3 0 00-2.47-2.9z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* 2. Cricket Score — IND vs AUS */}
          <div className="jh-cricket">
            <div className="jh-cricket-scores">
              <div className="jh-cricket-team">
                <div className="jh-cricket-flag">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/en/thumb/4/41/Flag_of_India.svg/1200px-Flag_of_India.svg.png"
                    alt="IND"
                  />
                </div>
                <div className="jh-cricket-info">
                  <span className="jh-cricket-name">IND</span>
                  <span className="jh-cricket-score">227/4</span>
                  <span className="jh-cricket-overs">20.0</span>
                </div>
              </div>
              <div className="jh-cricket-vs">vs</div>
              <div className="jh-cricket-team jh-right">
                <div className="jh-cricket-info" style={{ alignItems: "flex-end" }}>
                  <span className="jh-cricket-name">AUS</span>
                  <span className="jh-cricket-score">157/1</span>
                  <span className="jh-cricket-overs">17.4</span>
                </div>
                <div className="jh-cricket-flag">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Flag_of_Australia_%28converted%29.svg/1200px-Flag_of_Australia_%28converted%29.svg.png"
                    alt="AUS"
                  />
                </div>
              </div>
            </div>
            <div className="jh-cricket-divider" />
            <div className="jh-cricket-bottom">
              <div className="jh-cricket-live">
                <div className="jh-cricket-live-dot" />
                <span>Live</span>
              </div>
              <span className="jh-cricket-status">AUS need more 70 runs to win</span>
            </div>
          </div>

          {/* 3. Breaking News */}
          <div className="jh-ucard" style={{ gap: 20 }}>
            <div className="jh-ucard-title">Breaking news</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="jh-news-item">
                <div className="jh-text-col">
                  <span className="jh-title">
                    Watch as Trump gives State of the Union speech 15 minutes ago
                  </span>
                  <span className="jh-source">BCC News</span>
                </div>
                <div className="jh-thumb">
                  <img
                    src="https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=104&h=104&fit=crop"
                    alt="News"
                  />
                </div>
              </div>
              <div className="jh-news-item">
                <div className="jh-text-col">
                  <span className="jh-title">
                    IDFC First Bank says returned Rs 583 crore to Haryana govt but len...
                  </span>
                  <span className="jh-source">Money Control</span>
                </div>
                <div className="jh-thumb">
                  <img
                    src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=104&h=104&fit=crop"
                    alt="Finance News"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 4. Trending Songs */}
          <div className="jh-ucard" style={{ gap: 20 }}>
            <div className="jh-ucard-title">Trending songs</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="jh-song-item">
                <div className="jh-art">
                  <img
                    src="https://sunit1986.github.io/design-prototypes/Assets/song-rockstar.png"
                    alt="Rockstar"
                  />
                </div>
                <div className="jh-meta">
                  <span className="jh-name">Phir Se Ud Chala</span>
                  <span className="jh-artist">Mohit Chauhan</span>
                </div>
                <svg className="jh-song-play" viewBox="0 0 24 24" fill="none">
                  <path d="M8 5.14v14l11-7-11-7z" fill="currentColor" opacity=".8" />
                </svg>
              </div>
              <div className="jh-song-item">
                <div className="jh-art">
                  <img
                    src="https://sunit1986.github.io/design-prototypes/Assets/song-andhadhun.png"
                    alt="Andhadhun"
                  />
                </div>
                <div className="jh-meta">
                  <span className="jh-name">Naina Da Kya Kasoor</span>
                  <span className="jh-artist">Amit Trivedi, Andhadhun</span>
                </div>
                <svg className="jh-song-play" viewBox="0 0 24 24" fill="none">
                  <path d="M8 5.14v14l11-7-11-7z" fill="currentColor" opacity=".8" />
                </svg>
              </div>
              <div className="jh-song-item">
                <div className="jh-art">
                  <img
                    src="https://sunit1986.github.io/design-prototypes/Assets/song-border2.png"
                    alt="Border 2"
                  />
                </div>
                <div className="jh-meta">
                  <span className="jh-name">Mohabbat Ho Gayi Hai</span>
                  <span className="jh-artist">Anu Malik</span>
                </div>
                <svg className="jh-song-play" viewBox="0 0 24 24" fill="none">
                  <path d="M8 5.14v14l11-7-11-7z" fill="currentColor" opacity=".8" />
                </svg>
              </div>
            </div>
          </div>

          {/* 5. Long Weekend Break */}
          <div className="jh-ucard" style={{ gap: 20, overflow: "hidden" }}>
            <div className="jh-ucard-title">Long weekend break</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="jh-day-pills">
                <div className="jh-day-pill jh-current">M</div>
                <div className="jh-day-pill jh-off">T</div>
                <div className="jh-day-pill jh-off">W</div>
                <div className="jh-day-pill jh-off">T</div>
                <div className="jh-day-pill jh-holiday">F</div>
                <div className="jh-day-pill jh-holiday">S</div>
                <div className="jh-day-pill jh-holiday">S</div>
                <div className="jh-day-pill jh-off">M</div>
              </div>
              <div className="jh-weekend-body">
                <div className="jh-weekend-img">
                  <img
                    src="https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=212&h=212&fit=crop"
                    alt="Beach"
                  />
                </div>
                <div className="jh-weekend-text">
                  <span className="jh-bold">3 days. One getaway.</span>
                  <span className="jh-desc">
                    Discover upcoming long weekends and smart getaway ideas tailored to your
                    location and budget.
                  </span>
                  <div className="jh-dest-chips">
                    <span className="jh-dest-chip">Alibaug</span>
                    <span className="jh-dest-chip">Lonavala</span>
                    <span className="jh-dest-chip">Matheran</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 6. Weather — Mumbai 34°C */}
          <div className="jh-ucard" style={{ gap: 10 }}>
            <div
              style={{ display: "flex", flexDirection: "column", gap: 12, position: "relative" }}
            >
              <div className="jh-weather-top">
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  <div className="jh-weather-city">
                    <span className="jh-weather-city-name">Mumbai</span>
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M7 10l5 5 5-5H7z" fill="currentColor" />
                    </svg>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 0, marginTop: 4 }}>
                    <div className="jh-weather-temp">
                      <span className="jh-weather-deg">34°</span>
                      <span className="jh-weather-c">C</span>
                    </div>
                    <span className="jh-weather-desc">Sunny day</span>
                  </div>
                </div>
                <div className="jh-weather-icon">
                  <img
                    src="https://sunit1986.github.io/design-prototypes/Assets/weather-sunny.png"
                    alt="Sunny"
                  />
                </div>
              </div>
              <div className="jh-weather-stats">
                <div className="jh-weather-stat">
                  <span className="jh-label">Wind</span>
                  <span className="jh-val">8 km/h</span>
                </div>
                <div className="jh-weather-stat">
                  <span className="jh-label">Humidity</span>
                  <span className="jh-val">23%</span>
                </div>
                <div className="jh-weather-stat">
                  <span className="jh-label">AQI</span>
                  <span className="jh-val">238</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ height: 32 }} />
      </div>
    </>
  );
}
