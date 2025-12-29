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
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700'>
      {/* left col */}
      <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'>
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-[#00AD25]' />
          <h1 className='text-xl font-semibold' >AI image Generator</h1>
        </div>
        
        {/* Usage indicator */}
        <div className='mt-4 p-3 bg-gray-50 rounded-lg'>
          <div className='flex justify-between items-center text-sm'>
            <span className='text-gray-600'>Images remaining:</span>
            <span className={`font-semibold ${isPremium ? 'text-green-600' : 'text-blue-600'}`}>
              {remainingImages}
            </span>
          </div>
          {!isPremium && (
            <div className='mt-2 w-full bg-gray-200 rounded-full h-2'>
              <div 
                className='bg-blue-600 h-2 rounded-full transition-all duration-300' 
                style={{ width: `${(usageCount / 5) * 100}%` }}
              ></div>
            </div>
          )}
        </div>

        <p className='mt-6 text-sm font-medium'>Describe your Image</p>
        <textarea 
          onChange={(e) => setInput(e.target.value)} 
          value={input} 
          rows={4} 
          className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300' 
          placeholder='Describe what you want to see in Image' 
          required 
          disabled={!canGenerate}
        />

        <p className='mt-4 text-sm font-medium'>Style</p>
        <div className='mt-3 flex gap-3 flex-wrap sm:max-w-9/11'>
          {
            imageStyle.map((item) => (
              <span 
                onClick={() => setSelectedStyle(item)} 
                className={`text-xs px-4 py-1 border rounded-full cursor-pointer ${
                  selectedStyle === item ? 'bg-green-50 text-green-700' : 'text-gray-500 border-gray-300'
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

            <div className='w-9 h-5 bg-slate-300 rounded-full peer-checked:bg-green-500 transition'></div>

            <span className='absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition peer-checked:translate-x-4'></span>
          </label>
          <p className='text-sm'>Make this Image public</p>
        </div>


        <button 
          disabled={loading || !canGenerate} 
          className={`w-full flex justify-center items-center gap-2 px-5 py-3 mt-6 rounded-lg text-sm ${
            canGenerate 
              ? 'bg-gradient-to-r to-[#00AD25] from-[#04FF50] text-white cursor-pointer' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {loading ? (
            <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span>
          ) : (
            <Image className='w-5' />
          )}
          {!canGenerate ? 'Limit Reached - Upgrade to Continue' : 'Generate Image'}
        </button>

        {!isPremium && usageCount >= 5 && (
          <div className='mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg'>
            <p className='text-sm text-yellow-800'>
              You've used all 5 free images! 
              <a href="/plan" className='text-blue-600 hover:underline ml-1'>
                Upgrade to premium for unlimited image generation.
              </a>
            </p>
          </div>
        )}

      </form>

      {/* right col */}
      <div className='w-full max-w-lg p-4 bg-white rounded-lg  flex flex-col  border border-gray-200 min-h-96'>
        <div className='flex items-center gap-3'>
          <Image className='w-5 h-5 text-[#8E37EB]' />
          <h1 className='text-xl font-semibold'>Generated Images</h1>
        </div>
        {
          !content ? (<div className='flex flex-1 justify-center items-center'>
            <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
              <Image className='w-9 h-9' />
              <p> Enter a topic and click "Generate Image" to get started</p>
            </div>
          </div>)
            : (
              <div className='h-full mt-3'>
                <img src={content} alt="image" className='w-full h-full' />
                <button
                  onClick={() => downloadImage(content, 'generated-image.png')}
                  className="mt-2 w-full px-4 py-2 bg-gradient-to-r to-[#00AD25] from-[#04FF50] text-white rounded"
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
