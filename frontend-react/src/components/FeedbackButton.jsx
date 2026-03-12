import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../lib/utils'

const btnBase = [
  'relative w-[56px] h-[56px] rounded-[16px]',
  'border border-black/[0.08] outline-none',
  'bg-white/[0.70] backdrop-blur-[12px]',
  'shadow-[0_4px_16px_rgba(0,0,0,0.06)]',
  'transition-all duration-200 cursor-pointer',
  'hover:bg-white/[0.85] hover:border-black/[0.12]',
  'hover:shadow-[0_6px_20px_rgba(0,0,0,0.10)]',
  'hover:-translate-y-0.5',
  'active:bg-white/[0.60] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] active:translate-y-0',
  'disabled:cursor-not-allowed disabled:opacity-30 disabled:grayscale-[50%]',
].join(' ')

export default function FeedbackButton({ visible, disabled, onClick }) {
  const title = disabled ? 'Feedback requested' : 'Get Feedback'

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          data-testid="feedback-button"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          onClick={onClick}
          disabled={disabled}
          className={cn(
            btnBase,
            'hover:border-[rgba(59,130,246,0.3)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.08),0_0_16px_rgba(59,130,246,0.2)]'
          )}
          title={title}
          aria-label={title}
        >
          <div className="flex items-center justify-center w-full h-full">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
              <path d="M9 12h6" />
              <path d="M9 16h6" />
            </svg>
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
