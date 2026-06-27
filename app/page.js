import VideoIntro      from '@/components/VideoIntro/VideoIntro'
import AboutParticle   from '@/components/AboutParticle/AboutParticle'
import Skills          from '@/components/Skills/Skills'
import Projects        from '@/components/Projects/Projects'
import Contact         from '@/components/Contact/Contact'
import Footer          from '@/components/Footer/Footer'
import StarsBackground from '@/components/StarsBackground/StarsBackground'

export default function Home() {
  return (
    <main>
      <StarsBackground />
      <VideoIntro />
      <div className="sections-wrap">
        <AboutParticle />
        <Skills />
        <Projects />
        <Contact />
        <Footer />
      </div>
    </main>
  )
}
