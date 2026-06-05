import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  output: "export",
  basePath: "/news",
  trailingSlash: true,
  images: { unoptimized: true },
};
export default nextConfig;
