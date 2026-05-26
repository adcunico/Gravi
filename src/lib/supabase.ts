import { createClient } from '@supabase/supabase-js'
import type { Profile, Session, Analysis, Prompt, DebateTopic } from '@/types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not set. App running in demo mode.')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
)

// ── Auth helpers ─────────────────────────────────────────────────
export const getUser = () => supabase.auth.getUser()
export const getSession = () => supabase.auth.getSession()
export const signOut = () => supabase.auth.signOut()

export const signInWithEmail = (email: string, password: string) =>
  supabase.auth.signInWithPassword({ email, password })

export const signUpWithEmail = (email: string, password: string) =>
  supabase.auth.signUp({ email, password })

export const signInWithGoogle = () =>
  supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/dashboard` },
  })

export const resetPassword = (email: string) =>
  supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })

// ── Profile ──────────────────────────────────────────────────────
export const getProfile = (userId: string) =>
  supabase.from('profiles').select('*').eq('id', userId).single<Profile>()

export const upsertProfile = (profile: Partial<Profile> & { id: string }) =>
  supabase.from('profiles').upsert(profile).select().single<Profile>()

// ── Sessions ─────────────────────────────────────────────────────
export const getSessions = (userId: string, limit = 20) =>
  supabase
    .from('sessions')
    .select('*, analysis(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

export const getSessionById = (sessionId: string) =>
  supabase
    .from('sessions')
    .select('*, analysis(*)')
    .eq('id', sessionId)
    .single<Session & { analysis: Analysis }>()

export const createSession = (session: Omit<Session, 'id' | 'created_at'>) =>
  supabase.from('sessions').insert(session).select().single<Session>()

// ── Analysis ─────────────────────────────────────────────────────
export const createAnalysis = (analysis: Omit<Analysis, 'id' | 'created_at'>) =>
  supabase.from('analysis').insert(analysis).select().single<Analysis>()

// ── Prompts ──────────────────────────────────────────────────────
export const getPrompts = (language = 'en', limit = 50) =>
  supabase
    .from('prompts')
    .select('*')
    .eq('language', language)
    .order('is_featured', { ascending: false })
    .limit(limit)

export const getPromptById = (id: string) =>
  supabase.from('prompts').select('*').eq('id', id).single<Prompt>()

export const savePrompt = (userId: string, promptId: string) =>
  supabase.from('saved_prompts').upsert({ user_id: userId, prompt_id: promptId })

export const getSavedPrompts = (userId: string) =>
  supabase
    .from('saved_prompts')
    .select('*, prompts(*)')
    .eq('user_id', userId)

// ── Debate topics ─────────────────────────────────────────────────
export const getDebateTopics = (language = 'en', limit = 50) =>
  supabase
    .from('debate_topics')
    .select('*')
    .eq('language', language)
    .order('is_featured', { ascending: false })
    .limit(limit)

export const getDebateTopicById = (id: string) =>
  supabase.from('debate_topics').select('*').eq('id', id).single<DebateTopic>()

// ── Edge function caller ──────────────────────────────────────────
export const callEdgeFunction = async <T = unknown>(
  name: string,
  body: Record<string, unknown>,
): Promise<T> => {
  const { data, error } = await supabase.functions.invoke<T>(name, { body })
  if (error) throw new Error(error.message)
  if (!data) throw new Error('No data returned from edge function')
  return data
}
