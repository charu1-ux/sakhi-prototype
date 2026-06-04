# JBIQ Design System

## 1. Visual Theme & Atmosphere

JBIQ is a voice-first AI assistant for the Indian market, built on Jio's services infrastructure. The visual language is calm, intelligent, and approachable — a white-dominant surface palette keeps chrome invisible while a brand-defined primary colour anchors action and intent. The app feels spacious and considered rather than dense, with generous vertical rhythm in the chat surface and clear surface layering for complex feature hubs.

Colour is used intentionally but not prescribed at the system level. Action, value, and AI contexts each carry a distinct colour role — hues are chosen per vertical and applied using Tailwind primitives directly. When a primitive is repeated, it is promoted to a semantic token.

Typography is set in **JioType**, a variable font (100–900). Black weight (900) for display and headlines gives the type a compressed, confident quality. Medium weight (500) for body keeps readability high at small sizes in varied lighting conditions. All headline sizes carry -3% letter-spacing.

Geometry is rounded and approachable. Pill shapes (`rounded-full`) dominate interactive elements — buttons, chips, the chat input. Cards use `rounded-xl`.

**Key Characteristics:**

- White-dominant surface palette; primary colour is defined per vertical — not prescribed at system level
- JioType variable font — Black for headlines, Medium for body
- Pill (`rounded-full`) and soft-round (`rounded-xl`) geometry; no sharp corners on interactive elements
- Colour applied via Tailwind primitives; repeated values are promoted to semantic tokens
- JDS SVG icons exclusively — 1,281+ icons, never emoji or third-party libraries
- Skeleton shimmer for all loading states — never spinners
- Light mode default; no gradients on any UI surface

---

## 2. Color Palette & Roles

Colours are applied as Tailwind primitives directly in components. Only structural tokens — surfaces, strokes, and text — are defined in `@theme {}` because they are shared across every screen and need to flip consistently in dark mode.

There are no primary, secondary, or sparkle token scales. When a Tailwind primitive colour is used more than once for the same role, Claude and Cursor will prompt to promote it to a semantic token (see Section 9).

### `@theme {}` — Structural Token Definitions

```css
@theme {
  /* ─── Surface (light mode) ────────────────────────────────────────────────
     Two base surfaces. Cards always alternate: card on S1 uses S2 bg,
     card on S2 uses S1 bg. Natural depth without elevation.                */
  --color-surface-1: var(--color-white); /* white — primary screen bg */
  --color-surface-2: var(--color-neutral-100); /* neutral-100 — secondary / section bg */
  --color-surface-card-on-1: var(--color-neutral-100); /* card on surface-1 */
  --color-surface-card-on-2: var(--color-white); /* card on surface-2 */

  /* ─── Stroke ───────────────────────────────────────────────────────────────
     One Tailwind step above the element's background.
     Do not add by default — only when explicitly asked.                    */
  --color-stroke-on-surface-1: var(--color-neutral-100); /* white bg  → neutral-100 */
  --color-stroke-on-surface-2: var(--color-neutral-200); /* neutral-100 bg → neutral-200 */
  --color-stroke-on-card-on-1: var(--color-neutral-200); /* card on s1 → neutral-200 */
  --color-stroke-on-card-on-2: var(--color-neutral-100); /* card on s2 → neutral-100 */

  /* ─── Text ─────────────────────────────────────────────────────────────── */
  --color-text-high: var(--color-zinc-950);
  --color-text-low: color-mix(in srgb, var(--color-zinc-950) 65%, transparent);
  --color-text-disabled: color-mix(in srgb, var(--color-zinc-950) 40%, transparent);

  /* ─── Semantic status ──────────────────────────────────────────────────── */
  --color-error: var(--color-red-500);
  --color-warning: var(--color-orange-500);
  --color-success: var(--color-green-500);

  /* ─── Dark mode ────────────────────────────────────────────────────────────
     Mirrors light in reverse. surface-1 → black, rest follow neutral inward. */
  .dark {
    --color-surface-1: var(--color-black); /* black */
    --color-surface-2: var(--color-neutral-900);
    --color-surface-card-on-1: var(--color-neutral-900);
    --color-surface-card-on-2: var(--color-neutral-800);

    --color-stroke-on-surface-1: var(--color-neutral-900);
    --color-stroke-on-surface-2: var(--color-neutral-800);
    --color-stroke-on-card-on-1: var(--color-neutral-800);
    --color-stroke-on-card-on-2: var(--color-neutral-700);

    --color-text-high: var(--color-zinc-50);
    --color-text-low: color-mix(in srgb, var(--color-zinc-50) 65%, transparent);
    --color-text-disabled: color-mix(in srgb, var(--color-zinc-50) 40%, transparent);
  }
}
```

