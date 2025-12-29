import { Scissors, Sparkles } from 'lucide-react';
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

async function downloadImage(url, filename = 'object-removed.png') {
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

const RemoveObject = () => {
  const [input, setInput] = useState('')
  const [object, setObject] = useState('')
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')
  const [objRemovalUsage, setObjRemovalUsage] = useState(0)
  const [isPremium, setIsPremium] = useState(false)
  const { getToken } = useAuth()

  // Fetch user usage data
  const fetchUsageData = async () => {
    try {
      const { data } = await axios.get('/api/user/get-usage-data', { 
        headers: { Authorization: `Bearer ${await getToken()}` } 
      })
      if (data.success) {
        setObjRemovalUsage(data.objRemovalUsage || 0)
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

      if (object.split(' ').length > 1) {
        return toast('please enter only 1 object name')
      }

      const formData = new FormData()
      formData.append('image', input)
      formData.append('object', object)
      const { data } = await axios.post('/api/ai/remove-image-object', formData, { headers: { Authorization: `Bearer ${await getToken()}` } })
      if (data.success) {
        setContent(data.content)
        // Update usage count after successful removal
        if (!isPremium) {
          setObjRemovalUsage(prev => prev + 1)
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
  const remainingUses = isPremium ? 'Unlimited' : Math.max(0, 5 - objRemovalUsage)
  const canRemove = isPremium || objRemovalUsage < 5

  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700'>

      {/* left col */}
      <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'>
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-[#4A7AFF]' />
          <h1 className='text-xl font-semibold' >Object Removal</h1>
        </div>

        {/* Usage Counter */}
        <div className='mt-4 p-3 bg-gray-50 rounded-lg'>
          <div className='flex justify-between items-center mb-2'>
            <span className='text-sm font-medium text-gray-700'>Free Uses</span>
            <span className='text-sm font-semibold text-[#4A7AFF]'>
              {remainingUses} {!isPremium && 'remaining'}
            </span>
          </div>
          {!isPremium && (
            <div className='w-full bg-gray-200 rounded-full h-2'>
              <div 
                className='bg-gradient-to-r to-[#417DF6] from-[#8E37EB] h-2 rounded-full transition-all duration-300' 
                style={{ width: `${(objRemovalUsage / 5) * 100}%` }}
              ></div>
            </div>
          )}
        </div>

        <p className='mt-6 text-sm font-medium'>Upload Image</p>
        <input onChange={(e) => setInput(e.target.files[0])} type="file" accept='image/*' className='w-full p-2 px-3 mt-2 outline-none text-sm  rounded-md border border-gray-300 text-gray-600' required />

        <p className='mt-6 text-sm font-medium'>Describe object name to remove</p>
        <textarea onChange={(e) => setObject(e.target.value)} value={object} rows={4} className='w-full p-2 px-3 mt-2 outline-none text-sm  rounded-md border border-gray-300' placeholder='eg..  watch or spoon only single object name ' required />


        <button disabled={loading || !canRemove} className='w-full flex justify-center items-center gap-2 bg-gradient-to-r to-[#417DF6] from-[#8E37EB] text-white px-5 py-3 mt-6 rounded-lg text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'>
          {loading ? <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span> : <Scissors className='w-5' />}

          Remove Object
        </button>

        {!isPremium && objRemovalUsage >= 5 && (
          <div className='mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg'>
            <p className='text-sm text-yellow-800'>
              You've used all your free object removals. Upgrade to premium for unlimited access!
            </p>
          </div>
        )}
      </form>

      {/* right col */}
      <div className='w-full max-w-lg p-4 bg-white rounded-lg  flex flex-col  border border-gray-200 min-h-96'>
        <div className='flex items-center gap-3'>
          <Scissors className='w-5 h-5 text-[#4A7AFF]' />
          <h1 className='text-xl font-semibold'>Processed Image</h1>
        </div>
        {!content ? (<div className='flex flex-1 justify-center items-center'>
          <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
            <Scissors className='w-9 h-9' />
            <p> Upload an image and click "Remove Object" to get started</p>
          </div>
        </div>)
          : (
            <div>
              <img src={content} alt="image" className=' mt-3 w-full h-full' />
              <button
                onClick={async () => await downloadImage(content, 'object-removed.png')}
                className="mt-2 w-full px-4 py-2 bg-gradient-to-r to-[#417DF6] from-[#8E37EB] text-white rounded"
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

export default RemoveObject