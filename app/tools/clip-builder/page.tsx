import ClipBuilder from "@/components/ClipBuilder";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata = {
  title: "Clip Builder",
};

export default function ClipBuilderPage() {
  return (
    <>
      <style>{`
        label{display:grid;gap:6px;font:700 .8rem ui-sans-serif,system-ui,sans-serif;margin:12px 0}
        input,textarea,select{padding:10px;border:1px solid var(--line);border-radius:8px;font:inherit}
        textarea{min-height:70px}
        pre{white-space:pre-wrap;background:#182236;color:#fff;padding:14px;border-radius:10px;overflow:auto}
      `}</style>
      <SiteHeader />
      <main>
        <article className="card">
          <p className="eyebrow">Maintainer tool · local only</p>
          <h1 tabIndex={-1}>Clip Builder</h1>
          <p className="lede">
            Create one routable clip record. It does not save or send anything. Export JSON, then manually paste it into{" "}
            <code>ROUTES</code> in <code>components/StandPartnerApp.tsx</code>.
          </p>
          <p className="notice">
            Do not publish this as a user feature. Review copyright, factual claims, and boundaries before publishing a
            route.
          </p>
          <ClipBuilder />
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
