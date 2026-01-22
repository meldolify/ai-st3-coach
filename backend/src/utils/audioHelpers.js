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
  // PTT implies intent. No filtering.
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
