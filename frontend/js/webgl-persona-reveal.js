/**
 * WebGL Persona Background Effect for Difficulty Selection - Lumina Style
 * Full-page background that transitions between persona images on tab selection
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
        console.warn('[PersonaBackground] Dependencies not loaded after timeout');
      }
    };
    check();
  }

  // Main module initialization
  function initModule() {
    // Configuration
    const CONFIG = {
      transitionDuration: 1.8,
      autoPlayInterval: 5000,
      maxOpacity: 0.35,
      refractionStrength: 0.8,
      chromaticAberration: 0.6,
      liquidFlow: 0.5
    };

    // Persona image mapping
    const PERSONA_IMAGES = {
      easy: 'images/interviewer_persona_john.png',
      medium: 'images/interviewer_persona_elliot.png',
      strict: 'images/interviewer_persona_perry.png'
    };

    const DIFFICULTY_ORDER = ['easy', 'medium', 'strict'];

    // Vertex Shader
    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    // Fragment Shader - Glass transition between two textures with cover-fit
    const fragmentShader = `
      uniform sampler2D uTexture1;
      uniform sampler2D uTexture2;
      uniform float uProgress;
      uniform float uTime;
      uniform vec2 uResolution;
      uniform vec2 uTexture1Size;
      uniform vec2 uTexture2Size;
      uniform float uOpacity;
      uniform float uRefractionStrength;
      uniform float uChromaticAberration;
      uniform float uLiquidFlow;

      varying vec2 vUv;

      // Cover UV calculation - fills viewport without stretching, crops excess
      vec2 getCoverUV(vec2 uv, vec2 textureSize, vec2 resolution) {
        vec2 s = resolution / textureSize;
        float scale = max(s.x, s.y);
        vec2 scaledSize = textureSize * scale;
        vec2 offset = (resolution - scaledSize) * 0.5;
        return (uv * resolution - offset) / scaledSize;
      }

      void main() {
        float time = uTime * 0.25;

        // Create expanding circle transition from right side
        vec2 center = vec2(0.85, 0.5);
        float dist = length(vUv - center);
        float maxRadius = 1.5;
        float radius = uProgress * maxRadius;

        // Smooth edge for the transition circle
        float edge = smoothstep(radius + 0.2, radius - 0.08, dist);

        // Liquid flow distortion at the edge
        float edgeDist = abs(dist - radius);
        float edgeEffect = smoothstep(0.3, 0.0, edgeDist);
        float flowX = sin(vUv.y * 10.0 + time * 2.5) * 0.03 * edgeEffect * uLiquidFlow;
        float flowY = cos(vUv.x * 8.0 + time * 2.0) * 0.025 * edgeEffect * uLiquidFlow;

        vec2 distortedUv = vUv;
        distortedUv.x += flowX;
        distortedUv.y += flowY;

        // Refraction at transition edge
        vec2 dir = normalize(vUv - center);
        float refraction = edgeEffect * uRefractionStrength * 0.07;
        vec2 refractedUv1 = distortedUv - dir * refraction;
        vec2 refractedUv2 = distortedUv + dir * refraction;

        // Apply cover-fit UV mapping
        vec2 coverUv1 = getCoverUV(refractedUv1, uTexture1Size, uResolution);
        vec2 coverUv2 = getCoverUV(refractedUv2, uTexture2Size, uResolution);

        // Chromatic aberration
        float aberration = edgeEffect * uChromaticAberration * 0.015;

        // Sample texture 1 (current/fading out) - treat as opaque
        vec3 color1;
        color1.r = texture2D(uTexture1, coverUv1 + vec2(aberration, 0.0)).r;
        color1.g = texture2D(uTexture1, coverUv1).g;
        color1.b = texture2D(uTexture1, coverUv1 - vec2(aberration, 0.0)).b;

        // Sample texture 2 (new/fading in) - treat as opaque
        vec3 color2;
        color2.r = texture2D(uTexture2, coverUv2 + vec2(aberration, 0.0)).r;
        color2.g = texture2D(uTexture2, coverUv2).g;
        color2.b = texture2D(uTexture2, coverUv2 - vec2(aberration, 0.0)).b;

        // Mix based on transition progress
        vec3 finalColor = mix(color1, color2, edge);

        // Edge glow effect
        float glow = edgeEffect * 0.15;
        finalColor += vec3(glow * 0.5, glow * 0.6, glow * 0.7);

        // Soft vignette for depth
        float vignette = 1.0 - smoothstep(0.4, 1.2, dist) * 0.3;
        finalColor *= vignette;

        // Slight desaturation for background feel
        float gray = dot(finalColor, vec3(0.299, 0.587, 0.114));
        finalColor = mix(vec3(gray), finalColor, 0.9);

        gl_FragColor = vec4(finalColor, uOpacity);
      }
    `;

    /**
     * PersonaBackgroundEffect - Full page WebGL background
     */
    class PersonaBackgroundEffect {
      constructor(canvas, container) {
        this.canvas = canvas;
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.mesh = null;
        this.uniforms = null;
        this.textures = {};
        this.textureSizes = {};
        this.currentDifficulty = 'easy';
        this.targetDifficulty = 'easy';
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
            alpha: true,
            antialias: true,
            premultipliedAlpha: false
          });
          this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          this.renderer.setClearColor(0x000000, 0);

          // Load all persona textures
          await this.loadAllTextures();

          // Create uniforms with first texture
          const firstTexture = this.textures.easy || Object.values(this.textures)[0];
          const firstSize = this.textureSizes.easy || new THREE.Vector2(800, 1000);

          this.uniforms = {
            uTexture1: { value: firstTexture },
            uTexture2: { value: firstTexture },
            uTexture1Size: { value: firstSize.clone() },
            uTexture2Size: { value: firstSize.clone() },
            uProgress: { value: 0.0 },
            uTime: { value: 0.0 },
            uResolution: { value: new THREE.Vector2(1, 1) },
            uOpacity: { value: CONFIG.maxOpacity },
            uRefractionStrength: { value: CONFIG.refractionStrength },
            uChromaticAberration: { value: CONFIG.chromaticAberration },
            uLiquidFlow: { value: CONFIG.liquidFlow }
          };

          // Create shader material
          const material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            transparent: true,
            depthTest: false,
            depthWrite: false
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

          // Set initial active state
          this.updateActiveStates('easy');

          console.log('[PersonaBackground] Initialized successfully');
          return true;
        } catch (error) {
          console.error('[PersonaBackground] Initialization failed:', error);
          return false;
        }
      }

      loadTexture(url) {
        return new Promise((resolve, reject) => {
          const loader = new THREE.TextureLoader();
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
              console.warn('[PersonaBackground] Failed to load texture:', url);
              reject(error);
            }
          );
        });
      }

      async loadAllTextures() {
        const loadPromises = Object.entries(PERSONA_IMAGES).map(async ([key, url]) => {
          try {
            const texture = await this.loadTexture(url);
            this.textures[key] = texture;
            // Store texture dimensions for cover-fit calculation
            this.textureSizes[key] = new THREE.Vector2(
              texture.image.width,
              texture.image.height
            );
          } catch (e) {
            console.warn('[PersonaBackground] Skipping texture:', key);
            // Default size for fallback
            this.textureSizes[key] = new THREE.Vector2(800, 1000);
          }
        });
        await Promise.all(loadPromises);
        console.log('[PersonaBackground] Loaded', Object.keys(this.textures).length, 'textures');
      }

      setupTabListeners() {
        this.tabs = this.container.querySelectorAll('.lumina-tab');
        this.contentItems = this.container.querySelectorAll('.lumina-slide');
        this.counter = this.container.querySelector('.counter-current');

        this.tabs.forEach(tab => {
          const difficulty = tab.dataset.difficulty;
          tab.addEventListener('click', (e) => {
            e.preventDefault();
            this.goToDifficulty(difficulty);
          });
        });
      }

      goToDifficulty(difficulty) {
        if (this.isDestroyed) return;
        if (difficulty === this.currentDifficulty && !this.isTransitioning) return;

        const targetTexture = this.textures[difficulty];
        if (!targetTexture) {
          console.warn('[PersonaBackground] Texture not found for:', difficulty);
          return;
        }

        // Stop auto-play timer
        this.stopAutoPlay();

        // Kill any ongoing transition
        if (this.isTransitioning) {
          gsap.killTweensOf(this.uniforms.uProgress);
        }

        this.targetDifficulty = difficulty;

        // Update UI immediately
        this.updateActiveStates(difficulty);

        // Set up textures for transition
        if (this.textures[this.currentDifficulty]) {
          this.uniforms.uTexture1.value = this.textures[this.currentDifficulty];
          this.uniforms.uTexture1Size.value = this.textureSizes[this.currentDifficulty];
        }
        this.uniforms.uTexture2.value = targetTexture;
        this.uniforms.uTexture2Size.value = this.textureSizes[difficulty];
        this.uniforms.uProgress.value = 0;

        this.isTransitioning = true;

        // Animate the transition
        gsap.to(this.uniforms.uProgress, {
          value: 1.0,
          duration: CONFIG.transitionDuration,
          ease: 'power2.inOut',
          onComplete: () => {
            this.currentDifficulty = this.targetDifficulty;
            this.uniforms.uTexture1.value = targetTexture;
            this.uniforms.uTexture1Size.value = this.textureSizes[this.targetDifficulty];
            this.isTransitioning = false;

            // Restart auto-play
            this.startAutoPlay();
          }
        });
      }

      updateActiveStates(difficulty) {
        const index = DIFFICULTY_ORDER.indexOf(difficulty);

        // Update tabs
        this.tabs.forEach(tab => {
          const isActive = tab.dataset.difficulty === difficulty;
          tab.classList.toggle('active', isActive);

          // Reset progress bar animation
          const progressFill = tab.querySelector('.tab-progress-fill');
          if (progressFill) {
            progressFill.style.width = '0%';
            progressFill.style.animation = 'none';
            if (isActive) {
              // Trigger reflow then animate
              progressFill.offsetHeight;
              progressFill.style.animation = `fillProgress ${CONFIG.autoPlayInterval}ms linear forwards`;
            }
          }
        });

        // Update content items
        this.contentItems.forEach(item => {
          item.classList.toggle('active', item.dataset.difficulty === difficulty);
        });

        // Update counter
        if (this.counter) {
          this.counter.textContent = String(index + 1).padStart(2, '0');
        }
      }

      startAutoPlay() {
        this.stopAutoPlay();
        this.autoPlayTimer = setTimeout(() => {
          const currentIndex = DIFFICULTY_ORDER.indexOf(this.currentDifficulty);
          const nextIndex = (currentIndex + 1) % DIFFICULTY_ORDER.length;
          this.goToDifficulty(DIFFICULTY_ORDER[nextIndex]);
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

        const width = window.innerWidth;
        const height = window.innerHeight;

        this.renderer.setSize(width, height);
        this.uniforms.uResolution.value.set(width, height);
      }

      destroy() {
        this.isDestroyed = true;
        this.stopAutoPlay();

        if (this.animationId) {
          cancelAnimationFrame(this.animationId);
        }

        // Dispose textures
        Object.values(this.textures).forEach(texture => {
          if (texture) texture.dispose();
        });

        if (this.mesh) {
          if (this.mesh.material) {
            this.mesh.material.dispose();
          }
          if (this.mesh.geometry) {
            this.mesh.geometry.dispose();
          }
        }

        if (this.renderer) {
          this.renderer.dispose();
        }
      }
    }

    /**
     * Global function to select difficulty tab (called from HTML onclick)
     */
    window.selectDifficultyTab = function(difficulty) {
      if (window.difficultyPersonaEffect) {
        window.difficultyPersonaEffect.goToDifficulty(difficulty);
      }
    };

    /**
     * Initialize persona background effect for difficulty selection page
     */
    let isInitializing = false;

    function initDifficultyPersonaEffects() {
      // Prevent multiple initializations
      if (window.difficultyPersonaEffect || isInitializing) {
        console.log('[PersonaBackground] Already initialized or initializing, skipping');
        return;
      }

      isInitializing = true;

      // Check for hover support (skip on touch-only devices for auto-play behavior)
      const supportsHover = window.matchMedia('(hover: hover)').matches;

      // Check WebGL support
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        console.warn('[PersonaBackground] WebGL not supported');
        return;
      }

      const canvas = document.getElementById('difficultyCanvas');
      const container = document.getElementById('difficultySelection');

      if (!canvas || !container) {
        console.warn('[PersonaBackground] Canvas or container not found');
        return;
      }

      const effect = new PersonaBackgroundEffect(canvas, container);
      effect.init().then(success => {
        if (success) {
          window.difficultyPersonaEffect = effect;

          // Handle resize
          window.addEventListener('resize', () => effect.resize());

          console.log('[PersonaBackground] Ready');
        } else {
          isInitializing = false;
        }
      }).catch(() => {
        isInitializing = false;
      });
    }

    /**
     * Cleanup persona effects
     */
    function cleanupDifficultyPersonaEffects() {
      if (window.difficultyPersonaEffect) {
        window.difficultyPersonaEffect.destroy();
        window.difficultyPersonaEffect = null;
      }
    }

    // Expose to global scope
    window.PersonaBackgroundEffect = PersonaBackgroundEffect;
    window.initDifficultyPersonaEffects = initDifficultyPersonaEffects;
    window.cleanupDifficultyPersonaEffects = cleanupDifficultyPersonaEffects;

    // Initialize when difficulty selection page becomes visible
    function setupPageObserver() {
      const difficultyPage = document.getElementById('difficultySelection');
      if (!difficultyPage) {
        setTimeout(setupPageObserver, 500);
        return;
      }

      // Check if already visible
      const style = window.getComputedStyle(difficultyPage);
      const isVisible = style.display !== 'none' && style.visibility !== 'hidden';

      if (isVisible && !window.difficultyPersonaEffect) {
        setTimeout(initDifficultyPersonaEffects, 200);
      }

      // Observe for visibility changes
      const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
          if (mutation.type === 'attributes') {
            const style = window.getComputedStyle(difficultyPage);
            const isNowVisible = style.display !== 'none' && style.visibility !== 'hidden';

            if (isNowVisible && !window.difficultyPersonaEffect) {
              setTimeout(initDifficultyPersonaEffects, 200);
            }
          }
        });
      });

      observer.observe(difficultyPage, {
        attributes: true,
        attributeFilter: ['style', 'class']
      });
    }

    // Start observing
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(setupPageObserver, 200);
      });
    } else {
      setTimeout(setupPageObserver, 200);
    }
  }

  // Wait for dependencies then initialize
  waitForDependencies(initModule);

})();
