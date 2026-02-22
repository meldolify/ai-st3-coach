import { useRef, useEffect } from 'react'
import * as THREE from 'three'

/**
 * ShaderBackground — Full-viewport WebGL aurora shader.
 * Sage/cream/mist color palette, audio-reactive via OrbVisualizer's analyser.
 * Uses Three.js OrthographicCamera + fullscreen quad + custom GLSL.
 */

const VERTEX_SHADER = `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`

const FRAGMENT_SHADER = `
  precision highp float;

  uniform float iTime;
  uniform vec2 iResolution;
  uniform float uBass;
  uniform float uMid;
  uniform float uHigh;
  uniform float uEnergy;

  // Simplex-style noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  // Fractional Brownian Motion
  float fbm(vec2 p) {
    float val = 0.0;
    float amp = 0.5;
    float freq = 1.0;
    for (int i = 0; i < 5; i++) {
      val += amp * snoise(p * freq);
      freq *= 2.0;
      amp *= 0.5;
    }
    return val;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    vec2 p = (gl_FragCoord.xy * 2.0 - iResolution.xy) / min(iResolution.x, iResolution.y);

    float t = iTime * 0.15;
    float audioBoost = uEnergy * 0.3;

    // Base gradient — warm cream to soft sage
    vec3 bgTop    = vec3(0.965, 0.953, 0.933);   // warm cream
    vec3 bgBottom = vec3(0.918, 0.937, 0.922);    // soft sage tint
    vec3 bg = mix(bgBottom, bgTop, uv.y * 0.8 + 0.1);

    // Aurora ribbon layer 1 — sage green
    float n1 = fbm(vec2(p.x * 0.8 + t, p.y * 0.6 + t * 0.7));
    n1 += uBass * 0.4 * sin(p.x * 3.0 + iTime * 2.0);
    float ribbon1 = smoothstep(0.0, 0.08 + audioBoost * 0.04, abs(n1 - p.y * 0.3 + 0.1));
    ribbon1 = 1.0 - ribbon1;
    vec3 sage = vec3(0.290, 0.365, 0.298);        // #4A5D4C
    vec3 sageLit = vec3(0.380, 0.480, 0.390);     // lighter sage

    // Aurora ribbon layer 2 — cream/gold
    float n2 = fbm(vec2(p.x * 0.6 - t * 0.8, p.y * 0.5 + t * 0.5 + 2.0));
    n2 += uMid * 0.3 * sin(p.y * 4.0 + iTime * 1.5);
    float ribbon2 = smoothstep(0.0, 0.06 + audioBoost * 0.03, abs(n2 - p.y * 0.25 - 0.15));
    ribbon2 = 1.0 - ribbon2;
    vec3 cream = vec3(0.890, 0.855, 0.780);       // warm gold-cream
    vec3 creamLit = vec3(0.940, 0.910, 0.850);

    // Aurora ribbon layer 3 — mist/teal hint
    float n3 = fbm(vec2(p.x * 1.0 + t * 0.6 + 5.0, p.y * 0.7 - t * 0.4));
    n3 += uHigh * 0.5 * cos(p.x * 5.0 + iTime * 3.0);
    float ribbon3 = smoothstep(0.0, 0.05 + audioBoost * 0.02, abs(n3 - p.y * 0.2 + 0.2));
    ribbon3 = 1.0 - ribbon3;
    vec3 mist = vec3(0.680, 0.780, 0.720);        // soft teal-mist
    vec3 mistLit = vec3(0.750, 0.850, 0.790);

    // Compose ribbons with shimmer
    float shimmer1 = 0.5 + 0.5 * sin(iTime * 0.8 + p.x * 2.0);
    float shimmer2 = 0.5 + 0.5 * sin(iTime * 1.2 + p.y * 3.0 + 1.0);
    float shimmer3 = 0.5 + 0.5 * sin(iTime * 0.6 + p.x * 1.5 + 2.5);

    vec3 r1Color = mix(sage, sageLit, shimmer1) * ribbon1 * (0.12 + audioBoost * 0.15);
    vec3 r2Color = mix(cream, creamLit, shimmer2) * ribbon2 * (0.08 + audioBoost * 0.10);
    vec3 r3Color = mix(mist, mistLit, shimmer3) * ribbon3 * (0.06 + audioBoost * 0.08);

    vec3 color = bg + r1Color + r2Color + r3Color;

    // Subtle particles
    float particles = 0.0;
    for (int i = 0; i < 8; i++) {
      float fi = float(i);
      vec2 particlePos = vec2(
        sin(fi * 1.7 + t * 0.3) * 0.8,
        cos(fi * 2.3 + t * 0.4) * 0.6
      );
      float dist = length(p - particlePos);
      float glow = (0.002 + uEnergy * 0.001) / (dist * dist + 0.01);
      particles += glow * 0.015;
    }
    color += vec3(particles) * sage * 0.5;

    // Vignette — soft fade at edges
    float vignette = 1.0 - dot(uv - 0.5, uv - 0.5) * 0.8;
    color *= vignette;

    // Clamp to prevent overexposure
    color = clamp(color, 0.0, 1.0);

    gl_FragColor = vec4(color, 1.0);
  }
`

