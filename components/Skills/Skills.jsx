'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './Skills.module.css'

gsap.registerPlugin(ScrollTrigger)

const CATEGORIES = [
  {
    label: 'AI & Machine Learning',
    color: '#f4722b',
    icon: '🧠',
    skills: [
      { name: 'Python',          level: 95, color: '#3b82f6' },
      { name: 'PyTorch',         level: 90, color: '#ee4c2c' },
      { name: 'TensorFlow',      level: 82, color: '#ff6f00' },
      { name: 'Scikit-learn',    level: 88, color: '#f7931e' },
      { name: 'CUDA / GPU',      level: 72, color: '#76b900' },
    ]
  },
  {
    label: 'LLM & GenAI',
    color: '#a78bfa',
    icon: '⚡',
    skills: [
      { name: 'LangChain',       level: 92, color: '#a78bfa' },
      { name: 'OpenAI / GPT',    level: 90, color: '#10a37f' },
      { name: 'HuggingFace',     level: 85, color: '#ff9d00' },
      { name: 'Prompt Eng.',     level: 93, color: '#f4722b' },
      { name: 'RAG Pipelines',   level: 88, color: '#60a5fa' },
    ]
  },
  {
    label: 'Backend & Cloud',
    color: '#34d399',
    icon: '☁️',
    skills: [
      { name: 'FastAPI',         level: 88, color: '#05998b' },
      { name: 'AWS',             level: 78, color: '#f4722b' },
      { name: 'Docker',          level: 82, color: '#2496ed' },
      { name: 'PostgreSQL',      level: 80, color: '#336791' },
      { name: 'MongoDB',         level: 75, color: '#4db33d' },
    ]
  },
  {
    label: 'Frontend',
    color: '#61dafb',
    icon: '🖥️',
    skills: [
      { name: 'Next.js',         level: 85, color: '#ffffff' },
      { name: 'React',           level: 87, color: '#61dafb' },
      { name: 'TypeScript',      level: 80, color: '#3178c6' },
      { name: 'Three.js',        level: 70, color: '#ffffff' },
      { name: 'Tailwind CSS',    level: 88, color: '#38bdf8' },
    ]
  },
]

const STACK_CARDS = [
  // Core AI/ML
  { name: 'Python',        icon: '🐍', color: '#3b82f6',  tag: 'Core'    },
  { name: 'PyTorch',       icon: '🔥', color: '#ee4c2c',  tag: 'ML'      },
  { name: 'TensorFlow',    icon: '🧮', color: '#ff6f00',  tag: 'ML'      },
  { name: 'Scikit-learn',  icon: '📊', color: '#f7931e',  tag: 'ML'      },
  // LLM / GenAI
  { name: 'LangChain',     icon: '⛓️', color: '#a78bfa',  tag: 'LLM'     },
  { name: 'LlamaIndex',    icon: '🦙', color: '#c084fc',  tag: 'LLM'     },
  { name: 'OpenAI',        icon: '✦',  color: '#10a37f',  tag: 'GenAI'   },
  { name: 'HuggingFace',   icon: '🤗', color: '#ff9d00',  tag: 'Models'  },
  { name: 'Ollama',        icon: '🐢', color: '#34d399',  tag: 'Local'   },
  { name: 'Anthropic',     icon: '◎',  color: '#d97706',  tag: 'GenAI'   },
  // Vector DBs & RAG
  { name: 'Pinecone',      icon: '🌲', color: '#00c4b4',  tag: 'VectorDB' },
  { name: 'ChromaDB',      icon: '🎨', color: '#7c3aed',  tag: 'VectorDB' },
  { name: 'Weaviate',      icon: '🔷', color: '#3b82f6',  tag: 'VectorDB' },
  // MLOps
  { name: 'MLflow',        icon: '📈', color: '#0194e2',  tag: 'MLOps'   },
  { name: 'Weights & B.',  icon: '🏋️', color: '#ffbe00',  tag: 'MLOps'   },
  { name: 'Airflow',       icon: '🌪️', color: '#017cee',  tag: 'MLOps'   },
  // Backend & Cloud
  { name: 'FastAPI',       icon: '⚡', color: '#05998b',  tag: 'API'     },
  { name: 'AWS',           icon: '☁️', color: '#f4722b',  tag: 'Cloud'   },
  { name: 'Docker',        icon: '🐳', color: '#2496ed',  tag: 'DevOps'  },
  { name: 'Kubernetes',    icon: '⚙️', color: '#326ce5',  tag: 'DevOps'  },
  // Data
  { name: 'Pandas',        icon: '🐼', color: '#150458',  tag: 'Data'    },
  { name: 'Spark',         icon: '✨', color: '#e25a1c',  tag: 'Data'    },
  { name: 'PostgreSQL',    icon: '🐘', color: '#336791',  tag: 'DB'      },
  { name: 'Redis',         icon: '🔴', color: '#dc382d',  tag: 'Cache'   },
  // Frontend
  { name: 'Next.js',       icon: '▲',  color: '#ffffff',  tag: 'Web'     },
  { name: 'React',         icon: '⚛️', color: '#61dafb',  tag: 'UI'      },
  { name: 'TypeScript',    icon: 'TS', color: '#3178c6',  tag: 'Lang'    },
  // Tools
  { name: 'Git',           icon: '⌥',  color: '#f05032',  tag: 'VCS'     },
  { name: 'Jupyter',       icon: '📓', color: '#f37626',  tag: 'Dev'     },
  { name: 'Linux',         icon: '🐧', color: '#fcc624',  tag: 'OS'      },
]

