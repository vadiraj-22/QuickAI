import { assets } from "../assets/assets"
import { Quote, Star } from "lucide-react"

const Testimonials = () => {
    const dummyTestimonialData = [
        {
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200",
            name: 'Arjun Mehta',
            title: 'Tech Blogger • Mumbai',
            content: 'As a blogger, I was struggling with writer\'s block. This tool helped me generate article ideas and polish my drafts. The background removal feature is a huge bonus!',
            rating: 5,
        },
        {
            image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200",
            name: 'Priya Sharma',
            title: 'Content Writer • Delhi',
            content: 'The article generation tool is surprisingly good. It gives me a solid first draft that I can refine. Saves me 2-3 hours per piece. Perfect for tight deadlines.',
            rating: 5,
        },
        {
            image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200",
            name: 'Rahul Verma',
            title: 'Marketing Specialist • Bangalore',
            content: 'The image generation feature helped me create unique visuals for client presentations. Much better than generic stock photos everyone else uses.',
            rating: 5,
        },
        {
            image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=200",
            name: 'Sneha Patel',
            title: 'Social Creator • Pune',
            content: 'The resume reviewer gave actionable feedback before placement season. Got my resume shortlisted at top firms! The AI tools are genuinely helpful.',
            rating: 5,
        },
        {
            image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200",
            name: 'Vikram Singh',
            title: 'Startup Founder • Hyderabad',
            content: 'Running a startup means wearing many hats. QuickAI lets me produce blog posts and social content without hiring full-time agency writers.',
            rating: 4,
        },
        {
            image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200",
            name: 'Ananya Reddy',
            title: 'Creative Director • Chennai',
            content: 'The blog title generator gives creative suggestions I wouldn\'t have thought of. It\'s like having a 24/7 brainstorming partner.',
            rating: 5,
        },
    ]

    return (
        <section id="testimonials" className='w-full py-24 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto space-y-16'>
            
            {/* Split Top Bar: Text Left, Ratings Right */}
            <div className='grid grid-cols-1 md:grid-cols-12 gap-8 items-end border-b border-white/10 pb-8 text-left'>
                <div className='md:col-span-8 space-y-3'>
                    <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-xs font-semibold text-amber-400'>
                        <Quote className='size-3.5' />
                        <span>CREATOR REVIEWS</span>
                    </div>
                    <h2 className='text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white'>
                        Trusted by writers, creators & teams worldwide
                    </h2>
                </div>
                <div className='md:col-span-4 md:text-right space-y-1'>
                    <div className='flex items-center md:justify-end gap-1 text-amber-400'>
                        {Array(5).fill(0).map((_, i) => (
                            <Star key={i} className='size-5 fill-amber-400' />
                        ))}
                    </div>
                    <p className='text-sm text-gray-300 font-medium'>
                        4.9 out of 5 stars based on 350+ reviews
                    </p>
                </div>
            </div>

            {/* Testimonials Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {dummyTestimonialData.map((testimonial, index) => (
                    <div 
                        key={index} 
                        className='relative rounded-3xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 p-7 backdrop-blur-xl transition-all duration-300 flex flex-col justify-between space-y-6 text-left shadow-lg hover:-translate-y-1'
                    >
                        <div className='space-y-4'>
                            {/* Stars */}
                            <div className="flex items-center gap-1">
                                {Array(5).fill(0).map((_, i) => (
                                    <Star 
                                        key={i} 
                                        className={`size-4 ${i < testimonial.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`} 
                                    />
                                ))}
                            </div>
                            
                            {/* Quote Content */}
                            <p className='text-gray-300 text-sm leading-relaxed italic'>
                                "{testimonial.content}"
                            </p>
                        </div>

                        {/* Author Info */}
                        <div className='pt-4 border-t border-white/10 flex items-center gap-3.5'>
                            <img 
                                src={testimonial.image} 
                                className='size-10 rounded-full object-cover ring-2 ring-amber-400/30' 
                                alt={testimonial.name} 
                            />
                            <div>
                                <h4 className='font-semibold text-sm text-white'>{testimonial.name}</h4>
                                <p className='text-xs text-gray-400'>{testimonial.title}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

        </section>
    )
}

export default Testimonials

