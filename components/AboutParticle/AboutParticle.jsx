'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import styles from './AboutParticle.module.css'

const STATS = [
  { value: '3+',  label: 'Years Experience' },
  { value: '20+', label: 'Projects Shipped'  },
  { value: '10+', label: 'Happy Clients'     },
  { value: '∞',   label: 'Lines of Code'     },
]
const TAGS = ['Python', 'PyTorch', 'LangChain', 'Next.js', 'AWS', 'FastAPI']

export default function AboutParticle() {
  const sectionRef   = useRef(null)
  const canvasRef    = useRef(null)
  const avatarImgRef = useRef(null)
  const aboutRef     = useRef(null)
  const progressRef  = useRef(0)

  const [flipped,  setFlipped]  = useState(false)
  const [flipping, setFlipping] = useState(false)
  const [burst,    setBurst]    = useState(false)

  const handleFlip = useCallback(() => {
    if (flipping) return
    setFlipping(true)
    setBurst(true)
    setTimeout(() => {
      setFlipped(f => !f)
      setTimeout(() => {
        setFlipping(false)
        setTimeout(() => setBurst(false), 600)
      }, 150)
    }, 350)
  }, [flipping])

  useEffect(() => {
    let THREE, renderer, scene, camera, animId
    let geo, mat, points
    let targetPos, scatterPos, delayPerParticle
    let COUNT = 0
    // Store our own trigger refs so we never kill other components' triggers
    const myTriggers = []

    const easeOut = t => 1 - Math.pow(1 - t, 3)
    const easeInOut = t => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2

    async function init() {
      try {
        const mod = await import('three')
        THREE = mod.default || mod
      } catch(e) { console.error('Three.js load failed', e); return }

      const canvas  = canvasRef.current
      const section = sectionRef.current
      if (!canvas || !section) return

      const W = window.innerWidth
      const H = window.innerHeight
      const isMobile = W < 768

      // ── Renderer ────────────────────────────────────────────
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
      renderer.setSize(W, H)
      renderer.setClearColor(0x000000, 0)

      scene  = new THREE.Scene()
      camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 100)
      camera.position.z = isMobile ? 6 : 5

      // ── Load & sample image ──────────────────────────────────
      const img = new window.Image()
      img.crossOrigin = 'anonymous'
      img.src = '/portfolio-image.png'
      await new Promise(res => { img.onload = res; img.onerror = res })

      const GRID = isMobile ? 90 : 120
      const off  = document.createElement('canvas')
      off.width  = off.height = GRID
      const ctx  = off.getContext('2d', { willReadFrequently: true })
      const s    = Math.min(img.width, img.height)
      ctx.drawImage(img, (img.width-s)/2, (img.height-s)*0.1, s, s, 0, 0, GRID, GRID)
      const data = ctx.getImageData(0, 0, GRID, GRID).data

      const sampled = []
      for (let row = 0; row < GRID; row++) {
        for (let col = 0; col < GRID; col++) {
          const i4 = (row * GRID + col) * 4
          const r = data[i4], g = data[i4+1], b = data[i4+2], a = data[i4+3]
          if (a > 100 && (r+g+b)/3 > 22) sampled.push({ col, row, r, g, b })
        }
      }
      for (let i = sampled.length-1; i > 0; i--) {
        const j = Math.floor(Math.random()*(i+1));
        [sampled[i], sampled[j]] = [sampled[j], sampled[i]]
      }

      COUNT = Math.min(sampled.length, isMobile ? 6000 : 12000)
      const pts = sampled.slice(0, COUNT)
      const SCALE = isMobile ? 2.0 : 2.8

      targetPos        = new Float32Array(COUNT * 3)
      scatterPos       = new Float32Array(COUNT * 3)
      delayPerParticle = new Float32Array(COUNT)
      const colArr     = new Float32Array(COUNT * 3)

      pts.forEach((p, i) => {
        const i3 = i * 3
        const wx =  ((p.col / GRID) - 0.5) * SCALE
        const wy = -((p.row / GRID) - 0.5) * SCALE
        targetPos[i3]   = wx
        targetPos[i3+1] = wy
        targetPos[i3+2] = 0

        const dist = Math.sqrt(wx*wx + wy*wy)
        const nx   = dist > 0 ? wx/dist : Math.random()-0.5
        const ny   = dist > 0 ? wy/dist : Math.random()-0.5
        const rad  = 3.5 + Math.random()*7
        scatterPos[i3]   = nx*rad + (Math.random()-0.5)*1.5
        scatterPos[i3+1] = ny*rad + (Math.random()-0.5)*1.5
        scatterPos[i3+2] = (Math.random()-0.5)*4 - 1

        delayPerParticle[i] = (Math.sqrt(wx*wx+wy*wy) / (SCALE*0.7)) * 0.5

        // Boost saturation: push colors away from grey toward their dominant hue
        const avg = (p.r + p.g + p.b) / 3
        const boost = 1.6
        colArr[i3]   = Math.min(Math.max(avg + (p.r - avg) * boost, 0) / 255, 1)
        colArr[i3+1] = Math.min(Math.max(avg + (p.g - avg) * boost, 0) / 255, 1)
        colArr[i3+2] = Math.min(Math.max(avg + (p.b - avg) * boost, 0) / 255, 1)
      })

      geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(targetPos), 3))
      geo.setAttribute('color',    new THREE.BufferAttribute(colArr, 3))

      // Glow sprite
      const tc = document.createElement('canvas')
      tc.width = tc.height = 64
      const tctx = tc.getContext('2d')
      const grd = tctx.createRadialGradient(32,32,0,32,32,32)
      grd.addColorStop(0,   'rgba(255,255,255,1)')
      grd.addColorStop(0.3, 'rgba(255,255,255,0.8)')
      grd.addColorStop(0.7, 'rgba(255,255,255,0.15)')
      grd.addColorStop(1,   'rgba(255,255,255,0)')
      tctx.fillStyle = grd
      tctx.fillRect(0,0,64,64)
      const tex = new THREE.CanvasTexture(tc)

      mat = new THREE.PointsMaterial({
        size: 0.03, sizeAttenuation: true, vertexColors: true,
        map: tex, transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false,
      })
      points = new THREE.Points(geo, mat)
      scene.add(points)

      // ── Shockwave ring — expands from center at scatter start ──
      const ringGeo = new THREE.RingGeometry(0.01, 0.04, 64)
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xf4722b, side: THREE.DoubleSide,
        transparent: true, opacity: 0
      })
      const ring1 = new THREE.Mesh(ringGeo, ringMat)
      const ring2 = new THREE.Mesh(ringGeo, ringMat.clone())
      const ring3 = new THREE.Mesh(ringGeo, ringMat.clone())
      scene.add(ring1, ring2, ring3)

      // Orange bokeh
      const BN = isMobile ? 200 : 420
      const bGeo = new THREE.BufferGeometry()
      const bPos = new Float32Array(BN*3)
      for (let i=0;i<BN;i++) {
        bPos[i*3]=(Math.random()-.5)*16; bPos[i*3+1]=(Math.random()-.5)*10; bPos[i*3+2]=(Math.random()-.5)*6-3
      }
      bGeo.setAttribute('position', new THREE.BufferAttribute(bPos,3))
      const bMat = new THREE.PointsMaterial({
        size:0.12, color:0xf4722b, map:tex,
        transparent:true, opacity:0,
        blending:THREE.AdditiveBlending, depthWrite:false,
      })
      scene.add(new THREE.Points(bGeo, bMat))

      // Second bokeh layer — white/blue electric sparks
      const bGeo2 = new THREE.BufferGeometry()
      const bPos2 = new Float32Array(BN*3)
      for (let i=0;i<BN;i++) {
        bPos2[i*3]=(Math.random()-.5)*14; bPos2[i*3+1]=(Math.random()-.5)*9; bPos2[i*3+2]=(Math.random()-.5)*5-2
      }
      bGeo2.setAttribute('position', new THREE.BufferAttribute(bPos2,3))
      const bMat2 = new THREE.PointsMaterial({
        size:0.05, color:0xb8d8ff, map:tex,
        transparent:true, opacity:0,
        blending:THREE.AdditiveBlending, depthWrite:false,
      })
      scene.add(new THREE.Points(bGeo2, bMat2))

      // ── ScrollTrigger setup (import lazily to avoid SSR issues) ─
      const { gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)

      // Pin trigger
      const pinTrigger = ScrollTrigger.create({
        trigger: section,
        start:   'top top',
        end:     '+=250%',
        pin:     true,
        scrub:   1.8,
        onUpdate(self) {
          const sp = self.progress
          progressRef.current = sp

          // Real avatar image fades out 0.12→0.38
          const imgEl = avatarImgRef.current
          if (imgEl) imgEl.style.opacity = Math.max(0, 1 - Math.min((sp-0.12)/0.26, 1))

          // About section fades in 0.35→0.55, stays visible
          const aboutEl = aboutRef.current
          if (aboutEl) {
            const op = easeOut(Math.max(0, Math.min((sp-0.35)/0.2, 1)))
            aboutEl.style.opacity  = op
            aboutEl.style.transform = `translateY(${(1-op)*22}px)`
          }

          // Bokeh during scatter
          const bokehP = Math.min(Math.max((sp-0.2)/0.2,0), 1)
          bMat.opacity  = bokehP * 0.55
          bMat2.opacity = bokehP * 0.35
        }
      })
      myTriggers.push(pinTrigger)

      // ── Render loop ──────────────────────────────────────────
      let clock = new THREE.Clock()

      function animate() {
        animId = requestAnimationFrame(animate)
        const t  = clock.getElapsedTime()
        const sp = progressRef.current

        // Scatter progress:
        // 0→0.15  : assembled, particles fade in
        // 0.15→0.55: scatter
        // 0.55→1.0 : stay scattered
        let globalT
        if      (sp < 0.15) globalT = 0
        else if (sp < 0.55) globalT = (sp-0.15)/0.40
        else                globalT = 1

        // Particle opacity: fade in quickly as scatter starts
        mat.opacity = Math.min(sp/0.10, 1)

        const pos = geo.attributes.position.array

        for (let i = 0; i < COUNT; i++) {
          const i3  = i * 3
          const del = delayPerParticle[i] * 0.5
          const loc = Math.max(0, Math.min((globalT - del)/(1 - del*0.6), 1))
          const e   = easeOut(loc)

          // Chromatic vibration — particles shimmer during scatter
        const shimmer = Math.sin(t*3.5 + i*0.18) * e * (1-e) * 4 * 0.06
        const drift = Math.sin(t*0.7 + i*0.028) * 0.003 * (1-e*0.7)

          pos[i3]   = targetPos[i3]   + (scatterPos[i3]   - targetPos[i3])*e + drift
          pos[i3+1] = targetPos[i3+1] + (scatterPos[i3+1] - targetPos[i3+1])*e + drift
          pos[i3+2] = targetPos[i3+2] + (scatterPos[i3+2] - targetPos[i3+2])*e
        }
        geo.attributes.position.needsUpdate = true

        // Dramatic swell at scatter peak — 4× bigger
        const swell = globalT*(1-globalT)*4
        mat.size = 0.030 + swell * 0.14

        // Gentle rotation while scattered
        points.rotation.y = globalT * Math.sin(t*0.12) * 0.35
        points.rotation.x = globalT * Math.sin(t*0.08) * 0.12

        // ── Shockwave rings — pulse outward repeatedly during scatter ──
        const pulseSpeed = 1.4
        const animateRing = (mesh, offset) => {
          const phase = ((t * pulseSpeed + offset) % 1)
          const active = globalT > 0.05
          const s = active ? 0.5 + phase * 6 : 0.01
          mesh.scale.setScalar(s)
          mesh.material.opacity = active ? (1-phase) * globalT * 0.7 : 0
        }
        animateRing(ring1, 0)
        animateRing(ring2, 0.33)
        animateRing(ring3, 0.66)

        // Camera slight drift
        camera.position.x = Math.sin(t*0.14)*0.04
        camera.position.y = Math.cos(t*0.10)*0.03
        camera.lookAt(0, 0, 0)

        renderer.render(scene, camera)
      }

      animate()

      const onResize = () => {
        renderer.setSize(window.innerWidth, window.innerHeight)
        camera.aspect = window.innerWidth/window.innerHeight
        camera.updateProjectionMatrix()
      }
      window.addEventListener('resize', onResize)
    }

    init()

    return () => {
      cancelAnimationFrame(animId)
      // Kill ONLY our own triggers — never getAll()
      myTriggers.forEach(t => t.kill())
      if (renderer) { renderer.dispose(); renderer.forceContextLoss() }
    }
  }, [])

  return (
    <section id="about" className={styles.section} ref={sectionRef}>

      {/* Real avatar shown at start, fades as particles take over */}
      <div className={styles.avatarCenter}>
        <div className={styles.avatarFrame} ref={avatarImgRef}>
          <Image src="/portfolio-image.png" alt="Atul" fill
            style={{ objectFit:'cover', objectPosition:'center 10%' }}
            quality={100} priority />
          <div className={styles.avatarRing} />
          <div className={styles.avatarGlow} />
        </div>
      </div>

      {/* Particle canvas */}
      <canvas ref={canvasRef} className={styles.canvas} />

      <div className={styles.gradTop}    />
      <div className={styles.gradBottom} />
      <div className={styles.vignette}   />

      {/* About section — revealed when particles scatter */}
      <div className={styles.aboutOverlay} ref={aboutRef}>
        <div className={styles.glow} />

        <div className={styles.inner}>

          {/* Flip card */}
          <div className={styles.imageWrap}>
            <div className={`${styles.flipCard} ${flipped ? styles.flipCardFlipped : ''}`}>

              {/* Front: avatar */}
              <div className={styles.flipFront}>
                <div className={styles.imageFrame}>
                  <Image src="/portfolio-image.png" alt="Atul — AI/ML Engineer" fill
                    style={{ objectFit:'cover', objectPosition:'center 8%' }}
                    quality={100} priority />
                </div>
                {flipping && <div className={styles.scanLine} />}
              </div>

              {/* Back: real photo */}
              <div className={styles.flipBack}>
                <div className={styles.imageFrame}>
                  <Image src="/atul-real.jpg" alt="Atul — Real Photo" fill
                    style={{ objectFit:'cover', objectPosition:'center 15%' }}
                    quality={100} />
                  <div className={styles.realOverlay} />
                </div>
                {flipping && <div className={styles.scanLine} />}
              </div>

              {/* Burst effect */}
              {burst && (
                <div className={styles.burstWrap} aria-hidden="true">
                  {Array.from({length:16}).map((_,i) => (
                    <div key={i} className={styles.burstDot}
                      style={{ '--angle':`${i*22.5}deg`, '--delay':`${i*0.025}s`, '--size':`${4+(i%3)*3}px` }} />
                  ))}
                </div>
              )}
            </div>

            {/* Centered flip button overlay — sits on top of both card faces */}
            <div className={styles.flipBtnOverlay}>
              <button
                className={`${styles.flipBtn} ${flipped ? styles.flipBtnActive : ''}`}
                onClick={handleFlip}
                aria-label={flipped ? 'Show avatar' : 'Show real photo'}
              >
                {/* Pulsing rings */}
                <span className={styles.flipRing1} />
                <span className={styles.flipRing2} />
                {/* Icon */}
                <svg className={styles.flipIcon} width="18" height="18" viewBox="0 0 16 16" fill="none">
                  <path d="M1 4C1 4 3 1 8 1s7 3 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M15 12c0 0-2 3-7 3s-7-3-7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M12 1l3 3-3 3M4 9l-3 3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className={styles.flipLabel}>{flipped ? 'Avatar' : 'Real Me'}</span>
              </button>
            </div>

            <div className={styles.imageBorder} />
            <div className={styles.imageGlow}   />
            <div className={styles.accentLine}  />
          </div>

          {/* Text */}
          <div className={styles.textCol}>
            <span className={styles.eyebrow}>About Me</span>
            <h2 className={styles.heading}>
              Crafting digital<br /><em>experiences</em> that last.
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
            <a href="#contact" className={styles.btn}
              onClick={e=>{e.preventDefault();document.querySelector('#contact')?.scrollIntoView({behavior:'smooth'})}}>
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

      <div className={styles.scrollHint}>
        <span>scroll</span>
        <div className={styles.scrollLine} />
      </div>
    </section>
  )
}
