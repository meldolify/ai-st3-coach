import { useEffect } from 'react'

/**
 * useEscapeKey — Calls handler when Escape key is pressed.
 * Only active when `active` is true.
 */
export function useEscapeKey(handler, active = true) {
  useEffect(() => {
    if (!active) return

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        handler()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [handler, active])
}
