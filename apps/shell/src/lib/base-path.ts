/**
 * App basePath ("/sakhi-prototype" on GitHub Pages, "" otherwise).
 *
 * Use ONLY for public/ assets referenced as string src/href (e.g.
 * `<img src={withBasePath("/foo.png")} />`). Next.js does NOT prefix these
 * because images are unoptimized. Do NOT use for navigation — the router and
 * next/link already prepend basePath, so this would double it.
 *
 * Value comes from `env.NEXT_PUBLIC_BASE_PATH` in next.config.ts.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const withBasePath = (path: string): string => `${BASE_PATH}${path}`;
