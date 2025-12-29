import express from 'express'
import cors from 'cors'
import 'dotenv/config';
import { clerkMiddleware } from '@clerk/express'
import aiRouter from './routes/aiRoutes.js';
import connectCloudinary from './configs/cloudinary.js';
import userRouter from './routes/userRoutes.js';

// Vercel serverless configuration - v2


const app = express()

await connectCloudinary()

// Configure CORS BEFORE any other middleware
const allowedOrigins = [
    'https://quick-ai-gray.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.CLIENT_URL === origin) {
            callback(null, true);
        } else {
            callback(null, true); // Allow all for now to debug
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'x-clerk-auth-status', 'x-clerk-auth-reason', 'x-clerk-auth-message'],
    exposedHeaders: ['Content-Length', 'Content-Type'],
    maxAge: 86400,
    preflightContinue: false,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Handle OPTIONS requests explicitly using the same options
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(clerkMiddleware())

app.get('/', (_req, res) => res.send('Server is live!  '))

app.use('/api/ai', aiRouter)
app.use('/api/user', userRouter)

const PORT = process.env.PORT || 3000;

// For local development
app.listen(PORT, () => {
    console.log('Server is running on port', PORT);
});

// Export for Vercel serverless
export default app;
