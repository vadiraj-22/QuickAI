import React from 'react'
import { useUser, useClerk, Protect } from '@clerk/clerk-react'
import { Eraser, FileText, Hash, House, Image, LogOut, Scissors, SquarePen, Users, Sparkles, Crown } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/ai', label: 'Dashboard', Icon: House, gradient: 'from-[#3C81F6] to-[#60a5fa]', glow: 'rgba(60,129,246,0.25)' },
  { to: '/ai/write-article', label: 'Write Article', Icon: SquarePen, gradient: 'from-[#4A7AFF] to-[#818cf8]', glow: 'rgba(74,122,255,0.25)' },
  { to: '/ai/blog-titles', label: 'Blog Titles', Icon: Hash, gradient: 'from-[#8E37EB] to-[#C341F6]', glow: 'rgba(142,55,235,0.25)' },
  { to: '/ai/generate-images', label: 'Generate Images', Icon: Image, gradient: 'from-[#00AD25] to-[#4ade80]', glow: 'rgba(0,173,37,0.25)' },
  { to: '/ai/remove-background', label: 'Remove Background', Icon: Eraser, gradient: 'from-[#FF4938] to-[#F6AB41]', glow: 'rgba(255,73,56,0.25)' },
  { to: '/ai/remove-object', label: 'Remove Object', Icon: Scissors, gradient: 'from-[#8E37EB] to-[#4A7AFF]', glow: 'rgba(74,122,255,0.25)' },
  { to: '/ai/review-resume', label: 'Review Resume', Icon: FileText, gradient: 'from-[#009BB3] to-[#00DA83]', glow: 'rgba(0,218,131,0.25)' },
  { to: '/ai/community', label: 'Community', Icon: Users, gradient: 'from-[#f472b6] to-[#fb923c]', glow: 'rgba(244,114,182,0.25)' },
]

const Sidebar = ({ sidebar, setSidebar }) => {
  const { user } = useUser()
  const { signOut, openUserProfile } = useClerk()

  const userPlan = user?.publicMetadata?.plan || user?.unsafeMetadata?.plan || 'free'
  const isPremium = userPlan === 'premium'

  return (
    <aside
      className={`
        w-60 shrink-0 flex flex-col justify-between z-20 h-full
        max-sm:fixed max-sm:top-14 max-sm:bottom-0 max-sm:left-0
        transition-transform duration-300 ease-in-out
        ${sidebar ? 'max-sm:translate-x-0' : 'max-sm:-translate-x-full'}
      `}
      style={{
        background: 'rgba(13,13,26,0.95)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Nav items */}
      <div className='flex-1 overflow-y-auto py-4 px-3'>
        {/* Section label */}
        <p className='text-[10px] font-semibold tracking-widest text-white/25 uppercase px-3 mb-3'>
          AI Tools
        </p>

        <nav className='flex flex-col gap-0.5'>
          {navItems.map(({ to, label, Icon, gradient, glow }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/ai'}
              onClick={() => setSidebar(false)}
              className='group relative'
            >
              {({ isActive }) => (
                <div
                  className='flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer'
                  style={
                    isActive
                      ? {
                          background: `linear-gradient(135deg, ${glow}, rgba(255,255,255,0.04))`,
                          boxShadow: `0 0 20px ${glow}`,
                          border: '1px solid rgba(255,255,255,0.1)',
                        }
                      : {
                          border: '1px solid transparent',
                        }
                  }
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                      e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = ''
                      e.currentTarget.style.border = '1px solid transparent'
                    }
                  }}
                >
                  {/* Icon with gradient when active */}
                  <span
                    className={`w-7 h-7 flex items-center justify-center rounded-lg shrink-0 transition-all duration-200 ${
                      isActive ? `bg-gradient-to-br ${gradient}` : 'bg-white/6'
                    }`}
                  >
                    <Icon className='w-3.5 h-3.5 text-white' />
                  </span>

                  <span
                    className={`text-sm font-medium transition-colors duration-200 ${
                      isActive ? 'text-white' : 'text-white/50 group-hover:text-white/80'
                    }`}
                  >
                    {label}
                  </span>

                  {/* Active dot */}
                  {isActive && (
                    <span
                      className={`ml-auto w-1.5 h-1.5 rounded-full bg-gradient-to-br ${gradient} shrink-0`}
                    />
                  )}
                </div>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User footer */}
      <div
        className='p-1.5 shrink-0'
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div
          className='flex items-center justify-between gap-2 p-1.5 rounded-xl cursor-pointer transition-all duration-200 group'
          onClick={openUserProfile}
          style={{ border: '1px solid transparent' }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
            e.currentTarget.style.border = '1px solid rgba(255,255,255,0.07)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = ''
            e.currentTarget.style.border = '1px solid transparent'
          }}
        >
          <div className='flex items-center gap-2.5 min-w-0'>
            <div className='relative shrink-0'>
              <img
                src={user.imageUrl}
                className='w-8 h-8 rounded-full object-cover ring-1 ring-white/20'
                alt='avatar'
              />
              <span className='absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-[#0d0d1a]' />
            </div>
            <div className='min-w-0'>
              <p className='text-sm font-medium text-white/90 truncate leading-tight'>
                {user.fullName}
              </p>
              <p className='text-[11px] text-white/40 leading-tight flex items-center gap-1'>
                {isPremium ? (
                  <>
                    <Crown className='w-2.5 h-2.5 text-amber-400' />
                    <span className='text-amber-400 font-semibold'>Premium</span>
                  </>
                ) : (
                  <span>Free Plan</span>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={e => { e.stopPropagation(); signOut() }}
            className='shrink-0 w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-200 text-white/30 hover:text-red-400 hover:bg-red-500/10'
            title='Sign out'
          >
            <LogOut className='w-3.5 h-3.5' />
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
