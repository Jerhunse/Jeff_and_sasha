import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployments
  // This creates a minimal Node.js server for production
  output: 'standalone',
};

export default nextConfig;
