import type { NextConfig } from "next";
import { readCatalogConfig } from "./src/lib/catalog-api/config";

// Fail fast, with a clear message, if the catalogue source is misconfigured. Values are never echoed.
readCatalogConfig();

const isDev = process.env.NODE_ENV === "development";

/**
 * Baseline Content Security Policy.
 *
 * The storefront is prerendered (Cache Components), so a per-request nonce is not available and
 * Next.js emits inline bootstrap scripts; `'unsafe-inline'` is therefore required for scripts and
 * styles. Everything else is locked to the site's own origin: no third-party script/style/image/
 * connect origins, no plugins, no framing, no base-tag or form-target hijacking. Development adds
 * `'unsafe-eval'` and websockets for React debugging and HMR only.
 * Revisit with nonces if the shell becomes dynamically rendered. This is not deployment approval.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
