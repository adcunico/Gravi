import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import GoldWaveform, { CssWaveform } from '@/components/features/GoldWaveform'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { useAuthStore } from '@/stores/useAuthStore'
import { createSession, createAnalysis, callEdgeFunction, supabase } from '@/lib/supabase'
import type { Analysis, DebateTopic, DebatePosition } from '@/types'

type State = 'idle' | 'countdown' | 'recording' | 'paused' | 'processing'

interface SpeechRecognitionResult {
  isFinal: boolean
  [i: number]: { transcript: string }
}
interface SpeechRecognitionEvent extends Event {
  resultIndex: number
  results: SpeechRecognitionResult[] & { length: number }
}
interface SpeechRecognitionErrorEvent extends Event { error: string }
interface SpeechRecognition extends EventTarget {
  continuous: boolean; interimResults: boolean; lang: string
  onresult: ((e: SpeechRecognitionEvent) => void) | null
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  start(): void; stop(): void
}
declare const SpeechRecognition: { new(): SpeechRecognition }

// Pixels per teleprompter line. All scroll math is in these units.
const LINE_HEIGHT = 76
// Approximate words per wrapped line (used for WPM-to-px/ms conversion).
const WORDS_PER_LINE = 8

const LANG_MAP: Record<string, string> = {
  en: 'en-US', pt: 'pt-BR', es: 'es-ES', fr: 'fr-FR', de: 'de-DE', zh: 'zh-CN',
}

const STOP_WORDS = new Set([
  'the','a','an','is','are','was','were','of','in','to','and','or','for','with',
  'that','this','it','will','be','has','have','had','by','at','as','on','we',
  'you','our','your','their','they','but','not','from','so','if','its','one',
])

function sigWords(line: string): string[] {
  return line.toLowerCase().split(/\s+/)
    .map(w => w.replace(/[^a-z]/g, ''))
    .filter(w => w.length > 3 && !STOP_WORDS.has(w))
}

function lineMatchScore(line: string, recentWords: string[]): number {
  const sig = sigWords(line)
  if (sig.length === 0) return 0
  const wordSet = new Set(recentWords)
  return sig.filter(w => wordSet.has(w)).length / sig.length
}

function splitLines(text: string, charsPerLine = 55): string[] {
  const lines: string[] = []
  for (const para of text.split(/\n+/)) {
    const trimmed = para.trim()
    if (!trimmed) continue
    let current = ''
    for (const word of trimmed.split(' ')) {
      if ((current + ' ' + word).trim().length > charsPerLine && current) {
        lines.push(current.trim())
        current = word
      } else {
        current = current ? current + ' ' + word : word
      }
    }
    if (current) lines.push(current.trim())
  }
  return lines
}

