// Daily Saathi — V1 static data + routing.
// Per PRD §6, all content is hardcoded for V1 (no API). The destination
// routes all live inside the personal-companion tree (the PM Design flow).

// User identity — language-independent (from session in production; static for V1).
// All display copy now lives in saathi-i18n.ts (STRINGS), keyed by language.
export const SAATHI = {
  firstName: "Priyam",
} as const;

// Avatar / icon image assets. Drop the PNGs into
// apps/shell/public/assets/shell/daily-saathi/ with these exact names.
// If a file is missing, the UI falls back to a JDS SVG icon automatically.
export const ASSETS = {
  dailySaathi: "/assets/shell/daily-saathi/daily-saathi.png",
  dilKiBaat: "/assets/shell/daily-saathi/dil-ki-baat.png",
  kaamKiBaat: "/assets/shell/daily-saathi/kaam-ki-baat.png",
  namaste: "/assets/shell/daily-saathi/namaste.png",
} as const;

// All routes are shell paths with a trailing slash (static-export friendly).
export const ROUTES = {
  home: "/personal-companion/daily-saathi/",
  companion: "/personal-companion/chat/",
  kaam: "/personal-companion/daily-saathi/kaam-ki-baat/",
  // Reminders are created inline inside the Kaam Ki Baat chat; external entry
  // (home widget "+ Add") deep-links in with the reminder intent.
  reminders: "/personal-companion/daily-saathi/kaam-ki-baat/?intent=reminder",
  createImage: "/personal-companion/daily-saathi/kaam-ki-baat/create-image/",
  explainDoc: "/personal-companion/daily-saathi/kaam-ki-baat/explain-doc/",
  briefing: "/personal-companion/daily-saathi/briefing/",
  diary: "/personal-companion/daily-saathi/diary/",
} as const;

// Navigation lives in use-nav.ts (useNav hook) — it uses Next's client router
// so handlers stay bound across back/forward navigation.
