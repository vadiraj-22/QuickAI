import React from 'react'
import { assets } from '../assets/assets'
import { ArrowRight } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="w-full bg-black relative overflow-hidden border-t border-white/10 mt-24 text-gray-400">
      
      {/* Top Gold Gradient Border Line */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent pointer-events-none" />

      {/* Gold Mixed Ambient Radial Glow */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 size-[30rem] bg-amber-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 size-80 bg-amber-400/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-16 pb-12 space-y-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 text-left">
          
          {/* Left Column: Brand + Bio */}
          <div className="md:col-span-5 space-y-4">
            <img 
              className="h-8 w-auto cursor-pointer" 
              style={{ filter: 'brightness(0) saturate(100%) invert(68%) sepia(85%) saturate(500%) hue-rotate(1deg) brightness(105%) contrast(101%)' }} 
              src={assets.logo} 
              alt="QuickAI Logo"
            />
            <p className="text-sm text-gray-300 max-w-sm leading-relaxed">
              QuickAI is an all-in-one suite of high-performance AI tools crafted for creators, marketers, and developers. Build, refine, and scale with intelligent algorithms.
            </p>
            <div className='flex items-center gap-2 text-xs font-mono text-gray-400 pt-2'>
              <span className='size-2 rounded-full bg-emerald-400 animate-pulse' />
              <span>AI Models Status: Operational</span>
            </div>
          </div>

          {/* Middle Column: Quick Links */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="font-semibold text-white text-sm tracking-wider uppercase">Navigation</h4>
            <ul className="text-sm space-y-2.5">
              <li>
                <a href="#features" onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-amber-400 transition-colors">
                  AI Tools & Features
                </a>
              </li>
              <li>
                <a href="#testimonials" onClick={(e) => { e.preventDefault(); document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-amber-400 transition-colors">
                  Creator Reviews
                </a>
              </li>
              <li>
                <a href="#pricing" onClick={(e) => { e.preventDefault(); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-amber-400 transition-colors">
                  Pricing Plans
                </a>
              </li>
            </ul>
          </div>

          {/* Right Column: Newsletter */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="font-semibold text-white text-sm tracking-wider uppercase">Subscribe</h4>
            <p className="text-sm text-gray-300">Receive new feature updates, prompt guides, and AI tutorials direct to your inbox.</p>
            
            <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-2 pt-1">
              <input 
                type="email" 
                placeholder="Enter your email"
                className="bg-white/[0.05] border border-white/10 rounded-full px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/50 w-full"
              />
              <button 
                type="submit"
                className="bg-amber-400 hover:bg-amber-300 text-black font-bold px-5 py-2.5 rounded-full text-xs shrink-0 transition-all flex items-center gap-1 cursor-pointer shadow-[0_0_15px_rgba(251,191,36,0.3)]"
              >
                <span className="text-black font-bold">Subscribe</span>
                <ArrowRight className='size-3 text-black stroke-[3]' />
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-6 border-t border-white/10 text-center text-xs text-gray-400">
          <p>Copyright © 2026 QuickAI Studio. Built with React & MoltenMetal WebGL background.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer


