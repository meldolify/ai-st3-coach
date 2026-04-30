import { cn } from '../lib/utils'

/**
 * PersonaCard — extracted from the inline persona block in SimulationRoom.
 * Two variants:
 *   - default (compact=false): full card with avatar, name, title, difficulty pill
 *   - compact:                 horizontal row for mobile / dense placements
 */

const DIFFICULTY_LABEL = { easy: 'Friendly', medium: 'Standard', strict: 'Strict' }
const DIFFICULTY_COLOR = { easy: '#10B981', medium: '#D4943A', strict: '#DC2626' }

export function PersonaCard({ persona, difficulty, domain, compact = false, className }) {
  const dotColor = DIFFICULTY_COLOR[difficulty] || DIFFICULTY_COLOR.medium
  const label = DIFFICULTY_LABEL[difficulty] || difficulty

  const subtitle =
    domain === 'call_the_boss'
      ? 'Consultant On Call'
      : domain === 'consent'
      ? 'Patient'
      : persona?.title || ''

  if (compact) {
    return (
      <div className={cn('flex items-center gap-3 p-4', className)} data-testid="persona-card">
        <div
          className="w-12 h-12 rounded-full bg-cover bg-center shrink-0 border-2"
          style={{
            backgroundImage: persona?.image ? `url(${persona.image})` : 'none',
            backgroundColor: persona?.accentColor || '#2D5A3D',
            borderColor: `${dotColor}55`,
          }}
        />
        <div className="flex-1 min-w-0">
          <p className="font-[var(--font-organic-display)] text-[16px] text-organic-bark truncate">
            {persona?.name || ''}
          </p>
          <p className="text-[12px] text-organic-bark/60 truncate">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-organic-cream-deep shrink-0">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: dotColor }} />
          <span className="text-[11px] font-medium text-organic-bark/80">{label}</span>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn('flex flex-col items-center justify-center gap-3 p-5 h-full', className)}
      data-testid="persona-card"
    >
      <div
        className="w-20 h-20 rounded-full bg-cover bg-center border-4 shadow-md shrink-0"
        style={{
          backgroundImage: persona?.image ? `url(${persona.image})` : 'none',
          backgroundColor: persona?.accentColor || '#2D5A3D',
          borderColor: `${dotColor}55`,
        }}
      />
      <div className="text-center min-w-0">
        <p className="font-[var(--font-organic-display)] text-[18px] text-organic-bark leading-tight">
          {persona?.name || ''}
        </p>
        <p className="text-[12px] text-organic-bark/60 mt-1">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-organic-cream-deep">
        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dotColor }} />
        <span className="text-[12px] font-medium text-organic-bark/80">{label}</span>
      </div>
    </div>
  )
}
