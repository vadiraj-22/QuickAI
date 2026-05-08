import React, { useState, useEffect } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Menu, X } from 'lucide-react'
import {useClerk, useUser, UserButton} from '@clerk/clerk-react'

const Navbar = () => {
    const navigate = useNavigate()
    const {user}=useUser()
    const {openSignIn}=useClerk()
    const [scrolled, setScrolled] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    useEffect(() => {
      const handleScroll = () => {
        setScrolled(window.scrollY > 20)
      }
      window.addEventListener('scroll', handleScroll)
      return () => window.removeEventListener('scroll', handleScroll)
    }, [])

  return (
    <>
      {/* Dynamic Island Navbar with Liquid Glass Effect */}
      <div className='fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4'>
        <nav className={`
          flex justify-between items-center
          w-full max-w-7xl
          transition-all duration-500 ease-out
          ${scrolled 
            ? 'bg-gray-700/70 backdrop-blur-3xl shadow-2xl border border-gray-600/40 rounded-full px-6 py-3' 
            : 'bg-gray-700/60 backdrop-blur-2xl border border-gray-600/30 rounded-full px-8 py-4'
          }
        `}
        style={{
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          boxShadow: scrolled 
            ? '0 20px 60px -15px rgba(0, 0, 0, 0.6), 0 10px 30px -10px rgba(0, 0, 0, 0.4)' 
            : '0 15px 50px -12px rgba(0, 0, 0, 0.5), 0 8px 25px -8px rgba(0, 0, 0, 0.3)'
        }}
        >
          {/* Logo */}
          <img 
            src={assets.logo} 
            alt="Logo" 
            className={`cursor-pointer transition-all duration-300 drop-shadow-lg ${scrolled ? 'w-28 sm:w-36' : 'w-32 sm:w-44'}`}
            style={{ filter: 'brightness(0) saturate(100%) invert(68%) sepia(85%) saturate(500%) hue-rotate(1deg) brightness(105%) contrast(101%)' }}
            onClick={()=>navigate('/')} 
          />

          {/* Desktop Navigation Links - Centered */}
          <div className='hidden md:flex items-center gap-8 text-sm font-medium text-gray-200 absolute left-1/2 -translate-x-1/2'>
            <a 
              href="#features" 
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className='hover:text-white transition-colors duration-200 cursor-pointer hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]'
            >
              Features
            </a>
            <a 
              href="#testimonials" 
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className='hover:text-white transition-colors duration-200 cursor-pointer hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]'
            >
              Testimonials
            </a>
            <a 
              href="#pricing" 
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className='hover:text-white transition-colors duration-200 cursor-pointer hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]'
            >
              Pricing
            </a>
          </div>

          {/* CTA Button */}
          <div className='flex items-center gap-3'>
            {user ? (
              <div className='scale-110 hover:scale-125 transition-transform duration-200'>
                <UserButton />
              </div>
            ) : (
              <button 
                onClick={openSignIn} 
                className='flex items-center gap-2 rounded-full text-sm font-medium cursor-pointer bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-gray-900 px-4 sm:px-8 py-2.5 shadow-lg active:scale-95 transition-all duration-200'
                style={{ boxShadow: '0 10px 30px -10px rgba(251, 191, 36, 0.6)' }}
              >
                <span className='whitespace-nowrap'>Get Started</span>
                <ArrowRight className='w-4 h-4 hidden sm:block'/>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className='md:hidden p-2 hover:bg-white/10 rounded-full transition-colors duration-200 text-gray-200'
            >
              {mobileMenuOpen ? <X className='w-5 h-5' /> : <Menu className='w-5 h-5' />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu Dropdown with Liquid Glass Effect */}
      <div className={`
        fixed top-24 left-4 right-4 z-40 md:hidden
        bg-gray-700/80 backdrop-blur-3xl rounded-3xl shadow-2xl border border-gray-600/40
        overflow-hidden transition-all duration-300 ease-out
        ${mobileMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}
      `}
      style={{
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        boxShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.6), 0 10px 30px -10px rgba(0, 0, 0, 0.4)'
      }}
      >
        <div className='flex flex-col p-6 gap-4'>
          <a 
            href="#features" 
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              setMobileMenuOpen(false);
            }}
            className='text-gray-200 hover:text-white font-medium py-2 px-4 hover:bg-white/10 rounded-xl transition-all duration-200 cursor-pointer'
          >
            Features
          </a>
          <a 
            href="#testimonials" 
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' });
              setMobileMenuOpen(false);
            }}
            className='text-gray-200 hover:text-white font-medium py-2 px-4 hover:bg-white/10 rounded-xl transition-all duration-200 cursor-pointer'
          >
            Testimonials
          </a>
          <a 
            href="#pricing" 
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
              setMobileMenuOpen(false);
            }}
            className='text-gray-200 hover:text-white font-medium py-2 px-4 hover:bg-white/10 rounded-xl transition-all duration-200 cursor-pointer'
          >
            Pricing
          </a>
        </div>
      </div>
    </>
  )
}

export default Navbar

