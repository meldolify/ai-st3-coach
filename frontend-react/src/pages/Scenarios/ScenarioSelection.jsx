import { useState } from 'react'
import { useSelectionStore } from '../../stores/selectionStore'
import { useAuthStore, selectIsLoggedIn, selectIsPremium } from '../../stores/authStore'
import { CATEGORIES, SUBCATEGORIES, TOPICS, IMAGE_MAP } from '../../data/scenarios'
import { CONFIG } from '../../config'
import BackButton from '../../components/BackButton'

/* ------------------------------------------------------------------ */
/*  Helper: category icons (inline SVGs matching vanilla design)       */
/* ------------------------------------------------------------------ */

function getCategoryIcon(categoryId) {
  switch (categoryId) {
    case 'clinical':
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 2l-2 4h-2l-2-4" />
          <path d="M12 6h4" />
          <path d="M14 6v16" />
          <path d="M10 12h8" />
        </svg>
      )
    case 'call-the-boss':
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
        </svg>
      )
    case 'consent':
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      )
    case 'structured':
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <rect x="3" y="4" width="4" height="4" rx="0.5" />
          <rect x="3" y="10" width="4" height="4" rx="0.5" />
          <rect x="3" y="16" width="4" height="4" rx="0.5" />
          <polyline points="4 5.5 5 6.5 7 4.5" />
          <polyline points="4 11.5 5 12.5 7 10.5" />
        </svg>
      )
    default:
      return <span style={{ fontSize: 28 }}>📋</span>
  }
}

/* ------------------------------------------------------------------ */
/*  Helper: category descriptions                                      */
/* ------------------------------------------------------------------ */

function getCategoryDescription(categoryId) {
  switch (categoryId) {
    case 'clinical':
      return 'Infections, hand trauma, skin cancer, burns, aesthetics, and more clinical scenarios'
    case 'call-the-boss':
      return 'Escalation scenarios and communication with senior colleagues'
    case 'consent':
      return 'Consent discussions for hand trauma, burns, skin cancer, and breast surgery'
    case 'structured':
      return 'Audit, research, teaching, ethics, and governance scenarios'
    default:
      return ''
  }
}

/* ------------------------------------------------------------------ */
/*  ScenarioSelection component                                        */
/* ------------------------------------------------------------------ */

