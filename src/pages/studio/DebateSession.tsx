import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import GoldWaveform, { CssWaveform } from '@/components/features/GoldWaveform'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { useAuthStore } from '@/stores/useAuthStore'
import { createSession, createAnalysis, callEdgeFunction, supabase } from '@/lib/supabase'
import type { Analysis, DebateTopic, DebatePosition } from '@/types'

type State = 'idle' | 'countdown' | 'recording' | 'paused' | 'processing'

const POSITION_STYLES: Record<string, { label: string; badge: string }> = {
  for:     { label: 'FOR',     badge: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' },
  against: { label: 'AGAINST', badge: 'border-red-500/40    bg-red-500/10    text-red-400'    },
  neutral: { label: 'NEUTRAL', badge: 'border-blue-500/40   bg-blue-500/10   text-blue-400'   },
}

const HINTS = [
  'Open with your main claim',
  'Support with 2–3 pieces of evidence',
  'Anticipate and counter objections',
  'Close with conviction',
]

const STRUCTURE_STEPS = ['Open', 'Claim', 'Evidence', 'Close']

export default function DebateSession() {
  const navigate = useNavigate()
  const { user, profile } = useAuthStore()

  const debateTopic = (() => {
    const raw = sessionStorage.getItem('gravi_debate_topic')
    if (!raw) return null
    try { return JSON.parse(raw) as DebateTopic } catch { return null }
  })()
  const debatePosition = sessionStorage.getItem('gravi_debate_position') as DebatePosition | null
  const debateFormat   = Number(sessionStorage.getItem('gravi_debate_format') || 5)
  const targetSeconds  = debateFormat * 60

  const [state, setState]                   = useState<State>('idle')
  const [countdown, setCountdown]           = useState(3)
  const [elapsed, setElapsed]               = useState(0)
  const [webGLSupported, setWebGLSupported] = useState(true)
  const [processStatus, setProcessStatus]   = useState<string[]>([])
  const [processingPhase, setProcessingPhase] = useState<'working' | 'reveal'>('working')
  const [fakeProgress, setFakeProgress]     = useState(0)
  const [showReflection, setShowReflection] = useState(false)
  const [reflectionAnswer, setReflectionAnswer] = useState<string | null>(null)
  const [sessionWordEst, setSessionWordEst] = useState(0)
  const [showPaywall, setShowPaywall]       = useState(false)
  const [showMicModal, setShowMicModal]     = useState(false)

  const mediaRecorderRef      = useRef<MediaRecorder | null>(null)
  const audioChunksRef        = useRef<Blob[]>([])
  const analyserRef           = useRef<AnalyserNode | null>(null)
  const timerRef              = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef          = useRef<number>(0)
  const progressIntervalRef   = useRef<ReturnType<typeof setInterval> | null>(null)
  const reflectionTimerRef    = useRef<ReturnType<typeof setTimeout>  | null>(null)
  const pendingNavRef         = useRef<string>('')

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      setWebGLSupported(!!gl)
    } catch { setWebGLSupported(false) }
  }, [])

  const stopTimers = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }, [])

  const beginRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const ctx    = new AudioContext()
      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      analyserRef.current = analyser

      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      audioChunksRef.current = []
      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data) }
      recorder.start(200)
      mediaRecorderRef.current = recorder

      setState('recording')
      startTimeRef.current = Date.now()
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000))
      }, 1000)
    } catch {
      setShowMicModal(true)
    }
  }, [])

  const startCountdown = useCallback(async () => {
    try {
      if (!user) { navigate('/debate'); return }
      if (profile?.subscription_status !== 'pro') {
        const { count } = await supabase
          .from('sessions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
        if ((count ?? 0) >= 3) { setShowPaywall(true); return }
      }
      setState('countdown')
      setCountdown(3)
      let c = 3
      const timer = setInterval(() => {
        c--
        setCountdown(c)
        if (c <= 0) { clearInterval(timer); beginRecording() }
      }, 1000)
    } catch {
      beginRecording()
    }
  }, [beginRecording, profile, user, navigate])

  const pause = useCallback(() => {
    setState('paused')
    stopTimers()
    mediaRecorderRef.current?.pause()
  }, [stopTimers])

  const resume = useCallback(() => {
    mediaRecorderRef.current?.resume()
    startTimeRef.current = Date.now() - elapsed * 1000
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 1000)
    setState('recording')
  }, [elapsed])

  const restart = useCallback(() => {
    stopTimers()
    try { mediaRecorderRef.current?.stop() } catch {}
    mediaRecorderRef.current = null
    audioChunksRef.current   = []
    setElapsed(0)
    setState('idle')
  }, [stopTimers])

  const stopAndProcess = useCallback(async () => {
    stopTimers()
    mediaRecorderRef.current?.stop()
    setState('processing')
    setProcessingPhase('working')
    setFakeProgress(0)
    setProcessStatus([])
    setShowReflection(false)
    setReflectionAnswer(null)
    setSessionWordEst(Math.round(elapsed * 130 / 60))

    progressIntervalRef.current = setInterval(() => {
      setFakeProgress(prev => prev >= 84 ? prev : prev + Math.max(0.3, (84 - prev) * 0.055))
    }, 250)
    reflectionTimerRef.current = setTimeout(() => setShowReflection(true), 1500)

    const statusMessages = ['Transcribing audio...', 'Analysing delivery...', 'Preparing your debrief...']
    let currentIdx = 0
    const statusTimer = setInterval(() => {
      if (currentIdx < statusMessages.length) {
        setProcessStatus(prev => [...prev, statusMessages[currentIdx]])
        currentIdx++
      } else {
        clearInterval(statusTimer)
      }
    }, 1200)

    const cleanup = () => {
      clearInterval(statusTimer)
      if (progressIntervalRef.current) { clearInterval(progressIntervalRef.current); progressIntervalRef.current = null }
      if (reflectionTimerRef.current)  { clearTimeout(reflectionTimerRef.current);   reflectionTimerRef.current  = null }
    }

    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
      const formData  = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')

      const { data: transcribeData, error: transcribeErr } = await supabase.functions.invoke('transcribe-audio', { body: formData })
      if (transcribeErr) throw transcribeErr
      const { transcript, duration_seconds } = transcribeData as { transcript: string; duration_seconds: number }

      const analysisResult = await callEdgeFunction<Analysis>('analyse-speech', {
        transcript,
        mode: 'debate',
        language: profile?.language || 'en',
        role: profile?.role || 'other',
        occasion: null,
        debate_position: debatePosition,
        script_used: null,
      })

      const { data: sessionData, error: sessionErr } = await createSession({
        user_id: user!.id,
        mode: 'debate',
        path: null,
        title: debateTopic?.title ?? 'Debate Session',
        script_used: null,
        transcript,
        duration_seconds: duration_seconds || elapsed,
        language: profile?.language || 'en',
        occasion: null,
        topic: debateTopic?.title ?? null,
        debate_position: debatePosition,
        audio_url: null,
      })
      if (sessionErr || !sessionData) throw sessionErr

      const { session_id: _sid, ...analysisFields } = analysisResult as Analysis & { session_id?: string }
      await createAnalysis({ session_id: sessionData.id, ...analysisFields })

      try {
        const filePath = `${user!.id}/${sessionData.id}.webm`
        const { error: uploadErr } = await supabase.storage
          .from('session-audio')
          .upload(filePath, audioBlob, { contentType: 'audio/webm' })
        if (!uploadErr) {
          await supabase.from('sessions').update({ audio_url: filePath }).eq('id', sessionData.id)
        }
      } catch { /* non-fatal */ }

      sessionStorage.removeItem('gravi_debate_topic')
      sessionStorage.removeItem('gravi_debate_position')
      sessionStorage.removeItem('gravi_debate_format')

      cleanup()
      pendingNavRef.current = `/debate/debrief/${sessionData.id}`
      setFakeProgress(100)
      setTimeout(() => {
        setProcessingPhase('reveal')
        setTimeout(() => navigate(pendingNavRef.current), 1800)
      }, 400)
    } catch (err) {
      console.error('Processing error:', err)
      cleanup()
      navigate('/sessions')
    }
  }, [stopTimers, elapsed, navigate, debateTopic, debatePosition, profile, user])

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  if (!debateTopic) { navigate('/debate'); return null }

  const remaining    = Math.max(0, targetSeconds - elapsed)
  const progress     = targetSeconds > 0 ? Math.min(elapsed / targetSeconds, 1) : 0
  const currentStep  = Math.min(Math.floor(progress * STRUCTURE_STEPS.length), STRUCTURE_STEPS.length - 1)
  const posStyle     = POSITION_STYLES[debatePosition ?? 'neutral']
  const isActive     = state === 'recording' || state === 'paused'

  return (
    <div className="fixed inset-0 bg-midnight flex flex-col overflow-hidden">

      {/* ── Processing overlay ── */}
      <AnimatePresence>
        {state === 'processing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 bg-midnight/95 backdrop-blur flex flex-col items-center justify-center px-8"
          >
            <AnimatePresence mode="wait">
              {processingPhase === 'reveal' ? (
                <motion.div
                  key="reveal"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="flex flex-col items-center gap-6 text-center"
                >
                  <div className="w-28 h-28 rounded-full border border-gold/30 flex items-center justify-center animate-pulse">
                    <div className="w-20 h-20 rounded-full bg-gold/8 flex items-center justify-center">
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#D4A85A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                  </div>
                  <h2 className="font-display text-4xl text-ivory">Your Speech DNA is ready.</h2>
                </motion.div>
              ) : (
                <motion.div
                  key="working"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-5 w-full max-w-sm text-center"
                >
                  <div className="flex items-center gap-3 text-xs font-sans text-gold">
                    <span>{formatTime(elapsed)}</span>
                    <span className="text-ivory-muted">·</span>
                    <span>~{sessionWordEst} words spoken</span>
                  </div>
                  <GoldWaveform analyser={null} active={false} />
                  <h2 className="font-display text-2xl text-ivory">Analysing your delivery…</h2>
                  <div className="w-full space-y-2">
                    <div className="h-1 bg-white/8 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${fakeProgress}%`, background: 'linear-gradient(90deg, #D4A85A, #F2D28B)' }}
                      />
                    </div>
                    <p className="text-xs text-ivory-muted">~15 seconds</p>
                  </div>
                  <AnimatePresence>
                    {showReflection && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full rounded-xl border border-white/8 bg-white/4 p-4 space-y-3 text-left"
                      >
                        <p className="text-sm font-sans text-ivory-secondary">What felt strongest in that delivery?</p>
                        <div className="flex flex-wrap gap-2">
                          {['My confidence', 'My clarity', 'My pacing'].map(opt => (
                            <button
                              key={opt}
                              onClick={() => setReflectionAnswer(opt)}
                              className={[
                                'px-3 py-1.5 rounded-full text-sm font-sans border transition-all',
                                reflectionAnswer === opt
                                  ? 'bg-gold/15 border-gold/50 text-gold'
                                  : 'bg-white/5 border-white/10 text-ivory-secondary hover:border-gold/30',
                              ].join(' ')}
                            >
                              {reflectionAnswer === opt ? '✓ ' : ''}{opt}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="space-y-2 w-full text-left">
                    {processStatus.map((msg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 text-sm font-sans"
                      >
                        <div className="w-4 h-4 rounded-full bg-gold flex items-center justify-center flex-shrink-0">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0B0B0D" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                        <span className="text-ivory-secondary">{msg}</span>
                      </motion.div>
                    ))}
                    {processStatus.length < 3 && (
                      <div className="flex items-center gap-3 text-sm font-sans">
                        <span className="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin flex-shrink-0" />
                        <span className="text-ivory-muted">{['Transcribing audio...', 'Analysing delivery...', 'Preparing your debrief...'][processStatus.length]}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Countdown overlay ── */}
      <AnimatePresence>
        {state === 'countdown' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 flex items-center justify-center bg-midnight/80"
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={countdown}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.5 }}
                transition={{ duration: 0.4 }}
                className="font-display text-9xl text-gold"
              >
                {countdown > 0 ? countdown : ''}
              </motion.span>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Top bar: context strip (always visible after idle) ── */}
      {isActive && (
        <div className="flex items-center justify-between px-5 pt-5 pb-3 gap-4">
          {/* Position + topic */}
          <div className="flex items-center gap-3 min-w-0">
            <span className={`flex-shrink-0 px-2.5 py-0.5 rounded-full border text-[11px] font-sans font-bold tracking-widest ${posStyle.badge}`}>
              {posStyle.label}
            </span>
            <span className="text-sm font-sans text-ivory-secondary truncate">{debateTopic.title}</span>
          </div>

          {/* Timer: elapsed / target */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {state === 'recording' && (
              <div className="w-2 h-2 rounded-full bg-red-500 record-pulse" />
            )}
            <span className="text-sm font-sans text-ivory tabular-nums">
              {formatTime(elapsed)}
            </span>
            <span className="text-xs text-ivory-muted">/</span>
            <span className={`text-sm font-sans tabular-nums ${remaining < 30 ? 'text-amber-400' : 'text-ivory-muted'}`}>
              {formatTime(remaining)}
            </span>
          </div>
        </div>
      )}

      {/* ── Idle: briefing card ── */}
      {state === 'idle' && (
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg space-y-6"
          >
            {/* Position + topic header */}
            <div className="space-y-3">
              <span className={`inline-flex px-3 py-1 rounded-full border text-xs font-sans font-bold tracking-widest ${posStyle.badge}`}>
                {posStyle.label}
              </span>
              <h1 className="font-display text-3xl text-ivory leading-snug">{debateTopic.title}</h1>
              {debateTopic.description && (
                <p className="text-sm text-ivory-secondary leading-relaxed">{debateTopic.description}</p>
              )}
              <p className="text-xs text-ivory-muted font-sans">{debateFormat} minute{debateFormat !== 1 ? 's' : ''}</p>
            </div>

            {/* Divider */}
            <div className="h-px bg-white/8" />

            {/* Argument structure hints */}
            <div className="space-y-2">
              <p className="text-xs font-sans font-semibold text-ivory-muted tracking-widest uppercase">Argument structure</p>
              <div className="space-y-2">
                {HINTS.map((hint, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm text-ivory-secondary">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-[11px] font-sans text-gold font-semibold mt-0.5">
                      {i + 1}
                    </span>
                    {hint}
                  </div>
                ))}
              </div>
            </div>

            <Button fullWidth size="lg" onClick={startCountdown}>Begin Speaking</Button>
            <button
              onClick={() => navigate('/debate')}
              className="w-full text-sm text-ivory-muted hover:text-ivory transition-colors text-center"
            >
              Cancel
            </button>
          </motion.div>
        </div>
      )}

      {/* ── Recording / paused: waveform stage ── */}
      {isActive && (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full h-full max-h-64">
            {webGLSupported ? (
              <GoldWaveform analyser={analyserRef.current} active={state === 'recording'} />
            ) : (
              <CssWaveform active={state === 'recording'} />
            )}
          </div>
        </div>
      )}

      {/* ── Structure whisper ── */}
      {isActive && (
        <div className="px-6 pb-4">
          <div className="flex items-center gap-1">
            {STRUCTURE_STEPS.map((step, i) => (
              <div key={step} className="flex items-center gap-1">
                <span
                  className={[
                    'text-xs font-sans transition-all duration-500',
                    i === currentStep
                      ? 'text-gold font-semibold'
                      : i < currentStep
                        ? 'text-ivory-muted/40 line-through'
                        : 'text-ivory-muted/30',
                  ].join(' ')}
                >
                  {step}
                </span>
                {i < STRUCTURE_STEPS.length - 1 && (
                  <span className="text-ivory-muted/20 text-xs">→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Controls ── */}
      <div className="flex items-center justify-center gap-4 px-8 pb-8 pt-2">
        {state === 'recording' && (
          <>
            <button
              onClick={pause}
              className="w-12 h-12 rounded-full bg-white/8 border border-white/10 flex items-center justify-center hover:bg-white/12 transition-all"
              aria-label="Pause"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#F7F3EA"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            </button>
            <button
              onClick={stopAndProcess}
              className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500/50 flex items-center justify-center hover:bg-red-500/30 transition-all"
              aria-label="End session"
            >
              <div className="w-6 h-6 rounded bg-red-400" />
            </button>
          </>
        )}

        {state === 'paused' && (
          <>
            <Button variant="ghost" onClick={resume}>Resume</Button>
            <Button variant="ghost" onClick={restart}>Restart</Button>
            <Button variant="danger" onClick={stopAndProcess}>End Session</Button>
          </>
        )}
      </div>

      {/* ── Paywall modal ── */}
      <Modal open={showPaywall} onClose={() => setShowPaywall(false)} title="You've reached your session limit">
        <div className="space-y-4">
          <p className="text-sm text-ivory-secondary leading-relaxed">
            Free accounts include 3 sessions. Upgrade to Gravi Pro for unlimited sessions, advanced analytics, PDF export, and audio replay.
          </p>
          <Button fullWidth onClick={() => navigate('/upgrade')}>View Plans →</Button>
          <button
            onClick={() => setShowPaywall(false)}
            className="w-full text-sm text-ivory-muted hover:text-ivory transition-colors text-center"
          >
            Maybe later
          </button>
        </div>
      </Modal>

      {/* ── Mic permission modal ── */}
      <Modal open={showMicModal} onClose={() => { setShowMicModal(false); setState('idle') }} title="Microphone Access Needed">
        <div className="space-y-4">
          <p className="text-sm text-ivory-secondary leading-relaxed">
            Gravi needs microphone access to record and analyse your speech. Your audio is processed immediately and never stored on our servers.
          </p>
          <p className="text-sm text-ivory-muted">
            Please allow microphone access in your browser settings and try again.
          </p>
          <Button fullWidth onClick={() => { setShowMicModal(false); setState('idle') }}>Understood</Button>
        </div>
      </Modal>
    </div>
  )
}
