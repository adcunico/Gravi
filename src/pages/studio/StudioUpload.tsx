import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import Button from '@/components/ui/Button'
import { Textarea, Input } from '@/components/ui/Input'
import GlassCard from '@/components/ui/GlassCard'

const WPM = 130

function estimateDuration(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length
  const mins = Math.floor(words / WPM)
  const secs = Math.round(((words / WPM) - mins) * 60)
  return { words, mins, secs }
}

export default function StudioUpload() {
  const [script, setScript] = useState('')
  const [title, setTitle] = useState('')
  const [fileError, setFileError] = useState('')
  const navigate = useNavigate()

  const onDrop = useCallback((accepted: File[]) => {
    const file = accepted[0]
    if (!file) return
    if (file.type === 'text/plain') {
      const reader = new FileReader()
      reader.onload = (e) => setScript(e.target?.result as string || '')
      reader.readAsText(file)
    } else {
      setFileError('Only .txt files can be parsed directly. For PDF/DOCX, paste your text.')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/plain': ['.txt'] },
    maxFiles: 1,
  })

  const { words, mins, secs } = estimateDuration(script)

  const handlePrepare = () => {
    if (!script.trim()) return
    sessionStorage.setItem('gravi_session_script', script)
    sessionStorage.setItem('gravi_session_title', title || 'My Session')
    sessionStorage.setItem('gravi_session_path', 'upload')
    navigate('/studio/session')
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={() => navigate('/studio')} className="text-sm text-ivory-secondary hover:text-ivory flex items-center gap-1 mb-4 transition-colors">
          <span>←</span> Back to Studio
        </button>
        <h1 className="font-display text-3xl text-ivory">Upload Your Script</h1>
        <p className="text-ivory-secondary mt-1 text-sm">Paste your text or drop a .txt file</p>
      </motion.div>

      <Input label="Session title (optional)" placeholder="e.g. Board Presentation Q3" value={title} onChange={(e) => setTitle(e.target.value)} />

      <Textarea
        label="Your script"
        placeholder="Paste your speech, presentation, or talking points here..."
        value={script}
        onChange={(e) => setScript(e.target.value)}
        rows={14}
      />

      {/* Dropzone */}
      <GlassCard padding="none">
        <div
          {...getRootProps()}
          className={[
            'p-8 rounded-card text-center cursor-pointer border-2 border-dashed transition-all duration-200',
            isDragActive ? 'border-gold/60 bg-gold/5' : 'border-white/10 hover:border-gold/30',
          ].join(' ')}
        >
          <input {...getInputProps()} />
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-gold/8 border border-gold/20 flex items-center justify-center mx-auto">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D4A85A" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            </div>
            <p className="text-sm font-sans text-ivory-secondary">
              {isDragActive ? 'Drop your file here' : 'Drop a .txt file here, or click to browse'}
            </p>
            <p className="text-xs text-ivory-muted">Accepts .txt — for PDF/DOCX, paste content above</p>
          </div>
        </div>
      </GlassCard>

      {fileError && <p className="text-sm text-amber-400">{fileError}</p>}

      {/* Stats */}
      {script.trim() && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex gap-4 text-sm"
        >
          <span className="text-ivory-secondary">{words.toLocaleString()} words</span>
          <span className="text-ivory-muted">·</span>
          <span className="text-ivory-secondary">~{mins}m {secs}s estimated</span>
        </motion.div>
      )}

      <Button fullWidth size="lg" disabled={!script.trim()} onClick={handlePrepare}>
        Prepare Session →
      </Button>
    </div>
  )
}
