import express from 'express'
import { generateArticle, generateBlogTitle, generateImage, removeImageBackground, removeImageObject, resumeReview } from '../controllers/aiController.js';
import { auth } from '../middlewares/auth.js';
import { upload } from '../configs/multer.js';
import { requireAuth } from '@clerk/express';

const aiRouter = express.Router();

// Apply requireAuth to all routes in this router
aiRouter.use(requireAuth())

aiRouter.post('/generate-article',auth,generateArticle)
aiRouter.post('/generate-blog-title',auth,generateBlogTitle)
aiRouter.post('/generate-image',auth,generateImage)
aiRouter.post('/remove-image-background', upload.single('image'), auth,removeImageBackground)
aiRouter.post('/remove-image-object', upload.single('image'), auth,removeImageObject)
aiRouter.post('/resume-review', upload.single('resume'),auth,resumeReview)

export default aiRouter