import OpenAI from "openai";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import FormData from 'form-data';
import axios from 'axios';
import fs from 'fs'
import pdf from 'pdf-parse/lib/pdf-parse.js'


import { v2 as cloudinary } from 'cloudinary'

const AI = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});


export const generateArticle = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt, length } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (plan !== 'premium' && free_usage >= 10) {
            return res.json({ success: false, message: "Limit reached upgrade to continue." })
        }

        const response = await AI.chat.completions.create({
            model: "gemini-1.5-flash",
            messages: [{
                role: "user",
                content: prompt,
            },
            ],
            temperature: 0.7,
            max_tokens: length,
        });

        const content = response.choices[0].message.content

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

    }

    catch (error) {
        console.log('Error details:', error);
        console.log('Error message:', error.message);
        console.log('Error status:', error.status);
        console.log('Error response:', error.response?.data);
        
        // Handle rate limit errors
        if (error.status === 429 || 
            error.response?.status === 429 ||
            error.message?.includes('429') || 
            error.message?.includes('rate limit') ||
            error.message?.includes('Rate limit')) {
            return res.json({ 
                success: false, 
                message: "API rate limit exceeded. Please wait a moment and try again." 
            })
        }
        
        // Handle quota exceeded errors
        if (error.message?.includes('quota') || 
            error.message?.includes('RESOURCE_EXHAUSTED') ||
            error.response?.data?.error?.message?.includes('quota')) {
            return res.json({ 
                success: false, 
                message: "API quota exceeded. Please try again later or check your API key." 
            })
        }
        
        res.json({ 
            success: false, 
            message: error.message || error.response?.data?.error?.message || "An error occurred while generating content." 
        })
    }
}

export const generateBlogTitle = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (plan !== 'premium' && free_usage >= 10) {
            return res.json({ success: false, message: "Limit reached upgrade to continue." })
        }

        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [{
                role: "user", content: prompt,
            },
            ],
            temperature: 0.7,
            max_tokens: 100,
        });

        const content = response.choices[0].message.content

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

    }

    catch (error) {
        console.log('Error details:', error);
        console.log('Error message:', error.message);
        console.log('Error status:', error.status);
        console.log('Error response:', error.response?.data);
        
        // Handle rate limit errors
        if (error.status === 429 || 
            error.response?.status === 429 ||
            error.message?.includes('429') || 
            error.message?.includes('rate limit') ||
            error.message?.includes('Rate limit')) {
            return res.json({ 
                success: false, 
                message: "API rate limit exceeded. Please wait a moment and try again." 
            })
        }
        
        // Handle quota exceeded errors
        if (error.message?.includes('quota') || 
            error.message?.includes('RESOURCE_EXHAUSTED') ||
            error.response?.data?.error?.message?.includes('quota')) {
            return res.json({ 
                success: false, 
                message: "API quota exceeded. Please try again later or check your API key." 
            })
        }
        
        res.json({ 
            success: false, 
            message: error.message || error.response?.data?.error?.message || "An error occurred while generating content." 
        })
    }
}


export const generateImage = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt, publish } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        // Check if free user has reached the 5 image limit
        if (plan !== 'premium' && free_usage >= 5) {
            return res.json({ success: false, message: "You've reached your free limit of 5 images. Upgrade to premium for unlimited image generation." })
        }


        const formData = new FormData()
        formData.append('prompt', prompt)
        const response = await axios.post("https://clipdrop-api.co/text-to-image/v1", formData, {
            headers: { 'x-api-key': process.env.CLIPDROP_API_KEY },
            responseType: "arraybuffer",
        });

        const base64Image = `data:image/png;base64,${Buffer.from(response.data, 'binary').toString('base64')}`;

        const { secure_url } = await cloudinary.uploader.upload(base64Image)

        await sql`INSERT into creations (user_id ,prompt , content ,type ,publish)
        values(${userId},${prompt}, ${secure_url},'image',${publish ?? false})`;

        // Increment free usage counter for free users
        if (plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: free_usage + 1
                }
            })
        }

        res.json({ success: true, content: secure_url })

    }

    catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}


