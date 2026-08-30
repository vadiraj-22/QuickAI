import { GoogleGenerativeAI } from "@google/generative-ai";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import FormData from 'form-data';
import axios from 'axios';
import pdf from 'pdf-parse/lib/pdf-parse.js';
import { v2 as cloudinary } from 'cloudinary';

// Initialize Google Generative AI
const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "";
if (!apiKey) {
    console.error("❌ ERROR: GEMINI_API_KEY is missing or empty in .env file!");
} else {
    console.log(`✅ Gemini API Key found (starts with: ${apiKey.substring(0, 5)}...)`);
}
const genAI = new GoogleGenerativeAI(apiKey);

// Priority list of Gemini models to support modern and legacy versions
const CANDIDATE_MODELS = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-2.0-flash-001",
    "gemini-1.5-flash-latest",
    "gemini-1.5-flash-002",
    "gemini-1.5-flash",
    "gemini-2.5-pro",
    "gemini-1.5-pro-latest",
    "gemini-1.5-pro",
    "gemini-pro"
];

let workingModelName = null;

// Helper function with dynamic multi-model fallback and exponential backoff retry
const generateWithFallbackAndRetry = async (promptText, maxRetries = 3) => {
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not configured on the server. Please set GEMINI_API_KEY in environment variables.");
    }

    const modelsToTry = workingModelName
        ? [workingModelName, ...CANDIDATE_MODELS.filter(m => m !== workingModelName)]
        : CANDIDATE_MODELS;

    let lastError = null;

    for (const modelName of modelsToTry) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });

            for (let attempt = 0; attempt < maxRetries; attempt++) {
                try {
                    const result = await model.generateContent(promptText);
                    const response = await result.response;
                    const text = response.text();
                    if (text !== undefined && text !== null) {
                        workingModelName = modelName; // Persist known working model
                        return text;
                    }
                } catch (err) {
                    const isRateLimit = err.message?.includes('429') || err.status === 429 || err.message?.includes('Too Many Requests');
                    const isOverloaded = err.message?.includes('503') || err.status === 503;

                    if ((isRateLimit || isOverloaded) && attempt < maxRetries - 1) {
                        const delay = Math.pow(2, attempt + 1) * 1000 + Math.random() * 500;
                        console.log(`Gemini rate limited/busy on ${modelName} (attempt ${attempt + 1}/${maxRetries}). Retrying in ${Math.round(delay)}ms...`);
                        await new Promise(resolve => setTimeout(resolve, delay));
                        continue;
                    }
                    throw err;
                }
            }
        } catch (err) {
            lastError = err;
            const isNotFound = err.message?.includes('404') || err.status === 404 || err.message?.includes('not found');
            const isNotSupported = err.message?.includes('not supported for generateContent');

            if (isNotFound || isNotSupported) {
                console.warn(`Gemini model '${modelName}' not available/supported. Trying next candidate model...`);
                continue;
            }

            const isApiKeyInvalid = err.message?.includes('API_KEY_INVALID') || err.message?.includes('API key not valid');
            if (isApiKeyInvalid) {
                throw new Error("Invalid or expired GEMINI_API_KEY. Please check your Google AI Studio API key.");
            }

            const isQuotaExceeded = err.message?.includes('Quota') || err.message?.includes('RESOURCE_EXHAUSTED');
            if (isQuotaExceeded) {
                throw new Error("Gemini API quota exceeded for your Google account. Please upgrade or try again later.");
            }

            console.error(`Error with model '${modelName}':`, err.message);
        }
    }

    throw lastError || new Error("Failed to generate AI content with available Gemini models.");
};

// Helper function to extract userId safely
const getUserId = (req) => {
    if (req.userId) return req.userId;
    const authObj = typeof req.auth === 'function' ? req.auth() : (req.auth || {});
    return authObj.userId;
};

// Safe helper to get full user object from request or Clerk
const getFullUser = async (req, userId) => {
    if (req.user) return req.user;
    if (!userId) return null;
    try {
        return await clerkClient.users.getUser(userId);
    } catch (e) {
        return null;
    }
};

