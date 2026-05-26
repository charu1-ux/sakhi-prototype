/**
 * Must match `basePath` in root `next.config.ts`.
 *
 * Public file URLs (`/assets/...`) are NOT prefixed automatically by `next/image` when
 * `images.unoptimized` is set, so callers must prepend this value.
 */
export const JOBS_APP_BASE_PATH = "/jobs" as const;