### How to apply colour in components

Use Tailwind primitives directly for action, brand, and icon colours. Use token classes for surfaces, strokes, and text.

```tsx
// ✅ Surface and text — always use tokens
<div className="bg-surface-1 text-text-high" />

// ✅ Action / brand colour — use Tailwind primitive directly
<Button className="bg-violet-700 text-white" />

// ✅ Icon colour — use Tailwind primitive directly
<Icon className="text-violet-700" />

// ⚠️ Repeat alert — if bg-violet-700 appears in 2+ places for the same role,
//    Claude / Cursor will prompt to create a semantic token for it
```

### Colour roles quick reference

| Token class                   | Role                                                                      |
| ----------------------------- | ------------------------------------------------------------------------- |
| `bg-surface-1`                | Primary screen background — `white` light / `black` dark                  |
| `bg-surface-2`                | Secondary / section background — `neutral-100` light / `neutral-900` dark |
| `bg-surface-card-on-1`        | Card on Surface 1 — `neutral-100` light / `neutral-900` dark              |
| `bg-surface-card-on-2`        | Card on Surface 2 — `white` light / `neutral-800` dark                    |
| `text-text-high`              | Primary body text                                                         |
| `text-text-low`               | Secondary / supporting text                                               |
| `text-text-disabled`          | Placeholder, inactive labels                                              |
| `border-stroke-on-surface-1`  | Border on white surface                                                   |
| `border-stroke-on-surface-2`  | Border on grey surface                                                    |
| `border-stroke-on-card-on-1`  | Border on card (on surface 1)                                             |
| `border-stroke-on-card-on-2`  | Border on card (on surface 2)                                             |
| `bg-error` / `text-error`     | Error state                                                               |
| `bg-warning` / `text-warning` | Warning state                                                             |
| `bg-success` / `text-success` | Success state                                                             |

### Surface & card pairing rule

Two base surfaces drive all screens. Cards always invert relative to the surface they sit on — this creates natural depth without any shadow or elevation.

| Surface                            | Light         | Dark          |
| ---------------------------------- | ------------- | ------------- |
| Surface 1 — primary screen bg      | `white`       | `black`       |
| Surface 2 — section / secondary bg | `neutral-100` | `neutral-900` |
| Card on Surface 1                  | `neutral-100` | `neutral-900` |
| Card on Surface 2                  | `white`       | `neutral-800` |

### Stroke / border rule

**Do not add a stroke by default.** Only apply a border when explicitly asked.

When needed, use the token that is one Tailwind neutral step above the element's background:

| Element bg                | Token                        | Resolves to   |
| ------------------------- | ---------------------------- | ------------- |
| Surface 1 (`white`)       | `border-stroke-on-surface-1` | `neutral-100` |
| Surface 2 (`neutral-100`) | `border-stroke-on-surface-2` | `neutral-200` |
| Card on Surface 1         | `border-stroke-on-card-on-1` | `neutral-200` |
| Card on Surface 2         | `border-stroke-on-card-on-2` | `neutral-100` |

### Safe Area

Top and bottom safe area bars adopt the background colour of the screen they sit on — no fixed colour. Use `bg-inherit` or match the active screen surface class. Apply padding with `pt-safe` / `pb-safe` (via `env(safe-area-inset-*)` in CSS or a Tailwind plugin).

