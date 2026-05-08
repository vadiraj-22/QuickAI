import React from 'react'
import { AiToolsData } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { useUser, useClerk } from '@clerk/clerk-react'

const AiTools = () => {

    const navigate=useNavigate()
    const {user}=useUser()
    const {openSignIn}=useClerk()

    const handleToolClick = (path) => {
        if (user) {
            navigate(path)
        } else {
            openSignIn()
        }
    }
    
  return (
    <div id="features" className='w-full px-4 sm:px-6 md:max-w-[90%] lg:max-w-[85%] xl:max-w-[80%] mx-auto my-24'>
      <div className='text-center'>
        <h2 className='text-[var(--foreground)] text-[42px] font-semibold'>Powerful AI Tools</h2>
        <p className='text-[var(--muted-foreground)] max-w-lg mx-auto'>Everything you need to create, enhance, and optimize your content with cutting-edge AI technology</p>
      </div>

      <div className='flex flex-wrap mt-10 justify-center'>
        {AiToolsData.map((tool,index)=>(
            <div key={index} className='p-8 m-4 max-w-xs rounded-lg shadow-lg border hover:-translate-y-1 transition-all duration-300 cursor-pointer group' 
                 style={{
                   backgroundColor: 'rgba(255, 255, 255, 0.08)',
                   backdropFilter: 'blur(20px)',
                   WebkitBackdropFilter: 'blur(20px)',
                   border: '1px solid rgba(255, 255, 255, 0.18)',
                   boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
                 }}
                 onClick={()=>handleToolClick(tool.path)}>
                <tool.Icon className='w-12 h-12 p-3 text-[var(--primary-foreground)] rounded-xl transition-transform duration-300 group-hover:scale-110' style={{background: `linear-gradient(to bottom, ${tool.bg.from} , ${tool.bg.to})`}}/>
                <h3 className='mt-6 mb-3 text-lg font-semibold text-[var(--card-foreground)]'>{tool.title}</h3>
                <p className='text-[var(--muted-foreground)] text-sm max-w-[95%]'>{tool.description}</p>
            </div>
        ))}
      </div>
    </div>
  )
}

export default AiTools
