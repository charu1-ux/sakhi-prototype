import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  // basePath ensures all /_next/… asset URLs are prefixed with /health
  // so the built output can be embedded inside the shell at /health/.
  basePath: "/health",
};
export default nextConfig;
