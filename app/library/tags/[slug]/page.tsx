import { notFound } from "next/navigation";
import { SegmentFilter } from "@/components/SegmentFilter";
import { SiteHeader } from "@/components/SiteHeader";
import { getSegmentsForTag } from "@/lib/segments";
import { getTagDetail } from "@/lib/tags";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const tag = await getTagDetail(slug);

  if (!tag) return { title: "Technique not found - Ben Chan Violin" };

  return {
    title: `${tag.label} - Ben Chan Violin`,
    description: tag.description,
  };
}

export default async function TagPage({ params }: Props) {
  const { slug } = await params;
  const [tag, segments] = await Promise.all([getTagDetail(slug), getSegmentsForTag(slug)]);

  if (!tag) notFound();

  return (
    <>
      <a className="skip" href="#main">
        Skip to clips
      </a>
      <SiteHeader />
      <main id="main" className="library-page">
        <section className="section tag-detail">
          <p className="kicker">{tag.group_label}</p>
          <h1>{tag.label}</h1>
          <p className="lede">{tag.description}</p>
          {tag.aliases.length > 0 ? (
            <p className="tag-aliases">
              <span>Common phrases:</span>{" "}
              {tag.aliases.map((alias) => alias.phrase).join(" · ")}
            </p>
          ) : null}
          <p className="note">{tag.clip_count} reviewed clips</p>
        </section>

        <SegmentFilter tagLabel={tag.label} segments={segments} />
      </main>
    </>
  );
}
