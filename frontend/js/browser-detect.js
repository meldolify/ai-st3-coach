// ============================================================================
// BROWSER-DETECT.JS - Browser and Capability Detection Utility
// ============================================================================
// Detects browser type and available APIs to determine optimal speech
// recognition mode and show appropriate warnings.
// ============================================================================

const BrowserDetect = {
  // Cache detection results
  _cache: null,

  /**
   * Detect browser type and capabilities
   * @returns {Object} Detection results
   */
  detect() {
    if (this._cache) return this._cache;

    const ua = navigator.userAgent;
    const vendor = navigator.vendor || '';

    // Browser detection
    const isChrome = /Chrome/.test(ua) && /Google Inc/.test(vendor) && !/Edg/.test(ua);
    const isEdge = /Edg/.test(ua);
    const isFirefox = /Firefox/.test(ua);
    const isSafari = /Safari/.test(ua) && /Apple Computer/.test(vendor);
    const isOpera = /OPR/.test(ua);

    // Platform detection
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroid = /Android/.test(ua);
    const isMobile = isIOS || isAndroid || /Mobile/.test(ua);

    // iOS Safari specific (different from desktop Safari)
    const isIOSSafari = isIOS && isSafari;
    const isIOSChrome = isIOS && /CriOS/.test(ua);
    const isIOSFirefox = isIOS && /FxiOS/.test(ua);

    // Note: All iOS browsers use WebKit under the hood due to Apple restrictions
    const isIOSBrowser = isIOS;

    // API availability detection
    const hasWebSpeechAPI = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    const hasMediaRecorder = typeof MediaRecorder !== 'undefined';
    const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    const hasAudioContext = !!(window.AudioContext || window.webkitAudioContext);
    const hasWebSocket = typeof WebSocket !== 'undefined';

    // WASM support (required for Silero VAD)
    const hasWASM = typeof WebAssembly !== 'undefined';

    // SharedArrayBuffer (required for some WASM features, needs COOP/COEP headers)
    const hasSharedArrayBuffer = typeof SharedArrayBuffer !== 'undefined';

    // MediaRecorder codec support
    const mediaRecorderCodecs = this._detectMediaRecorderCodecs();

    // Determine recommended VAD mode
    const vadSupport = this._determineVADSupport({
      hasWASM,
      hasSharedArrayBuffer,
      hasMediaRecorder,
      hasGetUserMedia,
      hasAudioContext,
      isIOS,
      isSafari,
      isFirefox,
      mediaRecorderCodecs
    });

    // Determine if this is an optimal browser
    const isOptimalBrowser = (isChrome || isEdge) && !isIOS;

    this._cache = {
      // Browser identification
      browser: {
        isChrome,
        isEdge,
        isFirefox,
        isSafari,
        isOpera,
        name: this._getBrowserName({ isChrome, isEdge, isFirefox, isSafari, isOpera, isIOSChrome, isIOSFirefox })
      },

      // Platform
      platform: {
        isIOS,
        isAndroid,
        isMobile,
        isIOSSafari,
        isIOSChrome,
        isIOSFirefox,
        isIOSBrowser,
        isDesktop: !isMobile
      },

      // API availability
      apis: {
        hasWebSpeechAPI,
        hasMediaRecorder,
        hasGetUserMedia,
        hasAudioContext,
        hasWebSocket,
        hasWASM,
        hasSharedArrayBuffer
      },

      // MediaRecorder codecs
      mediaRecorderCodecs,

      // VAD support
      vad: vadSupport,

      // Recommendation
      isOptimalBrowser,
      recommendedBrowsers: ['Chrome', 'Edge'],

      // Warning message (if any)
      warningMessage: this._getWarningMessage({
        isOptimalBrowser,
        vadSupport,
        isIOS,
        isSafari,
        isFirefox
      })
    };

    console.log('[BrowserDetect] Detection results:', this._cache);
    return this._cache;
  },

  /**
   * Detect supported MediaRecorder MIME types
   */
  _detectMediaRecorderCodecs() {
    if (typeof MediaRecorder === 'undefined') {
      return { supported: [], preferred: null };
    }

    const codecs = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/mp4;codecs=mp4a.40.2', // AAC-LC
      'audio/aac',
      'audio/ogg;codecs=opus',
      'audio/wav'
    ];

    const supported = codecs.filter(codec => {
      try {
        return MediaRecorder.isTypeSupported(codec);
      } catch (e) {
        return false;
      }
    });

    // Prefer WebM/Opus for quality, fall back to MP4/AAC for Safari
    const preferred = supported[0] || null;

    return { supported, preferred };
  },

  /**
   * Determine VAD support level
   */
  _determineVADSupport({ hasWASM, hasSharedArrayBuffer, hasMediaRecorder, hasGetUserMedia, hasAudioContext, isIOS, isSafari, isFirefox, mediaRecorderCodecs }) {
    // Check basic requirements
    if (!hasMediaRecorder || !hasGetUserMedia || !hasAudioContext) {
      return {
        sileroVAD: false,
        simpleVAD: false,
        reason: 'Missing required APIs (MediaRecorder, getUserMedia, or AudioContext)',
        recommended: null
      };
    }

    // Check if we have any supported audio codec
    if (!mediaRecorderCodecs.preferred) {
      return {
        sileroVAD: false,
        simpleVAD: false,
        reason: 'No supported audio codecs for MediaRecorder',
        recommended: null
      };
    }

    // Silero VAD requires WASM
    // Note: SharedArrayBuffer is ideal but not strictly required for all WASM features
    const canUseSileroVAD = hasWASM && !isIOS && !isSafari;

    // Simple VAD (volume-based) works on all browsers with basic audio support
    const canUseSimpleVAD = hasAudioContext && hasMediaRecorder;

    if (canUseSileroVAD) {
      return {
        sileroVAD: true,
        simpleVAD: true,
        reason: 'Full WASM support available',
        recommended: 'silero'
      };
    }

    if (canUseSimpleVAD) {
      return {
        sileroVAD: false,
        simpleVAD: true,
        reason: isIOS ? 'iOS browsers have limited WASM support' :
                isSafari ? 'Safari has limited WASM support' :
                'WASM not fully supported',
        recommended: 'simple'
      };
    }

    return {
      sileroVAD: false,
      simpleVAD: false,
      reason: 'Required audio APIs not available',
      recommended: null
    };
  },

  /**
   * Get browser name string
   */
  _getBrowserName({ isChrome, isEdge, isFirefox, isSafari, isOpera, isIOSChrome, isIOSFirefox }) {
    if (isIOSChrome) return 'Chrome (iOS)';
    if (isIOSFirefox) return 'Firefox (iOS)';
    if (isEdge) return 'Edge';
    if (isChrome) return 'Chrome';
    if (isFirefox) return 'Firefox';
    if (isSafari) return 'Safari';
    if (isOpera) return 'Opera';
    return 'Unknown';
  },

  /**
   * Generate warning message for non-optimal browsers
   */
  _getWarningMessage({ isOptimalBrowser, vadSupport, isIOS, isSafari, isFirefox }) {
    if (isOptimalBrowser && vadSupport.sileroVAD) {
      return null; // No warning needed
    }

    if (!vadSupport.simpleVAD && !vadSupport.sileroVAD) {
      return {
        type: 'error',
        title: 'Browser Not Supported',
        message: 'Your browser does not support the required audio features. Please use Chrome or Edge for the best experience.',
        dismissible: false
      };
    }

    if (isIOS) {
      return {
        type: 'warning',
        title: 'Limited Experience on iOS',
        message: 'For the best voice detection accuracy, use Chrome or Edge on a desktop computer. Voice detection will still work but may be less accurate.',
        dismissible: true
      };
    }

    if (isSafari) {
      return {
        type: 'warning',
        title: 'Better Experience Available',
        message: 'For the best voice detection accuracy, use Chrome or Edge. Safari uses a simplified voice detection system.',
        dismissible: true
      };
    }

    if (isFirefox) {
      return {
        type: 'info',
        title: 'Optimized for Chrome/Edge',
        message: 'This app works best in Chrome or Edge. Firefox is supported but voice detection may vary.',
        dismissible: true
      };
    }

    return {
      type: 'info',
      title: 'Recommended: Chrome or Edge',
      message: 'For the best experience with voice detection, we recommend using Chrome or Edge.',
      dismissible: true
    };
  },

  /**
   * Check if current browser is supported at all
   */
  isSupported() {
    const detection = this.detect();
    return detection.vad.simpleVAD || detection.vad.sileroVAD;
  },

  /**
   * Get the recommended VAD type for current browser
   */
  getRecommendedVAD() {
    const detection = this.detect();
    return detection.vad.recommended;
  },

  /**
   * Check if we should show a warning banner
   */
  shouldShowWarning() {
    const detection = this.detect();
    return detection.warningMessage !== null;
  },

  /**
   * Get warning details
   */
  getWarning() {
    const detection = this.detect();
    return detection.warningMessage;
  }
};

// Make available globally
window.BrowserDetect = BrowserDetect;
