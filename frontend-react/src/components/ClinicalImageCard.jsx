import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../lib/utils'

/**
 * ClinicalImageCard — Prominent clinical image display.
 * Desktop: ~280px card in center column.
 * Mobile (compact): ~200px card at top.
 * Hidden entirely when no image exists (no placeholder).
 * Click to open fullscreen modal.
 */
export default function ClinicalImageCard({ imageFile, scenarioTitle, onExpand, compact = false }) {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  // Don't render if no image or image failed to load
  if (!imageFile || imageError) return null

  // Resolve image path — images are in public/images/
  const imageSrc = imageFile.startsWith('http')
    ? imageFile
    : `/images/${imageFile}`

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className={cn(
        'rounded-2xl overflow-hidden cursor-pointer group',
        'glass-panel hover:shadow-lg transition-shadow duration-200'
      )}
      onClick={() => onExpand?.(imageSrc)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onExpand?.(imageSrc) } }}
      role="button"
      tabIndex={0}
      aria-label={`Clinical image for ${scenarioTitle}. Press Enter to expand.`}
    >
      <div className="relative">
        <img
          src={imageSrc}
          alt={`Clinical image: ${scenarioTitle || 'scenario'}`}
          className={cn(
            'w-full object-cover transition-transform duration-300',
            'group-hover:scale-[1.02]',
            imageLoaded ? 'opacity-100' : 'opacity-0',
            compact ? 'h-[200px]' : 'h-[280px]'
          )}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />

        {/* Loading skeleton */}
        {!imageLoaded && (
          <div className={cn(
            'absolute inset-0 bg-bg-secondary animate-pulse',
            compact ? 'h-[200px]' : 'h-[280px]'
          )} />
        )}

        {/* Expand icon overlay on hover */}
        <div
          className={cn(
            'absolute top-3 right-3 p-1.5 rounded-md',
            'bg-white/80 backdrop-blur-sm',
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
            className="text-text-primary"
          >
            <path d="M15 3h6v6" />
            <path d="M9 21H3v-6" />
            <path d="M21 3l-7 7" />
            <path d="M3 21l7-7" />
          </svg>
        </div>

        {/* Subtle label */}
        <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/30 to-transparent">
          <span className="text-[11px] text-white/90 font-medium">
            Clinical Image
          </span>
        </div>
      </div>
    </motion.div>
  )
}
