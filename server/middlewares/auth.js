import { clerkClient } from "@clerk/express";

// middleware to check the user id and haspremiumplan 

export const auth = async (req, res, next) => {
    try {
        const { userId, has } = req.auth;
        
        let hasPremiumPlan = false;
        try {
            hasPremiumPlan = typeof has === 'function' ? await has({ plan: 'premium' }) : false;
        } catch (e) {
            hasPremiumPlan = false;
        }

        const user = await clerkClient.users.getUser(userId);

        if (!hasPremiumPlan) {
            hasPremiumPlan = 
                user.publicMetadata?.plan === 'premium' ||
                user.privateMetadata?.plan === 'premium' ||
                user.unsafeMetadata?.plan === 'premium';
        }

        // Check if free_usage exists in metadata, if not initialize it to 0
        if (user.privateMetadata?.free_usage !== undefined) {
            req.free_usage = user.privateMetadata.free_usage;
        } else {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    ...user.privateMetadata,
                    free_usage: 0
                }
            });
            req.free_usage = 0;
        }
        req.plan = hasPremiumPlan ? 'premium' : 'free';
        next();
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};