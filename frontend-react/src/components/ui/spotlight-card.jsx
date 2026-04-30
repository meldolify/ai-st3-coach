import { cn } from '../../lib/utils'
import { usePointerSync } from '../../hooks/usePointerSync'

/**
 * GlowCard — cursor-follow spotlight card with radiant border.
 * Adapted from 21st.dev (spotlight-card). Original was TSX; converted to JSX.
 *
 * Modifications from the original:
 *   - Pointer tracking moved to a shared `usePointerSync()` hook so all cards
 *     share one document `pointermove` listener instead of N listeners.
 *   - Static `[data-glow]::before/::after` rules moved to index.css.
 *   - `noLayout` prop skips the built-in grid/padding so the card can be a
 *     pure outline wrapper around panels that already manage their own layout.
 *   - `glowColorMap` extended with `amber`, `forest`, `sand` for organic palette.
 */

const glowColorMap = {
  blue: { base: 220, spread: 200 },
  purple: { base: 280, spread: 300 },
  green: { base: 120, spread: 200 },
  red: { base: 0, spread: 200 },
  orange: { base: 30, spread: 200 },
  amber: { base: 35, spread: 200 },
  forest: { base: 145, spread: 180 },
  sand: { base: 40, spread: 120 },
}

const sizeMap = {
  sm: 'w-48 h-64',
  md: 'w-64 h-80',
  lg: 'w-80 h-96',
}

export function GlowCard({
  children,
  className = '',
  glowColor = 'amber',
  size = 'md',
  width,
  height,
  customSize = false,
  noLayout = false,
}) {
  usePointerSync()

  const { base, spread } = glowColorMap[glowColor] || glowColorMap.amber

  const sizeClasses = customSize || noLayout ? '' : sizeMap[size]
  const layoutClasses = noLayout
    ? ''
    : 'rounded-2xl grid grid-rows-[1fr_auto] shadow-[0_1rem_2rem_-1rem_black] p-4 gap-4 backdrop-blur-[5px]'
  const aspectClass = !customSize && !noLayout ? 'aspect-[3/4]' : ''

  const inlineStyles = {
    '--base': base,
    '--spread': spread,
    '--radius': '14',
    '--border': '2',
    '--backdrop': 'transparent',
    '--backup-border': 'var(--backdrop)',
    '--size': '220',
    '--outer': '1',
    '--border-size': 'calc(var(--border, 2) * 1px)',
    '--spotlight-size': 'calc(var(--size, 150) * 1px)',
    '--hue': 'calc(var(--base) + (var(--xp, 0) * var(--spread, 0)))',
    backgroundImage: `radial-gradient(
      var(--spotlight-size) var(--spotlight-size) at
      calc(var(--x, 0) * 1px)
      calc(var(--y, 0) * 1px),
      hsl(var(--hue, 210) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 70) * 1%) / var(--bg-spot-opacity, 0.10)),
      transparent
    )`,
    backgroundColor: 'var(--backdrop, transparent)',
    backgroundSize: 'calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)))',
    backgroundPosition: '50% 50%',
    backgroundAttachment: 'fixed',
    border: 'var(--border-size) solid var(--backup-border)',
    position: 'relative',
    touchAction: 'none',
  }

  if (width !== undefined) inlineStyles.width = typeof width === 'number' ? `${width}px` : width
  if (height !== undefined) inlineStyles.height = typeof height === 'number' ? `${height}px` : height

  return (
    <div data-glow style={inlineStyles} className={cn(sizeClasses, aspectClass, layoutClasses, className)}>
      <div data-glow />
      {children}
    </div>
  )
}
