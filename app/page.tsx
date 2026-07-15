import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function HomePage() {
  return (
    <div className="home-page">
      <a className="skip" href="#main">
        Skip to content
      </a>
      <SiteHeader />

      <main id="main">
        <section className="hero section">
          <div>
            <p className="kicker">Ben Chan / Violinist · Learning out loud</p>
            <h1>Forty years of practice, out loud.</h1>
            <p className="lede">
              I&apos;ve been playing violin almost forty years and teaching it in public since 2007 — twenty-four views
              on that first video, and I kept going. This is where I perform, teach, and run my experiments in how one
              hard-won skill quietly transfers into the next.
            </p>
            <p className="signature-note">
              The strings were attached a long time ago. I&apos;m just seeing what else they can play. <span>— B.C.</span>
            </p>
            <div className="actions">
              <a className="btn" href="/library">
                Search the library
              </a>
              <a className="btn" href="https://youtube.com/benchanviolin" target="_blank" rel="noopener">
                Watch on YouTube
              </a>
            </div>
          </div>
          <figure className="media-slot">
            <div className="image-carousel" aria-label="Ben Chan violin teaching video stills">
              <img
                src="https://i.ytimg.com/vi/vB00ah6E5E4/hqdefault.jpg"
                alt="Ben Chan violin teaching video still"
                loading="eager"
              />
              <img
                src="https://i.ytimg.com/vi/s4U9Y2ts1Ys/0.jpg"
                alt="Ben Chan violin teaching video still"
                loading="eager"
              />
              <img
                src="https://i.ytimg.com/vi/sNGIFa6gZqo/maxresdefault.jpg"
                alt="Ben Chan violin teaching video still"
                loading="eager"
              />
            </div>
            <figcaption>BenChanViolin on YouTube: from 2007 to now, still practicing in public.</figcaption>
          </figure>
        </section>

        <section className="practice-section section" aria-labelledby="practice-title">
          <p className="kicker">New game plus</p>
          <h2 id="practice-title">New strings, same hands.</h2>
          <p className="copy">
            Can decades of violin discipline accelerate a brand-new domain? That&apos;s the experiment I keep running in
            public. The strings are always attached — they&apos;re just tuned differently each time.
          </p>
          <div className="practice-grid" aria-label="Learning experiments">
            <article>
              <h3>Piano</h3>
              <p>Perfect pitch helps; my left hand still overpowers the right. Forty years fighting new muscle memory.</p>
            </article>
            <article>
              <h3>Mandarin</h3>
              <p>The musician&apos;s ear hears the tones. Then I open my mouth and the illusion vanishes.</p>
            </article>
            <article>
              <h3>Cooking</h3>
              <p>Cutting vegetables like etudes. I&apos;m at Twinkle Twinkle; the recipe is playing Bach.</p>
            </article>
            <article>
              <h3>Writing</h3>
              <p>Practicing in public, for people I don&apos;t know yet. Publishing into the void still counts.</p>
            </article>
          </div>
        </section>

        <section className="sideways-section section" aria-labelledby="sideways-title">
          <div>
            <p className="kicker">Built in plain sight</p>
            <h2 id="sideways-title">I build sideways, in minutes.</h2>
            <p className="copy">
              I&apos;m a recovering serial restarter — eager to begin, quick to spook. So I stopped building upward in
              heroic pushes and started building sideways: a few honest minutes a day, where the friction, failure, and
              fatigue become data instead of shame. Even the silent minutes count.
            </p>
            <div className="progress-label">Progress — measured in minutes, expanded sideways →</div>
            <div className="practice-meter" aria-hidden="true">
              <span />
              <i>→</i>
            </div>
            <div className="meter-caption">
              <span>logged minutes</span>
              <span>silent minutes — still counted</span>
            </div>
          </div>
          <aside className="practice-ledger" aria-label="Practice ledger">
            <p>Practice ledger</p>
            <div>
              <span>2026·07·02 · chaconne</span>
              Shift late only from the lower string. Not a fix — a clue. Retest slow.
            </div>
            <div>
              <span>2026·06·28 · piano</span>
              Left hand still louder than the right. The strings are pulling.
            </div>
            <div>
              <span>2026·06·21 · writing</span>
              Published into the void again. Still counts.
            </div>
          </aside>
        </section>

        <section className="listening-room section" aria-labelledby="listening-title">
          <p className="kicker">YY and Me — a canon of growing echoes</p>
          <h2 id="listening-title">And a room where I think out loud, in myth.</h2>
          <p className="copy">
            A narrative podcast about identity, imagination, and learning out loud — building legacy, violin, and AI in
            real time. My storytelling partner is YY, who has been with me since before I could hold a bow.
          </p>
          <div className="question-grid">
            <a href="https://yyandme.com" target="_blank" rel="noopener">
              <span>What if practice doesn&apos;t make perfect — just permanent?</span>
              <small>EP.02 · Practicing →</small>
            </a>
            <a href="https://yyandme.com" target="_blank" rel="noopener">
              <span>What if constraint is the thing that sparks the innovation?</span>
              <small>EP.06 · The Author Ship →</small>
            </a>
            <a href="https://yyandme.com" target="_blank" rel="noopener">
              <span>What if you&apos;re living on borrowed time, paying an emotional mortgage?</span>
              <small>EP.05 · Time Enough →</small>
            </a>
          </div>
        </section>

        <section className="watch-section section" aria-labelledby="watch-title">
          <div className="section-head">
            <div>
              <p className="kicker">Watch · the library</p>
              <h2 id="watch-title">Practice in public, on tape.</h2>
            </div>
            <a href="https://youtube.com/benchanviolin" target="_blank" rel="noopener">
              youtube.com/benchanviolin →
            </a>
          </div>
          <div className="watch-grid">
            <article>
              <iframe
                src="https://www.youtube-nocookie.com/embed/sNGIFa6gZqo"
                title="Name That Anime! 5 Legendary Themes on Violin"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
              <h3>Name That Anime! 5 Legendary Themes on Violin</h3>
              <p>Five anime themes on violin, framed as a listening game.</p>
            </article>
            <article>
              <iframe
                src="https://www.youtube-nocookie.com/embed/ygvtjd7NNJE"
                title="How to Play Two Voices in Bach Sonata No. 2 Andante"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
              <h3>How to Play Two Voices in Bach Sonata No. 2 Andante</h3>
              <p>A tutorial on separating melody and accompaniment inside Bach&apos;s Andante.</p>
            </article>
            <article>
              <iframe
                src="https://www.youtube-nocookie.com/embed/69_-GJO5Z9M"
                title="Shifting and Hand Frame - Mendelssohn Violin Concerto Pages 1-2"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
              <h3>Shifting and Hand Frame - Mendelssohn Violin Concerto Pages 1-2</h3>
              <p>Shifting and hand-frame work through the opening pages of Mendelssohn.</p>
            </article>
          </div>
        </section>
      </main>

      <SiteFooter showSubscribe />
    </div>
  );
}
