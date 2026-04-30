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
        'rounded-[20px] overflow-hidden cursor-pointer group h-full',
        'transition-shadow duration-200',
        fillHeight && 'h-full'
      )}
      onClick={() => onExpand?.(imageSrc)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onExpand?.(imageSrc) } }}
      role="button"
      tabIndex={0}
      aria-label={`Clinical image for ${scenarioTitle}. Press Enter to expand.`}
    >
      <div className={cn('relative h-full', fillHeight && 'flex items-center justify-center bg-organic-cream-deep')}>
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

        {/* Expand icon overlay */}
        <div
          className={cn(
            'absolute top-3 right-3 p-1.5 rounded-md',
            'bg-organic-cream/85 backdrop-blur-sm border border-organic-stone',
            'opacity-0 group-hover:opacity-100 transition-opacity duration-200'
          )}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-organic-bark/80"
          >
            <path d="M15 3h6v6" />
            <path d="M9 21H3v-6" />
            <path d="M21 3l-7 7" />
            <path d="M3 21l7-7" />
          </svg>
        </div>

        {/* Label */}
        <div className="absolute bottom-0 left-0 right-0 px-4 py-2 bg-gradient-to-t from-organic-bark/70 via-organic-bark/30 to-transparent">
          <span
            className="text-[10px] text-organic-cream uppercase tracking-[0.2em]"
            style={{ fontFamily: 'var(--font-organic-display)', fontWeight: 600 }}
          >
            Clinical Image
          </span>
        </div>
      </div>
    </motion.div>
  )
}
