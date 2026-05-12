/**
 * Typed mirror of src/styles/tokens.css for JS consumers (GSAP presets, motion math,
 * inline transform calculations). Keep the two files in sync — values here MUST
 * match the CSS source of truth.
 */

export const motion = {
  duration: {
    fast: 0.15,
    base: 0.22,
    slow: 0.36,
    deliberate: 0.6,
  },
  ease: {
    standard: "power2.out",
    emphasized: "power3.out",
    bounce: "back.out(1.7)",
  },
} as const;

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  full: 9999,
} as const;

export type MotionDurationKey = keyof typeof motion.duration;
export type MotionEaseKey = keyof typeof motion.ease;
