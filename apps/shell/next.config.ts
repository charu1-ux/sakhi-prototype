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
  // In `next dev`, redirect /health/index.html → /health so the dev iframe
  // page is served. Static export ignores redirects, so this is dev-only.
  async redirects() {
    return [
      {
        source: "/health/index.html",
        destination: "/health",
        permanent: false,
      },
      {
        source: "/astro/index.html",
        destination: "/astro",
        permanent: false,
      },
      {
        source: "/commerce/index.html",
        destination: "/commerce",
        permanent: false,
      },
      {
        source: "/jobs/design-prototype/index.html",
        destination: "/jobs/design-prototype/",
        permanent: false,
      },
    ];
  },
  // Dev: Jobs React hub + bundles are served by @intelligence/jobs (3003).
  async rewrites() {
    if (process.env.NODE_ENV !== "development") return [];
    return [
      {
        source: "/jobs/design-prototype",
        destination: "http://localhost:3003/jobs/design-prototype/",
      },
      {
        source: "/jobs/design-prototype/",
        destination: "http://localhost:3003/jobs/design-prototype/",
      },
      {
        source: "/jobs/_next/:path*",
        destination: "http://localhost:3003/jobs/_next/:path*",
      },
      {
        source: "/jobs/assets/:path*",
        destination: "http://localhost:3003/jobs/assets/:path*",
      },
    ];
  },
};

export default withSerwist(nextConfig);
