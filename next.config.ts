import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        // Supabase storage host for this project (news images, leader photos, documents)
        protocol: 'https',
        hostname: 'qypynubfemtvczanrics.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
    ],
  },
  // NOTE: Next.js 16's NextConfig type does not support a top-level `serverActions` option.
  // If you need to control body size for server actions or routes, configure it per route
  // (e.g. via Route Handlers or middleware) instead of here.
};

export default withNextIntl(nextConfig);
