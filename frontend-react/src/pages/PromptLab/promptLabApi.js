import { CONFIG } from '../../config'
import { supabase } from '../../lib/supabase'

const BASE = `${CONFIG.HTTP_BACKEND_URL}/prompt-lab/api`

async function getBearerHeaders() {
  // Backend gates /prompt-lab/api/* with a Supabase Bearer token + admin
  // email allowlist. Grab the current session's access token if we have one.
  try {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}
  } catch {
    return {}
  }
}

async function api(path, options = {}) {
  const authHeaders = await getBearerHeaders()
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options.headers,
    },
    ...options,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(text || `HTTP ${res.status}`)
  }
  return res.json()
}

// --- Topics & Config ---

export const getTopics = () => api('/topics')
export const getConfig = () => api('/config')

// --- Sessions ---

export const createSession = (promptSections, metadata) =>
  api('/session', {
    method: 'POST',
    body: JSON.stringify({ promptSections, metadata }),
  })

export const sendMessage = (sessionId, message) =>
  api('/chat', {
    method: 'POST',
    body: JSON.stringify({ sessionId, message }),
  })

export const requestFeedback = (sessionId, feedbackPrompt, topic) =>
  api('/feedback', {
    method: 'POST',
    body: JSON.stringify({ sessionId, feedbackPrompt, topic }),
  })

export const saveManualTranscript = (sessionId) =>
  api('/save-manual', {
    method: 'POST',
    body: JSON.stringify({ sessionId }),
  })

// --- Prompts ---

export const getPrompts = (difficulty, topic) =>
  api(`/prompts/${difficulty}?topic=${encodeURIComponent(topic)}`)

export const savePrompts = (difficulty, sections, topic) =>
  api(`/prompts/${difficulty}?topic=${encodeURIComponent(topic)}`, {
    method: 'PUT',
    body: JSON.stringify({ sections }),
  })

// --- Feedback Prompts ---

export const getFeedbackPrompt = (difficulty, topic) =>
  api(`/feedback-prompt/${difficulty}?topic=${encodeURIComponent(topic)}`)

export const saveFeedbackPrompt = (difficulty, content, personalityContent, topic) =>
  api(`/feedback-prompt/${difficulty}?topic=${encodeURIComponent(topic)}`, {
    method: 'PUT',
    body: JSON.stringify({ content, personalityContent }),
  })

// --- Tests ---

export const getTests = (topic) =>
  api(`/tests?topic=${encodeURIComponent(topic)}`)

export const runTest = (testId, topic, promptSections, feedbackPrompt) =>
  api('/run-test', {
    method: 'POST',
    body: JSON.stringify({ testId, topic, promptSections, feedbackPrompt }),
  })

export const runDifficultyComparison = (testId, topic, difficulties) =>
  api('/run-difficulty-comparison', {
    method: 'POST',
    body: JSON.stringify({ testId, topic, difficulties }),
  })

// --- Transcripts ---

export const getTranscripts = () => api('/transcripts')

export const getTranscript = (id) => api(`/transcripts/${id}`)

export const deleteTranscript = (id) =>
  api(`/transcripts/${id}`, { method: 'DELETE' })

// --- Changes & PR ---

export const getChanges = () => api('/changes')

export const createPR = () =>
  api('/create-pr', { method: 'POST' })
