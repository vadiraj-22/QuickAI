import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { clerkMiddleware } from '@clerk/express';
import aiRouter from './routes/aiRoutes.js';
import connectCloudinary from './configs/cloudinary.js';
import userRouter from './routes/userRoutes.js';

const app = express();

// Initialize Cloudinary connection
try {
  await connectCloudinary();
} catch (e) {
  console.error('Cloudinary configuration error:', e.message);
}

// Dynamic allowed origins parser supporting env vars, localhost, vercel, and render
const parseAllowedOrigins = () => {
  const envUrls = (process.env.CLIENT_URL || process.env.FRONTEND_URL || '')
    .split(',')
    .map(url => url.trim().replace(/\/+$/, ''))
    .filter(Boolean);

  return [
    ...envUrls,
    'https://quick-ai-gray.vercel.app',
    'https://quickai-t4a8.onrender.com',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:4173',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
  ];
};

const isOriginAllowed = (origin) => {
  if (!origin) return true; // Allow server-to-server or same-origin requests
  
  const allowedList = parseAllowedOrigins();
  if (allowedList.includes(origin)) return true;

  // Dynamically allow any Vercel or Render domain
  if (origin.endsWith('.vercel.app') || origin.endsWith('.onrender.com')) {
    return true;
  }

  // Dynamically allow local development ports
  if (/^http:\/\/localhost(:\d+)?$/.test(origin) || /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) {
    return true;
  }

  return false;
};

// 1. Direct CORS preflight and headers handler for all incoming requests (Vercel & Render friendly)
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else if (!origin) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-clerk-auth-status, x-clerk-auth-reason, x-clerk-auth-message');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Instantly respond to preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Configure CORS middleware as secondary safeguard
app.use(cors({
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive callback to prevent CORS blocking while setting headers correctly
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'x-clerk-auth-status', 'x-clerk-auth-reason', 'x-clerk-auth-message'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  maxAge: 86400,
  optionsSuccessStatus: 200,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(clerkMiddleware());

// Health Check and Root API status endpoints (always returning JSON)
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'QuickAI Backend is live and running!',
    status: 'healthy',
    platform: process.env.VERCEL ? 'vercel-serverless' : 'node-standalone',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Mount main API routers
app.use('/api/ai', aiRouter);
app.use('/api/user', userRouter);

// 404 Catch-all handler for unmatched routes (prevents returning 200/HTML on typos or invalid methods)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    errorType: 'NOT_FOUND',
    message: `API route not found: ${req.method} ${req.originalUrl || req.url}`,
  });
});

// Global error handler returning standard JSON
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    errorType: err.name || 'SERVER_ERROR',
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 3000;

// For standalone server deployments (Render, Railway, VPS, Localhost)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export for Vercel serverless functions
export default app;
