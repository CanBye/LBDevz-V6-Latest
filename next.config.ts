import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Content Security Policy.
// NOTE/ASSUMPTION: This app relies on inline styles (framer-motion, tailwind,
// inline <style>) and Next.js inline bootstrap scripts, and is largely
// statically rendered, so we use 'unsafe-inline' rather than a nonce-based CSP
// (which would force every page into dynamic rendering). 'unsafe-eval' is only
// allowed in development (React dev tooling). img-src allows https/data/blob to
// support user avatars and remote product/blog images. connect-src allows the
// external services the app calls (Cloudflare Turnstile, ip-api, Discord).
const cspHeader = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://challenges.cloudflare.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data: https:",
  "font-src 'self' data:",
  "frame-src https://challenges.cloudflare.com",
  "connect-src 'self' https://challenges.cloudflare.com https://discord.com http://ip-api.com https://ip-api.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: cspHeader },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  // HSTS only meaningfully applies over HTTPS; harmless over HTTP. Enable in prod.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: [
    "postgres",
    "pg",
    "drizzle-orm",
    "@auth/drizzle-adapter",
    "@lbdevz/db",
    "bcryptjs",
  ],
  experimental: {
    optimizePackageImports: ["@iconify/react", "framer-motion"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 3600,
  },
  compress: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
