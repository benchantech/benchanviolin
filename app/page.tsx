export default function HomePage() {
  return (
    <div className="home-page">
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <a className="brand" href="./" aria-label="Ben Chan Violin home">
          <b>Ben Chan Violin</b>
          <small>Teaching archive</small>
        </a>
      </header>

      <main id="main">
        <section className="hero section">
          <div>
            <p className="kicker">Archive / Adult violin study</p>
            <h1>Twenty Years of Violin Online.</h1>
            <p className="lede">
              A working archive of ideas, videos, and useful starting points for people trying to keep music in their
              lives.
            </p>
            <div className="actions">
              <a className="btn" href="/library">
                Search reviewed clips
              </a>
              <a className="btn" href="https://youtube.com/benchanviolin" target="_blank" rel="noopener">
                Browse teaching archive
              </a>
            </div>
            <p className="note">Busy life? Join the club — don&apos;t forget your violin.</p>
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
            <figcaption>BenChanViolin on YouTube: From 2007 to 2026 (and counting)</figcaption>
          </figure>
        </section>

        <section className="method-bridge section" aria-labelledby="method-bridge-title">
          <p className="kicker">YY Method™ for Violin</p>
          <h2 id="method-bridge-title">Stuck on the same passage again? There&apos;s a method for that.</h2>
          <p className="copy">
            YY Method™ for Violin turns stuck practice moments into one small experiment, a sharper teacher
            question, and a record of what actually worked — free, and built for real practice sessions, not
            perfect ones.
          </p>
          <div className="actions">
            <a className="btn secondary" href="https://yymethod.com/violin/" target="_blank" rel="noopener">
              Get the method, free →
            </a>
          </div>
        </section>
      </main>

      <footer className="site-footer" id="subscribe">
        <section aria-labelledby="subscribe-title">
          <h2 id="subscribe-title">ARCHIVE / WRITING</h2>
          <p className="copy">Useful ideas for people trying to keep music in their lives.</p>
          <p>
            <a className="btn footer-cta" href="https://benchanviolin.substack.com" target="_blank" rel="noopener">
              Read on Substack
            </a>
          </p>
        </section>
      </footer>
    </div>
  );
}
