import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import SimulationRoom from './components/SimulationRoom'
import LandingPage from './pages/LandingPage/LandingPage'
import AuthPage from './pages/Auth/AuthPage'
import ScenarioFlow from './pages/Scenarios/ScenarioFlow'
import ProfilePage from './pages/Profile/ProfilePage'
import PromptLab from './pages/PromptLab/PromptLab'

function AppRoutes() {
  // Restore Supabase session + hydrate Zustand store on every page load
  useAuth()

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/scenarios/*" element={<ScenarioFlow />} />
      <Route path="/simulation" element={<SimulationRoom />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/prompt-lab" element={<PromptLab />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
