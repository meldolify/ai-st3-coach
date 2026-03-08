import { useState } from 'react'
import { PERSONA_CONFIG } from '../../config'
import BackButton from '../../components/BackButton'

const CARD_DATA = {
  easy: {
    colorClass: 'green',
    roleLabel: 'Easy Examiner',
    description:
      'Your friendly neighborhood consultant who remembers being a trainee. Warm encouragement, generous hints, and celebrates your wins.',
  },
  medium: {
    colorClass: 'orange',
    roleLabel: 'Medium Examiner',
    description:
      'Fair and balanced \u2014 the real ST3 interview experience. Straight-shooting feedback with occasional nudges.',
  },
  strict: {
    colorClass: 'purple',
    roleLabel: 'Strict Examiner',
    description:
      'No nonsense. High standards. Expects excellence or you\u2019ll hear about it. Brutally honest with sky-high expectations.',
  },
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
    <div className="gradient-cards-page">
      <BackButton onClick={onBack} label="Specialties" />

      <div className="gradient-cards-header">
        <h1>Choose Your Examiner</h1>
        <p>Select your interview difficulty</p>
      </div>

      <div className="gradient-cards-container">
        {Object.entries(CARD_DATA).map(([difficulty, data]) => {
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
                className={`gradient-panel gradient-panel--${data.colorClass}`}
              />
              <span
                className={`gradient-panel gradient-panel--blur gradient-panel--${data.colorClass}`}
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
                  {data.roleLabel}
                </p>
                <p className="persona-description">{data.description}</p>
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
