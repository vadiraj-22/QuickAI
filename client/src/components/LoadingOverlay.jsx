import React, { useEffect, useState } from 'react'

// Per-feature pipeline messages — pass a `messages` prop to override
export const PIPELINE_MESSAGES = {
  generateImage: [
    'Sending prompt to ClipDrop API...',
    'ClipDrop is rendering your image...',
    'Image received — converting to base64...',
    'Uploading to Cloudinary...',
    'Cloudinary secure URL generated...',
    'Saving to your creations...',
    'Almost done, fetching result...',
  ],
  removeBackground: [
    'Reading file via Multer...',
    'Uploading original image to Cloudinary...',
    'Applying Cloudinary background_removal effect...',
    'Cloudinary is processing the transformation...',
    'Generating secure transformed URL...',
    'Saving to your creations...',
    'Finalising result...',
  ],
  removeObject: [
    'Reading file via Multer...',
    'Uploading image to Cloudinary...',
    'Applying Cloudinary gen_remove transformation...',
    'Cloudinary AI is erasing the object...',
    'Generating secure transformed URL...',
    'Saving to your creations...',
    'Wrapping up...',
  ],
  blogTitle: [
    'Sending prompt to Gemini 2.5 Flash...',
    'Gemini is generating title ideas...',
    'Parsing the response...',
    'Saving result to database...',
    'Almost there...',
  ],
  writeArticle: [
    'Sending topic to Gemini 2.5 Flash...',
    'Gemini is drafting your article...',
    'Formatting markdown content...',
    'Saving article to database...',
    'Finalising...',
  ],
  reviewResume: [
    'Reading PDF via Multer...',
    'Extracting text with pdf-parse...',
    'Sending resume content to Gemini 2.5 Flash...',
    'Gemini is analysing your resume...',
    'Compiling feedback...',
    'Saving review to database...',
    'Almost done...',
  ],
}

const LoadingOverlay = ({ visible, accentColor = '#00AD25', messages = PIPELINE_MESSAGES.generateImage }) => {
  const [msgIndex, setMsgIndex] = useState(0)

  useEffect(() => {
    if (!visible) return
    setMsgIndex(0)
    const interval = setInterval(() => {
      setMsgIndex(prev => (prev + 1) % messages.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [visible, messages])

  if (!visible) return null

  return (
    <div
      className='fixed inset-0 z-50 flex flex-col items-center justify-center'
      style={{
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      {/* Animated rings */}
      <div className='relative flex items-center justify-center mb-10'>
        {/* Outer pulse ring */}
        <span
          className='absolute rounded-full animate-ping'
          style={{
            width: 120,
            height: 120,
            background: `${accentColor}18`,
            border: `2px solid ${accentColor}40`,
            animationDuration: '1.6s',
          }}
        />
        {/* Middle ring */}
        <span
          className='absolute rounded-full'
          style={{
            width: 90,
            height: 90,
            border: `2px solid ${accentColor}30`,
            animation: 'spin 3s linear infinite',
          }}
        />
        {/* Inner spinning arc */}
        <span
          className='absolute rounded-full'
          style={{
            width: 70,
            height: 70,
            border: `3px solid transparent`,
            borderTopColor: accentColor,
            borderRightColor: `${accentColor}60`,
            animation: 'spin 1s linear infinite',
          }}
        />
        {/* Core dot */}
        <span
          className='rounded-full'
          style={{
            width: 18,
            height: 18,
            background: accentColor,
            boxShadow: `0 0 20px 6px ${accentColor}80`,
            animation: 'corePulse 1.4s ease-in-out infinite',
          }}
        />
      </div>

      {/* Particle dots row */}
      <div className='flex gap-2 mb-8'>
        {[0, 1, 2, 3, 4].map(i => (
          <span
            key={i}
            className='rounded-full'
            style={{
              width: 7,
              height: 7,
              background: accentColor,
              opacity: 0.7,
              animation: `dotBounce 1.2s ease-in-out infinite`,
              animationDelay: `${i * 0.18}s`,
            }}
          />
        ))}
      </div>

      {/* Status text */}
      <p
        className='text-base font-medium tracking-wide text-center px-8 transition-all duration-500'
        style={{ color: 'rgba(255,255,255,0.85)', maxWidth: 340 }}
      >
        {messages[msgIndex]}
      </p>

      <p className='mt-3 text-xs' style={{ color: 'rgba(255,255,255,0.35)' }}>
        This may take a few seconds
      </p>

      <style>{`
        @keyframes corePulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.35); opacity: 0.7; }
        }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40% { transform: translateY(-10px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export default LoadingOverlay
