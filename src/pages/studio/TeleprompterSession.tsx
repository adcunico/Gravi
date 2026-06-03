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

const SPEED_WPM = { slow: 80, medium: 130, fast: 180 }

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
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    if ((current + ' ' + word).trim().length > charsPerLine && current) {
      lines.push(current.trim())
      current = word
    } else {
      current = current ? current + ' ' + word : word
    }
  }
  if (current) lines.push(current.trim())
  return lines
}

export default function TeleprompterSession() {
  const navigate = useNavigate()
  const { user, profile } = useAuthStore()

  const debateTopic = (() => {
    const raw = sessionStorage.getItem('gravi_debate_topic')
    if (!raw) return null
    try {
      return JSON.parse(raw) as DebateTopic
    } catch {
      return null
    }
  })()

  const debatePosition = sessionStorage.getItem('gravi_debate_position') as DebatePosition | null
  const debateFormat = Number(sessionStorage.getItem('gravi_debate_format') || 5)
  const isDebate = Boolean(debateTopic)

  const script = sessionStorage.getItem('gravi_session_script') || (isDebate
    ? `Debate topic: ${debateTopic?.title}

${debateTopic?.description}

Position: ${debatePosition?.toUpperCase()}

Speak confidently for ${debateFormat} minutes.`
    : '')
  const title = sessionStorage.getItem('gravi_session_title') || (isDebate ? debateTopic?.title || 'Debate Session' : 'Session')
  const path = sessionStorage.getItem('gravi_session_path') || 'upload'
  const lines = splitLines(script)

  const [state, setState] = useState<State>('idle')
  const [countdown, setCountdown] = useState(3)
  const [currentLine, setCurrentLine] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [speed, setSpeed] = useState<'slow' | 'medium' | 'fast'>('medium')
  const [wpm, setWpm] = useState(0)
  const [showMicModal, setShowMicModal] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)
  const [webGLSupported, setWebGLSupported] = useState(true)
  const [processStatus, setProcessStatus] = useState<string[]>([])
  const [speechTracking, setSpeechTracking] = useState(false)

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
  const scrollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number>(0)
  const wordsSpokenRef = useRef<number>(0)
  const recognitionRef = useRef<InstanceType<typeof SpeechRecognition> | null>(null)
  const recentWordsRef = useRef<string[]>([])

  // Check WebGL support
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      setWebGLSupported(!!gl)
    } catch {
      setWebGLSupported(false)
    }
  }, [])

  const stopTimers = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    if (scrollTimerRef.current) { clearInterval(scrollTimerRef.current); scrollTimerRef.current = null }
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
      setCurrentLine(prev => {
        const next = prev + 1
        if (next >= lines.length) return prev
        if (lineMatchScore(lines[next], recentWordsRef.current) >= 0.5) {
          recentWordsRef.current = recentWordsRef.current.slice(-15)
          return next
        }
        return prev
      })
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

      setState('recording')
      startTimeRef.current = Date.now()

      timerRef.current = setInterval(() => {
        const secs = Math.floor((Date.now() - startTimeRef.current) / 1000)
        setElapsed(secs)
        // Rough live WPM
        wordsSpokenRef.current = script.split(/\s+/).length
        const elapsed = secs || 1
        setWpm(Math.round((wordsSpokenRef.current / elapsed) * 60))
      }, 1000)

      // Voice tracking drives the teleprompter; timer is the fallback
      const trackingStarted = startSpeechTracking()
      if (!trackingStarted) {
        const msPerLine = (60 / SPEED_WPM[speed]) * 1000 * 8
        scrollTimerRef.current = setInterval(() => {
          setCurrentLine((prev) => Math.min(prev + 1, lines.length - 1))
        }, msPerLine)
      }
    } catch {
      setShowMicModal(true)
    }
  }, [script, speed, lines.length, startSpeechTracking])

  const startCountdown = useCallback(async () => {
    try {
      if (!user) {
        navigate('/studio')
        return
      }
      // Block free users after 3 sessions
      if (profile?.subscription_status !== 'pro') {
        const { count } = await supabase
          .from('sessions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
        if ((count ?? 0) >= 3) {
          setShowPaywall(true)
          return
        }
      }
      setState('countdown')
      setCountdown(3)
      let c = 3
      const timer = setInterval(() => {
        c--
        setCountdown(c)
        if (c <= 0) {
          clearInterval(timer)
          beginRecording()
        }
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

  const resume = useCallback(() => {
    setState('recording')
    mediaRecorderRef.current?.resume()
    startTimeRef.current = Date.now() - elapsed * 1000
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 1000)
    const trackingStarted = startSpeechTracking()
    if (!trackingStarted) {
      const msPerLine = (60 / SPEED_WPM[speed]) * 1000 * 8
      scrollTimerRef.current = setInterval(() => {
        setCurrentLine((prev) => Math.min(prev + 1, lines.length - 1))
      }, msPerLine)
    }
  }, [elapsed, startSpeechTracking, speed, lines.length])

  const stopAndProcess = useCallback(async () => {
    stopTimers()
    mediaRecorderRef.current?.stop()
    setState('processing')

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

    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })

      // Transcribe
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

      // Analyse
      const analysisResult = await callEdgeFunction<Analysis>('analyse-speech', {
        transcript,
        mode: sessionMode,
        language: profile?.language || 'en',
        role: profile?.role || 'other',
        occasion: null,
        debate_position: sessionDebatePosition,
        script_used: sessionScript,
      })

      // Save session
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

      // Save analysis
      const { session_id: _sid, ...analysisFields } = analysisResult as Analysis & { session_id?: string }
      const { error: analysisErr } = await createAnalysis({
        session_id: sessionData.id,
        ...analysisFields,
      })
      if (analysisErr) {
        console.error('Analysis save error:', analysisErr)
      }

      // Upload audio to storage (best-effort — non-fatal)
      try {
        const filePath = `${user!.id}/${sessionData.id}.webm`
        const { error: uploadErr } = await supabase.storage
          .from('session-audio')
          .upload(filePath, audioBlob, { contentType: 'audio/webm' })
        if (!uploadErr) {
          await supabase
            .from('sessions')
            .update({ audio_url: filePath })
            .eq('id', sessionData.id)
        }
      } catch {
        // Audio upload failure doesn't block the debrief
      }

      if (isDebate) {
        sessionStorage.removeItem('gravi_debate_topic')
        sessionStorage.removeItem('gravi_debate_position')
        sessionStorage.removeItem('gravi_debate_format')
      }

      clearInterval(statusTimer)
      navigate(`/${isDebate ? 'debate' : 'studio'}/debrief/${sessionData.id}`)
    } catch (err) {
      console.error('Processing error:', err)
      clearInterval(statusTimer)
      // Still navigate — show error in debrief
      navigate('/sessions')
    }
  }, [stopTimers, script, title, path, user, profile, elapsed, navigate])

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  if (!script) {
    navigate('/studio')
    return null
  }

  return (
    <div className="fixed inset-0 bg-midnight flex flex-col overflow-hidden">
      {/* Processing overlay */}
      <AnimatePresence>
        {state === 'processing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 bg-midnight/95 backdrop-blur flex flex-col items-center justify-center gap-8"
          >
            <GoldWaveform analyser={null} active={false} />
            <div className="text-center space-y-6">
              <h2 className="font-display text-3xl text-ivory">Analysing your delivery…</h2>
              <div className="space-y-3">
                {processStatus.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 text-sm font-sans"
                  >
                    <div className="w-4 h-4 rounded-full bg-gold flex items-center justify-center">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0B0B0D" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <span className="text-ivory-secondary">{msg}</span>
                  </motion.div>
                ))}
                {processStatus.length < 3 && (
                  <div className="flex items-center gap-3 text-sm font-sans">
                    <span className="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                    <span className="text-ivory-muted">{['Transcribing audio...', 'Analysing delivery...', 'Preparing your debrief...'][processStatus.length]}</span>
                  </div>
                )}
              </div>
            </div>
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

      {/* Stats bar (recording only) */}
      {(state === 'recording' || state === 'paused') && (
        <div className="flex items-center justify-center gap-8 pt-4 pb-2 px-6 text-xs font-sans text-ivory-secondary">
          <span>{formatTime(elapsed)}</span>
          <span className="text-ivory-muted">·</span>
          <span>{wpm} WPM</span>
          <span className="text-ivory-muted">·</span>
          <span className={wpm < 110 ? 'text-amber-400' : wpm > 160 ? 'text-amber-400' : 'text-gold'}>
            {wpm < 110 ? 'Too slow' : wpm > 160 ? 'Too fast' : 'Good pace'}
          </span>
        </div>
      )}

      {/* Teleprompter text */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 sm:px-16 overflow-hidden">
        {state === 'idle' && isDebate && debateTopic && (
          <div className="mb-8 space-y-3 rounded-3xl border border-white/10 bg-midnight-graphite/80 p-5 text-left text-sm text-ivory-secondary">
            <div className="flex flex-col gap-2">
              <span className="font-sans text-xs uppercase tracking-[0.3em] text-gold">Debate Session</span>
              <p className="text-ivory">{debateTopic.title}</p>
              <p>{debateTopic.description}</p>
              <div className="flex flex-wrap gap-3 text-xs text-ivory-muted">
                <span>Position: {debatePosition?.toUpperCase()}</span>
                <span>Format: {debateFormat} min</span>
              </div>
            </div>
          </div>
        )}
        {state === 'idle' && (
          <div className="text-center space-y-4 mb-8">
            <p className="font-display text-2xl text-ivory-secondary italic">Prepare yourself.</p>
            <p className="text-sm text-ivory-muted">Your script is loaded. Press Begin when ready.</p>
          </div>
        )}

        <div className="w-full max-w-2xl space-y-4 text-center">
          {lines.map((line, i) => {
            const dist = i - currentLine
            if (Math.abs(dist) > 3) return null
            return (
              <motion.p
                key={i}
                animate={{
                  opacity: dist === 0 ? 1 : Math.max(0.1, 1 - Math.abs(dist) * 0.3),
                  y: dist * 48,
                  scale: dist === 0 ? 1 : 0.85 - Math.abs(dist) * 0.05,
                }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                className={[
                  'font-display leading-relaxed absolute w-full left-0',
                  dist === 0
                    ? 'text-ivory text-2xl sm:text-3xl lg:text-4xl'
                    : 'text-ivory/30 text-lg sm:text-xl',
                ].join(' ')}
                style={{ position: 'relative', transformOrigin: 'center' }}
              >
                {dist === 0 && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-full bg-gold rounded-full opacity-80"
                    style={{ left: '-20px' }}
                  />
                )}
                {line}
              </motion.p>
            )
          })}
        </div>
      </div>

      {/* Waveform */}
      {(state === 'recording' || state === 'paused') && (
        <div className="h-32 w-full">
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
            <div className="flex gap-2">
              {(['slow', 'medium', 'fast'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={[
                    'px-3 py-1.5 rounded-lg text-xs font-sans border capitalize transition-all',
                    speed === s ? 'bg-gold/12 border-gold/40 text-gold' : 'bg-white/5 border-white/8 text-ivory-secondary',
                  ].join(' ')}
                >
                  {s}
                </button>
              ))}
            </div>
            <Button size="lg" onClick={startCountdown}>Begin Recording</Button>
            <button
              onClick={() => navigate('/studio')}
              className="text-sm text-ivory-muted hover:text-ivory transition-colors"
            >
              Cancel
            </button>
          </>
        )}

        {state === 'recording' && (
          <>
            <button onClick={pause} className="w-12 h-12 rounded-full bg-white/8 border border-white/10 flex items-center justify-center hover:bg-white/12 transition-all" aria-label="Pause">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#F7F3EA"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            </button>
            <button
              onClick={stopAndProcess}
              className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500/50 flex items-center justify-center hover:bg-red-500/30 transition-all"
              aria-label="Stop recording"
            >
              <div className="w-6 h-6 rounded bg-red-400" />
            </button>
            <div className="flex gap-2 items-center">
              {speechTracking ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans text-gold border border-gold/20 bg-gold/5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                  Voice tracking
                </div>
              ) : (
                (['slow', 'medium', 'fast'] as const).map((s) => (
                  <button key={s} onClick={() => setSpeed(s)} className={['px-3 py-1.5 rounded-lg text-xs font-sans capitalize transition-all', speed === s ? 'text-gold' : 'text-ivory-muted'].join(' ')}>{s}</button>
                ))
              )}
            </div>
          </>
        )}

        {state === 'paused' && (
          <>
            <Button variant="ghost" onClick={resume}>Resume</Button>
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
