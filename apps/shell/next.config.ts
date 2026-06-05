import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  cacheOnNavigation: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development" || !!process.env.CAPACITOR,
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
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
  async rewrites() {
    if (process.env.NODE_ENV !== "development") return [];
    return [
      // ── Jobs ──────────────────────────────────────────────────────────
      {
        source: "/jobs/design-prototype",
        destination: "http://localhost:3003/jobs/design-prototype/",
      },
      {
        source: "/jobs/design-prototype/",
        destination: "http://localhost:3003/jobs/design-prototype/",
      },
      {
        source: "/jobs/design-prototype/microlearning",
        destination: "http://localhost:3003/jobs/design-prototype/microlearning/",
      },
      {
        source: "/jobs/design-prototype/microlearning/",
        destination: "http://localhost:3003/jobs/design-prototype/microlearning/",
      },
      {
        source: "/jobs/design-prototype/microlearning/creator",
        destination: "http://localhost:3003/jobs/design-prototype/microlearning/creator/",
      },
      {
        source: "/jobs/design-prototype/microlearning/creator/",
        destination: "http://localhost:3003/jobs/design-prototype/microlearning/creator/",
      },
      {
        source: "/jobs/design-prototype/:path*",
        destination: "http://localhost:3003/jobs/design-prototype/:path*",
      },
      { source: "/jobs/index.html", destination: "http://localhost:3003/jobs/" },
      { source: "/jobs/zero/:path*", destination: "http://localhost:3003/jobs/zero/:path*" },
      { source: "/jobs/shared/:path*", destination: "http://localhost:3003/jobs/shared/:path*" },
      { source: "/jobs/fonts/:path*", destination: "http://localhost:3003/jobs/fonts/:path*" },
      { source: "/jobs/assets/:path*", destination: "http://localhost:3003/jobs/assets/:path*" },
      { source: "/jobs/_next/:path*", destination: "http://localhost:3003/jobs/_next/:path*" },
      { source: "/jobs/:file*.html", destination: "http://localhost:3003/jobs/:file*.html" },

      // ── Health ────────────────────────────────────────────────────────
      { source: "/health/", destination: "http://localhost:3004/health/" },
      { source: "/health/:path*", destination: "http://localhost:3004/health/:path*" },

      // ── Astro ─────────────────────────────────────────────────────────
      { source: "/astro/", destination: "http://localhost:3002/astro/" },
      { source: "/astro/:path*", destination: "http://localhost:3002/astro/:path*" },

      // ── Commerce ──────────────────────────────────────────────────────
      { source: "/commerce/", destination: "http://localhost:3006/commerce/" },
      { source: "/commerce/:path*", destination: "http://localhost:3006/commerce/:path*" },

      // ── Finance ───────────────────────────────────────────────────────
      { source: "/finance/", destination: "http://localhost:3005/finance/" },
      { source: "/finance/:path*", destination: "http://localhost:3005/finance/:path*" },

      // ── News ──────────────────────────────────────────────────────────
      { source: "/news/", destination: "http://localhost:3001/news/" },
      { source: "/news/:path*", destination: "http://localhost:3001/news/:path*" },
    ];
  },
};

export default withSerwist(nextConfig);
