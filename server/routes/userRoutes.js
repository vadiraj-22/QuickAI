import express from "express"
import { getPublishedCreations, getUserCreations, toggleLikeCreations, getUsageData } from "../controllers/userController.js";
import {auth} from "../middlewares/auth.js"
import { requireAuth } from '@clerk/express';

const userRouter= express.Router();

// Apply requireAuth to all routes in this router
userRouter.use(requireAuth())

userRouter.get('/get-user-creations',auth, getUserCreations )
userRouter.get('/get-published-creations',auth, getPublishedCreations )
userRouter.get('/get-usage-data',auth, getUsageData )
userRouter.post('/toggle-like-creations',auth, toggleLikeCreations )

export default userRouter;