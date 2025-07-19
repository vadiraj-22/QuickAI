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
            model: "gemini-2.0-flash",
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
        console.log(error.message);
        res.json({ success: false, message: error.message })
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
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}


export const generateImage = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt, publish } = req.body;
        const plan = req.plan;

        if (plan !== 'premium') {
            return res.json({ success: false, message: "This feature is only available for premium subscriptions." })
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

        if (plan !== 'premium') {
            return res.json({ success: false, message: "This feature is only available for premium subscriptions." })
        }

        const { secure_url } = await cloudinary.uploader.upload(image.path, {
            transformation: [
                {
                    effect: 'background_removal',
                    background_removal: 'remove_the_background'
                }
            ]
        })

        await sql`INSERT into creations (user_id ,prompt , content ,type )
        values(${userId},'Remove background from the image', ${secure_url},'image')`;



        res.json({ success: true, content: secure_url })

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

        if (plan !== 'premium') {
            return res.json({ success: false, message: "This feature is only available for premium subscriptions." })
        }

        const { public_id } = await cloudinary.uploader.upload(image.path)

        const imageUrl = cloudinary.url(public_id, {
            transformation: [{ effect: `gen_remove:${object}`    }],
            resource_type: 'image'
        })

        await sql`INSERT into creations (user_id ,prompt , content ,type )
        values(${userId}, ${`Remove ${object} from the image`}, ${imageUrl},'image')`;



        res.json({ success: true, content: imageUrl })

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


        if (plan !== 'premium') {
            return res.json({ success: false, message: "This feature is only available for premium subscriptions." })
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



        res.json({ success: true, content })

    }

    catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}