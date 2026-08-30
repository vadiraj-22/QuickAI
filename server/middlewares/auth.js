import { clerkClient } from "@clerk/express";

// middleware to check the user id and haspremiumplan 

export const auth = async (req, res, next) => {
    try {
        const authObj = typeof req.auth === 'function' ? req.auth() : (req.auth || {});
        const userId = authObj.userId || req.auth?.userId;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized access" });
        }

        let isPremiumPlan = false;

        // 1. Check Clerk Billing API for active paid subscription
        try {
            if (clerkClient.billing?.getUserBillingSubscription) {
                const sub = await clerkClient.billing.getUserBillingSubscription(userId);
                if (sub && sub.status === 'active') {
                    const items = sub.subscriptionItems || [];
                    isPremiumPlan = items.some(item => {
                        const planName = (item.plan?.name || item.plan?.slug || '').toLowerCase();
                        return planName.includes('premium');
                    });
                }
            }
        } catch (e) {
            // Billing not configured or ignored
        }

        let user;
        try {
            user = await clerkClient.users.getUser(userId);
        } catch (e) {
            return res.status(401).json({ success: false, message: "User session expired or not found" });
        }

        // 2. Fallback check on user metadata
        if (!isPremiumPlan) {
            isPremiumPlan = 
                user.publicMetadata?.plan === 'premium' ||
                user.privateMetadata?.plan === 'premium' ||
                user.unsafeMetadata?.plan === 'premium';
        }

        req.user = user;
        req.userId = userId;
        req.free_usage = user.privateMetadata?.free_usage || 0;
        req.plan = isPremiumPlan ? 'premium' : 'free';
        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};