export default function Skills() {
  const sectionRef   = useRef(null)
  const activeTabRef = useRef(0)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header
      gsap.fromTo('[data-sk-header]',
        { opacity: 0, y: 36 },
        { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out', stagger: 0.1,
          scrollTrigger: { trigger: '[data-sk-header]', start: 'top 84%' } }
      )

      // Category tabs
      gsap.fromTo('[data-cat-tab]',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out', stagger: 0.08,
          scrollTrigger: { trigger: '[data-cat-tabs]', start: 'top 85%' } }
      )

      // Skill bars
      document.querySelectorAll('[data-bar]').forEach(bar => {
        const fill  = bar.querySelector('[data-fill]')
        const level = parseInt(bar.dataset.level)
        gsap.fromTo(fill,
          { width: '0%', opacity: 0 },
          { width: `${level}%`, opacity: 1, duration: 1.1, ease: 'power3.out',
            scrollTrigger: { trigger: bar, start: 'top 90%' } }
        )
      })

      // Stack cards
      gsap.fromTo('[data-stack-card]',
        { opacity: 0, y: 22, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(1.6)', stagger: 0.05,
          scrollTrigger: { trigger: '[data-stack-grid]', start: 'top 86%' } }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section id="skills" className={styles.section} ref={sectionRef}>
      <div className={styles.glowLeft}  aria-hidden="true" />
      <div className={styles.glowRight} aria-hidden="true" />

      <div className={styles.inner}>

        {/* ── Header ── */}
        <div className={styles.header}>
          <span className={styles.eyebrow} data-sk-header>Expertise</span>
          <h2 className={styles.heading} data-sk-header>
            Built for the<br /><em>AI era.</em>
          </h2>
          <p className={styles.sub} data-sk-header>
            From raw ML research to production LLM pipelines —
            every tool chosen for real-world impact.
          </p>
        </div>

        {/* ── Skill bars — all 4 categories ── */}
        <div className={styles.catsGrid} data-cat-tabs>
          {CATEGORIES.map((cat, ci) => (
            <div key={cat.label} className={styles.catBlock} data-cat-tab style={{ '--cat-color': cat.color }}>
              <div className={styles.catHeader}>
                <span className={styles.catIcon}>{cat.icon}</span>
                <span className={styles.catLabel}>{cat.label}</span>
              </div>
              <div className={styles.catBars}>
                {cat.skills.map(skill => (
                  <div key={skill.name} className={styles.barRow} data-bar data-level={skill.level}>
                    <div className={styles.barMeta}>
                      <span className={styles.barName}>{skill.name}</span>
                      <span className={styles.barPct} style={{ color: skill.color }}>{skill.level}%</span>
                    </div>
                    <div className={styles.barTrack}>
                      <div className={styles.barFill} data-fill style={{ '--bar-color': skill.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── Stack cards ── */}
        <div className={styles.stackSection}>
          <h3 className={styles.stackTitle}>Full Stack</h3>
          <div className={styles.stackGrid} data-stack-grid>
            {STACK_CARDS.map(t => (
              <div key={t.name} className={styles.stackCard} data-stack-card style={{ '--card-color': t.color }}>
                <span className={styles.stackTag}>{t.tag}</span>
                <span className={styles.stackIcon}>{t.icon}</span>
                <span className={styles.stackName}>{t.name}</span>
                <div className={styles.stackGlow} />
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
