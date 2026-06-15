const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost'],
    },
  },
  images: {
    domains: ['localhost'],
  },
  webpack: (config) => {
    // Fix for leaflet in SSR
    config.resolve.fallback = { fs: false };
    return config;
  },
};

module.exports = withNextIntl(nextConfig);
