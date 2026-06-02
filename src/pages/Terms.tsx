import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import GraviLogo from '@/components/ui/GraviLogo'

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body: 'By accessing or using Gravi, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, please do not use the platform.',
  },
  {
    title: '2. Description of Service',
    body: 'Gravi is an AI-powered communication coaching platform. We provide speech analysis, structured debate practice, and teleprompter tools to help professionals improve their communication skills.',
  },
  {
    title: '3. User Accounts',
    body: 'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must be at least 18 years old to use Gravi.',
  },
  {
    title: '4. Subscription and Billing',
    body: 'Free accounts are limited to 3 sessions. Pro subscriptions are billed monthly or annually. You may cancel at any time; cancellation takes effect at the end of the current billing period. No refunds are issued for partial periods.',
  },
  {
    title: '5. Audio Data',
    body: 'Audio you record is transmitted to our servers solely for transcription and analysis purposes. We do not use your audio to train AI models. Pro subscribers may access audio replays stored in your account. You may delete your data at any time from your profile settings.',
  },
  {
    title: '6. Acceptable Use',
    body: 'You agree not to use Gravi for any unlawful purpose, to upload malicious content, to attempt to reverse-engineer the platform, or to interfere with other users. We reserve the right to suspend accounts that violate these terms.',
  },
  {
    title: '7. Intellectual Property',
    body: 'All platform content, branding, and technology are the property of Gravi. You retain ownership of any content you create using the platform, including scripts and recordings.',
  },
  {
    title: '8. Disclaimer of Warranties',
    body: 'Gravi is provided "as is" without warranties of any kind. We do not guarantee that the service will be error-free, uninterrupted, or that AI-generated coaching will achieve specific communication outcomes.',
  },
  {
    title: '9. Limitation of Liability',
    body: 'To the fullest extent permitted by law, Gravi shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform.',
  },
  {
    title: '10. Changes to Terms',
    body: 'We may update these terms from time to time. We will notify you of material changes via email or an in-app notice. Continued use of Gravi after changes constitutes acceptance.',
  },
  {
    title: '11. Contact',
    body: 'For questions about these terms, contact us at legal@gravi.ai.',
  },
]

export default function Terms() {
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

          <h1 className="font-display text-4xl text-ivory mb-2">Terms of Service</h1>
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
            <Link to="/privacy" className="hover:text-gold transition-colors">Privacy Policy</Link>
            <Link to="/signin" className="hover:text-gold transition-colors">Sign In</Link>
            <Link to="/signup" className="hover:text-gold transition-colors">Create Account</Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
