import { useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEscapeKey } from '../hooks/useEscapeKey'
import TranscriptPanel from './TranscriptPanel'

/**
 * MobileTranscriptDrawer — Framer Motion bottom-sheet wrapping TranscriptPanel.
 * Slides up from the bottom of the viewport to ~85% height. Drag the handle
 * down past 80px or tap the backdrop / press Escape to close.
 */
export function MobileTranscriptDrawer({ open, onClose, messages, personaName }) {
  useEscapeKey(useCallback(() => onClose?.(), [onClose]), open)

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop — tap to close */}
          <motion.div
            key="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-organic-bark/40 lg:hidden"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            key="drawer-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Conversation transcript"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 80 || info.velocity.y > 600) onClose?.()
            }}
            className="fixed inset-x-0 bottom-0 z-[70] lg:hidden flex flex-col
                       max-h-[85vh] h-[85vh]
                       bg-organic-sand border-t border-organic-stone
                       rounded-t-[24px] shadow-[0_-12px_32px_-8px_rgba(42,37,32,0.25)]"
          >
            {/* Drag handle */}
            <div className="flex flex-col items-center pt-2 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-organic-stone" aria-hidden="true" />
            </div>

            {/* Close button (top-right) */}
            <button
              onClick={onClose}
              aria-label="Close transcript"
              className="absolute top-3 right-3 p-2 text-organic-bark/60 hover:text-organic-bark transition-colors z-10"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>

            {/* Transcript content — flex-1 with internal scroll */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <TranscriptPanel messages={messages} personaName={personaName} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
