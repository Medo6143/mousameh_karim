import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static optimization where possible
  // Vercel supports both static and dynamic rendering
  images: {
    unoptimized: true, // Required for static export or when not using next/image optimization
  },
  // Ensure trailing slashes for better SEO and routing consistency
  trailingSlash: false,
  // Strict mode for React (recommended)
  reactStrictMode: true,
  // Environment variables that should be available at build time
  env: {
    // Firebase config uses NEXT_PUBLIC_ vars from .env.local
  },
  // Headers for security (optional but recommended)
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
