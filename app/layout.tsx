import type { Metadata } from "next";
import { ConsentBanner } from "@/components/ConsentBanner";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ben Chan Violin",
  description:
    "Ben Chan's violin teaching archive, technique library, YouTube work, public learning experiments, and cross-domain practice notes.",
  metadataBase: new URL("https://benchanviolin.com"),
  openGraph: {
    title: "Ben Chan Violin",
    description:
      "Violin teaching, technique library routes, YouTube performances, public learning experiments, and cross-domain practice notes.",
    url: "https://benchanviolin.com",
    siteName: "Ben Chan Violin",
    type: "website"
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [{ rel: "icon", url: "/icon-512.png", sizes: "512x512", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://benchanviolin.com/#website",
        name: "Ben Chan Violin",
        url: "https://benchanviolin.com",
        description:
          "Ben Chan's violin teaching archive, technique library, YouTube work, public learning experiments, and cross-domain practice notes.",
      },
      {
        "@type": "Person",
        "@id": "https://benchanviolin.com/#ben-chan",
        name: "Ben Chan",
        url: "https://benchanviolin.com",
        jobTitle: "Violinist, teacher, parent, and CTO",
        sameAs: ["https://youtube.com/benchanviolin"],
        knowsAbout: [
          "Violin teaching",
          "Violin practice",
          "Violin technique",
          "Public learning",
          "Cross-domain practice",
        ],
      },
    ],
  };

  return (
    <html lang="en">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }} />
        {children}
        <GoogleAnalytics />
        <ConsentBanner />
      </body>
    </html>
  );
}
