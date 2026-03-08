import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabaseClient } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import { isPremiumUser, openCustomerPortal } from '../../lib/subscription'
import UpgradeModal from '../../components/UpgradeModal'
import './profile.css'

/**
 * ProfilePage — User profile, subscription status, and progress tracking.
 *
 * Left panel: account info + subscription management.
 * Right panel: progress cards with scores per category.
 */
export default function ProfilePage() {
  const navigate = useNavigate()
  const { currentUser, userProfile, userSubscription, setUserProfile } = useAuthStore()

  const [fullName, setFullName] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [trainingLevel, setTrainingLevel] = useState('')
  const [defaultSpecialty, setDefaultSpecialty] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [showUpgrade, setShowUpgrade] = useState(false)

  // Progress stats
  const [stats, setStats] = useState({ totalSessions: 0, lastSessionDate: null })
  const [feedbackStats, setFeedbackStats] = useState({
    clinical: { count: 0, avgScore: 0 },
    communication: { count: 0, avgScore: 0 },
    structured: { count: 0, avgScore: 0 },
  })

  // Populate fields from store
  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.full_name || '')
      setSpecialty(userProfile.specialty || '')
      setTrainingLevel(userProfile.training_level || '')
    }
    setDefaultSpecialty(localStorage.getItem('defaultSpecialty') || '')
  }, [userProfile])

  // Load stats from Supabase
  useEffect(() => {
    if (!currentUser) return

    async function loadStats() {
      try {
        // Total sessions
        const { data: sessions } = await supabaseClient
          .from('session_history')
          .select('id, created_at, scenario_category, feedback_score')
          .eq('user_id', currentUser.id)
          .eq('status', 'completed')

        if (!sessions) return

        const totalSessions = sessions.length
        const lastSessionDate = sessions.length > 0
          ? new Date(sessions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0].created_at)
          : null

        setStats({ totalSessions, lastSessionDate })

        // Group by category for progress cards
        const categories = { clinical: [], communication: [], structured: [] }
        for (const s of sessions) {
          const cat = s.scenario_category || 'clinical'
          const bucket =
            cat.includes('call') || cat.includes('communication') ? 'communication' :
            cat.includes('structured') ? 'structured' : 'clinical'
          if (s.feedback_score != null) {
            categories[bucket].push(s.feedback_score)
          }
        }

        setFeedbackStats({
          clinical: {
            count: categories.clinical.length,
            avgScore: categories.clinical.length > 0
              ? categories.clinical.reduce((a, b) => a + b, 0) / categories.clinical.length
              : 0,
          },
          communication: {
            count: categories.communication.length,
            avgScore: categories.communication.length > 0
              ? categories.communication.reduce((a, b) => a + b, 0) / categories.communication.length
              : 0,
          },
          structured: {
            count: categories.structured.length,
            avgScore: categories.structured.length > 0
              ? categories.structured.reduce((a, b) => a + b, 0) / categories.structured.length
              : 0,
          },
        })
      } catch (err) {
        console.warn('[ProfilePage] Failed to load stats:', err)
      }
    }

    loadStats()
  }, [currentUser])

  // Save profile
  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      // Always save default specialty to localStorage
      if (defaultSpecialty) {
        localStorage.setItem('defaultSpecialty', defaultSpecialty)
      } else {
        localStorage.removeItem('defaultSpecialty')
      }

      // Update Supabase if logged in
      if (currentUser) {
        const { data, error } = await supabaseClient
          .from('profiles')
          .update({
            full_name: fullName,
            specialty,
            training_level: trainingLevel,
          })
          .eq('id', currentUser.id)
          .select()
          .single()

        if (error) throw error
        if (data) setUserProfile(data)
      }

      showToast('Profile saved successfully', 'success')
    } catch (err) {
      console.error('[ProfilePage] Save error:', err)
      showToast('Failed to save profile', 'error')
    } finally {
      setSaving(false)
    }
  }, [currentUser, fullName, specialty, trainingLevel, defaultSpecialty, setUserProfile])

  const handleManageSubscription = useCallback(async () => {
    try {
      await openCustomerPortal()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }, [])

  function showToast(message, type = 'info') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  function getScoreLevel(score) {
    if (score >= 4) return 'high'
    if (score >= 3) return 'medium'
    return 'low'
  }

  const premium = isPremiumUser()

  return (
    <div className="profile-page">
      {/* Back button */}
      <button className="back-btn" onClick={() => navigate(-1)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </button>

      <div className="profile-layout">
        {/* Left Panel — Account Info */}
        <div className="profile-info-panel">
          {/* Account Information */}
          <div className="profile-section">
            <h3>Account Information</h3>

            <div className="profile-field">
              <label>Email</label>
              <input type="email" value={currentUser?.email || ''} disabled />
            </div>

            <div className="profile-field">
              <label>Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>

            <div className="profile-field">
              <label>Specialty</label>
              <select value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
                <option value="">Select specialty</option>
                <option value="plastic-surgery">Plastic Surgery</option>
                <option value="general-surgery">General Surgery</option>
                <option value="orthopaedics">Orthopaedics</option>
              </select>
            </div>

            <div className="profile-field">
              <label>Training Level</label>
              <select value={trainingLevel} onChange={(e) => setTrainingLevel(e.target.value)}>
                <option value="">Select level</option>
                <option value="ct1-ct2">CT1-CT2</option>
                <option value="st3">ST3</option>
                <option value="st4-st5">ST4-ST5</option>
                <option value="st6-st8">ST6-ST8</option>
                <option value="consultant">Consultant</option>
              </select>
            </div>

            <div className="profile-field">
              <label>Default Specialty</label>
              <select value={defaultSpecialty} onChange={(e) => setDefaultSpecialty(e.target.value)}>
                <option value="">No default (show selection)</option>
                <option value="plastic-surgery">Plastic Surgery</option>
              </select>
            </div>
          </div>

          {/* Subscription */}
          <div className="profile-section">
            <h3>Subscription</h3>

            <div className="subscription-card">
              <div className="subscription-info">
                <span className="subscription-plan-name">
                  {premium ? 'Premium Plan' : 'Free Plan'}
                </span>
                <span className="subscription-details">
                  {premium && userSubscription?.current_period_end
                    ? `Renews ${new Date(userSubscription.current_period_end).toLocaleDateString()}`
                    : 'Limited access to scenarios'}
                </span>
              </div>
              <span className={`subscription-badge ${premium ? 'premium' : 'free'}`}>
                {premium ? 'Premium' : 'Free'}
              </span>
            </div>

            {premium ? (
              <button className="btn-manage-subscription" onClick={handleManageSubscription}>
                Manage Subscription
              </button>
            ) : (
              <button className="btn-upgrade" onClick={() => setShowUpgrade(true)}>
                Upgrade to Premium
              </button>
            )}
          </div>

          {/* Stats summary */}
          <div className="profile-section">
            <h3>Session Statistics</h3>
            <div className="profile-field">
              <label>Total Completed Sessions</label>
              <input type="text" value={stats.totalSessions} disabled />
            </div>
            <div className="profile-field">
              <label>Last Session</label>
              <input
                type="text"
                value={stats.lastSessionDate ? stats.lastSessionDate.toLocaleDateString() : 'No sessions yet'}
                disabled
              />
            </div>
          </div>

          {/* Actions */}
          <div className="profile-actions">
            <button className="btn-profile-save" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Right Panel — Progress */}
        <div className="profile-progress-panel">
          <h3>Your Progress</h3>

          {stats.totalSessions > 0 ? (
            <>
              <div className="progress-cards-grid">
                <ProgressCard
                  icon="🦴"
                  label="Clinical Stations"
                  count={feedbackStats.clinical.count}
                  score={feedbackStats.clinical.avgScore}
                />
                <ProgressCard
                  icon="☎️"
                  label="Communication"
                  count={feedbackStats.communication.count}
                  score={feedbackStats.communication.avgScore}
                />
                <ProgressCard
                  icon="📄"
                  label="Structured Interview"
                  count={feedbackStats.structured.count}
                  score={feedbackStats.structured.avgScore}
                />
              </div>
              <div className="progress-footer">
                Complete more sessions to track your improvement
              </div>
            </>
          ) : (
            <div className="progress-empty">
              <span className="progress-empty-icon">📊</span>
              <p>Complete your first session to start tracking progress</p>
            </div>
          )}
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgrade && (
        <UpgradeModal onClose={() => setShowUpgrade(false)} />
      )}

      {/* Toast */}
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>
            <span>{toast.message}</span>
            <button className="toast-close" onClick={() => setToast(null)}>×</button>
          </div>
        </div>
      )}
    </div>
  )
}

function ProgressCard({ icon, label, count, score }) {
  const level = score >= 4 ? 'high' : score >= 3 ? 'medium' : 'low'

  return (
    <div className={`progress-card progress-card--${count > 0 ? level : ''}`}>
      <span className="progress-card-icon">{icon}</span>
      <div className="progress-card-info">
        <div className="progress-card-label">{label}</div>
        <div className="progress-card-count">
          {count} {count === 1 ? 'session' : 'sessions'}
        </div>
      </div>
      {count > 0 && (
        <>
          <span className="progress-card-score">{score.toFixed(1)}/5</span>
          <span className={`progress-indicator progress-indicator--${level}`} />
        </>
      )}
    </div>
  )
}
