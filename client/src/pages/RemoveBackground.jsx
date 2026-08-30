import { Eraser, Sparkles, Upload } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth, useUser } from '@clerk/clerk-react'
import toast from 'react-hot-toast'
import LoadingOverlay, { PIPELINE_MESSAGES } from '../components/LoadingOverlay'

async function downloadImage(url, filename = 'image.png') {
  const response = await fetch(url, { mode: 'cors' })
  const blob = await response.blob()
  const blobUrl = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = blobUrl
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(blobUrl)
}

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png']

const ACCENT = '#FF4938'
const ACCENT_GLOW = 'rgba(255,73,56,0.2)'

const RemoveBackground = () => {
  const [input, setInput] = useState(null)
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')
  const [formatError, setFormatError] = useState('')
  const [bgRemovalUsage, setBgRemovalUsage] = useState(0)
  const [isPremium, setIsPremium] = useState(false)
  const { getToken } = useAuth()
  const { user } = useUser()

  const effectiveIsPremium = user?.publicMetadata?.plan === 'premium' || isPremium;

  const fetchUsageData = async () => {
    try {
      const { data } = await axios.get('/api/user/get-usage-data', {
        headers: { Authorization: `Bearer ${await getToken()}` },
      })
      if (data.success) {
        setBgRemovalUsage(data.bgRemovalUsage || 0)
        setIsPremium(data.isPremium || false)
      }
    } catch (error) {
      console.error('Error fetching usage data:', error)
    }
  }

  useEffect(() => { fetchUsageData() }, [user])

  const onSubmitHandler = async e => {
    e.preventDefault()
    if (!input) { toast.error('Please select an image.'); return }
    if (!ALLOWED_TYPES.includes(input.type)) {
      setFormatError(`"${input.name}" is not supported. Please upload a JPG or PNG.`)
      toast.error('Invalid file format.')
      return
    }
    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('image', input)
      const { data } = await axios.post('/api/ai/remove-image-background', formData, {
        headers: { Authorization: `Bearer ${await getToken()}` },
      })
      if (data && data.success) {
        if (!effectiveIsPremium) setBgRemovalUsage(prev => prev + 1)
        setContent(data.content)
      } else {
        toast.error(data?.message || 'Failed to remove background')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Server error occurred')
    } finally {
      setLoading(false)
    }
  }

  const remainingUses = effectiveIsPremium ? 'Unlimited' : Math.max(0, 5 - bgRemovalUsage)
  const canRemove = effectiveIsPremium || bgRemovalUsage < 5

  const panelStyle = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    backdropFilter: 'blur(20px)',
  }

  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  }

  return (
    <div className='h-full flex flex-col p-6 overflow-hidden' style={{ background: '#090912' }}>
      <LoadingOverlay visible={loading} accentColor={ACCENT} messages={PIPELINE_MESSAGES.removeBackground} />

      {/* Page header */}
      <div className='flex items-center gap-3 mb-6 shrink-0'>
        <div
          className='w-10 h-10 rounded-2xl flex items-center justify-center shrink-0'
          style={{ background: `${ACCENT}25`, boxShadow: `0 0 20px ${ACCENT_GLOW}` }}
        >
          <Eraser className='w-5 h-5' style={{ color: ACCENT }} />
        </div>
        <div>
          <h1 className='text-xl font-bold text-white'>Remove Background</h1>
          <p className='text-xs text-white/40'>Extract image subjects automatically with AI</p>
        </div>
      </div>

      <div className='flex-1 flex flex-col lg:flex-row items-stretch gap-6 min-h-0 overflow-y-auto lg:overflow-hidden'>
        {/* Left — config panel */}
        <form
          onSubmit={onSubmitHandler}
          className='w-full lg:w-1/2 max-w-xl p-5 rounded-2xl flex flex-col gap-4 shrink-0 lg:shrink overflow-y-auto'
          style={{ ...panelStyle, borderTop: `2px solid ${ACCENT}` }}
        >
          <div className='flex items-center gap-2'>
            <Sparkles className='w-4 h-4' style={{ color: ACCENT }} />
            <h2 className='text-base font-semibold text-white'>AI Background Remover</h2>
          </div>

          {/* Usage indicator */}
          <div className='p-3 rounded-xl' style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className='flex justify-between items-center mb-2'>
              <span className='text-xs text-white/50'>Free uses remaining</span>
              <span className='text-sm font-semibold' style={{ color: ACCENT }}>{remainingUses}</span>
            </div>
            {!effectiveIsPremium && (
              <div className='w-full rounded-full h-1.5' style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div
                  className='h-1.5 rounded-full transition-all duration-300'
                  style={{ width: `${(bgRemovalUsage / 5) * 100}%`, background: `linear-gradient(90deg, ${ACCENT}, #F6AB41)` }}
                />
              </div>
            )}
          </div>

          {/* File input */}
          <div>
            <label className='block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider'>Upload Image</label>
            <label
              className='flex flex-col items-center justify-center gap-2 w-full py-8 rounded-xl cursor-pointer transition-all duration-200'
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.15)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = `${ACCENT}60`}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
            >
              <Upload className='w-6 h-6 text-white/30' />
              <span className='text-sm text-white/40'>
                {input ? input.name : 'Click to upload JPG or PNG'}
              </span>
              <input
                type='file'
                accept='*'
                className='sr-only'
                onChange={e => {
                  const file = e.target.files[0]
                  if (!file) return
                  if (!ALLOWED_TYPES.includes(file.type)) {
                    setFormatError(`"${file.name}" not supported. Use JPG or PNG.`)
                    toast.error('Invalid format.')
                    setInput(null)
                    e.target.value = ''
                    return
                  }
                  setFormatError('')
                  setInput(file)
                }}
              />
            </label>
            {formatError && <p className='text-xs text-red-400 mt-2'>{formatError}</p>}
            <p className='text-xs text-white/25 mt-1'>Supports JPG, JPEG, PNG</p>
          </div>

          <button
            disabled={loading || !canRemove}
            className='w-full flex justify-center items-center gap-2 py-3 mt-auto rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-50'
            style={{ background: `linear-gradient(135deg, ${ACCENT}, #F6AB41)`, boxShadow: `0 4px 20px ${ACCENT_GLOW}` }}
          >
            {loading
              ? <span className='w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin' />
              : <Eraser className='w-4 h-4' />
            }
            Remove Background
          </button>

          {!effectiveIsPremium && bgRemovalUsage >= 5 && (
            <div className='p-3 rounded-xl text-sm' style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.3)' }}>
              <p className='text-amber-300/80'>
                You've used all free background removals.{' '}
                <a href='/#pricing' className='text-amber-400 hover:underline'>Upgrade to Premium</a>
              </p>
            </div>
          )}
        </form>

        {/* Right — output panel */}
        <div
          className='w-full lg:w-1/2 max-w-xl p-5 rounded-2xl flex flex-col min-h-[300px] lg:min-h-0 flex-1 min-w-0'
          style={panelStyle}
        >
          <div className='flex items-center gap-2 mb-4 shrink-0'>
            <Eraser className='w-4 h-4' style={{ color: ACCENT }} />
            <h2 className='text-base font-semibold text-white'>Processed Image</h2>
          </div>

          {!content ? (
            <div className='flex-1 flex flex-col items-center justify-center gap-3 text-white/20'>
              <Eraser className='w-10 h-10' />
              <p className='text-sm text-center'>Upload an image and click "Remove Background" to get started</p>
            </div>
          ) : (
            <div className='flex-1 flex flex-col gap-3'>
              <img
                src={content}
                alt='processed'
                className='w-full rounded-xl object-contain'
                style={{ background: 'repeating-conic-gradient(rgba(255,255,255,0.05) 0% 25%, transparent 0% 50%) 0 0 / 20px 20px' }}
                onLoad={() => setLoading(false)}
                onError={() => setLoading(false)}
              />
              <button
                onClick={() => downloadImage(content, 'background-removed.png')}
                className='w-full py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity'
                style={{ background: `linear-gradient(135deg, ${ACCENT}, #F6AB41)`, boxShadow: `0 4px 20px ${ACCENT_GLOW}` }}
              >
                Download Image
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RemoveBackground
