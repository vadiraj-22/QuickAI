import multer from "multer"
import path from "path"
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import os from 'os'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Use system temp directory (works on Windows, Linux, and Vercel)
const getTempDir = () => {
    // For Vercel serverless, /tmp is available
    if (process.env.VERCEL) {
        return '/tmp'
    }
    // For local development, use OS temp directory
    const tempDir = os.tmpdir()
    // Ensure the directory exists
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true })
    }
    return tempDir
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, getTempDir())
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
})

export const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
})