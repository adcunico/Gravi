import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/useAuthStore'
import { getSessions } from '@/lib/supabase'
import GlassCard from '@/components/ui/GlassCard'
import ScoreGauge from '@/components/ui/ScoreGauge'
import ScoreBar from '@/components/ui/ScoreBar'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { SkeletonStats, SkeletonList } from '@/components/ui/Skeleton'
import type { Session, Analysis } from '@/types'

type SessionRow = Session & { analysis: Analysis }

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

const FEATURE_CARDS = [
  {
    id: 'guided',
    to: '/studio',
    icon: MicIcon,
    title: 'Guided Delivery',
    desc: 'Practise with teleprompter and real-time feedback',
    cta: 'Start session →',
  },
  {
    id: 'debate',
    to: '/debate',
    icon: SwordsIcon,
    title: 'Debate Arena',
    desc: 'Sharpen arguments and build conviction',
    cta: 'Start a debate →',
  },
  {
    id: 'prompts',
    to: '/prompts',
    icon: LibraryIcon,
    title: 'Prompt Arena',
    desc: 'Curated speaking challenges for every occasion',
    cta: 'Browse prompts →',
  },
  {
    id: 'dna',
    to: '/analytics',
    icon: DNAIcon,
    title: 'Speech DNA',
    desc: 'Deep analytics tracking your communication evolution',
    cta: 'View analytics →',
  },
]

const DNA_METRICS = [
  { key: 'clarity_score', label: 'Clarity' },
  { key: 'confidence_score', label: 'Confidence' },
  { key: 'persuasion_score', label: 'Persuasion' },
  { key: 'vocal_variety_score', label: 'Vocal Variety' },
  { key: 'pacing_score', label: 'Pacing' },
  { key: 'conciseness_score', label: 'Conciseness' },
]

