import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /**
     * Custom loader handles URL construction for all <Image> components.
     * See src/lib/utils/image-loader.ts for routing logic:
     *   - Supabase public URLs  → appends width + quality transform params
     *   - Local assets (/...)   → appends ?w=<width>
     *   - External URLs         → appends ?w=<width>
     *
     * remotePatterns is still enforced by Next.js as a security allowlist
     * even when a custom loader is in use.
     *
     * Note: `formats` (avif/webp) only applies to the built-in optimizer,
     * not to custom loaders, so it is intentionally omitted here.
     */
    loader: "custom",
    loaderFile: "./src/lib/utils/image-loader.ts",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "mymroaetydlwryuqsvbn.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;