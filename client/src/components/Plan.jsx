import { useUser, useClerk } from '@clerk/clerk-react'
import { Check, Star, ArrowRight, UserCheck } from 'lucide-react'

const Plan = () => {
  const { isSignedIn, user } = useUser()
  const { openSignIn, openUserProfile } = useClerk()

  const userPlan = user?.publicMetadata?.plan || 'free'

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
      cta: isSignedIn && userPlan === 'free' ? 'Current Plan' : 'Get Started Free',
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
      cta: isSignedIn ? (userPlan === 'premium' ? 'Current Plan' : 'Upgrade to Premium') : 'Upgrade to Premium',
    },
  ]

  const handlePlanAction = () => {
    if (!isSignedIn) {
      openSignIn()
    } else {
      openUserProfile()
    }
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
                  onClick={handlePlanAction}
                  disabled={isCurrent}
                  className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    isCurrent
                      ? 'bg-white/10 text-gray-400 cursor-not-allowed border border-white/10'
                      : plan.popular
                      ? 'bg-amber-400 hover:bg-amber-300 text-black shadow-md shadow-amber-400/20'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                  }`}
                >
                  {isCurrent ? (
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








