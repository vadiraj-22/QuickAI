import React from 'react'
import {PricingTable} from '@clerk/clerk-react'

const Plan = () => {
  return (
<div className='w-full px-4 sm:max-w-[80%] md:max-w-[70%] lg:max-w-[60%] xl:max-w-[50%] mx-auto z-20'>
  <div className='text-center'>
    <h2 className='text-slate-700 text-3xl sm:text-4xl md:text-[42px] font-semibold'>Choose your Plan</h2>
        <p className='text-gray-500 max-w-lg mx-auto'>Start for free and scale as you grow . Find the perfect Plan for your content creation needs.</p>
      </div>
      <div className='mt-14 max-sm:mx-16'>
        <PricingTable/>
      </div>
    </div>
  )
}

export default Plan
