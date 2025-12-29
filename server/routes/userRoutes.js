import express from "express"
import { getPublishedCreations, getUserCreations, toggleLikeCreations, getUsageData } from "../controllers/userController.js";
import {auth} from "../middlewares/auth.js"
import { requireAuth } from '@clerk/express';

const userRouter= express.Router();

// Don't apply requireAuth globally - let individual routes handle it
// This allows OPTIONS preflight requests to pass through
// userRouter.use(requireAuth())

userRouter.get('/get-user-creations', requireAuth(), auth, getUserCreations )
userRouter.get('/get-published-creations', requireAuth(), auth, getPublishedCreations )
userRouter.get('/get-usage-data', requireAuth(), auth, getUsageData )
userRouter.post('/toggle-like-creations', requireAuth(), auth, toggleLikeCreations )

export default userRouter;