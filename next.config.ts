import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/render": ["./node_modules/playwright-core/browsers.json"],
  },
};

export default nextConfig;
