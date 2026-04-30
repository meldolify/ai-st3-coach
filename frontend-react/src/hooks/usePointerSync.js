import { useEffect } from 'react'

/**
 * usePointerSync — single shared document `pointermove` listener that writes
 * the cursor position to CSS custom properties on `document.documentElement`.
 *
 * Multiple GlowCard instances all read the same `--x` / `--y` / `--xp` / `--yp`
 * via `var(--x)`, so we don't need a listener per card. The first hook
 * invocation attaches the listener; further invocations bump a refcount.
 * The last unmount detaches the listener.
 *
 *   --x, --y    : cursor position in CSS pixels
 *   --xp, --yp  : cursor position normalised to 0..1 across the viewport
 */

let refCount = 0
let listener = null

function handlePointerMove(e) {
  const root = document.documentElement
  root.style.setProperty('--x', e.clientX.toFixed(2))
  root.style.setProperty('--y', e.clientY.toFixed(2))
  root.style.setProperty('--xp', (e.clientX / window.innerWidth).toFixed(3))
  root.style.setProperty('--yp', (e.clientY / window.innerHeight).toFixed(3))
}

export function usePointerSync() {
  useEffect(() => {
    if (refCount === 0) {
      listener = handlePointerMove
      document.addEventListener('pointermove', listener, { passive: true })
    }
    refCount += 1

    return () => {
      refCount -= 1
      if (refCount === 0 && listener) {
        document.removeEventListener('pointermove', listener)
        listener = null
      }
    }
  }, [])
}
