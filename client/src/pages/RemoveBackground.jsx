import { Eraser, Sparkles } from 'lucide-react';
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

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

const RemoveBackground = () => {
  const [input, setInput] = useState(null)
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')
  const [formatError, setFormatError] = useState('')
  const [bgRemovalUsage, setBgRemovalUsage] = useState(0)
  const [isPremium, setIsPremium] = useState(false)
  const { getToken } = useAuth()

  // Fetch user usage data
  const fetchUsageData = async () => {
    try {
      const { data } = await axios.get('/api/user/get-usage-data', { 
        headers: { Authorization: `Bearer ${await getToken()}` } 
      })
      if (data.success) {
        setBgRemovalUsage(data.bgRemovalUsage || 0)
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
      if (!input) {
        toast.error('Please select an image to upload.');
        return;
      }
      if (!ALLOWED_TYPES.includes(input.type)) {
        setFormatError(`"${input.name}" is not supported. Please upload a JPG or PNG image.`);
        toast.error('Invalid file format. Only JPG and PNG are allowed.');
        return;
      }
      setLoading(true)
      const formData = new FormData()
      formData.append('image', input)
      const { data } = await axios.post('/api/ai/remove-image-background', formData, { headers: { Authorization: `Bearer ${await getToken()}` } })
      if (data.success) {
        setContent(data.content)
        // Update usage count after successful removal
        if (!isPremium) {
          setBgRemovalUsage(prev => prev + 1)
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
  const remainingUses = isPremium ? 'Unlimited' : Math.max(0, 5 - bgRemovalUsage)
  const canRemove = isPremium || bgRemovalUsage < 5

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
          <Sparkles className='w-6 text-[#FF4938]' />
          <h1 className='text-xl font-semibold text-[var(--card-foreground)]' >Background Remover</h1>
        </div>

        {/* Usage Counter */}
        <div className='mt-4 p-3 bg-[var(--muted)] rounded-lg'>
          <div className='flex justify-between items-center mb-2'>
            <span className='text-sm font-medium text-[var(--card-foreground)]'>Free Uses</span>
            <span className='text-sm font-semibold text-[#FF4938]'>
              {remainingUses} {!isPremium && 'remaining'}
            </span>
          </div>
          {!isPremium && (
            <div className='w-full bg-[var(--border)] rounded-full h-2'>
              <div 
                className='bg-gradient-to-r to-[#F6AB41] from-[#FF4938] h-2 rounded-full transition-all duration-300' 
                style={{ width: `${(bgRemovalUsage / 5) * 100}%` }}
              ></div>
            </div>
          )}
        </div>

        <p className='mt-6 text-sm font-medium text-[var(--card-foreground)]'>Upload Image</p>
        <input
          onChange={(e) => {
            try {
              const file = e.target.files[0];
              if (!file) return;
              if (!ALLOWED_TYPES.includes(file.type)) {
                setFormatError(`"${file.name}" is not supported. Please upload a JPG or PNG image.`);
                toast.error('Invalid file format. Only JPG and PNG are allowed.');
                setInput(null);
                e.target.value = '';
                return;
              }
              setFormatError('');
              setInput(file);
            } catch (error) {
              toast.error('Failed to read the file. Please try again.');
              e.target.value = '';
            }
          }}
          type="file"
          accept="*"
          className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]'
          required
        />

        {formatError && (
          <p className='text-xs text-red-400 font-medium mt-2'>{formatError}</p>
        )}

        <p className='text-xs text-[var(--muted-foreground)] font-light mt-1'>Supports JPG, JPEG, and PNG formats only</p>

        <button disabled={loading || !canRemove} className='w-full flex justify-center items-center gap-2 bg-gradient-to-r to-[#F6AB41] from-[#FF4938] hover:opacity-90 text-white px-5 py-3 mt-6 rounded-lg text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'>
          {
            loading ? <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span> : <Eraser className='w-5' />
          }


          Remove Background
        </button>

        {!isPremium && bgRemovalUsage >= 5 && (
          <div className='mt-4 p-3 bg-yellow-500/20 border border-yellow-500 rounded-lg'>
            <p className='text-sm text-[var(--card-foreground)]'>
              You've used all your free background removals. Upgrade to premium for unlimited access!
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
          <Eraser className='w-5 h-5 text-[#FF4938]' />
          <h1 className='text-xl font-semibold text-[var(--card-foreground)]'>Processed Image</h1>
        </div>
        {!content ? (
          <div className='flex flex-1 justify-center items-center'>
            <div className='text-sm flex flex-col items-center gap-5 text-[var(--muted-foreground)]'>
              <Eraser className='w-9 h-9' />
              <p> Upload an image and click "Remove Background" to get started</p>
            </div>
          </div>
        ) : (
          <div>
            <img src={content} alt="image" className=' mt-3 w-full h-full rounded-lg' />
            <button
              onClick={async () => await downloadImage(content, 'background-removed.png')}
              className="mt-2 w-full px-4 py-2 bg-gradient-to-r to-[#F6AB41] from-[#FF4938] hover:opacity-90 text-white rounded-lg"
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

export default RemoveBackground
