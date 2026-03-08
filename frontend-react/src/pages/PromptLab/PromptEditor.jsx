import { useRef, useCallback } from 'react'

const TABS = [
  { id: 'core', label: 'Core', shared: true },
  { id: 'difficulty', label: 'Personality', shared: false },
  { id: 'clinical', label: 'Clinical', shared: true },
  { id: 'feedback', label: 'Feedback', shared: true },
  { id: 'feedbackPersonality', label: 'Fb.Personality', shared: false },
]

/**
 * PromptEditor — Left panel with 5-tab editor and dirty tracking.
 *
 * Props:
 *  - activeTab, onTabChange
 *  - content (current tab text)
 *  - onContentChange(text)
 *  - dirtySections (Set)
 *  - difficulty, onDifficultyChange
 *  - filePath (current file path)
 *  - onRevert, onDownload
 */
export default function PromptEditor({
  activeTab,
  onTabChange,
  content,
  onContentChange,
  dirtySections,
  difficulty,
  onDifficultyChange,
  filePath,
  onRevert,
  onDownload,
}) {
  const editorRef = useRef(null)

  const handleInput = useCallback((e) => {
    onContentChange(e.target.value)
  }, [onContentChange])

  const charCount = content?.length || 0

  return (
    <div className="pl-panel">
      <div className="pl-panel-header">
        <span className="pl-panel-title">Prompt Editor</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="pl-btn pl-btn-sm" onClick={onRevert} title="Revert to saved">
            Revert
          </button>
          <button className="pl-btn pl-btn-sm" onClick={onDownload} title="Download file">
            ↓
          </button>
        </div>
      </div>

      {/* Tabs + difficulty selector */}
      <div className="pl-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`pl-tab ${activeTab === tab.id ? 'active' : ''} ${dirtySections.has(tab.id) ? 'dirty' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
            {tab.shared && <span className="pl-badge-shared">shared</span>}
          </button>
        ))}
        <select
          className="pl-tab-select"
          value={difficulty}
          onChange={(e) => onDifficultyChange(e.target.value)}
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="strict">Strict</option>
        </select>
      </div>

      {/* Editor textarea */}
      <div className="pl-editor-wrap">
        <textarea
          ref={editorRef}
          className="pl-editor"
          value={content || ''}
          onChange={handleInput}
          placeholder="Loading prompt content..."
          spellCheck={false}
        />
      </div>

      {/* Footer */}
      <div className="pl-editor-footer">
        <span>{charCount.toLocaleString()} chars</span>
        <span>{filePath || ''}</span>
      </div>
    </div>
  )
}
