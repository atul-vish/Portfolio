import VideoIntro         from '@/components/VideoIntro/VideoIntro'
import About              from '@/components/About/About'
import Skills             from '@/components/Skills/Skills'
import ParticleTransition from '@/components/ParticleTransition/ParticleTransition'
import Projects           from '@/components/Projects/Projects'
import Contact            from '@/components/Contact/Contact'
import Footer             from '@/components/Footer/Footer'
import StarsBackground    from '@/components/StarsBackground/StarsBackground'

export default function Home() {
  return (
    <main>
      <StarsBackground />
      <VideoIntro />
      <div className="sections-wrap">
        <About />
        <Skills />
        <ParticleTransition />
        <Projects />
        <Contact />
        <Footer />
      </div>
    </main>
  )
}
