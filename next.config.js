/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable React strict mode to prevent Socket.io double-mount issues in development
  reactStrictMode: false,

  // Disable default Next.js server since we're using a custom server
  // This is required for Socket.io integration

  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Enable TypeScript and ESLint during builds
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Webpack configuration for custom server
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on `fs` module
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

  // Headers configuration for WebSocket support
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Experimental features
  experimental: {
    // Enable optimizations
    optimizePackageImports: ['framer-motion', 'zustand'],
  },

  // Production optimizations
  poweredByHeader: false,
  compress: true,

  // Custom output directory (optional)
  distDir: '.next',
};

module.exports = nextConfig;
