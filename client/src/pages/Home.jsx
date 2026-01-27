import React from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import AiTools from '../components/AiTools'
import Testimonials from '../components/Testimonials'
import Plan from '../components/Plan'
import Footer from '../components/Footer'
import CompanyLogo from '../components/CompanyLogo'

const Home = () => {
  return (
    <div>
      <Navbar/>
      <Hero/>
      <CompanyLogo/>
      <AiTools/>
      <Testimonials/>
      <Plan/>
      <Footer/>
    </div>
  )
}

export default Home