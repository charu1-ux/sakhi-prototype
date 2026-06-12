# Memory

## Me

Priyam Rajput, Vertical Lead — Personal Companion on the JioBharatIQ (JBIQ) prototype. Email: priyam.rajput@ril.com. Workflow: local dev → push to GitHub periodically.

## My Ownership

- **Personal Companion** vertical — the menu item on the homepage VerticalList
- I own `apps/shell/src/app/personal-companion/` (to be created) and the entry in `VerticalList.tsx`

## Project Structure

| Path                                                   | What                                                           |
| ------------------------------------------------------ | -------------------------------------------------------------- |
| `apps/shell/src/app/page.tsx`                          | Homepage                                                       |
| `apps/shell/src/components/molecules/VerticalList.tsx` | Vertical menu list — add Personal Companion here               |
| `apps/shell/src/app/{slug}/page.tsx`                   | Each vertical's page                                           |
| `packages/ui/src/`                                     | Shared UI components (atoms, molecules, organisms, primitives) |
| `DESIGN.md`                                            | JDS design system spec — **always read before building UI**    |

## Verticals

| Name                   | Slug               | Status                      |
| ---------------------- | ------------------ | --------------------------- |
| Jobs and Career        | jobs               | Live (has design-prototype) |
| Health                 | health             | Live                        |
| Astrology              | astro              | Live                        |
| Commerce               | commerce           | Live                        |
| Finance                | finance            | Live                        |
| News                   | news               | Live                        |
| **Personal Companion** | personal-companion | **My vertical — to build**  |
| Cricket                | cricket            | Coming soon                 |
| Devotion               | devotion           | Coming soon                 |

## Terms

| Term         | Meaning                                         |
| ------------ | ----------------------------------------------- |
| JBIQ         | JioBharatIQ — the product name                  |
| JDS          | Jio Design System                               |
| VL           | Vertical Lead                                   |
| shell        | The Next.js host app (`apps/shell`)             |
| VerticalList | `VerticalList.tsx` — homepage menu component    |
| gradientFrom | Tailwind class for vertical icon gradient       |
| vertical-\*  | Tailwind color tokens e.g. `from-vertical-jobs` |

## Stack

Next.js 14+, Tailwind v4 (v3-config-style extend), TypeScript, Turborepo monorepo, Capacitor (native wrapper)

## Design Rules (from DESIGN.md)

- White-dominant surface, JioType font, pill shapes (`rounded-full`), `rounded-xl` cards
- Skeleton shimmer for loading — never spinners
- JDS SVG icons only — no emoji, no third-party icon libs
- Colours via Tailwind primitives; structural tokens in `@theme {}`
- Light mode default, no gradients on UI surfaces

## Preferences

- Push changes to GitHub periodically (no CI/CD assumed — manual pushes)
