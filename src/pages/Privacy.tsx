import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import GraviLogo from '@/components/ui/GraviLogo'

const SECTIONS = [
  {
    title: '1. Information We Collect',
    body: 'We collect information you provide directly, such as your name, email address, and professional role during account setup. We also collect session data including transcripts, performance scores, and usage analytics to provide and improve our service.',
  },
  {
    title: '2. Audio Recording',
    body: 'When you use Gravi to record speech, audio is transmitted over an encrypted connection to our transcription service (OpenAI Whisper) and immediately converted to text. Audio files are only retained if you are a Pro subscriber and have audio replay enabled. You can delete your recordings at any time from your profile.',
  },
  {
    title: '3. How We Use Your Information',
    body: 'We use your data to provide coaching analysis, personalise your experience, send service-related emails, and improve our platform. We do not sell your personal data to third parties. We do not use your audio or transcripts to train AI models.',
  },
  {
    title: '4. Third-Party Services',
    body: 'Gravi uses the following sub-processors: Supabase (database and authentication), OpenAI (audio transcription), Anthropic (speech analysis), and Stripe (payment processing). Each operates under their own privacy policy and data processing agreements.',
  },
  {
    title: '5. Data Retention',
    body: 'We retain your account data for as long as your account is active. Session transcripts and scores are kept indefinitely to power your analytics. You may request full data deletion by deleting your account in Profile settings.',
  },
  {
    title: '6. Security',
    body: 'We use industry-standard security measures including encrypted connections (TLS), row-level security on our database, and access controls. No system is completely secure; we encourage you to use a strong, unique password.',
  },
  {
    title: '7. Your Rights',
    body: 'Depending on your jurisdiction, you may have rights to access, correct, or delete your personal data. To exercise these rights, contact us at privacy@gravi.ai or use the account deletion feature in your profile.',
  },
  {
    title: '8. Cookies',
    body: 'We use essential cookies to maintain your authenticated session. We do not use advertising or tracking cookies. You can disable cookies in your browser, but this will prevent you from staying signed in.',
  },
  {
    title: '9. Children',
    body: 'Gravi is not directed at children under 18. We do not knowingly collect data from anyone under 18. If you believe a child has provided us with personal information, please contact us so we can delete it.',
  },
  {
    title: '10. Changes to This Policy',
    body: 'We may update this policy from time to time. We will notify you of significant changes via email. Continued use of Gravi after changes constitutes acceptance of the updated policy.',
  },
  {
    title: '11. Contact',
    body: 'For privacy-related questions, contact us at privacy@gravi.ai.',
  },
]

export default function Privacy() {
  return (
    <div className="min-h-screen bg-midnight text-ivory">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-12">
            <Link to="/">
              <GraviLogo size={36} showWordmark animated={false} />
            </Link>
            <Link to="/signin" className="text-sm text-gold hover:text-gold-light transition-colors">
              Sign in →
            </Link>
          </div>

          <h1 className="font-display text-4xl text-ivory mb-2">Privacy Policy</h1>
          <p className="text-sm text-ivory-muted mb-10">Last updated: June 2026</p>

          <div className="space-y-8">
            {SECTIONS.map((s) => (
              <div key={s.title}>
                <h2 className="font-sans font-semibold text-ivory mb-2">{s.title}</h2>
                <p className="text-sm text-ivory-secondary leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-white/8 flex flex-wrap gap-4 text-sm text-ivory-muted">
            <Link to="/terms" className="hover:text-gold transition-colors">Terms of Service</Link>
            <Link to="/signin" className="hover:text-gold transition-colors">Sign In</Link>
            <Link to="/signup" className="hover:text-gold transition-colors">Create Account</Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
