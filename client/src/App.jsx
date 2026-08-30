import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Layout from './pages/Layout'
import Dashboard from './pages/Dashboard'
import WriteArticle from './pages/WriteArticle'
import BlogTitles from './pages/BlogTitles'
import GenerateImages from './pages/GenerateImages'
import RemoveBackground from './pages/RemoveBackground'
import Community from './pages/Community'
import RemoveObject from './pages/RemoveObject'
import ReviewResume from './pages/ReviewResume'
import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react'
import { Toaster} from 'react-hot-toast'

// SSO callback page — handles OAuth redirect after Google sign-in
const SSOCallback = () => (
  <div className='flex items-center justify-center h-screen bg-[#090912]'>
    <AuthenticateWithRedirectCallback />
  </div>
)


const App = () => {

  return (
    <div className='min-h-screen bg-[#090912]'>
      <Toaster />
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/sso-callback' element={<SSOCallback/>}/>
        <Route path='/ai' element={<Layout/>}>
          <Route index element={<Dashboard/>}/>
          <Route path='write-article' element={<WriteArticle/>}/>
          <Route path='blog-titles' element={<BlogTitles/>}/>
          <Route path='generate-images' element={<GenerateImages/>}/>
          <Route path='remove-background' element={<RemoveBackground/>}/>
          <Route path='community' element={<Community/>}/>
          <Route path='remove-object' element={<RemoveObject/>}/>
          <Route path='review-resume' element={<ReviewResume/>}/>
        </Route>
      </Routes>
    </div>
  )
}

export default App
