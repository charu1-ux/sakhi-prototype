/* ────────────────────────────────────────────
   AstroHome — Global CSS
   Extracted from astro-home.html <style> block
──────────────────────────────────────────── */

export const ASTRO_HOME_CSS = `
  @font-face { font-family: 'JioType'; font-weight: 400; src: url('https://raw.githubusercontent.com/sunit1986/JioBharatIQ_Server/main/assets/fonts/woff2/JioTypeVarW05-Regular.woff2') format('woff2'); }
  @font-face { font-family: 'JioType'; font-weight: 500; src: url('https://raw.githubusercontent.com/sunit1986/JioBharatIQ_Server/main/assets/fonts/woff2/JioTypeW05-Medium.woff2') format('woff2'); }
  @font-face { font-family: 'JioType'; font-weight: 700; src: url('https://raw.githubusercontent.com/sunit1986/JioBharatIQ_Server/main/assets/fonts/woff2/JioTypeW05-Bold.woff2') format('woff2'); }
  @font-face { font-family: 'JioType'; font-weight: 900; src: url('https://raw.githubusercontent.com/sunit1986/JioBharatIQ_Server/main/assets/fonts/woff2/JioTypeW05-Black.woff2') format('woff2'); }

  :root {
    --primary-20: #e8e8fc; --primary-30: #9999ff; --primary-40: #6464ff;
    --primary-50: #3535f3; --primary-60: #000093; --primary-70: #00004c; --primary-80: #010029;
    --secondary-20: #fef7e9; --secondary-30: #ffe3ae; --secondary-40: #ffd947;
    --secondary-50: #f7ab20; --secondary-60: #ac660c;
    --sparkle-20: #e8faf7; --sparkle-40: #7aebd9; --sparkle-50: #1eccb0; --sparkle-60: #1e7b74;
    --grey-100: #141414; --grey-80: rgba(0,0,0,0.66); --grey-60: #b5b5b5;
    --grey-40: #e0e0e0; --grey-20: #f5f5f5; --white: #ffffff;
    --surface-default: #ffffff; --surface-ghost: #eeeeef; --surface-ghost-icon: #e7e9ff;
    --surface-bold: #3900ad; --surface-minimal: #f5f5f5;
    --text-high: #141414; --text-low: rgba(25,27,30,0.65);
    --text-disabled: rgba(25,27,30,0.38); --text-on-bold: #ffffff;
    --stroke-subtle: rgba(36,38,43,0.12); --stroke-minimal: rgba(36,38,43,0.13);
    --planet-sun: #f7ab20; --planet-moon: #b5b5b5; --planet-mars: #ff6644;
    --planet-mercury: #1eccb0; --planet-jupiter: #3535f3; --planet-venus: #9999ff;
    --planet-saturn: #141414; --planet-rahu: #000093; --planet-ketu: #3800ac;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .ah-scroll-feed::-webkit-scrollbar { display: none; }
  .ah-scroll-feed { -ms-overflow-style: none; scrollbar-width: none; }
  .ah-horiz-scroll::-webkit-scrollbar { display: none; }
  .ah-horiz-scroll { -ms-overflow-style: none; scrollbar-width: none; }

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeInScale { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
  @keyframes breathe { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
  @keyframes orbitSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes orbitReverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
  @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  @keyframes pulseRing { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(1.8); opacity: 0; } }
  @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
  @keyframes slideDown { from { transform: translateY(0); } to { transform: translateY(100%); } }
  @keyframes slideInRight { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes slideInLeft { from { opacity: 0; transform: translateX(-40px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes coronaPulse { 0%, 100% { box-shadow: 0 0 30px 10px rgba(247,171,32,0.3), 0 0 60px 20px rgba(247,171,32,0.15); } 50% { box-shadow: 0 0 40px 15px rgba(247,171,32,0.4), 0 0 80px 30px rgba(247,171,32,0.2); } }
  @keyframes marsPulse { 0%, 100% { box-shadow: 0 0 20px 6px rgba(255,102,68,0.3); } 50% { box-shadow: 0 0 35px 12px rgba(255,102,68,0.5); } }
  @keyframes saturnFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
  @keyframes fillBar { from { width: 0; } to { width: var(--fill); } }
  @keyframes countUp { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
  @keyframes staggerIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes borderGlow { 0%, 100% { border-color: var(--primary-30); } 50% { border-color: var(--sparkle-40); } }
  @keyframes soundWave { 0% { height: 4px; } 100% { height: 16px; } }
  @keyframes flameSpark { 0% { opacity: 0.8; transform: scale(1) translateY(0); } 100% { opacity: 0; transform: scale(0.3) translateY(-20px); } }
  @keyframes ringWave { 0% { transform: translate(-50%,-50%) rotateX(75deg) scale(1); opacity: 0.15; } 100% { transform: translate(-50%,-50%) rotateX(75deg) scale(1.1); opacity: 0.05; } }
  @keyframes jupiterAura { 0% { opacity: 0.4; transform: scale(1); } 100% { opacity: 0.7; transform: scale(1.15); } }
  @keyframes moonTide { 0% { opacity: 0.3; transform: scale(0.95); } 100% { opacity: 0.6; transform: scale(1.1); } }
  @keyframes venusShimmer { 0% { opacity: 0.2; transform: scale(0.8); } 100% { opacity: 0.8; transform: scale(1.2); } }
  @keyframes glowPulse { 0%, 100% { box-shadow: 0 0 4px 2px rgba(255,255,255,0.3); } 50% { box-shadow: 0 0 10px 4px rgba(255,255,255,0.6); } }
  @keyframes walkBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
  @keyframes portalGlow { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
  @keyframes twinkle { 0%, 100% { opacity: 0.2; } 50% { opacity: 0.8; } }
  @keyframes focusWordIn { 0% { opacity:0; transform:scale(0.6) translateY(30px); filter:blur(10px); } 30% { opacity:1; transform:scale(1.12) translateY(-6px); filter:blur(0); } 70% { opacity:1; transform:scale(1) translateY(-2px); } 100% { opacity:0; transform:scale(0.95) translateY(-30px); filter:blur(4px); } }
  @keyframes focusTextIn { 0% { opacity:0; transform:scale(0.7) translateY(24px); filter:blur(8px); } 100% { opacity:1; transform:scale(1) translateY(0); filter:blur(0); } }
  @keyframes focusLineIn { 0% { opacity:0; width:0; } 100% { opacity:1; width:60px; } }
`;
