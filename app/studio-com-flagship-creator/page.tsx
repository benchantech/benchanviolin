import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

const canonicalUrl = "https://benchanviolin.com/studio-com-flagship-creator";
const publishedDate = "2026-08-31";
const displayDate = "August 31, 2026";
const description =
  "CTO and violinist Ben Chan spent nine weeks stress-testing Studio.com's Flagship Creator platform. Three music apps survived. Here are the capabilities, failures, and AI design boundaries he found.";

export const metadata: Metadata = {
  title: "Studio.com Flagship Creator Field Report from Ben Chan",
  description,
  authors: [{ name: "Ben Chan", url: "https://benchanviolin.com" }],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: "35 Years of Code, 40 Years of Violin, Nine Weeks on Studio.com",
    description,
    url: canonicalUrl,
    siteName: "Ben Chan Violin",
    type: "article",
    publishedTime: publishedDate,
    modifiedTime: publishedDate,
    authors: ["Ben Chan"],
  },
};

const studioUrl = "https://studio.com";
const musicPracticeRpgUrl = "/music-practice-rpg";
const violinPitchBuilderUrl = "/violin-pitch-builder";
const violinForParentsUrl = "/violin-for-parents";

export default function StudioComFlagshipCreatorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${canonicalUrl}#article`,
    headline: "35 Years of Code, 40 Years of Violin, Nine Weeks on Studio.com. Here's What Held Up.",
    description,
    author: {
      "@id": "https://benchanviolin.com/#ben-chan",
    },
    datePublished: publishedDate,
    dateModified: publishedDate,
    mainEntityOfPage: canonicalUrl,
    publisher: {
      "@type": "Organization",
      name: "Ben Chan Violin",
      url: "https://benchanviolin.com",
    },
    about: [
      { "@id": "https://benchanviolin.com/#ben-chan" },
      { "@type": "Organization", name: "Studio.com", url: "https://studio.com" },
      { "@type": "Event", name: "YouTube Symphony Orchestra", location: "Carnegie Hall", startDate: "2009" },
      { "@type": "SoftwareApplication", name: "Music Practice RPG", url: "https://benchanviolin.com/music-practice-rpg" },
      { "@type": "SoftwareApplication", name: "Violin Pitch Builder", url: "https://benchanviolin.com/violin-pitch-builder" },
      { "@type": "SoftwareApplication", name: "Violin for Parents", url: "https://benchanviolin.com/violin-for-parents" },
    ],
  };

  return (
    <>
      <a className="skip" href="#main">
        Skip to field report
      </a>
      <SiteHeader />
      <main id="main" className="parent-page parent-answer-page field-report-page">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <article>
          <header className="section parent-hero field-report-hero">
            <p className="kicker">Studio.com Flagship Creator field report</p>
            <h1>35 Years of Code, 40 Years of Violin, Nine Weeks on Studio.com. Here&apos;s What Held Up.</h1>
            <p className="lede">
              <a href={studioUrl}>Studio.com</a> said an AI app takes six hours. I gave it nine weeks. Three music apps
              survived. They launch tomorrow. In one of them, your instrument is the controller - literally.
            </p>
            <p className="meta-line">By Ben Chan &middot; Published {displayDate}</p>
          </header>

          <section className="section field-report-summary" aria-labelledby="summary-title">
            <div>
              <p className="kicker">Experiment summary</p>
              <h2 id="summary-title">A CTO, violinist, and early Studio.com creator stress-tested the platform for nine weeks.</h2>
            </div>
            <dl>
              <div><dt>Role</dt><dd>Studio.com Flagship Creator</dd></div>
              <div><dt>Experiment length</dt><dd>Nine weeks</dd></div>
              <div><dt>Studio framing</dt><dd>Six-hour AI app build</dd></div>
              <div><dt>Onboarding</dt><dd>June 27, 2026</dd></div>
              <div><dt>Apps launching</dt><dd>Three</dd></div>
              <div><dt>Developer background</dt><dd>Roughly 35 years programming</dd></div>
              <div><dt>Music background</dt><dd>Roughly 40 years violin</dd></div>
            </dl>
          </section>

          <section className="section field-report-prose">
            <p>
              I&apos;m a CTO who builds AI systems daily, and I&apos;ve been writing software since I was a young kid.
              Studio didn&apos;t recruit me for that. It recruited me because I&apos;m a violinist with{" "}
              <a href="https://youtube.com/benchanviolin">300+ YouTube videos</a>, a seat in the first YouTube Symphony
              Orchestra at Carnegie Hall in 2009, and a channel I mostly walked away from in 2013 to focus on technology.
            </p>
            <p>
              Thirteen years later, the boomerang came back. I spent nine weeks deliberately looking for the platform&apos;s
              edges. Three apps survived. Eight didn&apos;t. Discarding ideas fast is the ROI.
            </p>
            <p>
              I haven&apos;t made a dime yet. We find out tomorrow. But the R&amp;D value and the return to music have already
              happened.
            </p>
          </section>

          <section className="section field-report-apps" aria-labelledby="apps-title">
            <p className="kicker">The three apps</p>
            <h2 id="apps-title">None of them were the apps I planned.</h2>
            <ul>
              <li><h3><a href={musicPracticeRpgUrl}>Music Practice RPG</a></h3><p>Your instrument is the controller, and your practice today changes the world tomorrow.</p></li>
              <li><h3><a href={violinPitchBuilderUrl}>Violin Pitch Builder</a></h3><p>Daily intonation challenges disguised as village tasks using the same RPG engine, with an authored curriculum for beginners that expands using pedagogical pillars for intermediate and advanced players.</p></li>
              <li><h3><a href={violinForParentsUrl}>Violin for Parents</a></h3><p>Building confidence in music parents between lessons, without overriding the teacher.</p></li>
            </ul>
          </section>

          <section className="section" aria-labelledby="leaders-title">
            <p className="kicker">Findings</p>
            <h2 id="leaders-title">Five things leaders should take from this</h2>
            <div className="field-report-findings">
              <section>
                <h3>1. The AI kept revealing capabilities I didn&apos;t know it had.</h3>
                <p>Week one: it could write directly to the app blueprint, rewrite onboarding and marketing pages, and run tests. Week two: it built me a working metronome and a live AI chat widget. Later it generated full audio podcasts on its own, by accident. I found these by trying things I assumed wouldn&apos;t work. Most creators won&apos;t push this hard. The ceiling is much higher than the six-hour framing suggests.</p>
              </section>
              <section>
                <h3>2. My distrust of AI almost killed the best product.</h3>
                <p>Music Practice RPG was bad at first, so I did what a year of adversarial AI testing taught me: I over-specified everything. It got worse. The version that worked used a <em>governing contract</em>: a skeletal spine of what must stay true, and real freedom inside it. Beta testers&apos; recordings and choices started shaping tomorrow&apos;s story. My daughter carried one run 47 days through F&uuml;r Elise. A character I&apos;ve voiced for 40 years said something I&apos;d never written, and it fit. The lesson wasn&apos;t &quot;trust AI more.&quot; It was <em>get precise about what you trust it to do.</em></p>
              </section>
              <section>
                <h3>3. I fired the AI from the job I built the app for.</h3>
                <p>Pitch Builder was supposed to detect pitch. After hours of controlled testing, the AI was right most of the time and wrong some of the time. I can catch that when it writes code. A violin student can&apos;t. So my pedagogical pillars and canonical recordings became the source of musical truth, and the AI was reassigned to what it&apos;s actually good at: expanding the path between them and making a world worth returning to. <strong>Authority stayed with the human. That was a design decision, not a limitation.</strong></p>
              </section>
              <section>
                <h3>4. Day one tells you nothing. Day 47 does.</h3>
                <p>AI apps look spectacular in a demo. Memory, continuity, and narrative drift only reveal themselves over weeks. Studio made building experiments cheap. It did not make longitudinal evidence cheap. Anyone evaluating creator apps should budget for that.</p>
              </section>
              <section>
                <h3>5. &quot;Can AI do this?&quot; is the wrong question for music.</h3>
                <p>Testing Violin for Parents, I realized the AI had my problem as a parent: it could produce advice I agreed with, and that still didn&apos;t mean it should interrupt what the teacher was building. Music teachers already hold authority. The interesting question is when AI should step in, not whether it can.</p>
              </section>
            </div>
          </section>

          <section className="section answer-columns">
            <div>
              <h2>For Studio: the rough edges, honestly</h2>
              <p>Deterministic-variable bugs, image problems, audio concatenation failures, Cantonese limitations, test-state isolation issues, and behaviors that only became understandable under sustained stress. Many are being fixed. I note them because this is a snapshot of a fast-moving system, and I&apos;ve seen that pattern before with React Native: the requirement decides the boundary, not the hype.</p>
            </div>
            <div>
              <h2>For YouTube: the work escaped the platform</h2>
              <p>Building these apps forced me to catalog hundreds of old videos into a searchable <a href="/library">technique library</a>, formalize a pitch curriculum, refresh my channel, and start recording again. Studio found me through YouTube. Then it sent me back.</p>
            </div>
          </section>

          <section className="section parent-principle">
            <h2>For music teachers: I built these so you stay in charge</h2>
            <p>Every design decision above pushed judgment toward the student, the parent, and the teacher. The AI generates motivation and continuity. It does not grade your student&apos;s playing; it complements your professional teaching instead.</p>
          </section>

          <section className="section field-report-prose" aria-labelledby="eyes-title">
            <h2 id="eyes-title">Eyes wide open</h2>
            <p>Building an app is now dramatically cheaper. Finding something people will repeatedly pay for is not. Of my 300 videos, maybe a dozen took off, and I never predicted which. The odds still favor the house.</p>
            <p>I&apos;d consider the nine weeks worthwhile even if all three apps make nothing, because two ROIs already happened: the R&amp;D and the return to music.</p>
            <p>Tomorrow may add a third - or not. I honestly have no idea what to expect.</p>
          </section>
        </article>
      </main>
      <SiteFooter showSubscribe />
    </>
  );
}
