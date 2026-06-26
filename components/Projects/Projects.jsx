'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './Projects.module.css'

gsap.registerPlugin(ScrollTrigger)

const PROJECTS = [
  {
    id: '01',
    title: 'DevDash',
    tag: 'SaaS Dashboard',
    desc: 'A full-stack developer analytics platform with real-time GitHub integration, sprint tracking, and AI-powered code review summaries. Built for engineering teams that care about velocity.',
    stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'OpenAI'],
    href: '#',
    accent: '#f4722b',
    featured: true,
  },
  {
    id: '02',
    title: 'ShopFlow',
    tag: 'E-Commerce',
    desc: 'A headless commerce storefront with sub-200ms page loads, dynamic product filtering, and Stripe-powered checkout. Handles 10K+ concurrent users without breaking a sweat.',
    stack: ['Next.js', 'Sanity CMS', 'Stripe', 'Vercel'],
    href: '#',
    accent: '#61dafb',
    featured: false,
  },
  {
    id: '03',
    title: 'Narrate',
    tag: 'AI Tool',
    desc: 'AI writing assistant that transforms raw bullet points into polished long-form content. Powered by Claude API with a custom streaming interface and voice input support.',
    stack: ['React', 'Claude API', 'Tailwind', 'Supabase'],
    href: '#',
    accent: '#a78bfa',
    featured: false,
  },
  {
    id: '04',
    title: 'TrackIt',
    tag: 'Mobile App',
    desc: 'Cross-platform habit tracker with streak analytics, calendar heatmaps, and motivational AI check-ins. 4.8★ on the Play Store with 5K+ active users.',
    stack: ['React Native', 'Node.js', 'MongoDB', 'Expo'],
    href: '#',
    accent: '#34d399',
    featured: false,
  },
]

export default function Projects() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('[data-proj-header]',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: '[data-proj-header]', start: 'top 82%' } }
      )

      document.querySelectorAll('[data-proj-card]').forEach((card, i) => {
        gsap.fromTo(card,
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: i * 0.08,
            scrollTrigger: { trigger: card, start: 'top 88%' } }
        )
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section id="projects" className={styles.section} ref={sectionRef}>
      <div className={styles.inner}>

        {/* Header */}
        <div className={styles.header}>
          <span className={styles.eyebrow} data-proj-header>Selected Work</span>
          <div className={styles.headerRow}>
            <h2 className={styles.heading} data-proj-header>
              Things I've<br /><em>built.</em>
            </h2>
            <p className={styles.sub} data-proj-header>
              A selection of projects that represent my approach — thoughtful architecture,
              clean UI, and shipping that actually works.
            </p>
          </div>
        </div>

        {/* Cards */}
        <div className={styles.grid}>
          {PROJECTS.map(p => (
            <a
              key={p.id}
              className={`${styles.card} ${p.featured ? styles.featured : ''}`}
              href={p.href}
              data-proj-card
              style={{ '--accent': p.accent }}
            >
              {/* ID badge */}
              <span className={styles.cardId}>{p.id}</span>

              {/* Tag + title */}
              <div className={styles.cardTop}>
                <span className={styles.cardTag}>{p.tag}</span>
                <h3 className={styles.cardTitle}>{p.title}</h3>
              </div>

              {/* Description */}
              <p className={styles.cardDesc}>{p.desc}</p>

              {/* Stack */}
              <div className={styles.cardStack}>
                {p.stack.map(s => (
                  <span key={s} className={styles.stackPill}>{s}</span>
                ))}
              </div>

              {/* Arrow */}
              <div className={styles.cardArrow}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M3 9h12M10 4l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              {/* Hover glow overlay */}
              <div className={styles.cardGlow} aria-hidden="true" />
            </a>
          ))}
        </div>

        {/* View all */}
        <div className={styles.viewAll}>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className={styles.viewAllBtn}>
            View all on GitHub
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 12L12 2M12 2H5M12 2v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>

      </div>
    </section>
  )
}
