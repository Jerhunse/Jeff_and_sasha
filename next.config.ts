import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Netlify uses its own Next.js plugin, so we don't need standalone output
  // Remove 'standalone' output for Netlify deployments
  // output: 'standalone', // Commented out for Netlify
};

export default nextConfig;
