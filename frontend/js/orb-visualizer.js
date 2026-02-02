// ============================================================================
// ORB-VISUALIZER.JS - Audio-Reactive Voice Orb with Canvas Radiating Rings
// ============================================================================
// Provides real-time audio visualization using concentric radiating rings.
// Creates a polished gradient ripple effect that responds to audio frequencies.
// ============================================================================

class OrbVisualizer {
  constructor() {
    this.orb = null;
    this.mobileOrb = null;
    this.canvas = null;
    this.mobileCanvas = null;
    this.ctx = null;
    this.mobileCtx = null;
    this.rings = [];
    this.audioContext = null;
    this.analyser = null;
    this.isActive = false;
    this.isShimmering = false;
    this.shimmerAnimationId = null;
    this.visualizationAnimationId = null;
    this.currentSource = null;

    // Ring configuration
    this.config = {
      ringCount: 6,           // Number of concentric rings
      baseRadius: 25,         // Starting radius from center
      maxExpansion: 35,       // Maximum expansion per ring when audio peaks
      spacing: 10,            // Base space between rings
      canvasSize: 140         // Canvas dimensions (matches orb size)
    };

    // Callbacks (mirror AudioPlayer interface)
    this.onStart = null;
    this.onEnd = null;

    // Safety timeout for stuck playback
    this.playbackTimeout = null;
  }

  /**
   * Initialize the visualizer - must be called after user gesture (click/tap)
   * Creates AudioContext and builds canvas visualizers inside orb elements
   */
  async init() {
    // Get orb elements
    this.orb = document.getElementById('voiceOrb');
    this.mobileOrb = document.getElementById('mobileVoiceOrb');

    if (!this.orb) {
      console.warn('[OrbVisualizer] Desktop orb element not found');
      return;
    }

    // Create AudioContext (requires user gesture on iOS)
    try {
      // Create AudioContext without specifying sampleRate (Safari compatibility)
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

      // iOS/Safari may start AudioContext in suspended state
      // We'll resume it when actually playing audio
      if (this.audioContext.state === 'suspended') {
        console.log('[OrbVisualizer] AudioContext suspended, will resume on playback');
      }

      // Create analyser node for frequency data
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 64; // 32 frequency bins (we use first 6)
      this.analyser.smoothingTimeConstant = 0.75;
      this.analyser.minDecibels = -85;
      this.analyser.maxDecibels = -10;

      // Build canvas visualizers
      this.createCanvasVisualizer(this.orb, false);
      if (this.mobileOrb) {
        this.createCanvasVisualizer(this.mobileOrb, true);
      }

      // Initialize ring data
      this.initRings();

      // Start idle shimmer
      this.startIdleShimmer();

      console.log('[OrbVisualizer] Initialized with canvas radiating rings');
    } catch (error) {
      console.error('[OrbVisualizer] Failed to initialize AudioContext:', error);
      // Don't throw - visualizer is optional, audio should still work
      console.warn('[OrbVisualizer] Continuing without visualization');
    }
  }

