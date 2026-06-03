import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ScoreGauge from '@/components/ui/ScoreGauge'
import ScoreBar from '@/components/ui/ScoreBar'
import GlassCard from '@/components/ui/GlassCard'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { getSessionById, supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/useAuthStore'
import type { Session, Analysis } from '@/types'
import { SCORE_LABEL } from '@/types'

type Tab = 'overview' | 'delivery' | 'content' | 'voice' | 'debate' | 'transcript'

export default function Debrief() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const [session, setSession] = useState<Session | null>(null)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('overview')
  const [audioSrc, setAudioSrc] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) return
    getSessionById(sessionId).then(({ data }) => {
      if (data) {
        setSession(data)
        setAnalysis(data.analysis)
      }
      setLoading(false)
    })
  }, [sessionId])

  const isPro = profile?.subscription_status === 'pro'

  // Generate signed URL for Pro users who have audio
  useEffect(() => {
    if (!isPro || !session?.audio_url) return
    supabase.storage
      .from('session-audio')
      .createSignedUrl(session.audio_url, 3600)
      .then(({ data }) => {
        if (data?.signedUrl) setAudioSrc(data.signedUrl)
      })
  }, [session, isPro])

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-10 w-1/2" />
        <div className="flex justify-center"><Skeleton className="w-36 h-36 rounded-full" /></div>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16" />)}
        </div>
      </div>
    )
  }

  if (!session || !analysis) {
    return (
      <div className="p-6 text-center space-y-4">
        <p className="text-ivory-secondary">Session not found.</p>
        <Button onClick={() => navigate('/sessions')}>Back to Sessions</Button>
      </div>
    )
  }

  const score = analysis.overall_score
  const pacePercent = Math.max(0, Math.min(100, ((analysis.wpm - 60) / 180) * 100))
  const transcriptTab: { id: Tab; label: string } | null = session?.transcript
    ? { id: 'transcript', label: 'Transcript' }
    : null

  const tabs: { id: Tab; label: string }[] = [
    ...(session?.mode === 'debate'
      ? [
          { id: 'overview' as Tab, label: 'Overview' },
          { id: 'delivery' as Tab, label: 'Delivery' },
          { id: 'debate' as Tab, label: 'Debate' },
          { id: 'content' as Tab, label: 'Content' },
          { id: 'voice' as Tab, label: 'Voice' },
        ]
      : [
          { id: 'overview' as Tab, label: 'Overview' },
          { id: 'delivery' as Tab, label: 'Delivery' },
          { id: 'content' as Tab, label: 'Content' },
          { id: 'voice' as Tab, label: 'Voice' },
        ]),
    ...(transcriptTab ? [transcriptTab] : []),
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-3xl text-ivory">Your Delivery</h1>
            <p className="text-sm text-ivory-secondary mt-1">
              {session.title} · {new Date(session.created_at).toLocaleDateString()}
            </p>
            {session.mode === 'debate' && session.topic && (
              <p className="text-xs text-ivory-muted mt-1">Debate topic: {session.topic}</p>
            )}
          </div>
          <div className="flex gap-2">
            {isPro ? (
              <Button variant="ghost" size="sm" onClick={() => window.print()}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Export PDF
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => navigate('/upgrade')}>
                <span className="text-xs">🔒</span> PDF Export
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Score */}
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="flex flex-col items-center gap-3">
        <ScoreGauge score={score} size={160} />
        <Badge variant={score >= 80 ? 'gold' : 'subtle'}>
          {session.mode.charAt(0).toUpperCase() + session.mode.slice(1)} · {Math.floor((session.duration_seconds || 0) / 60)}m {(session.duration_seconds || 0) % 60}s
        </Badge>
      </motion.div>

      {/* Tabs */}
      <div className="border-b border-white/8">
        <div className="flex gap-0">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={
                tab === t.id
                  ? 'border-b-2 border-gold text-ivory pb-3 px-5 text-sm font-sans transition-colors duration-200'
                  : 'border-b-2 border-transparent text-ivory-muted hover:text-ivory pb-3 px-5 text-sm font-sans transition-colors duration-200'
              }
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {tab === 'overview' && (
            <GlassCard>
              <p className="text-base text-ivory leading-relaxed">{analysis.overall_summary}</p>

              {analysis.strengths.length > 0 && (
                <div className="border-t border-white/6 pt-5 mt-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-4 bg-gold rounded-full" />
                    <span className="text-xs font-sans text-ivory-secondary uppercase tracking-[0.12em]">Strengths</span>
                  </div>
                  <ul className="space-y-2">
                    {analysis.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-ivory-secondary leading-relaxed">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#D4A85A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-1"><polyline points="20 6 9 17 4 12"/></svg>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.improvements.length > 0 && (
                <div className="border-t border-white/6 pt-5 mt-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-4 bg-amber-400/70 rounded-full" />
                    <span className="text-xs font-sans text-ivory-secondary uppercase tracking-[0.12em]">Areas to Improve</span>
                  </div>
                  <ul className="space-y-2">
                    {analysis.improvements.map((imp, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-ivory-secondary leading-relaxed">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(251,191,36,0.7)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-1"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
                        {imp}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.vocabulary_upgrades.length > 0 && session.path !== 'upload' && session.path !== 'generate' && (
                <div className="border-t border-white/6 pt-5 mt-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-4 bg-white/20 rounded-full" />
                    <span className="text-xs font-sans text-ivory-secondary uppercase tracking-[0.12em]">Vocabulary Upgrades</span>
                  </div>
                  <div className="space-y-3">
                    {analysis.vocabulary_upgrades.map((v, i) => (
                      <div key={i} className="text-sm space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-ivory-muted line-through">{v.original}</span>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold/50"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                          <span className="text-gold font-medium">{v.suggested}</span>
                        </div>
                        <p className="text-xs text-ivory-muted pl-1">{v.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </GlassCard>
          )}

          {tab === 'delivery' && (
            <GlassCard>
              <div className="space-y-5">
                <ScoreBar label="Clarity" score={analysis.clarity_score} note="How easy it was to understand your message" delay={0} />
                <ScoreBar label="Confidence" score={analysis.confidence_score} note="Projected authority and assurance" delay={0.1} />
                <ScoreBar label="Pacing" score={analysis.pacing_score} note={`${analysis.wpm} WPM — ideal range is 120–160 WPM`} delay={0.2} />
                <ScoreBar label="Vocal Variety" score={analysis.vocal_variety_score} note="Range and modulation in your voice" delay={0.3} />
              </div>

              {analysis.filler_words.length > 0 && (
                <div className="mt-6 pt-6 border-t border-white/8">
                  <h4 className="text-sm font-semibold text-ivory mb-3">Filler Words Detected</h4>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {analysis.filler_words.map((fw, i) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 font-sans">
                        {fw.word} ({fw.count}×)
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-ivory-muted italic">Filler words reduce perceived authority and confidence.</p>
                </div>
              )}
            </GlassCard>
          )}

          {tab === 'content' && (
            <GlassCard>
              <div className="space-y-5">
                <ScoreBar label="Conciseness" score={analysis.conciseness_score} note="Economy of language — every word earning its place" delay={0} />
                <ScoreBar label="Persuasion" score={analysis.persuasion_score} note="Ability to influence and move your audience" delay={0.1} />
              </div>
            </GlassCard>
          )}

          {tab === 'debate' && session?.mode === 'debate' && (
            <GlassCard>
              <div className="space-y-5">
                <ScoreBar label="Argument" score={analysis.debate_argument_score ?? 0} note="Strength of your central claim and reasoning" delay={0} />
                <ScoreBar label="Logic" score={analysis.debate_logic_score ?? 0} note="How coherent and persuasive your argument was" delay={0.1} />
                <ScoreBar label="Conviction" score={analysis.debate_conviction_score ?? 0} note="Your confidence, presence, and delivery" delay={0.2} />
              </div>
            </GlassCard>
          )}

          {tab === 'voice' && (
            <>
              {isPro && audioSrc && (
                <GlassCard>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-5 rounded-full bg-gold" />
                    <h3 className="font-sans font-semibold text-ivory">Session Recording</h3>
                  </div>
                  <AudioPlayer src={audioSrc} />
                </GlassCard>
              )}
              {isPro && session?.audio_url && !audioSrc && (
                <GlassCard>
                  <p className="text-sm text-ivory-muted">Loading audio…</p>
                </GlassCard>
              )}
              {!isPro && session?.audio_url && (
                <GlassCard
                  className="cursor-pointer"
                  onClick={() => navigate('/upgrade')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center flex-shrink-0">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#D4A85A" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </div>
                    <div>
                      <p className="text-sm font-sans text-ivory">Session recording available</p>
                      <p className="text-xs text-gold">Upgrade to Pro to listen →</p>
                    </div>
                  </div>
                </GlassCard>
              )}
            <GlassCard>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-ivory-secondary">Pace Rating</span>
                    <span className={analysis.pace_rating === 'good' ? 'text-gold' : 'text-amber-400'}>
                      {analysis.pace_rating}
                    </span>
                  </div>
                  <div className="relative h-2 bg-white/8 rounded-full">
                    <div className="absolute h-full bg-gold/20 rounded-full" style={{ left: '33%', right: '44%' }} />
                    {[80, 120, 160, 200].map(tick => (
                      <div key={tick} className="absolute top-0 w-px h-2 bg-white/20" style={{ left: `${((tick - 60) / 180) * 100}%` }} />
                    ))}
                    <div
                      className="absolute h-4 w-1 bg-gold rounded-full -top-1 transition-all"
                      style={{ left: `${pacePercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-ivory-muted mt-1">
                    <span>Too slow</span><span>Good</span><span>Too fast</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/8">
                  <span className="text-sm text-ivory-secondary">Words per minute</span>
                  <span className="text-gold font-semibold font-sans">{analysis.wpm} WPM</span>
                </div>
                <p className="text-xs text-ivory-muted">Ideal range for professional speech: 120–160 WPM</p>
              </div>
            </GlassCard>
            </>
          )}
          {tab === 'transcript' && session?.transcript && (
            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-sans font-semibold text-ivory">Transcript</h3>
                <span className="text-xs text-ivory-muted">
                  {session.transcript.split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
              <p className="text-sm text-ivory-secondary leading-relaxed whitespace-pre-wrap font-sans">
                {session.transcript}
              </p>
            </GlassCard>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Bottom CTAs */}
      <div className="flex flex-wrap gap-3 pt-4 border-t border-white/8">
        <Button variant="ghost" onClick={() => {
          sessionStorage.setItem('gravi_session_script', session.script_used || '')
          sessionStorage.setItem('gravi_session_title', session.title)
          sessionStorage.setItem('gravi_session_path', session.path || 'upload')
          navigate('/studio/session')
        }}>
          Practice Again
        </Button>
        <Button variant="ghost" onClick={() => navigate('/studio')}>New Session</Button>
        <Link to="/sessions" className="text-sm text-gold hover:text-gold-light transition-colors self-center ml-auto">
          View All Sessions →
        </Link>
      </div>
    </div>
  )
}

function AudioPlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)

  const toggle = () => {
    if (!audioRef.current) return
    playing ? audioRef.current.pause() : audioRef.current.play()
    setPlaying(!playing)
  }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-white/8 bg-midnight-graphite/40">
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={() => setCurrent(audioRef.current?.currentTime ?? 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onEnded={() => setPlaying(false)}
      />
      <button
        onClick={toggle}
        className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold hover:bg-gold/20 transition-colors flex-shrink-0"
        aria-label={playing ? 'Pause' : 'Play'}
      >
        {playing
          ? <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
          : <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        }
      </button>
      <div className="flex-1 space-y-1.5">
        <input
          type="range"
          min={0}
          max={duration || 1}
          value={current}
          onChange={e => {
            const t = Number(e.target.value)
            if (audioRef.current) audioRef.current.currentTime = t
            setCurrent(t)
          }}
          className="w-full h-1 rounded-full appearance-none cursor-pointer"
          style={{ background: `linear-gradient(to right, #D4A85A ${(current / (duration || 1)) * 100}%, rgba(255,255,255,0.08) 0%)` }}
        />
        <div className="flex justify-between text-xs text-ivory-muted font-sans">
          <span>{fmt(current)}</span>
          <span>{fmt(duration)}</span>
        </div>
      </div>
    </div>
  )
}
