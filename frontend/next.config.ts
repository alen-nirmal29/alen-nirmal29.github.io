import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  // Suppress hydration warnings in development
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
  // Suppress console warnings for hydration mismatches in development
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    
    // Handle chart libraries better
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },
  env: {
    DJANGO_API_URL: process.env.NEXT_PUBLIC_API_BASE,
  },
  // Experimental features for better chart support
  experimental: {
    esmExternals: 'loose',
  },
  // Transpile chart libraries
  transpilePackages: ['recharts'],
};

export default nextConfig;
