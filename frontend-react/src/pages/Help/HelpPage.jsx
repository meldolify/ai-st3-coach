import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageLayout from '../../components/PageLayout'

/**
 * Help / FAQ page — collapsible Q&A by topic.
 *
 * Content is authored here, not in a CMS. Each topic group contains an
 * array of { q, a } pairs. To add a question, drop another entry. Use the
 * placeholder marker style for unfinished answers.
 */
const FAQ_GROUPS = [
  {
    id: 'getting-started',
    title: 'Getting started',
    questions: [
      {
        q: 'What is ReViva?',
        a: (
          <>
            <p>
              ReViva is an AI examiner that runs voice-based mock interviews
              for surgical trainees preparing for the UK ST3 specialty
              selection. You pick a scenario, the AI conducts a 5&ndash;8
              minute interview, and at the end gives you a spoken debrief and
              a score.
            </p>
          </>
        ),
      },
      {
        q: 'Do I need a subscription to try it?',
        a: (
          <p>
            No. Several scenarios are free for any signed-in user &mdash;
            including a clinical case, a &ldquo;call the boss&rdquo; phone
            consult, a consent station, and a structured-interview station.
            Subscriptions unlock the full library across all four station
            types.
          </p>
        ),
      },
      {
        q: 'What equipment do I need?',
        a: (
          <p>
            A laptop or desktop with a working microphone, a modern browser
            (Chrome, Edge, or Safari are tested), and a stable internet
            connection. Headphones are strongly recommended so the AI
            doesn&rsquo;t pick up its own voice.
          </p>
        ),
      },
    ],
  },
  {
    id: 'using-the-app',
    title: 'Using the app',
    questions: [
      {
        q: 'How do I interrupt the AI examiner?',
        a: (
          <p>
            Just start talking. The AI uses streaming speech recognition and
            will stop and listen as soon as it detects you speaking &mdash;
            same as a real examiner.
          </p>
        ),
      },
      {
        q: 'Can I retry a scenario at a different difficulty?',
        a: (
          <p>
            Yes. Each scenario has Easy, Medium, and Strict examiner
            personalities. From the scenario selection screen you can change
            difficulty before starting.
          </p>
        ),
      },
      {
        q: 'What does the score mean?',
        a: (
          <p>
            We grade from 0 to 5: 0 (Unsafe), 1 (Poor), 2 (Borderline), 3
            (Pass), 4 (Strong), 5 (Outstanding). The score is calibrated to
            match an ST3 selection panel&rsquo;s station score, not a
            university exam mark.
          </p>
        ),
      },
    ],
  },
  {
    id: 'account-and-billing',
    title: 'Account &amp; billing',
    questions: [
      {
        q: 'How do I cancel my subscription?',
        a: (
          <p>
            Go to your <Link to="/profile">profile page</Link> and click
            &ldquo;Manage subscription&rdquo;. This opens the Stripe customer
            portal where you can cancel, change plan, or update card details.
            Cancellation takes effect at the end of your current billing
            cycle.
          </p>
        ),
      },
      {
        q: 'Can I get a refund?',
        a: (
          <p>
            See section 5 of our <Link to="/terms">Terms of Service</Link> for
            the full refund policy. In short: UK consumer law gives you a
            14-day cancellation right for digital services you haven&rsquo;t
            yet accessed.
          </p>
        ),
      },
      {
        q: 'How do I delete my account?',
        a: (
          <p>
            From your <Link to="/profile">profile page</Link>, scroll to the
            &ldquo;Delete account&rdquo; section. This removes all your
            personal data, session transcripts, and cancels any active
            subscription. <em>[Pending implementation &mdash; see the
            launch backlog.]</em>
          </p>
        ),
      },
    ],
  },
  {
    id: 'privacy-and-data',
    title: 'Privacy &amp; data',
    questions: [
      {
        q: 'Is my voice recorded?',
        a: (
          <p>
            Your voice is streamed in real time to our speech-to-text provider
            (Deepgram). Only the resulting text transcript is stored against
            your session history &mdash; we don&rsquo;t keep the audio. Full
            details in our <Link to="/privacy">Privacy Policy</Link>.
          </p>
        ),
      },
      {
        q: 'Can I download my session transcripts?',
        a: (
          <p>
            Yes &mdash; from the profile page you can export all your data
            (transcripts, scores, account information) in a single download.{' '}
            <em>[Pending implementation &mdash; see the launch backlog.]</em>
          </p>
        ),
      },
    ],
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    questions: [
      {
        q: 'The AI didn’t respond to me &mdash; what happened?',
        a: (
          <p>
            Most often this is a microphone permission issue or a network
            blip. Check that your browser has microphone access for{' '}
            <code>reviva.live</code>, and reload the page if needed. If it
            keeps happening, please email us at{' '}
            <a href="mailto:support@reviva.live">support@reviva.live</a> with
            the time of the issue and we can look at the server logs.
          </p>
        ),
      },
      {
        q: 'Audio is cutting out / I can’t hear the examiner',
        a: (
          <p>
            Check your browser&rsquo;s audio output device and your system
            volume. Some Bluetooth headsets have known compatibility
            issues with browser audio streams &mdash; try wired headphones
            or the laptop speakers as a test.
          </p>
        ),
      },
    ],
  },
]

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="faq-item">
      <button
        className={`faq-item__question ${open ? 'is-open' : ''}`}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span>{q}</span>
        <span className="faq-item__chevron" aria-hidden="true">
          {open ? '−' : '+'}
        </span>
      </button>
      {open && <div className="faq-item__answer">{a}</div>}
    </div>
  )
}

export default function HelpPage() {
  return (
    <PageLayout title="Help &amp; FAQ" lastUpdated={null}>
      <p>
        Most questions are covered below. If you can&rsquo;t find what
        you&rsquo;re after, drop us a line on the{' '}
        <Link to="/contact">contact page</Link>.
      </p>

      {FAQ_GROUPS.map((group) => (
        <section key={group.id} className="faq-group">
          <h2 dangerouslySetInnerHTML={{ __html: group.title }} />
          {group.questions.map((item, idx) => (
            <FAQItem key={`${group.id}-${idx}`} q={item.q} a={item.a} />
          ))}
        </section>
      ))}

      <style>{`
        .faq-group { margin-bottom: 24px; }
        .faq-item {
          border-bottom: 1px solid rgba(74, 93, 76, 0.12);
        }
        .faq-item__question {
          width: 100%;
          background: none;
          border: none;
          padding: 14px 0;
          font-size: 1rem;
          font-weight: 500;
          color: #2A2620;
          font-family: inherit;
          text-align: left;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          transition: color 0.15s;
        }
        .faq-item__question:hover { color: #4A5D4C; }
        .faq-item__chevron {
          font-size: 1.4rem;
          color: rgba(74, 93, 76, 0.6);
          font-weight: 300;
          line-height: 1;
          width: 20px;
          text-align: center;
        }
        .faq-item__answer {
          padding: 0 0 16px 4px;
          color: rgba(42, 38, 32, 0.9);
        }
        .faq-item__answer p:last-child { margin-bottom: 0; }
      `}</style>
    </PageLayout>
  )
}
