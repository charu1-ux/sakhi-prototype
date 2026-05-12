# Detailed Design Document — _Feature name_

- **Author:** _your name_
- **Status:** Draft / Reviewed / Implemented
- **Linked TDD:** `docs/cowork/tdd-_feature_.md`

## 1. Component map

List every component (atom / molecule / organism / template) touched or created.
Cite the atomic-design row in `docs/design-system/atomic.md`.

| Atomic level | Component | New / Updated | Storybook |
| ------------ | --------- | ------------- | --------- |
| atom         | …         | new           | required  |

## 2. Data contracts

Type-level shape for every props / API boundary.

```ts
// example
export interface ChatMessage { … }
```

## 3. State machine / flow

Mermaid state diagram for any non-trivial UI flow.

## 4. Tokens added / changed

| Token name | Light | Dark | Reason |
| ---------- | ----- | ---- | ------ |
|            |       |      |        |

## 5. Motion

Which presets in `@/lib/motion` apply, and any net-new presets that need adding.

## 6. Accessibility

Roles, labelling, keyboard map, focus-trap behaviour, reduced-motion.

## 7. Performance budget

Initial JS / image weight, LCP target.

## 8. Telemetry

Events, properties, alerting.
