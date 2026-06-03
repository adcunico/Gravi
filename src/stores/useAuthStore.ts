import { create } from 'zustand'
import { supabase, getProfile, upsertProfile, getSessions } from '@/lib/supabase'
import type { Profile, SessionWithAnalysis } from '@/types'
import type { User } from '@supabase/supabase-js'

const SESSION_CACHE_TTL = 60_000 // 60 seconds

interface AuthState {
  user: User | null
  profile: Profile | null
  loading: boolean
  initialized: boolean
  sessions: SessionWithAnalysis[] | null
  sessionsLoadedAt: number
  setUser: (user: User | null) => void
  setProfile: (profile: Profile | null) => void
  fetchProfile: (userId: string) => Promise<void>
  fetchSessions: (userId: string) => Promise<void>
  invalidateSessions: () => void
  init: () => Promise<void>
  reset: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,
  sessions: null,
  sessionsLoadedAt: 0,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),

  fetchProfile: async (userId) => {
    const { data } = await getProfile(userId)
    if (data) {
      set({ profile: data })
      return
    }
    // Profile missing (user pre-dates DB setup) — create it from auth metadata
    const user = get().user
    const { data: created } = await upsertProfile({
      id: userId,
      full_name: user?.user_metadata?.full_name || user?.email || '',
    })
    if (created) set({ profile: created })
  },

  fetchSessions: async (userId) => {
    const { sessions, sessionsLoadedAt } = get()
    if (sessions !== null && Date.now() - sessionsLoadedAt < SESSION_CACHE_TTL) return
    const { data } = await getSessions(userId, 100)
    set({ sessions: (data as SessionWithAnalysis[]) || [], sessionsLoadedAt: Date.now() })
  },

  invalidateSessions: () => set({ sessions: null, sessionsLoadedAt: 0 }),

  init: async () => {
    set({ loading: true })
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      set({ user: session.user })
      await get().fetchProfile(session.user.id)
    }
    set({ loading: false, initialized: true })

    supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user ?? null
      set({ user })
      if (user) {
        await get().fetchProfile(user.id)
      } else {
        set({ profile: null, sessions: null, sessionsLoadedAt: 0 })
      }
    })
  },

  reset: () => set({ user: null, profile: null, sessions: null, sessionsLoadedAt: 0 }),
}))
