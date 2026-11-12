import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Enable React strict mode for better error detection
  reactStrictMode: true,
};

export default nextConfig;