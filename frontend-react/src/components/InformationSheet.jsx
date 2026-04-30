import { motion } from 'framer-motion'
import { cn } from '../lib/utils'

/**
 * InformationSheet — Displays candidate information for CTB/Consent prep phase.
 * Shows structured key-value patient/procedure details with optional clinical images.
 * Hides when the interview starts.
 */
export default function InformationSheet({ infoSheet, domain, onImageExpand }) {
  if (!infoSheet || !infoSheet.fields?.length) return null

  const title = domain === 'call_the_boss' ? 'Patient Information' : 'Scenario Information'
  const icon = domain === 'call_the_boss' ? 'phone' : 'clipboard'

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Title bar */}
      <div className="px-5 pt-4 pb-3 border-b border-organic-stone shrink-0">
        <div className="flex items-center gap-2.5">
          {icon === 'phone' ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-organic-amber">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-organic-amber">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
            </svg>
          )}
          <h2
            className="text-[15px] text-organic-bark uppercase tracking-[0.16em]"
            style={{ fontFamily: 'var(--font-organic-display)', fontWeight: 600 }}
          >
            {title}
          </h2>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 custom-scrollbar">
        <dl className="space-y-3">
          {infoSheet.fields.map((field, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
            >
              <dt className="text-[10px] font-semibold text-organic-amber uppercase tracking-[0.18em] mb-0.5">
                {field.key}
              </dt>
              <dd className="text-[13px] text-organic-bark leading-relaxed">
                {field.value}
              </dd>
            </motion.div>
          ))}
        </dl>

        {/* CTB images */}
        {infoSheet.images?.length > 0 && (
          <div className="mt-5 pt-4 border-t border-organic-stone">
            <p className="text-[10px] font-semibold text-organic-amber uppercase tracking-[0.18em] mb-2">
              Clinical Images
            </p>
            <div className="flex gap-2 flex-wrap">
              {infoSheet.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => onImageExpand?.(`/images/${img}`)}
                  className={cn(
                    'relative rounded-lg overflow-hidden cursor-pointer group',
                    'hover:ring-2 hover:ring-organic-amber/50 transition-all duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-organic-amber'
                  )}
                  aria-label={`View clinical image ${i + 1}`}
                >
                  <img
                    src={`/images/${img}`}
                    alt={`Clinical image ${i + 1}`}
                    className="w-24 h-24 object-cover"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
