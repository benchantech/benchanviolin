import type { Metadata } from "next";
import { ConsentBanner } from "@/components/ConsentBanner";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ben Chan Violin",
  description:
    "Ben Chan's violin teaching archive, parent-support answers, and AI-aware guidance for preserving teacher continuity between lessons.",
  metadataBase: new URL("https://benchanviolin.com"),
  openGraph: {
    title: "Ben Chan Violin",
    description:
      "Violin teaching, parent-support answers, and AI-aware guidance for the space between lessons.",
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
  return (
    <html lang="en">
      <body>
        {children}
        <GoogleAnalytics />
        <ConsentBanner />
      </body>
    </html>
  );
}
