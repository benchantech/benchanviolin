import { SiteHeader } from "@/components/SiteHeader";

export const metadata = {
  title: "Privacy Policy — Ben Chan Violin",
};

export default function PrivacyPage() {
  return (
    <div className="text-page">
      <SiteHeader />
      <main>
        <article className="card">
          <p className="eyebrow">Privacy &amp; scope</p>
          <h1 tabIndex={-1}>What Stand Partner does with your routing choices</h1>
          <p className="lede">
            Stand Partner choices are processed by JavaScript in your browser to select a resource from a static routing
            map. Those routing choices are not stored.
          </p>
          <h3>Stand Partner does not</h3>
          <ul className="helper">
            <li>create an account;</li>
            <li>send routing selections to a server;</li>
            <li>use cookies, browser storage, analytics, or an AI API;</li>
            <li>accept uploads, recordings, screenshots, or free-text personal information;</li>
            <li>remember prior visits.</li>
          </ul>
          <h3>Substack link</h3>
          <p className="helper">
            The homepage links to BenChanViolin on Substack. If you subscribe there, Substack’s own service and privacy
            practices apply.
          </p>
          <h3>Important boundaries</h3>
          <p className="helper">
            Stand Partner routes toward educational materials. It is not a diagnostic tool, medical service, substitute
            for a teacher, or promise of a particular outcome. For pain, injury, or urgent concerns, seek appropriately
            qualified help.
          </p>
          <h3>External services</h3>
          <p className="helper">
            When you load an embedded or linked YouTube video, YouTube’s own service and privacy practices apply. This
            starter uses youtube-nocookie.com where possible, but playing a video is still an interaction with YouTube.
          </p>
          <p className="helper">
            This page is a product-design starting point, not legal advice. Review it against your actual deployment and
            any future analytics, newsletter forms, embeds, or platform changes.
          </p>
          <div className="buttons">
            <a className="btn" href="./">
              Back to site
            </a>
          </div>
        </article>
      </main>
    </div>
  );
}