export const generateArticle = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { prompt, length } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage || 0;
        const user = await getFullUser(req, userId);

        if (!prompt || !prompt.trim()) {
            return res.status(400).json({ success: false, errorType: 'INVALID_INPUT', message: "Please provide a prompt or topic for the article." });
        }

        if (plan !== 'premium' && free_usage >= 10) {
            return res.status(403).json({ success: false, errorType: 'LIMIT_REACHED', message: "Free limit reached (10/10 articles). Upgrade to Premium for unlimited article writing." });
        }

        const fullPrompt = `Write a comprehensive, high quality article about "${prompt.trim()}". The article should be approximately ${length || 800} words long. Use clean markdown formatting with headers, bullet points, and paragraphs.`;

        const content = await generateWithFallbackAndRetry(fullPrompt);

        try {
            await sql`INSERT into creations (user_id, prompt, content, type)
            values(${userId}, ${prompt.trim()}, ${content}, 'article')`;
        } catch (dbErr) {
            console.error("Database save warning:", dbErr.message);
        }

        if (plan !== 'premium' && userId) {
            try {
                await clerkClient.users.updateUserMetadata(userId, {
                    privateMetadata: {
                        ...user?.privateMetadata,
                        free_usage: free_usage + 1
                    }
                });
            } catch (clerkErr) {
                console.error("Clerk metadata increment warning:", clerkErr.message);
            }
        }

        res.json({ success: true, content });

    } catch (error) {
        console.error('Error generating article:', error);
        res.status(500).json({ success: false, errorType: 'GENERATION_ERROR', message: error.message || "Failed to generate article. Please try again." });
    }
};

export const generateBlogTitle = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { prompt } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage || 0;
        const user = await getFullUser(req, userId);

        if (!prompt || !prompt.trim()) {
            return res.status(400).json({ success: false, errorType: 'INVALID_INPUT', message: "Please provide a keyword or topic for blog titles." });
        }

        if (plan !== 'premium' && free_usage >= 10) {
            return res.status(403).json({ success: false, errorType: 'LIMIT_REACHED', message: "Free limit reached (10/10 titles). Upgrade to Premium for unlimited title generation." });
        }

        const fullPrompt = `${prompt.trim()}. Return 5-10 catchy, SEO-optimized blog post titles formatted as a numbered markdown list.`;

        const content = await generateWithFallbackAndRetry(fullPrompt);

        try {
            await sql`INSERT into creations (user_id, prompt, content, type)
            values(${userId}, ${prompt.trim()}, ${content}, 'blog-title')`;
        } catch (dbErr) {
            console.error("Database save warning:", dbErr.message);
        }

        if (plan !== 'premium' && userId) {
            try {
                await clerkClient.users.updateUserMetadata(userId, {
                    privateMetadata: {
                        ...user?.privateMetadata,
                        free_usage: free_usage + 1
                    }
                });
            } catch (clerkErr) {
                console.error("Clerk metadata increment warning:", clerkErr.message);
            }
        }

        res.json({ success: true, content });

    } catch (error) {
        console.error('Error generating blog title:', error);
        res.status(500).json({ success: false, errorType: 'GENERATION_ERROR', message: error.message || "Failed to generate blog title. Please try again." });
    }
};

