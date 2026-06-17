# Dark Mode + Header Standardization — JDS / MCP additions

_Last updated: 2026-06-16_

This document records the near-universal standardizations shipped on the `dark-mode`
branch and lists exactly what to **add / update in the a2ui-design-system (JDS) MCP
doc**, mapped to its existing section numbers (`§2`, `§11.53`, `§11.77`, `§11.78`).

Each block is marked **ADD** (new content) or **UPDATE** (the doc currently says
something different from what shipped — reconcile to the shipped value).

---

## What shipped (summary)

- **One shared header.** Every hub now uses `HubHeader`
  (`apps/shell/src/app/jobs/design-prototype/HubHeader.tsx`). Commerce + all Health
  screens were migrated off their hand-rolled `absolute h-[68px]` headers.
- **HubHeader gained a `titleSlot`** (custom centre — e.g. the commerce delivery-address
  menu) and a documented set of three variants.
- **One right-side action-button style** across headers (Chats / New-chat / mute / Skip).
- **One "new chat" icon** everywhere — lucide `PenLine`.
- **App-wide dark mode** for astrology + the whole health vertical (chat bubbles, intent
  chips, triage/close/finish/explore widgets, reminders + TimeSheet, pills).
- **One universal user speech bubble** — `#EEEEEF` light · `#2a2d40` dark — across
  health, commerce, astrology, personal-companion.

All dark-mode work is **additive**: light mode renders byte-for-byte identical.

---

## §2 · Dark Mode Classes — **ADD** the application rules

The dark _scale_ is documented; these are the _application rules_ that were the
recurring gotchas.

### Which tokens flip vs which need an explicit `dark:`

```
FLIP automatically — use as-is, no dark: needed:
  bg-surface · text-fg · text-fg-muted · border · success / warning / error (semantic)

CONSTANT — do NOT flip, MUST add a dark: variant:
  bg-surface-ghost (#EEEEEF) · bg-surface-minimal (#F5F5F5) · bg-surface-ghost-icon (lavender)
  bg-primary-10/20 (light lavenders) · any hardcoded hex (bg-white, bg-[#…], text-[#0c0d10], border-black/…)
```

### Additive rule

> Dark mode is **additive** — only _add_ `dark:` classes; never change or remove a
> light class. Light mode must stay byte-for-byte identical.

### Inline-style colors can't be themed

> A `style={{ background / color }}` value cannot take a `dark:` variant. Either move
> the color into a className (so `dark:` applies), or use `currentColor` + a dark-aware
> text class. _Exception:_ inline **icon-circle accent** colors are intentionally left as
> the light values — they read fine in both modes.

### Flat content cards ≠ elevation stepping

> The stepping rule (nested = one level lighter) applies to **elevated chrome**: modals,
> bottom sheets, app panels.
>
> **Content cards that are `bg-surface` in light** (chat-thread widget / info containers)
> stay **flat** in dark: `bg-surface dark:border-white/10` — **NOT** `dark:bg-bg-elev`.
> Stepping them up diverges from the light design and over-brightens on the near-black
> chat surface. Interactive controls _inside_ the card (chips, +/− steppers, selectable
> tiles) may still be elevated to pop.

### Disabled / inactive in dark

> A disabled/inactive surface must be at or **below** the active surface's lightness
> (recessed), never brighter. e.g. an inactive reminder row is `dark:bg-white/5`, not
> `dark:bg-white/10` (which over-brightens against the active `bg-elev` rows).

---

## §11.53 · SpeechBubble — **UPDATE** the neutral / user gray

