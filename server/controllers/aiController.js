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
                throw new Error("Invalid or expired GEMINI_API_KEY. Please provide a valid Gemini API key in your server environment variables.");
            }

            const isQuotaExceeded = err.message?.includes('Quota') || err.message?.includes('RESOURCE_EXHAUSTED');
            if (isQuotaExceeded) {
                throw new Error("Gemini API quota exceeded. Please try again later or upgrade your Google AI plan.");
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
            return res.json({ success: false, message: "Please provide a prompt/topic for the article." });
        }

        if (plan !== 'premium' && free_usage >= 10) {
            return res.json({ success: false, message: "Free limit reached. Maximum usage limit is 10 articles." });
        }

        const fullPrompt = `Write a comprehensive, high quality article about "${prompt.trim()}". The article should be approximately ${length || 800} words long. Use clean markdown formatting with headers, bullet points, and paragraphs.`;

        const content = await generateWithFallbackAndRetry(fullPrompt);

        await sql`INSERT into creations (user_id, prompt, content, type)
        values(${userId}, ${prompt.trim()}, ${content}, 'article')`;

        if (plan !== 'premium' && userId) {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    ...user?.privateMetadata,
                    free_usage: free_usage + 1
                }
            });
        }

        res.json({ success: true, content });

    } catch (error) {
        console.error('Error generating article:', error);
        res.json({ success: false, message: error.message || "Failed to generate article. Please try again." });
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
            return res.json({ success: false, message: "Please provide a keyword or topic for blog titles." });
        }

        if (plan !== 'premium' && free_usage >= 10) {
            return res.json({ success: false, message: "Free limit reached. Maximum usage limit is 10 title generations." });
        }

        const fullPrompt = `${prompt.trim()}. Return 5-10 catchy, SEO-optimized blog post titles formatted as a numbered markdown list.`;

        const content = await generateWithFallbackAndRetry(fullPrompt);

        await sql`INSERT into creations (user_id, prompt, content, type)
        values(${userId}, ${prompt.trim()}, ${content}, 'blog-title')`;

        if (plan !== 'premium' && userId) {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    ...user?.privateMetadata,
                    free_usage: free_usage + 1
                }
            });
        }

        res.json({ success: true, content });

    } catch (error) {
        console.error('Error generating blog title:', error);
        res.json({ success: false, message: error.message || "Failed to generate blog title. Please try again." });
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
            return res.json({ success: false, message: "Please provide a prompt for image generation." });
        }

        if (!process.env.CLIPDROP_API_KEY) {
            return res.json({ success: false, message: "CLIPDROP_API_KEY is not configured on the server." });
        }

        if (plan !== 'premium' && free_usage >= 5) {
            return res.json({ success: false, message: "You've reached your free limit of 5 images. Upgrade to premium for unlimited image generation." });
        }

        const formData = new FormData();
        formData.append('prompt', prompt.trim());

        const response = await axios.post("https://clipdrop-api.co/text-to-image/v1", formData, {
            headers: {
                'x-api-key': process.env.CLIPDROP_API_KEY.trim(),
                ...formData.getHeaders()
            },
            responseType: "arraybuffer",
        });

        const base64Image = `data:image/png;base64,${Buffer.from(response.data).toString('base64')}`;
        const { secure_url } = await cloudinary.uploader.upload(base64Image);

        await sql`INSERT into creations (user_id, prompt, content, type, publish)
        values(${userId}, ${prompt.trim()}, ${secure_url}, 'image', ${publish ?? false})`;

        if (plan !== 'premium' && userId) {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    ...user?.privateMetadata,
                    free_usage: free_usage + 1
                }
            });
        }

        res.json({ success: true, content: secure_url });

    } catch (error) {
        let errorMsg = error.message;
        if (error.response?.data) {
            try {
                const decoded = JSON.parse(Buffer.from(error.response.data).toString());
                errorMsg = decoded.error || decoded.message || errorMsg;
            } catch (e) {
                const text = Buffer.from(error.response.data).toString();
                if (text && text.length < 200) errorMsg = text;
            }
        }
        console.error('Error generating image:', errorMsg);
        res.json({ success: false, message: errorMsg || "Failed to generate image" });
    }
};

