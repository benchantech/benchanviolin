import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
];

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/archive", destination: "https://youtube.com/benchanviolin", permanent: false },
      { source: "/archive.html", destination: "https://youtube.com/benchanviolin", permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/:path*.html",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
      {
        source: "/",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
      {
        source: "/styles.css",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      { source: "/library.html", destination: "/library" },
      { source: "/q=:q", destination: "/library?q=:q" },
      { source: "/privacy.html", destination: "/privacy" },
      { source: "/terms.html", destination: "/terms" },
      { source: "/cookies.html", destination: "/cookies" },
      { source: "/accessibility.html", destination: "/accessibility" },
      { source: "/ai-disclosure.html", destination: "/ai-disclosure" },
      { source: "/copyright.html", destination: "/copyright" },
      { source: "/contact.html", destination: "/contact" },
      { source: "/tools/clip-builder.html", destination: "/tools/clip-builder" },
    ];
  },
};

export default nextConfig;
