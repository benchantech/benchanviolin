import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata = {
  title: "Copyright — Ben Chan Violin",
};

export default function CopyrightPage() {
  return (
    <div className="text-page">
      <SiteHeader />
      <main>
        <article className="card">
          <p className="eyebrow">Copyright</p>
          <h1 tabIndex={-1}>Copyright and permitted use</h1>
          <p className="lede">
            BenChanViolin.com is operated by Ben Chan Tech LLC. Unless otherwise noted, site text, design, routing copy,
            and original educational materials are owned by Ben Chan Tech LLC or their respective creators.
          </p>
          <h3>Video content</h3>
          <p className="helper">
            Many videos are embedded from or linked to YouTube. YouTube-hosted videos remain subject to YouTube’s terms,
            the rights of the video owner, and any rights in the underlying music or third-party material.
          </p>
          <h3>Permitted use</h3>
          <p className="helper">
            You may link to public pages and use short excerpts for ordinary educational reference with attribution.
          </p>
          <h3>Not permitted</h3>
          <p className="helper">
            Do not scrape, bulk copy, rehost, sell, or redistribute site content, transcripts, metadata, routing data, or
            embedded videos without permission.
          </p>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
