/**
 * Sentry initialisation for the React SPA.
 *
 * No-op when VITE_SENTRY_DSN is unset (local dev) so callers don't need
 * to care whether Sentry is configured.
 */
import * as Sentry from '@sentry/react'
import { CONFIG } from '../config'

let initialised = false

export function initSentry() {
  if (initialised) return
  if (!CONFIG.SENTRY_DSN) return

  Sentry.init({
    dsn: CONFIG.SENTRY_DSN,
    environment: import.meta.env.MODE,

    // Error tracking only for now. Tracing + replays would help debugging
    // but add bundle weight and replays could record on-screen transcripts.
    // Enable later by raising tracesSampleRate.
    tracesSampleRate: 0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,

    sendDefaultPii: false,

    beforeSend(event) {
      // Belt-and-braces strip in case transcript content slips into an
      // error context. The contents of audio chunks should never be here
      // but the WebSocket handler is async-spaghetti enough that being
      // paranoid is cheap.
      const sensitive = [
        'transcript',
        'transcripts',
        'audio',
        'audioChunk',
        'audio_chunk',
        'user_transcript',
        'userTranscript',
        'feedbackText',
      ]
      for (const key of sensitive) {
        if (event.extra?.[key]) event.extra[key] = '[REDACTED]'
        if (event.contexts?.[key]) event.contexts[key] = '[REDACTED]'
      }
      return event
    },
  })

  initialised = true
  // eslint-disable-next-line no-console
  console.log(`[Sentry] enabled (env: ${import.meta.env.MODE})`)
}

export { Sentry }
