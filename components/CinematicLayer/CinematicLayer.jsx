'use client'

import { useEffect, useRef } from 'react'
import styles from './CinematicLayer.module.css'

export default function CinematicLayer() {
  const canvasRef = useRef(null)

  useEffect(() => {
    let THREE, renderer, scene, camera, particles, animId
    let mouse = { x: 0, y: 0 }
    let target = { x: 0, y: 0 }

    const handleMouseMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2
    }

    const handleResize = () => {
      if (!renderer || !camera) return
      renderer.setSize(window.innerWidth, window.innerHeight)
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
    }

    async function init() {
      THREE = (await import('three')).default || (await import('three'))

      const canvas = canvasRef.current
      if (!canvas) return

      // ── Renderer ──────────────────────────────────────────────
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setClearColor(0x000000, 0)

      // ── Scene / Camera ────────────────────────────────────────
      scene  = new THREE.Scene()
      camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
      camera.position.z = 5

      // ── Particles ─────────────────────────────────────────────
      const COUNT   = 240
      const geo     = new THREE.BufferGeometry()
      const positions  = new Float32Array(COUNT * 3)
      const colors     = new Float32Array(COUNT * 3)
      const sizes      = new Float32Array(COUNT)
      const phases     = new Float32Array(COUNT)   // sine offset
      const speeds     = new Float32Array(COUNT)
      const amplitudes = new Float32Array(COUNT)

      // Warm orange #f4722b → white palette
      const palette = [
        new THREE.Color(0xf4722b),  // vivid orange
        new THREE.Color(0xf89e68),  // light orange
        new THREE.Color(0xfcd9b8),  // peach
        new THREE.Color(0xfff5ec),  // near-white warm
        new THREE.Color(0x9ec6e8),  // soft blue (monitor glow)
      ]

      for (let i = 0; i < COUNT; i++) {
        const i3 = i * 3

        positions[i3]     = (Math.random() - 0.5) * 14
        positions[i3 + 1] = (Math.random() - 0.5) * 9
        positions[i3 + 2] = (Math.random() - 0.5) * 6 - 2

        const c = palette[Math.floor(Math.random() * palette.length)]
        colors[i3]     = c.r
        colors[i3 + 1] = c.g
        colors[i3 + 2] = c.b

        sizes[i]      = 8 + Math.random() * 60
        phases[i]     = Math.random() * Math.PI * 2
        speeds[i]     = 0.2 + Math.random() * 0.5
        amplitudes[i] = 0.06 + Math.random() * 0.18
      }

      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3))
      geo.setAttribute('size',     new THREE.BufferAttribute(sizes, 1))

      // ── Soft circle texture ────────────────────────────────────
      const texCanvas = document.createElement('canvas')
      texCanvas.width = texCanvas.height = 64
      const ctx = texCanvas.getContext('2d')
      const grd = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
      grd.addColorStop(0,   'rgba(255,255,255,1)')
      grd.addColorStop(0.25,'rgba(255,255,255,0.8)')
      grd.addColorStop(0.6, 'rgba(255,255,255,0.2)')
      grd.addColorStop(1,   'rgba(255,255,255,0)')
      ctx.fillStyle = grd
      ctx.fillRect(0, 0, 64, 64)
      const texture = new THREE.CanvasTexture(texCanvas)

      const mat = new THREE.PointsMaterial({
        size: 0.12,
        sizeAttenuation: true,
        vertexColors: true,
        map: texture,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })

      particles = new THREE.Points(geo, mat)
      scene.add(particles)

      // ── Animate ────────────────────────────────────────────────
      let clock = new THREE.Clock()

      function animate() {
        animId = requestAnimationFrame(animate)
        const t = clock.getElapsedTime()

        // Float particles
        const pos = geo.attributes.position.array
        for (let i = 0; i < COUNT; i++) {
          const i3 = i * 3
          pos[i3 + 1] += Math.sin(t * speeds[i] + phases[i]) * amplitudes[i] * 0.008
          pos[i3]     += Math.cos(t * speeds[i] * 0.7 + phases[i]) * amplitudes[i] * 0.004
        }
        geo.attributes.position.needsUpdate = true

        // Mouse parallax — lazy follow
        target.x += (mouse.x - target.x) * 0.03
        target.y += (mouse.y - target.y) * 0.03
        camera.position.x = target.x * 0.4
        camera.position.y = -target.y * 0.25
        camera.lookAt(scene.position)

        renderer.render(scene, camera)
      }
      animate()

      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('resize',    handleResize)
    }

    init()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize',    handleResize)
      if (renderer) {
        renderer.dispose()
        renderer.forceContextLoss()
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={styles.canvas}
      aria-hidden="true"
    />
  )
}
