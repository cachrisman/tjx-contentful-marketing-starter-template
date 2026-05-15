import type { NextConfig } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
  env: {
    NEXT_PUBLIC_SITE_URL: siteUrl,
    NEXT_PUBLIC_CONTENTFUL_SPACE_ID: process.env.CONTENTFUL_SPACE_ID ?? '',
    /** Used client-side for Preview plugin “open in Contentful” links (must match GraphQL). */
    NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT: process.env.CONTENTFUL_ENVIRONMENT?.trim() || 'master',
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.ctfassets.net', pathname: '/**' },
      { protocol: 'https', hostname: 'images.eu.ctfassets.net', pathname: '/**' },
      { protocol: 'https', hostname: 'downloads.ctfassets.net', pathname: '/**' },
    ],
    deviceSizes: [320, 420, 768, 1024, 1200, 1600],
  },
  async headers() {
    const securityHeaders = [
      { key: 'X-DNS-Prefetch-Control', value: 'on' },
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
      },
      // Omit X-Frame-Options so Contentful Preview can iframe the site; rely on CSP frame-ancestors.
      {
        key: 'Content-Security-Policy',
        value:
          "frame-ancestors 'self' https://app.contentful.com https://app.eu.contentful.com",
      },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-XSS-Protection', value: '1; mode=block' },
      { key: 'Referrer-Policy', value: 'no-referrer' },
    ];

    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
