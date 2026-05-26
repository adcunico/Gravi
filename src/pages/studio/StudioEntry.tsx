import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import GlassCard from '@/components/ui/GlassCard'

const PATHS = [
  {
    to: '/studio/upload',
    icon: UploadIcon,
    title: 'Upload Your Script',
    subtitle: 'Read from your own script',
    desc: 'Paste text or upload a .txt, .pdf, or .docx file',
    tag: 'Your content',
  },
  {
    to: '/studio/generate',
    icon: SparkleIcon,
    title: 'Generate a Script',
    subtitle: 'Let AI write your script',
    desc: 'Tell us the occasion and topic — get a polished script in seconds',
    tag: 'AI-powered',
  },
  {
    to: '/studio/library',
    icon: LibraryIcon,
    title: 'Use a Prompt',
    subtitle: 'Choose from our library',
    desc: 'Curated speaking prompts for leadership, pitching, interviews, and more',
    tag: 'Curated',
  },
]

export default function StudioEntry() {
  const navigate = useNavigate()

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-4xl text-ivory">Communication Studio</h1>
        <p className="text-ivory-secondary mt-2">Choose how you want to practise today</p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-3">
        {PATHS.map(({ to, icon: Icon, title, subtitle, desc, tag }, i) => (
          <motion.div
            key={to}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <GlassCard hover padding="lg" onClick={() => navigate(to)} className="h-full flex flex-col gap-5 cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                  <Icon size={22} className="text-gold" />
                </div>
                <span className="text-xs font-sans px-2.5 py-1 rounded-full bg-white/5 text-ivory-secondary border border-white/10">
                  {tag}
                </span>
              </div>
              <div className="flex-1 space-y-1">
                <h2 className="font-display text-xl text-ivory">{title}</h2>
                <p className="text-sm font-semibold text-gold">{subtitle}</p>
                <p className="text-sm text-ivory-secondary leading-relaxed">{desc}</p>
              </div>
              <span className="text-xs text-gold/70 group-hover:text-gold transition-colors">
                Get started →
              </span>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function UploadIcon({ size = 22, className = '' }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
}
function SparkleIcon({ size = 22, className = '' }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
}
function LibraryIcon({ size = 22, className = '' }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
}
