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
    ];
  },
  // In `next dev`, proxy /astro/*.html requests to the astro dev server so
  // direct HTML navigation works without a build. Static export ignores
  // rewrites, so this only affects dev.
  async rewrites() {
    if (process.env.NODE_ENV !== "development") return [];
    return [
      {
        source: "/astro/:path*.html",
        destination: "http://localhost:3002/astro/:path*.html",
      },
      {
        source: "/astro/:path*",
        destination: "http://localhost:3002/astro/:path*",
      },
    ];
  },
};

export default withSerwist(nextConfig);
