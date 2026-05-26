import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '@/components/ui/Button'
import GraviLogo from '@/components/ui/GraviLogo'
import { useAuthStore } from '@/stores/useAuthStore'
import { upsertProfile } from '@/lib/supabase'
import type { UserRole, UserGoal, Language } from '@/types'

const ROLES: { id: UserRole; label: string; icon: string }[] = [
  { id: 'founder', label: 'Founder / Entrepreneur', icon: '🚀' },
  { id: 'executive', label: 'Executive / Leader', icon: '🏛️' },
  { id: 'consultant', label: 'Consultant / Advisor', icon: '💼' },
  { id: 'lawyer', label: 'Lawyer / Legal Professional', icon: '⚖️' },
  { id: 'sales', label: 'Sales Professional', icon: '📈' },
  { id: 'student', label: 'MBA / Student', icon: '🎓' },
  { id: 'creator', label: 'Content Creator', icon: '🎬' },
  { id: 'other', label: 'Other Professional', icon: '✨' },
]

const GOALS: { id: UserGoal; label: string }[] = [
  { id: 'authority', label: 'Speak with authority' },
  { id: 'fillers', label: 'Eliminate filler words' },
  { id: 'persuasion', label: 'Improve persuasion' },
  { id: 'presentations', label: 'Master presentations' },
  { id: 'interviews', label: 'Prepare for interviews' },
  { id: 'debate', label: 'Debate effectively' },
  { id: 'executive_presence', label: 'Build executive presence' },
  { id: 'vocal_delivery', label: 'Improve vocal delivery' },
]

const LANGUAGES: { id: Language; label: string; flag: string }[] = [
  { id: 'en', label: 'English', flag: '🇬🇧' },
  { id: 'pt', label: 'Portuguese', flag: '🇧🇷' },
  { id: 'es', label: 'Spanish', flag: '🇪🇸' },
  { id: 'fr', label: 'French', flag: '🇫🇷' },
  { id: 'de', label: 'German', flag: '🇩🇪' },
  { id: 'zh', label: 'Mandarin', flag: '🇨🇳' },
]

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const [role, setRole] = useState<UserRole | null>(null)
  const [goals, setGoals] = useState<UserGoal[]>([])
  const [language, setLanguage] = useState<Language>('en')
  const [saving, setSaving] = useState(false)
  const { user, fetchProfile } = useAuthStore()
  const navigate = useNavigate()

  const toggleGoal = (g: UserGoal) => {
    setGoals((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : prev.length < 3 ? [...prev, g] : prev,
    )
  }

  const handleFinish = async () => {
    if (!user) return
    setSaving(true)
    const name = localStorage.getItem('gravi_signup_name') || 'User'
    await upsertProfile({
      id: user.id,
      full_name: name,
      role: role || 'other',
      goals,
      language,
      theme: 'dark',
      subscription_status: 'free',
      subscription_tier: null,
      stripe_customer_id: null,
      onboarding_complete: true,
    })
    await fetchProfile(user.id)
    localStorage.removeItem('gravi_signup_name')
    navigate('/dashboard')
  }

  const steps = [
    // Step 0 — Welcome
    <motion.div key="welcome" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-8">
      <GraviLogo size={88} showWordmark animated />
      <div className="space-y-3">
        <h1 className="font-display text-4xl text-ivory">Welcome to Gravi</h1>
        <p className="text-lg text-ivory-secondary">Your private communication studio</p>
      </div>
      <Button size="lg" onClick={() => setStep(1)}>Let's Begin →</Button>
    </motion.div>,

    // Step 1 — Role
    <motion.div key="role" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 w-full max-w-lg mx-auto">
      <div className="text-center space-y-2">
        <p className="text-xs text-gold tracking-widest uppercase font-sans">Step 1 of 3</p>
        <h1 className="font-display text-3xl text-ivory">Who are you?</h1>
        <p className="text-sm text-ivory-secondary">We'll personalise Gravi to your profession</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {ROLES.map((r) => (
          <button
            key={r.id}
            onClick={() => setRole(r.id)}
            className={[
              'glass-hover glass p-4 rounded-xl text-left transition-all duration-200',
              role === r.id ? 'border-gold/50 bg-gold/8 shadow-gold' : '',
            ].join(' ')}
          >
            <div className="text-2xl mb-2">{r.icon}</div>
            <div className="text-sm font-sans text-ivory leading-snug">{r.label}</div>
          </button>
        ))}
      </div>
      <Button fullWidth disabled={!role} onClick={() => setStep(2)}>Continue →</Button>
    </motion.div>,

    // Step 2 — Goals
    <motion.div key="goals" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 w-full max-w-lg mx-auto">
      <div className="text-center space-y-2">
        <p className="text-xs text-gold tracking-widest uppercase font-sans">Step 2 of 3</p>
        <h1 className="font-display text-3xl text-ivory">What do you want to improve?</h1>
        <p className="text-sm text-ivory-secondary">Select up to 3 goals</p>
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {GOALS.map((g) => (
          <button
            key={g.id}
            onClick={() => toggleGoal(g.id)}
            className={[
              'px-4 py-2.5 rounded-full text-sm font-sans border transition-all duration-200',
              goals.includes(g.id)
                ? 'bg-gold/15 border-gold/50 text-gold shadow-gold'
                : 'bg-midnight-graphite/40 border-white/10 text-ivory-secondary hover:border-gold/30 hover:text-ivory',
            ].join(' ')}
          >
            {g.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-center text-ivory-muted">{goals.length}/3 selected</p>
      <Button fullWidth disabled={goals.length === 0} onClick={() => setStep(3)}>Continue →</Button>
    </motion.div>,

    // Step 3 — Language
    <motion.div key="lang" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 w-full max-w-lg mx-auto">
      <div className="text-center space-y-2">
        <p className="text-xs text-gold tracking-widest uppercase font-sans">Step 3 of 3</p>
        <h1 className="font-display text-3xl text-ivory">Choose your practice language</h1>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {LANGUAGES.map((l) => (
          <button
            key={l.id}
            onClick={() => setLanguage(l.id)}
            className={[
              'glass-hover glass p-4 rounded-xl flex flex-col items-center gap-2 transition-all',
              language === l.id ? 'border-gold/50 bg-gold/8 shadow-gold' : '',
            ].join(' ')}
          >
            <span className="text-3xl">{l.flag}</span>
            <span className="text-sm font-sans text-ivory">{l.label}</span>
          </button>
        ))}
      </div>
      <Button fullWidth loading={saving} size="lg" onClick={handleFinish}>
        Enter Gravi →
      </Button>
    </motion.div>,
  ]

  return (
    <div className="min-h-screen bg-midnight flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-gold"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            animate={{ opacity: [0, 0.4, 0], scale: [0, 1, 0] }}
            transition={{ duration: 3 + Math.random() * 3, delay: Math.random() * 4, repeat: Infinity }}
          />
        ))}
      </div>

      {/* Progress dots */}
      {step > 0 && (
        <div className="flex gap-2 mb-12">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 rounded-full transition-all duration-300 ${
                s <= step ? 'w-8 bg-gold' : 'w-4 bg-white/20'
              }`}
            />
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {steps[step]}
      </AnimatePresence>
    </div>
  )
}
