import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  cacheOnNavigation: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development" || !!process.env.CAPACITOR,
});

const isPagesDeployment = process.env.GITHUB_PAGES === "true";

// Single-feature isolated builds for the user-validation study. When
// SAKHI_FEATURE is set ("health" | "period" | "mood") the shell is deployed to
// its own repo (sakhi-<feature>) exposing ONLY that one feature — the shared
// landing and the other two features return 404. basePath must equal the repo
// name for GitHub Pages. When unset, the normal combined site is unchanged.
const sakhiFeature = process.env.SAKHI_FEATURE ?? "";
const basePath = sakhiFeature
  ? `/sakhi-${sakhiFeature}`
  : isPagesDeployment
    ? "/sakhi-prototype"
    : "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  turbopack: {},
  basePath,
  assetPrefix: basePath ? `${basePath}/` : "",
  trailingSlash: true,
  images: { unoptimized: true },
  // Exposes basePath to client code. Needed because Next only auto-prepends
  // basePath to the router / next/link — NOT to string src paths for public/
  // assets (images are unoptimized, so next/image doesn't prefix them either).
  // Use BASE_PATH from "@/lib/base-path" for any public/ asset referenced as a
  // string. Do NOT use it for navigation paths — the router prefixes those.
  env: { NEXT_PUBLIC_BASE_PATH: basePath, NEXT_PUBLIC_SAKHI_FEATURE: sakhiFeature },
  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
  },
  // Dev-only: redirect canonical index.html paths so the design-prototype
  // route is served correctly. Static export ignores these.
  async redirects() {
    return [
      // Cursor IDE browser preview requests this; redirect to home.
      { source: "/viewer.html", destination: "/", permanent: false },
      {
        source: "/jobs/old/index.html",
        destination: "/jobs/old/",
        permanent: false,
      },
      {
        source: "/jobs/new/index.html",
        destination: "/jobs/new/",
        permanent: false,
      },
    ];
  },
  // Dev-only: proxy all vertical app routes through shell (port 3000) so
  // every URL lives on the same origin. iframes and <Link> use relative
  // paths; no cross-origin CORS issues in the browser.
  //
  // Note: Next.js file-system routes take priority over rewrites, so the
  // vertical "frame" pages (apps/shell/src/app/health/page.tsx etc.) are
  // still served for the bare /health/ route. The rewrites below cover
  // the specific paths those pages embed in iframes (index.html, assets).
  // No dev rewrites needed — all vertical routes are served directly by the shell.
  async rewrites() {
    return [];
  },
};

export default withSerwist(nextConfig);
