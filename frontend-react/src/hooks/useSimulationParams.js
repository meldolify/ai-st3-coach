import { useState, useEffect } from 'react'

/**
 * Read simulation parameters from sessionStorage (set by index.html before navigation).
 * Returns { params, clearParams } where params is null if missing/invalid.
 */
export function useSimulationParams() {
  const [params, setParams] = useState(null)

  useEffect(() => {
    const raw = sessionStorage.getItem('simulationParams')
    if (!raw) return

    try {
      const parsed = JSON.parse(raw)
      setParams(parsed)
    } catch (e) {
      console.error('[useSimulationParams] Failed to parse:', e)
    }
  }, [])

  const clearParams = () => {
    sessionStorage.removeItem('simulationParams')
    setParams(null)
  }

  return { params, clearParams }
}
