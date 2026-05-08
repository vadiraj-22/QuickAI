import { assets } from "../assets/assets"

const Testimonials = () => {
    const dummyTestimonialData = [
        {
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200",
            name: 'Arjun Mehta',
            title: 'Tech Blogger, Mumbai',
            content: 'As a student blogger, I was struggling with writer\'s block. This tool helped me generate article ideas and polish my drafts. The background removal feature is a bonus for my blog thumbnails!',
            rating: 5,
        },
        {
            image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200",
            name: 'Priya Sharma',
            title: 'Freelance Content Writer, Delhi',
            content: 'The article generation tool is surprisingly good. It gives me a solid first draft that I can refine. Saves me at least 2-3 hours per article. Perfect for meeting tight deadlines.',
            rating: 4,
        },
        {
            image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200",
            name: 'Rahul Verma',
            title: 'Digital Marketing Student, Bangalore',
            content: 'I use this for my college projects and internship work. The image generation feature helped me create unique visuals for presentations. Much better than stock photos everyone uses!',
            rating: 5,
        },
        {
            image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=200",
            name: 'Sneha Patel',
            title: 'Social Media Manager, Pune',
            content: 'The resume review feature gave me actionable feedback before campus placements. Got my resume shortlisted at 3 companies! The AI tools are genuinely helpful, not just gimmicky.',
            rating: 5,
        },
        {
            image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200",
            name: 'Vikram Singh',
            title: 'Startup Founder, Hyderabad',
            content: 'Running a bootstrap startup means wearing many hats. This tool helps me quickly create blog content and social media posts without hiring a full-time writer. The pricing is student-friendly too.',
            rating: 4,
        },
        {
            image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200",
            name: 'Ananya Reddy',
            title: 'Content Creator, Chennai',
            content: 'I was skeptical at first, but the blog title generator actually gives creative suggestions I wouldn\'t have thought of. It\'s like having a brainstorming partner available 24/7.',
            rating: 4,
        },
    ]

    return (
        <div id="testimonials" className='w-full px-4 sm:px-6 md:max-w-[90%] lg:max-w-[85%] xl:max-w-[80%] mx-auto py-24'>
            <div className='text-center'>
                <h2 className='text-gray-100 text-[42px] font-semibold'>Loved by Creators</h2>
                <p className='text-gray-400 max-w-lg mx-auto'>Don't just take our word for it. Here's what our users are saying.</p>
            </div>
            <div className='flex flex-wrap mt-10 justify-center'>
                {dummyTestimonialData.map((testimonial, index) => (
                    <div key={index} className='p-8 m-4 max-w-xs rounded-lg shadow-lg border hover:-translate-y-1 transition duration-300 cursor-pointer'
                         style={{
                           backgroundColor: 'rgba(255, 255, 255, 0.08)',
                           backdropFilter: 'blur(20px)',
                           WebkitBackdropFilter: 'blur(20px)',
                           border: '1px solid rgba(255, 255, 255, 0.18)',
                           boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
                         }}>
                        <div className="flex items-center gap-1">
                            {Array(5).fill(0).map((_,index)=>(<img key={index} src={index<testimonial.rating ? assets.star_icon : assets.star_dull_icon} className="w-4 h-4 brightness-150" alt="stars"/>))}
                        </div>
                        <p className='text-gray-400 text-sm my-5'>"{testimonial.content}"</p>
                        <hr className='mb-5 border-gray-700' />
                        <div className='flex items-center gap-4'>
                            <img src={testimonial.image} className='w-12 object-contain rounded-full' alt='' />
                            <div className='text-sm text-gray-300'>
                                <h3 className='font-medium text-gray-100'>{testimonial.name}</h3>
                                <p className='text-xs text-gray-400'>{testimonial.title}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
export default Testimonials
