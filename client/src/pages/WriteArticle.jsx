import { Edit, Sparkles } from 'lucide-react'
import React, { useState } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react'
import toast from 'react-hot-toast'
import Markdown from 'react-markdown'
import LoadingOverlay, { PIPELINE_MESSAGES } from '../components/LoadingOverlay'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

const ACCENT = '#4A7AFF'
const ACCENT_GLOW = 'rgba(74,122,255,0.18)'

const WriteArticle = () => {
  const articleLength = [
    { length: 800, text: 'Short (500–800 words)' },
    { length: 1200, text: 'Medium (800–1200 words)' },
    { length: 1600, text: 'Long (1200+ words)' },
  ]

  const [selectedLength, setSelectedLength] = useState(articleLength[0])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')
  const { getToken } = useAuth()

  const onSubmitHandler = async e => {
    e.preventDefault()
    try {
      setLoading(true)
      const { data } = await axios.post(
        '/api/ai/generate-article',
        { prompt: input, length: selectedLength.length },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      )
      if (data.success) {
        setContent(data.content)
        setLoading(false)
      } else {
        toast.error(data.message)
        setLoading(false)
      }
    } catch (error) {
      toast.error(error.message)
      setLoading(false)
    }
  }

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
      <LoadingOverlay visible={loading} accentColor={ACCENT} messages={PIPELINE_MESSAGES.writeArticle} />

      {/* Page header */}
      <div className='flex items-center gap-3 mb-6 shrink-0'>
        <div
          className='w-10 h-10 rounded-2xl flex items-center justify-center shrink-0'
          style={{ background: `${ACCENT}25`, boxShadow: `0 0 20px ${ACCENT_GLOW}` }}
        >
          <Edit className='w-5 h-5' style={{ color: ACCENT }} />
        </div>
        <div>
          <h1 className='text-xl font-bold text-white'>Write Article</h1>
          <p className='text-xs text-white/40'>Generate full-length articles with AI</p>
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
            <h2 className='text-base font-semibold text-white'>Article Configuration</h2>
          </div>

          <div>
            <label className='block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider'>Article Topic</label>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              type='text'
              placeholder='The future of artificial intelligence…'
              required
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
            <label className='block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider'>Article Length</label>
            <div className='flex flex-wrap gap-2'>
              {articleLength.map((item, i) => (
                <button
                  type='button'
                  key={i}
                  onClick={() => setSelectedLength(item)}
                  className='text-xs px-4 py-1.5 rounded-full border transition-all duration-150 cursor-pointer'
                  style={
                    selectedLength.text === item.text
                      ? { background: ACCENT, borderColor: ACCENT, color: '#fff' }
                      : { background: 'transparent', borderColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.45)' }
                  }
                >
                  {item.text}
                </button>
              ))}
            </div>
          </div>

          <button
            disabled={loading}
            className='w-full flex justify-center items-center gap-2 py-3 mt-auto rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-50'
            style={{
              background: `linear-gradient(135deg, #226BFF, #65ADFF)`,
              boxShadow: `0 4px 20px ${ACCENT_GLOW}`,
            }}
          >
            {loading
              ? <span className='w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin' />
              : <Edit className='w-4 h-4' />
            }
            Generate Article
          </button>
        </form>

        {/* Right — output panel */}
        <div
          className='w-full lg:w-1/2 max-w-xl p-5 rounded-2xl flex flex-col min-h-[300px] lg:min-h-0 flex-1 min-w-0'
          style={panelStyle}
        >
          <div className='flex items-center gap-2 mb-4 shrink-0'>
            <Edit className='w-4 h-4' style={{ color: ACCENT }} />
            <h2 className='text-base font-semibold text-white'>Generated Article</h2>
          </div>

          {!content ? (
            <div className='flex-1 flex flex-col items-center justify-center gap-3 text-white/20'>
              <Edit className='w-10 h-10' />
              <p className='text-sm text-center'>Enter a topic and click "Generate Article" to get started</p>
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

export default WriteArticle
