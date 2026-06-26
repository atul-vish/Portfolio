'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './Contact.module.css'

gsap.registerPlugin(ScrollTrigger)

export default function Contact() {
  const sectionRef = useRef(null)
  const [status, setStatus]   = useState('idle') // idle | sending | sent
  const [form, setForm]       = useState({ name: '', email: '', message: '' })

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('[data-contact-el]',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.85, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' } }
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setStatus('sending')
    // Simulate send — wire to your preferred API (Resend, Formspree, etc.)
    await new Promise(r => setTimeout(r, 1400))
    setStatus('sent')
  }

  return (
    <section id="contact" className={styles.section} ref={sectionRef}>
      <div className={styles.glow} aria-hidden="true" />

      <div className={styles.inner}>

        {/* ── Left: copy ── */}
        <div className={styles.copyCol}>
          <span className={styles.eyebrow} data-contact-el>Get in Touch</span>
          <h2 className={styles.heading} data-contact-el>
            Let's build<br />something<br /><em>great.</em>
          </h2>
          <p className={styles.body} data-contact-el>
            Whether you have a project in mind, want to collaborate, or just want to
            say hi — my inbox is always open.
          </p>

          <div className={styles.contactLinks} data-contact-el>
            <a href="mailto:hello@atul.dev" className={styles.contactLink}>
              <span className={styles.linkIcon}>✉</span>
              hello@atul.dev
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className={styles.contactLink}>
              <span className={styles.linkIcon}>in</span>
              linkedin.com/in/atul
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className={styles.contactLink}>
              <span className={styles.linkIcon}>⌥</span>
              github.com/atul
            </a>
          </div>
        </div>

        {/* ── Right: form ── */}
        <div className={styles.formCol} data-contact-el>
          {status === 'sent' ? (
            <div className={styles.successMsg}>
              <span className={styles.successIcon}>✓</span>
              <h3>Message received.</h3>
              <p>I'll get back to you within 24 hours.</p>
            </div>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="name">Name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className={styles.input}
                    placeholder="Your name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className={styles.input}
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  className={`${styles.input} ${styles.textarea}`}
                  placeholder="Tell me about your project..."
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  required
                />
              </div>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={status === 'sending'}
              >
                {status === 'sending' ? (
                  <>
                    <span className={styles.spinner} />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

      </div>
    </section>
  )
}
