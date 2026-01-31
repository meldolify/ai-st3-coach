// ============================================================================
// ORB-VISUALIZER.JS - Audio-Reactive Voice Orb with Web Audio API
// ============================================================================
// Provides real-time audio visualization for the voice orb using frequency analysis.
// Creates 32 radial waveform bars that respond to AI speech audio.
// ============================================================================

class OrbVisualizer {
  constructor() {
    this.orb = null;
    this.mobileOrb = null;
    this.bars = [];
    this.mobileBars = [];
    this.audioContext = null;
    this.analyser = null;
    this.isActive = false;
    this.isShimmering = false;
    this.shimmerAnimationId = null;
    this.visualizationAnimationId = null;
    this.currentSource = null;

    // Callbacks (mirror AudioPlayer interface)
    this.onStart = null;
    this.onEnd = null;

    // Safety timeout for stuck playback
    this.playbackTimeout = null;
  }

  /**
   * Initialize the visualizer - must be called after user gesture (click/tap)
   * Creates AudioContext and builds waveform bars inside orb elements
   */
  async init() {
    // Get orb elements
    this.orb = document.getElementById('voiceOrb');
    this.mobileOrb = document.getElementById('mobileVoiceOrb');

    if (!this.orb) {
      console.warn('[OrbVisualizer] Desktop orb element not found');
      return;
    }

    // Create AudioContext (requires user gesture)
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

      // Create analyser node for frequency data
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 64; // 32 frequency bins
      this.analyser.smoothingTimeConstant = 0.75; // Smooth transitions
      this.analyser.minDecibels = -90;
      this.analyser.maxDecibels = -10;

      // Build waveform bars
      this.createWaveformBars(this.orb, this.bars);
      if (this.mobileOrb) {
        this.createWaveformBars(this.mobileOrb, this.mobileBars);
      }

      // Start idle shimmer
      this.startIdleShimmer();

      console.log('[OrbVisualizer] Initialized successfully');
    } catch (error) {
      console.error('[OrbVisualizer] Failed to initialize AudioContext:', error);
      throw error;
    }
  }

  /**
   * Create 32 radial waveform bars inside an orb element
   */
  createWaveformBars(orbElement, barsArray) {
    // Remove existing waveform container if present
    const existing = orbElement.querySelector('.orb-waveform');
    if (existing) {
      existing.remove();
    }

    // Create container
    const container = document.createElement('div');
    container.className = 'orb-waveform';

    // Create 32 bars arranged radially
    const barCount = 32;
    for (let i = 0; i < barCount; i++) {
      const bar = document.createElement('div');
      bar.className = 'orb-waveform-bar';
      // Rotate each bar to form a circle (360 / 32 = 11.25 degrees)
      bar.style.setProperty('--rotation', `${i * 11.25}deg`);
      container.appendChild(bar);
      barsArray.push(bar);
    }

    orbElement.appendChild(container);
  }

  /**
   * Play base64-encoded audio with real-time visualization
   * This replaces the standard AudioPlayer.playBase64Audio method
   */
  async playWithVisualization(base64Audio) {
    // Stop any idle shimmer
    this.stopIdleShimmer();

    // Clear any existing playback timeout
    if (this.playbackTimeout) {
      clearTimeout(this.playbackTimeout);
      this.playbackTimeout = null;
    }

    // Stop any currently playing audio
    if (this.currentSource) {
      try {
        this.currentSource.stop();
      } catch (e) {
        // Ignore if already stopped
      }
      this.currentSource = null;
    }

    try {
      // Resume AudioContext if suspended (browser autoplay policy)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Decode base64 to ArrayBuffer
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Decode audio data
      const audioBuffer = await this.audioContext.decodeAudioData(bytes.buffer);

      // Create source node
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      this.currentSource = source;

      // Connect: Source → Analyser → Destination (speakers)
      source.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);

      // Start playback and visualization
      source.start(0);
      this.isActive = true;
      if (this.onStart) this.onStart();

      // Start visualization loop
      this.animateVisualization();

      // Safety timeout based on buffer duration
      const durationMs = audioBuffer.duration * 1000;
      this.playbackTimeout = setTimeout(() => {
        if (this.isActive) {
          console.warn('[OrbVisualizer] Playback timeout - forcing end state');
          this.handlePlaybackEnd();
        }
      }, durationMs + 5000); // 5 second buffer

      // Handle natural playback end
      source.onended = () => {
        if (this.playbackTimeout) {
          clearTimeout(this.playbackTimeout);
          this.playbackTimeout = null;
        }
        this.handlePlaybackEnd();
      };

    } catch (error) {
      console.error('[OrbVisualizer] Audio playback error:', error);
      this.handlePlaybackEnd();
    }
  }

  /**
   * Handle end of audio playback
   */
  handlePlaybackEnd() {
    this.isActive = false;
    this.currentSource = null;

    // Cancel visualization animation
    if (this.visualizationAnimationId) {
      cancelAnimationFrame(this.visualizationAnimationId);
      this.visualizationAnimationId = null;
    }

    // Reset bars and start shimmer
    this.resetBars();
    this.startIdleShimmer();

    // Trigger callback
    if (this.onEnd) this.onEnd();
  }

  /**
   * Animation loop for audio-reactive visualization
   */
  animateVisualization() {
    if (!this.isActive) return;

    // Get frequency data
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);

    // Update bar heights based on frequency data
    this.updateBars(this.bars, dataArray);
    this.updateBars(this.mobileBars, dataArray);

    // Continue loop
    this.visualizationAnimationId = requestAnimationFrame(() => this.animateVisualization());
  }

  /**
   * Update bar heights from frequency data
   */
  updateBars(barsArray, dataArray) {
    if (!barsArray || barsArray.length === 0) return;

    barsArray.forEach((bar, i) => {
      // Map frequency bin to bar (32 bars, 32 bins)
      const value = dataArray[i] / 255; // Normalize 0-1

      // Scale: 4px min, 28px max with some easing
      const easedValue = Math.pow(value, 0.8); // Slight compression for smoother look
      const height = 4 + easedValue * 24;

      bar.style.setProperty('--bar-height', `${height}px`);
    });
  }

  /**
   * Reset all bars to minimum height
   */
  resetBars() {
    [...this.bars, ...this.mobileBars].forEach(bar => {
      bar.style.setProperty('--bar-height', '4px');
    });
  }

  /**
   * Start subtle idle shimmer animation
   * Bars gently oscillate to show the orb is "alive"
   */
  startIdleShimmer() {
    if (this.isShimmering || this.isActive) return;
    this.isShimmering = true;
    this.shimmerLoop();
  }

  /**
   * Stop idle shimmer animation
   */
  stopIdleShimmer() {
    this.isShimmering = false;
    if (this.shimmerAnimationId) {
      cancelAnimationFrame(this.shimmerAnimationId);
      this.shimmerAnimationId = null;
    }
  }

  /**
   * Shimmer animation loop
   */
  shimmerLoop() {
    if (!this.isShimmering || this.isActive) return;

    const time = Date.now() / 1000;

    [...this.bars, ...this.mobileBars].forEach((bar, i) => {
      // Each bar has unique phase offset for organic wave effect
      const phase = (time * 0.8 + i * 0.15) % (Math.PI * 2);
      const value = 0.5 + Math.sin(phase) * 0.3; // Oscillate 0.2-0.8
      const height = 4 + value * 6; // 4-10px range (subtle)
      bar.style.setProperty('--bar-height', `${height}px`);
    });

    this.shimmerAnimationId = requestAnimationFrame(() => this.shimmerLoop());
  }

  /**
   * Interrupt current playback
   */
  interrupt() {
    if (this.currentSource) {
      try {
        this.currentSource.stop();
      } catch (e) {
        // Ignore if already stopped
      }
      this.currentSource = null;
    }

    if (this.playbackTimeout) {
      clearTimeout(this.playbackTimeout);
      this.playbackTimeout = null;
    }

    if (this.visualizationAnimationId) {
      cancelAnimationFrame(this.visualizationAnimationId);
      this.visualizationAnimationId = null;
    }

    this.isActive = false;
    this.resetBars();
    this.startIdleShimmer();
  }

  /**
   * Check if audio is currently playing
   */
  get isPlaying() {
    return this.isActive;
  }
}

// ============================================================================
// GLOBAL INSTANCE
// ============================================================================
// Create singleton instance for use across the application
window.orbVisualizer = new OrbVisualizer();
