/**
 * Audio helper utilities
 * Pure functions for noise filtering and SSML processing
 */

/**
 * Noise filter for Whisper transcriptions
 * Returns true if the transcript appears to be noise rather than speech
 * Used in VAD mode to filter out false positives from ambient noise
 * @param {string} text - The transcribed text to check
 * @returns {boolean} - True if the text is likely noise
 */
function isNoiseTranscript(text) {
  // Empty or invalid input
  if (!text || typeof text !== 'string') {
    return true;
  }

  const trimmed = text.trim();

  // Very short text (< 2 characters)
  if (trimmed.length < 2) {
    return true;
  }

  // Common noise patterns that Whisper produces for ambient sounds
  const noisePatterns = [
    /^(um+|uh+|er+|ah+|oh+|hm+|mm+)\.?$/i,       // Filler sounds
    /^\.+$/,                                       // Just dots
    /^(thanks?|thank you)\.?$/i,                  // Echo pickup from TTS
    /^(okay|ok)\.?$/i,                            // Common false positive
    /^(yes|no|yeah|nope)\.?$/i,                   // Single word confirmations
    /^(that's fine|that's great|alright)\.?$/i,  // TTS echo phrases
    /^[\s\.\,\!\?]+$/,                            // Just punctuation/whitespace
    /^[^a-zA-Z]*$/,                               // No letters at all
    /^([a-z])\1+$/i,                              // Repeated single letter (sss, aaaa)
    /^([a-z]\s)+[a-z]?$/i                        // Repeated letters with spaces (s s s)
  ];

  // Check against noise patterns
  if (noisePatterns.some(pattern => pattern.test(trimmed))) {
    console.log(`[NOISE FILTER] Filtered: "${trimmed}"`);
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
