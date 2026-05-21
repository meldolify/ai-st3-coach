/**
 * Live WebSocket session registry.
 *
 * Extracted from server.js so non-WS callers (currently account-delete; later
 * possibly admin tooling) can interact with active sessions cleanly without
 * an import cycle through server.js. Audit 2026-05-21 §LOW-06.
 *
 * The Map is the single source of truth — server.js's connection handler
 * inserts on open, the close handler deletes on disconnect, and the idle
 * cleanup sweep removes silent sessions. Anyone importing `sessions` is
 * touching the same object server.js holds.
 *
 * Each entry is roughly:
 *   { history, ws, scenario, voice, difficulty, userId, isPremium,
 *     isAISpeaking, inFeedbackMode, interviewEnded, feedbackCount,
 *     flux, lastActivity, _processingLock, audioCapHit? }
 *
 * (see server.js wss.on('connection') for the canonical shape)
 */

const sessions = new Map();

/**
 * Tear down every active WS session owned by the given user. Used at the
 * end of DELETE /api/account so a user who has just deleted their account
 * cannot continue burning Deepgram/Gemini quota on their (now-orphaned)
 * in-flight interview.
 *
 * For each matching session:
 *   1. destroy the Flux STT connection (idempotent — safe to call twice)
 *   2. terminate the WebSocket (triggers ws.on('close') in server.js,
 *      which performs its own cleanup of the rate-limiter + sessions Map)
 *   3. delete from sessions Map (defence in depth — the close handler
 *      should also delete, but if for any reason it doesn't fire we don't
 *      leave a zombie entry)
 *
 * @param {string} userId - Supabase user id whose sessions to terminate
 * @returns {string[]} sessionIds that were terminated (for logging/tests)
 */
function terminateUserSessions(userId) {
  if (!userId) {
    return [];
  }
  const terminated = [];
  for (const [id, session] of sessions.entries()) {
    if (session && session.userId === userId) {
      try {
        session.flux?.destroy();
      } catch {
        /* idempotent; ignore */
      }
      try {
        session.ws?.terminate();
      } catch {
        /* socket may already be closed */
      }
      sessions.delete(id);
      terminated.push(id);
    }
  }
  return terminated;
}

module.exports = { sessions, terminateUserSessions };
