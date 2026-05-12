# ADR 0002 — npm as the package manager

- **Status:** Accepted
- **Date:** 2026-05-06

## Context

User preference plus the single-app layout (ADR 0001) means we don't need pnpm's workspace efficiency.

## Decision

Use npm 10+ with a single `package-lock.json`. Node version pinned to 24 LTS via `.nvmrc`.

## Consequences

- Vercel auto-detects npm via `package-lock.json`; no install-command override needed.
- If a monorepo is later required, npm workspaces is sufficient — no migration to pnpm needed.