export const generateImage = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { prompt, publish } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage || 0;
        const user = await getFullUser(req, userId);

        if (!prompt || !prompt.trim()) {
            return res.status(400).json({ success: false, errorType: 'INVALID_INPUT', message: "Please provide a description/prompt for image generation." });
        }

        if (!process.env.CLIPDROP_API_KEY) {
            return res.status(500).json({ success: false, errorType: 'CONFIG_ERROR', message: "ClipDrop API key (CLIPDROP_API_KEY) is missing on the server." });
        }

        if (plan !== 'premium' && free_usage >= 5) {
            return res.status(403).json({ success: false, errorType: 'LIMIT_REACHED', message: "You've reached your free limit of 5 images. Upgrade to Premium for unlimited image generation." });
        }

        const formData = new FormData();
        formData.append('prompt', prompt.trim());

        let clipdropResponse;
        try {
            clipdropResponse = await axios.post("https://clipdrop-api.co/text-to-image/v1", formData, {
                headers: {
                    'x-api-key': process.env.CLIPDROP_API_KEY.trim(),
                    ...formData.getHeaders()
                },
                responseType: "arraybuffer",
                timeout: 50000
            });
        } catch (clipErr) {
            let detail = clipErr.message;
            if (clipErr.response?.data) {
                try {
                    const parsed = JSON.parse(Buffer.from(clipErr.response.data).toString());
                    detail = parsed.error || parsed.message || detail;
                } catch (_) {
                    const txt = Buffer.from(clipErr.response.data).toString();
                    if (txt && txt.length < 200) detail = txt;
                }
            }
            if (clipErr.response?.status === 402) {
                return res.status(402).json({ success: false, errorType: 'CREDITS_DEPLETED', message: "ClipDrop API credits depleted. Please top up your ClipDrop account credits." });
            }
            if (clipErr.response?.status === 429) {
                return res.status(429).json({ success: false, errorType: 'RATE_LIMIT', message: "ClipDrop API rate limit exceeded. Please wait a few seconds and try again." });
            }
            return res.status(502).json({ success: false, errorType: 'CLIPDROP_ERROR', message: `ClipDrop Image Generation Error: ${detail}` });
        }

        const base64Image = `data:image/png;base64,${Buffer.from(clipdropResponse.data).toString('base64')}`;

        let secure_url;
        try {
            const uploadResult = await cloudinary.uploader.upload(base64Image, {
                folder: 'quick-ai-images'
            });
            secure_url = uploadResult.secure_url;
        } catch (cloudErr) {
            return res.status(502).json({ success: false, errorType: 'CLOUDINARY_ERROR', message: `Cloudinary Image Upload Failed: ${cloudErr.message}` });
        }

        try {
            await sql`INSERT into creations (user_id, prompt, content, type, publish)
            values(${userId}, ${prompt.trim()}, ${secure_url}, 'image', ${publish ?? false})`;
        } catch (dbErr) {
            console.error("Database save warning:", dbErr.message);
        }

        if (plan !== 'premium' && userId) {
            try {
                await clerkClient.users.updateUserMetadata(userId, {
                    privateMetadata: {
                        ...user?.privateMetadata,
                        free_usage: free_usage + 1
                    }
                });
            } catch (clerkErr) {
                console.error("Clerk metadata increment warning:", clerkErr.message);
            }
        }

        res.json({ success: true, content: secure_url });

    } catch (error) {
        console.error('Error generating image:', error);
        res.status(500).json({ success: false, errorType: 'SERVER_ERROR', message: error.message || "Failed to generate image." });
    }
};

