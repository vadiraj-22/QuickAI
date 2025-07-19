import React from 'react'
import {PricingTable} from '@clerk/clerk-react'

const Plan = () => {
  return (
    <div className='max-w-2x1  z-20 my-30 mx-auto px-80'>
      <div className='text-center'>
        <h2 className='text-slate-700 text-[42px] font-semibold'>Choose your Plan</h2>
        <p className='text-gray-500 max-w-lg mx-auto'>Start for free and scale as you grow . Find the perfect Plan for your content creation needs.</p>
      </div>
      <div className='mt-14 max-sm:mx-16'>
        <PricingTable/>
      </div>
    </div>
  )
}

export default Plan
