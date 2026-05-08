import React from 'react'
import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { ArrowRight } from 'lucide-react'

const Hero = () => {
    const navigate = useNavigate()

    return (
        <div className='relative flex flex-col items-center justify-center text-sm px-4 sm:px-8 md:px-16 lg:px-24 xl:px-40 text-[var(--foreground)] min-h-screen pt-32 pb-20'>
            {/* Gradient Background Blur using theme colors */}
            <div className='absolute top-28 xl:top-10 -z-10 left-1/4 size-72 sm:size-96 xl:size-[30rem] 2xl:size-[33rem] bg-[var(--primary)] blur-[120px] opacity-20'></div>

            {/* Avatars + Stars */}
            <div className='flex items-center mt-8 mb-6'>
                <div className='flex -space-x-3 pr-3'>
                    <img 
                        src='https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200' 
                        alt='user1' 
                        className='size-8 object-cover rounded-full border-2 border-[var(--border)] hover:-translate-y-0.5 transition z-[1]' 
                    />
                    <img 
                        src='https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200' 
                        alt='user2' 
                        className='size-8 object-cover rounded-full border-2 border-[var(--border)] hover:-translate-y-0.5 transition z-[2]' 
                    />
                    <img 
                        src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200' 
                        alt='user3' 
                        className='size-8 object-cover rounded-full border-2 border-[var(--border)] hover:-translate-y-0.5 transition z-[3]' 
                    />
                    <img 
                        src='https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200' 
                        alt='user4' 
                        className='size-8 object-cover rounded-full border-2 border-[var(--border)] hover:-translate-y-0.5 transition z-[4]' 
                    />
                    <img 
                        src='https://randomuser.me/api/portraits/men/75.jpg' 
                        alt='user5' 
                        className='size-8 rounded-full border-2 border-[var(--border)] hover:-translate-y-0.5 transition z-[5]' 
                    />
                </div>
                <div>
                    <div className='flex'>
                        {Array(5).fill(0).map((_, i) => (
                            <svg 
                                key={i} 
                                xmlns='http://www.w3.org/2000/svg' 
                                width='16' 
                                height='16' 
                                viewBox='0 0 24 24' 
                                fill='none' 
                                stroke='currentColor' 
                                strokeWidth='2' 
                                strokeLinecap='round' 
                                strokeLinejoin='round' 
                                className='lucide lucide-star text-transparent fill-[var(--accent)]' 
                                aria-hidden='true'
                            >
                                <path d='M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z'></path>
                            </svg>
                        ))}
                    </div>
                    <p className='text-sm text-[var(--muted-foreground)]'>Used by 350+ users</p>
                </div>
            </div>

            {/* Headline + Description */}
            <h1 className='text-5xl md:text-6xl lg:text-7xl font-semibold max-w-5xl text-center mt-4 leading-tight md:leading-tight'>
                Create amazing content <br /> with{' '}
                <span className='bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--accent)] bg-clip-text text-transparent text-nowrap'>
                    AI tools
                </span>
            </h1>
            <p className='max-w-xl text-center text-base md:text-lg my-7 text-[var(--muted-foreground)]'>
                Transform your content creation with our suite of premium AI tools. Write Articles, Generate Images, and enhance your workflow.
            </p>

            {/* CTA Button */}
            <div className='flex items-center gap-4 flex-wrap justify-center'>
                <button 
                    onClick={() => navigate('/ai')} 
                    className='relative bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 text-gray-900 font-semibold rounded-full px-9 h-12 m-1 flex items-center transition-all active:scale-95 shadow-lg overflow-hidden group'
                    style={{ boxShadow: '0 10px 40px -10px rgba(234, 179, 8, 0.6)' }}
                >
                    {/* Shining animation overlay */}
                    <span className='absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 group-hover:animate-[shine_1.5s_ease-in-out_infinite]' 
                          style={{ transform: 'translateX(-100%)', animation: 'shine 3s ease-in-out infinite' }}></span>
                    <span className='relative z-10'>Get started</span>
                    <ArrowRight className='ml-2 size-4 relative z-10' />
                </button>
            </div>
        </div>
    )
}

export default Hero
