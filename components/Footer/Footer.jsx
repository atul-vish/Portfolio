import styles from './Footer.module.css'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span className={styles.logo}>
          <span className={styles.dot}>A</span>tul.
        </span>
        <p className={styles.copy}>
          © {year} Atul. Designed &amp; built with intent.
        </p>
        <div className={styles.links}>
          <a href="https://github.com"   target="_blank" rel="noopener noreferrer" className={styles.link}>GitHub</a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className={styles.link}>LinkedIn</a>
          <a href="https://twitter.com"  target="_blank" rel="noopener noreferrer" className={styles.link}>Twitter</a>
        </div>
      </div>
      <div className={styles.divider} aria-hidden="true" />
    </footer>
  )
}
