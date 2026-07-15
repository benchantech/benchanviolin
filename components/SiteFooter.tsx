import Link from "next/link";

const legalLinks = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Use" },
  { href: "/cookies", label: "Cookie Notice" },
  { href: "/accessibility", label: "Accessibility" },
  { href: "/ai-disclosure", label: "AI Disclosure" },
  { href: "/copyright", label: "Copyright" },
  { href: "/contact", label: "Contact" },
];

export function SiteFooter({ showSubscribe = false }: { showSubscribe?: boolean }) {
  return (
    <footer className="site-footer" id="site-footer">
      {showSubscribe ? (
        <section aria-labelledby="subscribe-title">
          <h2 id="subscribe-title">Useful ideas for people trying to keep music in their lives.</h2>
          <p>
            <a className="btn footer-cta" href="https://benchanviolin.substack.com" target="_blank" rel="noopener">
              Read on Substack
            </a>
          </p>
        </section>
      ) : null}
      <nav className="footer-links" aria-label="Legal and site information">
        {legalLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
