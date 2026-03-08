import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabaseClient } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import './auth.css'

export default function AuthPage() {
  const navigate = useNavigate()
  const { authMode, setAuthMode, setCurrentUser } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const glowRef = useRef(null)
  const formPanelRef = useRef(null)

  // --- Glow effect ---
  const handleMouseMove = useCallback((e) => {
    if (!glowRef.current || !formPanelRef.current) return
    const rect = formPanelRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    glowRef.current.style.left = `${x}px`
    glowRef.current.style.top = `${y}px`
  }, [])

  // --- Close handler ---
  const handleClose = useCallback(() => {
    navigate(-1)
  }, [navigate])

  // --- Overlay click (close if clicking backdrop) ---
  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }, [handleClose])

  // --- Google OAuth ---
  const handleGoogleLogin = useCallback(async () => {
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const { error: oauthError } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      })
      if (oauthError) throw oauthError
      // OAuth redirects the page, so no further action needed
    } catch (err) {
      setError(err.message || 'Failed to sign in with Google')
      setLoading(false)
    }
  }, [])

  // --- Forgot password ---
  const handleForgotPassword = useCallback(async () => {
    setError('')
    setSuccess('')
    if (!email.trim()) {
      setError('Please enter your email address first')
      return
    }
    setLoading(true)
    try {
      const { error: resetError } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`
      })
      if (resetError) throw resetError
      setSuccess('Check your email for a password reset link')
    } catch (err) {
      setError(err.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }, [email])

  // --- Form submit ---
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields')
      return
    }

    if (authMode === 'signup') {
      if (password.length < 6) {
        setError('Password must be at least 6 characters')
        return
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match')
        return
      }
    }

    setLoading(true)

    try {
      if (authMode === 'login') {
        const { data, error: loginError } = await supabaseClient.auth.signInWithPassword({
          email: email.trim(),
          password
        })
        if (loginError) throw loginError
        setCurrentUser(data.user)
        navigate('/scenarios')
      } else {
        const { error: signupError } = await supabaseClient.auth.signUp({
          email: email.trim(),
          password
        })
        if (signupError) throw signupError
        setSuccess('Check your email for a confirmation link')
        setEmail('')
        setPassword('')
        setConfirmPassword('')
      }
    } catch (err) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }, [authMode, email, password, confirmPassword, navigate, setCurrentUser])

  // --- Toggle auth mode ---
  const toggleMode = useCallback(() => {
    setError('')
    setSuccess('')
    setAuthMode(authMode === 'login' ? 'signup' : 'login')
  }, [authMode, setAuthMode])

  const isLogin = authMode === 'login'

  return (
    <div className="auth-overlay" onClick={handleOverlayClick}>
      <div className="auth-container">
        {/* Left Panel - Form */}
        <div
          className="auth-form-panel"
          ref={formPanelRef}
          onMouseMove={handleMouseMove}
        >
          {/* Cursor-following glow */}
          <div className="auth-glow" ref={glowRef} />

          {/* Close button */}
          <button
            className="auth-close-btn"
            onClick={handleClose}
            aria-label="Close"
            type="button"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Header */}
          <div className="auth-header">
            <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            <p>{isLogin ? 'Sign in to continue your preparation' : 'Start your interview training journey'}</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="auth-error visible">{error}</div>
          )}

          {/* Success message */}
          {success && (
            <div className="auth-success visible">{success}</div>
          )}

          {/* Loading spinner */}
          {loading && (
            <div className="auth-loading visible">
              <div className="auth-spinner" />
            </div>
          )}

          {/* Google login */}
          <div className="social-buttons">
            <button
              className="btn-social btn-google"
              onClick={handleGoogleLogin}
              disabled={loading}
              type="button"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
              <span className="btn-shine" />
            </button>
          </div>

          {/* Divider */}
          <div className="auth-divider">
            <span>or use your email</span>
          </div>

          {/* Email/password form */}
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-input-wrapper">
              <input
                type="email"
                className="auth-input"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={loading}
              />
              <div className="input-glow-border" />
            </div>

            <div className="auth-input-wrapper">
              <input
                type="password"
                className="auth-input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                disabled={loading}
              />
              <div className="input-glow-border" />
            </div>

            {!isLogin && (
              <div className="auth-input-wrapper">
                <input
                  type="password"
                  className="auth-input"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  disabled={loading}
                />
                <div className="input-glow-border" />
              </div>
            )}

            {isLogin && (
              <div className="forgot-password">
                <button type="button" onClick={handleForgotPassword} disabled={loading}>
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              className="btn-auth-submit"
              disabled={loading}
            >
              {isLogin ? 'Sign In' : 'Create Account'}
              <span className="btn-shine" />
            </button>
          </form>

          {/* Footer toggle */}
          <div className="auth-footer">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
            <button type="button" onClick={toggleMode} disabled={loading}>
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </div>

        {/* Right Panel - Visual */}
        <div className="auth-visual-panel">
          <div className="auth-visual-bg">
            <div className="geo-circle geo-circle-1" />
            <div className="geo-circle geo-circle-2" />
            <div className="geo-shape geo-shape-1" />
            <div className="geo-shape geo-shape-2" />
            <div className="geo-line geo-line-1" />
            <div className="geo-line geo-line-2" />
            <div className="geo-line geo-line-3" />
            <div className="geo-grid" />
          </div>
          <div className="auth-visual-content">
            <div className="visual-icon">
              <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="28" cy="28" r="26" stroke="white" strokeWidth="1.5" opacity="0.6"/>
                <circle cx="28" cy="20" r="8" stroke="white" strokeWidth="1.5"/>
                <path d="M14 44c0-7.732 6.268-14 14-14s14 6.268 14 14" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M38 18l4-4m0 0l4-4m-4 4l-4-4m4 4l4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <h3>Master Your Interview</h3>
            <p>Practice with AI-powered clinical scenarios tailored to your ST3 Plastic Surgery training</p>
          </div>
        </div>
      </div>
    </div>
  )
}
