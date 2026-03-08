/**
 * BackButton — Unified back button component (Fix 1)
 * Same size, padding, hover effect across all selection pages.
 * Supports dynamic labels (e.g., "← Emergencies" at topic level)
 */

const baseStyle = {
  background: '#FFFFFF',
  color: '#1F2937',
  padding: '12px 24px',
  border: '1px solid #D1D5DB',
  borderRadius: '12px',
  fontSize: '14px',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
}

export default function BackButton({ onClick, label = 'Back', className = '' }) {
  return (
    <button
      className={`back-btn ${className}`}
      style={baseStyle}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.borderColor = '#4A9D8F'
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(74, 157, 143, 0.15)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.borderColor = '#D1D5DB'
        e.currentTarget.style.boxShadow = 'none'
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = 'scale(0.98)'
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
    >
      <span aria-hidden="true">&larr;</span> {label}
    </button>
  )
}
