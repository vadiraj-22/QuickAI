import { GoogleGenerativeAI } from "@google/generative-ai";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import FormData from 'form-data';
import axios from 'axios';
import pdf from 'pdf-parse/lib/pdf-parse.js'
import { v2 as cloudinary } from 'cloudinary'

// Initialize Google Generative AI
// Trim the key to remove accidental spaces from .env
const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "";
if (!apiKey) {
    console.error("❌ ERROR: GEMINI_API_KEY is missing or empty in .env file!");
} else {
    console.log(`✅ Gemini API Key found (starts with: ${apiKey.substring(0, 5)}...)`);
}
const genAI = new GoogleGenerativeAI(apiKey);

// Helper function to get model instance (can be easily changed centrally)
// Using gemini-1.5-flash - fast, stable model with generous limits
const getModel = (modelName = "gemini-1.5-flash") => genAI.getGenerativeModel({ model: modelName });

// Helper function for exponential backoff retry logic
const generateWithRetry = async (operation, maxRetries = 5) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await operation();
        } catch (error) {
            // Check for rate limit (429) or overloaded (503) errors
            const isRateLimit = error.message?.includes('429') || error.status === 429 || error.message?.includes('Too Many Requests');
            const isOverloaded = error.message?.includes('503') || error.status === 503;
            // Check for Quota Exceeded (Resource Exhausted) which implies 429 but longer term
            const isQuota = error.message?.includes('Quota') || error.message?.includes('RESOURCE_EXHAUSTED');

            if (isQuota) {
                console.error("Gemini Quota Exceeded. Retries will not help for this request.");
                // We throw immediately because waiting a few seconds won't fix a daily quota
                throw error;
            }

            if ((isRateLimit || isOverloaded) && i < maxRetries - 1) {
                // Exponential backoff: 2s, 4s, 8s, 16s, 32s
                const delay = Math.pow(2, i + 1) * 1000 + Math.random() * 1000;
                console.log(`Gemini API Busy/Rate Limited (Attempt ${i + 1}/${maxRetries}). Waiting ${Math.round(delay)}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            throw error;
        }
    }
};

// Helper function to extract userId safely
const getUserId = (req) => {
    if (req.userId) return req.userId;
    const authObj = typeof req.auth === 'function' ? req.auth() : (req.auth || {});
    return authObj.userId;
};

export const generateArticle = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { prompt, length } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (plan !== 'premium' && free_usage >= 10) {
            return res.json({ success: false, message: "Free limit reached. usage limit is 10 " })
        }

        const model = getModel();

        // Construct a better prompt with length instruction
        const fullPrompt = `Write a comprehensive article about "${prompt}". The article should be approximately ${length} words long. Use markdown formatting.`;

        const result = await generateWithRetry(() => model.generateContent(fullPrompt));
        const content = result.response.text();

        await sql`INSERT into creations (user_id ,prompt , content ,type )
        values(${userId},${prompt},${content},'article')`;

        if (plan != 'premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: free_usage + 1
                }
            })
        }

        res.json({ success: true, content })

    } catch (error) {
        console.error('Error generating article:', error);

        let message = error.message || "Failed to generate article. Please try again.";

        if (error.message?.includes('429') || error.message?.includes('Too Many Requests')) {
            message = "Server is busy with too many requests. Please try again in a moment.";
        } else if (error.message?.includes('Quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
            message = "API Usage Quota Exceeded. Please try again later or upgrade.";
        } else if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('API key not valid') || error.status === 400) {
            message = "Invalid or expired Gemini API Key. Please update GEMINI_API_KEY in environment variables.";
        }

        res.json({ success: false, message });
    }
}

export const generateBlogTitle = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { prompt } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (plan !== 'premium' && free_usage >= 10) {
            return res.json({ success: false, message: "Free limit reached. usage limit is 10" })
        }

        const model = getModel();

        const result = await generateWithRetry(() => model.generateContent(prompt));
        const content = result.response.text();

        await sql`INSERT into creations (user_id ,prompt , content ,type )
        values(${userId},${prompt},${content},'blog-title')`;

        if (plan != 'premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: free_usage + 1
                }
            })
        }

        res.json({ success: true, content })

    } catch (error) {
        console.error('Error generating blog title:', error);
        let message = error.message || "Failed to generate blog title. Please try again.";

        if (error.message?.includes('429') || error.message?.includes('Too Many Requests')) {
            message = "Server is busy with too many requests. Please try again in a moment.";
        } else if (error.message?.includes('Quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
            message = "API Usage Quota Exceeded. Please try again later or upgrade.";
        } else if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('API key not valid') || error.status === 400) {
            message = "Invalid or expired Gemini API Key. Please update GEMINI_API_KEY in environment variables.";
        }

        res.json({ success: false, message });
    }
}


export const generateImage = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { prompt, publish } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (!prompt || !prompt.trim()) {
            return res.json({ success: false, message: "Please provide a prompt for image generation." });
        }

        if (!process.env.CLIPDROP_API_KEY) {
            return res.json({ success: false, message: "CLIPDROP_API_KEY is not configured on the server." });
        }

        // Check if free user has reached the 5 image limit
        if (plan !== 'premium' && free_usage >= 5) {
            return res.json({ success: false, message: "You've reached your free limit of 5 images. Upgrade to premium for unlimited image generation." });
        }

        const formData = new FormData();
        formData.append('prompt', prompt.trim());

        // Call ClipDrop text-to-image with proper multipart headers
        const response = await axios.post("https://clipdrop-api.co/text-to-image/v1", formData, {
            headers: {
                'x-api-key': process.env.CLIPDROP_API_KEY.trim(),
                ...formData.getHeaders()
            },
            responseType: "arraybuffer",
        });

        const base64Image = `data:image/png;base64,${Buffer.from(response.data).toString('base64')}`;

        const { secure_url } = await cloudinary.uploader.upload(base64Image);

        await sql`INSERT into creations (user_id ,prompt , content ,type ,publish)
        values(${userId},${prompt}, ${secure_url},'image',${publish ?? false})`;

        // Increment free usage counter for free users
        if (plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
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
}


export const removeImageBackground = async (req, res) => {
    try {
        const userId = getUserId(req);
        const image = req.file;
        const plan = req.plan;

        if (!image || !image.buffer) {
            return res.json({ success: false, message: "No image provided. Please upload an image file." });
        }

        const user = req.user || await clerkClient.users.getUser(userId);
        const bgRemovalUsage = user?.privateMetadata?.bg_removal_usage || 0;

        if (plan !== 'premium' && bgRemovalUsage >= 5) {
            return res.json({ success: false, message: "You've reached your free limit of 5 background removals. Upgrade to premium for unlimited usage." });
        }

        const formData = new FormData();
        formData.append('image_file', image.buffer, {
            filename: image.originalname || 'image.png',
            contentType: image.mimetype || 'image/png'
        });

        // Use ClipDrop background removal API
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
        if (plan !== 'premium') {
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
}

export const removeImageObject = async (req, res) => {
    try {
        const userId = getUserId(req);
        const image = req.file;
        const plan = req.plan;
        const { object } = req.body;

        if (!image || !image.buffer) {
            return res.json({ success: false, message: "No image provided. Please upload an image." });
        }

        if (!object || !object.trim()) {
            return res.json({ success: false, message: "Please specify the object to remove." });
        }

        // Get current usage count for object removal
        const user = await clerkClient.users.getUser(userId);
        const objRemovalUsage = user.privateMetadata?.obj_removal_usage || 0;

        // Check if free user has reached the 5 usage limit
        if (plan !== 'premium' && objRemovalUsage >= 5) {
            return res.json({ success: false, message: "You've reached your free limit of 5 object removals. Upgrade to premium for unlimited usage." })
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
        })

        await sql`INSERT into creations (user_id ,prompt , content ,type )
        values(${userId}, ${`Remove ${cleanObject} from the image`}, ${imageUrl},'image')`;

        // Increment usage counter for free users
        const newUsage = objRemovalUsage + 1;
        if (plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    obj_removal_usage: newUsage
                }
            })
        }

        res.json({
            success: true,
            content: imageUrl,
            usageLeft: plan === 'premium' ? 'unlimited' : 5 - newUsage
        })

    } catch (error) {
        console.error('Error removing object:', error.message);
        res.json({ success: false, message: error.message || "Failed to remove object" })
    }
}

export const resumeReview = async (req, res) => {
    try {
        const userId = getUserId(req);
        const resume = req.file;
        const plan = req.plan;

        if (!resume || !resume.buffer) {
            return res.json({ success: false, message: "No resume provided. Please upload a PDF resume." });
        }

        // Get current usage count for resume review
        const user = await clerkClient.users.getUser(userId);
        const resumeReviewUsage = user.privateMetadata?.resume_review_usage || 0;

        // Check if free user has reached the 10 usage limit
        if (plan !== 'premium' && resumeReviewUsage >= 10) {
            return res.json({ success: false, message: "You've reached your free limit of 10 resume reviews. Upgrade to premium for unlimited usage." })
        }

        if (resume.size > 5 * 1024 * 1024) {
            return res.json({ success: false, message: "Resume file size exceeds allowed size (5MB)." })
        }

        const pdfData = await pdf(resume.buffer)

        const prompt = `Review the following resume and provide the constructive feedback on its strengths, weeknesses, and areas for improvement . Resume content :\n\n${pdfData.text}`;

        const model = getModel();
        const result = await generateWithRetry(() => model.generateContent(prompt));
        const content = result.response.text();

        await sql`INSERT into creations (user_id ,prompt , content ,type )
        values(${userId}, 'Review the uploaded Resume', ${content},'resume-review')`;

        // Increment usage counter for free users
        const newUsage = resumeReviewUsage + 1;
        if (plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    resume_review_usage: newUsage
                }
            })
        }

        res.json({
            success: true,
            content,
            usageLeft: plan === 'premium' ? 'unlimited' : 10 - newUsage
        })

    } catch (error) {
        console.error('Error in resume review:', error);
        let message = error.message || "Failed to review resume. Please try again.";

        if (error.message?.includes('429') || error.message?.includes('Too Many Requests')) {
            message = "Server is busy with too many requests. Please try again in a moment.";
        } else if (error.message?.includes('Quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
            message = "API Usage Quota Exceeded. Please try again later or upgrade.";
        } else if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('API key not valid') || error.status === 400) {
            message = "Invalid or expired Gemini API Key. Please update GEMINI_API_KEY in environment variables.";
        }
        res.json({ success: false, message });
    }
}