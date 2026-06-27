'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Image from 'next/image'
import styles from './AboutParticle.module.css'

gsap.registerPlugin(ScrollTrigger)

const STATS = [
  { value: '3+',  label: 'Years Experience' },
  { value: '20+', label: 'Projects Shipped'  },
  { value: '10+', label: 'Happy Clients'     },
  { value: '∞',   label: 'Lines of Code'     },
]

const TAGS = ['Python', 'PyTorch', 'LangChain', 'Next.js', 'AWS', 'FastAPI']

export default function AboutParticle() {
  const sectionRef  = useRef(null)
  const canvasRef   = useRef(null)
  const aboutRef    = useRef(null)   // the full about content overlay
  const phaseRef    = useRef(0)      // current scroll progress

  useEffect(() => {
    let THREE, renderer, scene, camera, animId
    let geo, mat, points
    let targetPositions, scatterPositions, colors
    let COUNT = 0

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
      camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 100)
      camera.position.z = 5

      // ── Sample avatar pixels ─────────────────────────────────
      const img = new window.Image()
      img.crossOrigin = 'anonymous'
      img.src = '/portfolio-image.png'
      await new Promise(res => { img.onload = res; img.onerror = res })

      const GRID = 140
      const off  = document.createElement('canvas')
      off.width  = GRID
      off.height = GRID
      const ctx  = off.getContext('2d')

      // Crop square from top (face area)
      const s  = Math.min(img.width, img.height)
      const sx = (img.width - s)  / 2
      const sy = (img.height - s) * 0.15  // bias upward toward face
      ctx.drawImage(img, sx, sy, s, s, 0, 0, GRID, GRID)
      const data = ctx.getImageData(0, 0, GRID, GRID).data

      const sampled = []
      for (let row = 0; row < GRID; row++) {
        for (let col = 0; col < GRID; col++) {
          const idx = (row * GRID + col) * 4
          const r = data[idx], g = data[idx+1], b = data[idx+2], a = data[idx+3]
          const brightness = (r + g + b) / 3
          if (a > 120 && brightness > 30) {
            sampled.push({ col, row, r, g, b })
          }
        }
      }

      // Shuffle
      for (let i = sampled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [sampled[i], sampled[j]] = [sampled[j], sampled[i]]
      }

      COUNT = Math.min(sampled.length, 12000)
      const pts = sampled.slice(0, COUNT)

      targetPositions  = new Float32Array(COUNT * 3)
      scatterPositions = new Float32Array(COUNT * 3)
      colors           = new Float32Array(COUNT * 3)

      const SCALE = 3.2  // world-space size of assembled face

      pts.forEach((p, i) => {
        const i3 = i * 3
        const wx =  ((p.col / GRID) - 0.5) * SCALE
        const wy = -((p.row / GRID) - 0.5) * SCALE

        targetPositions[i3]     = wx
        targetPositions[i3 + 1] = wy
        targetPositions[i3 + 2] = 0

        // Scatter: radial explosion with depth variation
        const angle  = Math.random() * Math.PI * 2
        const elev   = (Math.random() - 0.5) * Math.PI
        const radius = 3.5 + Math.random() * 9
        scatterPositions[i3]     = radius * Math.cos(elev) * Math.cos(angle)
        scatterPositions[i3 + 1] = radius * Math.cos(elev) * Math.sin(angle)
        scatterPositions[i3 + 2] = radius * Math.sin(elev) - 2

        // Boost colors slightly for vibrancy
        colors[i3]     = Math.min(p.r / 200, 1)
        colors[i3 + 1] = Math.min(p.g / 200, 1)
        colors[i3 + 2] = Math.min(p.b / 200, 1)
      })

      geo = new THREE.BufferGeometry()
      const posArr = new Float32Array(targetPositions)
      geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3))
      geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3))

      // ── Soft glow sprite texture ─────────────────────────────
      const tc   = document.createElement('canvas')
      tc.width   = tc.height = 64
      const tctx = tc.getContext('2d')
      const grd  = tctx.createRadialGradient(32, 32, 0, 32, 32, 32)
      grd.addColorStop(0,    'rgba(255,255,255,1)')
      grd.addColorStop(0.3,  'rgba(255,255,255,0.85)')
      grd.addColorStop(0.65, 'rgba(255,255,255,0.2)')
      grd.addColorStop(1,    'rgba(255,255,255,0)')
      tctx.fillStyle = grd
      tctx.fillRect(0, 0, 64, 64)
      const tex = new THREE.CanvasTexture(tc)

      mat = new THREE.PointsMaterial({
        size: 0.032,
        sizeAttenuation: true,
        vertexColors: true,
        map: tex,
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })

      points = new THREE.Points(geo, mat)
      scene.add(points)

      // ── Orange accent bokeh (always scattered in bg) ─────────
      const ACC    = 400
      const accGeo = new THREE.BufferGeometry()
      const accPos = new Float32Array(ACC * 3)
      for (let i = 0; i < ACC; i++) {
        accPos[i*3]   = (Math.random() - 0.5) * 16
        accPos[i*3+1] = (Math.random() - 0.5) * 10
        accPos[i*3+2] = (Math.random() - 0.5) * 8 - 3
      }
      accGeo.setAttribute('position', new THREE.BufferAttribute(accPos, 3))
      const accMat = new THREE.PointsMaterial({
        size: 0.055, color: 0xf4722b,
        map: tex, transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false,
      })
      const accPoints = new THREE.Points(accGeo, accMat)
      scene.add(accPoints)

      // ── ScrollTrigger — pin section for 400vh ───────────────
      ScrollTrigger.create({
        trigger: section,
        start:   'top top',
        end:     '+=400%',
        pin:     true,
        scrub:   1.4,
        onUpdate: self => {
          phaseRef.current = self.progress

          // About overlay: fade in at 30%, full at 45%, stay visible
          const aboutEl = aboutRef.current
          if (aboutEl) {
            const op = Math.min(Math.max((self.progress - 0.28) / 0.18, 0), 1)
            aboutEl.style.opacity = op
            aboutEl.style.transform = op < 1
              ? `translateY(${(1 - op) * 30}px)`
              : 'translateY(0)'
          }

          // Orange bokeh: appears during scatter phase
          accMat.opacity = Math.min(Math.max((self.progress - 0.2) / 0.2, 0), 0.45)
            * (1 - Math.max((self.progress - 0.7) / 0.3, 0))
        }
      })

      // ── Render loop ──────────────────────────────────────────
      let clock = new THREE.Clock()

      function animate() {
        animId = requestAnimationFrame(animate)
        const t  = clock.getElapsedTime()
        const sp = phaseRef.current

        // Phase mapping:
        //  0.00–0.30  → assembled (face visible)
        //  0.30–0.55  → exploding outward
        //  0.55–0.72  → fully scattered (about section fully visible)
        //  0.72–1.00  → reassembling
        let lerpT

        if (sp < 0.30) {
          lerpT = 0
        } else if (sp < 0.55) {
          lerpT = (sp - 0.30) / 0.25
        } else if (sp < 0.72) {
          lerpT = 1
        } else {
          lerpT = 1 - (sp - 0.72) / 0.28
        }

        // Smooth ease
        const ease = lerpT < 0.5
          ? 4 * lerpT * lerpT * lerpT
          : 1 - Math.pow(-2 * lerpT + 2, 3) / 2

        const pos = geo.attributes.position.array
        const noise = Math.sin(t * 0.6) * 0.004

        for (let i = 0; i < COUNT; i++) {
          const i3 = i * 3
          pos[i3]     = targetPositions[i3]     + (scatterPositions[i3]     - targetPositions[i3])     * ease + noise
          pos[i3 + 1] = targetPositions[i3 + 1] + (scatterPositions[i3 + 1] - targetPositions[i3 + 1]) * ease + noise
          pos[i3 + 2] = targetPositions[i3 + 2] + (scatterPositions[i3 + 2] - targetPositions[i3 + 2]) * ease
        }
        geo.attributes.position.needsUpdate = true

        // Particle size & opacity: larger/softer when scattered
        mat.size    = 0.032 + ease * 0.055
        mat.opacity = 1 - ease * 0.25

        // Slow drift rotation when scattered
        points.rotation.y = ease * Math.sin(t * 0.12) * 0.35
        points.rotation.x = ease * Math.sin(t * 0.08) * 0.12

        // Camera micro-movement
        camera.position.x = Math.sin(t * 0.18) * 0.06
        camera.position.y = Math.cos(t * 0.13) * 0.04
        camera.lookAt(0, 0, 0)

        renderer.render(scene, camera)
      }

      animate()

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
      ScrollTrigger.getAll().forEach(st => st.kill())
      if (renderer) { renderer.dispose(); renderer.forceContextLoss() }
    }
  }, [])

  return (
    <section id="about" className={styles.section} ref={sectionRef}>

      {/* ── Three.js canvas — particle avatar ── */}
      <canvas ref={canvasRef} className={styles.canvas} />

      {/* ── Gradient overlays ── */}
      <div className={styles.gradTop}    />
      <div className={styles.gradBottom} />
      <div className={styles.vignette}   />

      {/* ── Full About section — fades in when particles scatter ── */}
      <div className={styles.aboutOverlay} ref={aboutRef}>

        {/* Ambient glow */}
        <div className={styles.glow} />

        <div className={styles.inner}>

          {/* ── Avatar image (high quality, centered) ── */}
          <div className={styles.imageWrap}>
            <div className={styles.imageFrame}>
              <Image
                src="/portfolio-image.png"
                alt="Atul — AI/ML Engineer"
                fill
                style={{ objectFit: 'cover', objectPosition: 'center top' }}
                priority
                quality={100}
              />
            </div>
            <div className={styles.imageBorder} />
            <div className={styles.imageGlow}   />
            <div className={styles.accentLine}  />
          </div>

          {/* ── About text ── */}
          <div className={styles.textCol}>
            <span className={styles.eyebrow}>About Me</span>

            <h2 className={styles.heading}>
              Crafting digital<br />
              <em>experiences</em> that last.
            </h2>

            <p className={styles.body}>
              Hey, I'm Atul — an AI/ML Engineer from India with a passion for building
              intelligent AI systems, LLM-powered applications, and scalable ML pipelines.
              I bridge the gap between research and real-world deployment, creating AI
              products that are accurate, efficient, and impactful.
            </p>

            <p className={styles.body}>
              When I'm not coding, you'll find me exploring new tech, reading sci-fi,
              or arranging Funko Pops on my shelf. I believe the best software comes
              from curiosity and craft — not just execution.
            </p>

            <div className={styles.tagRow}>
              {TAGS.map(t => <span key={t} className={styles.tag}>{t}</span>)}
            </div>

            <a
              href="#contact"
              className={styles.btn}
              onClick={e => { e.preventDefault(); document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' }) }}
            >
              Let's work together
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className={styles.statsRow}>
          {STATS.map(s => (
            <div key={s.label} className={styles.stat}>
              <span className={styles.statValue}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>

      </div>

      {/* ── Scroll indicator ── */}
      <div className={styles.scrollHint}>
        <span>scroll</span>
        <div className={styles.scrollLine} />
      </div>

    </section>
  )
}
