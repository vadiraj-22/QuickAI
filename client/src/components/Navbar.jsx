import React, { useState, useEffect } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Menu, X } from 'lucide-react'
import { useClerk, useUser, UserButton } from '@clerk/clerk-react'

const Navbar = () => {
    const navigate = useNavigate()
    const { user } = useUser()
    const { openSignIn } = useClerk()
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
      {/* Dynamic Island Navbar matching feature cards style */}
      <div className='fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4'>
        <nav className={`
          flex justify-between items-center
          w-full max-w-7xl
          transition-all duration-300 ease-out
          bg-white/[0.04] backdrop-blur-2xl border border-white/10 shadow-2xl rounded-full
          ${scrolled ? 'px-6 py-3 bg-black/40 border-white/15' : 'px-8 py-4'}
        `}
        style={{
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.7)'
        }}
        >
          {/* Logo */}
          <img 
            src={assets.logo} 
            alt="QuickAI Logo" 
            className={`cursor-pointer transition-all duration-300 drop-shadow-md ${scrolled ? 'w-28 sm:w-36' : 'w-32 sm:w-40'}`}
            style={{ filter: 'brightness(0) saturate(100%) invert(68%) sepia(85%) saturate(500%) hue-rotate(1deg) brightness(105%) contrast(101%)' }}
            onClick={()=>navigate('/')} 
          />

          {/* Desktop Navigation Links - Centered */}
          <div className='hidden md:flex items-center gap-8 text-sm font-medium text-gray-300 absolute left-1/2 -translate-x-1/2'>
            <a 
              href="/#features" 
              onClick={(e) => {
                if (window.location.pathname === '/') {
                  e.preventDefault();
                  const element = document.getElementById('features');
                  if (element) {
                    const top = element.getBoundingClientRect().top + window.scrollY - 100;
                    window.scrollTo({ top, behavior: 'smooth' });
                  }
                }
              }}
              className='hover:text-white transition-colors cursor-pointer'
            >
              Features
            </a>
            <a 
              href="/#testimonials" 
              onClick={(e) => {
                if (window.location.pathname === '/') {
                  e.preventDefault();
                  const element = document.getElementById('testimonials');
                  if (element) {
                    const top = element.getBoundingClientRect().top + window.scrollY - 100;
                    window.scrollTo({ top, behavior: 'smooth' });
                  }
                }
              }}
              className='hover:text-white transition-colors cursor-pointer'
            >
              Testimonials
            </a>
            <a 
              href="/#pricing" 
              onClick={(e) => {
                if (window.location.pathname === '/') {
                  e.preventDefault();
                  const element = document.getElementById('pricing');
                  if (element) {
                    const top = element.getBoundingClientRect().top + window.scrollY - 100;
                    window.scrollTo({ top, behavior: 'smooth' });
                  }
                }
              }}
              className='hover:text-white transition-colors cursor-pointer'
            >
              Pricing
            </a>
          </div>

          {/* CTA Button */}
          <div className='flex items-center gap-3'>
            {user ? (
              <div className='scale-105 hover:scale-110 transition-transform'>
                <UserButton />
              </div>
            ) : (
              <button 
                onClick={() => navigate('/ai')} 
                className='flex items-center gap-2 rounded-full text-xs sm:text-sm font-semibold cursor-pointer bg-amber-400 hover:bg-amber-300 text-gray-950 px-5 py-2.5 shadow-[0_0_20px_rgba(251,191,36,0.25)] hover:shadow-[0_0_25px_rgba(251,191,36,0.4)] active:scale-95 transition-all duration-200'
              >
                <span className='whitespace-nowrap'>Get Started</span>
                <ArrowRight className='w-4 h-4 hidden sm:block'/>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className='md:hidden p-2 hover:bg-white/10 rounded-full transition-colors text-gray-200'
            >
              {mobileMenuOpen ? <X className='w-5 h-5' /> : <Menu className='w-5 h-5' />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu Dropdown matching card style */}
      <div className={`
        fixed top-24 left-4 right-4 z-40 md:hidden
        bg-black/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10
        overflow-hidden transition-all duration-300 ease-out
        ${mobileMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}
      `}
      >
        <div className='flex flex-col p-6 gap-4'>
          <a 
            href="/#features" 
            onClick={(e) => {
              if (window.location.pathname === '/') {
                e.preventDefault();
                const element = document.getElementById('features');
                if (element) {
                  const top = element.getBoundingClientRect().top + window.scrollY - 100;
                  window.scrollTo({ top, behavior: 'smooth' });
                }
                setMobileMenuOpen(false);
              }
            }}
            className='text-gray-200 hover:text-white font-medium py-2 px-4 hover:bg-white/10 rounded-xl transition-all cursor-pointer'
          >
            Features
          </a>
          <a 
            href="/#testimonials" 
            onClick={(e) => {
              if (window.location.pathname === '/') {
                e.preventDefault();
                const element = document.getElementById('testimonials');
                if (element) {
                  const top = element.getBoundingClientRect().top + window.scrollY - 100;
                  window.scrollTo({ top, behavior: 'smooth' });
                }
                setMobileMenuOpen(false);
              }
            }}
            className='text-gray-200 hover:text-white font-medium py-2 px-4 hover:bg-white/10 rounded-xl transition-all cursor-pointer'
          >
            Testimonials
          </a>
          <a 
            href="/#pricing" 
            onClick={(e) => {
              if (window.location.pathname === '/') {
                e.preventDefault();
                const element = document.getElementById('pricing');
                if (element) {
                  const top = element.getBoundingClientRect().top + window.scrollY - 100;
                  window.scrollTo({ top, behavior: 'smooth' });
                }
                setMobileMenuOpen(false);
              }
            }}
            className='text-gray-200 hover:text-white font-medium py-2 px-4 hover:bg-white/10 rounded-xl transition-all cursor-pointer'
          >
            Pricing
          </a>
        </div>
      </div>
    </>
  )
}

export default Navbar


