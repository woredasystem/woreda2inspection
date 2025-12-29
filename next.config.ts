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
        protocol: 'https',
        hostname: 'oblhonzlkflvoxqymmys.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'rngmreyszyrddskbzhmd.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
    ],
  },
  serverActions: {
    bodySizeLimit: '5mb',
  },
};

export default withNextIntl(nextConfig);
