import VideoIntro      from '@/components/VideoIntro/VideoIntro'
import About           from '@/components/About/About'
import Skills          from '@/components/Skills/Skills'
import Projects        from '@/components/Projects/Projects'
import Contact         from '@/components/Contact/Contact'
import Footer          from '@/components/Footer/Footer'
import StarsBackground from '@/components/StarsBackground/StarsBackground'

export default function Home() {
  return (
    <main>
      {/* Fixed star field — fades in after hero, visible on all sections below */}
      <StarsBackground />

      {/* Hero — stars are hidden here via scroll-based opacity */}
      <VideoIntro />

      {/* All sections below hero — stars visible here */}
      <div className="sections-wrap">
        <About />
        <Skills />
        <Projects />
        <Contact />
        <Footer />
      </div>
    </main>
  )
}
