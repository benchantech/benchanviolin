import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata = {
  title: "Teaching Archive — Ben Chan Violin",
  description: "Ben Chan Violin teaching archive index.",
};

export default function ArchivePage() {
  return (
    <>
      <a className="skip" href="#main">
        Skip to archive
      </a>
      <SiteHeader />
      <main id="main">
        <section className="section">
          <p className="kicker">Reference shelf</p>
          <h1>Teaching archive</h1>
          <p className="lede">
            A working index for players who know what they need, with a few pathways for days when the starting point is
            less obvious.
          </p>
          <form className="signup" action="#" method="get" role="search">
            <label htmlFor="q">Search the archive</label>
            <div>
              <input id="q" name="q" type="search" placeholder="bow contact, reading, restarting" />
              <button className="btn secondary" type="submit">
                Search
              </button>
            </div>
          </form>
        </section>
        <section className="section archive-preview" aria-labelledby="index-title">
          <p className="section-number">01 / Index</p>
          <h2 id="index-title">Categories, not a dashboard.</h2>
          <div className="index-list">
            <a href="#">
              <span>04:12 / Rebuilding Bow Contact</span>
              <small>returning · bow · short</small>
            </a>
            <a href="#">
              <span>00:00 / Reading New Music Without Chasing Every Note</span>
              <small>reading · pulse · medium</small>
            </a>
            <a href="#">
              <span>00:00 / Stop Trying to Fix the Whole Problem</span>
              <small>practice design · problem solving</small>
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
