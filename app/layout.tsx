import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ben Chan Violin",
  description: "Ben Chan Violin teaching archive and Stand Partner first-turn guide.",
  icons: {
    icon: "data:,",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
