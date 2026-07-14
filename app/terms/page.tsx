import { SiteHeader } from "@/components/SiteHeader";

export const metadata = {
  title: "Terms — Ben Chan Violin",
};

export default function TermsPage() {
  return (
    <div className="text-page">
      <SiteHeader />
      <main>
        <article className="card">
          <p className="eyebrow">Terms</p>
          <h1 tabIndex={-1}>Educational use and boundaries</h1>
          <p className="lede">
            This site offers educational violin materials and routing toward those materials. It does not diagnose
            playing, provide medical advice, replace a teacher, or promise a particular result.
          </p>
          <p className="helper">
            For pain, injury, urgent concerns, or questions that require someone to see and hear your playing directly,
            seek appropriately qualified help.
          </p>
          <div className="buttons">
            <a className="btn" href="./">
              Back to site
            </a>
          </div>
        </article>
      </main>
    </div>
  );
}
