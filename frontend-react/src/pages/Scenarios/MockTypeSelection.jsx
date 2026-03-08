import BackButton from '../../components/BackButton'
import { useSelectionStore } from '../../stores/selectionStore'

const difficultyDisplay = {
  easy: { label: 'Easy', emoji: '\u{1F7E2}', className: 'difficulty-easy' },
  medium: { label: 'Medium', emoji: '\u{1F7E1}', className: 'difficulty-medium' },
  strict: { label: 'Strict', emoji: '\u{1F534}', className: 'difficulty-strict' },
}

export default function MockTypeSelection({ onSelect, onBack }) {
  const difficulty = useSelectionStore((s) => s.selectedDifficulty)
  const diff = difficultyDisplay[difficulty] || difficultyDisplay.medium

  return (
    <div className="scenario-flow-page">
      <BackButton label="Mode Selection" onClick={onBack} />

      <div className="flow-header">
        <h1>Mock Exam Options</h1>
        <p>Choose your mock exam format</p>
      </div>

      <div className={`difficulty-indicator ${diff.className}`}>
        <span>{diff.emoji} {diff.label}</span>
      </div>

      <div className="mock-type-grid">
        <div className="mock-type-card mock-by-station" onClick={() => onSelect('by-station')}>
          <div className="mode-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect x="8" y="8" width="32" height="32" rx="4" stroke="currentColor" strokeWidth="2" />
              <circle cx="16" cy="16" r="2" fill="currentColor" />
              <circle cx="32" cy="16" r="2" fill="currentColor" />
              <circle cx="24" cy="24" r="2" fill="currentColor" />
              <circle cx="16" cy="32" r="2" fill="currentColor" />
              <circle cx="32" cy="32" r="2" fill="currentColor" />
            </svg>
          </div>
          <h2>Mock by Station</h2>
          <p>Practice a single random station from a specific category</p>
          <ul>
            <li>Choose station type</li>
            <li>Random scenario</li>
            <li>Topic hidden until start</li>
            <li>5-minute timer with feedback</li>
          </ul>
        </div>

        <div className="mock-type-card full-mock-exam" onClick={() => onSelect('full-mock')}>
          <div className="mode-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect x="8" y="6" width="32" height="36" rx="2" stroke="currentColor" strokeWidth="2" />
              <path d="M14 14h8M14 22h20M14 30h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M14 14l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2>Full Mock Exam</h2>
          <p>Complete 3-station mock interview experience</p>
          <ul>
            <li>Clinical (2) + Communication (2) + Structured (3)</li>
            <li>10 min per station</li>
            <li>All feedback at end</li>
            <li>Comprehensive performance report</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
