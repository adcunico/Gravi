import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import ScoreGauge from '@/components/ui/ScoreGauge'
import ScoreBar from '@/components/ui/ScoreBar'
import GlassCard from '@/components/ui/GlassCard'
import Badge from '@/components/ui/Badge'
import { SkeletonStats } from '@/components/ui/Skeleton'
import { useAuthStore } from '@/stores/useAuthStore'
import type { Session, Analysis } from '@/types'

type Range = '7d' | '30d' | 'all'
type SessionRow = Session & { analysis: Analysis }

const METRICS = [
  { key: 'clarity_score', label: 'Clarity' },
  { key: 'confidence_score', label: 'Confidence' },
  { key: 'persuasion_score', label: 'Persuasion' },
  { key: 'vocal_variety_score', label: 'Vocal Variety' },
  { key: 'pacing_score', label: 'Pacing' },
  { key: 'conciseness_score', label: 'Conciseness' },
]

export default function Analytics() {
  const { user, profile, sessions: storeSessions, fetchSessions } = useAuthStore()
  const [range, setRange] = useState<Range>('30d')
  const [activeMetric, setActiveMetric] = useState('overall_score')

  useEffect(() => {
    if (!user) return
    fetchSessions(user.id)
  }, [user])

  const loading = storeSessions === null
  const sessions = (storeSessions || []) as SessionRow[]

  const isPro = profile?.subscription_status === 'pro'
  const cutoff = range === '7d' ? 7 : range === '30d' ? 30 : 9999
  const filtered = sessions.filter((s) => {
    const days = (Date.now() - new Date(s.created_at).getTime()) / 86400000
    return days <= cutoff
  })

  const withAnalysis = filtered.filter((s) => s.analysis)
  const avg = (key: string) => {
    const vals = withAnalysis.map((s) => s.analysis?.[key as keyof Analysis] as number).filter(Boolean)
    return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0
  }

  const overallAvg = avg('overall_score')
  const totalMins = Math.round(sessions.reduce((a, s) => a + (s.duration_seconds || 0), 0) / 60)

  // Build chart data
  const chartData = withAnalysis
    .slice()
    .reverse()
    .map((s, i) => ({
      name: `#${i + 1}`,
      date: new Date(s.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      overall_score: s.analysis?.overall_score,
      ...METRICS.reduce((acc, m) => ({ ...acc, [m.key]: s.analysis?.[m.key as keyof Analysis] }), {}),
    }))

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
    if (active && payload?.length) {
      return (
        <div className="glass rounded-lg px-3 py-2 text-xs font-sans">
          <p className="text-ivory-secondary">{label}</p>
          <p className="text-gold font-semibold">{payload[0].value}</p>
        </div>
      )
    }
    return null
  }

  const bestMetric = METRICS.reduce((best, m) => avg(m.key) > avg(best.key) ? m : best, METRICS[0])
  const worstMetric = METRICS.reduce((worst, m) => avg(m.key) < avg(worst.key) ? m : worst, METRICS[0])

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-screen-xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-4xl text-ivory">Speech DNA</h1>
          <p className="text-ivory-secondary mt-1">Track your communication evolution</p>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', 'all'] as Range[]).map((r) => (
            <button key={r} onClick={() => setRange(r)} className={`px-4 py-2 rounded-lg text-sm font-sans border transition-all ${range === r ? 'bg-gold/12 border-gold/40 text-gold' : 'bg-white/5 border-white/8 text-ivory-secondary hover:border-gold/20'}`}>
              {r === '7d' ? 'Last 7 days' : r === '30d' ? 'Last 30 days' : 'All time'}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Top stats */}
      {loading ? (
        <SkeletonStats />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="col-span-2 lg:col-span-1 flex justify-center">
            <ScoreGauge score={overallAvg} size={140} />
          </div>
          {[
            { label: 'Sessions', value: sessions.length },
            { label: 'Minutes practiced', value: `${totalMins}m` },
            { label: 'Avg score', value: overallAvg },
            { label: 'Most improved', value: bestMetric.label },
          ].map((s) => (
            <GlassCard key={s.label} padding="sm" className="space-y-1">
              <p className="text-xs text-ivory-secondary">{s.label}</p>
              <p className="font-display text-2xl text-gold">{s.value}</p>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Chart */}
      {chartData.length > 1 && (
        <GlassCard>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h3 className="font-display text-lg text-ivory">Progress over time</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveMetric('overall_score')}
                className={`px-3 py-1 rounded-full text-xs font-sans border transition-all ${activeMetric === 'overall_score' ? 'bg-gold/12 border-gold/40 text-gold' : 'bg-white/5 border-white/8 text-ivory-secondary'}`}
              >
                Overall
              </button>
              {METRICS.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setActiveMetric(m.key)}
                  className={`px-3 py-1 rounded-full text-xs font-sans border transition-all ${activeMetric === m.key ? 'bg-gold/12 border-gold/40 text-gold' : 'bg-white/5 border-white/8 text-ivory-secondary'}`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: '#9E9A92', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#9E9A92', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey={activeMetric}
                stroke="#D4A85A"
                strokeWidth={2}
                dot={{ fill: '#D4A85A', r: 3 }}
                activeDot={{ r: 5, fill: '#F2D28B' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>
      )}

      {/* Score breakdown grid */}
      {!loading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {METRICS.map((m, i) => {
            const score = avg(m.key)
            return (
              <motion.div key={m.key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <GlassCard padding="md">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-sans text-ivory">{m.label}</span>
                    <Badge variant={score >= 80 ? 'gold' : score >= 60 ? 'subtle' : 'warn'}>
                      {score}
                    </Badge>
                  </div>
                  <ScoreBar label="" score={score} animate delay={i * 0.05} />
                </GlassCard>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Insights */}
      {withAnalysis.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-4">
          <GlassCard>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-5 rounded-full bg-emerald-400" />
              <h3 className="text-sm font-semibold text-ivory">Most Improved</h3>
            </div>
            <p className="font-display text-2xl text-gold">{bestMetric.label}</p>
            <p className="text-xs text-ivory-muted mt-1">Score: {avg(bestMetric.key)}/100</p>
          </GlassCard>
          <GlassCard>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-5 rounded-full bg-amber-400" />
              <h3 className="text-sm font-semibold text-ivory">Needs Focus</h3>
            </div>
            <p className="font-display text-2xl text-gold">{worstMetric.label}</p>
            <p className="text-xs text-ivory-muted mt-1">Score: {avg(worstMetric.key)}/100 — practise more here</p>
          </GlassCard>
        </div>
      )}

      {/* Pro gate for history */}
      {!isPro && sessions.length >= 3 && (
        <GlassCard gold padding="md" className="text-center space-y-3">
          <p className="text-sm text-ivory-secondary">Full analytics history and trend charts require Gravi Pro</p>
          <button onClick={() => window.location.href = '/upgrade'} className="text-sm text-gold hover:text-gold-light transition-colors">
            Upgrade to Pro →
          </button>
        </GlassCard>
      )}
    </div>
  )
}
