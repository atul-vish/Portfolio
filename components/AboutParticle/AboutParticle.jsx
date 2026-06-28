'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
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
  const avatarImgRef= useRef(null)   // real <img> that fades as particles leave
  const aboutRef    = useRef(null)
  const progressRef = useRef(0)
  const [flipped, setFlipped] = useState(false)
  const [flipping, setFlipping] = useState(false)
  const [particles, setParticles] = useState(false)

  const handleFlip = useCallback(() => {
    if (flipping) return
    setFlipping(true)
    setParticles(true)
    setTimeout(() => {
      setFlipped(f => !f)
      setTimeout(() => {
        setFlipping(false)
        setTimeout(() => setParticles(false), 600)
      }, 150)
    }, 350)
  }, [flipping])

  useEffect(() => {
    let THREE, renderer, scene, camera, animId
    let geo, mat, points
    let targetPos, scatterPos, particleDelays, particleSizes
    let COUNT = 0

    // ── Easing ──────────────────────────────────────────────────
    const easeOutCubic  = t => 1 - Math.pow(1 - t, 3)
    const easeInOutQuart= t => t < 0.5 ? 8*t*t*t*t : 1 - Math.pow(-2*t+2,4)/2
    const easeInCubic   = t => t * t * t

    async function init() {
      THREE = (await import('three')).default || await import('three')
      const canvas  = canvasRef.current
      const section = sectionRef.current
      if (!canvas || !section) return

      const W = window.innerWidth
      const H = window.innerHeight
      const isMobile = W < 768

      // ── Renderer ─────────────────────────────────────────────
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !isMobile })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2))
      renderer.setSize(W, H)
      renderer.setClearColor(0x000000, 0)

      scene  = new THREE.Scene()
      camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 100)
      camera.position.z = isMobile ? 6 : 5

      // ── Sample avatar at high resolution ──────────────────────
      const img = new window.Image()
      img.crossOrigin = 'anonymous'
      img.src = '/portfolio-image.png'
      await new Promise(res => { img.onload = res; img.onerror = res })

      const GRID = isMobile ? 100 : 130
      const off  = document.createElement('canvas')
      off.width  = GRID
      off.height = GRID
      const ctx  = off.getContext('2d', { willReadFrequently: true })

      // Crop: square from top-center (face focus)
      const s  = Math.min(img.width, img.height)
      const sx = (img.width  - s) / 2
      const sy = (img.height - s) * 0.12
      ctx.drawImage(img, sx, sy, s, s, 0, 0, GRID, GRID)
      const data = ctx.getImageData(0, 0, GRID, GRID).data

      // Collect visible pixels with brightness & color
      const sampled = []
      for (let row = 0; row < GRID; row++) {
        for (let col = 0; col < GRID; col++) {
          const idx = (row * GRID + col) * 4
          const r = data[idx], g = data[idx+1], b = data[idx+2], a = data[idx+3]
          const brightness = (r * 0.299 + g * 0.587 + b * 0.114)
          if (a > 110 && brightness > 25) {
            sampled.push({ col, row, r, g, b, brightness })
          }
        }
      }

      // Shuffle
      for (let i = sampled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i+1));
        [sampled[i], sampled[j]] = [sampled[j], sampled[i]]
      }

      COUNT = Math.min(sampled.length, isMobile ? 7000 : 14000)
      const pts = sampled.slice(0, COUNT)

      targetPos      = new Float32Array(COUNT * 3)
      scatterPos     = new Float32Array(COUNT * 3)
      particleDelays = new Float32Array(COUNT)
      particleSizes  = new Float32Array(COUNT)
      const colorsArr= new Float32Array(COUNT * 3)

      const SCALE = isMobile ? 2.2 : 3.0

      pts.forEach((p, i) => {
        const i3 = i * 3
        const wx =  ((p.col / GRID) - 0.5) * SCALE
        const wy = -((p.row / GRID) - 0.5) * SCALE

        // Target = face position
        targetPos[i3]     = wx
        targetPos[i3 + 1] = wy
        targetPos[i3 + 2] = 0

        // Scatter: radial burst from center with momentum overshoot
        const distFromCenter = Math.sqrt(wx*wx + wy*wy)
        const normDir = distFromCenter > 0 ? 1 / distFromCenter : 1

        // Explosion direction = away from center + random deviation
        const explodeX = wx * normDir + (Math.random() - 0.5) * 0.8
        const explodeY = wy * normDir + (Math.random() - 0.5) * 0.8
        const explodeZ = (Math.random() - 0.5) * 2

        const radius = 3 + Math.random() * 7
        scatterPos[i3]     = explodeX * radius
        scatterPos[i3 + 1] = explodeY * radius
        scatterPos[i3 + 2] = explodeZ * radius - 1

        // Delay: particles near center scatter LAST (explosion from outside-in)
        const maxDist = SCALE * 0.75
        particleDelays[i] = 1 - Math.min(distFromCenter / maxDist, 1)

        // Particle size: brighter pixels → bigger particle
        particleSizes[i] = 0.022 + (p.brightness / 255) * 0.025 + Math.random() * 0.01

        // Colors: slightly boosted saturation
        colorsArr[i3]     = Math.min(p.r / 195, 1)
        colorsArr[i3 + 1] = Math.min(p.g / 195, 1)
        colorsArr[i3 + 2] = Math.min(p.b / 195, 1)
      })

      geo = new THREE.BufferGeometry()
      const posArr = new Float32Array(targetPos)
      geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3))
      geo.setAttribute('color',    new THREE.BufferAttribute(colorsArr, 3))

      // ── Glow sprite ───────────────────────────────────────────
      const tc   = document.createElement('canvas')
      tc.width   = tc.height = 64
      const tctx = tc.getContext('2d')
      const grd  = tctx.createRadialGradient(32, 32, 0, 32, 32, 32)
      grd.addColorStop(0,    'rgba(255,255,255,1)')
      grd.addColorStop(0.25, 'rgba(255,255,255,0.9)')
      grd.addColorStop(0.6,  'rgba(255,255,255,0.25)')
      grd.addColorStop(1,    'rgba(255,255,255,0)')
      tctx.fillStyle = grd
      tctx.fillRect(0, 0, 64, 64)
      const tex = new THREE.CanvasTexture(tc)

      mat = new THREE.PointsMaterial({
        size: 0.035,
        sizeAttenuation: true,
        vertexColors: true,
        map: tex,
        transparent: true,
        opacity: 0,           // starts invisible — image shows beneath
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })

      points = new THREE.Points(geo, mat)
      scene.add(points)

      // ── Orange ambient bokeh ──────────────────────────────────
      const BOKEHN = isMobile ? 150 : 300
      const bokehGeo = new THREE.BufferGeometry()
      const bokehPos = new Float32Array(BOKEHN * 3)
      for (let i = 0; i < BOKEHN; i++) {
        bokehPos[i*3]   = (Math.random()-0.5)*18
        bokehPos[i*3+1] = (Math.random()-0.5)*12
        bokehPos[i*3+2] = (Math.random()-0.5)*8 - 4
      }
      bokehGeo.setAttribute('position', new THREE.BufferAttribute(bokehPos, 3))
      const bokehMat = new THREE.PointsMaterial({
        size: 0.07, color: 0xf4722b,
        map: tex, transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false,
      })
      scene.add(new THREE.Points(bokehGeo, bokehMat))

      // ── ScrollTrigger — pin for 400vh ─────────────────────────
      ScrollTrigger.create({
        trigger: section,
        start:   'top top',
        end:     '+=250%',
        pin:     true,
        scrub:   2,            // higher = smoother lag
        anticipatePin: 1,
        onUpdate: self => {
          const sp = self.progress
          progressRef.current = sp

          // ── Real image: visible at start, fades as scatter begins ──
          const imgEl = avatarImgRef.current
          if (imgEl) {
            // Stays fully visible 0→0.15, fades out 0.15→0.40
            const imgOp = 1 - Math.max(0, Math.min((sp - 0.15) / 0.25, 1))
            imgEl.style.opacity = imgOp
          }

          // ── About overlay ──────────────────────────────────────
          const aboutEl = aboutRef.current
          if (aboutEl) {
            // Fades in 0.38→0.55, stays visible permanently — no reassembly
            const fadeIn  = Math.max(0, Math.min((sp - 0.38) / 0.17, 1))
            const op = easeOutCubic(fadeIn)
            aboutEl.style.opacity = op
            aboutEl.style.transform = fadeIn < 1
              ? `translateY(${(1-easeOutCubic(fadeIn))*24}px)`
              : 'translateY(0px)'
          }

          // Orange bokeh during scatter phase
          bokehMat.opacity = Math.min(
            Math.max((sp - 0.22) / 0.18, 0), 0.5
          )
        }
      })

      // ── Render loop ───────────────────────────────────────────
      let clock = new THREE.Clock()

      // Pre-compute scatter ease per particle for perf
      const prevEase = new Float32Array(COUNT)

      function animate() {
        animId = requestAnimationFrame(animate)
        const t  = clock.getElapsedTime()
        const sp = progressRef.current

        // ── Global scatter progress ────────────────────────────
        // Phase: 0→0.18 assembled, 0.18→0.55 scattering, 0.55→1.0 STAY scattered (no reassembly)
        let globalT

        if (sp < 0.18) {
          globalT = 0
        } else if (sp < 0.55) {
          globalT = (sp - 0.18) / 0.37
        } else {
          globalT = 1   // fully scattered — stays here until section unpins
        }

        // Particles opacity: fade in as scatter begins, stay visible through reassemble
        mat.opacity = Math.min(sp / 0.12, 1)

        // ── Per-particle staggered scatter ─────────────────────
        const pos = geo.attributes.position.array

        for (let i = 0; i < COUNT; i++) {
          const i3 = i * 3

          // Each particle has its own delay (0→0.45 range)
          // Outer particles scatter first → wave from edge to center
          const delay     = particleDelays[i] * 0.45
          const localT    = Math.max(0, Math.min((globalT - delay) / (1 - delay * 0.5), 1))
          const ease      = easeOutCubic(localT)

          // Smooth noise drift when fully assembled or fully scattered
          const drift = Math.sin(t * 0.8 + i * 0.031) * 0.003 * (1 - Math.abs(ease - 0.5) * 2)

          pos[i3]     = targetPos[i3]     + (scatterPos[i3]     - targetPos[i3])     * ease + drift
          pos[i3 + 1] = targetPos[i3 + 1] + (scatterPos[i3 + 1] - targetPos[i3 + 1]) * ease + drift
          pos[i3 + 2] = targetPos[i3 + 2] + (scatterPos[i3 + 2] - targetPos[i3 + 2]) * ease

          prevEase[i] = ease
        }

        geo.attributes.position.needsUpdate = true

        // Particle size: swell when mid-scatter (bokeh effect)
        const sizeMult = 1 + globalT * (1 - globalT) * 4 * 1.8
        mat.size = 0.035 * sizeMult

        // Slow spin during scatter phase
        points.rotation.y = globalT * Math.sin(t * 0.1) * 0.28
        points.rotation.x = globalT * Math.sin(t * 0.07) * 0.1

        // Camera: zoom out slightly as particles scatter
        camera.position.z = (isMobile ? 6 : 5) + globalT * 0.5
        camera.position.x = Math.sin(t * 0.15) * 0.05
        camera.position.y = Math.cos(t * 0.1)  * 0.03
        camera.lookAt(0, 0, 0)

        renderer.render(scene, camera)
      }

      animate()

      const onResize = () => {
        const nW = window.innerWidth
        const nH = window.innerHeight
        renderer.setSize(nW, nH)
        camera.aspect = nW / nH
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

      {/* ── Real image — shows at start, fades as particles leave ── */}
      <div className={styles.avatarCenter}>
        <div className={styles.avatarFrame} ref={avatarImgRef}>
          <Image
            src="/portfolio-image.png"
            alt="Atul"
            fill
            style={{ objectFit: 'cover', objectPosition: 'center 10%' }}
            quality={100}
            priority
          />
          {/* Orange glow ring */}
          <div className={styles.avatarRing} />
          <div className={styles.avatarGlow} />
        </div>
      </div>

      {/* ── Three.js particle canvas ── */}
      <canvas ref={canvasRef} className={styles.canvas} />

      {/* ── Gradient overlays ── */}
      <div className={styles.gradTop}    />
      <div className={styles.gradBottom} />
      <div className={styles.vignette}   />

      {/* ══════════════════════════════════════════════════════
          ABOUT OVERLAY — revealed when particles scatter
      ══════════════════════════════════════════════════════ */}
      <div className={styles.aboutOverlay} ref={aboutRef}>
        <div className={styles.glow} />

        <div className={styles.inner}>

          {/* Left: flip card */}
          <div className={styles.imageWrap}>
            <div className={`${styles.flipCard} ${flipped ? styles.flipCardFlipped : ''}`}>

              {/* ── FRONT: Avatar ── */}
              <div className={styles.flipFront}>
                <div className={styles.imageFrame}>
                  <Image
                    src="/portfolio-image.png"
                    alt="Atul — AI/ML Engineer"
                    fill
                    style={{ objectFit: 'cover', objectPosition: 'center 8%' }}
                    quality={100}
                    priority
                  />
                </div>
                {/* Scan line effect during flip */}
                {flipping && <div className={styles.scanLine} />}
              </div>

              {/* ── BACK: Real photo ── */}
              <div className={styles.flipBack}>
                <div className={styles.imageFrame}>
                  <Image
                    src="/atul-real.jpg"
                    alt="Atul — Real Photo"
                    fill
                    style={{ objectFit: 'cover', objectPosition: 'center 15%' }}
                    quality={100}
                  />
                  {/* Warm overlay on real photo */}
                  <div className={styles.realOverlay} />
                </div>
                {flipping && <div className={styles.scanLine} />}
              </div>

              {/* ── Particle burst during flip ── */}
              {particles && (
                <div className={styles.burstWrap} aria-hidden="true">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div key={i} className={styles.burstDot}
                      style={{
                        '--angle': `${i * 22.5}deg`,
                        '--delay': `${i * 0.025}s`,
                        '--size': `${4 + (i % 3) * 3}px`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Flip button */}
            <button
              className={`${styles.flipBtn} ${flipped ? styles.flipBtnActive : ''}`}
              onClick={handleFlip}
              aria-label={flipped ? 'Show avatar' : 'Show real photo'}
            >
              <svg className={styles.flipIcon} width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M1 4C1 4 3 1 8 1s7 3 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M15 12c0 0-2 3-7 3s-7-3-7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M12 1l3 3-3 3M4 9l-3 3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>{flipped ? 'Avatar' : 'Real Me'}</span>
            </button>

            <div className={styles.imageBorder} />
            <div className={styles.imageGlow}   />
            <div className={styles.accentLine}  />
          </div>

          {/* Right: text */}
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

        {/* Stats */}
        <div className={styles.statsRow}>
          {STATS.map(s => (
            <div key={s.label} className={styles.stat}>
              <span className={styles.statValue}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll hint */}
      <div className={styles.scrollHint}>
        <span>scroll</span>
        <div className={styles.scrollLine} />
      </div>

    </section>
  )
}
