import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageViewTracker } from "@/components/PageViewTracker";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getRouteEvidence } from "@/lib/tags";
import {
  getBranchUrl,
  getRouteUrl,
  getTechnicalBranch,
  getTechnicalRoute,
  listTechnicalBranchPages,
  listTechnicalRoutePages,
  relatedRoutesFor,
  routeBoundary,
} from "@/lib/technical-route-pages";
import { parentQuestions } from "@/lib/parent-questions";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string; branch?: string[] }>;
};

function routeTitle(routeLabel: string, branchLabel?: string) {
  return branchLabel ? `${routeLabel}: ${branchLabel}` : routeLabel;
}

function canonicalUrl(routeId: string, branchId?: string) {
  const path = branchId ? getBranchUrl(routeId, branchId) : getRouteUrl(routeId);
  return `https://benchanviolin.com${path}`;
}

export function generateStaticParams() {
  return [
    ...listTechnicalRoutePages().map((route) => ({ slug: route.slug })),
    ...listTechnicalBranchPages().map((branch) => ({ slug: branch.slug, branch: [branch.branchId] })),
  ];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, branch } = await params;
  const route = getTechnicalRoute(slug);
  const branchId = branch?.[0];
  const branchPage = branchId ? getTechnicalBranch(slug, branchId) : null;
  if (!route || (branchId && !branchPage)) return {};

  const title = routeTitle(route.label, branchPage?.label);
  const description = branchPage?.summary || route.summary;

  return {
    title: `${title} | Ben Chan Violin Technique Library`,
    description,
    authors: [{ name: "Ben Chan" }],
    alternates: { canonical: canonicalUrl(route.id, branchId) },
    openGraph: {
      title,
      description,
      url: canonicalUrl(route.id, branchId),
      siteName: "Ben Chan Violin",
      type: "article",
    },
  };
}

function parentLinksForRoute(routeId: string) {
  return parentQuestions.filter((question) =>
    question.techniqueRoutes?.some((route) => route.routeId === routeId),
  );
}

export default async function TechnicalRoutePage({ params }: Props) {
  const { slug, branch } = await params;
  const branchId = branch?.[0];
  if (branch && branch.length > 1) notFound();

  const route = getTechnicalRoute(slug);
  const branchPage = branchId ? getTechnicalBranch(slug, branchId) : null;
  if (!route || (branchId && !branchPage)) notFound();

  const title = routeTitle(route.label, branchPage?.label);
  const summary = branchPage?.summary || route.summary;
  const firstAction = branchPage?.firstAction || route.firstAction;
  const evidence = await getRouteEvidence(route.id, branchId ? `${route.id}:${branchId}` : undefined);
  const relatedRoutes = relatedRoutesFor(route);
  const relatedParentQuestions = parentLinksForRoute(route.id);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: summary,
    author: { "@type": "Person", name: "Ben Chan" },
    mainEntityOfPage: canonicalUrl(route.id, branchId),
    isPartOf: {
      "@type": "WebSite",
      name: "Ben Chan Violin",
      url: "https://benchanviolin.com",
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Library", item: "https://benchanviolin.com/library" },
      {
        "@type": "ListItem",
        position: 2,
        name: route.label,
        item: `https://benchanviolin.com${getRouteUrl(route.id)}`,
      },
      ...(branchPage
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: branchPage.label,
              item: canonicalUrl(route.id, branchId),
            },
          ]
        : []),
    ],
  };

  return (
    <>
      <a className="skip" href="#main">
        Skip to technique route
      </a>
      <SiteHeader />
      <main id="main" className="library-page route-page">
        <PageViewTracker eventName="library_route_view" params={{ route_id: branchId ? `${route.id}:${branchId}` : route.id }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

        <article>
          <header className="section library-hero">
            <p className="kicker">{route.domain}</p>
            <h1>{title}</h1>
            <p className="lede">{summary}</p>
            <p className="note">
              This governed route starts from what you can observe. It is source material and routing help, not a
              replacement for the current teacher seeing the player.
            </p>
          </header>

          <section className="section answer-columns">
            <div>
              <h2>What you can observe</h2>
              <ul className="source-list">
                {route.searchTerms.slice(0, 5).map((term) => (
                  <li key={term}>{term}</li>
                ))}
              </ul>
            </div>
            <div>
              <h2>First bounded action</h2>
              <p>{firstAction}</p>
            </div>
          </section>

          {route.branch && !branchPage ? (
            <section className="section">
              <h2>Possible branches</h2>
              <div className="tag-list">
                {route.branch.options.map((option) => (
                  <a key={option.id} href={getBranchUrl(route.id, option.id)}>
                    <span>{option.label}</span>
                    <small>Route branch</small>
                  </a>
                ))}
              </div>
            </section>
          ) : null}

          <section className="section answer-columns">
            <div>
              <h2>How to check it</h2>
              <p>{route.verification}</p>
            </div>
            <div>
              <h2>Stop condition</h2>
              <p>{route.stopCondition}</p>
            </div>
          </section>

          <section className="section parent-principle">
            <h2>What this route cannot tell you</h2>
            <p>{routeBoundary(route)}</p>
          </section>

          <section className="section">
            <h2>What Ben's clips show</h2>
            {evidence.length ? (
              <div className="search-results">
                {evidence.map((segment) => (
                  <a className="search-result transcript-hit" href={segment.start_url} key={segment.segment_id} target="_blank" rel="noopener">
                    <span>
                      <b>{segment.segment_title}</b>
                      <small>{segment.timestamp_label} · {segment.video_title}</small>
                    </span>
                    <em>Source</em>
                  </a>
                ))}
              </div>
            ) : (
              <p className="copy">
                No reviewed clip is attached to this route yet. The route language still comes from BenChanViolin's
                governed technique router.
              </p>
            )}
          </section>

          <section className="section answer-columns">
            <div>
              <h2>Related governed routes</h2>
              <ul className="source-list">
                {relatedRoutes.map((related) => (
                  <li key={related.id}>
                    <a href={getRouteUrl(related.id)}>{related.label}</a>
                  </li>
                ))}
              </ul>
            </div>
            {relatedParentQuestions.length ? (
              <div>
                <h2>Supporting a child?</h2>
                <ul className="source-list">
                  {relatedParentQuestions.map((question) => (
                    <li key={question.slug}>
                      <a href={`/parents/${question.slug}`}>{question.title}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
