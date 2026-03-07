// landing-three.js — Three.js 3D background scene for landing page
// Displaced icosahedron with Perlin noise vertex shader

(function () {
  'use strict';

  if (!document.getElementById('landingPage')) return;
  if (window.innerWidth < 768) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (typeof THREE === 'undefined') {
    console.warn('[LANDING-3D] Three.js not loaded');
    return;
  }

  var canvas = document.getElementById('landingCanvas');
  if (!canvas) return;

  // ============================================================
  // PERLIN NOISE GLSL (ashima webgl-noise, 3D simplex)
  // ============================================================
  var noiseGLSL = [
    'vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }',
    'vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }',
    'vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }',
    'vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }',
    'float snoise(vec3 v) {',
    '  const vec2 C = vec2(1.0/6.0, 1.0/3.0);',
    '  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);',
    '  vec3 i = floor(v + dot(v, C.yyy));',
    '  vec3 x0 = v - i + dot(i, C.xxx);',
    '  vec3 g = step(x0.yzx, x0.xyz);',
    '  vec3 l = 1.0 - g;',
    '  vec3 i1 = min(g.xyz, l.zxy);',
    '  vec3 i2 = max(g.xyz, l.zxy);',
    '  vec3 x1 = x0 - i1 + C.xxx;',
    '  vec3 x2 = x0 - i2 + C.yyy;',
    '  vec3 x3 = x0 - D.yyy;',
    '  i = mod289(i);',
    '  vec4 p = permute(permute(permute(',
    '    i.z + vec4(0.0, i1.z, i2.z, 1.0))',
    '    + i.y + vec4(0.0, i1.y, i2.y, 1.0))',
    '    + i.x + vec4(0.0, i1.x, i2.x, 1.0));',
    '  float n_ = 0.142857142857;',
    '  vec3 ns = n_ * D.wyz - D.xzx;',
    '  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);',
    '  vec4 x_ = floor(j * ns.z);',
    '  vec4 y_ = floor(j - 7.0 * x_);',
    '  vec4 x = x_ * ns.x + ns.yyyy;',
    '  vec4 y = y_ * ns.x + ns.yyyy;',
    '  vec4 h = 1.0 - abs(x) - abs(y);',
    '  vec4 b0 = vec4(x.xy, y.xy);',
    '  vec4 b1 = vec4(x.zw, y.zw);',
    '  vec4 s0 = floor(b0) * 2.0 + 1.0;',
    '  vec4 s1 = floor(b1) * 2.0 + 1.0;',
    '  vec4 sh = -step(h, vec4(0.0));',
    '  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;',
    '  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;',
    '  vec3 p0 = vec3(a0.xy, h.x);',
    '  vec3 p1 = vec3(a0.zw, h.y);',
    '  vec3 p2 = vec3(a1.xy, h.z);',
    '  vec3 p3 = vec3(a1.zw, h.w);',
    '  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));',
    '  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;',
    '  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);',
    '  m = m * m;',
    '  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));',
    '}'
  ].join('\n');

  // ============================================================
  // SHADERS
  // ============================================================
  var vertexShader = [
    'uniform float uTime;',
    'uniform float uDisplacement;',
    'varying vec3 vNormal;',
    'varying vec3 vPosition;',
    noiseGLSL,
    'void main() {',
    '  vNormal = normal;',
    '  vPosition = position;',
    '  vec3 pos = position;',
    '  float noise = snoise(pos * 1.5 + uTime * 0.3);',
    '  pos += normal * noise * uDisplacement;',
    '  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);',
    '}'
  ].join('\n');

  var fragmentShader = [
    'uniform float uScroll;',
    'varying vec3 vNormal;',
    'varying vec3 vPosition;',
    'void main() {',
    '  // Base color: forest green, shifts darker with scroll',
    '  vec3 forestGreen = vec3(0.176, 0.353, 0.239);',  // #2D5A3D
    '  vec3 canopyDark = vec3(0.102, 0.227, 0.165);',   // #1A3A2A
    '  vec3 baseColor = mix(forestGreen, canopyDark, uScroll);',
    '',
    '  // Fresnel rim glow',
    '  vec3 viewDir = normalize(cameraPosition - vPosition);',
    '  float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 3.0);',
    '  vec3 glowColor = vec3(0.29, 0.87, 0.5);',  // #4ADE80
    '  vec3 finalColor = baseColor + glowColor * fresnel * 0.15;',
    '',
    '  gl_FragColor = vec4(finalColor, 0.85);',
    '}'
  ].join('\n');

  // ============================================================
  // SCENE SETUP
  // ============================================================
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 5;

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  } catch (e) {
    console.warn('[LANDING-3D] WebGL not available');
    canvas.style.display = 'none';
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  // Ensure canvas is visible (it now lives outside #landingPage)
  canvas.style.display = 'block';

  // Handle WebGL context loss (common on Mac GPU driver resets)
  canvas.addEventListener('webglcontextlost', function (e) {
    e.preventDefault();
    console.warn('[LANDING-3D] WebGL context lost');
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }, false);

  canvas.addEventListener('webglcontextrestored', function () {
    console.log('[LANDING-3D] WebGL context restored');
    animate();
  }, false);

  // Main displaced mesh
  var geometry = new THREE.IcosahedronGeometry(2, 64);
  var material = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uDisplacement: { value: 0.15 }
    },
    transparent: true
  });
  var mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // Wireframe overlay (tech element)
  var wireGeo = new THREE.IcosahedronGeometry(2, 16);
  var wireMat = new THREE.MeshBasicMaterial({
    color: 0xF0EDE7,
    wireframe: true,
    transparent: true,
    opacity: 0.06
  });
  var wireMesh = new THREE.Mesh(wireGeo, wireMat);
  scene.add(wireMesh);

  // ============================================================
  // SCROLL TRACKING
  // ============================================================
  var scrollProgress = 0;

  function updateScroll() {
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress = docHeight > 0 ? window.scrollY / docHeight : 0;
  }

  window.addEventListener('scroll', updateScroll, { passive: true });
  updateScroll();

  // ============================================================
  // OPACITY BASED ON SECTION
  // ============================================================
  function getTargetOpacity(progress) {
    // Hero area (0-12%): visible at 0.3
    if (progress < 0.12) return 0.5;
    // Light sections (~12-25%, ~45-60%): subtle at 0.12
    if (progress < 0.25) return 0.12;
    // Dark sections (~25-45%): more visible at 0.35
    if (progress < 0.45) return 0.35;
    // Light/services (~45-60%): subtle
    if (progress < 0.6) return 0.12;
    // Proof section (forest bg, ~60-75%): moderate
    if (progress < 0.75) return 0.25;
    // Action + footer (~75-100%): fading
    return 0.15;
  }

  // ============================================================
  // ANIMATION LOOP
  // ============================================================
  var animationId;
  var currentOpacity = 0.3;

  function animate() {
    animationId = requestAnimationFrame(animate);

    material.uniforms.uTime.value += 0.008;
    material.uniforms.uScroll.value = scrollProgress;
    material.uniforms.uDisplacement.value = 0.15 + scrollProgress * 0.4;

    // Rotation
    mesh.rotation.y = scrollProgress * Math.PI * 0.5;
    mesh.rotation.x = Math.sin(scrollProgress * Math.PI) * 0.2;
    wireMesh.rotation.copy(mesh.rotation);

    // Scale
    var s = 1.2 + Math.sin(scrollProgress * Math.PI) * 0.25;
    mesh.scale.setScalar(s);
    wireMesh.scale.setScalar(s);

    // Canvas opacity (smooth transition)
    var targetOpacity = getTargetOpacity(scrollProgress);
    currentOpacity += (targetOpacity - currentOpacity) * 0.05;
    canvas.style.opacity = currentOpacity;

    renderer.render(scene, camera);
  }

  // Guard: defer if canvas has zero dimensions (e.g. page not yet visible)
  if (canvas.width === 0 || canvas.height === 0) {
    console.warn('[LANDING-3D] Canvas has zero dimensions, deferring init');
    setTimeout(function () {
      renderer.setSize(window.innerWidth, window.innerHeight);
      if (canvas.width > 0 && canvas.height > 0) {
        animate();
        console.log('[LANDING-3D] Three.js scene initialized (deferred)');
      }
    }, 500);
  } else {
    animate();
    console.log('[LANDING-3D] Three.js scene initialized');
  }

  // ============================================================
  // RESIZE
  // ============================================================
  var resizeTimeout;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function () {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }, 250);
  });

  // ============================================================
  // CLEANUP
  // ============================================================
  window.destroyLandingThree = function () {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    if (renderer) {
      renderer.dispose();
    }
    if (geometry) geometry.dispose();
    if (material) material.dispose();
    if (wireGeo) wireGeo.dispose();
    if (wireMat) wireMat.dispose();
    scene = null;
    canvas.style.opacity = '0';
    canvas.style.display = 'none';
    console.log('[LANDING-3D] Three.js scene destroyed');
  };
})();
