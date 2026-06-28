import React, { useState } from 'react'
import Markdown from 'react-markdown'
import { ChevronDown, ChevronUp, Image, FileText, Hash, SquarePen } from 'lucide-react'

const typeConfig = {
  image: { color: '#00AD25', Icon: Image },
  article: { color: '#4A7AFF', Icon: SquarePen },
  'blog-title': { color: '#8E37EB', Icon: Hash },
  resume: { color: '#00DA83', Icon: FileText },
}

const CreationItem = ({ item }) => {
  const [expanded, setExpanded] = useState(false)
  const config = typeConfig[item.type] || { color: '#818cf8', Icon: SquarePen }

  return (
    <div
      className='rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer'
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Header row */}
      <div className='flex items-center gap-3 px-4 py-3.5'>
        {/* Type icon */}
        <div
          className='w-8 h-8 rounded-xl flex items-center justify-center shrink-0'
          style={{ background: `${config.color}20` }}
        >
          <config.Icon className='w-3.5 h-3.5' style={{ color: config.color }} />
        </div>

        {/* Prompt + meta */}
        <div className='flex-1 min-w-0'>
          <p className='text-sm font-medium text-white/85 truncate'>{item.prompt}</p>
          <p className='text-xs text-white/35 mt-0.5'>
            {new Date(item.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>

        {/* Badge + expand toggle */}
        <div className='flex items-center gap-2 shrink-0'>
          <span
            className='text-xs px-2.5 py-0.5 rounded-full font-medium'
            style={{
              background: `${config.color}20`,
              color: config.color,
              border: `1px solid ${config.color}40`,
            }}
          >
            {item.type}
          </span>
          {expanded
            ? <ChevronUp className='w-4 h-4 text-white/30' />
            : <ChevronDown className='w-4 h-4 text-white/30' />
          }
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div
          className='px-4 pb-4 pt-2'
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          {item.type === 'image' ? (
            <img
              src={item.content}
              alt='creation'
              className='w-full max-w-md rounded-xl object-cover'
            />
          ) : (
            <div className='text-sm text-white/50 leading-relaxed'>
              <div className='reset-tw'>
                <Markdown>{item.content}</Markdown>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CreationItem