---

## 3. Typography

### Font Family

Define in `@theme {}` and load via `@font-face`:

```css
@font-face {
  font-family: "JioType";
  src: url("https://raw.githubusercontent.com/sunit1986/JioBharatIQ_Server/main/assets/fonts/woff2/JioTypeVarW05-Regular.woff2")
    format("woff2");
  font-weight: 100 900;
}

@theme {
  --font-sans: "JioType", sans-serif;
  --font-mono: "JetBrains Mono", monospace;
}
```

Use `font-sans` for all UI text. Use `font-mono text-[13px]` for code.

Never use: Inter, Arial, Helvetica, Roboto, or `font-system`.

### Type Scale

Define custom text sizes in `@theme {}`:

```css
@theme {
  --text-display-l: 52px;
  --text-display-m: 44px;
  --text-display-s: 36px;
  --text-headline-l: 32px;
  --text-headline-m: 28px;
  --text-headline-s: 24px;
  --text-headline-xs: 22px;
  --text-headline-2xs: 20px;
  --text-headline-3xs: 18px;
  --text-title-l: 20px;
  --text-title-m: 18px;
  --text-title-s: 16px;
  --text-title-2xs: 14px;
  --text-body-2xl: 20px;
  --text-body-l: 16px;
  --text-body-m: 15px;
  --text-body-s: 14px;
  --text-body-xs: 13px;
  --text-body-2xs: 12px;
  --text-label-l: 14px;
  --text-label-s: 12px;
  --text-button: 14px;
  --text-overline: 10px;
}
```

Tracking and line-height use Tailwind's named t-shirt scale. Semantic aliases will be added later.

**Tailwind tracking scale reference**
| Class | Value |
|---|---|
| `tracking-tighter` | -0.05em |
| `tracking-tight` | -0.025em |
| `tracking-normal` | 0em |
| `tracking-wide` | 0.025em |
| `tracking-wider` | 0.05em |
| `tracking-widest` | 0.1em |

**Tailwind leading scale reference**
| Class | Value |
|---|---|
| `leading-none` | 1 |
| `leading-tight` | 1.25 |
| `leading-snug` | 1.375 |
| `leading-normal` | 1.5 |
| `leading-relaxed` | 1.625 |
| `leading-loose` | 2 |

| Token          | Tailwind Class                                            | Weight | Line Height      | Letter Spacing    |
| -------------- | --------------------------------------------------------- | ------ | ---------------- | ----------------- |
| `display-l`    | `text-display-l font-black`                               | 900    | —                | `tracking-tight`  |
| `display-m`    | `text-display-m font-black`                               | 900    | —                | `tracking-tight`  |
| `display-s`    | `text-display-s font-black`                               | 900    | —                | `tracking-tight`  |
| `headline-l`   | `text-headline-l font-black`                              | 900    | —                | `tracking-tight`  |
| `headline-m`   | `text-headline-m font-black`                              | 900    | —                | `tracking-tight`  |
| `headline-s`   | `text-headline-s font-black`                              | 900    | —                | `tracking-tight`  |
| `headline-xs`  | `text-headline-xs font-black`                             | 900    | —                | `tracking-normal` |
| `headline-2xs` | `text-headline-2xs font-black`                            | 900    | —                | `tracking-normal` |
| `headline-3xs` | `text-headline-3xs font-black`                            | 900    | —                | `tracking-normal` |
| `title-l`      | `text-title-l font-bold`                                  | 700    | —                | `tracking-normal` |
| `title-m`      | `text-title-m font-bold`                                  | 700    | —                | `tracking-normal` |
| `title-s`      | `text-title-s font-bold`                                  | 700    | —                | `tracking-normal` |
| `title-2xs`    | `text-title-2xs font-bold`                                | 700    | —                | `tracking-normal` |
| `body-2xl`     | `text-body-2xl font-medium leading-normal tracking-tight` | 500    | `leading-normal` | `tracking-tight`  |
| `body-l`       | `text-body-l font-medium leading-normal tracking-tight`   | 500    | `leading-normal` | `tracking-tight`  |
| `body-m`       | `text-body-m font-medium leading-normal`                  | 500    | `leading-normal` | —                 |
| `body-s`       | `text-body-s font-medium leading-normal`                  | 500    | `leading-normal` | —                 |
| `body-xs`      | `text-body-xs font-medium leading-snug`                   | 500    | `leading-snug`   | —                 |
| `body-2xs`     | `text-body-2xs font-medium tracking-wide`                 | 500    | —                | `tracking-wide`   |
| `label-l`      | `text-label-l font-bold`                                  | 700    | —                | `tracking-normal` |
| `label-s`      | `text-label-s font-bold`                                  | 700    | —                | `tracking-normal` |
| `button`       | `text-button font-bold`                                   | 700    | —                | `tracking-normal` |
| `overline`     | `text-overline font-bold uppercase tracking-wide`         | 700    | —                | `tracking-wide`   |