export const removeImageBackground = async (req, res) => {
    try {
        const userId = getUserId(req);
        const image = req.file;
        const plan = req.plan;
        const user = await getFullUser(req, userId);

        if (!image || !image.buffer) {
            return res.json({ success: false, message: "No image provided. Please upload an image file." });
        }

        const bgRemovalUsage = user?.privateMetadata?.bg_removal_usage || 0;

        if (plan !== 'premium' && bgRemovalUsage >= 5) {
            return res.json({ success: false, message: "You've reached your free limit of 5 background removals. Upgrade to premium for unlimited usage." });
        }

        const formData = new FormData();
        formData.append('image_file', image.buffer, {
            filename: image.originalname || 'image.png',
            contentType: image.mimetype || 'image/png'
        });

        const response = await axios.post("https://clipdrop-api.co/remove-background/v1", formData, {
            headers: {
                'x-api-key': process.env.CLIPDROP_API_KEY?.trim(),
                ...formData.getHeaders()
            },
            responseType: "arraybuffer"
        });

        const base64Image = `data:image/png;base64,${Buffer.from(response.data).toString('base64')}`;
        const { secure_url } = await cloudinary.uploader.upload(base64Image, {
            folder: 'quick-ai-bg-removed'
        });

        await sql`INSERT into creations (user_id, prompt, content, type)
        values(${userId}, 'Remove background from the image', ${secure_url}, 'image')`;

        const newUsage = bgRemovalUsage + 1;
        if (plan !== 'premium' && userId) {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    ...user?.privateMetadata,
                    bg_removal_usage: newUsage
                }
            });
        }

        res.json({
            success: true,
            content: secure_url,
            usageLeft: plan === 'premium' ? 'unlimited' : Math.max(0, 5 - newUsage)
        });

    } catch (error) {
        let errorMsg = error.message;
        if (error.response?.data) {
            try {
                const decoded = JSON.parse(Buffer.from(error.response.data).toString());
                errorMsg = decoded.error || decoded.message || errorMsg;
            } catch (e) {
                const text = Buffer.from(error.response.data).toString();
                if (text && text.length < 200) errorMsg = text;
            }
        }
        console.error('Error removing background:', errorMsg);
        res.json({ success: false, message: errorMsg || "Failed to remove background" });
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
            return res.json({ success: false, message: "No image provided. Please upload an image." });
        }

        if (!object || !object.trim()) {
            return res.json({ success: false, message: "Please specify the object to remove." });
        }

        const objRemovalUsage = user?.privateMetadata?.obj_removal_usage || 0;

        if (plan !== 'premium' && objRemovalUsage >= 5) {
            return res.json({ success: false, message: "You've reached your free limit of 5 object removals. Upgrade to premium for unlimited usage." });
        }

        const base64DataUri = `data:${image.mimetype || 'image/png'};base64,${image.buffer.toString('base64')}`;
        const { public_id } = await cloudinary.uploader.upload(base64DataUri, {
            resource_type: 'image',
            folder: 'quick-ai-obj-removal'
        });

        const cleanObject = object.trim();
        const imageUrl = cloudinary.url(public_id, {
            transformation: [{ effect: `gen_remove:prompt=${cleanObject}` }],
            resource_type: 'image',
            secure: true
        });

        await sql`INSERT into creations (user_id, prompt, content, type)
        values(${userId}, ${`Remove ${cleanObject} from the image`}, ${imageUrl}, 'image')`;

        const newUsage = objRemovalUsage + 1;
        if (plan !== 'premium' && userId) {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    ...user?.privateMetadata,
                    obj_removal_usage: newUsage
                }
            });
        }

        res.json({
            success: true,
            content: imageUrl,
            usageLeft: plan === 'premium' ? 'unlimited' : Math.max(0, 5 - newUsage)
        });

    } catch (error) {
        console.error('Error removing object:', error.message);
        res.json({ success: false, message: error.message || "Failed to remove object" });
    }
};

export const resumeReview = async (req, res) => {
    try {
        const userId = getUserId(req);
        const resume = req.file;
        const plan = req.plan;
        const user = await getFullUser(req, userId);

        if (!resume || !resume.buffer) {
            return res.json({ success: false, message: "No resume provided. Please upload a PDF resume." });
        }

        const resumeReviewUsage = user?.privateMetadata?.resume_review_usage || 0;

        if (plan !== 'premium' && resumeReviewUsage >= 10) {
            return res.json({ success: false, message: "You've reached your free limit of 10 resume reviews. Upgrade to premium for unlimited usage." });
        }

        if (resume.size > 5 * 1024 * 1024) {
            return res.json({ success: false, message: "Resume file size exceeds allowed limit (5MB)." });
        }

        const pdfData = await pdf(resume.buffer);
        const prompt = `Review the following resume and provide constructive, actionable feedback on its strengths, weaknesses, formatting, impact, and areas for improvement. Use markdown formatting with clear headers.\n\nResume content:\n${pdfData.text}`;

        const content = await generateWithFallbackAndRetry(prompt);

        await sql`INSERT into creations (user_id, prompt, content, type)
        values(${userId}, 'Review the uploaded Resume', ${content}, 'resume-review')`;

        const newUsage = resumeReviewUsage + 1;
        if (plan !== 'premium' && userId) {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    ...user?.privateMetadata,
                    resume_review_usage: newUsage
                }
            });
        }

        res.json({
            success: true,
            content,
            usageLeft: plan === 'premium' ? 'unlimited' : Math.max(0, 10 - newUsage)
        });

    } catch (error) {
        console.error('Error in resume review:', error);
        res.json({ success: false, message: error.message || "Failed to review resume. Please try again." });
    }
};