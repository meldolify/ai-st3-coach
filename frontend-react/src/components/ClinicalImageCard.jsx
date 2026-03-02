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
        'rounded-xl overflow-hidden cursor-pointer group',
        'hover:shadow-lg transition-shadow duration-200',
        fillHeight && 'h-full'
      )}
      onClick={() => onExpand?.(imageSrc)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onExpand?.(imageSrc) } }}
      role="button"
      tabIndex={0}
      aria-label={`Clinical image for ${scenarioTitle}. Press Enter to expand.`}
    >
      <div className={cn('relative', fillHeight && 'h-full flex items-center justify-center bg-black/[0.03]')}>
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
            'absolute inset-0 bg-black/[0.04] animate-pulse',
            fillHeight ? 'h-full' : compact ? 'h-[200px]' : 'h-[280px]'
          )} />
        )}

        {/* Expand icon overlay */}
        <div
          className={cn(
            'absolute top-3 right-3 p-1.5 rounded-md',
            'bg-white/[0.70] backdrop-blur-sm',
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
            className="text-white/70"
          >
            <path d="M15 3h6v6" />
            <path d="M9 21H3v-6" />
            <path d="M21 3l-7 7" />
            <path d="M3 21l7-7" />
          </svg>
        </div>

        {/* Label */}
        <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/60 to-transparent">
          <span className="text-[11px] text-white/90 font-medium">
            Clinical Image
          </span>
        </div>
      </div>
    </motion.div>
  )
}
