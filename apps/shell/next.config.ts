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
  // No dev rewrites needed — all vertical routes are served directly by the shell.
  async rewrites() {
    return [];
  },
};

export default withSerwist(nextConfig);
