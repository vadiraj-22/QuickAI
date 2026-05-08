import {PricingTable} from '@clerk/clerk-react'

const Plan = () => {
  return (
<div id="pricing" className='w-full px-4 sm:px-6 md:max-w-[80%] lg:max-w-[70%] xl:max-w-[60%] mx-auto z-20 py-24'>
  <div className='text-center'>
    <h2 className='text-gray-100 text-3xl sm:text-4xl md:text-[42px] font-semibold'>Choose your Plan</h2>
        <p className='text-gray-400 max-w-lg mx-auto'>Start for free and scale as you grow. Find the perfect Plan for your content creation needs.</p>
      </div>
      <div className='mt-14 relative'>
        {/* Glassmorphism container */}
        <div className='relative backdrop-blur-xl bg-white/5 rounded-2xl p-8 border border-white/10 shadow-2xl'>
          {/* Gradient overlay for enhanced glass effect */}
          <div className='absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-purple-500/10 rounded-2xl pointer-events-none'></div>
          
          {/* Content */}
          <div className='relative z-10'>
            <PricingTable
              appearance={{
                baseTheme: 'dark',
                variables: {
                  colorBackground: 'transparent',
                  colorPrimary: '#6366f1',
                  colorText: '#f3f4f6',
                  colorTextSecondary: '#9ca3af',
                  colorInputBackground: 'rgba(31, 41, 55, 0.5)',
                  colorInputText: '#f3f4f6',
                  borderRadius: '0.75rem'
                },
                elements: {
                  card: {
                    backdropFilter: 'blur(16px)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
                  },
                  cardBox: {
                    backdropFilter: 'blur(16px)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)'
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Plan
