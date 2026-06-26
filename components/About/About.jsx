'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Image from 'next/image'
import styles from './About.module.css'

gsap.registerPlugin(ScrollTrigger)

const STATS = [
  { value: '3+',  label: 'Years Experience'    },
  { value: '20+', label: 'Projects Shipped'     },
  { value: '10+', label: 'Happy Clients'        },
  { value: '∞',   label: 'Lines of Code'        },
]

export default function About() {
  const sectionRef = useRef(null)
  const imgRef     = useRef(null)
  const textRef    = useRef(null)
  const statsRef   = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Image reveal
      gsap.fromTo(imgRef.current,
        { opacity: 0, x: -60, scale: 0.95 },
        {
          opacity: 1, x: 0, scale: 1, duration: 1.1, ease: 'power3.out',
          scrollTrigger: { trigger: imgRef.current, start: 'top 80%' }
        }
      )

      // Text lines
      gsap.fromTo(textRef.current.querySelectorAll('[data-reveal]'),
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.85, ease: 'power3.out', stagger: 0.12,
          scrollTrigger: { trigger: textRef.current, start: 'top 78%' }
        }
      )

      // Stats pop
      gsap.fromTo(statsRef.current.querySelectorAll('[data-stat]'),
        { opacity: 0, y: 30, scale: 0.9 },
        {
          opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(1.4)', stagger: 0.1,
          scrollTrigger: { trigger: statsRef.current, start: 'top 85%' }
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section id="about" className={styles.section} ref={sectionRef}>
      {/* Ambient glow */}
      <div className={styles.glow} aria-hidden="true" />

      <div className={styles.inner}>

        {/* ── Image ── */}
        <div className={styles.imageWrap} ref={imgRef}>
          <div className={styles.imageFrame}>
            <Image
              src="/portfolio-image.png"
              alt="Atul — AI/ML Engineer"
              fill
              style={{ objectFit: 'cover', objectPosition: 'center top' }}
              priority
            />
          </div>
          <div className={styles.imageBorder} aria-hidden="true" />
          {/* Orange accent line */}
          <div className={styles.accentLine} aria-hidden="true" />
        </div>

        {/* ── Text ── */}
        <div className={styles.textCol} ref={textRef}>
          <span className={styles.eyebrow} data-reveal>About Me</span>

          <h2 className={styles.heading} data-reveal>
            Crafting digital<br />
            <em>experiences</em> that last.
          </h2>

          <p className={styles.body} data-reveal>
            Hey, I'm Atul — an AI/ML Engineer from India with a passion
            for building intelligent AI systems, LLM-powered applications, and scalable ML pipelines. I bridge the gap between
            research and real-world deployment, creating AI products that are accurate,
            efficient, and impactful.
          </p>

          <p className={styles.body} data-reveal>
            When I'm not coding, you'll find me exploring new tech, reading sci-fi,
            or arranging Funko Pops on my shelf. I believe the best software comes
            from curiosity and craft — not just execution.
          </p>

          <div className={styles.tagRow} data-reveal>
            {['React', 'Next.js', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS'].map(t => (
              <span key={t} className={styles.tag}>{t}</span>
            ))}
          </div>

          <a href="#contact" className={styles.btn} data-reveal
            onClick={e => { e.preventDefault(); document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' }) }}>
            Let's work together
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>

      </div>

      {/* ── Stats ── */}
      <div className={styles.statsRow} ref={statsRef}>
        {STATS.map(s => (
          <div key={s.label} className={styles.stat} data-stat>
            <span className={styles.statValue}>{s.value}</span>
            <span className={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </div>

    </section>
  )
}
