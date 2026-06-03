import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '@/components/ui/GlassCard'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { SkeletonList } from '@/components/ui/Skeleton'
import { deleteSession, deleteAllSessions } from '@/lib/supabase'
import { useAuthStore } from '@/stores/useAuthStore'
import type { Session, Analysis } from '@/types'

type Filter = 'all' | 'guided' | 'debate' | 'prompt'
type Sort = 'newest' | 'score' | 'duration'

type Row = Session & { analysis: Analysis }

export default function Sessions() {
  const { user, sessions: storeSessions, fetchSessions, invalidateSessions } = useAuthStore()
  const navigate = useNavigate()
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<Filter>('all')
  const [sort, setSort] = useState<Sort>('newest')
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [showClearAll, setShowClearAll] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!user) return
    fetchSessions(user.id)
  }, [user])

  const loading = storeSessions === null
  const sessions = ((storeSessions || []) as Row[]).filter((s) => !deletedIds.has(s.id))

  const handleDelete = async (sessionId: string) => {
    setDeleting(true)
    await deleteSession(sessionId)
    setDeletedIds((prev) => new Set([...prev, sessionId]))
    invalidateSessions()
    setConfirmingId(null)
    setDeleting(false)
  }

  const handleClearAll = async () => {
    if (!user) return
    setDeleting(true)
    await deleteAllSessions(user.id)
    setDeletedIds(new Set(sessions.map((s) => s.id)))
    invalidateSessions()
    setShowClearAll(false)
    setDeleting(false)
  }

  const filtered = sessions
    .filter((s) => filter === 'all' || s.mode === filter)
    .sort((a, b) => {
      if (sort === 'score') return (b.analysis?.overall_score || 0) - (a.analysis?.overall_score || 0)
      if (sort === 'duration') return (b.duration_seconds || 0) - (a.duration_seconds || 0)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-ivory">Session History</h1>
          <p className="text-ivory-secondary mt-1">Review and learn from every practice</p>
        </div>
        {sessions.length > 0 && (
          <button
            onClick={() => setShowClearAll(true)}
            className="text-xs text-ivory-muted hover:text-red-400 transition-colors mt-2 flex items-center gap-1.5 flex-shrink-0"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            Clear all
          </button>
        )}
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
          <AnimatePresence initial={false}>
            {filtered.map((session, i) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8, height: 0, marginBottom: 0 }}
                transition={{ delay: i * 0.03, duration: 0.2 }}
              >
                {confirmingId === session.id ? (
                  <div className="glass rounded-xl px-5 py-4 flex items-center gap-4 border border-red-500/20">
                    <p className="text-sm text-ivory-secondary flex-1">Delete this session?</p>
                    <button
                      onClick={() => handleDelete(session.id)}
                      disabled={deleting}
                      className="px-3 py-1.5 rounded-lg text-xs font-sans bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 transition-all disabled:opacity-50"
                    >
                      {deleting ? 'Deleting…' : 'Delete'}
                    </button>
                    <button
                      onClick={() => setConfirmingId(null)}
                      className="px-3 py-1.5 rounded-lg text-xs font-sans bg-white/5 border border-white/10 text-ivory-secondary hover:bg-white/8 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="group glass glass-hover rounded-xl px-5 py-4 flex items-center gap-4">
                    <Link to={`/sessions/${session.id}`} className="flex items-center gap-4 flex-1 min-w-0">
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
                    </Link>
                    <button
                      onClick={() => setConfirmingId(session.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-500/10 text-ivory-muted hover:text-red-400"
                      aria-label="Delete session"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Clear all confirmation modal */}
      <Modal open={showClearAll} onClose={() => setShowClearAll(false)} title="Clear all sessions?">
        <div className="space-y-4">
          <p className="text-sm text-ivory-secondary leading-relaxed">
            This will permanently delete all {sessions.length} session{sessions.length !== 1 ? 's' : ''} and their analysis. This cannot be undone.
          </p>
          <Button variant="danger" fullWidth loading={deleting} onClick={handleClearAll}>
            Delete all sessions
          </Button>
          <button
            onClick={() => setShowClearAll(false)}
            className="w-full text-sm text-ivory-muted hover:text-ivory transition-colors text-center"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  )
}
