# ADR 0003 — Radix primitives + Tailwind, not shadcn/ui

- **Status:** Accepted
- **Date:** 2026-05-06

## Context

We need a component library that we own end-to-end, supports the hybrid sourcing workflow (Figma + Claude + reference), and styles purely through Tailwind classes.

## Decision

Hand-author wrappers in `src/components/primitives/` over `@radix-ui/react-*` headless primitives. We don't use the shadcn/ui CLI or registry. Equivalent alternative considered: `react-aria-components`. Radix wins on bundle size, popularity, and familiarity.

## Consequences

- We control every line of every component file.
- Adding new components is a single hand-edit, not a CLI invocation.
- The Tailwind-only rule (`.cursor/rules/99-tailwind-only.mdc`) is enforceable because nothing is generated.
- We accept the cost of hand-writing each primitive (Dialog, Tooltip, Switch, …) once.
