import { create } from 'zustand'
import { supabase, getProfile, upsertProfile } from '@/lib/supabase'
import type { Profile } from '@/types'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  profile: Profile | null
  loading: boolean
  initialized: boolean
  setUser: (user: User | null) => void
  setProfile: (profile: Profile | null) => void
  fetchProfile: (userId: string) => Promise<void>
  init: () => Promise<void>
  reset: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,

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
        set({ profile: null })
      }
    })
  },

  reset: () => set({ user: null, profile: null }),
}))