### Principles

- `font-black` for all `display-*` and `headline-*`
- `font-medium` as the body base
- `tracking-tight` on display/headline; `tracking-normal` or neutral on body; `tracking-wide` on micro labels only
- Semantic tracking/leading aliases will be defined later — use the t-shirt classes above until then

---

## 4. Components

### Buttons — HeroUI `<Button>`

All buttons use HeroUI's `<Button>` component. Styling is applied via `className` using Tailwind classes.

Action colour is a Tailwind primitive — use whichever stop fits the vertical. Examples below use `violet-700` as a placeholder; replace with the vertical's confirmed primitive.

**Primary Pill**

```tsx
// Replace violet-700 with the vertical's action primitive
<Button
  radius="full"
  className="bg-violet-700 text-white text-button font-bold px-6 py-3 disabled:opacity-40"
/>
```

**Secondary Pill**

```tsx
<Button
  radius="full"
  className="bg-surface-card-on-1 text-text-high text-button font-bold px-6 py-3"
/>
```

**Ghost Pill**

```tsx
// Replace violet-700 with the vertical's action primitive
<Button
  radius="full"
  variant="bordered"
  className="border border-stroke-on-surface-1 text-violet-700 text-button font-bold bg-transparent px-6 py-3"
/>
```

**Icon Button (Circle)**

```tsx
// Default — on Surface 1 (white)
// Replace zinc-700 with the vertical's icon primitive
<Button
  isIconOnly
  radius="full"
  className="bg-surface-card-on-1 text-zinc-700 w-10 h-10 min-w-10"
/>

// On primary-tinted surface — use a lighter stop of the same scale
<Button
  isIconOnly
  radius="full"
  className="bg-violet-100 text-violet-700 w-10 h-10 min-w-10 active:text-violet-900"
/>
```

---

### Chips — HeroUI `<Chip>`

**Default**

```tsx
<Chip
  radius="full"
  className="bg-surface-card-on-1 text-text-high text-label-l font-bold px-4 py-2"
/>
```

**Active**

```tsx
// Replace violet-700 with the vertical's action primitive
<Chip radius="full" className="bg-violet-700 text-white text-label-l font-bold px-4 py-2" />
```

Icon inside chip: use the vertical's icon primitive directly (e.g. `text-zinc-700` default, `text-white` active).

---

### Cards — HeroUI `<Card>`

Use HeroUI's `<Card>` component. All visual customisation via `className` with Tailwind classes.

Cards invert the surface they sit on. Use `bg-surface-card-on-1` when the parent screen is Surface 1, and `bg-surface-card-on-2` when the parent is Surface 2. Do not add a border unless explicitly asked — if one is needed, use the matching stroke token.

**Card on Surface 1 (white screen)**

```tsx
<Card className="bg-surface-card-on-1 rounded-xl shadow-none p-4">
  <CardBody>{/* content */}</CardBody>
</Card>
```

