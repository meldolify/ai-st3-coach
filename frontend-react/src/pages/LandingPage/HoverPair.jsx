import { useState } from 'react'
import { cn } from '../../lib/utils'

/**
 * HoverPair — synchronised cross-element hover pattern (Ref #4 adapted).
 *
 * On desktop: side-by-side layout. The list (renderListItem) on the left,
 * the visual panel (renderVisual) on the right. Hovering a list item updates
 * `activeId` for both — visual panel switches to the hovered item, other
 * list items dim.
 *
 * On mobile: hover doesn't exist. We instead render `renderMobileCard` for
 * each item, all stacked vertically with no dim/highlight state. This matches
 * the existing `@media (hover: none)` discipline used throughout landing.css.
 *
 * Items must each have an `id` field. defaultActiveId picks the initially
 * highlighted item on desktop (first item if not provided). On mouse-leave
 * of the whole pair, the active item resets to defaultActiveId — keeps the
 * visual side stable rather than blanking when the cursor leaves.
 */
export function HoverPair({
  items,
  renderListItem,
  renderVisual,
  renderMobileCard,
  defaultActiveId,
  className,
}) {
  const initialId = defaultActiveId ?? items[0]?.id ?? null
  const [activeId, setActiveId] = useState(initialId)

  const activeItem = items.find((i) => i.id === activeId) || items[0]

  return (
    <>
      {/* Desktop: side-by-side, hover-paired */}
      <div
        className={cn(
          'hover-pair hidden md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] md:gap-12 lg:gap-20',
          className
        )}
        onMouseLeave={() => setActiveId(initialId)}
      >
        {/* List */}
        <ul className="hover-pair__list flex flex-col gap-3">
          {items.map((item) => {
            const isActive = activeId === item.id
            const isDimmed = activeId !== null && !isActive
            return (
              <li
                key={item.id}
                onMouseEnter={() => setActiveId(item.id)}
                className={cn(
                  'hover-pair__item cursor-pointer transition-opacity duration-300',
                  isDimmed ? 'opacity-50' : 'opacity-100'
                )}
              >
                {renderListItem(item, { isActive, isDimmed })}
              </li>
            )
          })}
        </ul>

        {/* Visual — pinned to the active item */}
        <div className="hover-pair__visual">{renderVisual(activeItem)}</div>
      </div>

      {/* Mobile: stacked cards, no hover state */}
      <div className={cn('hover-pair-mobile md:hidden flex flex-col gap-6', className)}>
        {items.map((item) => (
          <div key={item.id} className="hover-pair-mobile__card">
            {renderMobileCard(item)}
          </div>
        ))}
      </div>
    </>
  )
}
