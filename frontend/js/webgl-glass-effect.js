/**
 * WebGL Glass Effect for Features Section - Lumina Interactive List Style
 * Full-panel background that transitions between feature images on tab click
 * Uses Three.js and GSAP for premium glass shader transitions
 */

(function () {
  'use strict';

  // Wait for dependencies to be available
  function waitForDependencies(callback, maxAttempts = 50) {
    let attempts = 0;
    const check = () => {
      attempts++;
      if (typeof THREE !== 'undefined' && typeof gsap !== 'undefined') {
        callback();
      } else if (attempts < maxAttempts) {
        setTimeout(check, 100);
      } else {
        console.warn('[FeaturesGlass] Dependencies not loaded after timeout');
      }
    };
    check();
  }

  // Main module initialization
  function initModule() {
    // Configuration
    const CONFIG = {
      transitionDuration: 1.5,
      autoPlayInterval: 5000,
      refractionStrength: 0.7,
      chromaticAberration: 0.5,
      liquidFlow: 0.4
    };

    // Feature images - high quality, context-appropriate
    const FEATURE_IMAGES = [
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80', // Practice anytime - late night study
      'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80', // Expert designed - medical/surgical
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80'  // Try before commit - exploration
    ];

    // Vertex Shader
    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    // Fragment Shader - Glass transition between two textures
    const fragmentShader = `
      uniform sampler2D uTexture1;
      uniform sampler2D uTexture2;
      uniform float uProgress;
      uniform float uTime;
      uniform vec2 uResolution;
      uniform vec2 uTexture1Size;
      uniform vec2 uTexture2Size;
      uniform float uRefractionStrength;
      uniform float uChromaticAberration;
      uniform float uLiquidFlow;

      varying vec2 vUv;

      // Cover UV calculation for responsive images
      vec2 getCoverUV(vec2 uv, vec2 textureSize, vec2 resolution) {
        vec2 s = resolution / textureSize;
        float scale = max(s.x, s.y);
        vec2 scaledSize = textureSize * scale;
        vec2 offset = (resolution - scaledSize) * 0.5;
        return (uv * resolution - offset) / scaledSize;
      }

      void main() {
        float time = uTime * 0.3;

        // Create expanding circle transition from center
        vec2 center = vec2(0.5, 0.5);
        float dist = length(vUv - center);
        float maxRadius = 1.2;
        float radius = uProgress * maxRadius;

        // Smooth edge for the transition circle
        float edge = smoothstep(radius + 0.15, radius - 0.05, dist);

        // Liquid flow distortion at the edge
        float edgeDist = abs(dist - radius);
        float edgeEffect = smoothstep(0.25, 0.0, edgeDist);
        float flowX = sin(vUv.y * 12.0 + time * 3.0) * 0.025 * edgeEffect * uLiquidFlow;
        float flowY = cos(vUv.x * 10.0 + time * 2.5) * 0.02 * edgeEffect * uLiquidFlow;

        vec2 distortedUv = vUv;
        distortedUv.x += flowX;
        distortedUv.y += flowY;

        // Refraction at transition edge
        vec2 dir = normalize(vUv - center);
        float refraction = edgeEffect * uRefractionStrength * 0.06;
        vec2 refractedUv1 = distortedUv - dir * refraction;
        vec2 refractedUv2 = distortedUv + dir * refraction;

        // Convert to cover UVs
        vec2 coverUv1 = getCoverUV(refractedUv1, uTexture1Size, uResolution);
        vec2 coverUv2 = getCoverUV(refractedUv2, uTexture2Size, uResolution);

        // Chromatic aberration
        float aberration = edgeEffect * uChromaticAberration * 0.012;

        // Sample texture 1 (current/fading out)
        vec3 color1;
        color1.r = texture2D(uTexture1, coverUv1 + vec2(aberration, 0.0)).r;
        color1.g = texture2D(uTexture1, coverUv1).g;
        color1.b = texture2D(uTexture1, coverUv1 - vec2(aberration, 0.0)).b;

        // Sample texture 2 (new/fading in)
        vec3 color2;
        color2.r = texture2D(uTexture2, coverUv2 + vec2(aberration, 0.0)).r;
        color2.g = texture2D(uTexture2, coverUv2).g;
        color2.b = texture2D(uTexture2, coverUv2 - vec2(aberration, 0.0)).b;

        // Mix based on transition progress
        vec3 finalColor = mix(color1, color2, edge);

        // Edge glow effect
        float glow = edgeEffect * 0.12;
        finalColor += vec3(glow * 0.6, glow * 0.7, glow * 0.8);

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    /**
     * FeaturesGlassEffect - WebGL background for features section
     */
    class FeaturesGlassEffect {
      constructor(canvas, container) {
        this.canvas = canvas;
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.mesh = null;
        this.uniforms = null;
        this.textures = [];
        this.textureSizes = [];
        this.currentIndex = 0;
        this.targetIndex = 0;
        this.isTransitioning = false;
        this.animationId = null;
        this.isDestroyed = false;
        this.autoPlayTimer = null;
        this.tabs = null;
        this.contentItems = null;
        this.counter = null;
      }

      async init() {
        try {
          // Initialize Three.js
          this.scene = new THREE.Scene();
          this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

          this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: false,
            antialias: true
          });
          this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

          // Load all textures
          await this.loadAllTextures();

          // Create uniforms
          this.uniforms = {
            uTexture1: { value: this.textures[0] },
            uTexture2: { value: this.textures[0] },
            uProgress: { value: 0.0 },
            uTime: { value: 0.0 },
            uResolution: { value: new THREE.Vector2(1, 1) },
            uTexture1Size: { value: this.textureSizes[0] || new THREE.Vector2(800, 600) },
            uTexture2Size: { value: this.textureSizes[0] || new THREE.Vector2(800, 600) },
            uRefractionStrength: { value: CONFIG.refractionStrength },
            uChromaticAberration: { value: CONFIG.chromaticAberration },
            uLiquidFlow: { value: CONFIG.liquidFlow }
          };

          // Create shader material
          const material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader
          });

          // Create full-screen mesh
          const geometry = new THREE.PlaneGeometry(2, 2);
          this.mesh = new THREE.Mesh(geometry, material);
          this.scene.add(this.mesh);

          // Setup tab listeners
          this.setupTabListeners();

          // Initial sizing
          this.resize();

          // Start render loop
          this.animate();

          // Start auto-play
          this.startAutoPlay();

          console.log('[FeaturesGlass] Initialized successfully');
          return true;
        } catch (error) {
          console.error('[FeaturesGlass] Initialization failed:', error);
          return false;
        }
      }

      loadTexture(url) {
        return new Promise((resolve, reject) => {
          const loader = new THREE.TextureLoader();
          loader.crossOrigin = 'anonymous';
          loader.load(
            url,
            (texture) => {
              texture.minFilter = THREE.LinearFilter;
              texture.magFilter = THREE.LinearFilter;
              texture.generateMipmaps = false;
              resolve(texture);
            },
            undefined,
            (error) => {
              console.warn('[FeaturesGlass] Failed to load texture:', url);
              reject(error);
            }
          );
        });
      }

      async loadAllTextures() {
        for (let i = 0; i < FEATURE_IMAGES.length; i++) {
          try {
            const texture = await this.loadTexture(FEATURE_IMAGES[i]);
            this.textures[i] = texture;
            this.textureSizes[i] = new THREE.Vector2(
              texture.image.width,
              texture.image.height
            );
          } catch (e) {
            console.warn('[FeaturesGlass] Skipping texture:', i);
            // Create fallback
            this.textures[i] = this.textures[0] || null;
            this.textureSizes[i] = new THREE.Vector2(800, 600);
          }
        }
        console.log('[FeaturesGlass] Loaded', this.textures.length, 'textures');
      }

      setupTabListeners() {
        const section = document.getElementById('featuresSection');
        if (!section) return;

        this.tabs = section.querySelectorAll('.lumina-tab');
        this.contentItems = section.querySelectorAll('.lumina-slide');
        this.counter = section.querySelector('.counter-current');

        this.tabs.forEach((tab, index) => {
          tab.addEventListener('click', () => this.goToSlide(index));
        });
      }

      goToSlide(index) {
        if (this.isDestroyed || index === this.currentIndex) return;
        if (index < 0 || index >= this.textures.length) return;

        // Stop auto-play timer
        this.stopAutoPlay();

        this.targetIndex = index;
        const targetTexture = this.textures[index];

        if (!targetTexture) return;

        // Kill any ongoing transition
        if (this.isTransitioning) {
          gsap.killTweensOf(this.uniforms.uProgress);
        }

        // Update UI
        this.updateActiveStates(index);

        // Set up textures for transition
        this.uniforms.uTexture1.value = this.textures[this.currentIndex];
        this.uniforms.uTexture1Size.value = this.textureSizes[this.currentIndex];
        this.uniforms.uTexture2.value = targetTexture;
        this.uniforms.uTexture2Size.value = this.textureSizes[index];
        this.uniforms.uProgress.value = 0;

        this.isTransitioning = true;

        // Animate the transition
        gsap.to(this.uniforms.uProgress, {
          value: 1.0,
          duration: CONFIG.transitionDuration,
          ease: 'power2.inOut',
          onComplete: () => {
            this.currentIndex = this.targetIndex;
            this.uniforms.uTexture1.value = targetTexture;
            this.uniforms.uTexture1Size.value = this.textureSizes[index];
            this.isTransitioning = false;

            // Restart auto-play
            this.startAutoPlay();
          }
        });
      }

      updateActiveStates(index) {
        // Update tabs
        this.tabs.forEach((tab, i) => {
          tab.classList.toggle('active', i === index);
          // Reset progress bar animation
          const progressFill = tab.querySelector('.tab-progress-fill');
          if (progressFill) {
            progressFill.style.width = '0%';
            if (i === index) {
              // Trigger reflow then animate
              progressFill.offsetHeight;
              progressFill.style.transition = `width ${CONFIG.autoPlayInterval}ms linear`;
              progressFill.style.width = '100%';
            } else {
              progressFill.style.transition = 'none';
            }
          }
        });

        // Update content items
        this.contentItems.forEach((item, i) => {
          item.classList.toggle('active', i === index);
        });

        // Update counter
        if (this.counter) {
          this.counter.textContent = String(index + 1).padStart(2, '0');
        }
      }

      startAutoPlay() {
        this.stopAutoPlay();
        this.autoPlayTimer = setTimeout(() => {
          const nextIndex = (this.currentIndex + 1) % this.textures.length;
          this.goToSlide(nextIndex);
        }, CONFIG.autoPlayInterval);
      }

      stopAutoPlay() {
        if (this.autoPlayTimer) {
          clearTimeout(this.autoPlayTimer);
          this.autoPlayTimer = null;
        }
      }

      animate() {
        if (this.isDestroyed) return;

        this.uniforms.uTime.value += 0.016;
        this.renderer.render(this.scene, this.camera);
        this.animationId = requestAnimationFrame(() => this.animate());
      }

      resize() {
        if (this.isDestroyed || !this.renderer) return;

        const rect = this.container.getBoundingClientRect();
        const width = rect.width || 800;
        const height = rect.height || 500;

        this.renderer.setSize(width, height);
        this.uniforms.uResolution.value.set(width, height);
      }

      destroy() {
        this.isDestroyed = true;
        this.stopAutoPlay();

        if (this.animationId) {
          cancelAnimationFrame(this.animationId);
        }

        this.textures.forEach(texture => {
          if (texture) texture.dispose();
        });

        if (this.mesh) {
          if (this.mesh.material) this.mesh.material.dispose();
          if (this.mesh.geometry) this.mesh.geometry.dispose();
        }

        if (this.renderer) {
          this.renderer.dispose();
        }
      }
    }

    /**
     * Initialize features glass effect
     */
    function initFeatureGlassEffects() {
      // Prevent multiple initializations
      if (window.featuresGlassEffect) {
        console.log('[FeaturesGlass] Already initialized');
        return;
      }

      // Check for hover support (not essential but nice)
      const supportsHover = window.matchMedia('(hover: hover)').matches;

      // Check WebGL support
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        console.warn('[FeaturesGlass] WebGL not supported');
        return;
      }

      const canvas = document.getElementById('featuresCanvas');
      const section = document.getElementById('featuresSection');

      if (!canvas || !section) {
        console.warn('[FeaturesGlass] Canvas or section not found');
        return;
      }

      const effect = new FeaturesGlassEffect(canvas, section);
      effect.init().then(success => {
        if (success) {
          window.featuresGlassEffect = effect;

          // Handle resize
          let resizeTimeout;
          window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => effect.resize(), 100);
          });

          console.log('[FeaturesGlass] Ready');
        }
      });
    }

    /**
     * Cleanup
     */
    function cleanupFeatureGlassEffects() {
      if (window.featuresGlassEffect) {
        window.featuresGlassEffect.destroy();
        window.featuresGlassEffect = null;
      }
    }

    // Expose to global scope
    window.FeaturesGlassEffect = FeaturesGlassEffect;
    window.initFeatureGlassEffects = initFeatureGlassEffects;
    window.cleanupFeatureGlassEffects = cleanupFeatureGlassEffects;

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initFeatureGlassEffects, 300);
      });
    } else {
      setTimeout(initFeatureGlassEffects, 300);
    }
  }

  // Wait for dependencies then initialize
  waitForDependencies(initModule);

})();
