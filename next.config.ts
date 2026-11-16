import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  generateBuildId: async () => "build-" + Date.now(),
  webpack: (config) => {
    config.cache = false;
    return config;
  },
};

export default nextConfig;
