import { Image, Sparkles } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

async function downloadImage(url, filename = 'image.png') {
  const response = await fetch(url, { mode: 'cors' });
  const blob = await response.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(blobUrl);
}

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const GenerateImages = () => {
  const imageStyle = ['Realistic', 'Ghibli Style', 'Anime Style', 'Cartoon Style', 'Fantasy Style', 'Realistic style ', '3D Style ', 'Portrait Style']

  const [selectedStyle, setSelectedStyle] = useState('Realistic')
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')
  const [usageCount, setUsageCount] = useState(0)
  const [isPremium, setIsPremium] = useState(false)

  const { getToken, user } = useAuth()

  const [publish, setPublish] = useState(false)

  // Fetch user usage data
  const fetchUsageData = async () => {
    try {
      const { data } = await axios.get('/api/user/get-usage-data', { 
        headers: { Authorization: `Bearer ${await getToken()}` } 
      })
      if (data.success) {
        setUsageCount(data.usageCount || 0)
        setIsPremium(data.isPremium || false)
      }
    } catch (error) {
      console.error('Error fetching usage data:', error)
    }
  }

  useEffect(() => {
    fetchUsageData()
  }, [])

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true)
      const prompt = `Generate an Image of  ${input} in the style ${selectedStyle}`
      const { data } = await axios.post('/api/ai/generate-image', { prompt, publish }, { headers: { Authorization: `Bearer ${await getToken()}` } })
      if (data.success) {
        setContent(data.content)
        // Update usage count after successful generation
        if (!isPremium) {
          setUsageCount(prev => prev + 1)
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

  const remainingImages = isPremium ? 'Unlimited' : Math.max(0, 5 - usageCount)
  const canGenerate = isPremium || usageCount < 5

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
          <Sparkles className='w-6 text-[#00AD25]' />
          <h1 className='text-xl font-semibold text-[var(--card-foreground)]' >AI image Generator</h1>
        </div>
        
        {/* Usage indicator */}
        <div className='mt-4 p-3 bg-[var(--muted)] rounded-lg'>
          <div className='flex justify-between items-center text-sm'>
            <span className='text-[var(--muted-foreground)]'>Images remaining:</span>
            <span className={`font-semibold ${isPremium ? 'text-green-500' : 'text-blue-500'}`}>
              {remainingImages}
            </span>
          </div>
          {!isPremium && (
            <div className='mt-2 w-full bg-[var(--border)] rounded-full h-2'>
              <div 
                className='bg-blue-600 h-2 rounded-full transition-all duration-300' 
                style={{ width: `${(usageCount / 5) * 100}%` }}
              ></div>
            </div>
          )}
        </div>

        <p className='mt-6 text-sm font-medium text-[var(--card-foreground)]'>Describe your Image</p>
        <textarea 
          onChange={(e) => setInput(e.target.value)} 
          value={input} 
          rows={4} 
          className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]' 
          placeholder='Describe what you want to see in Image' 
          required 
          disabled={!canGenerate}
        />

        <p className='mt-4 text-sm font-medium text-[var(--card-foreground)]'>Style</p>
        <div className='mt-3 flex gap-3 flex-wrap sm:max-w-9/11'>
          {
            imageStyle.map((item) => (
              <span 
                onClick={() => setSelectedStyle(item)} 
                className={`text-xs px-4 py-1 border rounded-full cursor-pointer ${
                  selectedStyle === item ? 'bg-green-600 text-white border-green-600' : 'text-[var(--muted-foreground)] border-[var(--border)]'
                } ${!canGenerate ? 'opacity-50 cursor-not-allowed' : ''}`} 
                key={item}
              >
                {item}
              </span>
            ))
          }
        </div>

        <div className='my-6 flex items-center gap-2'>
          <label className='relative cursor-pointer'>
            <input 
              type="checkbox" 
              onChange={(e) => setPublish(e.target.checked)} 
              name="" 
              id="" 
              checked={publish} 
              className='sr-only peer' 
              disabled={!canGenerate}
            />

            <div className='w-9 h-5 bg-[var(--muted)] rounded-full peer-checked:bg-green-500 transition'></div>

            <span className='absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition peer-checked:translate-x-4'></span>
          </label>
          <p className='text-sm text-[var(--card-foreground)]'>Make this Image public</p>
        </div>


        <button 
          disabled={loading || !canGenerate} 
          className={`w-full flex justify-center items-center gap-2 px-5 py-3 mt-6 rounded-lg text-sm font-semibold ${
            canGenerate 
              ? 'bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-600 hover:from-emerald-700 hover:via-emerald-600 hover:to-emerald-500 text-white cursor-pointer shadow-lg' 
              : 'bg-[var(--muted)] text-[var(--muted-foreground)] cursor-not-allowed'
          }`}
          style={canGenerate ? { boxShadow: '0 4px 20px -5px rgba(16, 185, 129, 0.4)' } : {}}
        >
          {loading ? (
            <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span>
          ) : (
            <Image className='w-5' />
          )}
          {!canGenerate ? 'Limit Reached - Upgrade to Continue' : 'Generate Image'}
        </button>

        {!isPremium && usageCount >= 5 && (
          <div className='mt-4 p-3 bg-yellow-500/20 border border-yellow-500 rounded-lg'>
            <p className='text-sm text-[var(--card-foreground)]'>
              You've used all 5 free images! 
              <a href="/plan" className='text-blue-500 hover:underline ml-1'>
                Upgrade to premium for unlimited image generation.
              </a>
            </p>
          </div>
        )}

      </form>

      {/* right col */}
      <div className='w-full max-w-lg p-4 rounded-lg flex flex-col border min-h-96'
           style={{
             backgroundColor: 'rgba(255, 255, 255, 0.08)',
             backdropFilter: 'blur(20px)',
             WebkitBackdropFilter: 'blur(20px)',
             border: '1px solid rgba(255, 255, 255, 0.18)',
             boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
           }}>
        <div className='flex items-center gap-3'>
          <Image className='w-5 h-5 text-[#00AD25]' />
          <h1 className='text-xl font-semibold text-[var(--card-foreground)]'>Generated Images</h1>
        </div>
        {
          !content ? (<div className='flex flex-1 justify-center items-center'>
            <div className='text-sm flex flex-col items-center gap-5 text-[var(--muted-foreground)]'>
              <Image className='w-9 h-9' />
              <p> Enter a topic and click "Generate Image" to get started</p>
            </div>
          </div>)
            : (
              <div className='h-full mt-3'>
                <img src={content} alt="image" className='w-full h-full rounded-lg' />
                <button
                  onClick={() => downloadImage(content, 'generated-image.png')}
                  className="mt-2 w-full px-4 py-2 bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-600 hover:from-emerald-700 hover:via-emerald-600 hover:to-emerald-500 text-white font-semibold rounded-lg shadow-lg"
                  style={{ boxShadow: '0 4px 20px -5px rgba(16, 185, 129, 0.4)' }}
                >
                  Download Image
                </button>
              </div>

            )
        }

      </div>
    </div>
  )
}

export default GenerateImages
