import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { PageViewTracker } from "@/components/PageViewTracker";
import { getBenApprovedLessonsForParentQuestion } from "@/lib/ben-approved-lessons";
import { getParentQuestion, parentQuestions, violinForParentsCta, violinForParentsUrl } from "@/lib/parent-questions";
import { getRouteUrl, getTechnicalRoute } from "@/lib/technical-route-pages";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return parentQuestions.map((question) => ({ slug: question.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const question = getParentQuestion(slug);
  if (!question) return {};
  const url = `https://benchanviolin.com/parents/${question.slug}`;
  return {
    title: `${question.title} - Ben Chan Violin`,
    description: question.description,
    authors: [{ name: "Ben Chan" }],
    alternates: { canonical: url },
    openGraph: {
      title: question.title,
      description: question.description,
      url,
      siteName: "Ben Chan Violin",
      type: "article"
    }
  };
}

export default async function ParentQuestionPage({ params }: PageProps) {
  const { slug } = await params;
  const question = getParentQuestion(slug);
  if (!question) notFound();
  const lessonPlayers = getBenApprovedLessonsForParentQuestion(question.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: question.title,
    description: question.description,
    author: { "@type": "Person", name: "Ben Chan" },
    dateModified: question.updated,
    mainEntityOfPage: `https://benchanviolin.com/parents/${question.slug}`
  };

  return (
    <>
      <a className="skip" href="#main">
        Skip to answer
      </a>
      <SiteHeader />
      <main id="main" className="parent-page parent-answer-page">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <PageViewTracker eventName="parent_answer_view" params={{ route_id: question.slug }} />
        <article>
          <header className="section parent-hero">
            <p className="kicker">Violin parent question</p>
            <h1>{question.title}</h1>
            <p className="lede">{question.directAnswer}</p>
            <p className="meta-line">By Ben Chan · Updated {question.updated}</p>
          </header>

          <section className={lessonPlayers.length ? "section answer-with-lessons" : "section"}>
            <div>
              {question.keyDistinction ? (
                <>
                  <h2>What matters here</h2>
                  <p>{question.keyDistinction}</p>
                </>
              ) : null}
              <h2>What to observe first</h2>
              <ul className="answer-list">
                {question.observations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            {lessonPlayers.length ? (
              <aside className="lesson-player-panel" aria-labelledby="lesson-player-title">
                <p className="kicker">Ben-Approved Lessons</p>
                <h2 id="lesson-player-title">Listen next</h2>
                {lessonPlayers.map((lesson) => (
                  <div className="lesson-player-card" key={lesson.embedUrl}>
                    <iframe
                      title={`Apple Podcasts player: ${lesson.title}`}
                      src={lesson.embedUrl}
                      height="175"
                      loading="lazy"
                      allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
                      sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
                    />
                    <h3>{lesson.title}</h3>
                    <p>{lesson.note}</p>
                    <a href={lesson.appleUrl} target="_blank" rel="noopener">
                      Open in Apple Podcasts
                    </a>
                  </div>
                ))}
              </aside>
            ) : null}
          </section>

          <section className="section answer-columns">
            <div>
              <h2>What not to assume</h2>
              {question.doNotAssume?.length ? (
                <ul className="source-list">
                  {question.doNotAssume.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p>{question.uncertainty}</p>
              )}
            </div>
            <div>
              <h2>Important uncertainty</h2>
              <p>{question.uncertainty}</p>
            </div>
          </section>

          <section className="section answer-columns">
            <div>
              <h2>Who owns the decision?</h2>
              <p>{question.authority}</p>
            </div>
            <div>
              <h2>When this belongs with a human</h2>
              <p>
                If the next step depends on individualized technique, assignment sequence, pain, instrument safety, or a
                teacher-specific cue, use this page to prepare a clearer question rather than to replace that human
                judgment.
              </p>
            </div>
          </section>

          <section className="section parent-principle">
            <h2>One bounded next move</h2>
            <p>{question.nextMove}</p>
          </section>

          <section className="section answer-columns">
            <div>
              <h2>Relevant Ben sources</h2>
              <ul className="source-list">
                {question.sourceLinks.map((link) => (
                  <li key={link.href}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
            {question.techniqueRoutes?.length ? (
              <div>
                <h2>From Ben's library</h2>
                <ul className="source-list">
                  {question.techniqueRoutes.map((link) => {
                    const route = getTechnicalRoute(link.routeId);
                    if (!route) return null;
                    return (
                      <li key={link.routeId}>
                        <a href={getRouteUrl(route.id)}>{route.label}</a>
                        <p>{link.relationship}</p>
                        <p>{link.boundary}</p>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}
          </section>

          <section className="section answer-columns">
            <div>
              <h2>Related questions</h2>
              <ul className="source-list">
                {question.related.map((relatedSlug) => {
                  const related = getParentQuestion(relatedSlug);
                  if (!related) return null;
                  return (
                    <li key={related.slug}>
                      <a href={`/parents/${related.slug}`}>{related.title}</a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>

          <section className="section parent-cta" aria-labelledby="vfp-title">
            <p className="kicker">Violin for Parents</p>
            <h2 id="vfp-title">AI helps narrow the situation; it doesn't take over the lesson.</h2>
            <p>
              Violin for Parents is an audio-first continuity coach for the adult supporting a child between lessons. It
              helps preserve observations and teacher questions when the teacher is not in the room.
            </p>
            <a className="btn" href={violinForParentsUrl} target="_blank" rel="noopener">
              {violinForParentsCta}
            </a>
          </section>
        </article>
      </main>
      <SiteFooter showSubscribe />
    </>
  );
}
