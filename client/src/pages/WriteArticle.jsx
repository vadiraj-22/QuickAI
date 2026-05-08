import { Edit, Sparkles } from 'lucide-react'
import React, { useState } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react'
import toast from 'react-hot-toast';
import Markdown from 'react-markdown';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const WriteArticle = () => {

  const articleLength = [
    { length: 800, text: 'short (500-800 words) ' },
    { length: 1200, text: 'Medium (800-1200 words) ' },
    { length: 1600, text: 'Long (1200+ words) ' }
  ]

  const [selectedLength, setSelectedLength] = useState(articleLength[0])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')

  const { getToken } = useAuth()

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true)
      const prompt = input
      const { data } = await axios.post('/api/ai/generate-article', { prompt, length: selectedLength.length }, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })
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
          <Sparkles className='w-6 text-[#4A7AFF]' />
          <h1 className='text-xl font-semibold text-[var(--card-foreground)]' >Article Configuration</h1>
        </div>
        <p className='mt-6 text-sm font-medium text-[var(--card-foreground)]'>Article Topic</p>
        <input onChange={(e) => setInput(e.target.value)} value={input} type="text" className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]' placeholder='The future of artificial intelligence is...  ' required />

        <p className='mt-4 text-sm font-medium text-[var(--card-foreground)]'>Article Length</p>
        <div className='mt-3 flex gap-3 flex-wrap sm:max-w-9/11'>
          {
            articleLength.map((item, index) => (
              <span onClick={() => setSelectedLength(item)} className={`text-xs px-4 py-1 border rounded-full cursor-pointer ${selectedLength.text === item.text ? 'bg-blue-600 text-white border-blue-600' : 'text-[var(--muted-foreground)] border-[var(--border)]'}`} key={index}>{item.text}</span>
            ))
          }
        </div>
        <br />

        <button disabled={loading} className='w-full flex justify-center items-center gap-2 bg-gradient-to-r to-[#226BFF] from-[#65ADFF] hover:opacity-90 text-white px-5 py-3 mt-6 rounded-lg text-sm cursor-pointer'>
          {
            loading ? <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'> </span> : <Edit className='w-5' />
          }

          Generate Article
        </button>

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
          <Edit className='w-5 h-5 text-[#4A7AFF]' />
          <h1 className='text-xl font-semibold text-[var(--card-foreground)]'>Generated Article</h1>
        </div>

        {!content ? (
          <div className='flex flex-1 justify-center items-center'>
            <div className='text-sm flex flex-col items-center gap-5 text-[var(--muted-foreground)]'>
              <Edit className='w-9 h-9' />
              <p> Enter a topic and click "generate article" to get started</p>
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

export default WriteArticle
