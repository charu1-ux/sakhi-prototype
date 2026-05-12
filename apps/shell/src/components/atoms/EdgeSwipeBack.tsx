"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { impactLight } from "@/lib/haptics";

/** Left-edge zone (px) that activates the gesture */
const EDGE_ZONE = 28;
/** Horizontal travel (px) needed to fire router.back() */
const TRIGGER = 80;
/** Visual cap on how far the indicator pulls */
const MAX_PULL = 100;

/**
 * Renders an invisible overlay chevron that tracks a left-edge swipe.
 * Works in PWA/WebView contexts — no native Capacitor plugin needed.
 * If the sehat-saathi runtime exposes `window.__SS_BACK__()` it is called
 * preferentially, so health internal screens step back correctly.
 */
export function EdgeSwipeBack() {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef({ on: false, x0: 0, y0: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function show(y: number) {
      el!.style.transition = "none";
      el!.style.top = `${y}px`;
      el!.style.opacity = "0";
      el!.style.transform = "translateX(-8px) translateY(-50%) scale(0.5)";
    }

    function update(dx: number, y: number) {
      const pull = Math.min(Math.max(dx, 0), MAX_PULL);
      const progress = pull / TRIGGER;
      const scale = 0.5 + progress * 0.6;
      el!.style.top = `${y}px`;
      el!.style.opacity = String(Math.min(progress, 1));
      el!.style.transform = `translateX(${pull - 8}px) translateY(-50%) scale(${scale})`;
    }

    function hide(fired: boolean) {
      el!.style.transition = "opacity 200ms ease, transform 200ms ease";
      el!.style.opacity = "0";
      el!.style.transform = fired
        ? "translateX(40px) translateY(-50%) scale(0.8)"
        : "translateX(-8px) translateY(-50%) scale(0.5)";
    }

    const onStart = (e: TouchEvent) => {
      if (e.touches[0].clientX > EDGE_ZONE) return;
      drag.current = { on: true, x0: e.touches[0].clientX, y0: e.touches[0].clientY };
      show(e.touches[0].clientY);
    };

    const onMove = (e: TouchEvent) => {
      if (!drag.current.on) return;
      update(e.touches[0].clientX - drag.current.x0, e.touches[0].clientY);
    };

    const onEnd = (e: TouchEvent) => {
      if (!drag.current.on) return;
      drag.current.on = false;
      const dx = e.changedTouches[0].clientX - drag.current.x0;
      const dy = Math.abs(e.changedTouches[0].clientY - drag.current.y0);
      const fired = dx > TRIGGER && dy < dx * 1.2;
      hide(fired);
      if (fired) {
        impactLight();
        // Prefer the sehat-saathi runtime's own back handler when available
        // so health-internal screen transitions work correctly.
        const ssBack = (window as unknown as Record<string, unknown>).__SS_BACK__;
        if (typeof ssBack === "function") {
          (ssBack as () => void)();
        } else {
          router.back();
        }
      }
    };

    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, [router]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="bg-surface shadow-mid text-fg pointer-events-none fixed left-0 z-[9999] flex size-11 items-center justify-center rounded-full opacity-0"
      style={{ top: "50%", transform: "translateX(-8px) translateY(-50%) scale(0.5)" }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M15 18l-6-6 6-6"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