export default function Dashboard() {
  const { user, profile } = useAuthStore()
  const navigate = useNavigate()
  const [sessions, setSessions] = useState<SessionRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    getSessions(user.id, 10).then(({ data }) => {
      setSessions((data as SessionRow[]) || [])
      setLoading(false)
    })
  }, [user])

  const lastName = profile?.full_name?.split(' ').pop() || 'there'
  const latestAnalysis = sessions[0]?.analysis
  const overallScore = latestAnalysis?.overall_score ?? 0

  const avgScores = DNA_METRICS.reduce(
    (acc, m) => {
      const vals = sessions
        .map((s) => s.analysis?.[m.key as keyof Analysis] as number)
        .filter(Boolean)
      acc[m.key] = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0
      return acc
    },
    {} as Record<string, number>,
  )

  const totalMins = Math.round(sessions.reduce((a, s) => a + (s.duration_seconds || 0), 0) / 60)
  const streak = 3 // TODO: calculate real streak

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-screen-xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4"
      >
        <div>
          <h1 className="font-display text-3xl sm:text-4xl text-ivory">
            {greeting()}, {lastName}.
          </h1>
          <p className="text-sm text-ivory-secondary mt-1">Let's strengthen your voice.</p>
        </div>
        <div className="flex items-center gap-3">
          {profile?.subscription_status !== 'pro' && (
            <Button variant="ghost" size="sm" onClick={() => navigate('/upgrade')}>
              Upgrade Plan
            </Button>
          )}
          <div className="w-9 h-9 rounded-full bg-gold-gradient flex items-center justify-center text-midnight font-semibold text-sm">
            {profile?.full_name?.charAt(0) || 'G'}
          </div>
        </div>
      </motion.div>

      {/* Stats row */}
      {loading ? (
        <SkeletonStats />
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: 'Confidence Score', value: `${overallScore}`, sub: sessions.length > 1 ? '↑ improving' : 'Start practising', icon: '⚡' },
            { label: 'Current Streak', value: `${streak}d`, sub: 'Keep it up!', icon: '🔥' },
            { label: 'Minutes Practiced', value: `${totalMins}m`, sub: 'This month', icon: '⏱️' },
            { label: 'Total Sessions', value: `${sessions.length}`, sub: sessions.length === 0 ? 'Time to begin' : 'All time', icon: '🎯' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <GlassCard padding="sm" className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-sans text-ivory-secondary">{stat.label}</span>
                  <span className="text-base">{stat.icon}</span>
                </div>
                <div className="font-display text-3xl text-gold">{stat.value}</div>
                <div className="text-xs text-ivory-muted">{stat.sub}</div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      {/* Hero + DNA grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Hero card */}
        <div className="lg:col-span-2">
          <GlassCard padding="none" className="overflow-hidden relative min-h-[220px]">
            {/* Background */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: 'url(/images/hero-stage.png)',
                filter: 'brightness(0.25)',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-midnight/90 via-midnight/70 to-transparent" />

            <div className="relative z-10 p-8 space-y-5">
              <Badge variant="gold">Guided Delivery</Badge>
              <h2 className="font-display text-3xl sm:text-4xl text-ivory leading-tight">
                Speak with clarity.<br />
                <span className="italic text-gold">Lead with impact.</span>
              </h2>
              <p className="text-sm text-ivory-secondary max-w-sm">
                Use your own script, generate one with AI, or pick from our curated prompt library.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => navigate('/studio')} size="md">
                  Start a New Session
                </Button>
                <Button variant="ghost" size="md" onClick={() => navigate('/prompts')}>
                  Choose a Prompt →
                </Button>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Speech DNA panel */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg text-ivory">Speech DNA</h3>
            <Link to="/analytics" className="text-xs text-gold hover:text-gold-light transition-colors">View all →</Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-4">
              <div className="skeleton w-28 h-28 rounded-full" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-ivory-muted">No sessions yet</p>
              <p className="text-xs text-ivory-muted mt-1">Complete a session to see your DNA</p>
            </div>
          ) : (
            <>
              <div className="flex justify-center mb-6">
                <ScoreGauge score={overallScore} size={120} />
              </div>
              <div className="space-y-3">
                {DNA_METRICS.map((m, i) => (
                  <ScoreBar key={m.key} label={m.label} score={avgScores[m.key] || 0} delay={i * 0.08} />
                ))}
              </div>
            </>
          )}
        </GlassCard>
      </div>

      {/* Feature cards 2×2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {FEATURE_CARDS.map((card, i) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.07 }}
          >
            <GlassCard hover padding="md" onClick={() => navigate(card.to)} className="h-full flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                <card.icon size={18} className="text-gold" />
              </div>
              <div className="flex-1">
                <h4 className="font-sans font-semibold text-ivory mb-1">{card.title}</h4>
                <p className="text-sm text-ivory-secondary leading-relaxed">{card.desc}</p>
              </div>
              <span className="text-xs text-gold hover:text-gold-light transition-colors">{card.cta}</span>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Recent sessions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl text-ivory">Recent Sessions</h3>
          <Link to="/sessions" className="text-sm text-gold hover:text-gold-light transition-colors">View all →</Link>
        </div>

        {loading ? (
          <SkeletonList rows={4} />
        ) : sessions.length === 0 ? (
          <GlassCard padding="md">
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-gold/8 flex items-center justify-center mx-auto">
                <MicIcon size={20} className="text-gold/60" />
              </div>
              <p className="text-sm text-ivory-secondary">No sessions yet</p>
              <Button size="sm" onClick={() => navigate('/studio')}>Start your first session</Button>
            </div>
          </GlassCard>
        ) : (
          <div className="space-y-2">
            {sessions.slice(0, 5).map((session, i) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={`/sessions/${session.id}`}>
                  <div className="glass glass-hover rounded-xl px-5 py-4 flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-gold/8 border border-gold/20 flex items-center justify-center flex-shrink-0">
                      <PlayIcon size={14} className="text-gold ml-0.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-sans text-ivory truncate">{session.title || 'Untitled Session'}</p>
                      <p className="text-xs text-ivory-muted">
                        {session.duration_seconds ? `${Math.floor(session.duration_seconds / 60)}m ${session.duration_seconds % 60}s` : '—'} ·{' '}
                        {new Date(session.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={session.mode === 'guided' ? 'gold' : 'subtle'} size="sm">
                      {session.mode}
                    </Badge>
                    {session.analysis && (
                      <div
                        className={`text-sm font-semibold font-sans w-10 text-right ${
                          session.analysis.overall_score >= 80
                            ? 'text-gold'
                            : session.analysis.overall_score >= 60
                            ? 'text-gold-light'
                            : 'text-ivory-secondary'
                        }`}
                      >
                        {session.analysis.overall_score}
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Icons
function MicIcon({ size = 20, className = '' }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
}
function SwordsIcon({ size = 20, className = '' }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" y1="19" x2="19" y2="13"/><line x1="19" y1="21" x2="21" y2="19"/><polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"/></svg>
}
function LibraryIcon({ size = 20, className = '' }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
}
function DNAIcon({ size = 20, className = '' }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}><path d="M2 15C8 15 16 9 22 9"/><path d="M2 9c6 0 14 6 20 6"/></svg>
}
function PlayIcon({ size = 14, className = '' }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}><polygon points="5 3 19 12 5 21 5 3"/></svg>
}
