import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import GlassCard from '@/components/ui/GlassCard'
import { supabase, submitPromptSuggestion } from '@/lib/supabase'
import { useAuthStore } from '@/stores/useAuthStore'

const LOADING_MSGS = [
  'Analyzing your topic…',
  'Structuring the narrative…',
  'Crafting your opening…',
  'Building key arguments…',
  'Polishing the close…',
]

const OCCASIONS = [
  '🎯 Pitch', '🎤 Keynote', '📺 Media Interview', '📊 Board Update',
  '💡 TED-style Talk', '🎙️ Podcast Appearance', '🏆 Award Speech', '🚀 Product Launch',
]
const TONES = ['Authoritative', 'Inspirational', 'Conversational', 'Formal']
const LENGTHS = [{ label: '2 min', value: 2 }, { label: '5 min', value: 5 }, { label: '10 min', value: 10 }]

export default function StudioGenerate() {
  const [occasion, setOccasion] = useState('')
  const [topic, setTopic] = useState('')
  const [keyPoints, setKeyPoints] = useState('')
  const [tone, setTone] = useState('Authoritative')
  const [length, setLength] = useState(5)
  const [loading, setLoading] = useState(false)
  const [statusIdx, setStatusIdx] = useState(0)
  const [generated, setGenerated] = useState('')
  const [wordCount, setWordCount] = useState(0)
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState('')
  const [suggSent, setSuggSent] = useState(false)
  const navigate = useNavigate()
  const { user, profile } = useAuthStore()

  useEffect(() => {
    if (!loading || generated) return
    setStatusIdx(0)
    const id = setInterval(() => setStatusIdx(i => (i + 1) % LOADING_MSGS.length), 1800)
    return () => clearInterval(id)
  }, [loading, generated])

  const canGenerate = occasion && topic.trim()

  const handleGenerate = async () => {
    setLoading(true)
    setGenerated('')
    setEditText('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-script`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY as string,
          },
          body: JSON.stringify({
            occasion: occasion.replace(/^[^\w]+/, '').trim(),
            topic,
            key_points: keyPoints,
            tone,
            length_minutes: length,
            language: profile?.language || 'en',
            role: profile?.role || 'other',
          }),
        }
      )
      if (!response.ok) throw new Error(`${response.status}`)
      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let fullScript = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        fullScript += decoder.decode(value, { stream: true })
        setGenerated(fullScript)
      }
      setWordCount(fullScript.split(/\s+/).filter(Boolean).length)
      setEditText(fullScript)
    } catch {
      setGenerated('Failed to generate script. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleUse = (text: string) => {
    sessionStorage.setItem('gravi_session_script', text)
    sessionStorage.setItem('gravi_session_title', `${occasion.replace(/^[^\w]+/, '').trim()} — ${topic}`)
    sessionStorage.setItem('gravi_session_path', 'generate')
    navigate('/studio/session')
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={() => navigate('/studio')} className="text-sm text-ivory-secondary hover:text-ivory flex items-center gap-1 mb-4 transition-colors">
          ← Back to Studio
        </button>
        <h1 className="font-display text-3xl text-ivory">Generate Your Script</h1>
        <p className="text-ivory-secondary mt-1 text-sm">Let Gravi's AI craft a polished script for you</p>
      </motion.div>

      <GlassCard>
        <div className="space-y-6">
          {/* Occasion */}
          <div className="space-y-2">
            <label className="text-sm font-sans text-ivory-secondary">Occasion</label>
            <div className="flex flex-wrap gap-2">
              {OCCASIONS.map((o) => (
                <button
                  key={o}
                  onClick={() => setOccasion(o)}
                  className={[
                    'px-3 py-2 rounded-lg text-sm font-sans border transition-all duration-200',
                    occasion === o
                      ? 'bg-gold/12 border-gold/40 text-gold'
                      : 'bg-midnight-graphite/40 border-white/8 text-ivory-secondary hover:border-gold/20 hover:text-ivory',
                  ].join(' ')}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>

          {/* Topic */}
          <Input label="Topic" placeholder="What is your speech about?" value={topic} onChange={(e) => setTopic(e.target.value)} />

          {/* Key points */}
          <Textarea label="Key points (optional)" placeholder="Any specific points to include?" value={keyPoints} onChange={(e) => setKeyPoints(e.target.value)} rows={3} />

          {/* Tone + Length */}
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-sans text-ivory-secondary">Tone</label>
              <div className="flex flex-wrap gap-2">
                {TONES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={[
                      'px-3 py-1.5 rounded-full text-sm font-sans border transition-all',
                      tone === t ? 'bg-gold/12 border-gold/40 text-gold' : 'bg-white/5 border-white/8 text-ivory-secondary hover:border-gold/20',
                    ].join(' ')}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-sans text-ivory-secondary">Length</label>
              <div className="flex gap-2">
                {LENGTHS.map((l) => (
                  <button
                    key={l.value}
                    onClick={() => setLength(l.value)}
                    className={[
                      'flex-1 py-2 rounded-lg text-sm font-sans border transition-all',
                      length === l.value ? 'bg-gold/12 border-gold/40 text-gold' : 'bg-white/5 border-white/8 text-ivory-secondary hover:border-gold/20',
                    ].join(' ')}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      <Button fullWidth size="lg" loading={loading} disabled={!canGenerate || loading} onClick={handleGenerate}>
        {loading ? 'Crafting your script...' : 'Generate Script ✦'}
      </Button>

      {/* Loading shimmer — only before first chunk arrives */}
      {loading && !generated && (
        <GlassCard>
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-2">
              <span className="text-gold animate-pulse text-xs">✦</span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={statusIdx}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25 }}
                  className="text-sm text-ivory-secondary"
                >
                  {LOADING_MSGS[statusIdx]}
                </motion.span>
              </AnimatePresence>
            </div>
            <div className="space-y-3">
              {[80, 100, 65, 90, 75, 100].map((w, i) => (
                <div key={i} className="skeleton h-3 rounded" style={{ width: `${w}%` }} />
              ))}
            </div>
          </div>
        </GlassCard>
      )}

      {/* Generated result — visible while streaming and after */}
      <AnimatePresence>
        {generated && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <GlassCard gold>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gold" />
                  <span className="text-sm font-sans text-ivory-secondary">
                    {loading ? (
                      <span className="animate-pulse">Writing…</span>
                    ) : (
                      `${wordCount} words · ~${length} min`
                    )}
                  </span>
                </div>
                {!loading && (
                  <button
                    onClick={() => setEditing(!editing)}
                    className="text-xs text-gold hover:text-gold-light transition-colors"
                  >
                    {editing ? 'Preview' : 'Edit'}
                  </button>
                )}
              </div>

              {editing && !loading ? (
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={14}
                  className="input-gold resize-none"
                />
              ) : (
                <div className="font-display text-base text-ivory leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto">
                  {generated}
                  {loading && <span className="inline-block w-0.5 h-4 bg-gold animate-pulse ml-0.5 align-middle" />}
                </div>
              )}
            </GlassCard>

            {!loading && (
              <div className="space-y-3">
                <div className="flex gap-3">
                  <Button variant="ghost" onClick={handleGenerate}>Regenerate</Button>
                  <Button fullWidth onClick={() => handleUse(editing ? editText : generated)}>
                    Use This Script →
                  </Button>
                </div>
                <div className="flex justify-center">
                  {suggSent ? (
                    <span className="text-xs text-gold">✓ Topic suggested — thank you!</span>
                  ) : (
                    <button
                      onClick={async () => {
                        if (!user) return
                        await submitPromptSuggestion(user.id, `${occasion.replace(/^[^\w]+/, '').trim()} — ${topic}`, '', occasion.replace(/^[^\w]+/, '').trim())
                        setSuggSent(true)
                      }}
                      className="text-xs text-ivory-muted hover:text-gold transition-colors"
                    >
                      📌 Suggest this topic for the library
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
