import { Link } from 'react-router-dom'
import AppNav from './AppNav'
import './page-layout.css'

/**
 * PageLayout — Shared wrapper for static info pages (legal, contact, help).
 *
 * Provides AppNav at the top, a centred content column, and a slim footer
 * with the legal/info links. The full marketing footer (logo, taglines) is
 * landing-page only — these pages stay deliberately plain.
 */
export default function PageLayout({ title, lastUpdated, children }) {
  return (
    <div className="page-layout">
      <AppNav />

      <main className="page-layout__main">
        <article className="page-layout__content">
          {title && <h1 className="page-layout__title">{title}</h1>}
          {lastUpdated && (
            <p className="page-layout__updated">Last updated: {lastUpdated}</p>
          )}
          <div className="page-layout__body">{children}</div>
        </article>
      </main>

      <footer className="page-layout__footer">
        <nav className="page-layout__footer-nav" aria-label="Footer">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/help">Help</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/cookies">Cookies</Link>
        </nav>
        <p className="page-layout__copyright">
          &copy; 2026 ReViva. Made with care in the UK.
        </p>
      </footer>
    </div>
  )
}
