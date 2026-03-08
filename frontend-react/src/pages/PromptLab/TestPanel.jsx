import { useState, useCallback } from 'react'

/**
 * TestPanel — Right panel with test scripts, assertions, and transcripts.
 *
 * Props:
 *  - tests (array of test scripts)
 *  - selectedTests (Set of testIds)
 *  - onToggleTest(testId)
 *  - onRunTests()
 *  - onRunComparison()
 *  - assertions (array of {desc, type, passed, actual, testName})
 *  - transcripts (array)
 *  - onViewTranscript(id)
 *  - onDeleteTranscript(id)
 *  - loading
 */
export default function TestPanel({
  tests,
  selectedTests,
  onToggleTest,
  onRunTests,
  onRunComparison,
  assertions,
  transcripts,
  onViewTranscript,
  onDeleteTranscript,
  loading,
}) {
  const passedCount = assertions.filter((a) => a.passed).length
  const totalCount = assertions.length

  return (
    <div className="pl-panel">
      <div className="pl-panel-header">
        <span className="pl-panel-title">Tests & Results</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            className="pl-btn pl-btn-sm pl-btn-primary"
            onClick={onRunTests}
            disabled={loading || selectedTests.size === 0}
          >
            Run
          </button>
          <button
            className="pl-btn pl-btn-sm"
            onClick={onRunComparison}
            disabled={loading || selectedTests.size === 0}
            title="Run across Easy/Medium/Strict"
          >
            Compare
          </button>
        </div>
      </div>

      <div className="pl-panel-body">
        {/* Test Scripts */}
        <div className="pl-section-divider">Test Scripts</div>
        <div className="pl-test-list">
          {tests.length === 0 && (
            <div className="pl-empty" style={{ padding: '20px 10px' }}>
              No test scripts found
            </div>
          )}
          {tests.map((test) => (
            <label
              key={test.id}
              className={`pl-test-item ${selectedTests.has(test.id) ? 'selected' : ''}`}
            >
              <input
                type="checkbox"
                checked={selectedTests.has(test.id)}
                onChange={() => onToggleTest(test.id)}
              />
              <div className="pl-test-item-info">
                <div className="pl-test-item-name">
                  {test.name}
                  {test.source && test.source !== 'premade' && (
                    <span className={`pl-source-label pl-source-${test.source}`}>
                      {test.source}
                    </span>
                  )}
                </div>
                <div className="pl-test-item-desc">
                  {test.description || `${test.inputCount || '?'} inputs${test.triggerFeedback ? ' + feedback' : ''}`}
                </div>
              </div>
            </label>
          ))}
        </div>

        {/* Assertions */}
        {assertions.length > 0 && (
          <>
            <div className="pl-section-divider">Assertions</div>
            <div className="pl-assertions">
              <div className="pl-assertion-title">
                {passedCount}/{totalCount} passed
              </div>
              {assertions.map((a, i) => (
                <div
                  key={i}
                  className={`pl-assertion-item ${a.passed ? 'pl-assertion-pass' : 'pl-assertion-fail'}`}
                >
                  <span className="pl-assertion-icon">{a.passed ? '✓' : '✗'}</span>
                  <span>
                    {a.desc || a.type}
                    {a.testName && (
                      <span style={{ opacity: 0.6, marginLeft: 4 }}>({a.testName})</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Transcripts */}
        <div className="pl-section-divider">Transcripts</div>
        <div className="pl-transcript-list">
          {transcripts.length === 0 && (
            <div className="pl-empty" style={{ padding: '20px 10px' }}>
              No saved transcripts
            </div>
          )}
          {transcripts.slice(0, 20).map((t) => (
            <div
              key={t.id}
              className="pl-transcript-item"
              onClick={() => onViewTranscript(t.id)}
            >
              <div className="pl-transcript-info">
                <div className="pl-transcript-name">
                  {t.testName || t.type || 'Manual'}
                </div>
                <div className="pl-transcript-meta">
                  {t.difficulty} · {new Date(t.timestamp).toLocaleString()}
                  {t.assertionsPassed != null && ` · ${t.assertionsPassed}/${t.assertionsPassed + t.assertionsFailed}`}
                </div>
              </div>
              {t.feedbackScore != null && (
                <span className={`pl-transcript-score ${getScoreClass(t.feedbackScore)}`}>
                  {t.feedbackScore}/5
                </span>
              )}
              <button
                className="pl-transcript-delete"
                onClick={(e) => {
                  e.stopPropagation()
                  if (confirm('Delete this transcript?')) {
                    onDeleteTranscript(t.id)
                  }
                }}
                title="Delete"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function getScoreClass(score) {
  if (score >= 4) return 'pl-score-high'
  if (score >= 3) return 'pl-score-mid'
  return 'pl-score-low'
}
