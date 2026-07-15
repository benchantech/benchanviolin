import { RouteDirectory } from "@/components/RouteDirectory";
import { TagSearchInput } from "@/components/TagSearchInput";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Technique Library - Ben Chan Violin",
  description: "Search Ben Chan Violin technique routes and transcript-aligned candidate clips by learner phrases.",
};

type LibraryPageProps = {
  searchParams?: Promise<{ q?: string | string[]; route?: string | string[]; node?: string | string[] }>;
};

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const params = await searchParams;
  const rawQuery = Array.isArray(params?.q) ? params?.q[0] : params?.q;
  const rawRoute = Array.isArray(params?.route) ? params?.route[0] : params?.route;
  const rawNode = Array.isArray(params?.node) ? params?.node[0] : params?.node;
  const initialQuery = rawQuery?.trim() ?? "";
  const initialRouteId = rawRoute?.trim() ?? "";
  const initialNodeId = rawNode?.trim() ?? "";

  return (
    <>
      <a className="skip" href="#main">
        Skip to library
      </a>
      <SiteHeader />
      <main id="main" className="library-page">
        <section className="section library-hero">
          <p className="kicker">Technique routes</p>
          <p className="lede">Search a technique, a problem, or the words you would use in practice.</p>
          <TagSearchInput initialQuery={initialQuery} initialRouteId={initialRouteId} initialNodeId={initialNodeId} />
        </section>

        <section className="section" aria-labelledby="directory-title">
          <p className="section-number">01 / Governed routes</p>
          <h2 id="directory-title">Start from what you notice.</h2>
          <RouteDirectory />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
