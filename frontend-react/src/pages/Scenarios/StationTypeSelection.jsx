import BackButton from '../../components/BackButton'
import { useSelectionStore } from '../../stores/selectionStore'

const difficultyDisplay = {
  easy: { label: 'Easy', emoji: '\u{1F7E2}', className: 'difficulty-easy' },
  medium: { label: 'Medium', emoji: '\u{1F7E1}', className: 'difficulty-medium' },
  strict: { label: 'Strict', emoji: '\u{1F534}', className: 'difficulty-strict' },
}

const stationTypes = [
  {
    id: 'clinical',
    className: 'station-type-card station-clinical',
    emoji: '\u{1F4CB}',
    title: 'Clinical Station',
    description: 'Random clinical scenario from any subspecialty',
  },
  {
    id: 'call-the-boss',
    className: 'station-type-card station-call-the-boss',
    emoji: '\u{1F4DE}',
    title: 'Call-The-Boss',
    description: 'Random emergency escalation scenario',
  },
  {
    id: 'consent',
    className: 'station-type-card station-consent',
    emoji: '\u{270D}\u{FE0F}',
    title: 'Consent Station',
    description: 'Random consent discussion scenario',
  },
  {
    id: 'structured',
    className: 'station-type-card station-structured',
    emoji: '\u{1F4DD}',
    title: 'Structured Interview',
    description: 'Random audit, ethics, or governance scenario',
  },
]

export default function StationTypeSelection({ onSelect, onBack }) {
  const difficulty = useSelectionStore((s) => s.selectedDifficulty)
  const diff = difficultyDisplay[difficulty] || difficultyDisplay.medium

  return (
    <div className="scenario-flow-page">
      <BackButton label="Mock Type" onClick={onBack} />

      <div className="flow-header">
        <h1>Select Station Type</h1>
        <p>A random scenario will be selected from your chosen category</p>
      </div>

      <div className={`difficulty-indicator ${diff.className}`}>
        <span>{diff.emoji} {diff.label}</span>
      </div>

      <div className="station-type-grid">
        {stationTypes.map((station) => (
          <div
            key={station.id}
            className={station.className}
            onClick={() => onSelect(station.id)}
          >
            <div className="mode-icon">
              <span className="station-emoji">{station.emoji}</span>
            </div>
            <h2>{station.title}</h2>
            <p>{station.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
