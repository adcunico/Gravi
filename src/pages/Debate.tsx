import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import GlassCard from '@/components/ui/GlassCard'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { getDebateTopics, callEdgeFunction } from '@/lib/supabase'
import { useAuthStore } from '@/stores/useAuthStore'
import type { DebateTopic, DebatePosition } from '@/types'

const CATEGORIES = ['All', 'Business', 'Technology', 'Leadership', 'Ethics', 'Politics', 'Startups', 'Economics', 'Society']
const POSITIONS: { id: DebatePosition; label: string; desc: string; color: string }[] = [
  { id: 'for', label: 'FOR', desc: 'Argue in favour', color: 'border-emerald-500/30 bg-emerald-500/8 text-emerald-400' },
  { id: 'against', label: 'AGAINST', desc: 'Argue against', color: 'border-red-500/30 bg-red-500/8 text-red-400' },
  { id: 'neutral', label: 'NEUTRAL', desc: 'Balanced analysis', color: 'border-blue-500/30 bg-blue-500/8 text-blue-400' },
]
const FORMATS = [
  { label: 'Impromptu', value: 2 },
  { label: 'Structured', value: 5 },
  { label: 'Extended', value: 10 },
]

type Phase = 'entry' | 'topic' | 'detail'

export default function Debate() {
  const navigate = useNavigate()
  const { user, profile } = useAuthStore()
  const [phase, setPhase] = useState<Phase>('entry')
  const [topics, setTopics] = useState<DebateTopic[]>([])
  const [selectedTopic, setSelectedTopic] = useState<DebateTopic | null>(null)
  const [position, setPosition] = useState<DebatePosition>('for')
  const [format, setFormat] = useState(5)
  const [category, setCategory] = useState('All')
  const [loading, setLoading] = useState(false)
  const [surpriseLoading, setSurpriseLoading] = useState(false)
  const [hintsOpen, setHintsOpen] = useState(false)

  useEffect(() => {
    if (phase === 'topic' && topics.length === 0) {
      setLoading(true)
      getDebateTopics(profile?.language || 'en').then(({ data }) => {
        setTopics(data || [])
        setLoading(false)
      })
    }
  }, [phase, topics.length, profile])

  const handleSurprise = async () => {
    setSurpriseLoading(true)
    try {
      const { topics: aiTopics } = await callEdgeFunction<{ topics: DebateTopic[] }>('generate-topics', {
        role: profile?.role || 'other',
        language: profile?.language || 'en',
        count: 1,
      })
      if (aiTopics?.[0]) {
        setSelectedTopic(aiTopics[0])
        setPhase('detail')
      }
    } catch {
      setPhase('topic')
    } finally {
      setSurpriseLoading(false)
    }
  }

  const handleBegin = () => {
    sessionStorage.removeItem('gravi_session_script')
    sessionStorage.removeItem('gravi_session_title')
    sessionStorage.removeItem('gravi_session_path')
    sessionStorage.setItem('gravi_debate_topic', JSON.stringify(selectedTopic))
    sessionStorage.setItem('gravi_debate_position', position)
    sessionStorage.setItem('gravi_debate_format', String(format))
    navigate('/debate/session')
  }

  const filtered = topics.filter((t) =>
    category === 'All' || t.category.toLowerCase() === category.toLowerCase()
  )

  if (phase === 'detail' && selectedTopic) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto space-y-8">
        <button onClick={() => setPhase('topic')} className="text-sm text-ivory-secondary hover:text-ivory flex items-center gap-1 transition-colors">
          ← Back
        </button>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div>
            <Badge variant="gold">{selectedTopic.category}</Badge>
            <h1 className="font-display text-3xl text-ivory mt-3">{selectedTopic.title}</h1>
            <p className="text-sm text-ivory-secondary mt-2 leading-relaxed">{selectedTopic.description}</p>
          </div>

          {/* Position */}
          <div className="space-y-3">
            <h3 className="text-sm font-sans font-semibold text-ivory">Choose your position</h3>
            <div className="grid grid-cols-3 gap-3">
              {POSITIONS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPosition(p.id)}
                  className={`p-4 rounded-xl border text-center transition-all ${
                    position === p.id ? p.color + ' border-opacity-60' : 'glass border-white/10 text-ivory-secondary'
                  }`}
                >
                  <div className="font-sans font-bold text-xs tracking-widest">{p.label}</div>
                  <div className="text-xs mt-1 opacity-80">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Format */}
          <div className="space-y-3">
            <h3 className="text-sm font-sans font-semibold text-ivory">Format</h3>
            <div className="flex gap-2">
              {FORMATS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFormat(f.value)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-sans border transition-all ${
                    format === f.value ? 'bg-gold/12 border-gold/40 text-gold' : 'bg-white/5 border-white/8 text-ivory-secondary'
                  }`}
                >
                  {f.label}<br />
                  <span className="text-xs opacity-70">{f.value} min</span>
                </button>
              ))}
            </div>
          </div>

          {/* Argument hints */}
          <div className="border border-white/8 rounded-xl overflow-hidden">
            <button
              onClick={() => setHintsOpen(!hintsOpen)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-sans text-ivory-secondary hover:text-ivory transition-colors"
            >
              Argument structure hints
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`transition-transform ${hintsOpen ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            {hintsOpen && (
              <div className="px-4 pb-4 space-y-2">
                {['Open with your main claim', 'Support with 2–3 pieces of evidence', 'Anticipate and counter objections', 'Close with conviction'].map((hint, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-ivory-secondary">
                    <span className="text-gold text-xs">{i + 1}.</span> {hint}
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button fullWidth size="lg" onClick={handleBegin}>Begin Debate →</Button>
        </motion.div>
      </div>
    )
  }

  if (phase === 'topic') {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        <button onClick={() => setPhase('entry')} className="text-sm text-ivory-secondary hover:text-ivory flex items-center gap-1 transition-colors">
          ← Back
        </button>
        <h1 className="font-display text-3xl text-ivory">Choose a Topic</h1>

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1.5 rounded-full text-xs font-sans border transition-all ${category === c ? 'bg-gold/12 border-gold/40 text-gold' : 'bg-white/5 border-white/8 text-ivory-secondary hover:border-gold/20'}`}>{c}</button>
          ))}
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}</div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {filtered.map((t, i) => (
              <motion.div key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <GlassCard hover padding="md" className="flex flex-col gap-3 h-full cursor-pointer" onClick={() => { setSelectedTopic(t); setPhase('detail') }}>
                  <div className="flex gap-2">
                    <Badge variant="gold">{t.category}</Badge>
                    <Badge variant="subtle">{t.difficulty}</Badge>
                  </div>
                  <h3 className="font-display text-lg text-ivory">{t.title}</h3>
                  <p className="text-sm text-ivory-secondary line-clamp-2">{t.description}</p>
                  <span className="text-xs text-gold">Select topic →</span>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Entry phase
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-4xl text-ivory">Debate Arena</h1>
        <p className="text-ivory-secondary mt-2 text-lg font-display italic">Sharpen your arguments. Build conviction.</p>
      </motion.div>

      <div className="grid sm:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <GlassCard hover padding="lg" className="flex flex-col gap-4 cursor-pointer h-full" onClick={() => setPhase('topic')}>
            <div className="w-12 h-12 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D4A85A" strokeWidth="1.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            </div>
            <div>
              <h2 className="font-display text-xl text-ivory">Choose a Topic</h2>
              <p className="text-sm text-ivory-secondary mt-1">Browse our curated debate library</p>
            </div>
            <span className="text-xs text-gold">Browse topics →</span>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <GlassCard hover padding="lg" className="flex flex-col gap-4 h-full">
            <div className="w-12 h-12 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D4A85A" strokeWidth="1.5"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
            </div>
            <div>
              <h2 className="font-display text-xl text-ivory">Surprise Me</h2>
              <p className="text-sm text-ivory-secondary mt-1">AI generates a topic matched to your role</p>
            </div>
            <Button loading={surpriseLoading} variant="ghost" size="sm" onClick={handleSurprise}>
              Generate Topic →
            </Button>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}
