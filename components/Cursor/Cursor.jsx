'use client'

import { useEffect, useRef } from 'react'
import styles from './Cursor.module.css'

export default function Cursor() {
  const dotRef  = useRef(null)
  const ringRef = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return

    let mx = 0, my = 0
    let rx = 0, ry = 0
    let raf = null
    let moving = false
    let stopTimer = null

    const lerp = (a, b, t) => a + (b - a) * t

    const tick = () => {
      rx = lerp(rx, mx, 0.12)
      ry = lerp(ry, my, 0.12)

      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${rx}px, ${ry}px)`
      }

      // Stop RAF when ring has caught up to dot (within 0.5px)
      if (Math.abs(rx - mx) < 0.5 && Math.abs(ry - my) < 0.5) {
        moving = false
        raf = null
        return
      }

      raf = requestAnimationFrame(tick)
    }

    const onMove = e => {
      mx = e.clientX
      my = e.clientY

      // Dot follows instantly — no JS loop needed, direct style set
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mx}px, ${my}px)`
      }

      // Only start RAF if not already running
      if (!moving) {
        moving = true
        raf = requestAnimationFrame(tick)
      }
    }

    const onEnter = () => ringRef.current?.classList.add(styles.large)
    const onLeave = () => ringRef.current?.classList.remove(styles.large)

    document.addEventListener('mousemove', onMove, { passive: true })
    document.querySelectorAll('a, button').forEach(el => {
      el.addEventListener('mouseenter', onEnter)
      el.addEventListener('mouseleave', onLeave)
    })

    return () => {
      if (raf) cancelAnimationFrame(raf)
      document.removeEventListener('mousemove', onMove)
    }
  }, [])

  return (
    <>
      <div ref={dotRef}  className={styles.dot}  aria-hidden="true" />
      <div ref={ringRef} className={styles.ring} aria-hidden="true" />
    </>
  )
}
