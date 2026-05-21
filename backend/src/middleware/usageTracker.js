/**
 * usageTracker — Per-user daily usage caps + global LLM kill-switch.
 *
 * Defense-in-depth against:
 *   1. A single user racking up Deepgram/Gemini costs by leaving a session
 *      open for hours (per-user audio-minutes cap)
 *   2. A bug or attack pushing aggregate usage past a daily threshold the
 *      operator can afford (global LLM-call kill-switch)
 *
 * In-memory state, keyed by userId, reset at UTC midnight. Works on the
 * single-instance Render hobby plan we currently run on. If we horizontally
 * scale, this needs to move to Supabase or Redis — but the bounds will
 * still be useful as a "trust ceiling" per node.
 *
 * Tuning:
 *   DAILY_AUDIO_MINUTES_FREE     — free-tier per-user audio-minute cap
 *   DAILY_AUDIO_MINUTES_PREMIUM  — premium per-user audio-minute cap
 *   MAX_DAILY_LLM_CALLS          — global LLM kill-switch (0 = disabled)
 *
 * One audio chunk is approximately 85 ms of mic input (ScriptProcessorNode
 * 4096 buffer at 48 kHz). We count chunks and convert.
 */

const config = require('../config');

const CHUNK_MS = 85;

class UsageTracker {
  constructor() {
    // userId -> { date, audioChunks, llmCalls }
    this.byUser = new Map();
    // Global counters across all users for the same day.
    this.global = { date: this._today(), llmCalls: 0 };
    // Refresh at the top of every hour — cheap, catches the UTC-midnight
    // rollover. Don't unref so it keeps the process alive only if the
    // event loop has nothing else to do (which never happens for a
    // running server).
    this._interval = setInterval(() => this._rollIfNewDay(), 60 * 60 * 1000);
  }

  _today() {
    return new Date().toISOString().slice(0, 10);
  }

  _rollIfNewDay() {
    const t = this._today();
    if (this.global.date !== t) {
      this.byUser.clear();
      this.global = { date: t, llmCalls: 0 };
    }
  }

  _userEntry(userId) {
    this._rollIfNewDay();
    let entry = this.byUser.get(userId);
    if (!entry || entry.date !== this._today()) {
      entry = { date: this._today(), audioChunks: 0, llmCalls: 0 };
      this.byUser.set(userId, entry);
    }
    return entry;
  }

  /**
   * Check whether the user is still under their daily audio cap.
   * Returns { allowed, reason, minutesUsed, capMinutes }.
   */
  checkAudioCap(userId, isPremium) {
    const entry = this._userEntry(userId);
    const capMinutes = isPremium
      ? config.DAILY_AUDIO_MINUTES_PREMIUM
      : config.DAILY_AUDIO_MINUTES_FREE;
    if (!capMinutes || capMinutes <= 0) {
      return { allowed: true, minutesUsed: 0, capMinutes: Infinity };
    }
    const minutesUsed = (entry.audioChunks * CHUNK_MS) / 60000;
    if (minutesUsed >= capMinutes) {
      return {
        allowed: false,
        reason: `Daily audio limit reached (${capMinutes} min). Resets at UTC midnight.`,
        minutesUsed,
        capMinutes
      };
    }
    return { allowed: true, minutesUsed, capMinutes };
  }

  recordAudioChunk(userId) {
    const entry = this._userEntry(userId);
    entry.audioChunks += 1;
    return entry;
  }

  /**
   * Check whether we're still below the global LLM call cap. Used as a
   * per-LLM-call kill-switch — returns false when the operator-defined
   * daily budget is blown, regardless of which user is asking.
   */
  checkGlobalLLMCap() {
    this._rollIfNewDay();
    const cap = config.MAX_DAILY_LLM_CALLS;
    if (!cap || cap <= 0) {
      return { allowed: true };
    }
    if (this.global.llmCalls >= cap) {
      return {
        allowed: false,
        reason: 'Service capacity reached for today. Please try again tomorrow.'
      };
    }
    return { allowed: true };
  }

  recordLLMCall(userId) {
    const entry = this._userEntry(userId);
    entry.llmCalls += 1;
    this.global.llmCalls += 1;
  }

  // Test utility / dashboards.
  snapshot(userId) {
    return this._userEntry(userId);
  }

  globalSnapshot() {
    this._rollIfNewDay();
    return { ...this.global };
  }
}

module.exports = new UsageTracker();
