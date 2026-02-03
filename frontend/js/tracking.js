// ============================================================================
// TRACKING.JS - Session History and Analytics
// ============================================================================
// Dependencies: state.js, Supabase
// Functions: logSessionStart, logSessionEnd
// ============================================================================

async function logSessionStart() {
  if (!supabaseClient || !currentUser) return;

  try {
    const { data, error } = await supabaseClient
      .from('session_history')
      .insert({
        user_id: currentUser.id,
        scenario_path: currentScenario.promptFile,
        difficulty: selectedDifficulty
      })
      .select()
      .single();

    if (error) throw error;
    currentSessionHistoryId = data.id;
    console.log('[TRACKING] Session started:', currentSessionHistoryId);
  } catch (error) {
    console.error('[TRACKING] Error logging session start:', error);
  }
}

async function logSessionEnd() {
  if (!supabaseClient || !currentSessionHistoryId) return;

  try {
    await supabaseClient
      .from('session_history')
      .update({
        ended_at: new Date().toISOString()
      })
      .eq('id', currentSessionHistoryId);

    console.log('[TRACKING] Session ended:', currentSessionHistoryId);
    currentSessionHistoryId = null;
  } catch (error) {
    console.error('[TRACKING] Error logging session end:', error);
  }
}

/**
 * Store feedback data for the current session
 * @param {Object} feedback - Feedback object from AI
 * @param {number} feedback.score - Score 1-5
 * @param {string[]} feedback.strengths - Array of strengths
 * @param {string[]} feedback.improvements - Array of improvements
 * @param {string} feedback.summary - Summary text
 */
async function logSessionFeedback(feedback) {
  if (!supabaseClient || !currentSessionHistoryId || !feedback) return;

  try {
    const { error } = await supabaseClient
      .from('session_history')
      .update({
        feedback_data: feedback,
        ended_at: new Date().toISOString()
      })
      .eq('id', currentSessionHistoryId);

    if (error) throw error;
    console.log('[TRACKING] Feedback saved for session:', currentSessionHistoryId);
  } catch (error) {
    console.error('[TRACKING] Error saving feedback:', error);
  }
}

