import gsap from "gsap";

let initialized = false;

/** Whether the user prefers reduced motion (SSR-safe: false on server). */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * One-time GSAP setup: global config and reduced-motion handling.
 * Safe to call multiple times; runs once per client session.
 */
export function initGSAP(): typeof gsap {
  if (typeof window === "undefined") return gsap;

  if (!initialized) {
    gsap.config({ nullTargetWarn: false });

    const applyReducedMotion = () => {
      gsap.globalTimeline.timeScale(prefersReducedMotion() ? 0.001 : 1);
    };

    applyReducedMotion();

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    mq.addEventListener("change", applyReducedMotion);

    initialized = true;
  }

  return gsap;
}
