import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import GlassCard from '@/components/ui/GlassCard'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { getPrompts, getSavedPrompts, savePrompt, getDailyTrainingPrompts, getTrainingExercises } from '@/lib/supabase'
import { useAuthStore } from '@/stores/useAuthStore'
import type { Prompt } from '@/types'

const CATEGORIES = ['All', 'Leadership', 'Innovation', 'Persuasion', 'Storytelling', 'Ethics', 'Business', 'Interview', 'Negotiation', 'Pitch']

type Tab = 'foryou' | 'all' | 'library' | 'daily'

function getTodayChallenge(prompts: Prompt[]): Prompt | null {
  if (!prompts.length) return null
  const start = new Date(new Date().getFullYear(), 0, 0)
  const dayOfYear = Math.floor((Date.now() - start.getTime()) / 86400000)
  return prompts[dayOfYear % prompts.length]
}

export default function Prompts() {
  const navigate = useNavigate()
  const { user, profile } = useAuthStore()
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [saved, setSaved] = useState<string[]>([])
  const [dailyPrompts, setDailyPrompts] = useState<Prompt[]>([])
  const [exercises, setExercises] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<Tab>('foryou')

  useEffect(() => {
    if (!user) return
    Promise.all([
      getPrompts(profile?.language || 'en'),
      getSavedPrompts(user.id),
      getDailyTrainingPrompts(profile?.language || 'en'),
      getTrainingExercises(profile?.language || 'en'),
    ]).then(([{ data: p }, { data: s }, { data: d }, { data: e }]) => {
      setPrompts((p || []).filter((x: Prompt) => x.prompt_type === 'speech' || !x.prompt_type))
      setSaved((s || []).map((x: { prompt_id: string }) => x.prompt_id))
      setDailyPrompts(d || [])
      setExercises(e || [])
      setLoading(false)
    })
  }, [user, profile])

  const handleSave = async (promptId: string) => {
    if (!user) return
    await savePrompt(user.id, promptId)
    setSaved((prev) => [...prev, promptId])
  }

  const handleStart = (p: Prompt) => {
    sessionStorage.setItem('gravi_session_script', p.description)
    sessionStorage.setItem('gravi_session_title', p.title)
    sessionStorage.setItem('gravi_session_path', 'library')
    navigate('/studio/session')
  }

  const isPro = profile?.subscription_status === 'pro'
  const todayChallenge = getTodayChallenge(dailyPrompts)

  const speechPrompts = prompts
    .filter((p) => category === 'All' || p.category.toLowerCase() === category.toLowerCase())
    .filter((p) => !search || p.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-4xl text-ivory">Discover & Practise</h1>
        <p className="text-ivory-secondary mt-1">Curated speaking challenges for every occasion</p>
      </motion.div>

      {tab !== 'daily' && (
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory-muted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input className="input-gold pl-10" placeholder="Search speeches or topics..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      )}

      <div className="border-b border-white/8">
        <div className="flex gap-0 overflow-x-auto">
          {[
            { id: 'foryou', label: 'For You' },
            { id: 'all', label: 'Topics' },
            { id: 'library', label: 'My Library' },
            { id: 'daily', label: '🔥 Daily Training' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as Tab)}
              className={`px-5 py-3 text-sm font-sans transition-all whitespace-nowrap ${tab === t.id ? 'tab-active' : 'tab-inactive'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab !== 'daily' && tab !== 'foryou' && (
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1.5 rounded-full text-xs font-sans border transition-all ${category === c ? 'bg-gold/12 border-gold/40 text-gold' : 'bg-white/5 border-white/8 text-ivory-secondary hover:border-gold/20'}`}>{c}</button>
          ))}
        </div>
      )}

      {/* ── Daily Training tab ────────────────────────── */}
      {tab === 'daily' && (
        <>
          {loading ? (
            <div className="space-y-6">
              <div className="skeleton h-40 rounded-2xl" />
              <div className="grid sm:grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}</div>
            </div>
          ) : (
            <>
              {/* Today's challenge */}
              <div>
                <h3 className="font-display text-lg text-ivory mb-3">Today's Challenge</h3>
                {todayChallenge ? (
                  <GlassCard padding="md" className="border border-gold/20 bg-gold/3">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="gold" size="sm">Daily</Badge>
                          <Badge variant="subtle" size="sm">{todayChallenge.category}</Badge>
                          <Badge variant="subtle" size="sm">{todayChallenge.difficulty}</Badge>
                        </div>
                        <h4 className="font-display text-xl text-ivory mb-2">{todayChallenge.title}</h4>
                        <p className="text-sm text-ivory-secondary leading-relaxed line-clamp-3">{todayChallenge.description}</p>
                        <p className="text-xs text-ivory-muted mt-3">{todayChallenge.duration_minutes} min · refreshes tomorrow</p>
                      </div>
                      <Button size="md" onClick={() => handleStart(todayChallenge)} className="flex-shrink-0 self-start">
                        Start Challenge →
                      </Button>
                    </div>
                  </GlassCard>
                ) : (
                  <GlassCard padding="md">
                    <p className="text-sm text-ivory-muted text-center py-4">No daily challenges available yet.</p>
                  </GlassCard>
                )}
              </div>

              {/* Voice exercises */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display text-lg text-ivory">Voice Exercises</h3>
                  <span className="text-xs text-ivory-muted">{exercises.length} exercises</span>
                </div>
                {exercises.length === 0 ? (
                  <GlassCard padding="md">
                    <p className="text-sm text-ivory-muted text-center py-4">Exercises loading soon.</p>
                  </GlassCard>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {exercises.map((ex, i) => (
                      <motion.div
                        key={ex.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                      >
                        <GlassCard hover padding="md" className="flex flex-col gap-3 h-full">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex gap-2 flex-wrap">
                              <Badge variant="subtle" size="sm">{ex.category}</Badge>
                              <Badge variant="subtle" size="sm">{ex.difficulty}</Badge>
                            </div>
                            <span className="text-xs text-ivory-muted flex-shrink-0">{ex.duration_minutes} min</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-display text-base text-ivory mb-1">{ex.title}</h4>
                            <p className="text-sm text-ivory-secondary leading-relaxed line-clamp-3">{ex.description}</p>
                          </div>
                          <Button size="sm" onClick={() => handleStart(ex)}>Start Exercise →</Button>
                        </GlassCard>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}

      {/* ── Speech prompt tabs ────────────────────────── */}
      {tab !== 'daily' && (
        <>
          {loading ? (
            <div className="grid sm:grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}</div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 gap-4">
                {(tab === 'library' ? speechPrompts.filter((p) => saved.includes(p.id)) : speechPrompts).map((p, i) => {
                  const isLocked = !isPro && i >= 3
                  return (
                    <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
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
                              {tab === 'foryou' && p.is_featured && <Badge variant="success" size="sm">AI Pick</Badge>}
                            </div>
                            <button onClick={() => handleSave(p.id)} className="text-ivory-muted hover:text-gold transition-colors flex-shrink-0" aria-label="Bookmark">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill={saved.includes(p.id) ? '#D4A85A' : 'none'} stroke="currentColor" strokeWidth="1.5"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
                            </button>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-display text-lg text-ivory mb-1">{p.title}</h3>
                            <p className="text-sm text-ivory-secondary leading-relaxed line-clamp-2">{p.description}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-ivory-muted">{p.duration_minutes} min</span>
                            <Button size="sm" onClick={() => handleStart(p)}>Start Speaking →</Button>
                          </div>
                        </GlassCard>
                      )}
                    </motion.div>
                  )
                })}
              </div>
              {!isPro && speechPrompts.length > 3 && tab !== 'library' && (
                <div className="flex items-center justify-between rounded-xl border border-gold/25 bg-gold/5 px-5 py-4">
                  <p className="text-sm text-ivory-secondary">
                    <span className="text-gold font-semibold">{speechPrompts.length - 3} more prompts</span> available on Pro
                  </p>
                  <Button size="sm" onClick={() => navigate('/upgrade')}>Upgrade →</Button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
