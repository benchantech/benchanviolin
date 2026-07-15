import { SiteFooter } from "@/components/SiteFooter";
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
          <p className="eyebrow">Privacy Policy</p>
          <h1 tabIndex={-1}>Privacy Policy</h1>
          <p className="lede">
            BenChanViolin.com is operated by Ben Chan Tech LLC and provides public educational violin materials, archive
            search, and deterministic routing. This policy describes how information is handled on the current site and
            how future services may change that handling.
          </p>
          <h3>Information collected</h3>
          <p className="helper">
            The site may collect technical information through hosting logs, Google Analytics 4, and limited library
            interaction events. This can include page views, device/browser information, approximate location inferred by
            analytics providers, library search terms, routing outcomes, result clicks, and clip starts. The site does
            not currently provide user accounts, uploads, subscriptions, or personalized practice memory.
          </p>
          <h3>Google Analytics</h3>
          <p className="helper">
            The site uses GA4 through direct gtag.js collection to understand aggregate use of the library and routing
            system. Analytics events are designed to avoid obvious email addresses, phone numbers, and long search
            strings. Google’s own privacy practices apply to GA4 processing.
          </p>
          <h3>Search queries and routing</h3>
          <p className="helper">
            Library searches are sent to the site’s API so results can be returned. Stable completed searches may also be
            sent to GA4 in normalized, length-limited form. Deterministic routing outcomes are distinguished from archive
            fallback results.
          </p>
          <h3>Cookies and similar technologies</h3>
          <p className="helper">
            GA4 and embedded third-party services may use cookies or similar technologies. YouTube embeds use
            youtube-nocookie.com where practical, but playing or opening a video remains an interaction with YouTube. The
            site stores an analytics consent choice in the browser when a visitor accepts or declines analytics.
          </p>
          <h3>Legal basis</h3>
          <p className="helper">
            Where privacy laws require a legal basis, analytics may rely on consent or legitimate interests depending on
            the visitor’s location and the site operator’s consent setup. Essential hosting and security logs are used to
            operate and protect the site.
          </p>
          <h3>Retention</h3>
          <p className="helper">
            Hosting logs and analytics data are retained according to the settings of the hosting provider, Google
            Analytics property, and operational needs. The site operator should periodically review GA4 data-retention
            settings.
          </p>
          <h3>Third-party services and transfers</h3>
          <p className="helper">
            The site may use Vercel, Neon/PostgreSQL, Google Analytics, YouTube, GitHub, and Substack links or embeds.
            These providers may process data in the United States and other countries under their own terms and privacy
            practices.
          </p>
          <h3>Your rights</h3>
          <p className="helper">
            Depending on your location, you may have rights to request access, correction, deletion, objection,
            restriction, portability, or withdrawal of consent. Use the contact page to make a privacy request.
          </p>
          <h3>Children</h3>
          <p className="helper">
            This site is intended for a general educational audience and is not directed to children under 13. Children
            should use the site with a parent, guardian, or teacher.
          </p>
          <h3>Future services</h3>
          <p className="helper">
            If the site later adds accounts, subscriptions, newsletters, AI coaching, or Studio integrations, this policy
            should be updated before those features are launched.
          </p>
          <h3>Contact and updates</h3>
          <p className="helper">
            Contact: ben@benchantech.com. This policy may be updated as the site changes. The effective date should be
            reviewed by Ben Chan Tech LLC before publication.
          </p>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
