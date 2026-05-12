import { motion } from "@intelligence/tokens";

/**
 * GSAP preset library. Every animation in the app should compose one of these
 * presets so durations and easings stay token-driven. Override surgically per
 * call-site; never inline raw numbers.
 */

export const fadeIn = {
  opacity: 0,
  duration: motion.duration.base,
  ease: motion.ease.standard,
} as const;

export const slideUp = {
  y: 16,
  opacity: 0,
  duration: motion.duration.base,
  ease: motion.ease.emphasized,
} as const;

export const slideDown = {
  y: -16,
  opacity: 0,
  duration: motion.duration.base,
  ease: motion.ease.emphasized,
} as const;

export const scaleIn = {
  scale: 0.96,
  opacity: 0,
  duration: motion.duration.fast,
  ease: motion.ease.emphasized,
} as const;

export const stagger = {
  amount: motion.duration.slow,
  from: "start" as const,
};

export const springy = {
  duration: motion.duration.slow,
  ease: motion.ease.bounce,
} as const;
