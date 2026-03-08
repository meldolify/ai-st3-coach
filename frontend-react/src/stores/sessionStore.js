import { create } from 'zustand'

export const useSessionStore = create((set) => ({
  // WebSocket session state
  session: null,
  isConnected: false,
  isAISpeaking: false,
  inFeedbackMode: false,

  // Actions
  setSession: (session) => set({ session }),
  setConnected: (connected) => set({ isConnected: connected }),
  setAISpeaking: (speaking) => set({ isAISpeaking: speaking }),
  setFeedbackMode: (mode) => set({ inFeedbackMode: mode }),

  clearSession: () => set({
    session: null,
    isConnected: false,
    isAISpeaking: false,
    inFeedbackMode: false,
  }),
}))
