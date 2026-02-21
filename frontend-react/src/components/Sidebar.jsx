import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../lib/utils'
import { CATEGORIES, SUBCATEGORIES, TOPICS } from '../data/scenarios'

/**
 * Sidebar — Collapsible scenario navigation.
 * Desktop: 64px collapsed (icons only), 280px expanded on hover.
 * Mobile: Full overlay drawer.
 * Single component — CSS handles responsive behavior.
 */
export default function Sidebar({
  currentPromptFile,
  isOpen,
  onToggle,
  onSelectScenario,
}) {
  const [expandedCategories, setExpandedCategories] = useState(new Set())
  const [expandedSubcategories, setExpandedSubcategories] = useState(new Set())
  const [isHovered, setIsHovered] = useState(false)

  // Auto-expand category containing current scenario
  const currentCategoryId = useMemo(() => {
    if (!currentPromptFile) return null
    for (const cat of CATEGORIES) {
      const subs = SUBCATEGORIES[cat.id] || []
      for (const sub of subs) {
        const topicData = TOPICS[sub.id]
        if (topicData?.topics.some(([file]) => file === currentPromptFile)) {
          return cat.id
        }
      }
    }
    return null
  }, [currentPromptFile])

  const toggleCategory = (catId) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(catId)) next.delete(catId)
      else next.add(catId)
      return next
    })
  }

  const toggleSubcategory = (subId) => {
    setExpandedSubcategories((prev) => {
      const next = new Set(prev)
      if (next.has(subId)) next.delete(subId)
      else next.add(subId)
      return next
    })
  }

  const isExpanded = isOpen || isHovered

  return (
    <>
      {/* Mobile overlay backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-40 lg:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.nav
        aria-label="Scenario navigation"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          'fixed top-[56px] left-0 bottom-0 z-40',
          'bg-bg-elevated border-r border-bg-secondary',
          'flex flex-col overflow-hidden',
          // Desktop: slim collapsed, expand on hover
          'hidden lg:flex',
          // Mobile: full overlay
          isOpen && '!flex'
        )}
        animate={{
          width: isExpanded ? 280 : 64,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        {/* Scrollable nav items */}
        <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
          {CATEGORIES.map((cat) => {
            const isCatExpanded = expandedCategories.has(cat.id)
            const isActiveCat = cat.id === currentCategoryId
            const subs = SUBCATEGORIES[cat.id] || []

            return (
              <div key={cat.id} className="mb-1">
                {/* Category header */}
                <button
                  onClick={() => toggleCategory(cat.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2.5',
                    'text-left transition-colors duration-150',
                    'hover:bg-bg-secondary',
                    isActiveCat && 'border-l-3 border-accent'
                  )}
                  title={cat.name}
                  aria-label={cat.name}
                  aria-expanded={isCatExpanded}
                >
                  <span className="text-[18px] shrink-0 w-8 text-center">
                    {cat.icon}
                  </span>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex items-center justify-between flex-1 min-w-0"
                      >
                        <span className="text-[13px] font-medium text-text-primary truncate">
                          {cat.name}
                        </span>
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className={cn(
                            'text-text-muted transition-transform duration-200 shrink-0',
                            isCatExpanded && 'rotate-90'
                          )}
                        >
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>

                {/* Subcategories */}
                <AnimatePresence>
                  {isCatExpanded && isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      {subs.map((sub) => {
                        const isSubExpanded = expandedSubcategories.has(sub.id)
                        const topicData = TOPICS[sub.id]
                        const topics = topicData?.topics || []

                        return (
                          <div key={sub.id}>
                            {/* Subcategory header */}
                            <button
                              onClick={() => toggleSubcategory(sub.id)}
                              className={cn(
                                'w-full flex items-center gap-2 pl-12 pr-4 py-2',
                                'text-left transition-colors hover:bg-bg-secondary'
                              )}
                              aria-label={sub.name}
                              aria-expanded={isSubExpanded}
                            >
                              <span className="text-[13px] shrink-0">
                                {sub.icon}
                              </span>
                              <span className="text-[12px] text-text-secondary truncate flex-1">
                                {sub.name}
                              </span>
                              <svg
                                width="10"
                                height="10"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className={cn(
                                  'text-text-muted transition-transform duration-200 shrink-0',
                                  isSubExpanded && 'rotate-90'
                                )}
                              >
                                <path d="M9 18l6-6-6-6" />
                              </svg>
                            </button>

                            {/* Topics */}
                            <AnimatePresence>
                              {isSubExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.15 }}
                                  className="overflow-hidden"
                                >
                                  {topics.map(([promptFile, name]) => {
                                    const isActive = promptFile === currentPromptFile

                                    return (
                                      <button
                                        key={promptFile}
                                        onClick={() => onSelectScenario(promptFile, name)}
                                        className={cn(
                                          'w-full text-left pl-16 pr-4 py-1.5',
                                          'text-[12px] transition-colors',
                                          isActive
                                            ? 'text-accent font-medium border-l-2 border-accent bg-accent-light/30'
                                            : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
                                        )}
                                      >
                                        {name}
                                      </button>
                                    )
                                  })}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </motion.nav>
    </>
  )
}
