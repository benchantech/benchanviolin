import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata = {
  title: "AI & Educational Disclosure — Ben Chan Violin",
};

export default function AiDisclosurePage() {
  return (
    <div className="text-page">
      <SiteHeader />
      <main>
        <article className="card">
          <p className="eyebrow">Educational Disclosure</p>
          <h1 tabIndex={-1}>Routing, search, and judgment</h1>
          <p className="lede">
            BenChanViolin.com is an educational website. Its technical routing is designed to point learners toward
            relevant practice ideas, not to replace a teacher or make authoritative personal judgments about a player.
          </p>
          <h3>Deterministic routing</h3>
          <p className="helper">
            Some library searches are routed by fixed rules before archive retrieval. Those governed routes are
            deterministic: the database does not decide what the learner means.
          </p>
          <h3>Archive search</h3>
          <p className="helper">
            When no governed route applies, the site may use archive search across tags, reviewed transcript context,
            and related metadata. Archive retrieval is useful, but it is not an authoritative technical diagnosis.
          </p>
          <h3>AI-assisted material</h3>
          <p className="helper">
            Some internal preparation, metadata, or future retrieval tools may be AI-assisted. AI systems can be
            incomplete or wrong. Human review and learner judgment remain primary.
          </p>
          <h3>Practice responsibility</h3>
          <p className="helper">
            Use the site as a starting point for observation and practice. Stop if pain, numbness, tingling, equipment
            damage, or unsafe playing conditions appear, and seek qualified help when needed.
          </p>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
