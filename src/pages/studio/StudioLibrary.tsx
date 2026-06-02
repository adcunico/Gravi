import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import GlassCard from '@/components/ui/GlassCard'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { getPrompts, getSavedPrompts, savePrompt } from '@/lib/supabase'
import { useAuthStore } from '@/stores/useAuthStore'
import type { Prompt } from '@/types'

const CATEGORIES = ['All', 'Leadership', 'Innovation', 'Persuasion', 'Storytelling', 'Ethics', 'Business', 'Interview', 'Negotiation', 'Pitch']
const DURATIONS = ['Any', 'Under 3 min', '3–7 min', '7+ min']
const DIFFICULTIES = ['Any', 'Beginner', 'Intermediate', 'Advanced']

type TabId = 'foryou' | 'topics' | 'library'

export default function StudioLibrary() {
  const navigate = useNavigate()
  const { user, profile } = useAuthStore()
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [saved, setSaved] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<TabId>('foryou')
  const [category, setCategory] = useState('All')
  const [duration, setDuration] = useState('Any')
  const [difficulty, setDifficulty] = useState('Any')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!user) return
    Promise.all([
      getPrompts(profile?.language || 'en'),
      getSavedPrompts(user.id),
    ]).then(([{ data: p }, { data: s }]) => {
      setPrompts(p || [])
      setSaved((s || []).map((x: { prompt_id: string }) => x.prompt_id))
      setLoading(false)
    })
  }, [user, profile])

  const isPro = profile?.subscription_status === 'pro'
  const filtered = prompts.filter((p) => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false
    if (category !== 'All' && p.category.toLowerCase() !== category.toLowerCase()) return false
    if (difficulty !== 'Any' && p.difficulty.toLowerCase() !== difficulty.toLowerCase()) return false
    if (duration === 'Under 3 min' && p.duration_minutes >= 3) return false
    if (duration === '3–7 min' && (p.duration_minutes < 3 || p.duration_minutes > 7)) return false
    if (duration === '7+ min' && p.duration_minutes < 7) return false
    return true
  })

  const handleUse = (p: Prompt) => {
    sessionStorage.setItem('gravi_session_script', p.description)
    sessionStorage.setItem('gravi_session_title', p.title)
    sessionStorage.setItem('gravi_session_path', 'library')
    navigate('/studio/session')
  }

  const handleSave = async (promptId: string) => {
    if (!user) return
    await savePrompt(user.id, promptId)
    setSaved((prev) => [...prev, promptId])
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: 'foryou', label: 'For You' },
    { id: 'topics', label: 'Topics' },
    { id: 'library', label: 'My Library' },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={() => navigate('/studio')} className="text-sm text-ivory-secondary hover:text-ivory flex items-center gap-1 mb-4 transition-colors">
          ← Back to Studio
        </button>
        <h1 className="font-display text-3xl text-ivory">Discover & Practise</h1>
        <p className="text-ivory-secondary mt-1 text-sm">Curated prompts for every occasion</p>
      </motion.div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory-muted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input
          className="input-gold pl-10"
          placeholder="Search speeches or topics..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-white/8">
        <div className="flex gap-0">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`px-5 py-3 text-sm font-sans transition-all ${tab === t.id ? 'tab-active' : 'tab-inactive'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Topics filters */}
      {tab === 'topics' && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1.5 rounded-full text-xs font-sans border transition-all ${category === c ? 'bg-gold/12 border-gold/40 text-gold' : 'bg-white/5 border-white/8 text-ivory-secondary hover:border-gold/20'}`}>{c}</button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {DURATIONS.map((d) => (
              <button key={d} onClick={() => setDuration(d)} className={`px-3 py-1.5 rounded-full text-xs font-sans border transition-all ${duration === d ? 'bg-gold/12 border-gold/40 text-gold' : 'bg-white/5 border-white/8 text-ivory-secondary'}`}>{d}</button>
            ))}
            {DIFFICULTIES.map((d) => (
              <button key={d} onClick={() => setDifficulty(d)} className={`px-3 py-1.5 rounded-full text-xs font-sans border transition-all ${difficulty === d ? 'bg-gold/12 border-gold/40 text-gold' : 'bg-white/5 border-white/8 text-ivory-secondary'}`}>{d}</button>
            ))}
          </div>
        </div>
      )}

      {/* Cards grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-ivory-secondary text-sm">No prompts found. Try adjusting filters.</p>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 gap-4">
            {(tab === 'library' ? filtered.filter((p) => saved.includes(p.id)) : filtered).map((p, i) => {
              const isLocked = !isPro && i >= 3
              return (
                <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  {isLocked ? (
                    <GlassCard padding="md" className="flex flex-col gap-4 h-full opacity-60 cursor-pointer" onClick={() => navigate('/upgrade')}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="gold" size="sm">{p.category}</Badge>
                          <Badge variant="subtle" size="sm">{p.difficulty}</Badge>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center flex-shrink-0">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#D4A85A" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-display text-lg text-ivory mb-1">{p.title}</h3>
                        <p className="text-sm text-ivory-secondary leading-relaxed line-clamp-2">{p.description}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-ivory-muted">{p.duration_minutes} min</span>
                        <span className="text-xs text-gold font-sans">Upgrade to unlock →</span>
                      </div>
                    </GlassCard>
                  ) : (
                    <GlassCard hover padding="md" className="flex flex-col gap-4 h-full">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="gold" size="sm">{p.category}</Badge>
                          <Badge variant="subtle" size="sm">{p.difficulty}</Badge>
                        </div>
                        <button
                          onClick={() => handleSave(p.id)}
                          className="text-ivory-muted hover:text-gold transition-colors flex-shrink-0"
                          aria-label="Bookmark"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill={saved.includes(p.id) ? '#D4A85A' : 'none'} stroke="currentColor" strokeWidth="1.5"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
                        </button>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-display text-lg text-ivory mb-1">{p.title}</h3>
                        <p className="text-sm text-ivory-secondary leading-relaxed line-clamp-2">{p.description}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-ivory-muted">{p.duration_minutes} min</span>
                        <Button size="sm" onClick={() => handleUse(p)}>Start Session →</Button>
                      </div>
                    </GlassCard>
                  )}
                </motion.div>
              )
            })}
          </div>
          {!isPro && filtered.length > 3 && (
            <div className="flex items-center justify-between rounded-xl border border-gold/25 bg-gold/5 px-5 py-4">
              <p className="text-sm text-ivory-secondary">
                <span className="text-gold font-semibold">{filtered.length - 3} more prompts</span> available on Pro
              </p>
              <Button size="sm" onClick={() => navigate('/upgrade')}>Upgrade →</Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
