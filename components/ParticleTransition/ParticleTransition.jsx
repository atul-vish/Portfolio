'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './ParticleTransition.module.css'

gsap.registerPlugin(ScrollTrigger)

export default function ParticleTransition() {
  const sectionRef = useRef(null)
  const canvasRef  = useRef(null)
  const textRef    = useRef(null)

  useEffect(() => {
    let THREE, renderer, scene, camera, animId
    let tendrils = []     // { line, pointCount, drawCount }
    let tipSpheres = []
    let nucleus, avatarMesh
    let scrollProgress = 0

    async function init() {
      THREE = (await import('three')).default || await import('three')
      const canvas  = canvasRef.current
      const section = sectionRef.current
      if (!canvas || !section) return

      const W = window.innerWidth
      const H = window.innerHeight

      // ── Renderer ──────────────────────────────────────────
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(W, H)
      renderer.setClearColor(0x000000, 0)

      scene  = new THREE.Scene()
      camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 100)
      camera.position.z = 5

      // ── Avatar image plane ─────────────────────────────────
      const texLoader  = new THREE.TextureLoader()
      const avatarTex  = await new Promise(res => texLoader.load('/portfolio-image.png', res))
      const planeH     = 3.2
      const planeW     = planeH * (avatarTex.image.width / avatarTex.image.height)
      const planeMat   = new THREE.MeshBasicMaterial({
        map: avatarTex,
        transparent: true,
        opacity: 1,
        side: THREE.FrontSide,
      })
      const planeGeo   = new THREE.PlaneGeometry(planeW, planeH)
      avatarMesh       = new THREE.Mesh(planeGeo, planeMat)
      avatarMesh.position.set(0, 0, 0)
      scene.add(avatarMesh)

      // ── Origin: top of head (brain area) ──────────────────
      // Avatar is 3.2 tall, centered at 0 → top edge ≈ +1.6, head top ≈ +1.2
      const ORIGIN = new THREE.Vector3(0, 1.1, 0.05)

      // ── Orange nucleus glow at brain ───────────────────────
      const nucleusGeo = new THREE.SphereGeometry(0.06, 16, 16)
      const nucleusMat = new THREE.MeshBasicMaterial({
        color: 0xf4722b,
        transparent: true,
        opacity: 0,
      })
      nucleus = new THREE.Mesh(nucleusGeo, nucleusMat)
      nucleus.position.copy(ORIGIN)
      scene.add(nucleus)

      // Halo ring around nucleus
      const haloGeo = new THREE.RingGeometry(0.10, 0.13, 32)
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0xf4722b, side: THREE.DoubleSide,
        transparent: true, opacity: 0
      })
      const halo = new THREE.Mesh(haloGeo, haloMat)
      halo.position.copy(ORIGIN)
      scene.add(halo)

      // ── Generate organic neuron tendrils ───────────────────
      const TENDRIL_COUNT = 90
      const STEPS         = 60   // points per tendril

      for (let t = 0; t < TENDRIL_COUNT; t++) {
        // Random spread direction — biased upward and outward
        const theta  = Math.random() * Math.PI * 2
        // Bias: more toward upper hemisphere
        const phiBias = Math.PI * 0.1 + Math.random() * Math.PI * 0.75
        const dx = Math.sin(phiBias) * Math.cos(theta)
        const dy = Math.abs(Math.cos(phiBias)) * (Math.random() < 0.7 ? 1 : -0.4) // mostly upward
        const dz = Math.sin(phiBias) * Math.sin(theta) * 0.4

        const length = 1.5 + Math.random() * 3.5

        // Build organic CatmullRom path
        const ctrlPts = [ORIGIN.clone()]
        const segments = 3 + Math.floor(Math.random() * 3)
        let cx = ORIGIN.x, cy = ORIGIN.y, cz = ORIGIN.z
        for (let s = 1; s <= segments; s++) {
          const frac = s / segments
          const jitter = (1 - frac) * 0.35
          cx += (dx * length / segments) + (Math.random() - 0.5) * jitter
          cy += (dy * length / segments) + (Math.random() - 0.5) * jitter
          cz += (dz * length / segments) + (Math.random() - 0.5) * jitter * 0.3
          ctrlPts.push(new THREE.Vector3(cx, cy, cz))
        }

        const curve   = new THREE.CatmullRomCurve3(ctrlPts)
        const pts3d   = curve.getPoints(STEPS)
        const flatArr = new Float32Array(pts3d.length * 3)
        pts3d.forEach((p, i) => {
          flatArr[i*3]   = p.x
          flatArr[i*3+1] = p.y
          flatArr[i*3+2] = p.z
        })

        const geo = new THREE.BufferGeometry()
        geo.setAttribute('position', new THREE.BufferAttribute(flatArr, 3))
        geo.setDrawRange(0, 0)  // hidden initially

        // Color: mostly white-silver, occasional orange tint
        const isOrange = Math.random() < 0.12
        const mat = new THREE.LineBasicMaterial({
          color: isOrange ? 0xf4722b : 0xe8e4dc,
          transparent: true,
          opacity: isOrange ? 0.9 : (0.25 + Math.random() * 0.5),
          linewidth: 1,
        })

        const line = new THREE.Line(geo, mat)
        scene.add(line)

        // Small sphere at tip
        const tipGeo = new THREE.SphereGeometry(0.012 + Math.random() * 0.018, 8, 8)
        const tipMat = new THREE.MeshBasicMaterial({
          color: isOrange ? 0xf4722b : 0xffffff,
          transparent: true,
          opacity: 0,
        })
        const tip = new THREE.Mesh(tipGeo, tipMat)
        tip.position.copy(pts3d[pts3d.length - 1])
        scene.add(tip)

        tendrils.push({
          geo, mat, line,
          totalPoints: pts3d.length,
          drawCount: 0,
          tipMesh: tip,
          tipMat,
          delay: Math.random(),           // stagger start (0–1 range in scroll)
          speed: 0.6 + Math.random() * 0.8,
          tipPos: pts3d[pts3d.length - 1],
        })
        tipSpheres.push(tip)
      }

      // ── ScrollTrigger — pin for 300vh ─────────────────────
      ScrollTrigger.create({
        trigger: section,
        start:   'top top',
        end:     '+=300%',
        pin:     true,
        scrub:   1.5,
        onUpdate: self => { scrollProgress = self.progress },
      })

      // ── Text fade via scroll ───────────────────────────────
      if (textRef.current) {
        ScrollTrigger.create({
          trigger: section,
          start:   'top top',
          end:     '+=300%',
          scrub:   true,
          onUpdate: self => {
            const p = self.progress
            const op = Math.min(p / 0.2, 1)
            textRef.current.style.opacity = op
          }
        })
      }

      // ── Render loop ────────────────────────────────────────
      let clock = new THREE.Clock()

      function animate() {
        animId = requestAnimationFrame(animate)
        const t = clock.getElapsedTime()
        const sp = scrollProgress

        // ── Avatar: fade out gently as neurons grow ─────────
        const avatarOpacity = Math.max(0, 1 - sp * 1.8)
        planeMat.opacity = avatarOpacity

        // ── Nucleus: glow in at sp > 0.05, pulse ───────────
        const nucleusOp = Math.min(Math.max((sp - 0.05) / 0.15, 0), 1)
        nucleusMat.opacity = nucleusOp
        haloMat.opacity    = nucleusOp * 0.5
        // Pulse
        const pulse = 1 + Math.sin(t * 3.5) * 0.18 * nucleusOp
        nucleus.scale.setScalar(pulse)
        halo.scale.setScalar(1 + Math.sin(t * 2.8) * 0.3 * nucleusOp)

        // ── Grow tendrils — grow fast, STAY fully extended (no retraction) ──
        tendrils.forEach(td => {
          const startAt = 0.04 + td.delay * 0.25
          const growEnd = startAt + 0.18 * td.speed
          const growP   = Math.max(0, Math.min((sp - startAt) / (growEnd - startAt), 1))

          // Ease-out: decelerates as it reaches full length
          const eased = 1 - Math.pow(1 - growP, 3)

          // Once grown → stay at full extension, never retract
          const drawCount = Math.floor(eased * td.totalPoints)
          if (!td.prevDraw) td.prevDraw = 0
          td.prevDraw = Math.max(drawCount, td.prevDraw)
          td.geo.setDrawRange(0, td.prevDraw)

          // Tip sphere appears when fully grown and stays
          td.tipMat.opacity = growP > 0.85 ? Math.min((growP - 0.85) / 0.15, 1) : 0

          // Continuous gentle organic wave motion — alive the whole time
          if (growP > 0) {
            td.line.rotation.z = Math.sin(t * 0.5 + td.delay * 6.28) * 0.022
            td.line.rotation.x = Math.cos(t * 0.35 + td.delay * 4.0) * 0.014
          }
        })

        // ── Camera subtle drift ────────────────────────────
        camera.position.x = Math.sin(t * 0.2) * 0.08
        camera.position.y = Math.cos(t * 0.15) * 0.04
        camera.lookAt(0, 0.3, 0)

        renderer.render(scene, camera)
      }

      animate()

      // ── Resize ────────────────────────────────────────────
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
    <section className={styles.section} ref={sectionRef}>
      <canvas ref={canvasRef} className={styles.canvas} />

      {/* Gradient blends */}
      <div className={styles.gradTop}    />
      <div className={styles.gradBottom} />

      {/* Vignette around edges */}
      <div className={styles.vignette} />

      {/* Text overlay */}
      <div className={styles.textWrap} ref={textRef} style={{ opacity: 0 }}>
        <span className={styles.label}>Neural Intelligence</span>
        <h2 className={styles.title}>
          Thinking in<br /><em>networks.</em>
        </h2>
        <p className={styles.sub}>AI/ML Engineer &nbsp;·&nbsp; LLM &nbsp;·&nbsp; Gen AI</p>
      </div>

      {/* Scroll prompt */}
      <div className={styles.scrollHint}>
        <span>scroll</span>
        <div className={styles.scrollLine} />
      </div>
    </section>
  )
}
