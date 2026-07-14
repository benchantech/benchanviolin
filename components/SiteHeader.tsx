export function SiteHeader() {
  return (
    <header className="site-header">
      <a className="brand" href="/" aria-label="Ben Chan Violin home">
        <b>Ben Chan Violin</b>
        <small>Est. 2007</small>
      </a>
      <nav className="nav" aria-label="Primary">
        <a href="https://youtube.com/benchanviolin">YouTube</a>
        <a href="/stand-partner">Stand Partner</a>
      </nav>
    </header>
  );
}
