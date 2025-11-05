import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost'
      },
      {
        protocol: 'https',
        hostname: 'metashift.xyz'
      },
      {
        protocol: 'https',
        hostname: '*.replit.app'
      },
      {
        protocol: 'https',
        hostname: '*.replit.dev'
      },
      {
        protocol: 'https',
        hostname: '*.vercel.app'
      }
    ]
  }
};

export default nextConfig;
