import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import GraviLogo from '@/components/ui/GraviLogo'
import Button from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { resetPassword } from '@/lib/supabase'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { error: err } = await resetPassword(email)
      if (err) throw err
      setSent(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-midnight flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-10">
          <GraviLogo size={48} showWordmark animated={false} />
        </div>
        <div className="glass rounded-card p-8 space-y-6">
          {sent ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-14 h-14 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4A85A" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
              <h2 className="font-display text-xl text-ivory">Check your email</h2>
              <p className="text-sm text-ivory-secondary">We've sent a password reset link to <span className="text-gold">{email}</span></p>
              <Link to="/signin" className="inline-block text-sm text-gold hover:text-gold-light transition-colors">Back to sign in →</Link>
            </div>
          ) : (
            <>
              <div>
                <h1 className="font-display text-2xl text-ivory">Reset password</h1>
                <p className="text-sm text-ivory-secondary mt-1">Enter your email to receive a reset link</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Email address" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                {error && <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}
                <Button type="submit" loading={loading} fullWidth>Send Reset Link</Button>
              </form>
              <p className="text-center text-sm text-ivory-secondary">
                <Link to="/signin" className="text-gold hover:text-gold-light transition-colors">Back to sign in</Link>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
