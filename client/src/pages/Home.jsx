import React from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import AiTools from '../components/AiTools'
import Testimonials from '../components/Testimonials'
import Plan from '../components/Plan'
import Footer from '../components/Footer'
import CompanyLogo from '../components/CompanyLogo'
import DotGrid from '../components/ui/DotGrid'

const Home = () => {
  return (
    <div className="dark relative bg-[var(--background)] min-h-screen">
      {/* DotGrid Background Animation */}
      <div className="fixed inset-0 z-0" style={{ pointerEvents: 'none' }}>
        <DotGrid
          dotSize={5}
          gap={18}
          baseColor="#2a2a2a"
          activeColor="#fff000"
          proximity={120}
          shockRadius={250}
          shockStrength={5}
          resistance={750}
          returnDuration={1.5}
          style={{ pointerEvents: 'auto' }}
        />
      </div>

      {/* Main Content - Above the dot grid */}
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
