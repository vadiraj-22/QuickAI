import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_YnJpZ2h0LWJhc2lsaXNrLTc2LmNsZXJrLmFjY291bnRzLmRldiQ'

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key')
}


createRoot(document.getElementById('root')).render(
  <ClerkProvider
    publishableKey={PUBLISHABLE_KEY}
    signInFallbackRedirectUrl='/ai'
    signUpFallbackRedirectUrl='/ai'
    afterSignOutUrl='/'
  >
  <BrowserRouter>
    <App />
  </BrowserRouter>
  </ClerkProvider>
)