export const removeImageBackground = async (req, res) => {
    try {
        const { userId } = req.auth();
        const image  = req.file;
        const plan = req.plan;

        // Get current usage count for background removal
        const user = await clerkClient.users.getUser(userId);
        const bgRemovalUsage = user.privateMetadata?.bg_removal_usage || 0;

        // Check if free user has reached the 5 usage limit
        if (plan !== 'premium' && bgRemovalUsage >= 5) {
            return res.json({ success: false, message: "You've reached your free limit of 5 background removals. Upgrade to premium for unlimited usage." })
        }

        // Upload image first without transformation
        const uploadResult = await cloudinary.uploader.upload(image.path, {
            resource_type: 'image'
        })

        // Generate URL with background removal transformation
        const imageUrl = cloudinary.url(uploadResult.public_id, {
            transformation: [
                {
                    effect: 'background_removal',
                    background_removal: 'remove_the_background'
                }
            ],
            resource_type: 'image',
            secure: true
        })

        await sql`INSERT into creations (user_id ,prompt , content ,type )
        values(${userId},'Remove background from the image', ${imageUrl},'image')`;

        // Increment usage counter for free users
        const newUsage = bgRemovalUsage + 1;
        if (plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    bg_removal_usage: newUsage
                }
            })
        }

        res.json({ 
            success: true, 
            content: imageUrl,
            usageLeft: plan === 'premium' ? 'unlimited' : 5 - newUsage
        })

    }

    catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

export const removeImageObject = async (req, res) => {
    try {
        const { userId } = req.auth();
        const image  = req.file;
        const plan = req.plan;
        const { object } = req.body;

        // Get current usage count for object removal
        const user = await clerkClient.users.getUser(userId);
        const objRemovalUsage = user.privateMetadata?.obj_removal_usage || 0;

        // Check if free user has reached the 5 usage limit
        if (plan !== 'premium' && objRemovalUsage >= 5) {
            return res.json({ success: false, message: "You've reached your free limit of 5 object removals. Upgrade to premium for unlimited usage." })
        }

        const { public_id } = await cloudinary.uploader.upload(image.path)

        const imageUrl = cloudinary.url(public_id, {
            transformation: [{ effect: `gen_remove:${object}`    }],
            resource_type: 'image'
        })

        await sql`INSERT into creations (user_id ,prompt , content ,type )
        values(${userId}, ${`Remove ${object} from the image`}, ${imageUrl},'image')`;

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

    }

    catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

export const resumeReview = async (req, res) => {
    try {
        const { userId } = req.auth();
        const resume = req.file;
        const plan = req.plan;

        // Get current usage count for resume review
        const user = await clerkClient.users.getUser(userId);
        const resumeReviewUsage = user.privateMetadata?.resume_review_usage || 0;

        // Check if free user has reached the 10 usage limit
        if (plan !== 'premium' && resumeReviewUsage >= 10) {
            return res.json({ success: false, message: "You've reached your free limit of 10 resume reviews. Upgrade to premium for unlimited usage." })
        }

        if (resume.size > 5 * 1024 * 1024) {
            return res.json({ success: false, message: "Resume file size exceeds allowed size (5MB).  " })
        }

        const dataBuffer = fs.readFileSync(resume.path)
        const pdfData = await pdf(dataBuffer)

        const prompt = `Review the following resume and provide the constructive feedback on its strengths, weeknesses, and areas for improvement . Resume content :\n\n${pdfData.text}`


        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [{role: "user", content: prompt,}],
            temperature: 0.7,
            max_tokens: 1000,
        });

        const content = response.choices[0].message.content


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

    }

    catch (error) {
        console.log('Error details:', error);
        console.log('Error message:', error.message);
        console.log('Error status:', error.status);
        console.log('Error response:', error.response?.data);
        
        // Handle rate limit errors
        if (error.status === 429 || 
            error.response?.status === 429 ||
            error.message?.includes('429') || 
            error.message?.includes('rate limit') ||
            error.message?.includes('Rate limit')) {
            return res.json({ 
                success: false, 
                message: "API rate limit exceeded. Please wait a moment and try again." 
            })
        }
        
        // Handle quota exceeded errors
        if (error.message?.includes('quota') || 
            error.message?.includes('RESOURCE_EXHAUSTED') ||
            error.response?.data?.error?.message?.includes('quota')) {
            return res.json({ 
                success: false, 
                message: "API quota exceeded. Please try again later or check your API key." 
            })
        }
        
        res.json({ 
            success: false, 
            message: error.message || error.response?.data?.error?.message || "An error occurred while processing your request." 
        })
    }
}