# JBIQ Design System — Guardrails Reference

This file is the single source of truth for all design system rules. Always consult it when writing a spec, reviewing a screen, or answering a question.

---

## Surfaces

Two base surfaces. Use tokens, not hex values.

| Surface                            | Light value | Dark value  | Token                  |
| ---------------------------------- | ----------- | ----------- | ---------------------- |
| Surface 1 — primary screen bg      | white       | black       | `bg-surface-1`         |
| Surface 2 — section / secondary bg | neutral-100 | neutral-900 | `bg-surface-2`         |
| Card on Surface 1                  | neutral-100 | neutral-900 | `bg-surface-card-on-1` |
| Card on Surface 2                  | white       | neutral-800 | `bg-surface-card-on-2` |

**Rule**: Cards always use the opposite surface to their parent screen. This creates depth without shadows.

---

## Borders / Stroke

**Do not add borders by default.** Only add when explicitly asked.

When a border is needed, it is always one Tailwind neutral step above the element's background:

| Element background      | Border token                               |
| ----------------------- | ------------------------------------------ |
| Surface 1 (white)       | `border-stroke-on-surface-1` → neutral-100 |
| Surface 2 (neutral-100) | `border-stroke-on-surface-2` → neutral-200 |
| Card on Surface 1       | `border-stroke-on-card-on-1` → neutral-200 |
| Card on Surface 2       | `border-stroke-on-card-on-2` → neutral-100 |

---

## Text

| Role                   | Token                                  | When to use                         |
| ---------------------- | -------------------------------------- | ----------------------------------- |
| Primary text           | `text-text-high` (zinc-950)            | All main headings and body copy     |
| Secondary text         | `text-text-low` (zinc-950 at 65%)      | Captions, supporting labels         |
| Placeholder / inactive | `text-text-disabled` (zinc-950 at 40%) | Input placeholders, disabled labels |
| Text on action colour  | `text-white`                           | Text on buttons, active chips       |

---

## Colour

No colour tokens are prescribed at system level. Colours are:

- Applied as Tailwind primitives directly (e.g. `violet-700`, `teal-600`, `sky-600`)
- Chosen per vertical
- Promoted to a semantic token once a primitive is used twice for the same role

**Three colour roles** (hues confirmed per vertical):

- **Action** — CTAs, active states, send button, focus ring
- **Value** — success moments, value signals
- **AI / Sparkle** — AI badges, contextual indicators

**Status colours** (shared across all verticals):

- Error → `bg-error` / `text-error` (red-500)
- Warning → `bg-warning` / `text-warning` (orange-500)
- Success → `bg-success` / `text-success` (green-500)

---

## Typography

Font is always **JioType**. Never use system fonts (San Francisco, Roboto, Arial, etc.).

| Style                                             | Usage                           |
| ------------------------------------------------- | ------------------------------- |
| `text-display-l/m/s font-black tracking-tight`    | Hero headlines                  |
| `text-headline-l/m/s font-black tracking-tight`   | Screen titles, section headings |
| `text-headline-xs/2xs/3xs font-black`             | Sub-section titles              |
| `text-title-l/m/s font-bold`                      | Widget headers, card titles     |
| `text-body-l/m/s font-medium leading-normal`      | Standard body copy              |
| `text-body-xs/2xs font-medium`                    | Dense body, timestamps          |
| `text-label-l/s font-bold`                        | Chip labels, tags               |
| `text-button font-bold`                           | Button text                     |
| `text-overline font-bold uppercase tracking-wide` | Section signpost labels         |

---

## Geometry (shape)

| Shape         | Tailwind class | Use                            |
| ------------- | -------------- | ------------------------------ |
| Pill          | `rounded-full` | All buttons and chips — always |
| Soft round    | `rounded-xl`   | Standard cards                 |
| Compact round | `rounded-lg`   | Image / compact cards          |
| Large round   | `rounded-2xl`  | Large cards, sheets            |
| Extra large   | `rounded-3xl`  | Bottom sheets                  |

**Rule**: No sharp corners (`rounded-none`) on anything interactive.

---

## Spacing scale

| Token | Tailwind            | Use                       |
| ----- | ------------------- | ------------------------- |
| 2px   | `p-0.5` / `gap-0.5` | Hairline                  |
| 4px   | `p-1` / `gap-1`     | Micro                     |
| 8px   | `p-2` / `gap-2`     | Inner gap                 |
| 12px  | `p-3` / `gap-3`     | Component spacing         |
| 16px  | `px-4`              | Screen horizontal margins |
| 20px  | `p-5` / `gap-5`     | Component gap             |
| 24px  | `p-6` / `gap-6`     | Section gap               |
| 32px  | `p-8` / `gap-8`     | Large section             |
| 40px  | `p-10` / `gap-10`   | Breathing room            |
| 48px  | `p-12` / `gap-12`   | Hero spacing              |

