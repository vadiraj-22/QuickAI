import { FileText, Sparkles, Upload } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth, useUser } from '@clerk/clerk-react'
import toast from 'react-hot-toast'
import Markdown from 'react-markdown'
import LoadingOverlay, { PIPELINE_MESSAGES } from '../components/LoadingOverlay'
import { handleApiError, handleApiResponse } from '../lib/errorHandler'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL || 'https://quickaibackend-five.vercel.app'

const ACCENT = '#00DA83'
const ACCENT_GLOW = 'rgba(0,218,131,0.2)'

const ReviewResume = () => {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')
  const [resumeReviewUsage, setResumeReviewUsage] = useState(0)
  const [isPremium, setIsPremium] = useState(false)
  const { getToken } = useAuth()
  const { user } = useUser()

  const effectiveIsPremium = isPremium || user?.publicMetadata?.plan === 'premium' || user?.unsafeMetadata?.plan === 'premium';

  const fetchUsageData = async () => {
    try {
      const { data } = await axios.get('/api/user/get-usage-data', {
        headers: { Authorization: `Bearer ${await getToken()}` },
      })
      if (data.success) {
        setResumeReviewUsage(data.resumeReviewUsage || 0)
        setIsPremium(data.isPremium || false)
      }
    } catch (error) {
      console.error('Error fetching usage data:', error)
    }
  }

  useEffect(() => {
    fetchUsageData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const onSubmitHandler = async e => {
    e.preventDefault()
    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('resume', input)
      const token = await getToken()
      const { data } = await axios.post('/api/ai/resume-review', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        timeout: 55000
      })
      const result = handleApiResponse(data, 'Resume Review')
      if (result.success) {
        if (!effectiveIsPremium) setResumeReviewUsage(prev => prev + 1)
        setContent(result.content)
      }
    } catch (error) {
      handleApiError(error, 'Resume Review')
    } finally {
      setLoading(false)
    }
  }

  const remainingUses = effectiveIsPremium ? 'Unlimited' : Math.max(0, 10 - resumeReviewUsage)
  const canReview = effectiveIsPremium || resumeReviewUsage < 10

  const panelStyle = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    backdropFilter: 'blur(20px)',
  }

  return (
    <div className='h-full flex flex-col p-6 overflow-hidden' style={{ background: '#090912' }}>
      <LoadingOverlay visible={loading} accentColor={ACCENT} messages={PIPELINE_MESSAGES.reviewResume} />

      {/* Page header */}
      <div className='flex items-center gap-3 mb-6 shrink-0'>
        <div
          className='w-10 h-10 rounded-2xl flex items-center justify-center shrink-0'
          style={{ background: `${ACCENT}25`, boxShadow: `0 0 20px ${ACCENT_GLOW}` }}
        >
          <FileText className='w-5 h-5' style={{ color: ACCENT }} />
        </div>
        <div>
          <h1 className='text-xl font-bold text-white'>Review Resume</h1>
          <p className='text-xs text-white/40'>Get instant AI feedback and improvement tips for your resume</p>
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
            <h2 className='text-base font-semibold text-white'>Resume Review</h2>
          </div>

          {/* Usage bar */}
          <div className='p-3 rounded-xl' style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className='flex justify-between items-center mb-2'>
              <span className='text-xs text-white/50'>Free reviews remaining</span>
              <span className='text-sm font-semibold' style={{ color: ACCENT }}>{remainingUses}</span>
            </div>
            {!effectiveIsPremium && (
              <div className='w-full rounded-full h-1.5' style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div
                  className='h-1.5 rounded-full transition-all duration-300'
                  style={{ width: `${(resumeReviewUsage / 10) * 100}%`, background: `linear-gradient(90deg, #009BB3, ${ACCENT})` }}
                />
              </div>
            )}
          </div>

          {/* PDF file drop zone */}
          <div>
            <label className='block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider'>Upload Resume</label>
            <label
              className='flex flex-col items-center justify-center gap-2 w-full py-8 rounded-xl cursor-pointer transition-all duration-200'
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.15)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = `${ACCENT}60`}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
            >
              <Upload className='w-6 h-6 text-white/30' />
              <span className='text-sm text-white/40'>
                {input ? input.name : 'Click to upload your PDF resume'}
              </span>
              <input
                type='file'
                accept='application/pdf'
                className='sr-only'
                onChange={e => setInput(e.target.files[0])}
                required
              />
            </label>
            <p className='text-xs text-white/25 mt-1'>Supports PDF only</p>
          </div>

          <button
            disabled={loading || !canReview}
            className='w-full flex justify-center items-center gap-2 py-3 mt-auto rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-50'
            style={{ background: `linear-gradient(135deg, #009BB3, ${ACCENT})`, boxShadow: `0 4px 20px ${ACCENT_GLOW}` }}
          >
            {loading
              ? <span className='w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin' />
              : <FileText className='w-4 h-4' />
            }
            Review Resume
          </button>

          {!effectiveIsPremium && resumeReviewUsage >= 10 && (
            <div className='p-3 rounded-xl text-sm' style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.3)' }}>
              <p className='text-amber-300/80'>
                You've used all free resume reviews.{' '}
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
            <FileText className='w-4 h-4' style={{ color: ACCENT }} />
            <h2 className='text-base font-semibold text-white'>Analysis Results</h2>
          </div>

          {!content ? (
            <div className='flex-1 flex flex-col items-center justify-center gap-3 text-white/20'>
              <FileText className='w-10 h-10' />
              <p className='text-sm text-center'>Upload a PDF and click "Review Resume" to get started</p>
            </div>
          ) : (
            <div className='flex-1 overflow-y-auto text-sm text-white/60 leading-relaxed pr-2'>
              <div className='reset-tw'><Markdown>{content}</Markdown></div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ReviewResume
