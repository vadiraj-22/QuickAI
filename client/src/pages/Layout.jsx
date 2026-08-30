import React, { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { Menu, X } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { RedirectToSignIn, useUser } from '@clerk/clerk-react'

const Layout = () => {
  const navigate = useNavigate()
  const [sidebar, setSidebar] = useState(false)
  const { user } = useUser()

  return user ? (
    <div className='dark flex flex-col h-screen overflow-hidden' style={{ background: '#090912' }}>

      {/* Top Navbar */}
      <nav
        className='w-full px-6 h-14 flex items-center justify-between shrink-0 z-20'
        style={{
          background: 'rgba(9,9,18,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Logo */}
        <img
          src={assets.logo}
          className='cursor-pointer h-7 w-auto'
          style={{
            filter:
              'brightness(0) saturate(100%) invert(68%) sepia(85%) saturate(500%) hue-rotate(1deg) brightness(105%) contrast(101%)',
          }}
          alt='QuickAI'
          onClick={() => navigate('/')}
        />

        {/* Mobile hamburger */}
        <button
          onClick={() => setSidebar(s => !s)}
          className='sm:hidden w-9 h-9 flex items-center justify-center rounded-lg transition-colors'
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {sidebar
            ? <X className='w-4 h-4 text-white' />
            : <Menu className='w-4 h-4 text-white' />
          }
        </button>
      </nav>

      {/* Body */}
      <div className='flex flex-1 overflow-hidden'>
        <Sidebar sidebar={sidebar} setSidebar={setSidebar} />

        {/* Main content area */}
        <main
          className='flex-1 overflow-hidden'
          style={{ background: '#090912' }}
        >
          <Outlet />
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebar && (
        <div
          className='sm:hidden fixed inset-0 z-10 bg-black/60 backdrop-blur-sm'
          onClick={() => setSidebar(false)}
        />
      )}
    </div>
  ) : (
    <RedirectToSignIn redirectUrl='/ai' />
  )
}

export default Layout
