/**
 * Single-feature isolation for the user-validation study.
 *
 * When NEXT_PUBLIC_SAKHI_FEATURE is set at build time (via SAKHI_FEATURE in the
 * per-repo GitHub Pages workflow) the deployment is a sealed single-feature app:
 *   - the site root ("/") redirects into that one feature
 *   - the shared landing + the other two features return 404 (isBlocked)
 *   - the back-to-landing button and cross-feature deep links are hidden
 *
 * When unset (the normal combined sakhi-prototype build) nothing changes.
 */
export type SakhiFeature = "health" | "period" | "mood";

const FEATURE_ROUTES: Record<SakhiFeature, string> = {
  health: "/womens-health/health-content",
  period: "/womens-health/period-tracker",
  mood: "/womens-health/mood-tracker",
};

/** The active isolated feature, or null for the normal combined build. */
export const SAKHI_FEATURE = (process.env.NEXT_PUBLIC_SAKHI_FEATURE || null) as SakhiFeature | null;

/** True when this build is a sealed single-feature deployment. */
export const isIsolated = SAKHI_FEATURE !== null;

/** Home route for the active isolated feature (redirect + entry target). */
export const featureHome = SAKHI_FEATURE ? FEATURE_ROUTES[SAKHI_FEATURE] : null;

/**
 * True when `feature` must be BLOCKED in the current build — i.e. this is an
 * isolated build for a *different* feature (or any isolated build, for the
 * shared "landing"). Pages call `notFound()` at the top of render when true.
 */
export function isBlocked(feature: SakhiFeature | "landing"): boolean {
  if (!isIsolated) return false;
  return feature !== SAKHI_FEATURE;
}
