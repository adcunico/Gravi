import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import GraviLogo from '@/components/ui/GraviLogo'
import Button from '@/components/ui/Button'
import GlassCard from '@/components/ui/GlassCard'

const FEATURES = [
  { icon: '🎤', title: 'Guided Delivery', desc: 'Practice with AI teleprompter and get precision feedback on every delivery.' },
  { icon: '⚔️', title: 'Debate Arena', desc: 'Sharpen your arguments and build unshakeable conviction under pressure.' },
  { icon: '🧬', title: 'Speech DNA', desc: 'Deep analytics tracking your communication evolution over every session.' },
]

const STEPS = [
  { n: '01', title: 'Record', desc: 'Practise your speech, debate, or prompt using your browser — no extra hardware needed.' },
  { n: '02', title: 'Analyse', desc: 'Gravi\'s AI analyses clarity, confidence, pacing, persuasion, and more in seconds.' },
  { n: '03', title: 'Improve', desc: 'Get actionable feedback, vocabulary upgrades, and filler word counts to sharpen every word.' },
]

const LANGUAGES = [
  { flag: '🇬🇧', label: 'English' },
  { flag: '🇧🇷', label: 'Portuguese' },
  { flag: '🇪🇸', label: 'Spanish' },
  { flag: '🇫🇷', label: 'French' },
  { flag: '🇩🇪', label: 'German' },
  { flag: '🇨🇳', label: 'Mandarin' },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-midnight text-ivory overflow-x-hidden">
      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 text-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-midnight via-midnight/95 to-midnight z-10" />
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: 'url(/images/hero-stage.png)' }}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] h-[640px] bg-gold/4 rounded-full blur-3xl z-10" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-20 space-y-10 max-w-5xl w-full"
        >
          <GraviLogo size={96} showWordmark showTagline animated />

          <div className="space-y-6 mx-auto max-w-3xl">
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl leading-tight tracking-tight text-ivory">
              Speak with elite presence. Train with AI that understands the way you speak.
            </h1>
            <p className="text-base sm:text-lg text-ivory-muted max-w-2xl mx-auto leading-relaxed">
              The private communication studio for founders, executives, lawyers, and consultants who demand more from every word.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm sm:text-base font-sans text-ivory-secondary">
              <div className="glass rounded-2xl px-4 py-3">Personalized delivery coaching</div>
              <div className="glass rounded-2xl px-4 py-3">Session-level Speech DNA</div>
              <div className="glass rounded-2xl px-4 py-3">Private, secure practice studio</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
            <Button size="lg" onClick={() => navigate('/signup')}>Start Free</Button>
            <Button variant="ghost" size="lg" onClick={() => navigate('/signin')}>Sign In</Button>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(212,168,90,0.4)" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
        </motion.div>
      </section>

      {/* Leader benefits */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          className="text-center mb-12"
        >
          <p className="text-sm uppercase tracking-[0.35em] text-gold/70 mb-4">Built for leaders</p>
          <h2 className="font-display text-4xl sm:text-5xl text-ivory">
            Practice with more confidence, clarity, and measurable improvement.
          </h2>
        </motion.div>
        <div className="grid gap-6 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ delay: i * 0.1 }}
            >
              <GlassCard hover gold={i === 1} padding="lg" className="h-full">
                <div className="text-4xl">{f.icon}</div>
                <h3 className="font-display text-2xl text-ivory mt-3">{f.title}</h3>
                <p className="text-base text-ivory-secondary leading-relaxed mt-3">{f.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4 max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          className="font-display text-4xl text-center text-ivory mb-12"
        >
          How it works
        </motion.h2>
        <div className="space-y-8">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ delay: i * 0.15 }}
              className="flex flex-col sm:flex-row gap-6 items-start"
            >
              <span className="font-display text-5xl text-gold/20 font-bold w-20 flex-shrink-0">{s.n}</span>
              <div>
                <h3 className="font-display text-2xl text-ivory mb-2">{s.title}</h3>
                <p className="text-base text-ivory-secondary leading-relaxed">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Languages */}
      <section className="py-20 px-4 max-w-3xl mx-auto text-center">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.15 }}>
          <p className="text-sm uppercase tracking-[0.3em] text-gold/70 mb-4">Global practice</p>
          <h2 className="font-display text-3xl sm:text-4xl text-ivory mb-4">Train in your language, anywhere.</h2>
          <p className="text-base text-ivory-secondary mb-12">Gravi supports six major languages so you can build executive speech in your own voice.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {LANGUAGES.map((l) => (
              <div key={l.label} className="glass rounded-3xl px-4 py-4 text-sm sm:text-base font-sans text-ivory-secondary flex items-center justify-center gap-2">
                <span className="text-2xl">{l.flag}</span>
                {l.label}
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-4 max-w-3xl mx-auto">
        <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.1 }} className="font-display text-4xl text-center text-ivory mb-12">
          Simple pricing
        </motion.h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <GlassCard padding="lg" className="space-y-4">
            <div>
              <p className="font-sans font-semibold text-ivory-secondary">Free</p>
              <div className="font-display text-4xl text-ivory mt-1">£0</div>
            </div>
            <ul className="space-y-2 text-sm text-ivory-secondary">
              <li>✓ 3 sessions</li>
              <li>✓ Basic Speech DNA</li>
              <li>✓ 3 prompts</li>
              <li>✓ 2 debate topics</li>
            </ul>
            <Button variant="ghost" fullWidth onClick={() => navigate('/signup')}>Get started free</Button>
          </GlassCard>
          <GlassCard gold padding="lg" className="space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-sans font-semibold text-gold">Pro</p>
                <span className="text-xs bg-gold/15 text-gold px-2 py-0.5 rounded-full">Most popular</span>
              </div>
              <div className="font-display text-4xl text-ivory mt-1">£9.99<span className="text-lg text-ivory-secondary">/mo</span></div>
              <p className="text-xs text-ivory-muted">or £79.99/year — save 33%</p>
            </div>
            <ul className="space-y-2 text-sm text-ivory">
              <li className="text-gold">✓ Unlimited sessions</li>
              <li>✓ Full Speech DNA</li>
              <li>✓ PDF exports</li>
              <li>✓ Audio replay</li>
              <li>✓ All 6 languages</li>
            </ul>
            <Button fullWidth onClick={() => navigate('/signup')}>Start free, upgrade anytime</Button>
          </GlassCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/8 py-12 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraviLogo size={28} animated={false} />
            <span className="font-display text-sm tracking-widest text-ivory-secondary uppercase">GRAVI</span>
          </div>
          <div className="flex gap-6 text-xs text-ivory-muted">
            <a href="#" className="hover:text-ivory transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-ivory transition-colors">Terms of Service</a>
            <a href="mailto:hello@gravi.app" className="hover:text-ivory transition-colors">Contact</a>
          </div>
          <p className="text-xs text-ivory-muted">© 2025 Gravi. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