export default function ShaderBackground({ orbVisualizerRef }) {
  const containerRef = useRef(null)
  const rendererRef = useRef(null)
  const sceneRef = useRef(null)
  const materialRef = useRef(null)
  const animationRef = useRef(null)
  const startTimeRef = useRef(Date.now())
  const audioDataRef = useRef(new Uint8Array(64))

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Three.js setup
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false })
    const dpr = Math.min(window.devicePixelRatio, 2)
    renderer.setPixelRatio(dpr)
    renderer.setSize(window.innerWidth, window.innerHeight)
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    const scene = new THREE.Scene()
    sceneRef.current = scene

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10)
    camera.position.z = 1

    // Fullscreen quad
    const geometry = new THREE.PlaneGeometry(2, 2)
    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms: {
        iTime: { value: 0.0 },
        iResolution: { value: new THREE.Vector2(window.innerWidth * dpr, window.innerHeight * dpr) },
        uBass: { value: 0.0 },
        uMid: { value: 0.0 },
        uHigh: { value: 0.0 },
        uEnergy: { value: 0.0 },
      },
    })
    materialRef.current = material

    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    // Animation loop
    const animate = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000
      material.uniforms.iTime.value = elapsed

      // Read audio data from OrbVisualizer's analyser
      const analyser = orbVisualizerRef?.current?.analyser
      if (analyser) {
        const data = audioDataRef.current
        if (data.length !== analyser.frequencyBinCount) {
          audioDataRef.current = new Uint8Array(analyser.frequencyBinCount)
        }
        analyser.getByteFrequencyData(audioDataRef.current)

        const freqData = audioDataRef.current
        const binCount = freqData.length
        const third = Math.floor(binCount / 3)

        // Average bass (low freq), mid, and high frequency bands
        let bass = 0, mid = 0, high = 0
        for (let i = 0; i < third; i++) bass += freqData[i]
        for (let i = third; i < third * 2; i++) mid += freqData[i]
        for (let i = third * 2; i < binCount; i++) high += freqData[i]

        bass = bass / third / 255
        mid = mid / third / 255
        high = high / (binCount - third * 2) / 255
        const energy = (bass + mid + high) / 3

        // Smooth transitions
        material.uniforms.uBass.value += (bass - material.uniforms.uBass.value) * 0.15
        material.uniforms.uMid.value += (mid - material.uniforms.uMid.value) * 0.15
        material.uniforms.uHigh.value += (high - material.uniforms.uHigh.value) * 0.15
        material.uniforms.uEnergy.value += (energy - material.uniforms.uEnergy.value) * 0.1
      } else {
        // Decay to zero when no audio
        material.uniforms.uBass.value *= 0.95
        material.uniforms.uMid.value *= 0.95
        material.uniforms.uHigh.value *= 0.95
        material.uniforms.uEnergy.value *= 0.95
      }

      renderer.render(scene, camera)
      animationRef.current = requestAnimationFrame(animate)
    }
    animate()

    // Resize handler
    const onResize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      const newDpr = Math.min(window.devicePixelRatio, 2)
      renderer.setPixelRatio(newDpr)
      renderer.setSize(w, h)
      material.uniforms.iResolution.value.set(w * newDpr, h * newDpr)
    }
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      renderer.dispose()
      geometry.dispose()
      material.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [orbVisualizerRef])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 -z-10"
      aria-hidden="true"
    />
  )
}
