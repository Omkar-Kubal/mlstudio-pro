import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // Enabled for static hosting on Firebase
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
