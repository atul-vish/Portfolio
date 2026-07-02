'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import VideoIntro    from '@/components/VideoIntro/VideoIntro'
import AboutParticle from '@/components/AboutParticle/AboutParticle'
import Skills        from '@/components/Skills/Skills'
import Projects      from '@/components/Projects/Projects'
import Contact       from '@/components/Contact/Contact'
import Footer        from '@/components/Footer/Footer'

// Stars load ONLY after user scrolls past hero — keeps hero GPU clean for video
const StarsBackground = dynamic(
  () => import('@/components/StarsBackground/StarsBackground'),
  { ssr: false, loading: () => null }
)

export default function Home() {
  const [showStars, setShowStars] = useState(false)
  const triggerRef = useRef(null)

  useEffect(() => {
    const el = triggerRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setShowStars(true); obs.disconnect() } },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <main>
      {showStars && <StarsBackground />}
      <VideoIntro />
      {/* Trigger: first pixel below hero causes stars to load */}
      <div ref={triggerRef} style={{ height: 1 }} />
      <div className="sections-wrap">
        <AboutParticle />
        <Skills />
        <Projects />
        <Contact />
        <Footer />
      </div>
    </main>
  )
}
