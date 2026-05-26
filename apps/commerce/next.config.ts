import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  // basePath so static assets resolve under /commerce when merged into shell out/
  basePath: "/commerce",
};
export default nextConfig;
