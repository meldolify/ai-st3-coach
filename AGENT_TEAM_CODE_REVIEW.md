# Agent Team: Parallel Code Review

## How to Run

1. Open a terminal and navigate to the project directory
2. Start Claude Code: `claude`
3. Paste the prompt below

## Prompt

```
Create an agent team to review the ST3 Coach V4 codebase with 3 reviewers:

1. **Security Reviewer** - Focus on:
   - WebSocket authentication flow (server.js:119-177) - token validation, userId spoofing
   - Path traversal protection in loadScenarioPrompt()
   - Stripe webhook signature verification
   - Supabase service key handling
   - FREE_TIER_SCENARIOS sync between frontend/config.js and backend/src/config/index.js
   - Any exposed secrets or credentials in committed files

2. **Performance & Reliability Reviewer** - Focus on:
   - WebSocket session Map - memory leaks, no cleanup on disconnect?
   - GPT conversation history growth (unbounded per session?)
   - Google TTS latency and error handling
   - Concurrent session handling under load
   - Audio playback/interrupt race conditions (isAISpeaking flag)
   - Frontend JS module loading and bundle size

3. **Test Coverage & Quality Reviewer** - Focus on:
   - Current 51-test suite gaps (only backend tested, no frontend tests)
   - Missing edge case coverage (WebSocket reconnection, TTS failures, auth token expiry)
   - Mock exam mode logic coverage
   - Noise filtering edge cases
   - Code quality: dead code, unused exports, inconsistent patterns

Have each reviewer produce a findings report with severity ratings (Critical/High/Medium/Low). Then synthesize into a prioritized action list.
```

## Controls

- **Shift+Up/Down** - Navigate between teammates
- **Shift+Tab** - Toggle delegate mode (lead coordinates only, doesn't code)
- **Ctrl+T** - Toggle shared task list
- **Enter** on a teammate - View their session
- **Escape** - Interrupt a teammate's current turn

## Notes

- This review is read-only — no code changes will be made
- In-process mode (all teammates run in the same terminal)
- Higher token usage than a single session (~3x)
- If a teammate stalls, tell the lead to nudge them or spawn a replacement
