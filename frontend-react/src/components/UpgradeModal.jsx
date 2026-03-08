import { useState, useCallback } from 'react'
import { startCheckout } from '../lib/subscription'

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2000,
}

const modalStyle = {
  background: '#FFFFFF',
  border: '1px solid #D1D5DB',
  borderRadius: '20px',
  padding: '40px',
  maxWidth: '450px',
  width: '90%',
  textAlign: 'center',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
  position: 'relative',
}

const closeStyle = {
  position: 'absolute',
  top: '16px',
  right: '16px',
  background: 'none',
  border: 'none',
  fontSize: '24px',
  cursor: 'pointer',
  color: '#6B7280',
  padding: '4px 8px',
  lineHeight: 1,
}

const titleStyle = {
  fontSize: '28px',
  fontWeight: 600,
  marginBottom: '16px',
  color: '#0F766E',
}

const subtitleStyle = {
  color: '#475569',
  marginBottom: '24px',
  lineHeight: 1.6,
}

const toggleWrapStyle = {
  display: 'flex',
  gap: '8px',
  justifyContent: 'center',
  marginBottom: '24px',
}

const planBtnBase = {
  padding: '10px 24px',
  border: '1px solid #D1D5DB',
  borderRadius: '10px',
  cursor: 'pointer',
  fontWeight: 500,
  fontSize: '14px',
  transition: 'all 0.2s',
}

const priceAmountStyle = {
  fontSize: '36px',
  fontWeight: 700,
  color: '#0F766E',
}

const pricePeriodStyle = {
  fontSize: '16px',
  color: '#6B7280',
  marginLeft: '4px',
}

const savingsStyle = {
  fontSize: '13px',
  color: '#D97706',
  fontWeight: 500,
  marginTop: '4px',
  marginBottom: '20px',
}

const benefitsStyle = {
  textAlign: 'left',
  listStyle: 'none',
  padding: 0,
  marginBottom: '24px',
}

const benefitItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 0',
  color: '#1F2937',
  borderBottom: '1px solid #E5E7EB',
}

const ctaBtnStyle = {
  width: '100%',
  padding: '16px',
  fontSize: '16px',
  fontWeight: 600,
  borderRadius: '12px',
  border: 'none',
  cursor: 'pointer',
  background: '#0F766E',
  color: '#FFFFFF',
  transition: 'all 0.3s ease',
}

/**
 * UpgradeModal — Stripe checkout modal with monthly/annual plan toggle.
 * Self-contained styles (no external CSS dependency).
 */
export default function UpgradeModal({ onClose, title, message }) {
  const [selectedPlan, setSelectedPlan] = useState('monthly')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCheckout = useCallback(async () => {
    setError('')
    setLoading(true)
    try {
      await startCheckout(selectedPlan)
    } catch (err) {
      setError(err.message || 'Unable to start checkout. Please try again.')
      setLoading(false)
    }
  }, [selectedPlan])

  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget) onClose()
  }, [onClose])

  const isAnnual = selectedPlan === 'annual'

  return (
    <div style={overlayStyle} onClick={handleOverlayClick}>
      <div style={modalStyle}>
        <button style={closeStyle} onClick={onClose} type="button">
          ×
        </button>

        <h2 style={titleStyle}>{title || 'Unlock Plastic Surgery ST3'}</h2>
        <p style={subtitleStyle}>
          {message || 'Get full access to all Plastic Surgery interview scenarios and mock exams.'}
        </p>

        {/* Plan toggle */}
        <div style={toggleWrapStyle}>
          <button
            style={{
              ...planBtnBase,
              background: !isAnnual ? '#0F766E' : '#FFFFFF',
              color: !isAnnual ? '#FFFFFF' : '#1F2937',
              borderColor: !isAnnual ? '#0F766E' : '#D1D5DB',
            }}
            onClick={() => setSelectedPlan('monthly')}
            type="button"
          >
            Monthly
          </button>
          <button
            style={{
              ...planBtnBase,
              background: isAnnual ? '#0F766E' : '#FFFFFF',
              color: isAnnual ? '#FFFFFF' : '#1F2937',
              borderColor: isAnnual ? '#0F766E' : '#D1D5DB',
            }}
            onClick={() => setSelectedPlan('annual')}
            type="button"
          >
            Annual
          </button>
        </div>

        {/* Pricing */}
        <div>
          <span style={priceAmountStyle}>{isAnnual ? '£99.99' : '£14.99'}</span>
          <span style={pricePeriodStyle}>{isAnnual ? '/year' : '/month'}</span>
          <div style={savingsStyle}>
            {isAnnual ? 'Save £80 compared to monthly!' : '\u00A0'}
          </div>
        </div>

        {/* Benefits */}
        <ul style={benefitsStyle}>
          {[
            'All 165+ clinical scenarios',
            'Mock exam mode with timer',
            'Detailed feedback & scoring',
            'Progress tracking & analytics',
            'New scenarios added regularly',
          ].map((benefit) => (
            <li key={benefit} style={benefitItemStyle}>
              <span style={{ color: '#0F766E', fontSize: '18px' }}>✓</span>
              {benefit}
            </li>
          ))}
        </ul>

        {/* Error */}
        {error && (
          <div style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '12px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {/* CTA */}
        <button
          style={{ ...ctaBtnStyle, opacity: loading ? 0.7 : 1 }}
          onClick={handleCheckout}
          disabled={loading}
          type="button"
        >
          {loading ? 'Redirecting to checkout...' : `Subscribe ${isAnnual ? 'Annually' : 'Monthly'}`}
        </button>
      </div>
    </div>
  )
}
