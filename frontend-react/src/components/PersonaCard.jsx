import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../lib/utils'

/**
 * PersonaCard — Compact examiner info card.
 * 64px circular photo + name + title. Not dominant.
 */
export default function PersonaCard({ persona }) {
  const [imageError, setImageError] = useState(false)

  if (!persona) return null

  const imageSrc = persona.image?.startsWith('http')
    ? persona.image
    : persona.image

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg',
        'bg-bg-elevated border border-bg-secondary',
        'shadow-sm'
      )}
    >
      {/* Circular photo */}
      <div className="shrink-0">
        {!imageError && imageSrc ? (
          <img
            src={imageSrc}
            alt={persona.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-accent-light"
            onError={() => setImageError(true)}
          />
        ) : (
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-medium"
            style={{ backgroundColor: persona.accentColor || '#4A5D4C' }}
          >
            {persona.name?.charAt(0) || '?'}
          </div>
        )}
      </div>

      {/* Name + title */}
      <div className="min-w-0">
        <p className="text-[14px] font-medium text-text-primary truncate">
          {persona.name}
        </p>
        <p className="text-[12px] text-text-secondary truncate">
          {persona.title}
        </p>
      </div>
    </motion.div>
  )
}
