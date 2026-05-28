import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import GraviLogo from '@/components/ui/GraviLogo'
import Button from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { signUpWithEmail, signInWithGoogle } from '@/lib/supabase'

export default function SignUp() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [confirmationRequired, setConfirmationRequired] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setError('')
    setLoading(true)
    try {
      const { error: err, data } = await signUpWithEmail(email, password)
      if (err) throw err
      localStorage.setItem('gravi_signup_name', name)
      setSuccess(true)
      if (!data?.user) {
        setConfirmationRequired(true)
      } else {
        setTimeout(() => navigate('/onboarding'), 2000)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign up failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    await signInWithGoogle()
  }

  if (success) {
    return (
      <div className="min-h-screen bg-midnight flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D4A85A" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h2 className="font-display text-2xl text-ivory">Welcome to Gravi</h2>
          <p className="text-sm text-ivory-secondary">
            {confirmationRequired
              ? 'Check your email to confirm your account and complete signup.'
              : 'Preparing your studio…'}
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-midnight flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gold/3 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <GraviLogo size={56} showWordmark showTagline animated />
        </div>

        <div className="glass rounded-card p-8 space-y-6">
          <div>
            <h1 className="font-display text-2xl text-ivory">Create your account</h1>
            <p className="text-sm text-ivory-secondary mt-1">Start your free communication journey</p>
          </div>

          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/8 border border-white/10 hover:border-white/20 rounded-btn py-3 text-sm font-sans text-ivory transition-all duration-200"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-ivory-muted">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Full name" type="text" placeholder="Alexandra Chen" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="Email address" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            <Input label="Password" type="password" placeholder="Min. 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required hint="Minimum 8 characters" autoComplete="new-password" />

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">
                {error}
              </motion.p>
            )}

            <Button type="submit" loading={loading} fullWidth size="lg">
              Create Account — It's Free
            </Button>
          </form>

          <p className="text-center text-xs text-ivory-muted">
            By signing up you agree to our{' '}
            <Link to="/terms" className="text-gold/70 hover:text-gold">Terms of Service</Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-gold/70 hover:text-gold">Privacy Policy</Link>
          </p>

          <p className="text-center text-sm text-ivory-secondary">
            Already have an account?{' '}
            <Link to="/signin" className="text-gold hover:text-gold-light transition-colors">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}