**Card on Surface 2 (grey screen)**

```tsx
<Card className="bg-surface-card-on-2 rounded-xl shadow-none p-4">
  <CardBody>{/* content */}</CardBody>
</Card>
```

**With border (only when asked)**

```tsx
<Card className="bg-surface-card-on-1 rounded-xl shadow-none border border-stroke-on-card-on-1 p-4">
```

**Compact / Image Card**

```tsx
<Card className="bg-surface-card-on-1 rounded-lg shadow-none overflow-hidden p-0">
  <CardBody className="p-0">{/* content */}</CardBody>
</Card>
```

Loading state: skeleton shimmer only — never spinners.

```tsx
<Card className="bg-surface-card-on-1 rounded-xl shadow-none animate-pulse h-32 w-full" />
```

---

### Chat Input

Already implemented. Apply Tailwind classes to match the design:

- Container: `bg-surface-card-on-1 rounded-[23px] flex items-center gap-2 px-3 py-2`
- Focused ring: `ring-2 ring-violet-700` ← replace with vertical's action primitive
- Placeholder text: `placeholder:text-text-disabled text-body-m font-medium`
- Attach button (`+`): icon button circle, `bg-surface-card-on-1 text-zinc-700`
- Mic button: `text-zinc-700`, active state one step darker (e.g. `text-zinc-900`)
- Send button (typing state): vertical's action primitive, springs in via Framer Motion

---

### Voice Orb

Deferred — do not implement with CSS or Tailwind. Will be specified separately.

---

## 5. Animation — Framer Motion

Use `@intelligence/motion` (which re-exports `framer-motion@12`) for all animated transitions.

**General principles**

- Entrance: `initial={{ opacity: 0, y: 8 }}` → `animate={{ opacity: 1, y: 0 }}`
- Exit: `exit={{ opacity: 0, y: 4 }}`
- Default duration: `0.2s` ease-out for UI transitions; `0.35s` for page transitions
- Spring for interactive elements (buttons, send icon): `type: "spring", stiffness: 400, damping: 28`
- Never animate layout shifts — use `layout` prop on stable containers only

**Send button spring-in (chat input)**

```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.8 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.8 }}
  transition={{ type: "spring", stiffness: 400, damping: 28 }}
/>
```

---

## 6. Layout Principles

### Spacing Scale — Tailwind

| Design Token | Value | Tailwind Class                               |
| ------------ | ----- | -------------------------------------------- |
| `4xs`        | 2px   | `gap-0.5` / `p-0.5`                          |
| `3xs`        | 4px   | `gap-1` / `p-1`                              |
| `2xs`        | 6px   | `gap-1.5` / `p-1.5`                          |
| `xs`         | 8px   | `gap-2` / `p-2`                              |
| `s`          | 12px  | `gap-3` / `p-3`                              |
| `base`       | 14px  | `gap-3.5` / `p-3.5`                          |
| `m`          | 16px  | `gap-4` / `px-4` ← screen horizontal margins |
| `l`          | 20px  | `gap-5` / `p-5`                              |
| `xl`         | 24px  | `gap-6` / `p-6`                              |
| `2xl`        | 32px  | `gap-8` / `p-8`                              |
| `3xl`        | 40px  | `gap-10` / `p-10`                            |
| `4xl`        | 48px  | `gap-12` / `p-12`                            |
| `huge`       | 64px  | `gap-16` / `p-16`                            |
| `massive`    | 80px  | `gap-20` / `p-20`                            |

### Border Radius Scale — Tailwind

| Design Token | Value | Tailwind Class |
| ------------ | ----- | -------------- |
| `shape-xs`   | 4px   | `rounded-sm`   |
| `shape-sm`   | 8px   | `rounded-lg`   |
| `shape-md`   | 12px  | `rounded-xl`   |
| `shape-lg`   | 16px  | `rounded-2xl`  |
| `shape-xl`   | 24px  | `rounded-3xl`  |
| `shape-4xl`  | 23px  | `rounded-3xl`  |
| `shape-pill` | 999px | `rounded-full` |

