# Repo Split Plan — HTML Prototypes → intelligence-prototype-leads

**Date:** 2026-06-02  
**Status:** Ready to execute

---

## Background

The monorepo currently contains two very different types of artefacts:

| Type                            | Where                                                                                               | Stack                                    |
| ------------------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| React/Next.js design prototypes | `apps/jobs/src/app/design-prototype/`                                                               | Next.js 16 · Tailwind v4 · HeroUI · GSAP |
| Raw HTML prototypes             | `apps/astro/public/*.html`, `apps/jobs/public/*.html`, `apps/health/public/sehat-saathi-runtime.js` | Single-file HTML/CSS/JS                  |

Mixing them causes: build bloat, Vercel routing confusion, middleware hacks to localhost, and unclear ownership. The decision is to **move all HTML prototypes to a separate flat repo** and keep this repo purely React/Next.js.

---

## Repos After Split

| Repo                           | Purpose                                                  | Build                        |
| ------------------------------ | -------------------------------------------------------- | ---------------------------- |
| `intelligence-prototype`       | React/Next.js design system + vertical prototypes        | `npm run dev`, Vercel deploy |
| `intelligence-prototype-leads` | Archive of raw HTML prototypes, open in browser directly | None — flat files only       |

---

## Task 1 — Populate `intelligence-prototype-leads`

Create the following structure (no `package.json`, no build tooling):

```
intelligence-prototype-leads/
  jobs/
    old-user/
      index.html                  ← from apps/jobs/public/index.html
      microlearning.html
      interview-prep.html
      english.html
      govt-exam.html
      design-prototype.html
    new-user/
      index.html                  ← from apps/jobs/public/zero/index.html
      microlearning.html
      interview-prep.html
      english.html
      govt-exam.html
  astro/
    jbiq-homepage/
      jbiq-homepage.html          ← from apps/astro/public/jbiq-homepage.html
    home-v1/
      astro-home.html
    home-v2/
      astro-home-daily-v2.html
    live-darshan/
      live-darshan.html
    phase0/
      astro-phase0.html
    phase1/
      astro-phase1.html
    unified/
      astro-unified.html
  health/
    sehat-saathi/
      sehat-saathi-runtime.js     ← from apps/health/public/sehat-saathi-runtime.js
      sehat-saathi.tsx            ← from apps/health/src/app/page.tsx (renamed)
  README.md
```

### README.md content

```md
# Intelligence Prototype Leads — HTML Prototypes

Archive of raw HTML/CSS/JS prototypes. Open any file directly in a browser — no build step needed.

| Vertical        | Folder               | What it is                                        |
| --------------- | -------------------- | ------------------------------------------------- |
| Jobs — Old user | jobs/old-user/       | Existing user flow (index → microlearning → prep) |
| Jobs — New user | jobs/new-user/       | Zero-state onboarding flow                        |
| Astrology       | astro/jbiq-homepage/ | JbiqHome landing screen                           |
| Astrology       | astro/home-v1/       | Astro home with solar system                      |
| Astrology       | astro/home-v2/       | Daily horoscope v2                                |
| Astrology       | astro/live-darshan/  | Live darshan screen                               |
| Astrology       | astro/phase0/        | Phase 0 prototype                                 |
| Astrology       | astro/phase1/        | Phase 1 prototype                                 |
| Astrology       | astro/unified/       | Unified single-page prototype                     |
| Health          | health/sehat-saathi/ | All 15 Sehat Saathi screens + runtime JS          |
```

---

## Task 2 — Delete from `intelligence-prototype`

### Files / folders to delete

```
apps/jobs/public/index.html
apps/jobs/public/microlearning.html
apps/jobs/public/interview-prep.html
apps/jobs/public/english.html
apps/jobs/public/govt-exam.html
apps/jobs/public/design-prototype.html
apps/jobs/public/zero/                   ← entire folder

apps/astro/public/astro-home.html
apps/astro/public/astro-home-daily-v2.html
apps/astro/public/astro-phase0.html
apps/astro/public/astro-phase1.html
apps/astro/public/astro-unified.html
apps/astro/public/live-darshan.html
apps/astro/public/jbiq-homepage.html
apps/astro/public/kirana-list.png
apps/astro/public/zepto-cart.png
apps/astro/public/astrologer.png
apps/astro/public/cosmic_bg.wav
apps/astro/public/narration.wav

apps/health/public/sehat-saathi-runtime.js

apps/astro/src/middleware.ts             ← rewrites to localhost, wrong for static export
apps/shell/src/middleware.ts             ← same issue, causes Vercel 404
```

