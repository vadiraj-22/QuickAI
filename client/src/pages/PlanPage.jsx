import React from 'react'
import Plan from '../components/Plan'
import { Crown, Sparkles } from 'lucide-react'

const PlanPage = () => {
  return (
    <div className='h-full flex flex-col p-6 overflow-y-auto' style={{ background: '#090912' }}>
      {/* Page Header */}
      <div className='flex items-center gap-3 mb-2 shrink-0 max-w-5xl mx-auto w-full'>
        <div
          className='w-10 h-10 rounded-2xl flex items-center justify-center shrink-0'
          style={{ background: 'rgba(245,158,11,0.2)', boxShadow: '0 0 20px rgba(245,158,11,0.25)' }}
        >
          <Crown className='w-5 h-5 text-amber-400' />
        </div>
        <div>
          <h1 className='text-xl font-bold text-white'>Subscription & Plans</h1>
          <p className='text-xs text-white/40'>Manage your membership and unlock unlimited AI features</p>
        </div>
      </div>

      {/* Plan Pricing Component */}
      <div className='flex-1'>
        <Plan />
      </div>
    </div>
  )
}

export default PlanPage
