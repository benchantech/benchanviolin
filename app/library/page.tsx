import { TagDirectory } from "@/components/TagDirectory";
import { TagSearchInput } from "@/components/TagSearchInput";
import { SiteHeader } from "@/components/SiteHeader";
import { getTagDirectory } from "@/lib/tags";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Technique Library - Ben Chan Violin",
  description: "Search reviewed Ben Chan Violin technique clips by canonical tags and learner phrases.",
};

type LibraryPageProps = {
  searchParams?: Promise<{ q?: string | string[] }>;
};

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const params = await searchParams;
  const rawQuery = Array.isArray(params?.q) ? params?.q[0] : params?.q;
  const initialQuery = rawQuery?.trim() ?? "";
  const tags = await getTagDirectory();

  return (
    <>
      <a className="skip" href="#main">
        Skip to library
      </a>
      <SiteHeader />
      <main id="main" className="library-page">
        <section className="section library-hero">
          <p className="kicker">Reviewed clips</p>
          <p className="lede">Search a technique, a problem, or the words you would use in practice.</p>
          <TagSearchInput initialQuery={initialQuery} />
        </section>

        <section className="section" aria-labelledby="directory-title">
          <p className="section-number">01 / Canonical tags</p>
          <h2 id="directory-title">Start from a validated concept.</h2>
          <TagDirectory tags={tags} />
        </section>
      </main>
    </>
  );
}
