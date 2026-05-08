import React, { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { Menu, X } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { SignIn, useUser } from '@clerk/clerk-react'
 


const Layout = () => {
  const navigate =useNavigate()
  const [sidebar, setSidebar]=useState(false)
  const {user} =useUser();

  return user ? (
    <div className='dark flex flex-col items-start justify-start h-screen bg-[var(--background)] overflow-hidden'>
     <nav className='w-full px-8 min-h-14 flex items-center justify-between border-b border-[var(--border)] bg-[var(--card)]/50 backdrop-blur-xl'>
      <img src={assets.logo} className='cursor-pointer w-32 sm:w-44' style={{ filter: 'brightness(0) saturate(100%) invert(68%) sepia(85%) saturate(500%) hue-rotate(1deg) brightness(105%) contrast(101%)' }} alt="" onClick={()=>navigate('/')} />
      { 
        sidebar ? <X onClick={()=>setSidebar(false)} className='w-6 h-6 text-[var(--foreground)] sm:hidden'/>
        : <Menu  onClick={()=>setSidebar(true)} className='w-6 h-6 text-[var(--foreground)] sm:hidden'/>
      }
     </nav>

      <div className='flex-1 w-full flex h-[calc(100vh-64px)] overflow-hidden'>
          <Sidebar sidebar={sidebar} setSidebar={setSidebar}/>
          <div className='flex-1 bg-[var(--background)] overflow-hidden'>
            <Outlet/>
          </div>
      </div>

    </div>
  ) : (
    <div className='dark flex items-center justify-center h-screen bg-[var(--background)]'>
      <SignIn/>
    </div>
  )
}

export default Layout
