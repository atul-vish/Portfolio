'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './ParticleTransition.module.css'

gsap.registerPlugin(ScrollTrigger)

export default function ParticleTransition() {
  const sectionRef = useRef(null)
  const canvasRef  = useRef(null)
  const labelRef   = useRef(null)
  const nameRef    = useRef(null)
  const subRef     = useRef(null)

  useEffect(() => {
    let THREE, renderer, scene, camera
    let particles, positions, colors, targetPositions, scatterPositions
    let animId, scrollProgress = 0

    async function init() {
      THREE = (await import('three')).default || await import('three')

      const canvas  = canvasRef.current
      const section = sectionRef.current
      if (!canvas || !section) return

      const W = window.innerWidth
      const H = window.innerHeight

      // ── Renderer ────────────────────────────────────────────
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(W, H)
      renderer.setClearColor(0x000000, 0)

      scene  = new THREE.Scene()
      camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000)
      camera.position.z = 4.5

      // ── Sample pixels from avatar image ───────────────────
      const img    = new window.Image()
      img.crossOrigin = 'anonymous'
      img.src      = '/portfolio-image.png'

      await new Promise(res => { img.onload = res; img.onerror = res })

      const GRID       = 120          // sample grid resolution
      const offscreen  = document.createElement('canvas')
      offscreen.width  = GRID
      offscreen.height = GRID
      const ctx = offscreen.getContext('2d')
      // Draw image centered & cropped square
      const aspect = img.width / img.height
      let sx = 0, sy = 0, sw = img.width, sh = img.height
      if (aspect > 1) { sx = (img.width - img.height) / 2; sw = img.height }
      else            { sy = (img.height - img.width) / 4; sh = img.width  } // bias to face

      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, GRID, GRID)
      const data = ctx.getImageData(0, 0, GRID, GRID).data

      // Filter dark pixels — only keep visible face/scene pixels
      const sampled = []
      for (let row = 0; row < GRID; row++) {
        for (let col = 0; col < GRID; col++) {
          const idx = (row * GRID + col) * 4
          const r = data[idx], g = data[idx+1], b = data[idx+2], a = data[idx+3]
          const brightness = (r + g + b) / 3
          if (a > 100 && brightness > 28) {
            sampled.push({ col, row, r, g, b })
          }
        }
      }

      const COUNT = Math.min(sampled.length, 9000)
      // Shuffle and pick COUNT
      for (let i = sampled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [sampled[i], sampled[j]] = [sampled[j], sampled[i]]
      }
      const pts = sampled.slice(0, COUNT)

      // ── Geometry ────────────────────────────────────────────
      positions       = new Float32Array(COUNT * 3)
      targetPositions = new Float32Array(COUNT * 3)  // face formation
      scatterPositions= new Float32Array(COUNT * 3)  // exploded state
      colors          = new Float32Array(COUNT * 3)

      const SCALE = 2.8   // world-space scale of the face

      pts.forEach((p, i) => {
        const i3 = i * 3
        // Map grid col/row to world space (-SCALE/2 … SCALE/2)
        const wx = ((p.col / GRID) - 0.5) * SCALE
        const wy = ((0.5 - p.row / GRID)) * SCALE   // flip Y

        // Target = face position
        targetPositions[i3]     = wx
        targetPositions[i3 + 1] = wy
        targetPositions[i3 + 2] = 0

        // Scatter = random explosion sphere
        const theta  = Math.random() * Math.PI * 2
        const phi    = Math.acos(2 * Math.random() - 1)
        const radius = 3 + Math.random() * 7
        scatterPositions[i3]     = radius * Math.sin(phi) * Math.cos(theta)
        scatterPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
        scatterPositions[i3 + 2] = radius * Math.cos(phi) - 2

        // Start at face
        positions[i3]     = targetPositions[i3]
        positions[i3 + 1] = targetPositions[i3 + 1]
        positions[i3 + 2] = targetPositions[i3 + 2]

        // Color from image, slightly boosted
        colors[i3]     = Math.min(p.r / 220, 1)
        colors[i3 + 1] = Math.min(p.g / 220, 1)
        colors[i3 + 2] = Math.min(p.b / 220, 1)
      })

      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3))

      // ── Soft circle sprite ───────────────────────────────
      const tc  = document.createElement('canvas')
      tc.width  = tc.height = 32
      const tctx = tc.getContext('2d')
      const grd  = tctx.createRadialGradient(16, 16, 0, 16, 16, 16)
      grd.addColorStop(0,   'rgba(255,255,255,1)')
      grd.addColorStop(0.4, 'rgba(255,255,255,0.8)')
      grd.addColorStop(1,   'rgba(255,255,255,0)')
      tctx.fillStyle = grd
      tctx.fillRect(0, 0, 32, 32)
      const tex = new THREE.CanvasTexture(tc)

      const mat = new THREE.PointsMaterial({
        size: 0.028,
        sizeAttenuation: true,
        vertexColors: true,
        map: tex,
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })

      particles = new THREE.Points(geo, mat)
      scene.add(particles)

      // ── Orange accent particles (always scattered) ────────
      const ACC = 300
      const accGeo = new THREE.BufferGeometry()
      const accPos = new Float32Array(ACC * 3)
      for (let i = 0; i < ACC; i++) {
        accPos[i*3]     = (Math.random() - 0.5) * 8
        accPos[i*3+1]   = (Math.random() - 0.5) * 6
        accPos[i*3+2]   = (Math.random() - 0.5) * 4 - 1
      }
      accGeo.setAttribute('position', new THREE.BufferAttribute(accPos, 3))
      const accMat = new THREE.PointsMaterial({
        size: 0.04, color: 0xf4722b,
        map: tex, transparent: true, opacity: 0.6,
        blending: THREE.AdditiveBlending, depthWrite: false,
      })
      scene.add(new THREE.Points(accGeo, accMat))

      // ── ScrollTrigger — pin section for 300vh ─────────────
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: '+=300%',
        pin: true,
        scrub: 1.2,
        onUpdate: self => { scrollProgress = self.progress },
      })

      // ── Render loop ───────────────────────────────────────
      let clock = new THREE.Clock()
      function animate() {
        animId = requestAnimationFrame(animate)
        const t = clock.getElapsedTime()

        // Scroll phases:
        //  0.00–0.35 : face assembled → explode out
        //  0.35–0.65 : fully scattered
        //  0.65–1.00 : reassemble face
        const sp = scrollProgress
        let lerpT  // 0 = face, 1 = scatter

        if (sp < 0.35) {
          lerpT = sp / 0.35
        } else if (sp < 0.65) {
          lerpT = 1
        } else {
          lerpT = 1 - (sp - 0.65) / 0.35
        }

        // Ease in/out
        const ease = lerpT < 0.5
          ? 2 * lerpT * lerpT
          : -1 + (4 - 2 * lerpT) * lerpT

        const pos = geo.attributes.position.array
        for (let i = 0; i < COUNT; i++) {
          const i3 = i * 3
          const noise = Math.sin(t * 0.8 + i * 0.05) * 0.008 * ease
          pos[i3]     = targetPositions[i3]     + (scatterPositions[i3]     - targetPositions[i3])     * ease + noise
          pos[i3 + 1] = targetPositions[i3+1]   + (scatterPositions[i3+1]   - targetPositions[i3+1])   * ease + noise
          pos[i3 + 2] = targetPositions[i3+2]   + (scatterPositions[i3+2]   - targetPositions[i3+2])   * ease
        }
        geo.attributes.position.needsUpdate = true

        // Slow auto-rotate when scattered
        particles.rotation.y = ease * Math.sin(t * 0.15) * 0.4

        // Opacity: full when face visible, dim mid-scatter
        mat.opacity = 0.35 + (1 - ease) * 0.65

        // Particle size: larger when scattered (bokeh)
        mat.size = 0.028 + ease * 0.06

        renderer.render(scene, camera)
      }
      animate()

      // ── Text reveal tied to scroll ────────────────────────
      // label fades in at start, name at 30%, sub at 50%, all fade at 80%
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: '+=300%',
        scrub: true,
        onUpdate: self => {
          const p = self.progress
          if (labelRef.current) labelRef.current.style.opacity = Math.min(p / 0.15, 1) * (1 - Math.max(0, (p - 0.8) / 0.2))
          if (nameRef.current)  nameRef.current.style.opacity  = Math.min(Math.max(0, (p - 0.1) / 0.2), 1) * (1 - Math.max(0, (p - 0.8) / 0.2))
          if (subRef.current)   subRef.current.style.opacity   = Math.min(Math.max(0, (p - 0.3) / 0.2), 1) * (1 - Math.max(0, (p - 0.8) / 0.2))
        }
      })

      // ── Resize ───────────────────────────────────────────
      const onResize = () => {
        renderer.setSize(window.innerWidth, window.innerHeight)
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
      }
      window.addEventListener('resize', onResize)
    }

    init()

    return () => {
      cancelAnimationFrame(animId)
      ScrollTrigger.getAll().forEach(t => t.kill())
      if (renderer) { renderer.dispose(); renderer.forceContextLoss() }
    }
  }, [])

  return (
    <section className={styles.section} ref={sectionRef}>
      {/* Three.js canvas */}
      <canvas ref={canvasRef} className={styles.canvas} />

      {/* Gradient overlays */}
      <div className={styles.gradTop}    />
      <div className={styles.gradBottom} />

      {/* Cinematic text */}
      <div className={styles.textWrap}>
        <span className={styles.label} ref={labelRef}>Driven by AI. Built for impact.</span>
        <h2  className={styles.name}  ref={nameRef}>Atul<span>.</span></h2>
        <p   className={styles.sub}   ref={subRef}>
          AI/ML Engineer &nbsp;·&nbsp; LLM &nbsp;·&nbsp; Gen AI
        </p>
      </div>

      {/* Scroll hint */}
      <div className={styles.scrollHint}>
        <span>scroll to continue</span>
        <div className={styles.scrollBar} />
      </div>
    </section>
  )
}
