import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Read simulation parameters from sessionStorage (set by ScenarioFlow before navigation).
 * Re-reads when location.search changes (used by scenario switching via query param).
 */
export function useSimulationParams() {
  const [params, setParams] = useState(null)
  const location = useLocation()

  useEffect(() => {
    const raw = sessionStorage.getItem('simulationParams')
    if (!raw) return

    try {
      const parsed = JSON.parse(raw)
      setParams(parsed)
    } catch (e) {
      console.error('[useSimulationParams] Failed to parse:', e)
    }
  }, [location.search])

  const clearParams = () => {
    sessionStorage.removeItem('simulationParams')
    setParams(null)
  }

  return { params, clearParams }
}
