import PageLayout from '../../components/PageLayout'

/**
 * Cookie Policy — UK PECR + GDPR compliant placeholder.
 *
 * Current state describes the minimal cookies actually in use (Supabase auth).
 * If analytics or marketing tracking is added later, update this page AND add
 * a consent banner (Termly bundles one, or use Cookie Information free tier).
 */
export default function CookiePolicy() {
  return (
    <PageLayout title="Cookie Policy" lastUpdated="DRAFT — not yet published">
      <div className="page-layout__placeholder">
        <strong>Draft.</strong> Replace with Termly-generated cookie policy
        before launch. The cookie inventory below reflects the current state
        of the site and needs to be kept in sync as third-party scripts are
        added or removed.
      </div>

      <h2>What cookies are</h2>
      <p>
        Cookies are small text files stored on your device when you visit a
        website. They let the site remember you between visits and across
        pages.
      </p>

      <h2>What we use cookies for</h2>
      <p>
        At present, we only set <strong>strictly necessary</strong> cookies
        &mdash; ones that are required for the site to function. We do not
        use cookies for advertising, analytics, or cross-site tracking.
      </p>

      <h2>Cookies currently in use</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', margin: '16px 0' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid rgba(74, 93, 76, 0.2)' }}>
            <th style={{ textAlign: 'left', padding: '8px 12px' }}>Name</th>
            <th style={{ textAlign: 'left', padding: '8px 12px' }}>Set by</th>
            <th style={{ textAlign: 'left', padding: '8px 12px' }}>Purpose</th>
            <th style={{ textAlign: 'left', padding: '8px 12px' }}>Duration</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderBottom: '1px solid rgba(74, 93, 76, 0.1)' }}>
            <td style={{ padding: '8px 12px' }}><code>sb-*-auth-token</code></td>
            <td style={{ padding: '8px 12px' }}>Supabase (us)</td>
            <td style={{ padding: '8px 12px' }}>Keeps you logged in. Required for the service to work.</td>
            <td style={{ padding: '8px 12px' }}>~1 hour, refreshed automatically</td>
          </tr>
          <tr style={{ borderBottom: '1px solid rgba(74, 93, 76, 0.1)' }}>
            <td style={{ padding: '8px 12px' }}><code>sb-*-refresh-token</code></td>
            <td style={{ padding: '8px 12px' }}>Supabase (us)</td>
            <td style={{ padding: '8px 12px' }}>Renews your login session.</td>
            <td style={{ padding: '8px 12px' }}>Until logout or 30 days idle</td>
          </tr>
        </tbody>
      </table>

      <h2>Local storage and session storage</h2>
      <p>
        In addition to cookies we use browser <code>localStorage</code> and{' '}
        <code>sessionStorage</code> to remember your scenario selections and
        preferred sign-in mode between visits. These are also strictly
        necessary and are cleared when you log out.
      </p>

      <h2>Third-party services</h2>
      <p>
        Stripe (our payment processor) may set its own cookies during the
        checkout flow. Stripe describes these in its{' '}
        <a href="https://stripe.com/cookies-policy/legal">cookie policy</a>.
        These are needed for payment processing.
      </p>

      <h2>If we add analytics later</h2>
      <p>
        We are not currently using analytics. If we add a tool such as
        Plausible (cookieless), Google Analytics, or similar, we will update
        this page and, where required by UK PECR, surface a consent banner
        before any non-essential cookie is set.
      </p>

      <h2>How to control cookies</h2>
      <p>
        You can clear cookies and storage for this site through your
        browser&rsquo;s settings. Disabling strictly necessary cookies will
        log you out and prevent the service from working.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about cookies:{' '}
        <a href="mailto:privacy@reviva.live">privacy@reviva.live</a>.
      </p>
    </PageLayout>
  )
}
