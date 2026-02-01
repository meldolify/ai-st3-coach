/**
 * WebGL Glass Effect for Features Section
 * Adapted from Lumina Interactive List component
 * Uses Three.js and GSAP for premium glass/refraction shader transitions
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
        console.warn('[WebGL Glass] Dependencies not loaded after timeout');
        // Apply fallback for all containers
        document.querySelectorAll('.webgl-glass-container').forEach(container => {
          container.classList.add('no-webgl');
          if (container.dataset.image) {
            container.style.backgroundImage = `url(${container.dataset.image})`;
          }
        });
      }
    };
    check();
  }

  // Configuration
  const CONFIG = {
    transitionDuration: 2.0,
    glassRefractionStrength: 0.8,
    glassChromaticAberration: 0.6,
    glassEdgeGlow: 0.5,
    glassLiquidFlow: 0.4,
    globalIntensity: 0.8,
    speedMultiplier: 0.8
  };

  // Vertex Shader
  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  // Fragment Shader - Glass Refraction Effect
  const fragmentShader = `
    uniform sampler2D uTexture;
    uniform float uProgress;
    uniform float uTime;
    uniform vec2 uResolution;
    uniform vec2 uTextureSize;
    uniform vec2 uMouse;
    uniform float uGlobalIntensity;
    uniform float uRefractionStrength;
    uniform float uChromaticAberration;
    uniform float uEdgeGlow;
    uniform float uLiquidFlow;

    varying vec2 vUv;

    // Cover UV calculation for responsive images
    vec2 getCoverUV(vec2 uv, vec2 textureSize) {
      vec2 s = uResolution / textureSize;
      float scale = max(s.x, s.y);
      vec2 scaledSize = textureSize * scale;
      vec2 offset = (uResolution - scaledSize) * 0.5;
      return (uv * uResolution - offset) / scaledSize;
    }

    void main() {
      vec2 uv = getCoverUV(vUv, uTextureSize);

      // Glass distortion calculations
      float time = uTime * 0.5;
      vec2 center = vec2(0.5, 0.5);
      float dist = length(vUv - center);

      // Liquid flow distortion
      float flowX = sin(vUv.y * 8.0 + time * 2.0) * 0.01 * uLiquidFlow * uProgress;
      float flowY = cos(vUv.x * 6.0 + time * 1.5) * 0.008 * uLiquidFlow * uProgress;

      // Refraction based on distance from center
      float refraction = (1.0 - smoothstep(0.0, 0.7, dist)) * uRefractionStrength * uProgress * 0.05;
      vec2 dir = normalize(vUv - center);

      // Apply distortions
      vec2 distortedUv = uv;
      distortedUv += dir * refraction;
      distortedUv.x += flowX;
      distortedUv.y += flowY;

      // Chromatic aberration
      float aberration = uChromaticAberration * uProgress * 0.015 * uGlobalIntensity;
      float r = texture2D(uTexture, distortedUv + dir * aberration).r;
      float g = texture2D(uTexture, distortedUv).g;
      float b = texture2D(uTexture, distortedUv - dir * aberration * 0.8).b;

      vec3 color = vec3(r, g, b);

      // Edge glow effect
      float edgeGlow = smoothstep(0.3, 0.5, dist) * uEdgeGlow * uProgress * 0.1;
      color += vec3(edgeGlow * 0.8, edgeGlow * 0.9, edgeGlow);

      // Glass highlight overlay
      float highlight = pow(1.0 - dist, 3.0) * 0.08 * uProgress;
      color = mix(color, vec3(1.0), highlight);

      // Subtle vignette
      float vignette = 1.0 - smoothstep(0.4, 0.9, dist) * 0.15;
      color *= vignette;

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  /**
   * GlassEffect Class - Manages WebGL rendering for a single container
   */
  class GlassEffect {
    constructor(container, imageUrl) {
      this.container = container;
      this.imageUrl = imageUrl;
      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.mesh = null;
      this.uniforms = null;
      this.animationId = null;
      this.isRevealed = false;
      this.isDestroyed = false;
      this.texture = null;
    }

    async init() {
      try {
        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'webgl-canvas';
        this.container.appendChild(this.canvas);

        // Create glass overlay
        const overlay = document.createElement('div');
        overlay.className = 'glass-overlay';
        this.container.appendChild(overlay);

        // Initialize Three.js
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

        this.renderer = new THREE.WebGLRenderer({
          canvas: this.canvas,
          antialias: true,
          alpha: false
        });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Load texture
        await this.loadTexture();

        // Create shader material
        this.createShaderMaterial();

        // Create mesh
        const geometry = new THREE.PlaneGeometry(2, 2);
        this.mesh = new THREE.Mesh(geometry, this.material);
        this.scene.add(this.mesh);

        // Initial sizing
        this.resize();

        // Start render loop
        this.animate();

        // Set initial hidden state
        this.uniforms.uProgress.value = 0;

        return true;
      } catch (error) {
        console.error('[WebGL Glass] Initialization failed:', error);
        this.handleFallback();
        return false;
      }
    }

    loadTexture() {
      return new Promise((resolve, reject) => {
        const loader = new THREE.TextureLoader();
        loader.crossOrigin = 'anonymous';

        loader.load(
          this.imageUrl,
          (texture) => {
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.generateMipmaps = false;
            this.texture = texture;
            resolve(texture);
          },
          undefined,
          (error) => {
            console.error('[WebGL Glass] Texture load failed:', this.imageUrl, error);
            reject(error);
          }
        );
      });
    }

    createShaderMaterial() {
      this.uniforms = {
        uTexture: { value: this.texture },
        uProgress: { value: 0.0 },
        uTime: { value: 0.0 },
        uResolution: { value: new THREE.Vector2(1, 1) },
        uTextureSize: { value: new THREE.Vector2(
          this.texture.image.width,
          this.texture.image.height
        )},
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uGlobalIntensity: { value: CONFIG.globalIntensity },
        uRefractionStrength: { value: CONFIG.glassRefractionStrength },
        uChromaticAberration: { value: CONFIG.glassChromaticAberration },
        uEdgeGlow: { value: CONFIG.glassEdgeGlow },
        uLiquidFlow: { value: CONFIG.glassLiquidFlow }
      };

      this.material = new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader
      });
    }

    animate() {
      if (this.isDestroyed) return;

      this.uniforms.uTime.value += 0.016 * CONFIG.speedMultiplier;
      this.renderer.render(this.scene, this.camera);
      this.animationId = requestAnimationFrame(() => this.animate());
    }

    reveal() {
      if (this.isRevealed || this.isDestroyed) return;
      this.isRevealed = true;

      gsap.to(this.uniforms.uProgress, {
        value: 1.0,
        duration: CONFIG.transitionDuration,
        ease: 'power2.out'
      });
    }

    resize() {
      if (this.isDestroyed || !this.renderer) return;

      const rect = this.container.getBoundingClientRect();
      const width = rect.width || 320;
      const height = rect.height || 320;

      this.renderer.setSize(width, height);
      this.uniforms.uResolution.value.set(width, height);
    }

    handleFallback() {
      // CSS fallback for browsers without WebGL
      this.container.classList.add('no-webgl');
      this.container.style.backgroundImage = `url(${this.imageUrl})`;
    }

    destroy() {
      this.isDestroyed = true;

      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }

      if (this.texture) {
        this.texture.dispose();
      }

      if (this.material) {
        this.material.dispose();
      }

      if (this.mesh && this.mesh.geometry) {
        this.mesh.geometry.dispose();
      }

      if (this.renderer) {
        this.renderer.dispose();
      }

      if (this.canvas && this.canvas.parentNode) {
        this.canvas.parentNode.removeChild(this.canvas);
      }
    }
  }

  /**
   * Initialize all glass effects in the features section
   */
  function initFeatureGlassEffects() {
    // Check WebGL support
    const testCanvas = document.createElement('canvas');
    const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');

    if (!gl) {
      console.warn('[WebGL Glass] WebGL not supported, using fallback');
      document.querySelectorAll('.webgl-glass-container').forEach(container => {
        container.classList.add('no-webgl');
        container.style.backgroundImage = `url(${container.dataset.image})`;
      });
      return;
    }

    const containers = document.querySelectorAll('.webgl-glass-container');
    const effects = [];

    containers.forEach(container => {
      const imageUrl = container.dataset.image;
      if (!imageUrl) {
        console.warn('[WebGL Glass] No data-image attribute found');
        return;
      }

      const effect = new GlassEffect(container, imageUrl);
      effect.init().then(success => {
        if (success) {
          effects.push(effect);
        }
      });
    });

    // Set up Intersection Observer for scroll-triggered reveal
    const observerOptions = {
      threshold: 0.3,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const container = entry.target;
          const effect = effects.find(e => e.container === container);
          if (effect && !effect.isRevealed) {
            // Delay reveal slightly for smoother experience
            setTimeout(() => effect.reveal(), 100);
          }
        }
      });
    }, observerOptions);

    containers.forEach(container => observer.observe(container));

    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        effects.forEach(effect => effect.resize());
      }, 100);
    });

    // Store reference for cleanup
    window.featureGlassEffects = effects;

    console.log('[WebGL Glass] Initialized', effects.length, 'glass effects');
  }

  // Main initialization function that waits for dependencies
  function init() {
    waitForDependencies(() => {
      // Expose to global scope
      window.GlassEffect = GlassEffect;
      window.initFeatureGlassEffects = initFeatureGlassEffects;

      // Auto-initialize if containers exist and DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          setTimeout(() => {
            const containers = document.querySelectorAll('.webgl-glass-container');
            if (containers.length > 0) {
              initFeatureGlassEffects();
            }
          }, 100);
        });
      } else {
        // DOM already loaded
        setTimeout(() => {
          const containers = document.querySelectorAll('.webgl-glass-container');
          if (containers.length > 0) {
            initFeatureGlassEffects();
          }
        }, 100);
      }
    });
  }

  // Start initialization
  init();

})();
