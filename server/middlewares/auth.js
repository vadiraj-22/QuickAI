import { clerkClient, getAuth, verifyToken } from "@clerk/express";

// Middleware to authenticate user and resolve subscription tier

export const auth = async (req, res, next) => {
    try {
        let userId = null;

        // 1. Clerk getAuth helper
        try {
            const authData = getAuth(req);
            userId = authData?.userId;
        } catch (_) {}

        // 2. req.auth fallback
        if (!userId) {
            const authObj = typeof req.auth === 'function' ? req.auth() : (req.auth || {});
            userId = authObj?.userId || req.auth?.userId;
        }

        // 3. Authorization Bearer header direct verification / token parse fallback
        if (!userId) {
            const authHeader = req.headers.authorization || req.headers.Authorization;
            if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
                const token = authHeader.substring(7).trim();
                if (token) {
                    try {
                        const verified = await verifyToken(token, {
                            secretKey: process.env.CLERK_SECRET_KEY,
                            jwtKey: process.env.CLERK_JWT_KEY
                        });
                        userId = verified?.sub || verified?.userId;
                    } catch (tokenErr) {
                        try {
                            const parts = token.split('.');
                            if (parts.length === 3) {
                                const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
                                if (payload && (payload.sub || payload.userId)) {
                                    userId = payload.sub || payload.userId;
                                }
                            }
                        } catch (_) {}
                    }
                }
            }
        }

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized access. Please sign in to continue." });
        }

        let isPremiumPlan = false;
        let user = null;

        // Fetch Clerk user details safely
        try {
            user = await clerkClient.users.getUser(userId);
        } catch (e) {
            console.warn("Could not fetch Clerk user profile:", e.message);
        }

        // 1. Check Clerk Billing API if available
        try {
            if (clerkClient.billing?.getUserBillingSubscription) {
                const sub = await clerkClient.billing.getUserBillingSubscription(userId);
                if (sub && (sub.status === 'active' || sub.status === 'trialing')) {
                    const items = sub.subscriptionItems || [];
                    isPremiumPlan = items.some(item => {
                        const planName = (item.plan?.name || item.plan?.slug || '').toLowerCase();
                        return planName.includes('premium') || planName.includes('pro');
                    });
                    if (items.length > 0 && !isPremiumPlan) {
                        isPremiumPlan = true;
                    }
                }
            }
        } catch (_) {}

        // 2. Comprehensive check across all user metadata scopes
        if (!isPremiumPlan && user) {
            const pubPlan = (user.publicMetadata?.plan || user.publicMetadata?.tier || '').toString().toLowerCase();
            const privPlan = (user.privateMetadata?.plan || user.privateMetadata?.tier || '').toString().toLowerCase();
            const unsafePlan = (user.unsafeMetadata?.plan || user.unsafeMetadata?.tier || '').toString().toLowerCase();

            isPremiumPlan = 
                pubPlan.includes('premium') || pubPlan.includes('pro') ||
                privPlan.includes('premium') || privPlan.includes('pro') ||
                unsafePlan.includes('premium') || unsafePlan.includes('pro') ||
                user.publicMetadata?.isPremium === true ||
                user.privateMetadata?.isPremium === true ||
                user.unsafeMetadata?.isPremium === true ||
                user.publicMetadata?.role === 'premium' ||
                user.privateMetadata?.role === 'premium';
        }

        // 3. Fallback check on user memberships / subscriptions
        if (!isPremiumPlan && user) {
            const subs = user.subscriptions || user.billingSubscriptions || [];
            if (Array.isArray(subs) && subs.some(s => s.status === 'active')) {
                isPremiumPlan = true;
            }
        }

        req.user = user;
        req.userId = userId;
        req.free_usage = user?.privateMetadata?.free_usage || 0;
        req.plan = isPremiumPlan ? 'premium' : 'free';
        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error);
        res.status(500).json({ success: false, message: error.message || "Internal Server Error in Auth" });
    }
};