import { useState } from 'react'
import { PERSONA_CONFIG } from '../../config'
import BackButton from '../../components/BackButton'

// Per-difficulty visual styling. Role label + description live on
// PERSONA_CONFIG itself so the landing page (\u00a7B) and this page stay in sync.
const CARD_VISUALS = {
  easy: { colorClass: 'green' },
  medium: { colorClass: 'orange' },
  strict: { colorClass: 'purple' },
}

export default function DifficultySelection({ onSelect, onBack }) {
  const [expandedCard, setExpandedCard] = useState(null)

  function handleCardClick(difficulty) {
    if (window.innerWidth <= 768) {
      if (expandedCard === difficulty) {
        onSelect(difficulty)
      } else {
        setExpandedCard(difficulty)
      }
    } else {
      onSelect(difficulty)
    }
  }

  function handleButtonClick(e, difficulty) {
    e.stopPropagation()
    onSelect(difficulty)
  }

  return (
    <div className="gradient-cards-page" data-testid="difficulty-selection">
      <BackButton onClick={onBack} label="Specialties" />

      <div className="gradient-cards-header">
        <h1>Choose Your Examiner</h1>
        <p>Select your interview difficulty</p>
      </div>

      <div className="gradient-cards-container">
        {Object.entries(CARD_VISUALS).map(([difficulty, visuals]) => {
          const persona = PERSONA_CONFIG[difficulty]
          const isExpanded = expandedCard === difficulty

          return (
            <div
              key={difficulty}
              className={`gradient-card${isExpanded ? ' expanded' : ''}`}
              data-difficulty={difficulty}
              onClick={() => handleCardClick(difficulty)}
            >
              <span
                className={`gradient-panel gradient-panel--${visuals.colorClass}`}
              />
              <span
                className={`gradient-panel gradient-panel--blur gradient-panel--${visuals.colorClass}`}
              />
              <span className="animated-blobs">
                <span className="blob blob--top" />
                <span className="blob blob--bottom" />
              </span>
              <div className="card-content">
                <img
                  src={persona.image}
                  alt={persona.name}
                  className="persona-avatar"
                />
                <h2 className="persona-name">{persona.name}</h2>
                <p className={`persona-role persona-role--${difficulty}`}>
                  {persona.roleLabel}
                </p>
                <p className="persona-description">{persona.description}</p>
                <button
                  className="btn-select-persona"
                  onClick={(e) => handleButtonClick(e, difficulty)}
                >
                  Select {persona.name.split(' ')[1]}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
