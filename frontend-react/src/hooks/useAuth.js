import { useState, useEffect } from 'react'
import { supabaseClient } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { CONFIG } from '../config'

/**
 * useAuth — Restores Supabase session on mount and hydrates Zustand authStore.
 *
 * Supabase SDK persists the session in localStorage. This hook restores that
 * session so both the Zustand store and window.currentUser are available
 * across ALL pages (called once at App root).
 */
export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const { setCurrentUser, setUserProfile, setUserSubscription, setAuthLoading } = useAuthStore()

  useEffect(() => {
    const hydrateUser = async (sessionUser) => {
      setUser(sessionUser)
      window.currentUser = sessionUser
      setCurrentUser(sessionUser)

      if (sessionUser && CONFIG.SUPABASE_URL) {
        try {
          // Load profile
          const { data: profile } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', sessionUser.id)
            .single()
          if (profile) setUserProfile(profile)

          // Load subscription
          const { data: sub } = await supabaseClient
            .from('subscriptions')
            .select('*')
            .eq('user_id', sessionUser.id)
            .in('status', ['active', 'trialing'])
            .order('created_at', { ascending: false })
            .limit(1)
            .single()
          if (sub) setUserSubscription(sub)
        } catch (err) {
          console.warn('[useAuth] Failed to load profile/subscription:', err)
        }
      }
    }

    // Restore session from localStorage
    supabaseClient.auth.getSession().then(({ data }) => {
      const sessionUser = data?.session?.user || null
      hydrateUser(sessionUser)
    }).catch((err) => {
      console.warn('[useAuth] Failed to restore session:', err)
    }).finally(() => {
      setLoading(false)
      setAuthLoading(false)
    })

    // Listen for session changes (token refresh, sign out in another tab)
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user || null
      hydrateUser(sessionUser)
    })

    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return { user, loading }
}
