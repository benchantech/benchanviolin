import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata = {
  title: "Cookie Notice — Ben Chan Violin",
};

export default function CookieNoticePage() {
  return (
    <div className="text-page">
      <SiteHeader />
      <main>
        <article className="card">
          <p className="eyebrow">Cookie Notice</p>
          <h1 tabIndex={-1}>How this site uses cookies</h1>
          <p className="lede">
            BenChanViolin.com uses cookies and similar technologies for Google Analytics measurement when analytics is
            enabled. Embedded YouTube videos may also use cookies or similar technologies when loaded or played.
          </p>
          <h3>Analytics cookies</h3>
          <p className="helper">
            Google Analytics 4 helps measure page views, library searches, routing outcomes, result clicks, and clip
            starts. These measurements help improve the educational archive and deterministic routing.
          </p>
          <h3>Purpose and retention</h3>
          <p className="helper">
            Analytics cookies help distinguish visits and understand aggregate behavior. Google controls the exact cookie
            names and expiration periods. GA4 property data retention should be reviewed in the Google Analytics console.
          </p>
          <h3>Consent</h3>
          <p className="helper">
            Analytics storage is denied by default unless a visitor allows analytics through the site’s cookie notice.
            The site stores that choice in the browser so the banner does not need to appear on every page.
          </p>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
