# ADR 0004 — Tailwind utility classes are the only styling layer

- **Status:** Accepted
- **Date:** 2026-05-06

## Context

Mixing styling systems (Tailwind + CSS Modules + styled-components + theme provider hashes) is the most reliable way to produce a UI that's hard to refactor. We want one styling layer that survives Figma → Claude → human round-trips.

## Decision

All visual styling is Tailwind utility classes via `cn(...)` from `@/lib/cn`. Tokens are CSS variables in `src/styles/tokens.css` mapped into Tailwind via `@theme inline { ... }`.

## Forbidden

- `*.module.css`
- `styled-components`, `@emotion/*`, any CSS-in-JS
- New global CSS files
- Static `style={{ … }}` props

## Single carve-out

GSAP-driven dynamic transforms / opacity values may be applied via `style={{ transform: ... }}` because GSAP writes inline styles by design.

## Enforcement

`.cursor/rules/99-tailwind-only.mdc` is `alwaysApply: true`, so the AI is constrained at authoring time. Code review enforces the rule for human-written code.
