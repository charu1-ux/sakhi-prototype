import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  output: "export",
  basePath: "/finance",
  trailingSlash: true,
  images: { unoptimized: true },
};
export default nextConfig;
