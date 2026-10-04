import type { NextConfig } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

// Extract hostname for CSP
let apiHostname = "localhost";
try { apiHostname = new URL(API_URL).hostname; } catch {}

const config: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: `${API_URL}/auth/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  pageExtensions: ["ts", "tsx", "mdx"],

  // SEC-02: Security headers on all Next.js responses
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options",    value: "nosniff"                          },
          { key: "X-Frame-Options",            value: "SAMEORIGIN"                       },
          { key: "Referrer-Policy",            value: "strict-origin-when-cross-origin"  },
          { key: "Permissions-Policy",         value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-eval for Three.js shader compilation
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              `connect-src 'self' ${API_URL} https://openrouter.ai https://api.cloudinary.com`,
              "img-src 'self' data: https://res.cloudinary.com https://images.unsplash.com blob:",
              "worker-src blob:",
              // Was "frame-src 'none'" — that silently blocked every iframe
              // on the site (the browser refuses the request before the
              // target's own X-Frame-Options is ever checked), which broke
              // the live-demo iframe system entirely: ProjectDemo's
              // "blocked" state would trigger for every project, not just
              // ones that actually restrict embedding. Live demo URLs are
              // arbitrary per-project, so an https-wide allowance (rather
              // than a fixed host list) is what actually lets the feature
              // work; the iframes themselves stay locked down via the
              // `sandbox` attribute already set on each <iframe>. localhost
              // is also allowed so demo projects still under local dev can
              // be previewed.
              "frame-src https: http://localhost:*",
              "object-src 'none'",
            ].join("; "),
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default config;
