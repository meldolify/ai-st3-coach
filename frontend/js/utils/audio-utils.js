// ============================================================================
// AUDIO-UTILS.JS - Shared Audio Utilities
// ============================================================================
// Consolidated audio processing functions used by speech.js, VADManager.js,
// and SimpleVAD.js. Extracted to eliminate duplication.
// ============================================================================

/**
 * Convert Float32Array audio data to WAV blob
 * @param {Float32Array} float32Array - Audio samples in range [-1, 1]
 * @param {number} sampleRate - Sample rate in Hz (e.g., 16000, 48000)
 * @returns {Blob} WAV audio blob
 */
function float32ToWav(float32Array, sampleRate) {
  const buffer = new ArrayBuffer(44 + float32Array.length * 2);
  const view = new DataView(buffer);

  const writeString = (offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  // WAV header
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + float32Array.length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);         // fmt chunk size
  view.setUint16(20, 1, true);          // PCM format
  view.setUint16(22, 1, true);          // mono
  view.setUint32(24, sampleRate, true); // sample rate
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true);          // block align
  view.setUint16(34, 16, true);         // bits per sample
  writeString(36, 'data');
  view.setUint32(40, float32Array.length * 2, true);

  // Convert float32 [-1, 1] to int16 [-32768, 32767]
  let offset = 44;
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    offset += 2;
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

/**
 * Convert Blob to base64 string
 * @param {Blob} blob - Audio blob
 * @returns {Promise<string>} Base64-encoded string (without data URL prefix)
 */
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Get preferred MIME type for MediaRecorder based on browser support
 * Safari doesn't support WebM, so we fall back to MP4/AAC
 * @returns {string} Supported MIME type or empty string for browser default
 */
function getPreferredMimeType() {
  const types = [
    'audio/webm;codecs=opus',   // Best quality, Chrome/Firefox/Edge
    'audio/webm',               // Fallback WebM
    'audio/mp4',                // Safari
    'audio/mp4;codecs=mp4a.40.2', // Safari with explicit AAC codec
    'audio/ogg;codecs=opus'     // Firefox fallback
  ];

  for (const type of types) {
    try {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    } catch (e) {
      // Ignore and try next
    }
  }

  // Last resort - let browser choose default
  console.warn('[AudioUtils] No preferred MIME type found, using browser default');
  return '';
}

// Make available globally (non-module pattern for browser script tags)
window.AudioUtils = {
  float32ToWav,
  blobToBase64,
  getPreferredMimeType
};
