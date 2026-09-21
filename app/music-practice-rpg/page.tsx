import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Music Practice RPG — Discontinued — Ben Chan Violin",
  description: "Music Practice RPG has been discontinued as a product. The app is no longer available.",
  alternates: {
    canonical: "https://benchanviolin.com/music-practice-rpg",
  },
};

export default function MusicPracticeRpgPage() {
  return (
    <div className="text-page">
      <a className="skip" href="#main">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main">
        <article className="card">
          <p className="eyebrow">Music Practice RPG</p>
          <h1>Music Practice RPG has been discontinued as a product.</h1>
          <p className="lede">
            The app is no longer available. This page remains as a notice for anyone following an older link.
          </p>
          <div className="actions">
            <a className="btn" href="/">Back to home</a>
            <a className="btn secondary" href="/library">Search the library</a>
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
