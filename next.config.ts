import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [60, 70, 75, 85],
    deviceSizes: [360, 390, 414, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [32, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mymroaetydlwryuqsvbn.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "www.lodjisvarga.com",
      },
    ],
  },
};

export default nextConfig;
