import type { NextConfig } from "next";

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
      { source: "/stand-partner.html", destination: "/stand-partner" },
      { source: "/privacy.html", destination: "/privacy" },
      { source: "/terms.html", destination: "/terms" },
      { source: "/tools/clip-builder.html", destination: "/tools/clip-builder" },
    ];
  },
};

export default nextConfig;
