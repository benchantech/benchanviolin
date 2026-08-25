import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { parentQuestions, plannedParentVideos, violinForParentsCta, violinForParentsUrl } from "@/lib/parent-questions";

export const metadata: Metadata = {
  title: "Violin Parents, AI, and Between-Lesson Judgment - Ben Chan Violin",
  description:
    "Parent-facing answers on using AI around violin practice without replacing the child, parent, or current teacher's judgment.",
  alternates: {
    canonical: "https://benchanviolin.com/parents"
  },
  openGraph: {
    title: "Violin Parents, AI, and Between-Lesson Judgment",
    description:
      "How parents can use AI to see options and decide for themselves while preserving the violin teacher's role.",
    url: "https://benchanviolin.com/parents",
    siteName: "Ben Chan Violin",
    type: "website"
  }
};

export default function ParentsHubPage() {
  return (
    <>
      <a className="skip" href="#main">
        Skip to parent answers
      </a>
      <SiteHeader />
      <main id="main" className="parent-page">
        <section className="section parent-hero">
          <div>
            <p className="kicker">Parents · violin · AI</p>
            <h1>Use AI to see options. Keep the lesson human.</h1>
            <p className="lede">
              These answers are for parents and caregivers supporting a child between violin lessons. AI can help narrow
              the situation, organize evidence, and prepare better questions. It should not silently become a second
              violin teacher.
            </p>
            <p className="signature-note">
              The useful move is not more advice. It is one clearer next move while the teacher is not in the room.{" "}
              <span>— B.C.</span>
            </p>
            <div className="actions">
              <a className="btn" href={violinForParentsUrl} target="_blank" rel="noopener">
                {violinForParentsCta}
              </a>
              <a className="btn" href="/library">
                Search Ben's library
              </a>
            </div>
          </div>
          <figure className="media-slot parent-media-slot">
            <div className="image-carousel" aria-label="Ben Chan violin teaching video stills">
              <img
                src="/images/parents/vfp-parent-carousel-1.webp"
                alt="Ben Chan sitting near a music stand while using Violin for Parents"
                loading="eager"
              />
              <img
                src="/images/parents/vfp-parent-carousel-2.webp"
                alt="Ben Chan supporting a young violin learner between lessons"
                loading="eager"
              />
            </div>
            <figcaption>Violin for Parents applies Ben's teacher, parent, and CTO judgment to between-lesson support.</figcaption>
          </figure>
        </section>

        <section className="section" aria-labelledby="answers-title">
          <p className="section-number">01 / Parent questions</p>
          <h2 id="answers-title">Complete answers before coaching.</h2>
          <div className="parent-answer-grid">
            {parentQuestions.map((question) => (
              <a className="parent-answer-card" href={`/parents/${question.slug}`} key={question.slug}>
                <h3>{question.title}</h3>
                <p>{question.description}</p>
              </a>
            ))}
          </div>
        </section>

        <section className="section parent-principle parent-doctrine-band" aria-labelledby="principle-title">
          <p className="section-number">02 / Governing principle</p>
          <h2 id="principle-title">Minimal turn. Maximum haystack removal. Human judgment strengthened.</h2>
          <p>
            The parent is not the second teacher. The teacher's individualized work remains the anchor. The useful AI
            move is to help the adult observe more clearly, remove irrelevant possibilities, see another plausible side,
            decide who owns the decision, and choose one bounded next step.
          </p>
        </section>

        <section className="section parent-video-section" aria-labelledby="videos-title">
          <p className="section-number">03 / Video architecture</p>
          <h2 id="videos-title">Planned YouTube question series.</h2>
          <p className="copy">
            These topics are prepared for future BenChanViolin videos. Video embeds will be added only after public URLs
            exist.
          </p>
          <div className="parent-video-grid">
            {plannedParentVideos.map((cluster) => (
              <article key={cluster.cluster}>
                <h3>{cluster.cluster}</h3>
                <ul>
                  {cluster.titles.map((title) => (
                    <li key={title}>{title}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter showSubscribe />
    </>
  );
}
