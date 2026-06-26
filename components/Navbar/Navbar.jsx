'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import styles from './Navbar.module.css'

const NAV_LINKS = [
  { label: 'About',    href: '#about'    },
  { label: 'Skills',   href: '#skills'   },
  { label: 'Projects', href: '#projects' },
  { label: 'Contact',  href: '#contact'  },
]

export default function Navbar() {
  const navRef  = useRef(null)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    gsap.fromTo(navRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 1 }
    )

    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (href) => {
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  return (
    <nav
      ref={navRef}
      className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}
      style={{ opacity: 0 }}
    >
      <a className={styles.logo} onClick={() => scrollTo('#hero')} href="#">
        <span className={styles.logoDot}>A</span>tul
      </a>

      {/* Desktop links */}
      <ul className={styles.links}>
        {NAV_LINKS.map(l => (
          <li key={l.href}>
            <a
              href={l.href}
              className={styles.link}
              onClick={e => { e.preventDefault(); scrollTo(l.href) }}
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>

      <a
        href="mailto:hello@atul.dev"
        className={styles.cta}
      >
        Hire Me
      </a>

      {/* Hamburger */}
      <button
        className={`${styles.burger} ${menuOpen ? styles.burgerOpen : ''}`}
        onClick={() => setMenuOpen(o => !o)}
        aria-label="Toggle menu"
      >
        <span /><span /><span />
      </button>

      {/* Mobile drawer */}
      <div className={`${styles.drawer} ${menuOpen ? styles.drawerOpen : ''}`}>
        {NAV_LINKS.map(l => (
          <a
            key={l.href}
            href={l.href}
            className={styles.drawerLink}
            onClick={e => { e.preventDefault(); scrollTo(l.href) }}
          >
            {l.label}
          </a>
        ))}
        <a href="mailto:hello@atul.dev" className={styles.drawerCta}>Hire Me</a>
      </div>
    </nav>
  )
}
