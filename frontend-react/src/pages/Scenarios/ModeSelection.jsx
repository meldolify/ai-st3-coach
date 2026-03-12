import BackButton from '../../components/BackButton'
import { useSelectionStore } from '../../stores/selectionStore'

const difficultyDisplay = {
  easy: { label: 'Easy', emoji: '\u{1F7E2}', className: 'difficulty-easy' },
  medium: { label: 'Medium', emoji: '\u{1F7E1}', className: 'difficulty-medium' },
  strict: { label: 'Strict', emoji: '\u{1F534}', className: 'difficulty-strict' },
}

export default function ModeSelection({ onSelect, onBack }) {
  const difficulty = useSelectionStore((s) => s.selectedDifficulty)
  const diff = difficultyDisplay[difficulty] || difficultyDisplay.medium

  return (
    <div className="scenario-flow-page" data-testid="mode-selection">
      <BackButton label="Difficulty" onClick={onBack} />

      <div className="flow-header">
        <h1>Choose Your Mode</h1>
        <p>Select how you want to practice today</p>
      </div>

      <div className={`difficulty-indicator ${diff.className}`}>
        <span>{diff.emoji} {diff.label}</span>
      </div>

      <div className="mode-grid">
        <div className="mode-card mode-practice" onClick={() => onSelect('practice')}>
          <div className="mode-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect x="8" y="6" width="32" height="36" rx="2" stroke="currentColor" strokeWidth="2" />
              <path d="M14 14h20M14 22h20M14 30h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h2>Practice Mode</h2>
          <p>Choose specific scenarios to practice at your own pace</p>
          <ul>
            <li>Browse all available scenarios</li>
            <li>No time pressure</li>
            <li>Immediate feedback after each scenario</li>
            <li>Focus on specific topics</li>
          </ul>
        </div>

        <div className="mode-card mode-mock-exam" onClick={() => onSelect('mock-exam')}>
          <div className="mode-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="2" />
              <circle cx="24" cy="24" r="12" stroke="currentColor" strokeWidth="2" />
              <circle cx="24" cy="24" r="6" stroke="currentColor" strokeWidth="2" />
              <circle cx="24" cy="24" r="2" fill="currentColor" />
            </svg>
          </div>
          <h2>Mock Exam Mode</h2>
          <p>Simulate real interview conditions with timed scenarios</p>
          <ul>
            <li>Timed stations</li>
            <li>Hidden scenario topics</li>
            <li>Test your exam readiness</li>
            <li>Detailed performance review</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
