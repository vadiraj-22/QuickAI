import { useState, useEffect } from 'react'
import { useUser, useClerk, useAuth } from '@clerk/clerk-react'
import { Check, Star, ArrowRight, UserCheck, Loader2 } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

const Plan = () => {
  const { isSignedIn, user } = useUser()
  const { openSignIn, openUserProfile } = useClerk()
  const { getToken } = useAuth()
  const [loadingPlan, setLoadingPlan] = useState(null)
  const [isBackendPremium, setIsBackendPremium] = useState(false)

  const fetchPlanStatus = async () => {
    if (!isSignedIn) return
    try {
      const token = await getToken()
      const { data } = await axios.get('/api/user/get-usage-data', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (data.success) {
        setIsBackendPremium(!!data.isPremium)
      }
    } catch (err) {
      console.error('Error fetching plan status:', err)
    }
  }

  useEffect(() => {
    fetchPlanStatus()
  }, [isSignedIn, user])

  const userPlan = (user?.publicMetadata?.plan === 'premium' || isBackendPremium) ? 'premium' : 'free'

  const getCtaText = (planId) => {
    if (!isSignedIn) {
      return planId === 'free' ? 'Get Started Free' : 'Upgrade to Premium'
    }
    if (userPlan === planId) {
      return 'Current Plan'
    }
    return planId === 'free' ? 'Downgrade to Free' : 'Upgrade to Premium'
  }

  const plans = [
    {
      id: 'free',
      name: 'Free Plan',
      price: '$0',
      period: '/ month',
      features: [
        '10 Free Trial AI Generations',
        'Blog Title & Article Writer',
      ],
      popular: false,
      cta: getCtaText('free'),
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$5',
      period: '/ month',
      features: [
        'Unlimited AI Generations',
        'Unlimited Blog & Article Generation',
        'AI Image Generation',
        'Background Removal',
        'Object Removal',
        'AI Resume Reviewer & ATS Analysis',
      ],
      popular: true,
      cta: getCtaText('premium'),
    },
  ]

  const handlePlanAction = async (planId) => {
    if (!isSignedIn) {
      openSignIn()
      return
    }

    if (userPlan === planId) return

    // Open Clerk Billing Modal for subscription management and payments
    toast('Opening Billing portal in Clerk...', { icon: '💳' })
    openUserProfile()
  }

  return (
    <section id="pricing" className="w-full py-20 px-4 max-w-5xl mx-auto space-y-12">
      {/* Original Header Content */}
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
          Choose your Plan
        </h2>
        <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
          Start for free and scale as you grow. Find the perfect Plan for your content creation needs.
        </p>
      </div>

      {/* Clean 2-Card Layout (Only Feature List with Ticks) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map((plan) => {
          const isCurrent = isSignedIn && userPlan === plan.id
          const isActionLoading = loadingPlan === plan.id

          return (
            <div
              key={plan.id}
              className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                plan.popular
                  ? 'bg-gradient-to-b from-amber-500/10 via-black to-black border-2 border-amber-400/80 shadow-[0_15px_40px_rgba(251,191,36,0.12)]'
                  : 'bg-white/[0.03] border border-white/10 hover:border-white/20'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-8 px-3.5 py-1 rounded-full bg-amber-400 text-black text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <Star className="size-3 fill-black text-black" />
                  Most Popular
                </div>
              )}

              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white">{plan.name}</h3>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white tracking-tight">{plan.price}</span>
                  <span className="text-xs text-gray-400">{plan.period}</span>
                </div>

                <ul className="space-y-3 pt-2 text-xs text-gray-300">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <div className={`p-1 rounded-full ${plan.popular ? 'bg-amber-400 text-black' : 'bg-white/10 text-amber-400'}`}>
                        <Check className="size-3 stroke-[3]" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8">
                <button
                  onClick={() => handlePlanAction(plan.id)}
                  disabled={isCurrent || isActionLoading}
                  className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    isCurrent
                      ? 'bg-white/10 text-gray-400 cursor-not-allowed border border-white/10'
                      : plan.popular
                      ? 'bg-amber-400 hover:bg-amber-300 text-black shadow-md shadow-amber-400/20'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                  }`}
                >
                  {isActionLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Updating...
                    </>
                  ) : isCurrent ? (
                    <>
                      <UserCheck className="size-4 text-emerald-400" />
                      Current Plan
                    </>
                  ) : (
                    <>
                      {plan.cta}
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default Plan








