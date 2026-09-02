import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Violin Pitch Builder Has Been Discontinued - Ben Chan Violin",
  description:
    "Violin Pitch Builder, an experimental Ben Chan Violin app for pitch practice, has been discontinued.",
  alternates: {
    canonical: "https://benchanviolin.com/violin-pitch-builder",
  },
  openGraph: {
    title: "Violin Pitch Builder Has Been Discontinued",
    description:
      "This particular pitch-practice app has been discontinued. Current Ben Chan Violin resources remain available through the library and parent pages.",
    url: "https://benchanviolin.com/violin-pitch-builder",
    siteName: "Ben Chan Violin",
    type: "website",
  },
};

export default function ViolinPitchBuilderPage() {
  return (
    <>
      <a className="skip" href="#main">
        Skip to status
      </a>
      <SiteHeader />
      <main id="main" className="parent-page">
        <section className="section parent-hero">
          <div>
            <p className="kicker">App status</p>
            <h1>Violin Pitch Builder has been discontinued.</h1>
            <p className="lede">
              This particular app is no longer available as an active Ben Chan Violin product. The experiment helped
              clarify where AI can support practice and where musical judgment needs a stronger source of truth.
            </p>
            <p className="signature-note">
              I am leaving this page in place so old links resolve cleanly instead of sending people to a dead or
              confusing destination. <span>- B.C.</span>
            </p>
            <div className="actions">
              <a className="btn" href="/library">
                Search the library
              </a>
              <a className="btn secondary" href="/parents">
                Help between lessons
              </a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
