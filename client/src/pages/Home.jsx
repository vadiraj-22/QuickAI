import React from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import AiTools from '../components/AiTools'
import Testimonials from '../components/Testimonials'
import Plan from '../components/Plan'
import Footer from '../components/Footer'
import CompanyLogo from '../components/CompanyLogo'
import MoltenMetal from '../components/ui/MoltenMetal'

const Home = () => {
  return (
    <div className="dark relative bg-[var(--background)] min-h-screen">
      {/* MoltenMetal Background Animation */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <MoltenMetal
          color1="#0f0d17"
          color2="#ffc100"
          color3="#ffffff"
          speed={0.95}
          scale={5.2}
          detail={3}
          glow={1.6}
          coreSize={0.15}
          swirl={1.65}
          fold={-0.23}
          blackPoint={0.02}
          brightness={1.55}
          colorMode="frost"
          grain={true}
          grainIntensity={0.21}
          mouseInteraction={true}
          mouseStrength={1}
          opacity={1.0}
        />
      </div>

      {/* Main Content - Above the background */}
      <div className="relative z-10">
        <Navbar/>
        <Hero/>
        <CompanyLogo/>
        <AiTools/>
        <Testimonials/>
        <Plan/>
        <Footer/>
      </div>
    </div>
  )
}

export default Home

