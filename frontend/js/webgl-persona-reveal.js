/**
 * WebGL Persona Background Effect for Difficulty Selection Page
 * Full-page background that transitions between persona images on card hover
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
      transitionDuration: 1.2,
      maxOpacity: 0.25,
      refractionStrength: 0.6,
      chromaticAberration: 0.5,
      liquidFlow: 0.3
    };

    // Persona image mapping
    const PERSONA_IMAGES = {
      easy: 'images/interviewer_persona_john.png',
      medium: 'images/interviewer_persona_elliot.png',
      moderate: 'images/interviewer_persona_elliot.png',
      strict: 'images/interviewer_persona_perry.png'
    };

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
      uniform float uOpacity;
      uniform float uRefractionStrength;
      uniform float uChromaticAberration;
      uniform float uLiquidFlow;

      varying vec2 vUv;

      void main() {
        vec2 uv = vUv;
        float time = uTime * 0.3;

        // Create expanding circle transition from center
        vec2 center = vec2(0.5, 0.5);
        float dist = length(uv - center);
        float maxRadius = 1.0;
        float radius = uProgress * maxRadius;

        // Smooth edge for the transition circle
        float edge = smoothstep(radius + 0.1, radius - 0.05, dist);

        // Liquid flow distortion at the edge
        float edgeDist = abs(dist - radius);
        float edgeEffect = smoothstep(0.2, 0.0, edgeDist);
        float flowX = sin(uv.y * 15.0 + time * 3.0) * 0.02 * edgeEffect * uLiquidFlow;
        float flowY = cos(uv.x * 12.0 + time * 2.5) * 0.015 * edgeEffect * uLiquidFlow;

        vec2 distortedUv = uv;
        distortedUv.x += flowX;
        distortedUv.y += flowY;

        // Refraction at transition edge
        vec2 dir = normalize(uv - center);
        float refraction = edgeEffect * uRefractionStrength * 0.05;
        vec2 refractedUv1 = distortedUv - dir * refraction;
        vec2 refractedUv2 = distortedUv + dir * refraction;

        // Chromatic aberration
        float aberration = edgeEffect * uChromaticAberration * 0.01;

        // Sample texture 1 (current/fading out)
        vec3 color1;
        color1.r = texture2D(uTexture1, refractedUv1 + vec2(aberration, 0.0)).r;
        color1.g = texture2D(uTexture1, refractedUv1).g;
        color1.b = texture2D(uTexture1, refractedUv1 - vec2(aberration, 0.0)).b;

        // Sample texture 2 (new/fading in)
        vec3 color2;
        color2.r = texture2D(uTexture2, refractedUv2 + vec2(aberration, 0.0)).r;
        color2.g = texture2D(uTexture2, refractedUv2).g;
        color2.b = texture2D(uTexture2, refractedUv2 - vec2(aberration, 0.0)).b;

        // Mix based on transition progress
        vec3 finalColor = mix(color1, color2, edge);

        // Edge glow effect
        float glow = edgeEffect * 0.1;
        finalColor += vec3(glow * 0.5, glow * 0.6, glow * 0.7);

        // Apply overall opacity
        float alpha = uOpacity;

        // Fade edges to transparent
        float vignette = 1.0 - smoothstep(0.3, 0.9, dist) * 0.4;
        alpha *= vignette;

        gl_FragColor = vec4(finalColor, alpha);
      }
    `;

    /**
     * PersonaBackgroundEffect - Full page WebGL background
     */
    class PersonaBackgroundEffect {
      constructor(container) {
        this.container = container;
        this.canvas = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.mesh = null;
        this.uniforms = null;
        this.textures = {};
        this.currentPersona = null;
        this.targetPersona = null;
        this.isTransitioning = false;
        this.animationId = null;
        this.isDestroyed = false;
        this.isVisible = false;
      }

      async init() {
        try {
          // Create canvas element
          this.canvas = document.createElement('canvas');
          this.canvas.className = 'persona-background-canvas';
          this.container.insertBefore(this.canvas, this.container.firstChild);

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

          this.uniforms = {
            uTexture1: { value: firstTexture },
            uTexture2: { value: firstTexture },
            uProgress: { value: 0.0 },
            uTime: { value: 0.0 },
            uResolution: { value: new THREE.Vector2(1, 1) },
            uOpacity: { value: 0.0 },
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

          // Setup card hover listeners
          this.setupCardListeners();

          // Initial sizing
          this.resize();

          // Start render loop
          this.animate();

          console.log('[PersonaBackground] Initialized successfully');
          return true;
        } catch (error) {
          console.error('[PersonaBackground] Initialization failed:', error);
          this.cleanup();
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
            this.textures[key] = await this.loadTexture(url);
          } catch (e) {
            console.warn('[PersonaBackground] Skipping texture:', key);
          }
        });
        await Promise.all(loadPromises);
        console.log('[PersonaBackground] Loaded', Object.keys(this.textures).length, 'textures');
      }

      setupCardListeners() {
        const cards = this.container.querySelectorAll('.difficulty-card');

        cards.forEach(card => {
          // Determine difficulty from class
          let difficulty = 'medium';
          if (card.classList.contains('difficulty-easy')) difficulty = 'easy';
          if (card.classList.contains('difficulty-moderate')) difficulty = 'medium';
          if (card.classList.contains('difficulty-strict')) difficulty = 'strict';

          card.addEventListener('mouseenter', () => this.onCardHover(difficulty));
          card.addEventListener('mouseleave', () => this.onCardLeave());
        });
      }

      onCardHover(difficulty) {
        if (this.isDestroyed) return;

        // Show background if not visible
        if (!this.isVisible) {
          this.isVisible = true;
          gsap.to(this.uniforms.uOpacity, {
            value: CONFIG.maxOpacity,
            duration: 0.5,
            ease: 'power2.out'
          });
        }

        // If same persona, no transition needed
        if (this.currentPersona === difficulty && !this.isTransitioning) {
          return;
        }

        // Start transition to new persona
        this.targetPersona = difficulty;
        const targetTexture = this.textures[difficulty];

        if (!targetTexture) {
          console.warn('[PersonaBackground] Texture not found for:', difficulty);
          return;
        }

        // If already transitioning, interrupt and start new transition
        if (this.isTransitioning) {
          gsap.killTweensOf(this.uniforms.uProgress);
        }

        // Set up textures for transition
        if (this.currentPersona && this.textures[this.currentPersona]) {
          this.uniforms.uTexture1.value = this.textures[this.currentPersona];
        }
        this.uniforms.uTexture2.value = targetTexture;
        this.uniforms.uProgress.value = 0;

        this.isTransitioning = true;

        // Animate the transition
        gsap.to(this.uniforms.uProgress, {
          value: 1.0,
          duration: CONFIG.transitionDuration,
          ease: 'power2.inOut',
          onComplete: () => {
            this.currentPersona = this.targetPersona;
            this.uniforms.uTexture1.value = targetTexture;
            this.isTransitioning = false;
          }
        });
      }

      onCardLeave() {
        if (this.isDestroyed) return;

        // Fade out background
        this.isVisible = false;
        gsap.to(this.uniforms.uOpacity, {
          value: 0.0,
          duration: 0.4,
          ease: 'power2.in'
        });
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
        const width = rect.width || window.innerWidth;
        const height = rect.height || window.innerHeight;

        this.renderer.setSize(width, height);
        this.uniforms.uResolution.value.set(width, height);
      }

      cleanup() {
        if (this.canvas && this.canvas.parentNode) {
          this.canvas.parentNode.removeChild(this.canvas);
        }
      }

      destroy() {
        this.isDestroyed = true;

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

        this.cleanup();
      }
    }

    /**
     * Initialize persona background effect for difficulty selection page
     */
    function initDifficultyPersonaEffects() {
      // Prevent multiple initializations
      if (window.difficultyPersonaEffects) {
        console.log('[PersonaBackground] Already initialized, skipping');
        return;
      }

      // Check for hover support (skip on touch-only devices)
      const supportsHover = window.matchMedia('(hover: hover)').matches;
      if (!supportsHover) {
        console.log('[PersonaBackground] Disabled: touch-only device detected');
        return;
      }

      // Check WebGL support
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        console.warn('[PersonaBackground] WebGL not supported');
        return;
      }

      const difficultyPage = document.getElementById('difficultySelection');
      if (!difficultyPage) {
        console.warn('[PersonaBackground] Difficulty selection page not found');
        return;
      }

      const effect = new PersonaBackgroundEffect(difficultyPage);
      effect.init().then(success => {
        if (success) {
          window.difficultyPersonaEffects = effect;

          // Handle resize
          window.addEventListener('resize', () => effect.resize());

          console.log('[PersonaBackground] Ready');
        }
      });
    }

    /**
     * Cleanup persona effects
     */
    function cleanupDifficultyPersonaEffects() {
      if (window.difficultyPersonaEffects) {
        window.difficultyPersonaEffects.destroy();
        window.difficultyPersonaEffects = null;
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

      // Observe for visibility changes
      const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
          if (mutation.type === 'attributes') {
            const style = window.getComputedStyle(difficultyPage);
            const isNowVisible = style.display !== 'none' && style.visibility !== 'hidden';

            if (isNowVisible && !window.difficultyPersonaEffects) {
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
