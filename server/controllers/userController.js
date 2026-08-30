
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";

const getUserId = (req) => {
    if (req.userId) return req.userId;
    const authObj = typeof req.auth === 'function' ? req.auth() : (req.auth || {});
    return authObj.userId;
};

export const getUserCreations = async(req , res)=>{ 
    try {
        const userId = getUserId(req);
        const creations = await sql`SELECT * FROM creations where user_id =${userId} order by created_at DESC`;
        res.json({success: true, creations});

    } catch (error) {
        res.json({success: false, message:error.message});
    }
 }

  export const getPublishedCreations = async(req , res)=>{ 
    try {
        const creations = 
        await sql`SELECT * FROM creations 
              where publish = true 
              order by created_at DESC`;
        res.json({success: true, creations});

    } catch (error) {
        res.json({success: false, message:error.message});
    }
  }

  export const getUsageData = async(req , res)=>{ 
    try {
        const userId = getUserId(req);
        const plan = req.plan || 'free';
        const free_usage = req.free_usage || 0;
        
        // Use user object from auth middleware or fetch safely
        const user = req.user || (userId ? await clerkClient.users.getUser(userId).catch(() => null) : null);
        const bgRemovalUsage = user?.privateMetadata?.bg_removal_usage || 0;
        const objRemovalUsage = user?.privateMetadata?.obj_removal_usage || 0;
        const resumeReviewUsage = user?.privateMetadata?.resume_review_usage || 0;
        
        const isPremium = plan === 'premium';
        
        res.json({
            success: true, 
            plan: isPremium ? 'premium' : 'free',
            isPremium: isPremium,
            usageCount: free_usage,
            bgRemovalUsage: bgRemovalUsage,
            bgRemovalLeft: isPremium ? 'unlimited' : Math.max(0, 5 - bgRemovalUsage),
            objRemovalUsage: objRemovalUsage,
            objRemovalLeft: isPremium ? 'unlimited' : Math.max(0, 5 - objRemovalUsage),
            resumeReviewUsage: resumeReviewUsage,
            resumeReviewLeft: isPremium ? 'unlimited' : Math.max(0, 10 - resumeReviewUsage),
        });

    } catch (error) {
        console.error("getUsageData error:", error);
        res.json({success: false, message: error.message});
    }
  }

  export const toggleLikeCreations = async(req , res)=>{ 
    try {

        const userId = getUserId(req);
        const {id} =req.body

        const [creation]= 
        await sql`select * from creations 
                  where id = ${id}`

        if(!creation){
            return res.json({success:false, message:"creation not found"})
        }

        const currentLikes = creation.likes;
        const userIdStr = userId.toString();
        let updatedLikes;
        let message;

        if(currentLikes.includes(userIdStr)){
            updatedLikes=currentLikes.filter((user)=>user !== userIdStr );
            message= 'Creation unliked'
        }
        else{
            updatedLikes=[...currentLikes,userIdStr]
            message= 'Creation Liked'
        }

        const formattedArray =`{${updatedLikes.join(',')}}`

        await sql`update creations set likes =${formattedArray}::text[] 
                  where id=${id}`;

        res.json({success: true, message});

    } catch (error) {
        res.json({success: false, message:error.message});
    }
 }

export const updateUserPlan = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { plan } = req.body;
        const targetPlan = (plan === 'premium') ? 'premium' : 'free';

        const user = await clerkClient.users.getUser(userId);

        await clerkClient.users.updateUserMetadata(userId, {
            publicMetadata: {
                ...user.publicMetadata,
                plan: targetPlan,
                isPremium: targetPlan === 'premium',
                tier: targetPlan
            },
            privateMetadata: {
                ...user.privateMetadata,
                plan: targetPlan,
                isPremium: targetPlan === 'premium',
                tier: targetPlan
            },
            unsafeMetadata: {
                ...user.unsafeMetadata,
                plan: targetPlan,
                isPremium: targetPlan === 'premium',
                tier: targetPlan
            }
        });

        res.json({
            success: true,
            message: `Successfully updated plan to ${targetPlan === 'premium' ? 'Premium' : 'Free'}!`,
            plan: targetPlan,
            isPremium: targetPlan === 'premium'
        });
    } catch (error) {
        console.error("updateUserPlan error:", error);
        res.json({ success: false, message: error.message });
    }
};