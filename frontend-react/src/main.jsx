import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initSentry } from './lib/sentry'
import './index.css'
import App from './App.jsx'

// Init Sentry before React renders so SDK can patch global error handlers
// before any component mounts. No-op when VITE_SENTRY_DSN is unset.
initSentry()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
