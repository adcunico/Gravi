import { useState } from 'react'
import { motion } from 'framer-motion'
import GlassCard from '@/components/ui/GlassCard'
import Button from '@/components/ui/Button'
import { callEdgeFunction } from '@/lib/supabase'
import { useAuthStore } from '@/stores/useAuthStore'

type Tier = 'monthly' | 'annual'

const FEATURES = [
  'Unlimited sessions',
  'All 3 practice modes',
  'Full Speech DNA history',
  'Session audio replay',
  'PDF session reports',
  'Full prompt library',
  'All debate topics',
  'Priority AI analysis',
  'All 6 languages',
]

export default function Upgrade() {
  const { profile } = useAuthStore()
  const [tier, setTier] = useState<Tier>('annual')
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      const { checkout_url } = await callEdgeFunction<{ checkout_url: string }>('create-stripe-checkout', { tier })
      window.location.href = checkout_url
    } catch {
      setLoading(false)
    }
  }

  if (profile?.subscription_status === 'pro') {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center space-y-3 py-12">
          <span className="text-gold text-2xl">✦</span>
          <h2 className="font-display text-3xl text-ivory">Welcome to Gravi Pro.</h2>
          <p className="text-sm text-ivory-secondary">Unlimited sessions, full analytics, and audio replay are active on your account.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto space-y-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4"
      >
        <h1 className="font-display text-4xl sm:text-5xl italic text-ivory">
          Your voice is your competitive advantage.
        </h1>
        <p className="text-sm text-ivory-secondary max-w-xl mx-auto leading-relaxed">
          Gravi Pro gives you the tools to develop it — with no session limits, full analytics, and audio replay to hear exactly what others hear.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {[
            { role: 'Founders', outcome: 'Command the room in every pitch.' },
            { role: 'Lawyers', outcome: 'Argue with precision and authority.' },
            { role: 'Executives', outcome: 'Lead with a voice people follow.' },
          ].map(({ role, outcome }) => (
            <div key={role} className="glass rounded-xl px-4 py-3 text-center min-w-[160px]">
              <div className="text-xs font-sans text-gold/70 uppercase tracking-[0.12em] mb-1">{role}</div>
              <div className="text-xs text-ivory-secondary leading-snug">{outcome}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Toggle */}
      <div className="flex justify-center">
        <div className="glass rounded-full p-1 flex gap-1">
          <button
            onClick={() => setTier('monthly')}
            className={`px-6 py-2 rounded-full text-sm font-sans transition-all ${tier === 'monthly' ? 'bg-gold/15 text-gold' : 'text-ivory-secondary'}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setTier('annual')}
            className={`px-6 py-2 rounded-full text-sm font-sans transition-all ${tier === 'annual' ? 'bg-gold/15 text-gold' : 'text-ivory-secondary'}`}
          >
            Annual
            <span className="ml-2 text-xs bg-gold/15 text-gold px-2 py-0.5 rounded-full">Save 33%</span>
          </button>
        </div>
      </div>

      {/* Price card */}
      <motion.div
        key={tier}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <GlassCard gold padding="lg" className="text-center space-y-6">
          <div>
            <div className="font-display text-5xl text-ivory">
              {tier === 'annual' ? '£79.99' : '£9.99'}
            </div>
            <p className="text-sm text-ivory-secondary mt-1">
              {tier === 'annual' ? 'per year · £6.67/month' : 'per month'}
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3 text-left">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3"
              >
                <div className="w-5 h-5 rounded-full bg-gold/15 flex items-center justify-center flex-shrink-0">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#D4A85A" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <span className="text-sm text-ivory">{f}</span>
              </motion.div>
            ))}
          </div>

          <Button fullWidth size="lg" loading={loading} onClick={handleUpgrade}>
            Upgrade Now →
          </Button>

          <p className="text-xs text-ivory-muted">
            Secure payment via Stripe · Cancel anytime
          </p>
        </GlassCard>
      </motion.div>

      {/* Free vs Pro comparison */}
      <GlassCard padding="md">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-semibold text-ivory-secondary mb-2">Free</p>
            <ul className="space-y-1.5 text-ivory-muted">
              <li>3 sessions total</li>
              <li>Last session DNA only</li>
              <li>3 prompts</li>
              <li>2 debate topics</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-gold mb-2">Pro ✦</p>
            <ul className="space-y-1.5 text-ivory-secondary">
              <li>Unlimited sessions</li>
              <li>Full DNA history</li>
              <li>All prompts</li>
              <li>All debate topics</li>
            </ul>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
