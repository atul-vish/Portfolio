'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { gsap } from 'gsap'
import Image from 'next/image'
import styles from './VideoIntro.module.css'

export default function VideoIntro() {
  const heroRef      = useRef(null)
  const videoRef     = useRef(null)
  const contentRef   = useRef(null)
  const taglineRef   = useRef(null)
  const firstNameRef = useRef(null)
  const lastNameRef  = useRef(null)
  const subtitleRef  = useRef(null)
  const controlsRef  = useRef(null)
  const scrollRef    = useRef(null)
  const overlayRef   = useRef(null)

  // 'idle' = showing click-to-play overlay, 'playing' = video running, 'ended' = show replay
  const [phase, setPhase] = useState('idle')
  const [paused, setPaused] = useState(false)

  // ── GSAP entrance ──────────────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.fromTo(heroRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 1.2 }
      )
      .fromTo(taglineRef.current,
        { opacity: 0, y: 24, letterSpacing: '0.6em' },
        { opacity: 1, y: 0, letterSpacing: '0.22em', duration: 0.9 },
        '-=0.5'
      )
      .fromTo(firstNameRef.current,
        { opacity: 0, y: 60, skewY: 4 },
        { opacity: 1, y: 0, skewY: 0, duration: 1 },
        '-=0.5'
      )
      .fromTo(lastNameRef.current,
        { opacity: 0, y: 60, skewY: 4 },
        { opacity: 1, y: 0, skewY: 0, duration: 1 },
        '-=0.75'
      )
      .fromTo(subtitleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8 },
        '-=0.5'
      )
      .fromTo(controlsRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.6 },
        '-=0.4'
      )
      .fromTo(scrollRef.current,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.6 },
        '-=0.3'
      )
    }, heroRef)
    return () => ctx.revert()
  }, [])

  // ── Scroll pulse ───────────────────────────────────────────────
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const line = el.querySelector(`.${styles.scrollLine}`)
    if (!line) return
    const anim = gsap.fromTo(line,
      { scaleY: 0, transformOrigin: 'top center' },
      { scaleY: 1, transformOrigin: 'top center', duration: 1.1, ease: 'power2.inOut', repeat: -1, yoyo: true }
    )
    return () => anim.kill()
  }, [])

  // ── Start cinematic playback (called on overlay click) ─────────
  const startCinematic = useCallback(() => {
    const v = videoRef.current
    if (!v) return

    // Fade out overlay
    gsap.to(overlayRef.current, {
      opacity: 0, duration: 0.6, ease: 'power2.out',
      onComplete: () => setPhase('playing')
    })

    // Play foreground with full volume
    v.currentTime = 0
    v.muted       = false
    v.volume      = 1
    v.play().catch(() => {
      // Fallback if browser still blocks — play muted then ramp up
      v.muted = true
      v.play().then(() => { v.muted = false; v.volume = 1 })
    })

    setPaused(false)
  }, [])

  // ── Video ended → show replay ──────────────────────────────────
  const handleEnded = useCallback(() => {
    setPhase('ended')
  }, [])

  // ── Replay ────────────────────────────────────────────────────
  const handleReplay = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    setPhase('playing')
    v.currentTime = 0
    v.muted       = false
    v.volume      = 1
    v.play()
    if (bg) { bg.currentTime = 0; bg.play() }
    setPaused(false)
  }, [])

  // ── Pause / Resume ────────────────────────────────────────────
  const togglePlay = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) { v.play(); setPaused(false) }
    else          { v.pause(); setPaused(true) }
  }, [])

  const scrollToNext = useCallback(() => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  return (
    <section className={styles.hero} ref={heroRef}>

      {/* ── Ambient BG — static pre-blurred image (no second video decode) ── */}
      <div className={styles.bgVideoWrap}>
        <Image
          src="/hero-bg-blurred.jpg"
          alt=""
          fill
          className={styles.bgVideo}
          priority
          aria-hidden="true"
        />
        <div className={styles.bgBlur} />
      </div>

      {/* ── Foreground video (plays once with sound) ── */}
      <div className={styles.fgVideoWrap}>
        <video
          ref={videoRef}
          className={styles.fgVideo}
          src="/hero-video.mp4"
          playsInline
          preload="auto"
          muted
          disablePictureInPicture
          disableRemotePlayback
          controls={false}
          onEnded={handleEnded}
        />
        <div className={styles.videoVignette} />
      </div>


      {/* ── Gradient overlays ── */}
      <div className={styles.gradientBottom} />
      <div className={styles.gradientTop}    />
      <div className={styles.gradientLeft}   />
      <div className={styles.gradientRight}  />

      {/* ══════════════════════════════════════════════════════════
          PHASE: IDLE — Click to Watch overlay
      ══════════════════════════════════════════════════════════ */}
      {phase === 'idle' && (
        <div className={styles.watchOverlay} ref={overlayRef}>
          <button className={styles.watchBtn} onClick={startCinematic} aria-label="Watch cinematic intro with sound">
            <span className={styles.watchRing} />
            <span className={styles.watchRing2} />
            <svg className={styles.watchIcon} width="28" height="28" viewBox="0 0 28 28" fill="currentColor">
              <path d="M6 4l18 10L6 24V4z"/>
            </svg>
          </button>
          <p className={styles.watchLabel}>Watch Intro</p>
          <p className={styles.watchSub}>with sound · 30 sec</p>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          PHASE: ENDED — Replay overlay
      ══════════════════════════════════════════════════════════ */}
      {phase === 'ended' && (
        <div className={styles.replayOverlay}>
          <div className={styles.replayCard}>
            <button className={styles.replayBtn} onClick={handleReplay} aria-label="Replay cinematic intro">
              {/* Replay icon */}
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 4v6h6"/>
                <path d="M3.51 15a10 10 0 1 0 .49-4.5"/>
              </svg>
            </button>
            <span className={styles.replayLabel}>Replay</span>
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <div className={styles.content} ref={contentRef}>

        <span className={styles.tagline} ref={taglineRef}>
          AI/ML Engineer &nbsp;·&nbsp; LLM &nbsp;·&nbsp; Gen AI &nbsp;·&nbsp; Open to Work
        </span>

        <div className={styles.nameBlock}>
          <h1 className={styles.firstName} ref={firstNameRef}>Atul</h1>
          <h1 className={styles.lastName}  ref={lastNameRef}>.</h1>
        </div>

        <p className={styles.subtitle} ref={subtitleRef}>
          Building intelligent AI systems &amp; LLM-powered apps,<br />
          scalable ML pipelines &amp; impactful digital products.
        </p>

        {/* ── Controls (pause/resume during playback) ── */}
        <div className={styles.controls} ref={controlsRef}>
          {phase === 'playing' && (
            <button
              className={styles.ctrlBtn}
              onClick={togglePlay}
              aria-label={paused ? 'Resume video' : 'Pause video'}
            >
              {paused ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M3 2.5l10 5.5-10 5.5V2.5z"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <rect x="3" y="2" width="4" height="12" rx="1"/>
                  <rect x="9" y="2" width="4" height="12" rx="1"/>
                </svg>
              )}
            </button>
          )}
        </div>

      </div>

      {/* ── Scroll indicator ── */}
      <button
        className={styles.scrollIndicator}
        ref={scrollRef}
        onClick={scrollToNext}
        aria-label="Scroll to next section"
      >
        <span className={styles.scrollLabel}>Scroll</span>
        <span className={styles.scrollLine} />
      </button>

    </section>
  )
}
