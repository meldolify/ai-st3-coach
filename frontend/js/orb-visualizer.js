// ============================================================================
// ORB-VISUALIZER.JS - Audio-Reactive Voice Orb with SVG Arc Equalizer
// ============================================================================
// Provides real-time audio visualization using 16 curved arc segments.
// Creates a polished equalizer effect around the orb perimeter.
// ============================================================================

class OrbVisualizer {
  constructor() {
    this.orb = null;
    this.mobileOrb = null;
    this.arcs = [];
    this.mobileArcs = [];
    this.audioContext = null;
    this.analyser = null;
    this.isActive = false;
    this.isShimmering = false;
    this.shimmerAnimationId = null;
    this.visualizationAnimationId = null;
    this.currentSource = null;

    // Arc configuration
    this.config = {
      segmentCount: 16,
      gapDegrees: 8,
      innerRadius: 38,
      minOuterRadius: 44,
      maxOuterRadius: 62,
      centerX: 70,
      centerY: 70
    };

    // Callbacks (mirror AudioPlayer interface)
    this.onStart = null;
    this.onEnd = null;

    // Safety timeout for stuck playback
    this.playbackTimeout = null;
  }

  /**
   * Initialize the visualizer - must be called after user gesture (click/tap)
   * Creates AudioContext and builds SVG arc segments inside orb elements
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
      this.analyser.fftSize = 64; // 32 frequency bins (we use first 16)
      this.analyser.smoothingTimeConstant = 0.75;
      this.analyser.minDecibels = -85;
      this.analyser.maxDecibels = -10;

      // Build SVG arc equalizers
      this.createArcEqualizer(this.orb, this.arcs);
      if (this.mobileOrb) {
        this.createArcEqualizer(this.mobileOrb, this.mobileArcs);
      }

      // Start idle shimmer
      this.startIdleShimmer();

      console.log('[OrbVisualizer] Initialized with arc equalizer');
    } catch (error) {
      console.error('[OrbVisualizer] Failed to initialize AudioContext:', error);
      // Don't throw - visualizer is optional, audio should still work
      console.warn('[OrbVisualizer] Continuing without visualization');
    }
  }

  /**
   * Create SVG arc equalizer inside an orb element
   */
  createArcEqualizer(orbElement, arcsArray) {
    // Remove existing equalizer if present
    const existing = orbElement.querySelector('.orb-equalizer');
    if (existing) {
      existing.remove();
    }

    const { segmentCount, gapDegrees, innerRadius, minOuterRadius, centerX, centerY } = this.config;
    const segmentDegrees = (360 / segmentCount) - gapDegrees;

    // Create SVG element
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'orb-equalizer');
    svg.setAttribute('viewBox', '0 0 140 140');

    // Create group for arcs
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'equalizer-arcs');

    // Create 16 arc segments
    for (let i = 0; i < segmentCount; i++) {
      const startAngle = (i * (360 / segmentCount)) - 90; // Start from top
      const endAngle = startAngle + segmentDegrees;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('class', 'equalizer-arc');
      path.dataset.index = i;

      // Create arc data object
      const arcData = {
        path,
        startAngle,
        endAngle,
        currentOuterRadius: minOuterRadius
      };

      // Set initial arc path
      this.updateArcPath(arcData, minOuterRadius);

      g.appendChild(path);
      arcsArray.push(arcData);
    }

    svg.appendChild(g);
    orbElement.appendChild(svg);
  }

  /**
   * Update an arc path with new outer radius
   */
  updateArcPath(arcData, outerRadius) {
    const { innerRadius, centerX, centerY } = this.config;
    const { path, startAngle, endAngle } = arcData;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    // Calculate points
    const innerStart = {
      x: centerX + innerRadius * Math.cos(startRad),
      y: centerY + innerRadius * Math.sin(startRad)
    };
    const innerEnd = {
      x: centerX + innerRadius * Math.cos(endRad),
      y: centerY + innerRadius * Math.sin(endRad)
    };
    const outerStart = {
      x: centerX + outerRadius * Math.cos(startRad),
      y: centerY + outerRadius * Math.sin(startRad)
    };
    const outerEnd = {
      x: centerX + outerRadius * Math.cos(endRad),
      y: centerY + outerRadius * Math.sin(endRad)
    };

    const largeArc = (endAngle - startAngle) > 180 ? 1 : 0;

    // Build path: inner arc → line to outer → outer arc (reverse) → close
    const d = [
      `M ${innerStart.x.toFixed(2)} ${innerStart.y.toFixed(2)}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 1 ${innerEnd.x.toFixed(2)} ${innerEnd.y.toFixed(2)}`,
      `L ${outerEnd.x.toFixed(2)} ${outerEnd.y.toFixed(2)}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArc} 0 ${outerStart.x.toFixed(2)} ${outerStart.y.toFixed(2)}`,
      'Z'
    ].join(' ');

    path.setAttribute('d', d);
    arcData.currentOuterRadius = outerRadius;
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

    // Reset arcs and start shimmer
    this.resetArcs();
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

    // Update arc sizes based on frequency data
    this.updateArcs(this.arcs, dataArray);
    this.updateArcs(this.mobileArcs, dataArray);

    // Continue loop
    this.visualizationAnimationId = requestAnimationFrame(() => this.animateVisualization());
  }

  /**
   * Update arc outer radii from frequency data
   */
  updateArcs(arcsArray, dataArray) {
    if (!arcsArray || arcsArray.length === 0) return;

    const { minOuterRadius, maxOuterRadius } = this.config;
    const radiusRange = maxOuterRadius - minOuterRadius;

    arcsArray.forEach((arc, i) => {
      // Map frequency bin to arc (use first 16 bins)
      const value = dataArray[i] / 255; // Normalize 0-1

      // Apply easing for smoother visual
      const easedValue = Math.pow(value, 0.7);

      // Calculate new outer radius
      const targetRadius = minOuterRadius + easedValue * radiusRange;

      // Smooth transition (lerp towards target)
      const smoothRadius = arc.currentOuterRadius + (targetRadius - arc.currentOuterRadius) * 0.3;

      this.updateArcPath(arc, smoothRadius);
    });
  }

  /**
   * Reset all arcs to minimum size
   */
  resetArcs() {
    const { minOuterRadius } = this.config;

    [...this.arcs, ...this.mobileArcs].forEach(arc => {
      this.updateArcPath(arc, minOuterRadius);
    });
  }

  /**
   * Start subtle idle shimmer animation
   * Arcs gently oscillate to show the orb is "alive"
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
    const { minOuterRadius } = this.config;

    [...this.arcs, ...this.mobileArcs].forEach((arc, i) => {
      // Each arc has unique phase offset for wave effect
      const phase = (time * 0.6 + i * 0.25) % (Math.PI * 2);
      const wave = 0.5 + Math.sin(phase) * 0.5; // Oscillate 0-1

      // Subtle radius change (44 to 50px)
      const shimmerRadius = minOuterRadius + wave * 6;
      this.updateArcPath(arc, shimmerRadius);
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
    this.resetArcs();
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
