import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import GlassCard from '@/components/ui/GlassCard'
import Badge from '@/components/ui/Badge'
import { SkeletonList } from '@/components/ui/Skeleton'
import { getSessions } from '@/lib/supabase'
import { useAuthStore } from '@/stores/useAuthStore'
import type { Session, Analysis } from '@/types'

type Filter = 'all' | 'guided' | 'debate' | 'prompt'
type Sort = 'newest' | 'score' | 'duration'

type Row = Session & { analysis: Analysis }

export default function Sessions() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [sessions, setSessions] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('all')
  const [sort, setSort] = useState<Sort>('newest')

  useEffect(() => {
    if (!user) return
    getSessions(user.id, 100).then(({ data }) => {
      setSessions((data as Row[]) || [])
      setLoading(false)
    })
  }, [user])

  const filtered = sessions
    .filter((s) => filter === 'all' || s.mode === filter)
    .sort((a, b) => {
      if (sort === 'score') return (b.analysis?.overall_score || 0) - (a.analysis?.overall_score || 0)
      if (sort === 'duration') return (b.duration_seconds || 0) - (a.duration_seconds || 0)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-4xl text-ivory">Session History</h1>
        <p className="text-ivory-secondary mt-1">Review and learn from every practice</p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {(['all', 'guided', 'debate', 'prompt'] as Filter[]).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-sans border capitalize transition-all ${filter === f ? 'bg-gold/12 border-gold/40 text-gold' : 'bg-white/5 border-white/8 text-ivory-secondary hover:border-gold/20'}`}>{f}</button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          className="bg-midnight-graphite border border-white/10 text-ivory-secondary text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-gold/40"
        >
          <option value="newest">Newest first</option>
          <option value="score">Highest score</option>
          <option value="duration">Longest</option>
        </select>
      </div>

      {loading ? (
        <SkeletonList rows={6} />
      ) : filtered.length === 0 ? (
        <GlassCard padding="md">
          <div className="py-10 text-center space-y-3">
            <p className="text-ivory-secondary">No sessions found</p>
            <button onClick={() => navigate('/studio')} className="text-sm text-gold hover:text-gold-light transition-colors">
              Start your first session →
            </button>
          </div>
        </GlassCard>
      ) : (
        <div className="space-y-2">
          {filtered.map((session, i) => (
            <motion.div key={session.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
              <Link to={`/sessions/${session.id}`}>
                <div className="glass glass-hover rounded-xl px-5 py-4 flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-gold/8 border border-gold/15 flex items-center justify-center flex-shrink-0">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#D4A85A"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-sans text-ivory truncate">{session.title || 'Untitled Session'}</p>
                    <p className="text-xs text-ivory-muted">
                      {session.duration_seconds ? `${Math.floor(session.duration_seconds / 60)}m ${session.duration_seconds % 60}s` : '—'} · {new Date(session.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={session.mode === 'guided' ? 'gold' : session.mode === 'debate' ? 'info' : 'subtle'}>
                    {session.mode}
                  </Badge>
                  {session.analysis && (
                    <div className={`text-sm font-semibold font-sans w-10 text-right ${session.analysis.overall_score >= 80 ? 'text-gold' : session.analysis.overall_score >= 60 ? 'text-gold-light' : 'text-ivory-secondary'}`}>
                      {session.analysis.overall_score}
                    </div>
                  )}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5A5852" strokeWidth="1.5" className="flex-shrink-0"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
