'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './Skills.module.css'

gsap.registerPlugin(ScrollTrigger)

const SKILL_BARS = [
  { name: 'React / Next.js',   level: 95, color: '#61dafb' },
  { name: 'Node.js / Express', level: 88, color: '#6fcf45' },
  { name: 'TypeScript',        level: 85, color: '#3178c6' },
  { name: 'PostgreSQL',        level: 80, color: '#336791' },
  { name: 'AWS / Cloud',       level: 72, color: '#f4722b' },
  { name: 'Three.js / WebGL',  level: 68, color: '#ffffff' },
]

const TECH_ICONS = [
  { name: 'React',       icon: '⚛️' },
  { name: 'Next.js',     icon: '▲' },
  { name: 'TypeScript',  icon: 'TS' },
  { name: 'Node.js',     icon: '⬡' },
  { name: 'Python',      icon: '🐍' },
  { name: 'PostgreSQL',  icon: '🐘' },
  { name: 'MongoDB',     icon: '🍃' },
  { name: 'Redis',       icon: '⚡' },
  { name: 'Docker',      icon: '🐳' },
  { name: 'AWS',         icon: '☁️' },
  { name: 'Git',         icon: '⌥' },
  { name: 'Figma',       icon: '◈' },
]

export default function Skills() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header reveal
      gsap.fromTo('[data-skills-header]',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1,
          scrollTrigger: { trigger: '[data-skills-header]', start: 'top 82%' } }
      )

      // Skill bars
      document.querySelectorAll('[data-bar]').forEach(bar => {
        const fill = bar.querySelector('[data-fill]')
        const level = parseInt(bar.dataset.level)
        gsap.fromTo(fill,
          { width: '0%', opacity: 0 },
          { width: `${level}%`, opacity: 1, duration: 1.2, ease: 'power3.out',
            scrollTrigger: { trigger: bar, start: 'top 88%' } }
        )
      })

      // Tech grid cards
      gsap.fromTo('[data-tech-card]',
        { opacity: 0, y: 24, scale: 0.92 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.4)', stagger: 0.06,
          scrollTrigger: { trigger: '[data-tech-grid]', start: 'top 82%' } }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section id="skills" className={styles.section} ref={sectionRef}>
      <div className={styles.glow} aria-hidden="true" />

      <div className={styles.inner}>
        {/* ── Header ── */}
        <div className={styles.header}>
          <span className={styles.eyebrow} data-skills-header>Expertise</span>
          <h2 className={styles.heading} data-skills-header>
            Tools of the<br /><em>trade.</em>
          </h2>
          <p className={styles.sub} data-skills-header>
            A curated stack built through real projects — chosen for performance,
            scalability, and developer experience.
          </p>
        </div>

        {/* ── Two-column layout ── */}
        <div className={styles.columns}>

          {/* Skill bars */}
          <div className={styles.barsCol}>
            <h3 className={styles.colTitle}>Proficiency</h3>
            {SKILL_BARS.map(skill => (
              <div
                key={skill.name}
                className={styles.barRow}
                data-bar
                data-level={skill.level}
              >
                <div className={styles.barMeta}>
                  <span className={styles.barName}>{skill.name}</span>
                  <span className={styles.barPct}>{skill.level}%</span>
                </div>
                <div className={styles.barTrack}>
                  <div
                    className={styles.barFill}
                    data-fill
                    style={{ '--bar-color': skill.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Tech grid */}
          <div className={styles.gridCol}>
            <h3 className={styles.colTitle}>Tech Stack</h3>
            <div className={styles.techGrid} data-tech-grid>
              {TECH_ICONS.map(t => (
                <div key={t.name} className={styles.techCard} data-tech-card>
                  <span className={styles.techIcon}>{t.icon}</span>
                  <span className={styles.techName}>{t.name}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
