import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata = {
  title: "Contact — Ben Chan Violin",
};

export default function ContactPage() {
  return (
    <div className="text-page">
      <SiteHeader />
      <main>
        <article className="card">
          <p className="eyebrow">Contact</p>
          <h1 tabIndex={-1}>Contact Ben Chan Tech LLC</h1>
          <p className="lede">
            BenChanViolin.com is operated by Ben Chan Tech LLC. For educational questions, accessibility issues,
            copyright concerns, or site feedback, contact:
          </p>
          <p className="helper">
            <a className="text-link" href="mailto:ben@benchantech.com">
              ben@benchantech.com
            </a>
          </p>
          <h3>Response times</h3>
          <p className="helper">
            Replies are not guaranteed and may take several business days or longer depending on availability.
          </p>
          <h3>Support limits</h3>
          <p className="helper">
            This contact address is not for emergencies, medical issues, urgent instrument damage, or individualized
            diagnosis. For urgent safety, health, or repair needs, contact qualified local professionals.
          </p>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
