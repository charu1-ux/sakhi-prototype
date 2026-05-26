import type { NextConfig } from "next";

import { JOBS_APP_BASE_PATH } from "./src/lib/jobs-app-base-path";

const nextConfig: NextConfig = {
  output: "export",
  basePath: JOBS_APP_BASE_PATH,
  trailingSlash: true,
  images: { unoptimized: true },
};
export default nextConfig;
