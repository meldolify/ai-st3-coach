import { useState, useEffect } from 'react'
import { supabaseClient } from '../lib/supabase'

/**
 * useAuth — Restores Supabase session on mount.
 *
 * The vanilla landing page (index.html) handles login/signup. Supabase SDK
 * persists the session in localStorage. This hook restores that session
 * so window.currentUser is available when useSession.js builds the WebSocket URL.
 */
export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Restore session from localStorage
    supabaseClient.auth.getSession().then(({ data }) => {
      const sessionUser = data?.session?.user || null
      setUser(sessionUser)
      window.currentUser = sessionUser
      setLoading(false)
    })

    // Listen for session changes (token refresh, sign out in another tab)
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user || null
      setUser(sessionUser)
      window.currentUser = sessionUser
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}
