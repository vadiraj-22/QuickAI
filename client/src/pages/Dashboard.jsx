import React, { useEffect, useState } from 'react'
import { dummyCreationData } from '../assets/assets'
import { Gem, Sparkles, TrendingUp, Zap } from 'lucide-react'
import { useUser, useAuth } from '@clerk/clerk-react'
import CreationItem from '../components/CreationItem'
import axios from 'axios'
import toast from 'react-hot-toast'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL || 'https://quickaibackend-five.vercel.app'

const StatCard = ({ label, value, icon: Icon, gradient, glow }) => (
  <div
    className='flex items-center justify-between p-5 rounded-2xl min-w-52 flex-1'
    style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      backdropFilter: 'blur(20px)',
    }}
  >
    <div>
      <p className='text-xs font-medium text-white/40 uppercase tracking-wider mb-1'>{label}</p>
      <h2 className='text-3xl font-bold text-white'>{value}</h2>
    </div>
    <div
      className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${gradient}`}
      style={{ boxShadow: `0 0 20px ${glow}` }}
    >
      <Icon className='w-5 h-5 text-white' />
    </div>
  </div>
)

const Dashboard = () => {
  const [creations, setCreations] = useState([])
  const [loading, setLoading] = useState(true)
  const [isPremium, setIsPremium] = useState(false)
  const { user } = useUser()
  const { getToken } = useAuth()

  const getDashboardData = async () => {
    try {
      const token = await getToken()
      const [creationsRes, usageRes] = await Promise.all([
        axios.get('/api/user/get-user-creations', { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: { success: false } })),
        axios.get('/api/user/get-usage-data', { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: { success: false } }))
      ])

      if (creationsRes.data?.success) {
        setCreations(creationsRes.data.creations)
      }
      
      if (usageRes.data && usageRes.data.success) {
        setIsPremium(!!usageRes.data.isPremium)
      } else {
        const userPlan = user?.publicMetadata?.plan || user?.unsafeMetadata?.plan
        setIsPremium(userPlan === 'premium')
      }
    } catch (error) {
      toast.error(error.message)
    }
    setLoading(false)
  }

  useEffect(() => {
    getDashboardData()
  }, [user])

  return (
    <div className='h-full overflow-y-auto p-6' style={{ background: '#090912' }}>

      {/* Page header */}
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-white'>Dashboard</h1>
        <p className='text-sm text-white/40 mt-0.5'>Track your creations and account status</p>
      </div>

      {/* Stat cards */}
      <div className='flex flex-wrap gap-4 mb-8'>
        <StatCard
          label='Total Creations'
          value={creations.length}
          icon={Sparkles}
          gradient='from-[#3C81F6] to-[#0BB0D7]'
          glow='rgba(60,129,246,0.4)'
        />
        <StatCard
          label='Active Plan'
          value={isPremium ? 'Premium' : 'Free'}
          icon={Gem}
          gradient='from-[#FF61C5] to-[#9E53EE]'
          glow='rgba(255,97,197,0.4)'
        />
      </div>

      {/* Creations list */}
      {loading ? (
        <div className='flex justify-center items-center h-48'>
          <div
            className='w-10 h-10 rounded-full border-2 border-t-transparent animate-spin'
            style={{ borderColor: 'rgba(129,140,248,0.5)', borderTopColor: 'transparent' }}
          />
        </div>
      ) : (
        <div>
          <p className='text-xs font-semibold text-white/30 uppercase tracking-widest mb-4'>
            Recent Creations
          </p>
          <div className='flex flex-col gap-3'>
            {creations.length === 0 ? (
              <div
                className='flex flex-col items-center justify-center py-16 rounded-2xl'
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <Sparkles className='w-10 h-10 text-white/15 mb-3' />
                <p className='text-white/30 text-sm'>No creations yet. Start creating!</p>
              </div>
            ) : (
              creations.map(item => <CreationItem key={item.id} item={item} />)
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
