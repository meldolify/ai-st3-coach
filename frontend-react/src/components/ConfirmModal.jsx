import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../lib/utils'
import { useEscapeKey } from '../hooks/useEscapeKey'

/**
 * ConfirmModal — Reusable confirmation dialog.
 * Replaces window.confirm with an animated modal.
 * Supports Escape key dismiss and auto-focus on cancel button.
 */
export default function ConfirmModal({
  isOpen,
  title = 'Confirm',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default', // 'default' | 'danger'
  onConfirm,
  onCancel,
}) {
  const cancelRef = useRef(null)

  useEscapeKey(onCancel, isOpen)

  // Auto-focus cancel button when modal opens
  useEffect(() => {
    if (isOpen && cancelRef.current) {
      cancelRef.current.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={onCancel}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="glass-card rounded-xl p-6 max-w-sm w-full !bg-white/[0.08] !backdrop-blur-2xl !border-white/[0.1]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-lg text-text-primary mb-2">
              {title}
            </h3>
            <p className="text-[14px] text-text-secondary mb-6 leading-relaxed">
              {message}
            </p>

            <div className="flex gap-3 justify-end">
              <button
                ref={cancelRef}
                onClick={onCancel}
                className="px-4 py-2 text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors rounded-md hover:bg-white/[0.06]"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                className={cn(
                  'px-4 py-2 text-[13px] font-medium text-white rounded-md transition-colors',
                  variant === 'danger'
                    ? 'bg-error hover:bg-red-700'
                    : 'bg-accent hover:bg-accent-hover'
                )}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