---

## Opacity

| Role                         | Class                           |
| ---------------------------- | ------------------------------- |
| Disabled element             | `opacity-40`                    |
| Overlay / scrim behind modal | `opacity-40` on a black overlay |
| Frosted overlay              | `opacity-80 backdrop-blur`      |

Do not use colour/opacity slash modifiers. Use `text-text-low` and `text-text-disabled` tokens for text opacity.

---

## Components — rules

**Buttons**

- Always `rounded-full` (pill shape)
- Primary: action colour background, white text
- Secondary: `bg-surface-card-on-1`, `text-text-high`
- Ghost: transparent background, `border-stroke-on-surface-1`, action colour text
- Disabled: `opacity-40` on the button
- Icon button: 40×40px, `bg-surface-card-on-1` or tinted surface

**Chips**

- Always `rounded-full`
- Default: `bg-surface-card-on-1`, `text-text-high`
- Active: action colour background, `text-white`

**Cards**

- `rounded-xl` standard, `rounded-lg` compact/image
- No shadow — flat colour only
- Background always inverts from the parent surface
- No border unless explicitly asked

**Loading states**

- Always skeleton shimmer (`animate-pulse` on the card surface colour)
- Never a spinner

**Chat input**

- `bg-surface-card-on-1 rounded-[23px]`
- Focused: `ring-2 ring-[action-colour]`
- Placeholder: `text-text-disabled`

---

## Safe area

The status bar (top) and home indicator area (bottom) always match the background of the screen they sit on. They should never be a fixed black or white bar.

---

## Breakpoints

| Name          | Prefix | Width     |
| ------------- | ------ | --------- |
| Mobile (base) | none   | 360px     |
| Mobile Large  | `sm:`  | 390–430px |
| Tablet        | `md:`  | 600–768px |
| Desktop       | `lg:`  | 960px+    |

---

## Touch targets

- Minimum tap target: 44×44px
- Icon buttons: 40×40px component, 44px tap area
- Bottom tab bar: full width, minimum 56px height

---

## Natural language → implementation mapping

| Plain language                             | Implementation rule                                                                            |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| "Make the button the brand colour"         | Use vertical's confirmed Tailwind primitive for bg. Flag with 🚩 if not yet confirmed          |
| "Add a border / divider"                   | Only if asked. Use `border-stroke-on-*` token for the surface context                          |
| "Make it look lighter / softer"            | Use `text-text-low` for text, lighter stop of same scale for bg                                |
| "Make it look disabled"                    | `opacity-40` on element, `text-text-disabled` for text                                         |
| "Add a background to this section"         | `bg-surface-2` on white screen, `bg-surface-1` on grey screen                                  |
| "The card should stand out"                | Cards auto-invert surface — no shadow needed                                                   |
| "Add spacing / breathing room"             | Use spacing scale — `gap-4` (16px), `gap-6` (24px), `gap-8` (32px)                             |
| "Make the text smaller / bigger"           | Use a named type token — never raw pixel values                                                |
| "Make it feel premium / elevated"          | More spacing, not shadows                                                                      |
| "Make corners rounder"                     | `rounded-full` for interactive, `rounded-xl` for cards                                         |
| "Add a loading state"                      | `animate-pulse` skeleton — never a spinner                                                     |
| "It should work in dark mode"              | Surface/text/stroke tokens flip automatically. Action primitives need a dark variant — flag 🚩 |
| "Use the error / success / warning colour" | `bg-error`, `text-success`, `bg-warning`, etc.                                                 |
| "Full width"                               | `w-full`                                                                                       |
| "Centre it"                                | `flex items-center justify-center` or `mx-auto`                                                |
| "Make it a pill / capsule"                 | `rounded-full`                                                                                 |
| "Add a subtle line between items"          | `<div>` with `h-px` and matching stroke token                                                  |

---

## What PMs / VLs can change vs what is fixed

| ✅ Can decide                       | ❌ Fixed at system level                  |
| ----------------------------------- | ----------------------------------------- |
| Action colour for their vertical    | Font (always JioType)                     |
| Which components appear on a screen | Pill shape for buttons and chips          |
| Content, copy, icons                | Soft round corners for cards              |
| Layout and information hierarchy    | No gradients on any surface               |
| Which colour role a feature uses    | Loading = skeleton shimmer, never spinner |
| Whether to add a border (if asked)  | Safe area colour matching                 |

---

## Token promotion rule

Whenever the same Tailwind primitive is used twice for the same role — colour, font size, spacing, border radius, opacity, or effect — flag it for token promotion:

> "This value is used in more than one place. Should we create a design token for it so it can be updated in one place?"
