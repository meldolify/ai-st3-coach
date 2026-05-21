import PageLayout from '../../components/PageLayout'

/**
 * Privacy Policy — UK GDPR compliant. Placeholder structure ready to be
 * replaced with a Termly-generated policy (or solicitor-reviewed text).
 *
 * Do NOT publish this page in its current state as a binding legal document.
 * Generate the body text via https://termly.io (free plan) using the
 * sub-processor list and data flows described below, then paste the
 * Termly HTML into the relevant <section> elements.
 */
export default function PrivacyPolicy() {
  return (
    <PageLayout title="Privacy Policy" lastUpdated="DRAFT — not yet published">
      <div className="page-layout__placeholder">
        <strong>Draft.</strong> This page is a structural scaffold. The
        binding policy text will be generated via Termly (or an equivalent)
        before public launch. Do not rely on the content below as a legal
        statement.
      </div>

      <h2>1. Who we are</h2>
      <p>
        ReViva (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) operates the website at{' '}
        <a href="https://www.reviva.live">www.reviva.live</a> and the related
        AI interview-training service. We are based in the United Kingdom.
      </p>
      <p>
        <em>
          [Termly: insert legal company name, Companies House number,
          registered office address, and data controller contact email here
          once the company is incorporated.]
        </em>
      </p>

      <h2>2. What data we collect</h2>
      <ul>
        <li>
          <strong>Account data:</strong> email address, hashed password,
          display name, training level, specialty preference.
        </li>
        <li>
          <strong>Subscription data:</strong> Stripe customer ID, subscription
          status, plan tier, billing-cycle dates. Card numbers are processed
          and stored by Stripe; we never see or store them.
        </li>
        <li>
          <strong>Session data:</strong> transcripts of your spoken responses,
          AI examiner responses, feedback scores, scenario metadata, and
          timestamps.
        </li>
        <li>
          <strong>Technical data:</strong> IP address, browser type, device
          type, page-view timestamps, error logs.
        </li>
      </ul>

      <h2>3. How we use it</h2>
      <p>
        <em>
          [Termly: enumerate purposes here. Recommended list:]
        </em>
      </p>
      <ul>
        <li>To provide the interview-training service you signed up for (contract).</li>
        <li>
          To improve scenario quality and AI examiner behaviour (legitimate
          interest).
        </li>
        <li>To bill you and manage your subscription (contract).</li>
        <li>To communicate service updates, security notices, and product news (legitimate interest; you can opt out of marketing).</li>
        <li>To comply with our legal obligations (legal obligation).</li>
      </ul>

      <h2>4. Lawful bases (UK GDPR Article 6)</h2>
      <p>
        <em>[Termly: list per-purpose lawful bases. Most are &ldquo;contract&rdquo; or &ldquo;legitimate interests&rdquo;.]</em>
      </p>

      <h2>5. Who we share your data with (sub-processors)</h2>
      <p>
        We use the following processors to run the service. Each has signed a
        Data Processing Agreement with us and provides appropriate safeguards
        for international transfers.
      </p>
      <ul>
        <li>
          <strong>Supabase</strong> — authentication, account database,
          session history. Servers in the EU (eu-west-1).
        </li>
        <li>
          <strong>Deepgram</strong> — real-time speech-to-text transcription.
          Servers in the United States.
        </li>
        <li>
          <strong>Google (Gemini API and Google Cloud Text-to-Speech)</strong>{' '}
          — AI examiner responses and voice synthesis. Servers in the United States.
        </li>
        <li>
          <strong>Stripe</strong> — subscription billing and payment processing.
          Servers in the United States.
        </li>
        <li>
          <strong>Vercel</strong> — frontend hosting and content delivery.
          Servers globally.
        </li>
        <li>
          <strong>Render</strong> — backend server hosting. Servers in the
          European Union (Frankfurt).
        </li>
        <li>
          <strong>Sentry</strong> — error tracking. Servers in the United
          States. <em>[Pending wiring.]</em>
        </li>
      </ul>

      <h2>6. International transfers</h2>
      <p>
        <em>
          [Termly: standard text about UK/EU Standard Contractual Clauses and
          the UK addendum where data goes to the US.]
        </em>
      </p>

      <h2>7. How long we keep it</h2>
      <ul>
        <li>Account data: while your account is open, plus 90 days after deletion request.</li>
        <li>Session transcripts: while your account is open, or until you delete them. You can request deletion of any session at any time.</li>
        <li>Billing data: 7 years (UK accounting law).</li>
        <li>Server logs: 30 days rolling.</li>
      </ul>

      <h2>8. Your rights</h2>
      <p>Under UK GDPR you have the right to:</p>
      <ul>
        <li>Access the personal data we hold about you.</li>
        <li>Correct inaccurate data.</li>
        <li>Delete your account and associated data (right to erasure).</li>
        <li>Object to processing based on legitimate interests.</li>
        <li>Receive a portable copy of your data.</li>
        <li>Lodge a complaint with the Information Commissioner&rsquo;s Office (<a href="https://ico.org.uk">ico.org.uk</a>).</li>
      </ul>
      <p>
        To exercise any of these rights, use the &ldquo;Delete account&rdquo;
        or &ldquo;Export my data&rdquo; buttons on your{' '}
        <a href="/profile">profile page</a>, or email us at{' '}
        <a href="mailto:privacy@reviva.live">privacy@reviva.live</a>.
      </p>

      <h2>9. Audio recording</h2>
      <p>
        Practice sessions record your voice for the purpose of providing the
        training service. Audio is transmitted in real time to Deepgram for
        transcription and is not retained by us as audio &mdash; only the
        text transcript is stored against your session history. Audio passes
        through Deepgram&rsquo;s service in accordance with their privacy
        policy.
      </p>

      <h2>10. Cookies</h2>
      <p>
        See our <a href="/cookies">Cookie Policy</a>.
      </p>

      <h2>11. Changes to this policy</h2>
      <p>
        We will post material changes here and notify active subscribers by
        email at least 14 days before they take effect.
      </p>

      <h2>12. Contact</h2>
      <p>
        Questions about this policy:{' '}
        <a href="mailto:privacy@reviva.live">privacy@reviva.live</a>.
      </p>
    </PageLayout>
  )
}
