/** @type {import('next').NextConfig} */

const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_REGION === "eu" ? "eu" : "us";

// Content Security Policy. Everything loads from our own origin except:
// - the MediaPipe pose model (storage.googleapis.com)
// - official SLS demo videos (youtube-nocookie.com)
// - admin-uploaded signal images (Vercel Blob)
// Analytics go through our own /ingest proxy. 'unsafe-inline' for scripts is
// needed by Next's inline bootstrap without nonces; 'wasm-unsafe-eval' lets the
// pose detector's WebAssembly run.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com",
  "font-src 'self' data:",
  "connect-src 'self' https://storage.googleapis.com",
  "media-src 'self' blob:",
  "worker-src 'self' blob:",
  "frame-src https://www.youtube-nocookie.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Camera only for our own pages (Perform mode); nothing else
  { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig = {
  poweredByHeader: false,
  images: {
    // Signal images uploaded via the admin page live in Vercel Blob
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Never cache API responses in shared caches
      { source: "/api/:path*", headers: [{ key: "Cache-Control", value: "no-store" }] },
    ];
  },
  // "Practice" was renamed "Test"; keep old links and bookmarks working
  async redirects() {
    return [
      { source: "/practice", destination: "/test", permanent: true },
      {
        source: "/practice/radio",
        has: [{ type: "query", key: "tab", value: "(?<tab>prowords|phonetic|spell|calls)" }],
        destination: "/test/radio/:tab",
        permanent: true,
      },
      { source: "/practice/:path*", destination: "/test/:path*", permanent: true },
    ];
  },
  // Anonymous analytics are sent via our own domain (see src/lib/analytics.ts)
  async rewrites() {
    return [
      { source: "/ingest/static/:path*", destination: `https://${posthogHost}-assets.i.posthog.com/static/:path*` },
      { source: "/ingest/:path*", destination: `https://${posthogHost}.i.posthog.com/:path*` },
    ];
  },
  skipTrailingSlashRedirect: true, // required by PostHog's proxy
};

export default nextConfig;
