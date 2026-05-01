import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../lib/utils'

/**
 * ClinicalImageCard — Clinical image display with frosted glass styling.
 * Desktop (fillHeight): fills parent height as a glass panel.
 * Mobile (compact): 200px card.
 * Click to open fullscreen modal.
 */
export default function ClinicalImageCard({ imageFile, scenarioTitle, onExpand, compact = false, fillHeight = false }) {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  if (!imageFile || imageError) return null

  const imageSrc = imageFile.startsWith('http')
    ? imageFile
    : `/images/${imageFile}`

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className={cn(
        'cursor-pointer group h-full flex flex-col min-h-0',
        'transition-shadow duration-200'
      )}
      onClick={() => onExpand?.(imageSrc)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onExpand?.(imageSrc) } }}
      role="button"
      tabIndex={0}
      aria-label={`Clinical image for ${scenarioTitle}. Press Enter to expand.`}
    >
      {/* Header bar — matches transcript / info-sheet pattern */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-organic-stone shrink-0">
        <h2
          className="text-[12px] text-organic-forest uppercase tracking-[0.2em]"
          style={{ fontFamily: 'var(--font-organic-display)', fontWeight: 600 }}
        >
          Clinical Image
        </h2>
        <div className="flex items-center gap-1.5 text-[10px] text-organic-bark/45 uppercase tracking-[0.16em] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span>Click to expand</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-organic-bark/55"
            aria-hidden="true"
          >
            <path d="M15 3h6v6" />
            <path d="M9 21H3v-6" />
            <path d="M21 3l-7 7" />
            <path d="M3 21l7-7" />
          </svg>
        </div>
      </div>

      {/* Image area */}
      <div
        className={cn(
          'relative flex-1 min-h-0',
          fillHeight && 'flex items-center justify-center bg-organic-cream-deep'
        )}
      >
        <img
          src={imageSrc}
          alt={`Clinical image: ${scenarioTitle || 'scenario'}`}
          className={cn(
            'w-full transition-transform duration-300',
            'group-hover:scale-[1.02]',
            imageLoaded ? 'opacity-100' : 'opacity-0',
            fillHeight ? 'h-full object-contain' : compact ? 'h-[200px] object-cover' : 'h-[280px] object-cover'
          )}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />

        {!imageLoaded && (
          <div className={cn(
            'absolute inset-0 bg-organic-stone/40 animate-pulse',
            fillHeight ? 'h-full' : compact ? 'h-[200px]' : 'h-[280px]'
          )} />
        )}
      </div>
    </motion.div>
  )
}
