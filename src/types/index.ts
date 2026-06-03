export type UserRole =
  | 'founder' | 'executive' | 'consultant' | 'lawyer'
  | 'sales' | 'student' | 'creator' | 'other'

export type UserGoal =
  | 'authority' | 'fillers' | 'persuasion' | 'presentations'
  | 'interviews' | 'debate' | 'executive_presence' | 'vocal_delivery'

export type Language = 'en' | 'pt' | 'es' | 'fr' | 'de' | 'zh'
export type Theme = 'dark' | 'light'
export type SubStatus = 'free' | 'pro'
export type SessionMode = 'guided' | 'debate' | 'prompt'
export type SessionPath = 'upload' | 'generate' | 'library'
export type DebatePosition = 'for' | 'against' | 'neutral'
export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

export interface Profile {
  id: string
  full_name: string
  role: UserRole
  goals: UserGoal[]
  language: Language
  theme: Theme
  subscription_status: SubStatus
  subscription_tier: 'monthly' | 'annual' | null
  stripe_customer_id: string | null
  onboarding_complete: boolean
  created_at: string
  updated_at: string
}

export interface Session {
  id: string
  user_id: string
  mode: SessionMode
  path: SessionPath | null
  title: string
  script_used: string | null
  transcript: string | null
  audio_url: string | null
  duration_seconds: number
  language: Language
  occasion: string | null
  topic: string | null
  debate_position: DebatePosition | null
  created_at: string
}

export interface Analysis {
  id: string
  session_id: string
  overall_score: number
  clarity_score: number
  confidence_score: number
  persuasion_score: number
  vocal_variety_score: number
  pacing_score: number
  conciseness_score: number
  pace_rating: 'too slow' | 'good' | 'too fast'
  wpm: number
  filler_words: FillerWord[]
  strengths: string[]
  improvements: string[]
  vocabulary_upgrades: VocabUpgrade[]
  overall_summary: string
  debate_argument_score: number | null
  debate_logic_score: number | null
  debate_conviction_score: number | null
  created_at: string
}

export interface FillerWord {
  word: string
  count: number
  timestamps: number[]
}

export interface VocabUpgrade {
  original: string
  suggested: string
  reason: string
}

export interface Prompt {
  id: string
  title: string
  description: string
  category: string
  duration_minutes: number
  difficulty: Difficulty
  language: Language
  is_featured: boolean
  created_at: string
}

export interface DebateTopic {
  id: string
  title: string
  description: string
  category: string
  difficulty: Difficulty
  language: Language
  is_featured: boolean
  created_at: string
}

export interface SessionWithAnalysis extends Session {
  analysis?: Analysis
}

export type PaceRating = 'too slow' | 'good' | 'too fast'

export const SCORE_LABEL = (score: number): string => {
  if (score >= 90) return 'Exceptional'
  if (score >= 80) return 'Great performance'
  if (score >= 70) return 'Strong foundation'
  if (score >= 60) return 'Good progress'
  return 'Keep practising'
}
