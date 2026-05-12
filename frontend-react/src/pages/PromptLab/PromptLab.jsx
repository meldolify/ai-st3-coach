import { useState, useEffect, useCallback, useRef } from 'react'
import PromptEditor from './PromptEditor'
import ChatPanel from './ChatPanel'
import TestPanel from './TestPanel'
import * as api from './promptLabApi'
import './prompt-lab.css'

/**
 * PromptLab — 3-panel prompt testing environment (dark theme).
 *
 * Left: 5-tab prompt editor with dirty tracking
 * Center: Manual chat + auto test display
 * Right: Test scripts, assertions, transcripts
 */
export default function PromptLab() {
  // --- Core state ---
  const [topic, setTopic] = useState('clinical/emergencies/necrotising_fasciitis')
  const [difficulty, setDifficulty] = useState('easy')
  const [topics, setTopics] = useState([])
  const [githubEnabled, setGithubEnabled] = useState(false)
  const [pendingChanges, setPendingChanges] = useState(0)
  const [status, setStatus] = useState('')

  // --- Editor state ---
  const [activeTab, setActiveTab] = useState('core')
  const [promptSections, setPromptSections] = useState({ core: '', difficulty: '', clinical: '' })
  const [feedbackPrompt, setFeedbackPrompt] = useState('')
  const [feedbackPersonality, setFeedbackPersonality] = useState('')
  const [promptPaths, setPromptPaths] = useState({})
  const [feedbackPaths, setFeedbackPaths] = useState({})
  const [savedSections, setSavedSections] = useState(null)
  const [savedFeedback, setSavedFeedback] = useState(null)
  const [savedFeedbackPersonality, setSavedFeedbackPersonality] = useState(null)
  const [dirtySections, setDirtySections] = useState(new Set())

  // --- Chat state ---
  const [sessionId, setSessionId] = useState(null)
  const [messages, setMessages] = useState([])
  const [mode, setMode] = useState('manual')
  const [loading, setLoading] = useState(false)

  // --- Test state ---
  const [tests, setTests] = useState([])
  const [selectedTests, setSelectedTests] = useState(new Set())
  const [assertions, setAssertions] = useState([])
  const [autoTestContent, setAutoTestContent] = useState(null)

  // --- Transcript state ---
  const [transcripts, setTranscripts] = useState([])
  const [viewingTranscript, setViewingTranscript] = useState(null)

  // --- Toast state ---
  const [toast, setToast] = useState(null)
  const toastTimeoutRef = useRef(null)

  function showToast(message, type = 'success') {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    setToast({ message, type })
    toastTimeoutRef.current = setTimeout(() => setToast(null), 2500)
  }

  // --- Init: load topics, config ---
  useEffect(() => {
    async function init() {
      try {
        const [topicsData, configData] = await Promise.all([
          api.getTopics(),
          api.getConfig(),
        ])
        setTopics(topicsData.topics || [])
        setGithubEnabled(configData.githubEnabled || false)
      } catch (err) {
        console.warn('[PromptLab] Init error:', err)
      }
    }
    init()
  }, [])

  // --- Load prompts when topic or difficulty changes ---
  useEffect(() => {
    if (!topic) return
    loadPrompts()
    loadFeedbackPrompts()
    loadTests()
    loadTranscripts()
  }, [topic]) // eslint-disable-line react-hooks/exhaustive-deps

  // --- Reload difficulty-dependent tabs when difficulty changes ---
  useEffect(() => {
    if (!topic) return
    loadDifficultyPrompts()
  }, [difficulty]) // eslint-disable-line react-hooks/exhaustive-deps

  // --- Prompt loading ---

  async function loadPrompts() {
    try {
      const data = await api.getPrompts(difficulty, topic)
      const sections = data.sections || {}
      setPromptSections(sections)
      setSavedSections({ ...sections })
      setPromptPaths(data.paths || {})
      setDirtySections(new Set())
    } catch (err) {
      console.warn('[PromptLab] Failed to load prompts:', err)
      showToast('Failed to load prompts', 'error')
    }
  }

  async function loadFeedbackPrompts() {
    try {
      const data = await api.getFeedbackPrompt(difficulty, topic)
      setFeedbackPrompt(data.content || '')
      setFeedbackPersonality(data.personalityContent || '')
      setSavedFeedback(data.content || '')
      setSavedFeedbackPersonality(data.personalityContent || '')
      setFeedbackPaths({ feedback: data.path, feedbackPersonality: data.personalityPath })
    } catch (err) {
      console.warn('[PromptLab] Failed to load feedback prompts:', err)
    }
  }

  async function loadDifficultyPrompts() {
    try {
      const data = await api.getPrompts(difficulty, topic)
      // Only update difficulty-specific tab
      setPromptSections((prev) => ({ ...prev, difficulty: data.sections?.difficulty || '' }))
      setSavedSections((prev) => prev ? { ...prev, difficulty: data.sections?.difficulty || '' } : prev)
      setPromptPaths((prev) => ({ ...prev, difficulty: data.paths?.difficulty }))

      const fbData = await api.getFeedbackPrompt(difficulty, topic)
      setFeedbackPersonality(fbData.personalityContent || '')
      setSavedFeedbackPersonality(fbData.personalityContent || '')
      setFeedbackPaths((prev) => ({ ...prev, feedbackPersonality: fbData.personalityPath }))

      // Remove dirty state for reloaded tabs
      setDirtySections((prev) => {
        const next = new Set(prev)
        next.delete('difficulty')
        next.delete('feedbackPersonality')
        return next
      })
    } catch (err) {
      console.warn('[PromptLab] Failed to reload difficulty prompts:', err)
    }
  }

  async function loadTests() {
    try {
      const data = await api.getTests(topic)
      setTests(data.tests || [])
      setSelectedTests(new Set())
    } catch (err) {
      console.warn('[PromptLab] Failed to load tests:', err)
    }
  }

  async function loadTranscripts() {
    try {
      const data = await api.getTranscripts()
      setTranscripts(data.transcripts || [])
    } catch (err) {
      console.warn('[PromptLab] Failed to load transcripts:', err)
    }
  }

  // --- Get current tab content ---

  function getTabContent(tabId) {
    switch (tabId) {
      case 'core': return promptSections.core
      case 'difficulty': return promptSections.difficulty
      case 'clinical': return promptSections.clinical
      case 'feedback': return feedbackPrompt
      case 'feedbackPersonality': return feedbackPersonality
      default: return ''
    }
  }

  function getTabFilePath(tabId) {
    switch (tabId) {
      case 'core': return promptPaths.core
      case 'difficulty': return promptPaths.difficulty
      case 'clinical': return promptPaths.clinical
      case 'feedback': return feedbackPaths.feedback
      case 'feedbackPersonality': return feedbackPaths.feedbackPersonality
      default: return ''
    }
  }

  // --- Editor handlers ---

  const handleContentChange = useCallback((text) => {
    setDirtySections((prev) => new Set(prev).add(activeTab))

    switch (activeTab) {
      case 'core':
        setPromptSections((p) => ({ ...p, core: text }))
        break
      case 'difficulty':
        setPromptSections((p) => ({ ...p, difficulty: text }))
        break
      case 'clinical':
        setPromptSections((p) => ({ ...p, clinical: text }))
        break
      case 'feedback':
        setFeedbackPrompt(text)
        break
      case 'feedbackPersonality':
        setFeedbackPersonality(text)
        break
    }
  }, [activeTab])

  const handleRevert = useCallback(() => {
    switch (activeTab) {
      case 'core':
        if (savedSections) setPromptSections((p) => ({ ...p, core: savedSections.core }))
        break
      case 'difficulty':
        if (savedSections) setPromptSections((p) => ({ ...p, difficulty: savedSections.difficulty }))
        break
      case 'clinical':
        if (savedSections) setPromptSections((p) => ({ ...p, clinical: savedSections.clinical }))
        break
      case 'feedback':
        if (savedFeedback != null) setFeedbackPrompt(savedFeedback)
        break
      case 'feedbackPersonality':
        if (savedFeedbackPersonality != null) setFeedbackPersonality(savedFeedbackPersonality)
        break
    }
    setDirtySections((prev) => {
      const next = new Set(prev)
      next.delete(activeTab)
      return next
    })
    showToast('Reverted to saved version')
  }, [activeTab, savedSections, savedFeedback, savedFeedbackPersonality])

  const handleDownload = useCallback(() => {
    const content = getTabContent(activeTab)
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${activeTab}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }, [activeTab, promptSections, feedbackPrompt, feedbackPersonality]) // eslint-disable-line

  // --- Header actions ---

  const handleNewSession = useCallback(async () => {
    setLoading(true)
    setStatus('Creating session...')
    try {
      const data = await api.createSession(promptSections, { difficulty })
      setSessionId(data.sessionId)
      setMessages([{ role: 'system', content: `Session created: ${data.sessionId}` }])
      setStatus(`Session: ${data.sessionId.slice(0, 12)}...`)
      showToast('Session created')
    } catch (err) {
      showToast(err.message, 'error')
      setStatus('')
    } finally {
      setLoading(false)
    }
  }, [promptSections, difficulty])

  const handleSave = useCallback(async () => {
    if (dirtySections.size === 0) {
      showToast('No changes to save')
      return
    }

    setLoading(true)
    setStatus('Saving...')
    try {
      // Save prompt sections if any dirty
      const promptDirty = ['core', 'difficulty', 'clinical'].some((t) => dirtySections.has(t))
      if (promptDirty) {
        const sectionsToSave = {}
        if (dirtySections.has('core')) sectionsToSave.core = promptSections.core
        if (dirtySections.has('difficulty')) sectionsToSave.difficulty = promptSections.difficulty
        if (dirtySections.has('clinical')) sectionsToSave.clinical = promptSections.clinical
        await api.savePrompts(difficulty, sectionsToSave, topic)
      }

      // Save feedback sections if any dirty
      const fbDirty = dirtySections.has('feedback') || dirtySections.has('feedbackPersonality')
      if (fbDirty) {
        await api.saveFeedbackPrompt(
          difficulty,
          dirtySections.has('feedback') ? feedbackPrompt : undefined,
          dirtySections.has('feedbackPersonality') ? feedbackPersonality : undefined,
          topic,
        )
      }

      // Update baselines
      setSavedSections({ ...promptSections })
      setSavedFeedback(feedbackPrompt)
      setSavedFeedbackPersonality(feedbackPersonality)
      setDirtySections(new Set())

      // Check pending changes
      if (githubEnabled) {
        try {
          const changes = await api.getChanges()
          setPendingChanges(changes.count || 0)
        } catch {} // eslint-disable-line no-empty
      }

      showToast('Saved successfully')
      setStatus('')
    } catch (err) {
      showToast(err.message, 'error')
      setStatus('')
    } finally {
      setLoading(false)
    }
  }, [dirtySections, promptSections, feedbackPrompt, feedbackPersonality, difficulty, topic, githubEnabled])

  const handleCreatePR = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.createPR()
      if (data.prUrl) {
        window.open(data.prUrl, '_blank')
        showToast('PR created')
        setPendingChanges(0)
      }
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  // --- Chat handlers ---

  const handleSendMessage = useCallback(async (text) => {
    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setLoading(true)
    try {
      const data = await api.sendMessage(sessionId, text)
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response }])
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'system', content: `Error: ${err.message}` }])
    } finally {
      setLoading(false)
    }
  }, [sessionId])

  const handleRequestFeedback = useCallback(async () => {
    setLoading(true)
    setMessages((prev) => [...prev, { role: 'system', content: 'Generating feedback...' }])
    try {
      const fbPrompt = dirtySections.has('feedback') ? feedbackPrompt : undefined
      const data = await api.requestFeedback(sessionId, fbPrompt, topic)

      // Add feedback sections as messages
      if (data.sections) {
        for (const section of data.sections) {
          setMessages((prev) => [...prev, { role: 'feedback', content: section }])
        }
      }

      // Add summary
      if (data.summary) {
        const score = data.summary.score ?? data.summary.overallScore ?? '?'
        setMessages((prev) => [...prev, {
          role: 'feedback',
          label: `Score: ${score}/5`,
          content: [
            data.summary.overallImpression && `Overall: ${data.summary.overallImpression}`,
            data.summary.strengths && `Strengths: ${data.summary.strengths}`,
            data.summary.improvements && `Areas to improve: ${data.summary.improvements}`,
          ].filter(Boolean).join('\n\n'),
        }])
      }

      showToast('Feedback generated')
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'system', content: `Feedback error: ${err.message}` }])
      showToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }, [sessionId, feedbackPrompt, dirtySections, topic])

  const handleSaveTranscript = useCallback(async () => {
    if (!sessionId) return
    setLoading(true)
    try {
      await api.saveManualTranscript(sessionId)
      showToast('Transcript saved')
      loadTranscripts()
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }, [sessionId])

  const handleClearChat = useCallback(() => {
    setMessages([])
    setSessionId(null)
    setStatus('')
  }, [])

  // --- Test handlers ---

  const handleToggleTest = useCallback((testId) => {
    setSelectedTests((prev) => {
      const next = new Set(prev)
      if (next.has(testId)) next.delete(testId)
      else next.add(testId)
      return next
    })
  }, [])

  const handleRunTests = useCallback(async () => {
    if (selectedTests.size === 0) return
    setMode('auto')
    setLoading(true)
    setAssertions([])

    const allAssertions = []
    const contentParts = []

    for (const testId of selectedTests) {
      const test = tests.find((t) => t.id === testId)
      contentParts.push(
        <div key={`label-${testId}`} className="pl-section-divider">
          Running: {test?.name || testId}
        </div>
      )

      try {
        const result = await api.runTest(testId, topic, promptSections, feedbackPrompt)

        // Show conversation turns
        if (result.history) {
          contentParts.push(
            <div key={`turns-${testId}`} className="pl-auto-test-status">
              {result.history.map((turn, i) => (
                <div key={i} className="pl-auto-test-turn">
                  <div className="pl-auto-test-turn-label">{turn.role}</div>
                  {turn.content}
                </div>
              ))}
            </div>
          )
        }

        // Collect assertions
        if (result.assertions?.details) {
          allAssertions.push(
            ...result.assertions.details.map((d) => ({
              ...d,
              testName: test?.name,
            }))
          )
        }

        setAutoTestContent([...contentParts])
      } catch (err) {
        contentParts.push(
          <div key={`err-${testId}`} className="pl-msg pl-msg-system">
            Error: {err.message}
          </div>
        )
        setAutoTestContent([...contentParts])
      }
    }

    setAssertions(allAssertions)
    setLoading(false)
    loadTranscripts()
  }, [selectedTests, tests, topic, promptSections, feedbackPrompt])

  const handleRunComparison = useCallback(async () => {
    if (selectedTests.size === 0) return
    const testId = [...selectedTests][0]
    const test = tests.find((t) => t.id === testId)

    setMode('auto')
    setLoading(true)
    setAssertions([])

    try {
      const data = await api.runDifficultyComparison(testId, topic, ['easy', 'medium', 'strict'])
      const allAssertions = []
      const contentParts = []

      for (const result of data.results || []) {
        contentParts.push(
          <div key={`label-${result.difficulty}`} className="pl-section-divider">
            {result.difficulty.toUpperCase()} — {test?.name || testId}
          </div>
        )

        if (result.history) {
          contentParts.push(
            <div key={`turns-${result.difficulty}`} className="pl-auto-test-status">
              {result.history.map((turn, i) => (
                <div key={i} className="pl-auto-test-turn">
                  <div className="pl-auto-test-turn-label">{turn.role}</div>
                  {turn.content}
                </div>
              ))}
            </div>
          )
        }

        if (result.assertions?.details) {
          allAssertions.push(
            ...result.assertions.details.map((d) => ({
              ...d,
              testName: `${test?.name} (${result.difficulty})`,
            }))
          )
        }
      }

      setAutoTestContent(contentParts)
      setAssertions(allAssertions)
    } catch (err) {
      setAutoTestContent(
        <div className="pl-msg pl-msg-system">Error: {err.message}</div>
      )
    } finally {
      setLoading(false)
      loadTranscripts()
    }
  }, [selectedTests, tests, topic])

  // --- Transcript handlers ---

  const handleViewTranscript = useCallback(async (id) => {
    try {
      const data = await api.getTranscript(id)
      setViewingTranscript(data)
    } catch (err) {
      showToast(err.message, 'error')
    }
  }, [])

  const handleDeleteTranscript = useCallback(async (id) => {
    try {
      await api.deleteTranscript(id)
      showToast('Transcript deleted')
      loadTranscripts()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }, [])

  // --- Topic change ---
  const handleTopicChange = useCallback((newTopic) => {
    if (dirtySections.size > 0) {
      if (!confirm('You have unsaved changes. Switch topic?')) return
    }
    setTopic(newTopic)
    setSessionId(null)
    setMessages([])
    setAssertions([])
    setAutoTestContent(null)
    setStatus('')
  }, [dirtySections])

  // --- Difficulty change ---
  const handleDifficultyChange = useCallback((newDiff) => {
    setDifficulty(newDiff)
  }, [])

  // --- Group topics for optgroups ---
  const topicGroups = {}
  for (const t of topics) {
    if (!topicGroups[t.group]) topicGroups[t.group] = []
    topicGroups[t.group].push(t)
  }

  return (
    <div className="prompt-lab-root">
      {/* Header */}
      <header className="pl-header">
        <h1>Prompt Lab</h1>

        <select
          className="pl-select"
          value={topic}
          onChange={(e) => handleTopicChange(e.target.value)}
        >
          {Object.entries(topicGroups).map(([group, items]) => (
            <optgroup key={group} label={group}>
              {items.map((t) => (
                <option key={t.path} value={t.path}>{t.label}</option>
              ))}
            </optgroup>
          ))}
        </select>

        <div className="pl-header-controls">
          <button className="pl-btn pl-btn-primary" onClick={handleNewSession} disabled={loading}>
            New Session
          </button>
          <button className="pl-btn" onClick={handleSave} disabled={loading || dirtySections.size === 0}>
            Save{dirtySections.size > 0 ? ` (${dirtySections.size})` : ''}
          </button>
          {githubEnabled && pendingChanges > 0 && (
            <button className="pl-btn" onClick={handleCreatePR} disabled={loading}>
              Create PR
              <span className="pl-change-count">{pendingChanges}</span>
            </button>
          )}
          {status && <span className="pl-status">{status}</span>}
        </div>
      </header>

      {/* 3-panel layout */}
      <main className="pl-main">
        <PromptEditor
          activeTab={activeTab}
          onTabChange={setActiveTab}
          content={getTabContent(activeTab)}
          onContentChange={handleContentChange}
          dirtySections={dirtySections}
          difficulty={difficulty}
          onDifficultyChange={handleDifficultyChange}
          filePath={getTabFilePath(activeTab)}
          onRevert={handleRevert}
          onDownload={handleDownload}
        />

        <ChatPanel
          mode={mode}
          onModeChange={setMode}
          messages={messages}
          onSendMessage={handleSendMessage}
          onRequestFeedback={handleRequestFeedback}
          onSaveTranscript={handleSaveTranscript}
          onClearChat={handleClearChat}
          sessionId={sessionId}
          loading={loading}
          autoTestContent={autoTestContent}
        />

        <TestPanel
          tests={tests}
          selectedTests={selectedTests}
          onToggleTest={handleToggleTest}
          onRunTests={handleRunTests}
          onRunComparison={handleRunComparison}
          assertions={assertions}
          transcripts={transcripts}
          onViewTranscript={handleViewTranscript}
          onDeleteTranscript={handleDeleteTranscript}
          loading={loading}
        />
      </main>

      {/* Transcript Modal */}
      {viewingTranscript && (
        <TranscriptModal
          transcript={viewingTranscript}
          onClose={() => setViewingTranscript(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="pl-toast-container">
          <div className={`pl-toast pl-toast-${toast.type}`}>
            {toast.message}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * TranscriptModal — Full transcript viewer overlay.
 */
function TranscriptModal({ transcript, onClose }) {
  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget) onClose()
  }, [onClose])

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const t = transcript
  const meta = t.metadata || {}

  return (
    <div className="pl-modal-overlay" onClick={handleOverlayClick}>
      <div className="pl-modal">
        <div className="pl-modal-header">
          <h2>{meta.testName || t.type || 'Transcript'}</h2>
          <button className="pl-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="pl-modal-body">
          {/* Metadata */}
          <div style={{ marginBottom: 16, fontSize: 12, color: 'var(--pl-text-muted)' }}>
            {meta.timestamp && <div>Time: {new Date(meta.timestamp).toLocaleString()}</div>}
            {meta.difficulty && <div>Difficulty: {meta.difficulty}</div>}
            {meta.duration && <div>Duration: {meta.duration}ms</div>}
          </div>

          {/* Assertions */}
          {t.assertions?.details?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div className="pl-assertion-title">
                Assertions: {t.assertions.passed}/{t.assertions.total} passed
              </div>
              {t.assertions.details.map((a, i) => (
                <div
                  key={i}
                  className={`pl-assertion-item ${a.passed ? 'pl-assertion-pass' : 'pl-assertion-fail'}`}
                >
                  <span className="pl-assertion-icon">{a.passed ? '✓' : '✗'}</span>
                  <span>{a.desc || a.type}</span>
                </div>
              ))}
            </div>
          )}

          {/* Conversation */}
          {t.history?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div className="pl-section-divider" style={{ margin: '0 -18px', padding: '8px 18px' }}>
                Conversation
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                {t.history.map((msg, i) => (
                  <div key={i} className={`pl-msg pl-msg-${msg.role}`}>
                    {msg.content}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feedback */}
          {t.feedback?.sections?.length > 0 && (
            <div>
              <div className="pl-section-divider" style={{ margin: '0 -18px', padding: '8px 18px' }}>
                Feedback
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                {t.feedback.sections.map((section, i) => (
                  <div key={i} className="pl-msg pl-msg-feedback">{section}</div>
                ))}
              </div>
              {t.feedback.summary && (
                <div className="pl-feedback-summary">
                  <div className="pl-feedback-score" style={{
                    color: (t.feedback.summary.score || 0) >= 4 ? 'var(--pl-green)'
                      : (t.feedback.summary.score || 0) >= 3 ? 'var(--pl-yellow)' : 'var(--pl-red)',
                  }}>
                    {t.feedback.summary.score ?? '?'}/5
                  </div>
                  {t.feedback.summary.overallImpression && (
                    <div className="pl-feedback-detail">
                      <strong>Overall:</strong> {t.feedback.summary.overallImpression}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
