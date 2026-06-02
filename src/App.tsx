import { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/stores/useAuthStore'
import AppLayout from '@/components/layout/AppLayout'
import { Skeleton } from '@/components/ui/Skeleton'

// Eagerly loaded (critical path)
import Landing from '@/pages/Landing'
import SignIn from '@/pages/auth/SignIn'
import SignUp from '@/pages/auth/SignUp'
import ForgotPassword from '@/pages/auth/ForgotPassword'
import ResetPassword from '@/pages/auth/ResetPassword'
import Terms from '@/pages/Terms'
import Privacy from '@/pages/Privacy'
import Dashboard from '@/pages/Dashboard'

// Lazy loaded routes
const Onboarding = lazy(() => import('@/pages/Onboarding'))
const StudioEntry = lazy(() => import('@/pages/studio/StudioEntry'))
const StudioUpload = lazy(() => import('@/pages/studio/StudioUpload'))
const StudioGenerate = lazy(() => import('@/pages/studio/StudioGenerate'))
const StudioLibrary = lazy(() => import('@/pages/studio/StudioLibrary'))
const TeleprompterSession = lazy(() => import('@/pages/studio/TeleprompterSession'))
const Debrief = lazy(() => import('@/pages/studio/Debrief'))
const Debate = lazy(() => import('@/pages/Debate'))
const DebateSession = lazy(() => import('@/pages/studio/TeleprompterSession')) // reused for debate
const Analytics = lazy(() => import('@/pages/Analytics'))
const Sessions = lazy(() => import('@/pages/Sessions'))
const SessionReplay = lazy(() => import('@/pages/studio/Debrief')) // reused for replay
const Profile = lazy(() => import('@/pages/Profile'))
const Upgrade = lazy(() => import('@/pages/Upgrade'))
const Prompts = lazy(() => import('@/pages/Prompts'))

function PageLoader() {
  return (
    <div className="p-8 space-y-4">
      <Skeleton className="h-10 w-1/3" />
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 rounded-card" />)}
      </div>
    </div>
  )
}

function AuthGuard() {
  const { user, loading, initialized } = useAuthStore()
  if (!initialized || loading) return <PageLoader />
  if (!user) return <Navigate to="/signin" replace />
  return <Outlet />
}

function OnboardingGuard() {
  const { profile, loading, initialized } = useAuthStore()
  if (!initialized || loading) return <PageLoader />
  if (profile && !profile.onboarding_complete) return <Navigate to="/onboarding" replace />
  return <Outlet />
}

function PublicGuard() {
  const { user, loading, initialized } = useAuthStore()
  if (!initialized || loading) return <PageLoader />
  if (user) return <Navigate to="/dashboard" replace />
  return <Outlet />
}

export default function App() {
  const { init } = useAuthStore()

  useEffect(() => {
    init()
  }, [init])

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <AnimatePresence mode="wait">
          <Routes>
            {/* Public */}
            <Route element={<PublicGuard />}>
              <Route path="/" element={<Landing />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
            </Route>

            {/* Auth required */}
            <Route element={<AuthGuard />}>
              <Route path="/onboarding" element={<Onboarding />} />

              {/* App routes (with sidebar layout) */}
              <Route element={<OnboardingGuard />}>
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/studio" element={<StudioEntry />} />
                  <Route path="/studio/upload" element={<StudioUpload />} />
                  <Route path="/studio/generate" element={<StudioGenerate />} />
                  <Route path="/studio/library" element={<StudioLibrary />} />
                  <Route path="/studio/debrief/:sessionId" element={<Debrief />} />
                  <Route path="/debate" element={<Debate />} />
                  <Route path="/debate/debrief/:sessionId" element={<Debrief />} />
                  <Route path="/prompts" element={<Prompts />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/sessions" element={<Sessions />} />
                  <Route path="/sessions/:sessionId" element={<Debrief />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/upgrade" element={<Upgrade />} />
                </Route>

                {/* Full-screen routes (no sidebar) */}
                <Route path="/studio/session" element={<TeleprompterSession />} />
                <Route path="/debate/session" element={<TeleprompterSession />} />
              </Route>
            </Route>

            {/* Open public routes — no auth guard, accessible to all */}
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </BrowserRouter>
  )
}
