import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@sparticuz/chromium"],
  outputFileTracingIncludes: {
    "/api/render": [
      "./node_modules/playwright-core/browsers.json",
      "./node_modules/@sparticuz/chromium/bin/**",
    ],
  },
};

export default nextConfig;