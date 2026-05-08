import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
<footer className="w-full px-4 sm:px-6 md:max-w-[90%] lg:max-w-[85%] xl:max-w-[80%] mx-auto pt-8 text-gray-400 mt-20">
    <div className="flex flex-col md:flex-row justify-between w-full gap-10 border-b border-gray-700 pb-6">
        <div className="md:max-w-96">
            <img className="h-9" style={{ filter: 'brightness(0) saturate(100%) invert(68%) sepia(85%) saturate(500%) hue-rotate(1deg) brightness(105%) contrast(101%)' }} src={assets.logo} alt="Logo"/>
            <p className="mt-6 text-sm">
                Experience the power of AI with QuickAI. <br /> Transform your content creation with our suite of premium AI tools Write Articles, Generate Images, and enhance your workflow.
            </p>
        </div>
        <div className="flex-1 flex items-start md:justify-end gap-20">
            <div>
                <h2 className="font-semibold mb-5 text-gray-200">Company</h2>
                <ul className="text-sm space-y-2">
                    <li><a href="#" className="hover:text-yellow-400 transition">Home</a></li>
                    <li><a href="#" className="hover:text-yellow-400 transition">About us</a></li>
                    <li><a href="#" className="hover:text-yellow-400 transition">Contact us</a></li>
                    <li><a href="#" className="hover:text-yellow-400 transition">Privacy policy</a></li>
                </ul>
            </div>
            <div>
                <h2 className="font-semibold text-gray-200 mb-5">Subscribe to our newsletter</h2>
                <div className="text-sm space-y-2">
                    <p>The latest news, articles, and resources, sent to your inbox weekly.</p>
                    <div className="flex items-center gap-2 pt-4">
                        <input className="border border-gray-700 bg-gray-900 text-gray-300 placeholder-gray-500 focus:ring-2 ring-yellow-500 outline-none w-full max-w-64 h-9 rounded px-2" type="email" placeholder="Enter your email"/>
                        <button className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 w-24 h-9 text-gray-900 font-semibold rounded cursor-pointer transition shadow-lg" style={{ boxShadow: '0 4px 20px -5px rgba(234, 179, 8, 0.5)' }}>Subscribe</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <p className="pt-4 text-center text-xs md:text-sm pb-5">
        Copyright 2025 © VRJ. All Right Reserved.
    </p>
</footer>
  )
}

export default Footer
