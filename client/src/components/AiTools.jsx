import React from 'react'
import { AiToolsData, assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { useUser, useClerk } from '@clerk/clerk-react'
import { ArrowRight, Sparkles, CheckCircle2, FileText, Image as ImageIcon, Eraser, Scissors } from 'lucide-react'

const AiTools = () => {
    const navigate = useNavigate()
    const { user } = useUser()
    const { openSignIn } = useClerk()

    const handleToolClick = (path) => {
        if (user) {
            navigate(path)
        } else {
            navigate('/ai')
        }
    }

    return (
        <section id="features" className='w-full py-24 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto space-y-28'>
            
            {/* Section Header */}
            <div className='flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8 text-left'>
                <div className='space-y-3 max-w-2xl'>
                    <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-semibold text-amber-400'>
                        <Sparkles className='size-3.5' />
                        <span>AI TOOLS SUITE</span>
                    </div>
                    <h2 className='text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white'>
                        Everything you need to write, edit & analyze content
                    </h2>
                </div>
                <p className='text-gray-300 text-sm sm:text-base max-w-md md:text-right leading-relaxed'>
                    Explore our tools: AI Article Writer, Blog Title Generator, AI Image Generator, AI Background Remover, AI Object Remover, and AI Resume Analyzer.
                </p>
            </div>

            {/* Showcase 1: Article Writer & Blog Titles (Text Left, Card Right) */}
            <div className='grid grid-cols-1 lg:grid-cols-12 gap-10 items-center'>
                {/* Text Left */}
                <div className='lg:col-span-6 space-y-6 text-left'>
                    <span className='text-xs font-mono text-amber-400 tracking-wider uppercase font-semibold bg-amber-400/10 px-3 py-1 rounded-md border border-amber-400/20 inline-block'>
                        WRITING & TITLES
                    </span>
                    <h3 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight'>
                        AI Article Writer & Blog Title Generator
                    </h3>
                    <p className='text-gray-300 text-sm sm:text-base leading-relaxed'>
                        Write articles on any topic or generate catchy titles for your blog posts with AI assistance.
                    </p>
                    
                    <ul className='space-y-3 pt-2 text-sm text-gray-300'>
                        <li className='flex items-center gap-3'>
                            <CheckCircle2 className='size-4 text-amber-400 shrink-0' />
                            <span>Generates article drafts with headers & bullet points</span>
                        </li>
                        <li className='flex items-center gap-3'>
                            <CheckCircle2 className='size-4 text-amber-400 shrink-0' />
                            <span>Creates creative blog title options based on keywords</span>
                        </li>
                        <li className='flex items-center gap-3'>
                            <CheckCircle2 className='size-4 text-amber-400 shrink-0' />
                            <span>Formatted ready-to-use markdown output</span>
                        </li>
                    </ul>

                    <div className='pt-4 flex items-center gap-4'>
                        <button
                            onClick={() => handleToolClick('/ai/write-article')}
                            className='inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-400 hover:bg-amber-300 text-gray-950 font-semibold text-sm transition-all shadow-[0_0_20px_rgba(251,191,36,0.25)] hover:scale-105 cursor-pointer'
                        >
                            <span>Open Article Writer</span>
                            <ArrowRight className='size-4' />
                        </button>
                        <button
                            onClick={() => handleToolClick('/ai/blog-titles')}
                            className='inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/[0.05] hover:bg-white/10 text-gray-200 font-medium text-sm border border-white/10 transition-all cursor-pointer'
                        >
                            <span>Blog Titles</span>
                        </button>
                    </div>
                </div>

                {/* Card Right - Article Mockup */}
                <div className='lg:col-span-6'>
                    <div className='relative rounded-3xl bg-white/[0.03] border border-white/10 p-6 backdrop-blur-2xl shadow-2xl space-y-4 text-left'>
                        <div className='flex items-center justify-between border-b border-white/10 pb-3'>
                            <div className='flex items-center gap-2'>
                                <FileText className='size-4 text-amber-400' />
                                <span className='text-xs font-semibold text-gray-200'>Article Preview</span>
                            </div>
                        </div>
                        <div className='bg-black/50 rounded-2xl p-5 border border-white/5 space-y-3 text-xs text-gray-300 font-mono'>
                            <p className='text-amber-400 font-bold text-sm'>## AI and Coding: A Symbiotic Partnership</p>
                            <p className='text-gray-300 leading-relaxed'>
                                Artificial intelligence and coding are deeply intertwined, forging a powerful relationship that accelerates software development...
                            </p>
                            <div className='pt-2 flex flex-wrap gap-2 text-[11px] text-gray-400 font-sans'>
                                <span className='bg-white/10 px-2 py-0.5 rounded'># Technology</span>
                                <span className='bg-white/10 px-2 py-0.5 rounded'># AI & Coding</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Showcase 2: AI Image Generator, Background & Object Removal (Image Left, Text Right) */}
            <div className='grid grid-cols-1 lg:grid-cols-12 gap-10 items-center'>
                {/* Image Left - Real Asset Images */}
                <div className='lg:col-span-6 order-2 lg:order-1'>
                    <div className='relative rounded-3xl bg-white/[0.03] border border-white/10 p-5 backdrop-blur-2xl shadow-2xl space-y-4'>
                        <div className='grid grid-cols-2 gap-3'>
                            <div className='relative rounded-2xl overflow-hidden border border-white/10 aspect-[4/3] group'>
                                <img 
                                    src={assets.ai_gen_img_2} 
                                    alt="Anime Bicycle" 
                                    className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
                                />
                                <div className='absolute inset-0 bg-black/40 flex items-end p-3 text-left'>
                                    <span className='text-[11px] text-gray-200 font-medium truncate'>AI Image Generation</span>
                                </div>
                            </div>

                            <div className='relative rounded-2xl overflow-hidden border border-white/10 aspect-[4/3] group'>
                                <img 
                                    src={assets.ai_gen_img_3} 
                                    alt="Car on Sky" 
                                    className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
                                />
                                <div className='absolute inset-0 bg-black/40 flex items-end p-3 text-left'>
                                    <span className='text-[11px] text-gray-200 font-medium truncate'>Realistic Render</span>
                                </div>
                            </div>
                        </div>
                        <div className='flex items-center justify-between text-xs text-gray-400 px-1 text-left'>
                            <span className='flex items-center gap-1.5 text-gray-300'>
                                <ImageIcon className='size-3.5 text-amber-400' /> AI Image Generator & Photo Editing
                            </span>
                        </div>
                    </div>
                </div>

                {/* Text Right */}
                <div className='lg:col-span-6 order-1 lg:order-2 space-y-6 text-left'>
                    <span className='text-xs font-mono text-amber-400 tracking-wider uppercase font-semibold bg-amber-400/10 px-3 py-1 rounded-md border border-amber-400/20 inline-block'>
                        IMAGE & PHOTO EDITING
                    </span>
                    <h3 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight'>
                        AI Image Generator, AI Background Remover & AI Object Remover
                    </h3>
                    <p className='text-gray-300 text-sm sm:text-base leading-relaxed'>
                        Generate unique artwork from prompts, isolate subjects with AI background removal, or erase unwanted objects from photos seamlessly.
                    </p>

                    <ul className='space-y-3 pt-2 text-sm text-gray-300'>
                        <li className='flex items-center gap-3'>
                            <CheckCircle2 className='size-4 text-amber-400 shrink-0' />
                            <span><strong>AI Image Generator:</strong> Create art in styles like Anime or Realistic</span>
                        </li>
                        <li className='flex items-center gap-3'>
                            <CheckCircle2 className='size-4 text-amber-400 shrink-0' />
                            <span><strong>AI Background Remover:</strong> Extract photo subjects with transparent output</span>
                        </li>
                        <li className='flex items-center gap-3'>
                            <CheckCircle2 className='size-4 text-amber-400 shrink-0' />
                            <span><strong>AI Object Remover:</strong> Remove unwanted elements & clutter from photos</span>
                        </li>
                    </ul>

                    <div className='pt-4 flex flex-wrap items-center gap-3'>
                        <button
                            onClick={() => handleToolClick('/ai/generate-images')}
                            className='inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-gray-950 font-semibold text-xs transition-all shadow-[0_0_15px_rgba(251,191,36,0.25)] cursor-pointer'
                        >
                            <span>Generate Images</span>
                            <ArrowRight className='size-3.5' />
                        </button>
                        <button
                            onClick={() => handleToolClick('/ai/remove-background')}
                            className='inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/[0.05] hover:bg-white/10 text-gray-200 font-medium text-xs border border-white/10 transition-all cursor-pointer'
                        >
                            <Eraser className='size-3.5 text-amber-400' />
                            <span>Remove BG</span>
                        </button>
                        <button
                            onClick={() => handleToolClick('/ai/remove-object')}
                            className='inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/[0.05] hover:bg-white/10 text-gray-200 font-medium text-xs border border-white/10 transition-all cursor-pointer'
                        >
                            <Scissors className='size-3.5 text-amber-400' />
                            <span>Remove Object</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Showcase 3: AI Resume Analyzer & Reviewer (Text Left, Card Right) */}
            <div className='grid grid-cols-1 lg:grid-cols-12 gap-10 items-center'>
                {/* Text Left */}
                <div className='lg:col-span-6 space-y-6 text-left'>
                    <span className='text-xs font-mono text-amber-400 tracking-wider uppercase font-semibold bg-amber-400/10 px-3 py-1 rounded-md border border-amber-400/20 inline-block'>
                        CAREER & RESUME ANALYSIS
                    </span>
                    <h3 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight'>
                        AI Resume Analyzer & Feedback
                    </h3>
                    <p className='text-gray-300 text-sm sm:text-base leading-relaxed'>
                        Upload or paste your resume text to get intelligent AI feedback, actionable formatting suggestions, and skill gap analysis to land your target role.
                    </p>

                    <ul className='space-y-3 pt-2 text-sm text-gray-300'>
                        <li className='flex items-center gap-3'>
                            <CheckCircle2 className='size-4 text-amber-400 shrink-0' />
                            <span>Detailed analysis of work experience & bullet impact</span>
                        </li>
                        <li className='flex items-center gap-3'>
                            <CheckCircle2 className='size-4 text-amber-400 shrink-0' />
                            <span>Identifies missing keywords & resume formatting improvements</span>
                        </li>
                        <li className='flex items-center gap-3'>
                            <CheckCircle2 className='size-4 text-amber-400 shrink-0' />
                            <span>Actionable suggestions to improve interview callbacks</span>
                        </li>
                    </ul>

                    <div className='pt-4'>
                        <button
                            onClick={() => handleToolClick('/ai/review-resume')}
                            className='inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-400 hover:bg-amber-300 text-gray-950 font-semibold text-sm transition-all shadow-[0_0_20px_rgba(251,191,36,0.25)] hover:scale-105 cursor-pointer'
                        >
                            <span>Open Resume Analyzer</span>
                            <ArrowRight className='size-4' />
                        </button>
                    </div>
                </div>

                {/* Card Right - Resume Review Mockup */}
                <div className='lg:col-span-6'>
                    <div className='relative rounded-3xl bg-white/[0.03] border border-white/10 p-6 backdrop-blur-2xl shadow-2xl space-y-4 text-left'>
                        <div className='flex items-center justify-between border-b border-white/10 pb-3'>
                            <div className='flex items-center gap-2'>
                                <FileText className='size-4 text-amber-400' />
                                <span className='text-xs font-semibold text-gray-200'>AI Resume Feedback Preview</span>
                            </div>
                        </div>
                        <div className='bg-black/50 rounded-2xl p-5 border border-white/5 space-y-3 text-xs text-gray-300 font-sans'>
                            <div className='flex items-center justify-between'>
                                <span className='font-bold text-white text-sm'>Software Engineer Resume</span>
                                <span className='text-amber-400 font-semibold text-xs bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20'>AI Review Active</span>
                            </div>
                            <p className='text-gray-300 text-xs leading-relaxed'>
                                Key Strengths: Strong technical project descriptions. Suggestions: Quantify impact on recent engineering roles (e.g. reduced load times by 35%).
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bento Grid Section Header */}
            <div className='pt-12 border-t border-white/10 text-left space-y-2'>
                <h3 className='text-2xl sm:text-3xl font-bold text-white'>Explore All 6 AI Tools</h3>
                <p className='text-gray-300 text-sm'>Select any tool below to launch directly into its workspace.</p>
            </div>

            {/* Bento Tool Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {AiToolsData.map((tool, index) => (
                    <div 
                        key={index} 
                        onClick={() => handleToolClick(tool.path)}
                        className='group relative rounded-3xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-white/20 p-7 backdrop-blur-xl transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-6 shadow-lg hover:-translate-y-1 text-left'
                    >
                        <div className='space-y-4'>
                            <div className='flex items-center justify-between'>
                                <div 
                                    className='size-12 rounded-2xl flex items-center justify-center text-white shadow-md transition-transform duration-300 group-hover:scale-110'
                                    style={{ background: `linear-gradient(135deg, ${tool.bg.from}, ${tool.bg.to})` }}
                                >
                                    <tool.Icon className='size-6' />
                                </div>
                                <span className='text-xs font-medium text-amber-400 flex items-center gap-1'>
                                    <span>Open</span>
                                    <ArrowRight className='size-3.5 transition-transform group-hover:translate-x-1' />
                                </span>
                            </div>
                            <div>
                                <h4 className='text-lg font-semibold text-white group-hover:text-amber-300 transition-colors'>
                                    {tool.title}
                                </h4>
                                <p className='text-gray-300 text-xs sm:text-sm mt-2 leading-relaxed'>
                                    {tool.description}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

        </section>
    )
}

export default AiTools



