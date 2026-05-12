# Sehat Saathi — Health Vertical

**Lead:** Nawaneet Kumar (Nawaneet.Kumar@ril.com)
**Branch:** `vertical/health`
**Dev server:** `npm run dev` → http://localhost:3004

---

## What this app is

Sehat Saathi is a Hindi-language AI health companion for JioBharatIQ. It has 15 screens, voice input, AI chat (OpenAI/Groq), STT/TTS (Sarvam), and PDF lab report interpretation.

---

## Key files — only edit these

| File                             | What it is                                                                 |
| -------------------------------- | -------------------------------------------------------------------------- |
| `src/app/page.tsx`               | All 15 screens as React JSX. This is your main file.                       |
| `src/app/globals.css`            | All CSS. Sehat Saathi styles start after the `/* Sehat Saathi */` comment. |
| `public/sehat-saathi-runtime.js` | All app logic: navigation, AI calls, voice, state.                         |
| `.env.local`                     | API keys (never commit this file).                                         |

---

## Do NOT touch

- `src/app/layout.tsx` — shell layout, leave as-is
- `src/components/` — shared components, leave as-is
- Anything outside `apps/health/` — other verticals and shell are out of scope

---

## Architecture

- **Navigation:** CSS transform-based. `goTo('s-screenid')` and `goBack()` are in the runtime JS. All 15 screens are always in the DOM; CSS `.screen.active` makes one visible.
- **State:** `ST` object in runtime JS (not React state). Non-render state lives in JS, render-triggering actions call DOM functions.
- **AI:** OpenAI (`gpt-4o-mini`) and Groq (`llama-3.3-70b-versatile`) — Groq is preferred (faster, free).
- **Voice:** Sarvam AI for Hindi STT + TTS. Falls back gracefully if key is missing.
- **API keys:** Injected via `window.__SS_CONFIG__` from `NEXT_PUBLIC_*` env vars.

---

## The 15 screens

| Screen ID      | What it is                                           |
| -------------- | ---------------------------------------------------- |
| `s-home`       | Landing — 5 persona assistants + quick actions       |
| `s-hub`        | Sehat Saathi hub — score, stories, triage            |
| `s-chat`       | AI chat (Nushke / Symptoms / Wellness / Community)   |
| `s-onboard`    | 3-step profile setup (name, age, BMI)                |
| `s-community`  | Peer community chat                                  |
| `s-lab`        | Lab report interpreter (PDF upload → AI explanation) |
| `s-medicine`   | Medicine reminder setup                              |
| `s-meal`       | Meal plan generator                                  |
| `s-family`     | Family member profiles                               |
| `s-breathwork` | Guided breathing exercise                            |
| `s-rx`         | Prescription / dawai parchi scanner                  |
| `s-order`      | Medicine order tracking                              |
| `s-track`      | Order tracking detail                                |
| `s-bazaar`     | Ayurvedic products bazaar                            |
| `s-focus-qa`   | Symptom focus flow Q&A                               |

---

## Adding a new screen

1. In `page.tsx`, add after the last `</div>` screen:

```jsx
{
  /* ══ YOUR SCREEN NAME ══ */
}
<div className="screen" id="s-yourscreen">
  <div className="hdr">
    <button className="hdr-btn" onClick={goBack}>
      ← back
    </button>
    <div className="hdr-center">
      <h2>Screen Title</h2>
    </div>
  </div>
  <div className="body">{/* your content */}</div>
</div>;
```

2. To navigate to it from another screen:

```jsx
onClick={() => goTo('s-yourscreen')}
```

3. Add any new CSS at the bottom of `globals.css`.

---

## Git workflow

```bash
# After making changes
git add apps/health/
git commit -m "feat(health): describe what you added"
git push origin vertical/health
```

**You can only push to `vertical/health`.** When a feature is ready for the main app, tell Akshay and he'll merge it.

---

## Running the full app

From the repo root:

```bash
npm run dev
```

- Shell (home screen): http://localhost:3000
- Health (your app): http://localhost:3004

Tap "Health" on the shell home to navigate into Sehat Saathi.

---

## Language

All user-facing content is in Hindi (Devanagari or Hinglish). Keep it that way. Do not translate to English.
