import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import GlassCard from '@/components/ui/GlassCard'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/stores/useAuthStore'
import { upsertProfile, signOut, callEdgeFunction } from '@/lib/supabase'
import type { UserRole, Language, UserGoal } from '@/types'

const ROLES: { id: UserRole; label: string }[] = [
  { id: 'founder', label: 'Founder / Entrepreneur' },
  { id: 'executive', label: 'Executive / Leader' },
  { id: 'consultant', label: 'Consultant / Advisor' },
  { id: 'lawyer', label: 'Lawyer / Legal Professional' },
  { id: 'sales', label: 'Sales Professional' },
  { id: 'student', label: 'MBA / Student' },
  { id: 'creator', label: 'Content Creator' },
  { id: 'other', label: 'Other Professional' },
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

export default function Profile() {
  const { user, profile, fetchProfile } = useAuthStore()
  const navigate = useNavigate()
  const [name, setName] = useState(profile?.full_name || '')
  const [role, setRole] = useState<UserRole>(profile?.role || 'other')
  const [goals, setGoals] = useState<UserGoal[]>(profile?.goals || [])
  const [language, setLanguage] = useState<Language>(profile?.language || 'en')
  const [saving, setSaving] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)

  useEffect(() => {
    if (profile) {
      setName(profile.full_name || '')
      setRole(profile.role || 'other')
      setGoals(profile.goals || [])
      setLanguage(profile.language || 'en')
    }
  }, [profile])

  const toggleGoal = (g: UserGoal) => {
    setGoals((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : prev.length < 3 ? [...prev, g] : prev)
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    await upsertProfile({ id: user.id, full_name: name, role, goals, language })
    await fetchProfile(user.id)
    setSaving(false)
  }

  const handleDeleteAccount = async () => {
    setDeleteLoading(true)
    try {
      await callEdgeFunction('delete-account', {})
    } finally {
      await signOut()
      navigate('/')
    }
  }

  const handleManageSubscription = async () => {
    if (!profile?.stripe_customer_id) return
    setPortalLoading(true)
    try {
      const { portal_url } = await callEdgeFunction<{ portal_url: string }>('get-stripe-portal', {
        customer_id: profile.stripe_customer_id,
      })
      window.location.href = portal_url
    } catch {
      setPortalLoading(false)
    }
  }

  const initials = name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || 'G'
  const isPro = profile?.subscription_status === 'pro'

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-4xl text-ivory">Profile & Settings</h1>
      </motion.div>

      {/* Avatar + name */}
      <GlassCard>
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-gold-gradient flex items-center justify-center text-midnight font-display text-2xl font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <p className="font-display text-xl text-ivory">{profile?.full_name}</p>
              <Badge variant={isPro ? 'pro' : 'free'}>{isPro ? 'Pro' : 'Free'}</Badge>
            </div>
            <p className="text-sm text-ivory-secondary capitalize">{profile?.role?.replace('_', ' ')}</p>
            <p className="text-xs text-ivory-muted">Member since {new Date(profile?.created_at || '').toLocaleDateString('en', { month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
      </GlassCard>

      {/* Edit profile */}
      <GlassCard>
        <h3 className="font-sans font-semibold text-ivory mb-4">Personal Information</h3>
        <div className="space-y-4">
          <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <div className="space-y-1.5">
            <label className="text-sm font-sans text-ivory-secondary">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="input-gold"
            >
              {ROLES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Goals */}
      <GlassCard>
        <h3 className="font-sans font-semibold text-ivory mb-4">Training Goals <span className="text-xs text-ivory-muted ml-1">{goals.length}/3</span></h3>
        <div className="flex flex-wrap gap-2">
          {GOALS.map((g) => (
            <button
              key={g.id}
              onClick={() => toggleGoal(g.id)}
              className={`px-4 py-2 rounded-full text-sm font-sans border transition-all ${
                goals.includes(g.id) ? 'bg-gold/12 border-gold/40 text-gold' : 'bg-white/5 border-white/8 text-ivory-secondary hover:border-gold/20'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Language */}
      <GlassCard>
        <h3 className="font-sans font-semibold text-ivory mb-4">Practice Language</h3>
        <div className="grid grid-cols-3 gap-2">
          {LANGUAGES.map((l) => (
            <button
              key={l.id}
              onClick={() => setLanguage(l.id)}
              className={`p-3 rounded-xl border flex items-center gap-2 text-sm font-sans transition-all ${
                language === l.id ? 'bg-gold/10 border-gold/40 text-ivory' : 'glass border-white/8 text-ivory-secondary'
              }`}
            >
              <span>{l.flag}</span> {l.label}
            </button>
          ))}
        </div>
      </GlassCard>

      <Button fullWidth loading={saving} onClick={handleSave}>Save Changes</Button>

      {/* Subscription */}
      <GlassCard>
        <h3 className="font-sans font-semibold text-ivory mb-4">Subscription</h3>
        {isPro ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-ivory-secondary">Gravi Pro · {profile?.subscription_tier === 'annual' ? 'Annual' : 'Monthly'}</span>
              <Badge variant="pro">Active</Badge>
            </div>
            <Button variant="ghost" fullWidth loading={portalLoading} onClick={handleManageSubscription}>
              Manage Subscription
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-ivory-secondary">You're on the free plan — 3 sessions total</p>
            <Button fullWidth onClick={() => navigate('/upgrade')}>Upgrade to Gravi Pro</Button>
          </div>
        )}
      </GlassCard>

      {/* Privacy note */}
      <GlassCard>
        <h3 className="font-sans font-semibold text-ivory mb-3">Privacy</h3>
        <p className="text-xs text-ivory-muted leading-relaxed">
          Your audio is processed for transcription only and is never stored on our servers. We use industry-standard encryption for all data in transit and at rest.
        </p>
      </GlassCard>

      {/* Danger zone */}
      <GlassCard>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-sans text-ivory">Sign out</p>
            <p className="text-xs text-ivory-muted">Sign out of your account</p>
          </div>
          <Button variant="ghost" size="sm" onClick={async () => { await signOut(); navigate('/') }}>Sign out</Button>
        </div>
        <div className="mt-4 pt-4 border-t border-white/8 flex items-center justify-between">
          <div>
            <p className="text-sm font-sans text-red-400">Delete Account</p>
            <p className="text-xs text-ivory-muted">Permanently delete your account and all data</p>
          </div>
          <Button variant="danger" size="sm" onClick={() => setDeleteModal(true)}>Delete</Button>
        </div>
      </GlassCard>

      {/* Delete confirmation modal */}
      <Modal open={deleteModal} onClose={() => setDeleteModal(false)} title="Delete Account">
        <div className="space-y-4">
          <p className="text-sm text-ivory-secondary leading-relaxed">
            Are you sure you want to permanently delete your account? All sessions, analyses, and data will be lost. This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button variant="ghost" fullWidth onClick={() => setDeleteModal(false)}>Cancel</Button>
            <Button variant="danger" fullWidth loading={deleteLoading} onClick={handleDeleteAccount}>Delete Forever</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
