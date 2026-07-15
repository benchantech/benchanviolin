import StandPartnerApp from "@/components/StandPartnerApp";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata = {
  title: "Stand Partner — Ben Chan Violin",
  description: "Stand Partner — a private, deterministic violin resource router.",
};

export default function StandPartnerPage() {
  return (
    <div className="stand-page">
      <a className="skip" href="#app">
        Skip to Stand Partner
      </a>
      <SiteHeader />
      <main>
        <section className="stand-intro" aria-labelledby="stand-page-title">
          <div>
            <p className="kicker">Private field guide</p>
            <h1 id="stand-page-title">Stand Partner</h1>
            <p className="lede">Turn to the right page for violin.</p>
            <p className="meta-line">No account. No AI. Routing choices stay in this browser.</p>
          </div>
          <figure className="media-slot compact">
            <div aria-hidden="true">
              <span>Image pending</span>
              <small>Teaching still</small>
            </div>
          </figure>
        </section>
        <section id="app" aria-live="polite">
          <StandPartnerApp />
        </section>
        <p className="archive-escape">
          <a className="text-link" href="https://youtube.com/benchanviolin">
            Watch Ben on YouTube →
          </a>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