export default function TeleprompterSession() {
  const navigate = useNavigate()
  const { user, profile } = useAuthStore()

  const debateTopic = (() => {
    const raw = sessionStorage.getItem('gravi_debate_topic')
    if (!raw) return null
    try { return JSON.parse(raw) as DebateTopic } catch { return null }
  })()

  const debatePosition = sessionStorage.getItem('gravi_debate_position') as DebatePosition | null
  const debateFormat = Number(sessionStorage.getItem('gravi_debate_format') || 5)
  const isDebate = Boolean(debateTopic)

  const script = sessionStorage.getItem('gravi_session_script') || (isDebate
    ? `Debate topic: ${debateTopic?.title}\n\n${debateTopic?.description}\n\nPosition: ${debatePosition?.toUpperCase()}\n\nSpeak confidently for ${debateFormat} minutes.`
    : '')
  const title = sessionStorage.getItem('gravi_session_title') || (isDebate ? debateTopic?.title || 'Debate Session' : 'Session')
  const path = sessionStorage.getItem('gravi_session_path') || 'upload'

  // Memoised so callbacks that depend on `lines` don't re-fire every render.
  const lines = useMemo(() => splitLines(script), [script])

  const [state, setState] = useState<State>('idle')
  const [countdown, setCountdown] = useState(3)
  // displayScrollY drives rendering; scrollYRef is mutated in rAF/voice tracking.
  const [displayScrollY, setDisplayScrollY] = useState(0)
  const [speedWpm, setSpeedWpm] = useState(130)
  const [elapsed, setElapsed] = useState(0)
  const [showMicModal, setShowMicModal] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)
  const [webGLSupported, setWebGLSupported] = useState(true)
  const [processStatus, setProcessStatus] = useState<string[]>([])
  const [speechTracking, setSpeechTracking] = useState(false)
  const [containerHeight, setContainerHeight] = useState(0)
  const [processingPhase, setProcessingPhase] = useState<'working' | 'reveal'>('working')
  const [fakeProgress, setFakeProgress] = useState(0)
  const [showReflection, setShowReflection] = useState(false)
  const [reflectionAnswer, setReflectionAnswer] = useState<string | null>(null)
  const [sessionWordEst, setSessionWordEst] = useState(0)

  useEffect(() => {
    if (!isDebate) {
      sessionStorage.removeItem('gravi_debate_topic')
      sessionStorage.removeItem('gravi_debate_position')
      sessionStorage.removeItem('gravi_debate_format')
    }
  }, [isDebate])

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const analyserRef = useRef<AnalyserNode | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number>(0)
  const recognitionRef = useRef<InstanceType<typeof SpeechRecognition> | null>(null)
  const recentWordsRef = useRef<string[]>([])
  // The authoritative scroll position — written by rAF and voice tracking, read by renderer.
  const scrollYRef = useRef(0)
  const rAFRef = useRef<number | undefined>(undefined)
  const lastFrameTimeRef = useRef<number>(0)
  // Mirror of speedWpm read inside the rAF tick without needing to restart the loop.
  const speedWpmRef = useRef(130)
  const teleContainerRef = useRef<HTMLDivElement>(null)
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const reflectionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingNavRef = useRef<string>('')

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      setWebGLSupported(!!gl)
    } catch { setWebGLSupported(false) }
  }, [])

  // Measure the teleprompter container so we can center the reading zone precisely.
  useEffect(() => {
    const measure = () => {
      if (teleContainerRef.current) setContainerHeight(teleContainerRef.current.clientHeight)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  // rAF loop: continuously drifts the scroll forward at the chosen WPM pace.
  // Voice tracking may jump scrollYRef ahead; this loop only ever advances, never retreats.
  useEffect(() => {
    if (state !== 'recording') {
      if (rAFRef.current !== undefined) { cancelAnimationFrame(rAFRef.current); rAFRef.current = undefined }
      lastFrameTimeRef.current = 0
      return
    }

    const maxScrollY = Math.max(0, (lines.length - 1) * LINE_HEIGHT)

    const tick = (ts: number) => {
      if (lastFrameTimeRef.current > 0) {
        const delta = ts - lastFrameTimeRef.current
        const pxPerMs = (speedWpmRef.current * LINE_HEIGHT) / (WORDS_PER_LINE * 60 * 1000)
        scrollYRef.current = Math.min(scrollYRef.current + pxPerMs * delta, maxScrollY)
        setDisplayScrollY(scrollYRef.current)
      }
      lastFrameTimeRef.current = ts
      rAFRef.current = requestAnimationFrame(tick)
    }

    lastFrameTimeRef.current = 0
    rAFRef.current = requestAnimationFrame(tick)
    return () => {
      if (rAFRef.current !== undefined) { cancelAnimationFrame(rAFRef.current); rAFRef.current = undefined }
      lastFrameTimeRef.current = 0
    }
  }, [state, lines.length])

  // Keyboard nudge: arrow keys snap one line forward or back during recording/paused.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (state !== 'recording' && state !== 'paused') return
      const maxScrollY = Math.max(0, (lines.length - 1) * LINE_HEIGHT)
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        scrollYRef.current = Math.min(scrollYRef.current + LINE_HEIGHT, maxScrollY)
        setDisplayScrollY(scrollYRef.current)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        scrollYRef.current = Math.max(scrollYRef.current - LINE_HEIGHT, 0)
        setDisplayScrollY(scrollYRef.current)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [state, lines.length])

  const stopTimers = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    if (rAFRef.current) { cancelAnimationFrame(rAFRef.current); rAFRef.current = undefined }
    lastFrameTimeRef.current = 0
    try { recognitionRef.current?.stop() } catch {}
    recognitionRef.current = null
    setSpeechTracking(false)
  }, [])

  const startSpeechTracking = useCallback((): boolean => {
    const win = window as Window & { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }
    const SR = win.SpeechRecognition ?? win.webkitSpeechRecognition
    if (!SR) return false

    const recognition = new SR()
    recognition.continuous = true
    recognition.interimResults = false
    recognition.lang = LANG_MAP[profile?.language ?? 'en'] ?? 'en-US'
    recentWordsRef.current = []

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const words = event.results[i][0].transcript
          .toLowerCase().split(/\s+/).map(w => w.replace(/[^a-z]/g, '')).filter(Boolean)
        recentWordsRef.current.push(...words)
        if (recentWordsRef.current.length > 60) {
          recentWordsRef.current = recentWordsRef.current.slice(-60)
        }
      }

      // Check if the next line matches what was spoken. If the drift hasn't
      // reached it yet, jump scrollYRef ahead — never back.
      const currentLineIndex = Math.round(scrollYRef.current / LINE_HEIGHT)
      const nextLineIndex = currentLineIndex + 1

      if (nextLineIndex < lines.length && lineMatchScore(lines[nextLineIndex], recentWordsRef.current) >= 0.5) {
        const targetScrollY = nextLineIndex * LINE_HEIGHT
        if (targetScrollY > scrollYRef.current) {
          scrollYRef.current = targetScrollY
          setDisplayScrollY(targetScrollY)
        }
        recentWordsRef.current = recentWordsRef.current.slice(-15)
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== 'no-speech') setSpeechTracking(false)
    }

    recognition.onend = () => {
      if (mediaRecorderRef.current?.state === 'recording') {
        try { recognition.start() } catch {}
      }
    }

    try {
      recognition.start()
      recognitionRef.current = recognition
      setSpeechTracking(true)
      return true
    } catch {
      return false
    }
  }, [lines, profile?.language])

  const beginRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const ctx = new AudioContext()
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

      scrollYRef.current = 0
      setDisplayScrollY(0)
      setState('recording')
      startTimeRef.current = Date.now()

      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000))
      }, 1000)

      // Best-effort; the rAF drift runs regardless so there's no timer fallback needed.
      startSpeechTracking()
    } catch {
      setShowMicModal(true)
    }
  }, [startSpeechTracking])

  const startCountdown = useCallback(async () => {
    try {
      if (!user) { navigate('/studio'); return }
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
    } catch (err) {
      console.error('Failed to start countdown:', err)
      beginRecording()
    }
  }, [beginRecording, profile, user, navigate])

  const pause = useCallback(() => {
    setState('paused')
    stopTimers()
    mediaRecorderRef.current?.pause()
  }, [stopTimers])

  const restart = useCallback(() => {
    stopTimers()
    try { mediaRecorderRef.current?.stop() } catch {}
    mediaRecorderRef.current = null
    audioChunksRef.current = []
    scrollYRef.current = 0
    setDisplayScrollY(0)
    setElapsed(0)
    setState('idle')
  }, [stopTimers])

  const resume = useCallback(() => {
    mediaRecorderRef.current?.resume()
    startTimeRef.current = Date.now() - elapsed * 1000
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 1000)
    startSpeechTracking()
    setState('recording') // triggers the rAF useEffect to restart
  }, [elapsed, startSpeechTracking])

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

    // Fake progress: creep to ~84% until API returns, then jump to 100
    progressIntervalRef.current = setInterval(() => {
      setFakeProgress(prev => prev >= 84 ? prev : prev + Math.max(0.3, (84 - prev) * 0.055))
    }, 250)

    // Reflection prompt appears after 1.5 s
    reflectionTimerRef.current = setTimeout(() => setShowReflection(true), 1500)

    const statusMessages = [
      'Transcribing audio...',
      'Analysing delivery...',
      'Preparing your debrief...',
    ]
    let currentIdx = 0
    const statusTimer = setInterval(() => {
      if (currentIdx < statusMessages.length) {
        setProcessStatus((prev) => [...prev, statusMessages[currentIdx]])
        currentIdx++
      } else {
        clearInterval(statusTimer)
      }
    }, 1200)

    const cleanup = () => {
      clearInterval(statusTimer)
      if (progressIntervalRef.current) { clearInterval(progressIntervalRef.current); progressIntervalRef.current = null }
      if (reflectionTimerRef.current) { clearTimeout(reflectionTimerRef.current); reflectionTimerRef.current = null }
    }

    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })

      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')
      const { data: transcribeData, error: transcribeErr } = await supabase.functions.invoke('transcribe-audio', {
        body: formData,
      })
      if (transcribeErr) throw transcribeErr
      const { transcript, duration_seconds } = transcribeData as { transcript: string; duration_seconds: number }

      const sessionMode = isDebate ? 'debate' : 'guided'
      const sessionPath = isDebate ? null : (path as 'upload' | 'generate' | 'library')
      const sessionTopic = isDebate ? debateTopic?.title ?? null : null
      const sessionScript = isDebate ? null : script
      const sessionDebatePosition = isDebate ? debatePosition : null

      const analysisResult = await callEdgeFunction<Analysis>('analyse-speech', {
        transcript,
        mode: sessionMode,
        language: profile?.language || 'en',
        role: profile?.role || 'other',
        occasion: null,
        debate_position: sessionDebatePosition,
        script_used: sessionScript,
      })

      const { data: sessionData, error: sessionErr } = await createSession({
        user_id: user!.id,
        mode: sessionMode,
        path: sessionPath,
        title,
        script_used: sessionScript,
        transcript,
        duration_seconds: duration_seconds || elapsed,
        language: profile?.language || 'en',
        occasion: null,
        topic: sessionTopic,
        debate_position: sessionDebatePosition,
        audio_url: null,
      })
      if (sessionErr || !sessionData) throw sessionErr

      const { session_id: _sid, ...analysisFields } = analysisResult as Analysis & { session_id?: string }
      const { error: analysisErr } = await createAnalysis({
        session_id: sessionData.id,
        ...analysisFields,
      })
      if (analysisErr) console.error('Analysis save error:', analysisErr)

      try {
        const filePath = `${user!.id}/${sessionData.id}.webm`
        const { error: uploadErr } = await supabase.storage
          .from('session-audio')
          .upload(filePath, audioBlob, { contentType: 'audio/webm' })
        if (!uploadErr) {
          await supabase.from('sessions').update({ audio_url: filePath }).eq('id', sessionData.id)
        }
      } catch {
        // non-fatal
      }

      if (isDebate) {
        sessionStorage.removeItem('gravi_debate_topic')
        sessionStorage.removeItem('gravi_debate_position')
        sessionStorage.removeItem('gravi_debate_format')
      }

      cleanup()
      pendingNavRef.current = `/${isDebate ? 'debate' : 'studio'}/debrief/${sessionData.id}`
      setFakeProgress(100)
      // Brief hold at 100% then reveal screen, then navigate
      setTimeout(() => {
        setProcessingPhase('reveal')
        setTimeout(() => navigate(pendingNavRef.current), 1800)
      }, 400)
    } catch (err) {
      console.error('Processing error:', err)
      cleanup()
      navigate('/sessions')
    }
  }, [stopTimers, script, title, path, user, profile, elapsed, navigate, isDebate, debateTopic, debatePosition])

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const nudge = useCallback((direction: 1 | -1) => {
    const maxScrollY = Math.max(0, (lines.length - 1) * LINE_HEIGHT)
    scrollYRef.current = Math.max(0, Math.min(scrollYRef.current + direction * LINE_HEIGHT, maxScrollY))
    setDisplayScrollY(scrollYRef.current)
  }, [lines.length])

  const handleSpeedChange = (v: number) => {
    setSpeedWpm(v)
    speedWpmRef.current = v
  }

  if (!script) { navigate('/studio'); return null }

  // translateY positions the scrolling inner div so the active line sits at the container's vertical center.
  const translateY = containerHeight > 0 ? containerHeight / 2 - LINE_HEIGHT / 2 - displayScrollY : 0

  return (
    <div className="fixed inset-0 bg-midnight flex flex-col overflow-hidden">
      {/* Processing overlay */}
      <AnimatePresence>
        {state === 'processing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 bg-midnight/95 backdrop-blur flex flex-col items-center justify-center px-8"
          >
            <AnimatePresence mode="wait">
              {processingPhase === 'reveal' ? (
                /* ── Reveal moment ── */
                <motion.div
                  key="reveal"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="flex flex-col items-center gap-6 text-center"
                >
                  <div className="relative">
                    <div className="w-28 h-28 rounded-full border border-gold/30 flex items-center justify-center animate-pulse">
                      <div className="w-20 h-20 rounded-full bg-gold/8 flex items-center justify-center">
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#D4A85A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <h2 className="font-display text-4xl text-ivory">Your Speech DNA is ready.</h2>
                </motion.div>
              ) : (
                /* ── Working phase ── */
                <motion.div
                  key="working"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-5 w-full max-w-sm text-center"
                >
                  {/* Immediate stats */}
                  <div className="flex items-center gap-3 text-xs font-sans text-gold">
                    <span>{formatTime(elapsed)}</span>
                    <span className="text-ivory-muted">·</span>
                    <span>~{sessionWordEst} words spoken</span>
                  </div>

                  {/* Animation */}
                  <GoldWaveform analyser={null} active={false} />

                  {/* Heading */}
                  <h2 className="font-display text-2xl text-ivory">Analysing your delivery…</h2>

                  {/* Progress bar + ETA */}
                  <div className="w-full space-y-2">
                    <div className="h-1 bg-white/8 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${fakeProgress}%`, background: 'linear-gradient(90deg, #D4A85A, #F2D28B)' }}
                      />
                    </div>
                    <p className="text-xs text-ivory-muted">~15 seconds</p>
                  </div>

                  {/* Reflection prompt */}
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

                  {/* Step checklist */}
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

      {/* Countdown overlay */}
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

      {/* Recording indicator */}
      {state === 'recording' && (
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 record-pulse" />
          <span className="text-xs font-sans text-ivory-secondary tracking-widest uppercase">Recording</span>
        </div>
      )}

      {/* Stats bar */}
      {(state === 'recording' || state === 'paused') && (
        <div className="flex items-center justify-center gap-6 pt-4 pb-2 px-6 text-xs font-sans text-ivory-secondary">
          <span>{formatTime(elapsed)}</span>
          {speechTracking && (
            <>
              <span className="text-ivory-muted">·</span>
              <div className="flex items-center gap-1.5 text-gold">
                <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                Voice tracking
              </div>
            </>
          )}
        </div>
      )}

      {/* Teleprompter area */}
      <div ref={teleContainerRef} className="flex-1 relative overflow-hidden">
        {/* Top/bottom gradient masks to fade lines in/out smoothly */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, #0B0B0D 0%, transparent 28%, transparent 72%, #0B0B0D 100%)' }}
        />

        {/* Idle overlay — shown on top of the dimmed script preview */}
        {state === 'idle' && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-5 px-6">
            {isDebate && debateTopic && (
              <div className="rounded-3xl border border-white/10 bg-midnight-graphite/80 p-5 text-left text-sm text-ivory-secondary max-w-md w-full">
                <span className="font-sans text-xs uppercase tracking-[0.3em] text-gold">Debate Session</span>
                <p className="text-ivory mt-1">{debateTopic.title}</p>
                <p className="mt-1">{debateTopic.description}</p>
                <div className="flex flex-wrap gap-3 text-xs text-ivory-muted mt-2">
                  <span>Position: {debatePosition?.toUpperCase()}</span>
                  <span>Format: {debateFormat} min</span>
                </div>
              </div>
            )}
            <p className="font-display text-2xl text-ivory-secondary italic">Prepare yourself.</p>
            <p className="text-sm text-ivory-muted">Your script is loaded. Press Begin when ready.</p>
          </div>
        )}

        {/* Scrolling text — absolutely positioned inner div translated continuously via rAF */}
        {containerHeight > 0 && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              height: lines.length * LINE_HEIGHT,
              transform: `translateY(${translateY}px)`,
              opacity: state === 'idle' ? 0.1 : 1,
              willChange: 'transform',
            }}
          >
            {lines.map((line, i) => {
              const distLines = i - displayScrollY / LINE_HEIGHT
              if (Math.abs(distLines) > 5) return null

              const absDist = Math.abs(distLines)
              const isActive = absDist < 0.6
              const opacity = Math.max(0.08, 1 - absDist * 0.32)
              const scale = Math.max(0.78, 1 - absDist * 0.07)

              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    top: i * LINE_HEIGHT,
                    left: 0,
                    right: 0,
                    height: LINE_HEIGHT,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity,
                    transform: `scale(${scale})`,
                  }}
                >
                  {isActive && state !== 'idle' && (
                    <span className="absolute left-4 sm:left-8 w-0.5 h-8 bg-gold/70 rounded-full" />
                  )}
                  <p className={[
                    'font-display text-center leading-tight max-w-2xl px-10',
                    isActive && state !== 'idle'
                      ? 'text-ivory text-2xl sm:text-3xl lg:text-4xl'
                      : 'text-ivory/50 text-lg sm:text-xl',
                  ].join(' ')}>
                    {line}
                  </p>
                </div>
              )
            })}
          </div>
        )}

        {/* Nudge buttons — tap to jump one line, visible during active/paused states */}
        {(state === 'recording' || state === 'paused') && (
          <div className="absolute right-4 inset-y-0 z-20 flex flex-col items-center justify-center gap-3 pointer-events-none">
            <button
              onPointerDown={(e) => { e.preventDefault(); nudge(-1) }}
              className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/12 transition-all pointer-events-auto"
              aria-label="Back one line (↑)"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-ivory-muted"><polyline points="18 15 12 9 6 15"/></svg>
            </button>
            <button
              onPointerDown={(e) => { e.preventDefault(); nudge(1) }}
              className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/12 transition-all pointer-events-auto"
              aria-label="Forward one line (↓)"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-ivory-muted"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
          </div>
        )}
      </div>

      {/* Waveform */}
      {(state === 'recording' || state === 'paused') && (
        <div className="h-24 w-full">
          {webGLSupported ? (
            <GoldWaveform analyser={analyserRef.current} active={state === 'recording'} />
          ) : (
            <CssWaveform active={state === 'recording'} />
          )}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between px-8 pb-8 pt-4 gap-4">
        {state === 'idle' && (
          <>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="text-xs text-ivory-muted whitespace-nowrap">Pace</span>
              <input
                type="range"
                min={50} max={220} step={5}
                value={speedWpm}
                onChange={(e) => handleSpeedChange(Number(e.target.value))}
                className="flex-1 min-w-0 accent-gold cursor-pointer"
              />
              <span className="text-xs text-gold whitespace-nowrap w-16 text-right">{speedWpm} WPM</span>
            </div>
            <Button size="lg" onClick={startCountdown}>Begin Recording</Button>
            <button
              onClick={() => navigate('/studio')}
              className="text-sm text-ivory-muted hover:text-ivory transition-colors whitespace-nowrap"
            >
              Cancel
            </button>
          </>
        )}

        {state === 'recording' && (
          <>
            <button
              onClick={pause}
              className="w-12 h-12 rounded-full bg-white/8 border border-white/10 flex items-center justify-center hover:bg-white/12 transition-all flex-shrink-0"
              aria-label="Pause"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#F7F3EA"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            </button>
            <button
              onClick={stopAndProcess}
              className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500/50 flex items-center justify-center hover:bg-red-500/30 transition-all flex-shrink-0"
              aria-label="Stop recording"
            >
              <div className="w-6 h-6 rounded bg-red-400" />
            </button>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="text-xs text-ivory-muted whitespace-nowrap">Pace</span>
              <input
                type="range"
                min={50} max={220} step={5}
                value={speedWpm}
                onChange={(e) => handleSpeedChange(Number(e.target.value))}
                className="flex-1 min-w-0 accent-gold cursor-pointer"
              />
              <span className="text-xs text-gold whitespace-nowrap">{speedWpm}</span>
            </div>
          </>
        )}

        {state === 'paused' && (
          <>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="text-xs text-ivory-muted whitespace-nowrap">Pace</span>
              <input
                type="range"
                min={50} max={220} step={5}
                value={speedWpm}
                onChange={(e) => handleSpeedChange(Number(e.target.value))}
                className="flex-1 min-w-0 accent-gold cursor-pointer"
              />
              <span className="text-xs text-gold whitespace-nowrap w-16">{speedWpm} WPM</span>
            </div>
            <Button variant="ghost" onClick={resume}>Resume</Button>
            <Button variant="ghost" onClick={restart}>Restart</Button>
            <Button variant="danger" onClick={stopAndProcess}>End Session</Button>
          </>
        )}
      </div>

      {/* Session limit paywall modal */}
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

      {/* Mic permission modal */}
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