export const removeImageBackground = async (req, res) => {
    try {
        const userId = getUserId(req);
        const image = req.file;
        const plan = req.plan;
        const user = await getFullUser(req, userId);

        if (!image || !image.buffer) {
            return res.status(400).json({ success: false, errorType: 'INVALID_INPUT', message: "No image provided. Please upload an image file (JPG/PNG)." });
        }

        if (!process.env.CLIPDROP_API_KEY) {
            return res.status(500).json({ success: false, errorType: 'CONFIG_ERROR', message: "ClipDrop API key is not configured on the server." });
        }

        const bgRemovalUsage = user?.privateMetadata?.bg_removal_usage || 0;

        if (plan !== 'premium' && bgRemovalUsage >= 5) {
            return res.status(403).json({ success: false, errorType: 'LIMIT_REACHED', message: "You've reached your free limit of 5 background removals. Upgrade to Premium for unlimited removals." });
        }

        const formData = new FormData();
        formData.append('image_file', image.buffer, {
            filename: image.originalname || 'image.png',
            contentType: image.mimetype || 'image/png'
        });

        let response;
        try {
            response = await axios.post("https://clipdrop-api.co/remove-background/v1", formData, {
                headers: {
                    'x-api-key': process.env.CLIPDROP_API_KEY?.trim(),
                    ...formData.getHeaders()
                },
                responseType: "arraybuffer",
                timeout: 50000
            });
        } catch (clipErr) {
            let detail = clipErr.message;
            if (clipErr.response?.data) {
                try {
                    const parsed = JSON.parse(Buffer.from(clipErr.response.data).toString());
                    detail = parsed.error || parsed.message || detail;
                } catch (_) {
                    const txt = Buffer.from(clipErr.response.data).toString();
                    if (txt && txt.length < 200) detail = txt;
                }
            }
            if (clipErr.response?.status === 402) {
                return res.status(402).json({ success: false, errorType: 'CREDITS_DEPLETED', message: "ClipDrop credits depleted for background removal." });
            }
            return res.status(502).json({ success: false, errorType: 'CLIPDROP_ERROR', message: `ClipDrop Background Removal Error: ${detail}` });
        }

        const base64Image = `data:image/png;base64,${Buffer.from(response.data).toString('base64')}`;
        
        let secure_url;
        try {
            const uploadResult = await cloudinary.uploader.upload(base64Image, {
                folder: 'quick-ai-bg-removed'
            });
            secure_url = uploadResult.secure_url;
        } catch (cloudErr) {
            return res.status(502).json({ success: false, errorType: 'CLOUDINARY_ERROR', message: `Cloudinary Image Upload Failed: ${cloudErr.message}` });
        }

        try {
            await sql`INSERT into creations (user_id, prompt, content, type)
            values(${userId}, 'Remove background from the image', ${secure_url}, 'image')`;
        } catch (dbErr) {
            console.error("Database save warning:", dbErr.message);
        }

        const newUsage = bgRemovalUsage + 1;
        if (plan !== 'premium' && userId) {
            try {
                await clerkClient.users.updateUserMetadata(userId, {
                    privateMetadata: {
                        ...user?.privateMetadata,
                        bg_removal_usage: newUsage
                    }
                });
            } catch (clerkErr) {
                console.error("Clerk metadata increment warning:", clerkErr.message);
            }
        }

        res.json({
            success: true,
            content: secure_url,
            usageLeft: plan === 'premium' ? 'unlimited' : Math.max(0, 5 - newUsage)
        });

    } catch (error) {
        console.error('Error removing background:', error);
        res.status(500).json({ success: false, errorType: 'SERVER_ERROR', message: error.message || "Failed to remove background." });
    }
};