### Grid & Container

- Reference frame: 360px width
- Horizontal margins: `px-4` (16px) on all screens
- Safe area insets respected everywhere, especially the input bar

---

## 7. Opacity — Tailwind

Use Tailwind's named `opacity-*` utilities. Do not use colour/opacity slash modifiers (e.g. `black/20`, `red/30`). For text and stroke colours that require transparency, define them as pre-composited tokens in `@theme {}` (see Text and Stroke sections above) and reference those named classes directly.

| Role                  | Tailwind Class                                | Value                                |
| --------------------- | --------------------------------------------- | ------------------------------------ |
| Disabled              | `opacity-40`                                  | 0.40 (closest standard step to 0.38) |
| Overlay / Scrim       | `opacity-40` on a black overlay element       | 0.40                                 |
| Frosted glass overlay | `opacity-80 backdrop-blur` on a white element | 0.80                                 |

For text at reduced opacity use the pre-composited tokens: `text-text-low` (0.65) and `text-text-disabled` (0.40).
For borders use the contextual stroke tokens: `border-stroke-on-surface-1`, `border-stroke-on-card-on-1`, etc.

---

## 8. Responsive Behavior

### Breakpoints

Define in `@theme {}` to match project targets:

```css
@theme {
  --breakpoint-sm: 390px; /* Mobile Large */
  --breakpoint-md: 600px; /* Tablet */
  --breakpoint-lg: 960px; /* Desktop */
}
```

| Name               | Width           | Key Changes                                     |
| ------------------ | --------------- | ----------------------------------------------- |
| Mobile (reference) | 360px           | Base design target — no prefix                  |
| Mobile Large       | `sm:` 390–430px | Minor layout adjustments                        |
| Tablet             | `md:` 600–768px | 2-column grids for Hub/cards (`md:grid-cols-2`) |
| Desktop (web)      | `lg:` 960px+    | Expanded containers, sidebar nav                |

### Touch Targets

- Minimum tap target: 44×44px — use `min-w-[44px] min-h-[44px]`
- Icon buttons: `w-10 h-10` component (40px), wrap in `p-[2px]` hit area to reach 44px
- Bottom tab bar: `w-full min-h-14` (56px minimum height)

---

## 9. Non-Technical Contributor Guide

This section is for PMs, vertical leads, and anyone reviewing or directing product work without writing code. It gives you the language and checks to review what's been built and catch issues early — without needing to read the code itself.

### What you can and cannot change

| ✅ You can decide                                          | ❌ Fixed at system level                                   |
| ---------------------------------------------------------- | ---------------------------------------------------------- |
| The primary colour for your vertical                       | Typography (always JioType)                                |
| Which components appear on a screen                        | Geometry — pills for buttons/chips, `rounded-xl` for cards |
| Content, copy, icons                                       | Loading pattern — always skeleton shimmer, never spinners  |
| Layout and information hierarchy                           | Gradients — never used on any surface                      |
| Whether a feature uses Primary, Secondary, or Sparkle tone | Safe area behaviour                                        |

---

### How to review a built screen

Use these questions as a checklist when a developer shares a design for your approval.

**Typography**

- Is the font JioType? If it looks like a system font (San Francisco, Roboto), flag it.
- Are headings visually heavier than body text? Display and headline text should feel bold and compressed.
- Does secondary text (captions, timestamps) look lighter/smaller than primary text?

**Colour**

- Does the primary colour (buttons, active chips, send button, focus ring) match the agreed colour for your vertical?
- Are there any gradients? There should be none — surfaces are flat.
- Does text on dark/coloured backgrounds appear white? Dark text should only appear on light surfaces.

**Shape & Geometry**

- Are buttons and chips pill-shaped (fully rounded ends)? Any square or slightly rounded button is wrong.
- Do cards have softly rounded corners — not sharp, not fully circular?
- Is there anything with hard/sharp corners that is interactive? Flag it.