`dark:bg-bg-elev` (#171823) sits only ~6 levels above the chat surface
(`bg-surface` #111113) and visibly merges. Use a distinct raised neutral:

```diff
- other:   { bg: "bg-[#EEEEEF] dark:bg-bg-elev", ... }
- neutral: { bg: "bg-[#EEEEEF] dark:bg-bg-elev", ... }
+ other:   { bg: "bg-[#EEEEEF] dark:bg-[#2a2d40]", ... }
+ neutral: { bg: "bg-[#EEEEEF] dark:bg-[#2a2d40]", ... }
```

> `#2a2d40` is the **universal user-bubble dark** — applied across health, commerce,
> astrology, and personal-companion. The **gray** bubble (not the purple `you` =
> `bg-primary-50`) is the standard user/other message bubble in the chat-story
> prototypes. Tail also appears as the class `rounded-[18px_18px_4px_18px]` (right) in
> addition to the inline `borderRadius: "14px 14px 4px 14px"`.

---

## §11.77 · HubHeader — **ADD** titleSlot, variants, the standard action button

### Adoption rule (ADD)

> `HubHeader` is THE shared chat/page header — every hub uses it. Do not hand-roll
> headers. _(Commerce + all Health screens were migrated onto it; the old inline
> `absolute h-[68px]` headers are removed.)_

### New prop (ADD to the Props table)

| Prop        | Type        | Default | Notes                                                                                                                                                                                        |
| ----------- | ----------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `titleSlot` | `ReactNode` | —       | Custom centre content (e.g. a delivery-address menu) — **replaces** the text `title`. Rendered in a `flex min-w-0 flex-1` wrapper so a `flex-1` child truncates. When used, pass `title=""`. |

### The three sanctioned variants (ADD)

No `variant` enum — compose from `title`/`titleSlot` + `rightSlot`:

| #   | Shape                                     | Compose                                                                  | Example                                      |
| --- | ----------------------------------------- | ------------------------------------------------------------------------ | -------------------------------------------- |
| 1   | back + heading + right icon               | `title` + `rightSlot={<button/>}`                                        | health pills, astro reveal (Skip)            |
| 2   | back + **address** + right icon           | `titleSlot={<AddressMenu/>}` + `rightSlot={<button/>}`                   | commerce                                     |
| 3   | back + heading + **multiple** right icons | `title` + `rightSlot={<div className="flex items-center gap-3">…</div>}` | health stories, astro chat (mute + New-chat) |

> `title` ↔ `titleSlot` = heading vs custom centre. `rightSlot` holds one **or** many buttons.

### One standard right-side action button (ADD)

All right-side action buttons (Chats / New-chat / mute / …) use the same 40×40 style.
It matches the back button's `btnBg` and **supersedes** older per-hub styles that used
`bg-surface-minimal … hover:scale-105`:

```
focus-visible:ring-primary-60 flex size-10 shrink-0 items-center justify-center rounded-full
bg-[#f5f5f5] text-[#0c0d10] dark:bg-bg-elev dark:text-ink
transition-transform duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.95]
```

### Icon conventions (ADD)

> "New chat" = lucide **`PenLine`** (size 19), universal across hubs. Right-side action
> icons are **lucide**; the back chevron stays HubHeader's `ChevronLeftIcon`.

### Content clearance (ADD)

> The header is `fixed` at `calc(env(safe-area-inset-top, 0px) + 60px)`, so the scroll
> body must pad `paddingTop: calc(env(safe-area-inset-top, 0px) + 80px)`. A flat
> `pt-[80px]` slides under the header on notched devices.

---

## §11.78 · HubChatInput — **UPDATE** the Add button dark

```diff
- Add btn: dark:bg-primary-60/60 dark:border-primary-60/30 dark:text-primary-20
+ Add btn: dark:bg-primary-60/50   (clearer dark-purple; the "+" glyph is whitened via
+                                   dark:[filter:brightness(0)_invert(1)])
```

---

## Reconciliation notes (doc vs shipped)

Two places where the MCP doc and the shipped code currently disagree — reconcile to the
**shipped** values above (they were approved against the design screenshots):

1. **HubHeader button-dark.** Doc says `dark:bg-bg-elev … dark:text-ink-soft` +
   `dark:hover:bg-bg`. Shipped uses the single action-button style above
   (`dark:bg-bg-elev dark:text-ink`, focus ring, `active:scale-[0.95]`, no hover-scale).
2. **SpeechBubble neutral/other.** Doc says `dark:bg-bg-elev`; shipped uses
   `dark:bg-[#2a2d40]` (bg-elev merges with the chat surface).

---

## Token reference (values used above)

| Token / value                                | Light     | Dark       | Used for                                           |
| -------------------------------------------- | --------- | ---------- | -------------------------------------------------- |
| `bg-surface`                                 | `#FAFAFA` | `#111113`  | screen / chat surface, **flat** content cards      |
| `bg-surface-ghost`                           | `#EEEEEF` | (constant) | user bubble light, secondary grays                 |
| `#2a2d40`                                    | —         | `#2a2d40`  | **universal user-bubble dark** (raised neutral)    |
| `dark:bg-bg-elev`                            | —         | `#171823`  | elevated controls/chips, header action buttons     |
| `dark:bg-bg-panel`                           | —         | `#12131a`  | sheets / panels (e.g. TimeSheet)                   |
| `dark:bg-white/5`                            | —         | ~`#1d1d1f` | disabled/inactive row (recessed)                   |
| `dark:border-white/10`                       | —         | —          | hairline border on flat dark cards                 |
| `dark:bg-[#2a2410]`                          | —         | `#2a2410`  | amber/warning card tint                            |
| `dark:bg-primary-60/40 dark:text-primary-20` | —         | —          | lavender chips/icon circles (e.g. "दादी से सुनें") |
