import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'export', // Disabled for learning system - dynamic routes and API routes require server rendering
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