**Spacing & Density**

- Does the screen feel spacious or cramped? It should feel considered and airy, not packed.
- Is there consistent breathing room between sections?

**Loading states**

- If you can trigger a loading state, does it show a shimmering placeholder? If it shows a spinning indicator, flag it.

**Safe area**

- On a phone, does the status bar area and home indicator area blend with the screen background? They should not be a fixed black or white bar.

---

### Natural language → implementation guardrails

When a PM, VL, or anyone writes a request in plain language, Claude and Cursor must translate it using the rules below before writing any code. This ensures natural-language intent always maps to the correct design system behaviour.

| If someone says…                           | Translate to…                                                                                                                                                  |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "Make the button the brand colour"         | Use the vertical's confirmed Tailwind primitive for `bg-*`. If none confirmed, flag with `🚩 DEV FLAG` and use `bg-zinc-700` as placeholder                    |
| "Add a border / divider / separator"       | Only add if explicitly asked. Use the matching `border-stroke-on-*` token for the element's surface context                                                    |
| "Make it look lighter / softer"            | Use `text-text-low` for text, or a lighter stop of the same Tailwind scale for backgrounds                                                                     |
| "Make it look disabled / inactive"         | Add `opacity-40` to the element. Use `text-text-disabled` for text                                                                                             |
| "Add a background to this section"         | Use `bg-surface-2` if on a white screen, `bg-surface-1` if on a grey screen                                                                                    |
| "The card should stand out"                | Cards automatically use the inverse surface — `bg-surface-card-on-1` on white, `bg-surface-card-on-2` on grey. No shadow needed                                |
| "Add some spacing / breathing room"        | Use the spacing scale — `gap-4` (16px), `gap-6` (24px), `gap-8` (32px). Flag anything not in the scale                                                         |
| "Make the text smaller / bigger"           | Use a named type token — `text-body-s`, `text-headline-xs`, etc. Never set a raw pixel value                                                                   |
| "It should feel more premium / elevated"   | This means spacing, not shadows. Increase vertical rhythm using the spacing scale                                                                              |
| "Make the corners rounder"                 | Use `rounded-full` for interactive elements (buttons, chips), `rounded-xl` for cards, `rounded-lg` for images                                                  |
| "Add a loading state"                      | Use `animate-pulse` skeleton on the relevant surface token. Never use a spinner                                                                                |
| "It should work on dark mode"              | All `bg-surface-*`, `text-text-*`, and `border-stroke-*` tokens flip automatically. Action/brand primitives need a dark-mode variant — flag with `🚩 DEV FLAG` |
| "Use the error / success / warning colour" | Use `bg-error`, `text-error`, `bg-success`, `text-success`, `bg-warning`, `text-warning`                                                                       |
| "Make it full width"                       | `w-full`                                                                                                                                                       |
| "Centre it"                                | `flex items-center justify-center` or `mx-auto` depending on context                                                                                           |
| "Make it look like a pill / capsule"       | `rounded-full`                                                                                                                                                 |
| "Add a subtle line between items"          | Only if asked. Use a `<div>` with `h-px bg-stroke-on-surface-*` matching the surface context                                                                   |

If a request cannot be mapped to an existing token or Tailwind primitive, Claude and Cursor must flag it with `🚩 DEV FLAG` and ask for clarification before implementing.

---

### How to communicate a decision to the dev team or Claude/Cursor

When you want to direct a change, use plain language in this format. Claude and Cursor will understand it and apply the constraint correctly.

**Requesting a colour change for your vertical:**

> "Update the primary colour for the [vertical name] vertical. The confirmed colour is [hex or description]. Apply this to all CTAs, active states, and the send button."

**Requesting a layout or content change:**

> "On the [screen name] screen, [describe what you want changed]. Keep all shapes, typography, and spacing consistent with the design system."

**Flagging something that looks wrong:**

> "The [component] on [screen] looks like it has [sharp corners / a gradient / a spinner / the wrong font]. Check it against the design system and fix."

