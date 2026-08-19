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
            console.error("Error checking Clerk Billing subscription:", e.message);
        }

        const user = await clerkClient.users.getUser(userId);

        // 2. Fallback check on user metadata
        if (!isPremiumPlan) {
            isPremiumPlan = 
                user.publicMetadata?.plan === 'premium' ||
                user.privateMetadata?.plan === 'premium' ||
                user.unsafeMetadata?.plan === 'premium';
        }

        let needsUpdate = false;
        const newPrivate = { ...user.privateMetadata };
        const newPublic = { ...user.publicMetadata };

        if (newPrivate.free_usage === undefined) {
            newPrivate.free_usage = 0;
            needsUpdate = true;
        }

        if (needsUpdate) {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: newPrivate,
            });
        }

        req.userId = userId;
        req.free_usage = newPrivate.free_usage || 0;
        req.plan = isPremiumPlan ? 'premium' : 'free';
        next();
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};