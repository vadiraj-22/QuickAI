import { Image, Sparkles } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth, useUser } from '@clerk/clerk-react'
import toast from 'react-hot-toast'
import LoadingOverlay, { PIPELINE_MESSAGES } from '../components/LoadingOverlay'

import { handleApiError, handleApiResponse } from '../lib/errorHandler'

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

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL || 'https://quickaibackend-five.vercel.app'

const ACCENT = '#00AD25'
const ACCENT_GLOW = 'rgba(0,173,37,0.2)'

const GenerateImages = () => {
  const imageStyles = ['Realistic', 'Ghibli Style', 'Anime Style', 'Cartoon Style', 'Fantasy Style', 'Realistic Style', '3D Style', 'Portrait Style']

  const [selectedStyle, setSelectedStyle] = useState('Realistic')
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')
  const [usageCount, setUsageCount] = useState(0)
  const [isPremium, setIsPremium] = useState(false)
  const [publish, setPublish] = useState(false)
  const { getToken } = useAuth()
  const { user } = useUser()

  const effectiveIsPremium = isPremium || user?.publicMetadata?.plan === 'premium' || user?.unsafeMetadata?.plan === 'premium';

  const fetchUsageData = async () => {
    try {
      const { data } = await axios.get('/api/user/get-usage-data', {
        headers: { Authorization: `Bearer ${await getToken()}` },
      })
      if (data.success) {
        setUsageCount(data.usageCount || 0)
        setIsPremium(data.isPremium || false)
      }
    } catch (error) {
      console.error('Error fetching usage data:', error)
    }
  }

  useEffect(() => { fetchUsageData() }, [user])

  const onSubmitHandler = async e => {
    e.preventDefault()
    try {
      setLoading(true)
      const prompt = `Generate an Image of ${input} in the style ${selectedStyle}`
      const token = await getToken()
      const { data } = await axios.post('/api/ai/generate-image', { prompt, publish }, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 55000
      })
      const result = handleApiResponse(data, 'Image Generation')
      if (result.success) {
        if (!effectiveIsPremium) setUsageCount(prev => prev + 1)
        setContent(result.content)
      }
    } catch (error) {
      handleApiError(error, 'Image Generation')
    } finally {
      setLoading(false)
    }
  }

  const remainingImages = effectiveIsPremium ? 'Unlimited' : Math.max(0, 5 - usageCount)
  const canGenerate = effectiveIsPremium || usageCount < 5

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
    resize: 'none',
  }

  return (
    <div className='h-full flex flex-col p-6 overflow-hidden' style={{ background: '#090912' }}>
      <LoadingOverlay visible={loading} accentColor={ACCENT} messages={PIPELINE_MESSAGES.generateImage} />

      {/* Page header */}
      <div className='flex items-center gap-3 mb-6 shrink-0'>
        <div
          className='w-10 h-10 rounded-2xl flex items-center justify-center shrink-0'
          style={{ background: `${ACCENT}25`, boxShadow: `0 0 20px ${ACCENT_GLOW}` }}
        >
          <Image className='w-5 h-5' style={{ color: ACCENT }} />
        </div>
        <div>
          <h1 className='text-xl font-bold text-white'>Generate Images</h1>
          <p className='text-xs text-white/40'>Create stunning AI-generated images from text</p>
        </div>
      </div>

      <div className='flex-1 flex flex-col lg:flex-row items-stretch gap-6 min-h-0 overflow-y-auto lg:overflow-hidden'>
        {/* Left — config panel */}
        <form
          onSubmit={onSubmitHandler}
          className='w-full lg:w-1/2 max-w-xl p-5 rounded-2xl flex flex-col gap-5 shrink-0 lg:shrink overflow-y-auto'
          style={{ ...panelStyle, borderTop: `2px solid ${ACCENT}` }}
        >
          <div className='flex items-center gap-2'>
            <Sparkles className='w-4 h-4' style={{ color: ACCENT }} />
            <h2 className='text-base font-semibold text-white'>AI Image Generator</h2>
          </div>

          {/* Usage indicator */}
          <div className='p-3 rounded-xl' style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className='flex justify-between items-center text-sm mb-2'>
              <span className='text-white/50 text-xs'>Images remaining</span>
              <span className='font-semibold text-sm' style={{ color: effectiveIsPremium ? '#4ade80' : ACCENT }}>
                {remainingImages}
              </span>
            </div>
            {!effectiveIsPremium && (
              <div className='w-full rounded-full h-1.5' style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div
                  className='h-1.5 rounded-full transition-all duration-300'
                  style={{ width: `${(usageCount / 5) * 100}%`, background: `linear-gradient(90deg, ${ACCENT}, #4ade80)` }}
                />
              </div>
            )}
          </div>

          <div>
            <label className='block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider'>Describe your Image</label>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              rows={4}
              placeholder='Describe what you want to see…'
              required
              disabled={!canGenerate}
              className='w-full px-3 py-2.5 rounded-xl text-sm placeholder-white/20'
              style={inputStyle}
              onFocus={e => {
                e.target.style.borderColor = `${ACCENT}80`
                e.target.style.boxShadow = `0 0 0 3px ${ACCENT_GLOW}`
              }}
              onBlur={e => {
                e.target.style.borderColor = 'rgba(255,255,255,0.1)'
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>

          <div>
            <label className='block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider'>Style</label>
            <div className='flex flex-wrap gap-2'>
              {imageStyles.map(item => (
                <button
                  type='button'
                  key={item}
                  onClick={() => canGenerate && setSelectedStyle(item)}
                  className='text-xs px-3 py-1.5 rounded-full border transition-all duration-150'
                  style={
                    selectedStyle === item
                      ? { background: ACCENT, borderColor: ACCENT, color: '#fff', cursor: 'pointer' }
                      : { background: 'transparent', borderColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.45)', cursor: canGenerate ? 'pointer' : 'not-allowed', opacity: canGenerate ? 1 : 0.4 }
                  }
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Publish toggle */}
          <label className='flex items-center gap-3 cursor-pointer select-none'>
            <div className='relative'>
              <input
                type='checkbox'
                checked={publish}
                onChange={e => setPublish(e.target.checked)}
                disabled={!canGenerate}
                className='sr-only peer'
              />
              <div
                className='w-9 h-5 rounded-full transition-colors duration-200 peer-checked:bg-green-500'
                style={{ background: 'rgba(255,255,255,0.12)' }}
              />
              <span className='absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 peer-checked:translate-x-4 shadow-sm' />
            </div>
            <span className='text-sm text-white/60'>Make this image public</span>
          </label>

          <button
            disabled={loading || !canGenerate}
            className='w-full flex justify-center items-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-50'
            style={canGenerate
              ? { background: 'linear-gradient(135deg, #00AD25, #4ade80)', boxShadow: `0 4px 20px ${ACCENT_GLOW}` }
              : { background: 'rgba(255,255,255,0.06)' }
            }
          >
            {loading
              ? <span className='w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin' />
              : <Image className='w-4 h-4' />
            }
            {!canGenerate ? 'Limit Reached — Upgrade to Continue' : 'Generate Image'}
          </button>

          {!effectiveIsPremium && usageCount >= 5 && (
            <div className='p-3 rounded-xl text-sm' style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.3)' }}>
              <p className='text-amber-300/80'>
                You've used all 5 free images.{' '}
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
            <Image className='w-4 h-4' style={{ color: ACCENT }} />
            <h2 className='text-base font-semibold text-white'>Generated Image</h2>
          </div>

          {!content ? (
            <div className='flex-1 flex flex-col items-center justify-center gap-3 text-white/20'>
              <Image className='w-10 h-10' />
              <p className='text-sm text-center'>Enter a description and click "Generate Image" to get started</p>
            </div>
          ) : (
            <div className='flex-1 flex flex-col gap-3 overflow-y-auto pr-2'>
              <img
                src={content}
                alt='generated'
                className='w-full rounded-xl object-cover'
                onLoad={() => setLoading(false)}
                onError={() => setLoading(false)}
              />
              <button
                onClick={() => downloadImage(content, 'generated-image.png')}
                className='w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 mt-auto'
                style={{ background: 'linear-gradient(135deg, #00AD25, #4ade80)', boxShadow: `0 4px 20px ${ACCENT_GLOW}` }}
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

export default GenerateImages
