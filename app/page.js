'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import VideoIntro    from '@/components/VideoIntro/VideoIntro'
import AboutParticle from '@/components/AboutParticle/AboutParticle'
import Skills        from '@/components/Skills/Skills'
import Projects      from '@/components/Projects/Projects'
import Contact       from '@/components/Contact/Contact'
import Footer        from '@/components/Footer/Footer'

// Lazy-load StarsBackground — don't even import it until after hero
const StarsBackground = dynamic(() => import('@/components/StarsBackground/StarsBackground'), {
  ssr: false,
  loading: () => null,
})

export default function Home() {
  const [showStars, setShowStars] = useState(false)
  const sentinelRef = useRef(null)

  useEffect(() => {
    // Only mount StarsBackground once user scrolls past hero
    // This frees CPU/GPU/network entirely for video during initial load
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowStars(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    if (sentinelRef.current) observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <main>
      {showStars && <StarsBackground />}
      <VideoIntro />
      {/* Sentinel — sits at top of sections, triggers star load on scroll */}
      <div ref={sentinelRef} style={{ height: 1 }} />
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
