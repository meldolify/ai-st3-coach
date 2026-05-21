import { CONFIG } from '../config'
import { supabaseClient } from './supabase'

/**
 * account.js — GDPR Article 15 (export) and Article 17 (delete) helpers.
 *
 * Both hit /api/account on the backend, which:
 *  - Verifies the Supabase Bearer token
 *  - Acts only on the authenticated user's own data (no userId in body)
 *  - Cascades through Stripe + Supabase tables in the correct order
 */

async function getAccessToken() {
  const {
    data: { session },
  } = await supabaseClient.auth.getSession()
  if (!session?.access_token) {
    throw new Error('Not signed in')
  }
  return session.access_token
}

/**
 * exportMyData — Triggers a JSON download of everything we hold against
 * the caller's account.
 */
export async function exportMyData() {
  const token = await getAccessToken()

  const response = await fetch(`${CONFIG.HTTP_BACKEND_URL}/api/account/export`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) {
    let detail = ''
    try {
      const body = await response.json()
      detail = body?.error ? `: ${body.error}` : ''
    } catch {
      /* ignore parse failure */
    }
    throw new Error(`Data export failed (${response.status})${detail}`)
  }

  const blob = await response.blob()
  const filename =
    response.headers
      .get('Content-Disposition')
      ?.match(/filename="?([^"]+)"?/)?.[1] || `reviva-export-${Date.now()}.json`

  // Trigger browser download.
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

/**
 * deleteMyAccount — Cascading delete. Caller must have already confirmed
 * intent (this function performs no UI confirmation of its own).
 *
 * Returns the partial_errors array if some steps failed but the auth row
 * was still deleted (e.g. Stripe was already cancelled manually). Throws
 * on a hard failure where the user is still able to sign in.
 */
export async function deleteMyAccount() {
  const token = await getAccessToken()

  const response = await fetch(`${CONFIG.HTTP_BACKEND_URL}/api/account`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })

  const body = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(body?.error || `Account deletion failed (${response.status})`)
  }

  // Sign out locally so the now-orphaned token is cleared from this device.
  try {
    await supabaseClient.auth.signOut()
  } catch {
    /* ignore — the auth row is gone anyway */
  }

  return body.partial_errors || []
}
