import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "mymroaetydlwryuqsvbn.supabase.co",
        port: "",
        // Mengizinkan semua gambar di dalam bucket storage Supabase Anda
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  // Opsional: Jika Anda menggunakan Turbopack dan ada isu dengan modul tertentu
  /* experimental: {
    turbo: {
      // rules dan konfigurasi turbo lainnya
    }
  } */
};

export default nextConfig;