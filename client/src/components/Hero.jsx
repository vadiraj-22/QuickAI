import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Sparkles, Image as ImageIcon, FileText, Eraser } from 'lucide-react'
import { assets } from '../assets/assets'

const Hero = () => {
    const navigate = useNavigate()

    return (
        <section className='relative min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-12 xl:px-20 max-w-7xl mx-auto flex items-center justify-between'>
            
            <div className='w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center'>
                
                {/* Left Side Content */}
                <div className='lg:col-span-7 flex flex-col items-start text-left space-y-6'>
                    
                    {/* Simple Badge */}
                    <div className='inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-medium text-amber-300'>
                        <Sparkles className='size-3.5 text-amber-400' />
                        <span>AI CONTENT CREATION SUITE</span>
                    </div>

                    {/* Headline */}
                    <h1 className='text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.15]'>
                        Create articles, generate images & edit content with{' '}
                        <span className='text-amber-400'>
                            AI tools
                        </span>
                    </h1>

                    {/* Simple Sub-headline explaining actual functions */}
                    <p className='text-base sm:text-lg text-gray-300 max-w-xl leading-relaxed'>
                        Write full articles, generate catchy blog titles, create custom images from prompts, remove backgrounds, erase objects, and review resumes.
                    </p>

                    {/* Action Buttons with Fixed Accent Colors */}
                    <div className='flex flex-wrap items-center gap-4 pt-2 w-full sm:w-auto'>
                        <button 
                            onClick={() => navigate('/ai')} 
                            className='w-full sm:w-auto group relative inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-semibold text-gray-950 bg-amber-400 hover:bg-amber-300 rounded-full transition-all duration-200 shadow-[0_0_20px_rgba(251,191,36,0.25)] hover:shadow-[0_0_30px_rgba(251,191,36,0.4)] active:scale-[0.98] cursor-pointer'
                        >
                            <span>Get Started Free</span>
                            <ArrowRight className='size-4 transition-transform group-hover:translate-x-1' />
                        </button>

                        <a 
                            href="#features"
                            onClick={(e) => {
                                e.preventDefault();
                                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className='w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-medium text-gray-200 bg-white/[0.05] hover:bg-white/10 border border-white/10 rounded-full backdrop-blur-md transition-all duration-200 cursor-pointer'
                        >
                            <span>View All Tools</span>
                        </a>
                    </div>

                </div>

                {/* Right Side Modern Image & Tool Showcase */}
                <div className='lg:col-span-5 relative w-full flex justify-center lg:justify-end'>
                    
                    {/* Main Glass Card Frame */}
                    <div className='relative w-full max-w-md bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-2xl space-y-4 overflow-hidden'>
                        
                        {/* Real Rendered AI Image Preview */}
                        <div className='relative rounded-2xl overflow-hidden border border-white/10 aspect-[4/3] group'>
                            <img 
                                src={assets.ai_gen_img_1} 
                                alt="AI Generated Preview" 
                                className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
                            />
                            <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 text-left'>
                                <div className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/60 border border-white/10 backdrop-blur-md text-[11px] font-medium text-amber-300 w-fit mb-1'>
                                    <ImageIcon className='size-3' /> AI Image Generator
                                </div>
                                <p className='text-xs text-gray-200 font-medium truncate'>
                                    "A Boy on Boat fishing in Anime style"
                                </p>
                            </div>
                        </div>

                        {/* Article & BG Removal Floating Snippet Cards */}
                        <div className='grid grid-cols-2 gap-3'>
                            <div className='bg-black/40 border border-white/10 rounded-xl p-3 text-left space-y-1.5'>
                                <div className='flex items-center gap-1.5 text-xs text-amber-400 font-medium'>
                                    <FileText className='size-3.5' /> Article Writer
                                </div>
                                <p className='text-[11px] text-gray-300 leading-snug line-clamp-2'>
                                    Generate structured drafts & blog posts automatically.
                                </p>
                            </div>

                            <div className='bg-black/40 border border-white/10 rounded-xl p-3 text-left space-y-1.5'>
                                <div className='flex items-center gap-1.5 text-xs text-teal-400 font-medium'>
                                    <Eraser className='size-3.5' /> BG Remover
                                </div>
                                <p className='text-[11px] text-gray-300 leading-snug line-clamp-2'>
                                    Instant background removal for photos & graphics.
                                </p>
                            </div>
                        </div>

                    </div>

                </div>

            </div>
        </section>
    )
}

export default Hero


