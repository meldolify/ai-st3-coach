import { PERSONA_CONFIG } from '../../config'

/**
 * SpecialtySelection — First step: pick your specialty.
 * Only Plastic Surgery ST3 is active. Others are "Coming Soon".
 *
 * Props:
 *   onSelect(specialty) - called when user picks a specialty
 */
export default function SpecialtySelection({ onSelect }) {
  return (
    <div className="selection-page" data-testid="specialty-selection">
      <div className="header--minimal" style={{ textAlign: 'center', padding: '40px 0 24px', marginBottom: '32px' }}>
        <h1 className="page-title">ReViva Interview Trainer</h1>
        <p style={{ fontSize: '15px', color: 'var(--text-secondary)', fontWeight: 400 }}>
          Select your specialty to begin
        </p>
      </div>

      <div className="specialty-grid">
        {/* Active: Plastic Surgery */}
        <div
          className="specialty-card"
          onClick={() => onSelect('plastic-surgery')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onSelect('plastic-surgery')}
        >
          <div className="specialty-icon">🔪</div>
          <h2>Plastic Surgery ST3</h2>
          <p>Clinical scenarios, communication stations, and structured interviews</p>
        </div>

        {/* Coming Soon */}
        <div className="specialty-card coming-soon">
          <div className="specialty-icon">🔒</div>
          <h2>Coming Soon</h2>
          <p>More specialties in development</p>
        </div>

        <div className="specialty-card coming-soon">
          <div className="specialty-icon">🔒</div>
          <h2>Coming Soon</h2>
          <p>More specialties in development</p>
        </div>
      </div>
    </div>
  )
}
