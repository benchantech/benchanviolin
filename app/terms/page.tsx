import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata = {
  title: "Terms of Use — Ben Chan Violin",
};

export default function TermsPage() {
  return (
    <div className="text-page">
      <SiteHeader />
      <main>
        <article className="card">
          <p className="eyebrow">Terms of Use</p>
          <h1 tabIndex={-1}>Terms of Use</h1>
          <p className="lede">
            BenChanViolin.com is operated by Ben Chan Tech LLC. By using the site, you agree to use it as a public
            educational resource and to respect the limits below.
          </p>
          <h3>Educational purpose</h3>
          <p className="helper">
            The site provides violin education, archive search, deterministic routing, and related learning materials. It
            does not guarantee improvement, admission, performance results, or suitability for any particular learner.
          </p>
          <h3>No professional or medical advice</h3>
          <p className="helper">
            Content is not medical advice, injury diagnosis, instrument repair advice, or a substitute for a qualified
            teacher, clinician, luthier, or other professional. Stop if pain, numbness, tingling, or unsafe conditions
            appear.
          </p>
          <h3>Acceptable use</h3>
          <p className="helper">
            Do not misuse the site, attack its infrastructure, scrape or bulk copy content, submit unlawful material, or
            interfere with other visitors. Future interactive or AI-assisted services may include additional rules.
          </p>
          <h3>Intellectual property</h3>
          <p className="helper">
            Site text, design, routing copy, and original educational materials are protected by copyright and other
            rights. Public links are welcome; redistribution or commercial reuse requires permission unless otherwise
            allowed by law.
          </p>
          <h3>YouTube and third-party content</h3>
          <p className="helper">
            Embedded and linked YouTube videos are governed by YouTube’s terms and the rights of their owners. Third-party
            services may change or become unavailable.
          </p>
          <h3>No warranty</h3>
          <p className="helper">
            The site is provided as is and as available. Content may be incomplete, outdated, unavailable, or incorrect.
          </p>
          <h3>Limitation of liability</h3>
          <p className="helper">
            To the extent allowed by law, Ben Chan Tech LLC is not liable for indirect, incidental, consequential, or
            special damages arising from use of the site or reliance on educational materials.
          </p>
          <h3>Changes and governing law</h3>
          <p className="helper">
            The site and these terms may change over time. These terms are governed by the laws of the State of New York,
            without regard to conflict-of-law principles, except where local law requires otherwise.
          </p>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
