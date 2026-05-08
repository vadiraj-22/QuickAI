import { FileText, Sparkles } from 'lucide-react';
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import Markdown from 'react-markdown';


axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;


const ReviewResume = () => {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')
  const [resumeReviewUsage, setResumeReviewUsage] = useState(0)
  const [isPremium, setIsPremium] = useState(false)
  const { getToken } = useAuth()

  // Fetch user usage data
  const fetchUsageData = async () => {
    try {
      const { data } = await axios.get('/api/user/get-usage-data', { 
        headers: { Authorization: `Bearer ${await getToken()}` } 
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
  }, [])

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true)

      const formData = new FormData()
      formData.append('resume', input)
      const { data } = await axios.post('/api/ai/resume-review', formData, { headers: { Authorization: `Bearer ${await getToken()}` } })
      if (data.success) {
        setContent(data.content)
        // Update usage count after successful review
        if (!isPremium) {
          setResumeReviewUsage(prev => prev + 1)
        }
      }
      else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
    setLoading(false)
  }
  const remainingUses = isPremium ? 'Unlimited' : Math.max(0, 10 - resumeReviewUsage)
  const canReview = isPremium || resumeReviewUsage < 10

  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 bg-[#000000]'>

      {/* left col */}
      <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 rounded-lg border'
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
            }}>
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-[#00DA83]' />
          <h1 className='text-xl font-semibold text-[var(--card-foreground)]' > Resume Review </h1>
        </div>

        {/* Usage Counter */}
        <div className='mt-4 p-3 bg-[var(--muted)] rounded-lg'>
          <div className='flex justify-between items-center mb-2'>
            <span className='text-sm font-medium text-[var(--card-foreground)]'>Free Reviews</span>
            <span className='text-sm font-semibold text-[#00DA83]'>
              {remainingUses} {!isPremium && 'remaining'}
            </span>
          </div>
          {!isPremium && (
            <div className='w-full bg-[var(--border)] rounded-full h-2'>
              <div 
                className='bg-gradient-to-r to-[#00DA83] from-[#009BB3] h-2 rounded-full transition-all duration-300' 
                style={{ width: `${(resumeReviewUsage / 10) * 100}%` }}
              ></div>
            </div>
          )}
        </div>

        <p className='mt-6 text-sm font-medium text-[var(--card-foreground)]'>Upload Resume</p>
        <input onChange={(e) => setInput(e.target.files[0])} type="file" accept='application/pdf' className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]' required />

        <p className='text-xs text-[var(--muted-foreground)] font-light mt-1 '>Supports PDF Resume only</p>

        <button disabled={loading || !canReview} className='w-full flex justify-center items-center gap-2 bg-gradient-to-r to-[#00DA83] from-[#009BB3] hover:opacity-90 text-white px-5 py-3 mt-6 rounded-lg text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'>

          {loading ? <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span> : <FileText className='w-5' />}
          Review Resume
        </button>

        {!isPremium && resumeReviewUsage >= 10 && (
          <div className='mt-4 p-3 bg-yellow-500/20 border border-yellow-500 rounded-lg'>
            <p className='text-sm text-[var(--card-foreground)]'>
              You've used all your free resume reviews. Upgrade to premium for unlimited access!
            </p>
          </div>
        )}
      </form>

      {/* right col */}
      <div className='w-full max-w-lg p-4 rounded-lg flex flex-col border min-h-96 max-h-[600px]'
           style={{
             backgroundColor: 'rgba(255, 255, 255, 0.08)',
             backdropFilter: 'blur(20px)',
             WebkitBackdropFilter: 'blur(20px)',
             border: '1px solid rgba(255, 255, 255, 0.18)',
             boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
           }}>
        <div className='flex items-center gap-3'>
          <FileText className='w-5 h-5 text-[#00DA83]' />
          <h1 className='text-xl font-semibold text-[var(--card-foreground)]'>Analysis Results</h1>
        </div>

        {!content ? (
          <div className='flex flex-1 justify-center items-center'>
            <div className='text-sm flex flex-col items-center gap-5 text-[var(--muted-foreground)]'>
              <FileText className='w-9 h-9' />
              <p> Upload an PDF and click "Review Resume" to get started</p>
            </div>
          </div>
        ) : (
          <div className='mt-3 h-full overflow-y-scroll text-sm text-[var(--muted-foreground)]'>
            <div className='reset-tw'>
              <Markdown>{content}</Markdown>
            </div>
          </div>
        )}


      </div>
    </div>
  )
}

export default ReviewResume
