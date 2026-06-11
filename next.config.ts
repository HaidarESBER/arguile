import type { NextConfig } from "next";
import createMDX from '@next/mdx';

const nextConfig: NextConfig = {
  // Add MDX page extensions
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],

  // The dev-tools badge defaults to bottom-left, exactly on top of the
  // support-chat launcher — move it to the top-right corner instead.
  // (Error badges ignore `devIndicators: false`, so positioning is the
  // only reliable way to keep them off the chat button. Dev-only setting.)
  devIndicators: { position: "top-right" },

  // Allow phones/tablets on the local network to load dev-server assets.
  // Without this, Next 16 blocks cross-origin /_next/* requests: the page's
  // server-rendered HTML appears but client components (chat launcher, age
  // gate, cookie banner) never hydrate. Dev-only setting.
  allowedDevOrigins: ["192.168.*", "10.*", "localhost", "127.0.0.1"],

  images: {
    // Enable Image Optimization API
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ldadposccfoxcjjhmwdj.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "ae-pic-a1.aliexpress-media.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ae01.alicdn.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ae03.alicdn.com",
        pathname: "/**",
      },
    ],
    // Allow SVG images (with security restrictions)
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Modern image formats (WebP/AVIF) for optimal compression
    formats: ['image/webp', 'image/avif'],
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    // Image sizes for different layouts
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Cache optimized images for 24h (source images are immutable URLs)
    minimumCacheTTL: 86400,
  },

  // Performance optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Experimental features for better performance
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['framer-motion'],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ];
  },
};

// Use string-based plugin names for Turbopack compatibility (Next.js 16)
const withMDX = createMDX({
  options: {
    remarkPlugins: ['remark-gfm', 'remark-frontmatter'],
    rehypePlugins: ['rehype-slug'],
  },
});

export default withMDX(nextConfig);
