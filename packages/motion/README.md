# @intelligence/motion

Shared GSAP setup for all vertical apps.

## Usage

```tsx
"use client";

import { useRef } from "react";
import { fadeIn, gsap, killTweens, tweenFrom, useGSAP } from "@/lib/motion";

export function AnimatedBlock() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      tweenFrom(ref.current, fadeIn);
    },
    { scope: ref },
  );

  return <div ref={ref}>…</div>;
}
```

Root layouts must wrap children with `<GsapProvider>` (already wired in each app).

## Exports

| Export                               | Purpose                        |
| ------------------------------------ | ------------------------------ |
| `gsap`, `useGSAP`                    | Core GSAP + React hook         |
| `GsapProvider`                       | One-time client init (layouts) |
| `initGSAP`, `prefersReducedMotion`   | Manual init / a11y checks      |
| `fadeIn`, `slideUp`, `scaleIn`, …    | Token-driven presets           |
| `tweenFrom`, `tweenTo`, `killTweens` | Preset-aware helpers           |
