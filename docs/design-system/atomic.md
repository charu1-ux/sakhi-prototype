# Atomic Design System — Chat Assistant Platform

> Brad Frost's atomic design methodology applied to the 8 verticals
> (Astro, Cricket, Devotion, Career, News, Finance, Health, Entertainment).
> Components are categorised into Atoms → Molecules → Organisms → Templates → Pages.

## Reusability key

- **High Reuse (6–8/8):** Build once, use everywhere. Core to the design system.
- **Medium Reuse (3–5/8):** Build with configuration. May need minor theming per vertical.
- **Specialist (1–2/8):** Build only when that vertical is in scope.

## Levels

| Level    | Count | Purpose                                                    | Reuse Scope |
| -------- | ----- | ---------------------------------------------------------- | ----------- |
| Atom     | 29    | Smallest indivisible unit — tokens, icons, buttons, inputs | Universal   |
| Molecule | 21    | Functional groups of 2–4 atoms                             | 6–8 typical |
| Organism | 39    | Complex, self-contained UI sections                        | 3–8         |
| Template | 10    | Page layout skeletons — slot-based, no real content        | 4–8         |
| Page     | 11    | Specific vertical instances with real content              | 1–3         |

## How this maps to code

| Doc level  | Code path                                             |
| ---------- | ----------------------------------------------------- |
| Atom       | `src/components/atoms/`                               |
| Molecule   | `src/components/molecules/`                           |
| Organism   | `src/components/organisms/`                           |
| Template   | `src/components/templates/`                           |
| Page       | `src/app/**/page.tsx`                                 |
| Tokens     | `src/styles/tokens.css` + `tokens.ts`                 |
| Primitives | `src/components/primitives/` (Radix, Tailwind-styled) |

The original reference doc lives at `~/Downloads/atomic_design_system.docx`.
Whenever you transcribe an entry into code, link the new component to the
corresponding doc row in its Storybook description.
