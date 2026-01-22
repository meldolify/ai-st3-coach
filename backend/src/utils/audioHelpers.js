/**
 * Audio helper utilities
 * Pure functions for noise filtering and SSML processing
 */

/**
 * Noise filter for Whisper transcriptions
 * Returns true if the transcript appears to be noise rather than speech
 * @param {string} text - The transcribed text to check
 * @returns {boolean} - True if the text is likely noise
 */
function isNoiseTranscript(text) {
  if (!text || typeof text !== 'string') {
    return true;
  }

  const trimmed = text.trim();

  // Empty or very short
  if (trimmed.length < 2) {
    return true;
  }

  // Common noise patterns from Whisper
  const noisePatterns = [
    // Basic filler sounds
    /^s+$/i,                          // Just "sss" or "ssssss"
    /^h+$/i,                          // Just "hhh" or "hhhh"
    /^m+$/i,                          // Just "mmm" or "mmmm"
    /^u+h*$/i,                        // Just "uhh" or "uuuuh"
    /^a+h*$/i,                        // Just "ahh" or "aaah"
    /^\.+$/,                          // Just dots
    /^\*+$/,                          // Just asterisks
    /^[\s\.,!?]+$/,                   // Just punctuation
    /^(um|uh|er|ah|oh|hm)+$/i,        // Just filler sounds
    /^(mmhmm|mhm|uh-huh)$/i,          // Agreement sounds

    // Single letters and very short words
    /^[a-z]$/i,                       // Single letters
    /^[a-z]{1,2}\.?$/i,               // One or two letters

    // Single word false positives
    // Single word false positives - RELAXED for PTT
    // We allow these now because PTT implies intent to speak
    /^(so|and|well|now|then)\.?$/i,   // Transition words alone
    /^(the|a|an|to|in|of)\.?$/i,      // Common short words alone (kept "is/it" as likely noise)

    // Common AI echo pickups in medical context
    /^thank you\.?$/i,                // Common noise pickup
    /^that's fine\.?$/i,              // Common echo from AI
    /^tell me more\.?$/i,             // Examiner prompt echo
    /^what else\.?$/i,                // Examiner prompt echo
    /^anything else\.?$/i,            // Examiner prompt echo
    /^(let me|I would|perhaps|indeed)$/i,  // Examiner phrases
    /^(certainly|absolutely|exactly)$/i,   // Agreement echoes

    // Breathing and mouth sounds
    /^(breath|sigh|cough)s?$/i,       // Breathing sounds
    /^(tsk|tch|pff|pfft)$/i,          // Mouth sounds

    // Whisper hallucinations and artifacts
    /^\.\.\.+$/,                      // Just ellipsis
    /^\[.*\]$/,                       // Bracketed annotations [music], [silence]
    /^♪.*♪$/,                         // Music notation
    /^\(.*\)$/,                       // Parenthetical annotations
    /^(music|applause|laughter)$/i,   // Sound annotations
    /^(inaudible|unintelligible)$/i,  // Transcription failures
    /^(silence|pause)$/i,             // Silence annotations
    /^transcript(ion)?$/i             // Meta-text
  ];

  for (const pattern of noisePatterns) {
    if (pattern.test(trimmed)) {
      console.log(`[NOISE FILTER] Rejected: "${trimmed}" (matched pattern)`);
      return true;
    }
  }

  // Check for repeated characters (like "ssssssss" with spaces)
  const withoutSpaces = trimmed.replace(/\s/g, '');
  if (withoutSpaces.length > 2) {
    const uniqueChars = new Set(withoutSpaces.toLowerCase()).size;
    if (uniqueChars <= 2) {
      console.log(`[NOISE FILTER] Rejected: "${trimmed}" (repeated characters)`);
      return true;
    }
  }

  // Minimum word count for non-noise
  // Very short transcripts with few words are likely noise
  const words = trimmed.split(/\s+/).filter(w => w.length > 1);
  if (words.length < 2 && trimmed.length < 10) {
    console.log(`[NOISE FILTER] Rejected: "${trimmed}" (too few words: ${words.length})`);
    return true;
  }

  return false;
}

/**
 * Build natural SSML from plain text
 * Adds natural pauses at punctuation without artificial emphasis
 * @param {string} text - Plain text to convert to SSML
 * @returns {string} - SSML-formatted text
 */
function buildNaturalSSML(text) {
  // Minimal SSML - only natural pauses, no artificial emphasis
  let ssml = text;

  // Add natural pauses using strength levels
  ssml = ssml.replace(/\.\s+/g, '.<break strength="medium"/> ');
  ssml = ssml.replace(/\?\s+/g, '?<break strength="medium"/> ');
  ssml = ssml.replace(/,\s+/g, ',<break strength="weak"/> ');

  // Wrap in speak tags
  return `<speak>${ssml}</speak>`;
}

module.exports = {
  isNoiseTranscript,
  buildNaturalSSML
};
