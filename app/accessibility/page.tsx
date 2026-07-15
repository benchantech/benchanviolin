import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata = {
  title: "Accessibility Statement — Ben Chan Violin",
};

export default function AccessibilityPage() {
  return (
    <div className="text-page">
      <SiteHeader />
      <main>
        <article className="card">
          <p className="eyebrow">Accessibility</p>
          <h1 tabIndex={-1}>Accessibility Statement</h1>
          <p className="lede">
            BenChanViolin.com aims to be usable by visitors with different devices, input methods, and accessibility
            needs.
          </p>
          <h3>Current approach</h3>
          <p className="helper">
            The site uses semantic HTML, visible text links and buttons, keyboard-focusable controls, skip links, and
            responsive layouts. Video content is provided through YouTube embeds and links.
          </p>
          <h3>Ongoing work</h3>
          <p className="helper">
            Accessibility is an ongoing process. Some older video material, third-party embeds, and archive content may
            have limitations outside the direct control of this site.
          </p>
          <h3>Contact</h3>
          <p className="helper">
            To report an accessibility issue, use the contact page and include the page URL, device/browser, and a short
            description of the problem.
          </p>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
