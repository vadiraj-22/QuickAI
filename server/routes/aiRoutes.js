import express from 'express'
import { generateArticle, generateBlogTitle, generateImage, removeImageBackground, removeImageObject, resumeReview } from '../controllers/aiController.js';
import { auth } from '../middlewares/auth.js';
import { upload } from '../configs/multer.js';
import { requireAuth } from '@clerk/express';

const aiRouter = express.Router();

// Don't apply requireAuth globally - let individual routes handle it
// This allows OPTIONS preflight requests to pass through
// aiRouter.use(requireAuth())

aiRouter.post('/generate-article', requireAuth(), auth, generateArticle)
aiRouter.post('/generate-blog-title', requireAuth(), auth, generateBlogTitle)
aiRouter.post('/generate-image', requireAuth(), auth, generateImage)
aiRouter.post('/remove-image-background', requireAuth(), upload.single('image'), auth, removeImageBackground)
aiRouter.post('/remove-image-object', requireAuth(), upload.single('image'), auth, removeImageObject)
aiRouter.post('/resume-review', requireAuth(), upload.single('resume'), auth, resumeReview)

export default aiRouter