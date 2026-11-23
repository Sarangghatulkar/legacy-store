import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allows loading product images from any external domain (Unsplash, Pull&Bear, CDNs, Supabase, etc.)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
