import { useState, useRef, useEffect, useCallback } from 'react'

/**
 * ChatPanel — Center panel with manual chat and auto test display.
 *
 * Props:
 *  - mode ('manual' | 'auto')
 *  - onModeChange(mode)
 *  - messages (array of {role, content, label?})
 *  - onSendMessage(text)
 *  - onRequestFeedback()
 *  - onSaveTranscript()
 *  - onClearChat()
 *  - sessionId
 *  - loading
 *  - autoTestContent (JSX for auto mode)
 */
export default function ChatPanel({
  mode,
  onModeChange,
  messages,
  onSendMessage,
  onRequestFeedback,
  onSaveTranscript,
  onClearChat,
  sessionId,
  loading,
  autoTestContent,
}) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = useCallback(() => {
    const text = input.trim()
    if (!text || !sessionId || loading) return
    onSendMessage(text)
    setInput('')
  }, [input, sessionId, loading, onSendMessage])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  return (
    <div className="pl-panel">
      <div className="pl-panel-header">
        <span className="pl-panel-title">
          {mode === 'manual' ? 'Chat' : 'Test Output'}
        </span>
        <div className="pl-mode-toggle">
          <button
            className={`pl-mode-btn ${mode === 'manual' ? 'active' : ''}`}
            onClick={() => onModeChange('manual')}
          >
            Manual
          </button>
          <button
            className={`pl-mode-btn ${mode === 'auto' ? 'active' : ''}`}
            onClick={() => onModeChange('auto')}
          >
            Auto
          </button>
        </div>
      </div>

      {mode === 'manual' ? (
        <>
          {/* Chat messages */}
          <div className="pl-chat-messages pl-panel-body">
            {messages.length === 0 && (
              <div className="pl-empty">
                <span style={{ fontSize: 24 }}>💬</span>
                <p>Create a new session to start chatting</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`pl-msg pl-msg-${msg.role}`}>
                {msg.label && <div className="pl-feedback-label">{msg.label}</div>}
                {msg.content}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat input */}
          <div className="pl-chat-input-wrap">
            <input
              className="pl-chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={sessionId ? 'Type a message...' : 'Create a session first'}
              disabled={!sessionId || loading}
            />
            <button
              className="pl-btn pl-btn-primary"
              onClick={handleSend}
              disabled={!sessionId || loading || !input.trim()}
            >
              Send
            </button>
          </div>

          {/* Chat actions */}
          <div className="pl-chat-actions">
            <button
              className="pl-btn pl-btn-sm"
              onClick={onRequestFeedback}
              disabled={!sessionId || loading}
            >
              Feedback
            </button>
            <button
              className="pl-btn pl-btn-sm"
              onClick={onSaveTranscript}
              disabled={!sessionId || loading}
            >
              Save
            </button>
            <button
              className="pl-btn pl-btn-sm pl-btn-danger"
              onClick={onClearChat}
            >
              Clear
            </button>
          </div>
        </>
      ) : (
        /* Auto test output */
        <div className="pl-panel-body">
          {autoTestContent || (
            <div className="pl-empty">
              <span style={{ fontSize: 24 }}>🧪</span>
              <p>Select and run tests from the right panel</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
