'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import styles from './VideoIntro.module.css'

export default function VideoIntro() {
  const videoRef  = useRef(null)
  const [muted,   setMuted]   = useState(true)
  const [ended,   setEnded]   = useState(false)
  const [loaded,  setLoaded]  = useState(false)

  // Video autoplays muted on mount — no click needed, no buffering stall
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = true
    v.play().catch(() => {})
  }, [])

  const toggleMute = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
  }, [])

  const handleReplay = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    v.currentTime = 0
    v.muted = false
    v.play().catch(() => { v.muted = true; v.play() })
    setMuted(false)
    setEnded(false)
  }, [])

  const scrollToNext = useCallback(() => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  return (
    <section className={styles.hero}>

      {/* Static blurred bg — no second video decode */}
      <div className={styles.bgWrap} aria-hidden="true">
        <Image
          src="/hero-bg-blurred.jpg"
          alt=""
          fill
          priority
          className={styles.bgImg}
        />
      </div>

      {/* Single video element — autoplay muted, GPU layer promoted */}
      <video
        ref={videoRef}
        className={styles.video}
        src="/hero-video.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        disableRemotePlayback
        onCanPlay={() => setLoaded(true)}
        onEnded={() => setEnded(true)}
      />

      {/* Cinematic dark overlays */}
      <div className={styles.overlayBottom} />
      <div className={styles.overlayTop}    />
      <div className={styles.overlaySides}  />
      <div className={styles.vignette}      />

      {/* Hero content — pure CSS animations, zero GSAP on this section */}
      <div className={styles.content}>
        <span className={styles.tagline}>
          AI/ML Engineer &nbsp;·&nbsp; LLM &nbsp;·&nbsp; Gen AI &nbsp;·&nbsp; Open to Work
        </span>

        <div className={styles.nameWrap}>
          <h1 className={styles.name}>Atul<span className={styles.dot}>.</span></h1>
        </div>

        <p className={styles.subtitle}>
          Building intelligent AI systems &amp; LLM-powered apps,<br />
          scalable ML pipelines &amp; impactful digital products.
        </p>

        {/* Controls */}
        <div className={styles.controls}>
          {/* Mute toggle */}
          <button
            className={styles.ctrlBtn}
            onClick={toggleMute}
            aria-label={muted ? 'Unmute video' : 'Mute video'}
          >
            {muted ? (
              /* Muted */
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 2L4 5H1v6h3l4 3V2z"/>
                <line x1="11" y1="6" x2="15" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="15" y1="6" x2="11" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            ) : (
              /* Unmuted */
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 2L4 5H1v6h3l4 3V2z"/>
                <path d="M11 5.5a4 4 0 010 5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                <path d="M13 3.5a7 7 0 010 9" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              </svg>
            )}
          </button>

          {/* Tap for sound hint — only shown while muted */}
          {muted && (
            <span className={styles.soundHint}>Tap for sound</span>
          )}
        </div>
      </div>

      {/* Replay overlay — only after video ends */}
      {ended && (
        <div className={styles.replayOverlay}>
          <button className={styles.replayBtn} onClick={handleReplay} aria-label="Replay intro">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 .49-4"/>
            </svg>
            <span>Replay</span>
          </button>
        </div>
      )}

      {/* Scroll indicator */}
      <button className={styles.scrollBtn} onClick={scrollToNext} aria-label="Scroll down">
        <span className={styles.scrollTxt}>Scroll</span>
        <span className={styles.scrollLine} />
      </button>

    </section>
  )
}