---

## Task 3 — File replacements in `intelligence-prototype`

### `apps/astro/src/app/page.tsx`

Replace the `window.location.replace("/astro/jbiq-homepage.html")` redirect with a placeholder:

```tsx
export default function AstroPage() {
  return (
    <main className="bg-bg text-fg flex min-h-dvh flex-col items-center justify-center gap-3">
      <span className="text-4xl">♏</span>
      <p className="text-fg-muted text-sm">Astrology — design prototype coming soon</p>
    </main>
  );
}
```

### `apps/health/src/app/page.tsx`

Replace the 1928-line monolith with a placeholder (keep layout.tsx untouched):

```tsx
export default function HealthPage() {
  return (
    <main className="bg-bg text-fg flex min-h-dvh flex-col items-center justify-center gap-3">
      <span className="text-4xl">🩺</span>
      <p className="text-fg-muted text-sm">Sehat Saathi — design prototype coming soon</p>
    </main>
  );
}
```

### `apps/shell/src/app/astro/page.tsx`

Remove the iframe that loaded `jbiq-homepage.html`:

```tsx
"use client";
export default function AstroDevFrame() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3">
      <span className="text-4xl">♏</span>
      <p className="text-sm opacity-50">Astrology — coming soon</p>
    </div>
  );
}
```

### `apps/shell/src/app/jobs/page.tsx`

Change iframe `src` from hardcoded `http://localhost:3003/jobs/design-prototype/` to relative `/jobs/design-prototype/`.

### `apps/shell/src/app/jobs/old/page.tsx`

Replace iframe (loaded `/jobs/index.html` which is being deleted) with redirect:

```tsx
import { redirect } from "next/navigation";
export default function JobsOldUserFrame() {
  redirect("/jobs/");
}
```

### `apps/shell/src/app/jobs/new/page.tsx`

Replace iframe (loaded `/jobs/zero/index.html` which is being deleted) with redirect:

```tsx
import { redirect } from "next/navigation";
export default function JobsNewUserFrame() {
  redirect("/jobs/");
}
```

### `apps/shell/src/components/molecules/VerticalList.tsx`

Remove "Old user" and "New user" dropdown items from `verticalJobs` — both point to deleted HTML files. Keep only "Design Prototype":

```ts
dropdownItems: [
  { label: "Design Prototype", url: "/jobs/", capacitorUrl: "/jobs/design-prototype/index.html" },
],
```

### `vercel.json`

Add trailing slash and clean URLs config to fix Vercel 404 routing:

```json
{
  "buildCommand": "turbo run build",
  "outputDirectory": "apps/shell/out",
  "installCommand": "npm install",
  "framework": null,
  "trailingSlash": true,
  "cleanUrls": true
}
```

---

## Task 4 — Verify

```bash
# From intelligence-prototype root
npm run typecheck --workspace=@intelligence/shell --workspace=@intelligence/jobs

# Optional: full build
cd apps/shell && npm run build
```

Fix any TypeScript errors before committing.

---

## Task 5 — Commit

```bash
# intelligence-prototype
cd /Users/akshay1.borhade/Documents/Github/Native/intelligence-prototype
git add -A
git commit -m "chore: remove html prototypes, clean middleware, fix vercel routing"

# intelligence-prototype-leads
cd /Users/akshay1.borhade/Documents/Github/Native/intelligence-prototype-leads
git init   # if not already a git repo
git add -A
git commit -m "chore: initial html prototype archive from intelligence-prototype"
```

> Do NOT push until manually verified in browser.

---

## Why the middlewares were removed

Both `apps/shell/src/middleware.ts` and `apps/astro/src/middleware.ts` rewrite requests to `http://localhost:3003` / `http://localhost:3002`. These only work in local dev. On Vercel's Edge Network, the middleware is deployed as an Edge Function — the localhost rewrite fails for every matching request, returning 404. Static exports (`output: "export"`) do not need middleware; the `rewrites()` in `next.config.ts` already handle dev proxying.

---

## Post-split state

```
intelligence-prototype/        ← this repo
  Vercel URL: https://[project].vercel.app
  Shell home → Jobs (design-prototype) ✓
  Shell home → Health (placeholder)   ✓
  Shell home → Astro  (placeholder)   ✓
  No HTML files, no runtime.js, no middleware

intelligence-prototype-leads/  ← new flat repo
  Open index.html directly in browser
  No build, no CI, no Vercel
  Pure archive / reference for leads team
```
