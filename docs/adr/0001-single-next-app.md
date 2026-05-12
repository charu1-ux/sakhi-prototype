# ADR 0001 — Single Next.js app at the repo root

- **Status:** Accepted
- **Date:** 2026-05-06

## Context

We considered three layouts: (a) single Next.js app at the repo root, (b) pnpm + Turborepo monorepo with `apps/web` and `apps/native`, (c) two separate repos. The product is one PWA shipping to one Vercel project.

## Decision

Single Next.js 16 app at the repo root. Atomic structure lives inside `src/components/{atoms,molecules,organisms,templates}/`. Tokens live in `src/styles/`. No monorepo.

## Consequences

- Simplest deploy path (Vercel framework auto-detect, no monorepo build command).
- Smallest cognitive overhead for early-stage development.
- If a second app appears (admin, marketing, native), promote to a monorepo at that point — code already lives in the right shape (`src/components/`, `src/styles/`) to extract.
