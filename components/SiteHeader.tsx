export function SiteHeader() {
  return (
    <header className="site-header">
      <a className="brand" href="/" aria-label="Ben Chan Violin home">
        <b>Ben Chan Violin</b>
        <small>Est. 2007</small>
      </a>
      <nav className="nav" aria-label="Primary">
        <a href="/parents">Parents</a>
        <a href="/library">Library</a>
        <a href="https://youtube.com/benchanviolin">YouTube</a>
      </nav>
      <details className="mobile-menu">
        <summary aria-label="Open navigation">
          <span />
          <span />
          <span />
        </summary>
        <nav aria-label="Mobile primary">
          <a href="/parents">Parents</a>
          <a href="/library">Library</a>
          <a href="https://youtube.com/benchanviolin">YouTube</a>
        </nav>
      </details>
    </header>
  );
}
