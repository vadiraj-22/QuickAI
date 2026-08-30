import multer from "multer"

// Use memoryStorage for serverless environments (Vercel/Lambda)
// This avoids filesystem writes to disk and provides req.file.buffer directly
const storage = multer.memoryStorage()

export const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
})