export const removeImageObject = async (req, res) => {
    try {
        const userId = getUserId(req);
        const image = req.file;
        const plan = req.plan;
        const { object } = req.body;
        const user = await getFullUser(req, userId);

        if (!image || !image.buffer) {
            return res.status(400).json({ success: false, errorType: 'INVALID_INPUT', message: "No image provided. Please upload an image." });
        }

        if (!object || !object.trim()) {
            return res.status(400).json({ success: false, errorType: 'INVALID_INPUT', message: "Please specify the object to remove." });
        }

        const objRemovalUsage = user?.privateMetadata?.obj_removal_usage || 0;

        if (plan !== 'premium' && objRemovalUsage >= 5) {
            return res.status(403).json({ success: false, errorType: 'LIMIT_REACHED', message: "You've reached your free limit of 5 object removals. Upgrade to Premium for unlimited removals." });
        }

        const base64DataUri = `data:${image.mimetype || 'image/png'};base64,${image.buffer.toString('base64')}`;
        
        let public_id;
        try {
            const uploadResult = await cloudinary.uploader.upload(base64DataUri, {
                resource_type: 'image',
                folder: 'quick-ai-obj-removal'
            });
            public_id = uploadResult.public_id;
        } catch (cloudErr) {
            return res.status(502).json({ success: false, errorType: 'CLOUDINARY_ERROR', message: `Cloudinary upload failed: ${cloudErr.message}` });
        }

        const cleanObject = object.trim();
        const imageUrl = cloudinary.url(public_id, {
            transformation: [{ effect: `gen_remove:prompt=${cleanObject}` }],
            resource_type: 'image',
            secure: true
        });

        try {
            await sql`INSERT into creations (user_id, prompt, content, type)
            values(${userId}, ${`Remove ${cleanObject} from the image`}, ${imageUrl}, 'image')`;
        } catch (dbErr) {
            console.error("Database save warning:", dbErr.message);
        }

        const newUsage = objRemovalUsage + 1;
        if (plan !== 'premium' && userId) {
            try {
                await clerkClient.users.updateUserMetadata(userId, {
                    privateMetadata: {
                        ...user?.privateMetadata,
                        obj_removal_usage: newUsage
                    }
                });
            } catch (clerkErr) {
                console.error("Clerk metadata increment warning:", clerkErr.message);
            }
        }

        res.json({
            success: true,
            content: imageUrl,
            usageLeft: plan === 'premium' ? 'unlimited' : Math.max(0, 5 - newUsage)
        });

    } catch (error) {
        console.error('Error removing object:', error.message);
        res.status(500).json({ success: false, errorType: 'SERVER_ERROR', message: error.message || "Failed to remove object." });
    }
};

export const resumeReview = async (req, res) => {
    try {
        const userId = getUserId(req);
        const resume = req.file;
        const plan = req.plan;
        const user = await getFullUser(req, userId);

        if (!resume || !resume.buffer) {
            return res.status(400).json({ success: false, errorType: 'INVALID_INPUT', message: "No resume provided. Please upload a PDF resume." });
        }

        const resumeReviewUsage = user?.privateMetadata?.resume_review_usage || 0;

        if (plan !== 'premium' && resumeReviewUsage >= 10) {
            return res.status(403).json({ success: false, errorType: 'LIMIT_REACHED', message: "You've reached your free limit of 10 resume reviews. Upgrade to Premium for unlimited usage." });
        }

        if (resume.size > 5 * 1024 * 1024) {
            return res.status(400).json({ success: false, errorType: 'FILE_TOO_LARGE', message: "Resume file size exceeds the allowed limit (5MB)." });
        }

        let pdfData;
        try {
            pdfData = await pdf(resume.buffer);
        } catch (pdfErr) {
            return res.status(400).json({ success: false, errorType: 'PDF_PARSE_ERROR', message: "Could not parse text from uploaded PDF. Please make sure the file contains selectable text." });
        }

        const prompt = `Review the following resume and provide constructive, actionable feedback on its strengths, weaknesses, formatting, impact, and areas for improvement. Use markdown formatting with clear headers.\n\nResume content:\n${pdfData.text}`;

        const content = await generateWithFallbackAndRetry(prompt);

        try {
            await sql`INSERT into creations (user_id, prompt, content, type)
            values(${userId}, 'Review the uploaded Resume', ${content}, 'resume-review')`;
        } catch (dbErr) {
            console.error("Database save warning:", dbErr.message);
        }

        const newUsage = resumeReviewUsage + 1;
        if (plan !== 'premium' && userId) {
            try {
                await clerkClient.users.updateUserMetadata(userId, {
                    privateMetadata: {
                        ...user?.privateMetadata,
                        resume_review_usage: newUsage
                    }
                });
            } catch (clerkErr) {
                console.error("Clerk metadata increment warning:", clerkErr.message);
            }
        }

        res.json({
            success: true,
            content,
            usageLeft: plan === 'premium' ? 'unlimited' : Math.max(0, 10 - newUsage)
        });

    } catch (error) {
        console.error('Error in resume review:', error);
        res.status(500).json({ success: false, errorType: 'GENERATION_ERROR', message: error.message || "Failed to review resume. Please try again." });
    }
};