export default function ScenarioSelection({ onSelectScenario, onBack, onShowUpgrade }) {
  const [level, setLevel] = useState('category') // 'category' | 'subcategory' | 'topic'
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState(null)

  const difficulty = useSelectionStore((s) => s.selectedDifficulty)
  const isLoggedIn = useAuthStore(selectIsLoggedIn)
  const isPremium = useAuthStore(selectIsPremium)

  /* ---------- Derived names ---------- */

  const selectedCategoryName = selectedCategory
    ? CATEGORIES.find((c) => c.id === selectedCategory)?.name || selectedCategory
    : null

  const selectedSubcategoryName = selectedSubcategory
    ? (SUBCATEGORIES[selectedCategory] || []).find((s) => s.id === selectedSubcategory)?.name ||
      selectedSubcategory
    : null

  /* ---------- Access control ---------- */

  function canAccess(promptFile) {
    if (isPremium) return true
    if (!isLoggedIn) return false
    return CONFIG.FREE_TIER_SCENARIOS.includes(promptFile)
  }

  /* ---------- Navigation ---------- */

  function selectCategory(catId) {
    setSelectedCategory(catId)
    setLevel('subcategory')
  }

  function selectSubcategory(subId) {
    setSelectedSubcategory(subId)
    setLevel('topic')
  }

  function handleBack() {
    if (level === 'topic') {
      setLevel('subcategory')
      setSelectedSubcategory(null)
      return
    }
    if (level === 'subcategory') {
      setLevel('category')
      setSelectedCategory(null)
      return
    }
    onBack()
  }

  const backLabel =
    level === 'category'
      ? 'Mode Selection'
      : level === 'subcategory'
        ? 'Categories'
        : selectedSubcategoryName || 'Subcategory'

  /* ---------- Render ---------- */

  return (
    <div className="scenario-selection">
      {/* Breadcrumb */}
      <nav className="scenario-breadcrumb">
        <div className="breadcrumb-inner">
          <BackButton onClick={handleBack} label={backLabel} />

          <div className="breadcrumb-trail">
            <button
              className={`breadcrumb-item ${level === 'category' ? 'active' : ''}`}
              onClick={() => {
                setLevel('category')
                setSelectedCategory(null)
                setSelectedSubcategory(null)
              }}
            >
              <span className="breadcrumb-label">Categories</span>
            </button>

            <span className="breadcrumb-separator">/</span>

            <button
              className={`breadcrumb-item ${level === 'subcategory' ? 'active' : ''} ${!selectedCategory ? 'disabled' : ''}`}
              onClick={() => {
                if (selectedCategory) {
                  setLevel('subcategory')
                  setSelectedSubcategory(null)
                }
              }}
              disabled={!selectedCategory}
            >
              <span className="breadcrumb-label">{selectedCategoryName || 'Subcategory'}</span>
            </button>

            <span className="breadcrumb-separator">/</span>

            <button
              className={`breadcrumb-item ${level === 'topic' ? 'active' : ''} ${!selectedSubcategory ? 'disabled' : ''}`}
              disabled={!selectedSubcategory}
            >
              <span className="breadcrumb-label">{selectedSubcategoryName || 'Topics'}</span>
            </button>
          </div>

          {difficulty && (
            <span className={`difficulty-indicator difficulty-indicator--${difficulty}`}>
              {difficulty === 'easy' ? '🟢 Easy' : difficulty === 'medium' ? '🟡 Medium' : '🔴 Strict'}
            </span>
          )}
        </div>
      </nav>

      {/* Category Level */}
      {level === 'category' && (
        <section className="scenario-level">
          <header className="level-header">
            <span className="level-eyebrow">Select Category</span>
            <h2 className="level-title">
              What would you like to <em>practice?</em>
            </h2>
          </header>
          <div className="scenario-cards-grid">
            {CATEGORIES.map((cat) => {
              const subcats = SUBCATEGORIES[cat.id] || []
              const totalTopics = subcats.reduce((sum, sub) => {
                const topics = TOPICS[sub.id]?.topics || []
                return sum + topics.length
              }, 0)
              return (
                <article
                  key={cat.id}
                  className="scenario-card"
                  onClick={() => selectCategory(cat.id)}
                >
                  <div className="card-header">
                    <div className="card-icon-frame">{getCategoryIcon(cat.id)}</div>
                    <span className="card-count">{subcats.length} areas</span>
                  </div>
                  <h3 className="card-title">{cat.name}</h3>
                  <p className="card-description">{getCategoryDescription(cat.id)}</p>
                  <span className="card-topic-count">{totalTopics} scenarios</span>
                </article>
              )
            })}
          </div>
        </section>
      )}

      {/* Subcategory Level */}
      {level === 'subcategory' && (
        <section className="scenario-level">
          <header className="level-header">
            <span className="level-eyebrow">{selectedCategoryName}</span>
            <h2 className="level-title">
              Choose a <em>topic area</em>
            </h2>
          </header>
          <div className="scenario-cards-grid scenario-cards-grid--compact">
            {(SUBCATEGORIES[selectedCategory] || []).map((subcat) => {
              const topicCount = (TOPICS[subcat.id]?.topics || []).length
              return (
                <article
                  key={subcat.id}
                  className="scenario-card"
                  onClick={() => selectSubcategory(subcat.id)}
                >
                  <div className="card-header">
                    <div className="card-icon-frame">
                      <span>{subcat.icon}</span>
                    </div>
                    <span className="card-count">{topicCount} scenarios</span>
                  </div>
                  <h3 className="card-title">{subcat.name}</h3>
                </article>
              )
            })}
          </div>
        </section>
      )}

      {/* Topic Level */}
      {level === 'topic' && (
        <section className="scenario-level">
          <header className="level-header">
            <span className="level-eyebrow">{selectedSubcategoryName}</span>
            <h2 className="level-title">
              Select a <em>scenario</em>
            </h2>
          </header>
          <div className="scenario-cards-grid scenario-cards-grid--topics">
            {(TOPICS[selectedSubcategory]?.topics || []).map(([promptFile, displayName]) => {
              const accessible = canAccess(promptFile)
              const imageFile = IMAGE_MAP[promptFile] || null
              return (
                <article
                  key={promptFile}
                  className={`scenario-card topic-card ${!accessible ? 'locked' : ''}`}
                  onClick={() => {
                    if (accessible) {
                      onSelectScenario({
                        category: selectedCategory,
                        title: displayName,
                        promptFile,
                        imageFile,
                      })
                    } else {
                      onShowUpgrade()
                    }
                  }}
                >
                  {difficulty && (
                    <span
                      className={`difficulty-badge difficulty-badge--${difficulty === 'strict' ? 'hard' : difficulty}`}
                    >
                      {difficulty}
                    </span>
                  )}
                  {!accessible && (
                    <span className="lock-badge">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <rect
                          x="3"
                          y="7"
                          width="10"
                          height="7"
                          rx="1.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M5 7V5a3 3 0 016 0v2"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                  )}
                  <h3 className="card-title">{displayName}</h3>
                </article>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
