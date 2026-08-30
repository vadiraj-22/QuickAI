import { useEffect, useState } from 'react'
import { useUser, useAuth } from '@clerk/clerk-react'
import { Heart, ImageIcon, Users } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL || 'https://quickaibackend-five.vercel.app'

const Community = () => {
  const [creations, setCreations] = useState([])
  const { user } = useUser()
  const [loading, setLoading] = useState(true)
  const { getToken } = useAuth()

  const fetchCreations = async () => {
    try {
      const { data } = await axios.get('/api/user/get-published-creations', {
        headers: { Authorization: `Bearer ${await getToken()}` },
      })
      if (data.success) {
        setCreations(data.creations)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
    setLoading(false)
  }

  const imageLikeToggle = async id => {
    try {
      const { data } = await axios.post('/api/user/toggle-like-creations', { id }, {
        headers: { Authorization: `Bearer ${await getToken()}` },
      })
      if (data.success) {
        toast.success(data.message)
        await fetchCreations()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (user) fetchCreations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  if (loading) {
    return (
      <div className='h-full flex items-center justify-center' style={{ background: '#090912' }}>
        <div
          className='w-10 h-10 rounded-full border-2 border-t-transparent animate-spin'
          style={{ borderColor: 'rgba(244,114,182,0.4)', borderTopColor: 'transparent' }}
        />
      </div>
    )
  }

  return (
    <div className='h-full overflow-y-auto p-6' style={{ background: '#090912' }}>

      {/* Page header */}
      <div className='flex items-center gap-3 mb-6'>
        <div
          className='w-10 h-10 rounded-2xl flex items-center justify-center shrink-0'
          style={{ background: 'rgba(244,114,182,0.15)', boxShadow: '0 0 20px rgba(244,114,182,0.15)' }}
        >
          <Users className='w-5 h-5 text-pink-400' />
        </div>
        <div>
          <h1 className='text-xl font-bold text-white'>Community</h1>
          <p className='text-xs text-white/40'>
            Explore and like images created by the community
          </p>
        </div>
      </div>

      {creations.length === 0 ? (
        <div
          className='flex flex-col items-center justify-center py-24 rounded-2xl'
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <ImageIcon className='w-12 h-12 text-white/15 mb-4' />
          <p className='text-white/30 text-sm'>No community images yet. Be the first to publish!</p>
        </div>
      ) : (
        /* Masonry-style grid */
        <div className='columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4'>
          {creations.map((creation, index) => (
            <div
              key={index}
              className='break-inside-avoid group relative rounded-2xl overflow-hidden'
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <img
                src={creation.content}
                alt={creation.prompt}
                className='w-full h-auto block'
                loading='lazy'
              />

              {/* Hover overlay */}
              <div className='absolute inset-0 flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200' style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)' }}>
                <p className='text-xs text-white/80 line-clamp-2 mb-2 leading-relaxed'>
                  {creation.prompt}
                </p>
                <div className='flex items-center justify-end gap-1.5'>
                  <span className='text-sm font-semibold text-white'>
                    {creation.likes.length}
                  </span>
                  <button
                    onClick={() => imageLikeToggle(creation.id)}
                    className='flex items-center transition-transform hover:scale-110 active:scale-95'
                  >
                    <Heart
                      className='w-5 h-5 transition-colors'
                      style={
                        creation.likes.includes(user?.id)
                          ? { fill: '#f43f5e', color: '#f43f5e' }
                          : { fill: 'transparent', color: 'rgba(255,255,255,0.7)' }
                      }
                    />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Community
