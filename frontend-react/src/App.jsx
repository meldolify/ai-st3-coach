import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import ErrorBoundary from './components/ErrorBoundary'

// Lazy-load route components for code splitting
const LandingPage = lazy(() => import('./pages/LandingPage/LandingPage'))
const AuthPage = lazy(() => import('./pages/Auth/AuthPage'))
const ScenarioFlow = lazy(() => import('./pages/Scenarios/ScenarioFlow'))
const SimulationRoom = lazy(() => import('./components/SimulationRoom'))
const ProfilePage = lazy(() => import('./pages/Profile/ProfilePage'))
const PromptLab = lazy(() => import('./pages/PromptLab/PromptLab'))

function LoadingFallback() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #e5e5e5', borderTopColor: '#4A5D4C', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

function AppRoutes() {
  // Restore Supabase session + hydrate Zustand store on every page load
  useAuth()

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/scenarios/*" element={<ScenarioFlow />} />
        <Route path="/simulation" element={<SimulationRoom />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/prompt-lab" element={<PromptLab />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ErrorBoundary>
  )
}
