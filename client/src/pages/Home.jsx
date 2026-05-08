import React from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import AiTools from '../components/AiTools'
import Testimonials from '../components/Testimonials'
import Plan from '../components/Plan'
import Footer from '../components/Footer'
import CompanyLogo from '../components/CompanyLogo'
import TubesCursor from '../components/ui/tubes-cursor'

const Home = () => {
  return (
    <div className="dark relative bg-[var(--background)] min-h-screen">
      {/* Tubes Cursor Animation - Background Layer */}
      <TubesCursor />
      
      {/* Main Content - Above the cursor animation */}
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
