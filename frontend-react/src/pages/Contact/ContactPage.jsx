import { useState } from 'react'
import PageLayout from '../../components/PageLayout'

/**
 * Contact page — single contact email + a Formspree-ready form.
 *
 * Two contact channels:
 *   1. Direct email to hello@reviva.live (need to wire Cloudflare email
 *      routing or Google Workspace; until then this is a placeholder address)
 *   2. The form below, which posts to Formspree once the endpoint is wired.
 *      Replace FORMSPREE_ENDPOINT with your real endpoint from formspree.io.
 */
const FORMSPREE_ENDPOINT = '' // TODO: paste Formspree endpoint URL once created

export default function ContactPage() {
  const [status, setStatus] = useState('idle') // 'idle' | 'sending' | 'sent' | 'error'
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus('sending')
    setErrorMessage('')

    if (!FORMSPREE_ENDPOINT) {
      setStatus('error')
      setErrorMessage(
        'Contact form is not yet wired up. Please email hello@reviva.live directly.'
      )
      return
    }

    const formData = new FormData(event.currentTarget)
    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
      })
      if (response.ok) {
        setStatus('sent')
        event.currentTarget.reset()
      } else {
        setStatus('error')
        setErrorMessage('Something went wrong sending the message. Please try emailing us instead.')
      }
    } catch {
      setStatus('error')
      setErrorMessage('Could not reach the form server. Please email us at hello@reviva.live.')
    }
  }

  return (
    <PageLayout title="Contact" lastUpdated={null}>
      <p>
        We aim to reply to every email within two working days. For account or
        billing issues, please include your account email address.
      </p>

      <h2>Email</h2>
      <ul>
        <li>
          General: <a href="mailto:hello@reviva.live">hello@reviva.live</a>
        </li>
        <li>
          Privacy &amp; data requests:{' '}
          <a href="mailto:privacy@reviva.live">privacy@reviva.live</a>
        </li>
        <li>
          Billing &amp; subscriptions:{' '}
          <a href="mailto:support@reviva.live">support@reviva.live</a>
        </li>
      </ul>

      <h2>Send us a message</h2>
      {status === 'sent' ? (
        <div className="page-layout__placeholder">
          <strong>Thanks &mdash; message received.</strong> We&rsquo;ll be in
          touch soon.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="contact-form">
          <label className="contact-form__field">
            <span>Your name</span>
            <input type="text" name="name" required autoComplete="name" />
          </label>
          <label className="contact-form__field">
            <span>Email address</span>
            <input type="email" name="email" required autoComplete="email" />
          </label>
          <label className="contact-form__field">
            <span>Subject</span>
            <input type="text" name="subject" required />
          </label>
          <label className="contact-form__field">
            <span>Message</span>
            <textarea name="message" rows={6} required></textarea>
          </label>
          <button
            type="submit"
            className="contact-form__submit"
            disabled={status === 'sending'}
          >
            {status === 'sending' ? 'Sending…' : 'Send message'}
          </button>
          {status === 'error' && (
            <p className="contact-form__error">{errorMessage}</p>
          )}
        </form>
      )}

      <style>{`
        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 16px;
        }
        .contact-form__field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .contact-form__field span {
          font-size: 0.88rem;
          font-weight: 500;
          color: rgba(42, 38, 32, 0.85);
        }
        .contact-form__field input,
        .contact-form__field textarea {
          padding: 10px 12px;
          border: 1px solid rgba(74, 93, 76, 0.2);
          border-radius: 6px;
          font-family: inherit;
          font-size: 0.95rem;
          background: #fff;
          color: #2A2620;
        }
        .contact-form__field input:focus,
        .contact-form__field textarea:focus {
          outline: none;
          border-color: #4A5D4C;
          box-shadow: 0 0 0 3px rgba(74, 93, 76, 0.15);
        }
        .contact-form__submit {
          align-self: flex-start;
          padding: 10px 22px;
          background: #4A5D4C;
          color: #fff;
          border: none;
          border-radius: 6px;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s;
        }
        .contact-form__submit:hover:not(:disabled) {
          background: #3A4A3C;
        }
        .contact-form__submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .contact-form__error {
          color: #B23A48;
          font-size: 0.9rem;
          margin: 0;
        }
      `}</style>
    </PageLayout>
  )
}
