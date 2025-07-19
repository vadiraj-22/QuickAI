import { Eraser, Sparkles } from 'lucide-react';
import React, { useState } from 'react'
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

const RemoveBackground = () => {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')
  const { getToken } = useAuth()

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('image', input)
      const { data } = await axios.post('/api/ai/remove-image-background', formData, { headers: { Authorization: `Bearer ${await getToken()}` } })
      if (data.success) {
        setContent(data.content)
      }
      else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
    setLoading(false)
  }
  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700'>
      {/* left col */}
      <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'>
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-[#FF4938]' />
          <h1 className='text-xl font-semibold' >Background Remover</h1>
        </div>
        <p className='mt-6 text-sm font-medium'>Upload Image</p>
        <input onChange={(e) => setInput(e.target.files[0])} type="file" accept='image/*' className='w-full p-2 px-3 mt-2 outline-none text-sm  rounded-md border border-gray-300 text-gray-600' required />

        <p className='text-xs text-gray-500 font-light mt-1 '>Supports JPG PNG and Image formats </p>

        <button disabled={loading} className='w-full flex justify-center items-center gap-2 bg-gradient-to-r to-[#F6AB41] from-[#FF4938] text-white px-5 py-3 mt-6 rounded-lg text-sm cursor-pointer'>
          {
            loading ? <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span> : <Eraser className='w-5' />
          }


          Remove Background
        </button>
      </form>

      {/* right col */}
      <div className='w-full max-w-lg p-4 bg-white rounded-lg  flex flex-col  border border-gray-200 min-h-96'>
        <div className='flex items-center gap-3'>
          <Eraser className='w-5 h-5 text-[#FF4938]' />
          <h1 className='text-xl font-semibold'>Processed Image</h1>
        </div>
        {!content ? (
          <div className='flex flex-1 justify-center items-center'>
            <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
              <Eraser className='w-9 h-9' />
              <p> Upload an image and click "Remove Background" to get started</p>
            </div>
          </div>
        ) : (
          <div>
            <img src={content} alt="image" className=' mt-3 w-full h-full' />
            <button
              onClick={async () => await downloadImage(content, 'background-removed.png')}
              className="mt-2 w-full px-4 py-2 bg-gradient-to-r to-[#F6AB41] from-[#FF4938]  text-white rounded"
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
