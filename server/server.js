import express from 'express'
import cors from 'cors'
import 'dotenv/config';
import { clerkMiddleware } from '@clerk/express'
import aiRouter from './routes/aiRoutes.js';
import connectCloudinary from './configs/cloudinary.js';
import userRouter from './routes/userRoutes.js';

// Vercel serverless configuration - v2


const app=express()

await connectCloudinary()

// Configure CORS with specific options for production
app.use(cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}))

// Handle preflight requests
app.options('*', cors())

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(clerkMiddleware())

app.get('/' ,(_req,res)=>res.send('Server is live!'))

app.use('/api/ai',aiRouter)
app.use('/api/user',userRouter)

const PORT=process.env.PORT  || 3000;

// For local development
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT ,()=>{
        console.log('server is running on port',PORT);
    })
}

// Export for Vercel serverless
export default app;