**Asking Claude to review a screen for design system compliance:**

> "Review this screen against the JBIQ design system in DESIGN.md. Flag anything that uses a hard-coded colour instead of a token, wrong geometry, gradients, spinners, or non-JioType fonts."

---

### What to expect from the development process

As a vertical lead or PM, here is the normal flow and where your input matters:

1. **Colour input** — Before a vertical is built, you provide the action colour for that vertical (hex, Figma swatch, or Jio brand reference). The dev team uses that Tailwind primitive in components immediately.
2. **Component review** — After a screen is built, use the checklist above to review it. Flag issues using the prompts above.
3. **Token promotion** — When a colour is used in 2+ places, Claude or Cursor will prompt the dev team to create a named token for it. You confirm whether it should be formalised.
4. **Ongoing** — Any non-standard value will carry a `🚩 DEV FLAG` comment in the code. This is your signal to confirm or reject before it is locked in.

---

## 10. Token Promotion Prompt

Colour, spacing, and other values are applied as Tailwind primitives directly in components. When a primitive is repeated for the same role, it should be promoted to a semantic token in `@theme {}`.

**Claude and Cursor must surface this prompt whenever a primitive appears a second time for the same role:**

> "`[primitive-class]` is used in more than one place for `[role]`. Should we create a `@theme {}` token for it? Suggested name: `--[category]-[semantic-name]`. This will make it easy to update in one place and ensure dark mode consistency."

Two instances is enough to trigger the prompt — do not wait for more.

**Prompt to create the token:**

> Add `--color-[semantic-name]: var(--color-[primitive])` to `@theme {}`. Replace all direct uses of `[primitive-class]` in components with the new token class `[token-class]`.

**Prompt to add a value with no existing primitive match:**

> A value `[x]` is needed for `[use case]` and has no Tailwind primitive equivalent. Add it as a named `@theme {}` token: `--[category]-[name]: [value]`. Use the token class in the component. Flag with `/* 🚩 no primitive — confirm with design */`.

---

## 11. Do's and Don'ts

### Repetition → Token promotion

Whenever the same Tailwind primitive appears more than once for any of the following — **colour, font size, font weight, line height, letter spacing, spacing, gap, padding, border radius, opacity, background, or effect** — Claude and Cursor must prompt to promote it to a `@theme {}` token. Two instances is the threshold.

### Do

- Use `font-sans` (`JioType`) exclusively
- Apply icon colours using Tailwind primitives from the same scale as the context — pick the stop that reads on the surface
- Use `rounded-full` for all buttons and chips
- Use HeroUI `<Button>`, `<Chip>`, and `<Card>` — style via `className` with Tailwind
- Use `@theme {}` tokens for surfaces, strokes, and text (`bg-surface-1`, `text-text-high`, etc.)
- Use Tailwind primitives directly for action/brand/icon colours until promoted to a token
- Match safe area bar colour to the underlying screen surface

### Don't

- Don't use gradients on any UI surface
- Don't build the voice orb with CSS, Tailwind, or coloured divs
- Don't add custom padding/colours to the chat input — apply Tailwind classes to the existing component
- Don't use sharp corners (`rounded-none`) on interactive elements
- Don't hardcode surface hex values — always use `bg-surface-1`, `bg-surface-2`, `bg-surface-card-on-*`
- Don't use slash opacity modifiers on colours — use `text-text-low`, `text-text-disabled`, or `opacity-*` utilities

### Dev Flag

Any new colour value, spacing value, or component customisation that does not map to an existing token in this document must be flagged with a `// 🚩 DEV FLAG` comment at the point of use, e.g.:

```tsx
// 🚩 DEV FLAG: custom offset not in spacing scale — confirm with design
<div className="mt-[18px]">

// 🚩 DEV FLAG: vertical override of primary — confirm final hue with design
<Button className="bg-blue-700">  {/* replace bg-blue-700 with confirmed primitive */}
```

This ensures deviations are visible in review and can be formalised into tokens or resolved with design.
