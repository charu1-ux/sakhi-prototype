# Components — Atomic Design

Components are organised by atomic-design level. Imports flow **upward only** — a
molecule may import atoms or primitives, but an atom may not import a molecule.

```
primitives/   Headless Radix wrappers, styled with Tailwind. The only place
              we touch @radix-ui/* directly. Tokens-driven.
atoms/        Single-purpose UI building blocks (Badge, Spinner, Input,
              ThemeToggle…). Compose primitives + tokens.
molecules/    2–4 atoms grouped into a functional unit (SearchBar, AvatarName,
              IconLabel, ToastMessage…).
organisms/    Self-contained complex sections (NavHeader, ChatInputDock,
              MessageBubble, BottomSheet…).
templates/    Page-level layout skeletons with slots (ChatLayout, FeedDiscovery…).
```

## Hybrid sourcing workflow

There are three approved ways to add a component:

1. **Figma → component.** Use the Figma Dev Mode MCP (configured in `.cursor/mcp.json`)
   to pull a frame's structure and variables. Translate the result into Radix +
   Tailwind, snap colours/spacing/radii to tokens, and place the file in the
   correct atomic folder.
2. **Existing-library → component.** Adapt a known pattern (Radix recipe,
   open-source reference) into our Tailwind-classes-only style. Never copy
   `*.module.css`, `styled-components`, or theme-system code.
3. **Claude-from-reference → component.** Paste HTML/CSS or a screenshot in a
   Cursor chat and attach `.cursor/rules/50-ui-from-html.mdc`. Output is
   constrained to Radix + Tailwind utilities + tokens.

## Styling rules (enforced by `.cursor/rules/99-tailwind-only.mdc`)

- All visual styling is Tailwind utility classes via `cn(...)`.
- Token-backed utilities only (`bg-bg`, `text-fg`, `rounded-md`, `shadow-mid`).
- No `*.module.css`, no `styled-components`, no `style={{ color: ... }}`.
- Single carve-out: `style={{ transform: ... }}` for GSAP-driven dynamic
  transforms inside `src/lib/motion/` consumers.
- Every component must have a Storybook story alongside it (`Component.stories.tsx`).