  /**
   * Create canvas visualizer inside an orb element
   */
  createCanvasVisualizer(orbElement, isMobile = false) {
    // Remove existing equalizer/canvas if present
    const existingEq = orbElement.querySelector('.orb-equalizer');
    if (existingEq) existingEq.remove();

    const existingCanvas = orbElement.querySelector('.orb-visualizer-canvas');
    if (existingCanvas) existingCanvas.remove();

    const { canvasSize } = this.config;

    // Create canvas element
    const canvas = document.createElement('canvas');
    canvas.className = 'orb-visualizer-canvas';
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    canvas.style.cssText = `
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 10;
      border-radius: 0;
      mix-blend-mode: screen;
    `;

    orbElement.appendChild(canvas);

    if (!isMobile) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
    } else {
      this.mobileCanvas = canvas;
      this.mobileCtx = canvas.getContext('2d');
    }
  }

  /**
   * Initialize ring data structures
   */
  initRings() {
    const { ringCount, baseRadius, spacing } = this.config;
    this.rings = [];

    for (let i = 0; i < ringCount; i++) {
      this.rings.push({
        baseRadius: baseRadius + (i * spacing),
        currentExpansion: 0,
        targetExpansion: 0,
        // Outer rings are more transparent
        baseOpacity: 0.7 - (i * 0.08)
      });
    }
  }

  /**
   * Get state-aware color for visualization (warm copper tones for visibility)
   * Brighter colors provide better contrast against dark sage background
   */
  getStateColor() {
    if (!this.orb) return { r: 184, g: 140, b: 90 }; // Soft warm copper (idle)

    if (this.orb.classList.contains('speaking')) {
      return { r: 242, g: 185, b: 130 };  // Bright warm copper
    } else if (this.orb.classList.contains('listening')) {
      return { r: 224, g: 165, b: 101 };  // Warm copper
    } else if (this.orb.classList.contains('thinking')) {
      return { r: 200, g: 155, b: 100 };  // Warm muted copper
    } else {
      return { r: 184, g: 140, b: 90 };   // Soft warm copper (idle)
    }
  }

  /**
   * Draw radiating rings on canvas
   */
  drawRings(ctx, canvas) {
    if (!ctx || !canvas) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get current state color
    const color = this.getStateColor();

    // Draw each ring (from outer to inner for proper layering)
    for (let i = this.rings.length - 1; i >= 0; i--) {
      const ring = this.rings[i];
      const radius = ring.baseRadius + ring.currentExpansion;

      // Dynamic opacity based on expansion (more visible when expanded)
      // Minimum opacity of 0.5 * baseOpacity when active to prevent flicker
      const expansionFactor = ring.currentExpansion / this.config.maxExpansion;
      const minOpacity = this.isActive ? 0.5 : 0.4;
      const opacity = ring.baseOpacity * (minOpacity + expansionFactor * (1 - minOpacity));

      // Create radial gradient for soft glow effect
      const innerRadius = Math.max(0, radius - 6);
      const outerRadius = radius + 6;

      const gradient = ctx.createRadialGradient(
        centerX, centerY, innerRadius,
        centerX, centerY, outerRadius
      );

      gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
      gradient.addColorStop(0.4, `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`);
      gradient.addColorStop(0.6, `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity * 0.8})`);
      gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);

      // Draw ring as stroked circle with gradient
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 10;
      ctx.stroke();
    }

    // Add central glow when active
    if (this.isActive) {
      const glowGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, this.config.baseRadius
      );
      glowGradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 0.3)`);
      glowGradient.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, 0.1)`);
      glowGradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);

      ctx.beginPath();
      ctx.arc(centerX, centerY, this.config.baseRadius, 0, Math.PI * 2);
      ctx.fillStyle = glowGradient;
      ctx.fill();
    }
  }

  /**
   * Play base64-encoded audio with real-time visualization
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
      // Ensure AudioContext exists
      if (!this.audioContext) {
        console.warn('[OrbVisualizer] No AudioContext, skipping visualization');
        this.handlePlaybackEnd();
        return;
      }

      // Resume AudioContext if suspended (iOS/Safari autoplay policy)
      if (this.audioContext.state === 'suspended') {
        try {
          await this.audioContext.resume();
          console.log('[OrbVisualizer] AudioContext resumed');
        } catch (resumeError) {
          console.warn('[OrbVisualizer] Failed to resume AudioContext:', resumeError);
          // Continue anyway - some browsers may still work
        }
      }

      // Decode base64 to ArrayBuffer
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Decode audio data (use copy of buffer for Safari compatibility)
      const arrayBuffer = bytes.buffer.slice(0);
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

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
      }, durationMs + 5000);

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

    // Reset rings and start shimmer
    this.resetRings();
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

    // Update ring expansions based on frequency data
    this.updateRings(dataArray);

    // Draw on canvases
    this.drawRings(this.ctx, this.canvas);
    if (this.mobileCtx) {
      this.drawRings(this.mobileCtx, this.mobileCanvas);
    }

    // Continue loop
    this.visualizationAnimationId = requestAnimationFrame(() => this.animateVisualization());
  }

  /**
   * Update ring expansions from frequency data
   */
  updateRings(dataArray) {
    const { maxExpansion, ringCount } = this.config;
    const binCount = Math.min(dataArray.length, ringCount);

    this.rings.forEach((ring, i) => {
      // Map frequency bin to ring (low frequencies = inner rings)
      const binIndex = Math.floor(i * (dataArray.length / ringCount));
      const value = dataArray[binIndex] / 255; // Normalize 0-1

      // Apply easing for smoother visual
      const easedValue = Math.pow(value, 0.6);

      // Set target expansion
      ring.targetExpansion = easedValue * maxExpansion;

      // Smooth interpolation (lerp towards target)
      ring.currentExpansion += (ring.targetExpansion - ring.currentExpansion) * 0.25;
    });
  }

  /**
   * Reset all rings to base state
   */
  resetRings() {
    this.rings.forEach(ring => {
      ring.currentExpansion = 0;
      ring.targetExpansion = 0;
    });

    // Clear canvases
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    if (this.mobileCtx && this.mobileCanvas) {
      this.mobileCtx.clearRect(0, 0, this.mobileCanvas.width, this.mobileCanvas.height);
    }
  }

  /**
   * Start subtle idle shimmer animation
   * Rings gently pulse to show the orb is "alive"
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
   * Shimmer animation loop - gentle wave effect
   */
  shimmerLoop() {
    if (!this.isShimmering || this.isActive) return;

    const time = Date.now() / 1000;

    this.rings.forEach((ring, i) => {
      // Each ring has unique phase offset for wave effect
      const phase = (time * 0.5 + i * 0.4) % (Math.PI * 2);
      const wave = 0.5 + Math.sin(phase) * 0.5; // Oscillate 0-1

      // Subtle expansion (0 to 8px)
      ring.currentExpansion = wave * 8;
    });

    // Draw shimmer
    this.drawRings(this.ctx, this.canvas);
    if (this.mobileCtx) {
      this.drawRings(this.mobileCtx, this.mobileCanvas);
    }

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
    this.resetRings();
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
window.orbVisualizer = new OrbVisualizer();
