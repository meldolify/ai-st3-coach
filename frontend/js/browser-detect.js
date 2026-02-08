// ============================================================================
// BROWSER-DETECT.JS - Browser and Capability Detection Utility
// ============================================================================
// Detects browser type and available APIs.
// VAD runs server-side — this module only detects browser/platform for
// compatibility warnings and getUserMedia support checks.
// ============================================================================

const BrowserDetect = {
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

    const isIOSSafari = isIOS && isSafari;
    const isIOSChrome = isIOS && /CriOS/.test(ua);
    const isIOSFirefox = isIOS && /FxiOS/.test(ua);
    const isIOSBrowser = isIOS;

    // API availability
    const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    const hasAudioContext = !!(window.AudioContext || window.webkitAudioContext);
    const hasWebSocket = typeof WebSocket !== 'undefined';

    // Server-side VAD: all browsers supported if they have getUserMedia + AudioContext
    const isSupported = hasGetUserMedia && hasAudioContext && hasWebSocket;

    this._cache = {
      browser: {
        isChrome,
        isEdge,
        isFirefox,
        isSafari,
        isOpera,
        name: this._getBrowserName({ isChrome, isEdge, isFirefox, isSafari, isOpera, isIOSChrome, isIOSFirefox })
      },

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

      apis: {
        hasGetUserMedia,
        hasAudioContext,
        hasWebSocket
      },

      // VAD runs server-side — all browsers use the same approach
      vad: {
        recommended: 'server',
        reason: 'Server-side Silero VAD via audio streaming'
      },

      isSupported,

      warningMessage: this._getWarningMessage({ isSupported, hasGetUserMedia, isIOS })
    };

    console.log('[BrowserDetect] Detection results:', this._cache);
    return this._cache;
  },

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

  _getWarningMessage({ isSupported, hasGetUserMedia, isIOS }) {
    if (!isSupported) {
      if (!hasGetUserMedia) {
        return {
          type: 'error',
          title: 'Microphone Not Supported',
          message: 'Your browser does not support microphone access. Please use a modern browser (Chrome, Edge, Firefox, or Safari).',
          dismissible: false
        };
      }
      return {
        type: 'error',
        title: 'Browser Not Supported',
        message: 'Your browser is missing required features. Please update your browser or try Chrome/Edge.',
        dismissible: false
      };
    }

    if (isIOS) {
      return {
        type: 'info',
        title: 'iOS Supported',
        message: 'Voice input is fully supported. For the best experience, ensure your microphone permissions are enabled.',
        dismissible: true
      };
    }

    return null; // No warning needed
  },

  isSupported() {
    return this.detect().isSupported;
  },

  shouldShowWarning() {
    return this.detect().warningMessage !== null;
  },

  getWarning() {
    return this.detect().warningMessage;
  }
};

window.BrowserDetect = BrowserDetect;
