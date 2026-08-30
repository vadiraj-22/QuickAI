import express from 'express'
import cors from 'cors'
import 'dotenv/config';
import { clerkMiddleware } from '@clerk/express'
import aiRouter from './routes/aiRoutes.js';
import connectCloudinary from './configs/cloudinary.js';
import userRouter from './routes/userRoutes.js';

// Vercel serverless configuration - v2


const app = express()

try {
    await connectCloudinary()
} catch (e) {
    console.error('Cloudinary configuration error:', e.message);
}

// 1. Direct CORS preflight and headers handler for all incoming requests (Vercel serverless friendly)
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-clerk-auth-status, x-clerk-auth-reason, x-clerk-auth-message');
    res.setHeader('Access-Control-Max-Age', '86400');

    // Instantly respond to preflight OPTIONS requests before any authentication middleware
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

// Configure CORS package as secondary safeguard
const allowedOrigins = [
    'https://quick-ai-gray.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (
            allowedOrigins.indexOf(origin) !== -1 ||
            process.env.CLIENT_URL === origin ||
            origin.endsWith('.vercel.app')
        ) {
            callback(null, true);
        } else {
            callback(null, true);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'x-clerk-auth-status', 'x-clerk-auth-reason', 'x-clerk-auth-message'],
    exposedHeaders: ['Content-Length', 'Content-Type'],
    maxAge: 86400,
    preflightContinue: false,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(clerkMiddleware())

app.get('/', (_req, res) => res.send('Server is live!'))

app.use('/api/ai', aiRouter)
app.use('/api/user', userRouter)

// Global error handler so unexpected errors return JSON instead of crashing Vercel Serverless Function
app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

const PORT = process.env.PORT || 3000;

// For local development (only start listener if not running as a Vercel serverless function)
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log('Server is running on port', PORT);
    });
}

// Export for Vercel serverless
export default app;
