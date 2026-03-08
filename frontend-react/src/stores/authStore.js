import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Fine-grained selectors — use these for components that only need specific fields
export const selectIsLoggedIn = (state) => state.currentUser !== null
export const selectIsPremium = (state) => {
  const sub = state.userSubscription
  return sub?.status === 'active' || sub?.status === 'trialing'
}
export const selectAuthLoading = (state) => state.authLoading

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // Auth state
      currentUser: null,
      userProfile: null,
      userSubscription: null,
      currentSessionHistoryId: null,
      authMode: 'login', // 'login' | 'signup'
      authLoading: true,

      // Actions
      setCurrentUser: (user) => set({ currentUser: user }),
      setUserProfile: (profile) => set({ userProfile: profile }),
      setUserSubscription: (subscription) => set({ userSubscription: subscription }),
      setCurrentSessionHistoryId: (id) => set({ currentSessionHistoryId: id }),
      setAuthMode: (mode) => set({ authMode: mode }),
      setAuthLoading: (loading) => set({ authLoading: loading }),

      logout: () => set({
        currentUser: null,
        userProfile: null,
        userSubscription: null,
        currentSessionHistoryId: null,
        authMode: 'login',
      }),

      // Computed
      isLoggedIn: () => get().currentUser !== null,
      isPremium: () => {
        const sub = get().userSubscription
        return sub?.status === 'active' || sub?.status === 'trialing'
      },
    }),
    {
      name: 'auth-storage',
      // Only persist non-sensitive fields
      partialize: (state) => ({
        authMode: state.authMode,
      }),
    }
  )
)
