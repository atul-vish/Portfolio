'use client'

import { useEffect, useRef } from 'react'
import styles from './StarsBackground.module.css'

export default function StarsBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    let THREE, renderer, scene, camera, animId
    let mouse  = { x: 0, y: 0 }
    let target = { x: 0, y: 0 }
    let currentOpacity = 0

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

    // ── Scroll: fade in after hero (100vh), fade out if back at top ──
    const handleScroll = () => {
      const heroHeight = window.innerHeight
      const scrollY    = window.scrollY
      // Fade in between 60vh–100vh scroll
      const fadeStart  = heroHeight * 0.6
      const fadeEnd    = heroHeight * 1.0
      const t = Math.min(Math.max((scrollY - fadeStart) / (fadeEnd - fadeStart), 0), 1)
      currentOpacity = t
      if (canvasRef.current) {
        canvasRef.current.style.opacity = currentOpacity
      }
    }

    async function init() {
      THREE = (await import('three')).default || (await import('three'))
      const canvas = canvasRef.current
      if (!canvas) return

      // ── Renderer ──────────────────────────────────────────────
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setClearColor(0x000000, 0)

      scene  = new THREE.Scene()
      camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
      camera.position.z = 5

      // ── Particles ─────────────────────────────────────────────
      const COUNT      = 320
      const geo        = new THREE.BufferGeometry()
      const positions  = new Float32Array(COUNT * 3)
      const colors     = new Float32Array(COUNT * 3)
      const phases     = new Float32Array(COUNT)
      const speeds     = new Float32Array(COUNT)
      const amplitudes = new Float32Array(COUNT)

      // Star palette — mostly white/silver with hints of warm orange
      const palette = [
        new THREE.Color(0xffffff),  // pure white
        new THREE.Color(0xf5f0e8),  // warm white
        new THREE.Color(0xfcd9b8),  // soft peach
        new THREE.Color(0xf4722b),  // orange accent
        new THREE.Color(0xb8d4f0),  // cool blue-white
        new THREE.Color(0xe8e0ff),  // lavender white
      ]

      // Weights — mostly white, rare orange
      const weights = [0.35, 0.30, 0.15, 0.08, 0.07, 0.05]
      const weightedPick = () => {
        const r = Math.random()
        let acc = 0
        for (let i = 0; i < weights.length; i++) {
          acc += weights[i]
          if (r < acc) return palette[i]
        }
        return palette[0]
      }

      for (let i = 0; i < COUNT; i++) {
        const i3 = i * 3
        positions[i3]     = (Math.random() - 0.5) * 18
        positions[i3 + 1] = (Math.random() - 0.5) * 12
        positions[i3 + 2] = (Math.random() - 0.5) * 8 - 1

        const c = weightedPick()
        colors[i3]     = c.r
        colors[i3 + 1] = c.g
        colors[i3 + 2] = c.b

        phases[i]     = Math.random() * Math.PI * 2
        speeds[i]     = 0.3 + Math.random() * 0.9
        amplitudes[i] = 0.15 + Math.random() * 0.45
      }

      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geo.setAttribute('color',    new THREE.BufferAttribute(colors,    3))

      // ── Soft glow texture ──────────────────────────────────────
      const tc  = document.createElement('canvas')
      tc.width  = 64
      tc.height = 64
      const ctx = tc.getContext('2d')
      const grd = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
      grd.addColorStop(0,    'rgba(255,255,255,1)')
      grd.addColorStop(0.2,  'rgba(255,255,255,0.9)')
      grd.addColorStop(0.5,  'rgba(255,255,255,0.3)')
      grd.addColorStop(0.8,  'rgba(255,255,255,0.05)')
      grd.addColorStop(1,    'rgba(255,255,255,0)')
      ctx.fillStyle = grd
      ctx.fillRect(0, 0, 64, 64)
      const texture = new THREE.CanvasTexture(tc)

      const mat = new THREE.PointsMaterial({
        size: 0.09,
        sizeAttenuation: true,
        vertexColors: true,
        map: texture,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })

      // Mix of sizes — tiny pinpoints + occasional larger bokeh
      const sizesArr = new Float32Array(COUNT)
      for (let i = 0; i < COUNT; i++) {
        const roll = Math.random()
        if (roll < 0.6)       sizesArr[i] = 3  + Math.random() * 8   // tiny stars
        else if (roll < 0.88) sizesArr[i] = 10 + Math.random() * 20  // medium
        else                  sizesArr[i] = 28 + Math.random() * 40   // bokeh
      }
      geo.setAttribute('size', new THREE.BufferAttribute(sizesArr, 1))

      const points = new THREE.Points(geo, mat)
      scene.add(points)

      // Store original positions — float oscillates around these, not cumulatively
      const origPos = new Float32Array(positions)

      // ── Subtle twinkle — vary opacity per frame slightly ───────
      let clock = new THREE.Clock()
      const twinkle = new Float32Array(COUNT)
      for (let i = 0; i < COUNT; i++) twinkle[i] = Math.random() * Math.PI * 2

      function animate() {
        animId = requestAnimationFrame(animate)
        const t = clock.getElapsedTime()

        const pos  = geo.attributes.position.array
        const size = geo.attributes.size.array

        for (let i = 0; i < COUNT; i++) {
          const i3 = i * 3
          // Stronger orbital float — bigger drift radius, faster cycles
          pos[i3 + 1] = origPos[i3 + 1] + Math.sin(t * speeds[i] + phases[i]) * amplitudes[i]
          pos[i3]     = origPos[i3]     + Math.cos(t * speeds[i] * 0.8 + phases[i]) * amplitudes[i] * 0.8
          pos[i3 + 2] = origPos[i3 + 2] + Math.sin(t * speeds[i] * 0.5 + phases[i]) * amplitudes[i] * 0.4

          // Twinkle size oscillation — faster, more dramatic
          const base = sizesArr[i]
          size[i] = base * (0.6 + 0.5 * Math.sin(t * (1.5 + speeds[i]) + twinkle[i]))
        }

        geo.attributes.position.needsUpdate = true
        geo.attributes.size.needsUpdate     = true

        // Slow continuous drift rotation — entire starfield rotates like real sky motion
        points.rotation.z = t * 0.012
        points.rotation.y = Math.sin(t * 0.05) * 0.08

        // Stronger mouse parallax
        target.x += (mouse.x - target.x) * 0.04
        target.y += (mouse.y - target.y) * 0.04
        camera.position.x = target.x * 0.9
        camera.position.y = -target.y * 0.5
        camera.lookAt(scene.position)

        renderer.render(scene, camera)
      }

      animate()

      window.addEventListener('mousemove', handleMouseMove, { passive: true })
      window.addEventListener('resize',    handleResize)
      window.addEventListener('scroll',    handleScroll, { passive: true })

      // Set initial opacity based on current scroll
      handleScroll()
    }

    init()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize',    handleResize)
      window.removeEventListener('scroll',    handleScroll)
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
