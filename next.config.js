/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: process.env.NEXT_DIST_DIR || '.next',
  swcMinify: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  compress: true,
  poweredByHeader: false,
  experimental: {
    outputFileTracingExcludes: { '*': ['./.demo-access/**/*', './private-demos/artifacts/**/*', './private-demos/bundles/**/*'] },
  },
  rewrites: async () => [{
    source: '/visit/:code/content/:token/:path*',
    destination: '/api/visit-content/:code/:token/:path*',
  }],
  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
