import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {
    enabled: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'nexaforges.me'],
    },
  },
};

export default nextConfig;
