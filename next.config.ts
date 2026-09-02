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
    value: "camera=(), microphone=(self), geolocation=(), payment=()",
  },
];

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/archive", destination: "https://youtube.com/benchanviolin", permanent: false },
      { source: "/archive.html", destination: "https://youtube.com/benchanviolin", permanent: false },
      {
        source: "/mprpg",
        destination: "https://studio.com/apps/benchanviolin/music-practice-rpg",
        permanent: true,
      },
      {
        source: "/music-practice-rpg",
        destination: "https://studio.com/apps/benchanviolin/music-practice-rpg",
        permanent: true,
      },
      {
        source: "/musicpracticerpg",
        destination: "https://studio.com/apps/benchanviolin/music-practice-rpg",
        permanent: true,
      },
      {
        source: "/rpg",
        destination: "https://studio.com/apps/benchanviolin/music-practice-rpg",
        permanent: true,
      },
      {
        source: "/vfp",
        destination: "https://studio.com/apps/benchanviolin/violin-for-parents",
        permanent: true,
      },
      {
        source: "/violin-for-parents",
        destination: "https://studio.com/apps/benchanviolin/violin-for-parents",
        permanent: true,
      },
      {
        source: "/violin-for-parent",
        destination: "https://studio.com/apps/benchanviolin/violin-for-parents",
        permanent: true,
      },
      {
        source: "/violinforparents",
        destination: "https://studio.com/apps/benchanviolin/violin-for-parents",
        permanent: true,
      },
      {
        source: "/parent",
        destination: "https://studio.com/apps/benchanviolin/violin-for-parents",
        permanent: true,
      },
      {
        source: "/vpb",
        destination: "/violin-pitch-builder",
        permanent: true,
      },
      {
        source: "/violinpitchbuilder",
        destination: "https://benchanviolin.com/violin-pitch-builder",
        permanent: true,
      },
      {
        source: "/pitch",
        destination: "https://benchanviolin.com/violin-pitch-builder",
        permanent: true,
      },
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
