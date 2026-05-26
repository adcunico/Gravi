import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface Props {
  analyser: AnalyserNode | null
  active: boolean
}

export default function GoldWaveform({ analyser, active }: Props) {
  const mountRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<number>(0)
  const sceneRef = useRef<{
    renderer: THREE.WebGLRenderer
    scene: THREE.Scene
    camera: THREE.Camera
    particles: THREE.Points
    positions: Float32Array
  } | null>(null)

  useEffect(() => {
    const el = mountRef.current
    if (!el) return

    const W = el.clientWidth
    const H = el.clientHeight

    // Scene setup
    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-W / 2, W / 2, H / 2, -H / 2, -1, 1)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    el.appendChild(renderer.domElement)

    const COUNT = window.innerWidth < 768 ? 100 : 180
    const positions = new Float32Array(COUNT * 3)
    const colors = new Float32Array(COUNT * 3)
    const sizes = new Float32Array(COUNT)

    const goldColor = new THREE.Color('#D4A85A')
    const champColor = new THREE.Color('#F2D28B')

    for (let i = 0; i < COUNT; i++) {
      const angle = (i / COUNT) * Math.PI * 2
      const r = 80
      positions[i * 3] = Math.cos(angle) * r
      positions[i * 3 + 1] = Math.sin(angle) * r
      positions[i * 3 + 2] = 0
      const mix = i / COUNT
      const c = goldColor.clone().lerp(champColor, mix)
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
      sizes[i] = 3 + Math.random() * 3
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

    const mat = new THREE.PointsMaterial({
      size: 4,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      sizeAttenuation: false,
    })

    const particles = new THREE.Points(geo, mat)
    scene.add(particles)

    sceneRef.current = { renderer, scene, camera, particles, positions }

    const dataArray = analyser ? new Uint8Array(analyser.frequencyBinCount) : null
    let t = 0

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate)
      t += 0.016

      let amplitude = 0
      if (analyser && dataArray && active) {
        analyser.getByteFrequencyData(dataArray)
        const sum = dataArray.slice(0, 64).reduce((a, b) => a + b, 0)
        amplitude = sum / (64 * 255)
      }

      const pos = geo.attributes.position as THREE.BufferAttribute
      const posArr = pos.array as Float32Array

      for (let i = 0; i < COUNT; i++) {
        const angle = (i / COUNT) * Math.PI * 2
        const idleR = 80 + Math.sin(t * 0.8 + i * 0.4) * 4
        const pulseR = active ? idleR + amplitude * 50 + Math.sin(t * 3 + i * 0.3) * amplitude * 20 : idleR
        posArr[i * 3] = Math.cos(angle + t * 0.15) * pulseR
        posArr[i * 3 + 1] = Math.sin(angle + t * 0.15) * pulseR
      }
      pos.needsUpdate = true

      const m = mat as THREE.PointsMaterial
      m.opacity = 0.7 + amplitude * 0.3

      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => {
      const w = el.clientWidth, h = el.clientHeight
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(frameRef.current)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      geo.dispose()
      mat.dispose()
      if (renderer.domElement.parentNode === el) {
        el.removeChild(renderer.domElement)
      }
    }
  }, [analyser, active])

  return <div ref={mountRef} className="w-full h-full" aria-hidden />
}

// Fallback CSS waveform when WebGL unavailable
export function CssWaveform({ active }: { active: boolean }) {
  return (
    <div className="flex items-end justify-center gap-1 h-16 px-4">
      {Array.from({ length: 32 }).map((_, i) => (
        <div
          key={i}
          className="w-1 rounded-full bg-gold"
          style={{
            height: active ? `${20 + Math.random() * 40}%` : '8px',
            opacity: 0.5 + (i % 3) * 0.2,
            animation: active ? `waveBar ${0.4 + (i % 5) * 0.1}s ease-in-out infinite alternate` : 'none',
            animationDelay: `${i * 0.03}s`,
          }}
        />
      ))}
    </div>
  )
}
