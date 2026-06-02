import gsap from "gsap";

import { prefersReducedMotion } from "./register";

type TweenVars = gsap.TweenVars;

/** gsap.from with preset vars; skips animation when reduced motion is preferred. */
export function tweenFrom(
  targets: gsap.TweenTarget,
  fromVars: TweenVars,
  toVars?: TweenVars,
): gsap.core.Tween {
  if (prefersReducedMotion()) {
    return gsap.set(targets, { ...fromVars, ...toVars, opacity: toVars?.opacity ?? 1 });
  }
  return gsap.from(targets, { ...fromVars, ...toVars });
}

/** gsap.to with preset vars; skips animation when reduced motion is preferred. */
export function tweenTo(targets: gsap.TweenTarget, vars: TweenVars): gsap.core.Tween {
  if (prefersReducedMotion()) {
    return gsap.set(targets, vars);
  }
  return gsap.to(targets, vars);
}

/** Kill all tweens on targets (use in useGSAP cleanup). */
export function killTweens(targets: gsap.TweenTarget): void {
  gsap.killTweensOf(targets);
}
