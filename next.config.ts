import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  // Allow build to succeed even without DATABASE_URL
  // (public homepage is fully static and doesn't need DB)
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
};

export default nextConfig;
