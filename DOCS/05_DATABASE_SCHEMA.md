# Database Schema

Platform: Supabase (PostgreSQL)

## Tables Overview

| Table | Purpose |
|---|---|
| users | Extended user profile (linked to auth.users) |
| sessions | All practice sessions across all four modes |
| analysis | AI analysis results (mode-specific nullable fields) |
| scripts | User-saved scripts for teleprompter and script library |
| debate_topics | Seed library of debate topics (public read) |
| interview_sessions | One row per interview practice attempt |
| interview_answers | One row per question answered within an interview session |
| vocabulary | Words saved by users from session debriefs |

---

## Full SQL

```sql
-- ============================================================
-- USERS
-- ============================================================
create table users (
  id uuid primary key references auth.users(id),
  email text unique not null,
  full_name text,
  role text check (role in ('executive','presenter','media','sales','legal','other')),
  language text default 'en',
  subscription_status text default 'free' check (subscription_status in ('free','pro')),
  stripe_customer_id text,
  onboarding_complete boolean default false,
  goals_json jsonb,          -- array of selected goal strings from onboarding step 3
  created_at timestamptz default now()
);

-- ============================================================
-- SESSIONS
-- Covers all four modes: upload, live, free, teleprompter, debate, interview
-- ============================================================
create table sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  mode text check (mode in ('upload','live','free','teleprompter','debate','interview')),
  topic text,
  transcript text,
  script_used text,            -- teleprompter mode: the script text used
  duration_seconds int,
  audio_url text,              -- signed Supabase Storage URL, audio only
  language text default 'en',
  -- Audio metadata from the current transcription and analysis pipeline
  audio_metadata_json jsonb,   -- { wpm, pause_count, pause_durations_ms[], filler_words:{} }
  -- Debate-specific
  debate_position text check (debate_position in ('for','against','neutral') or debate_position is null),
  debate_topic_id uuid,        -- FK to debate_topics (or null if AI-generated)
  -- Teleprompter-specific
  script_adherence_pct int,    -- 0–100, null for non-teleprompter
  -- Interview-specific
  interview_session_id uuid,   -- FK to interview_sessions, null for non-interview
  created_at timestamptz default now()
);

-- ============================================================
-- ANALYSIS
-- Shared table for all modes. Mode-specific fields are nullable.
-- ============================================================
create table analysis (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,

  -- Core metrics (all non-interview modes)
  clarity_score int,           -- 0–100
  confidence_score int,
  persuasion_score int,
  vocal_variety_score int,
  pacing_score int,
  conciseness_score int,
  overall_score int,
  filler_word_count int,
  filler_words_json jsonb,     -- { "um": 4, "uh": 2, "like": 6 }
  strengths_json jsonb,        -- ["strength 1", "strength 2", "strength 3"]
  improvements_json jsonb,
  suggested_words_json jsonb,  -- [{ word, pos, definition, example }]
  full_feedback text,          -- narrative coaching paragraph

  -- Teleprompter-specific (null for other modes)
  script_adherence_pct int,
  script_diff_json jsonb,      -- [{ word, status: "match"|"skip"|"adlib" }]
  adherence_feedback text,
  notable_adlibs_json jsonb,   -- [{ phrase, note }]

  -- Debate-specific (null for non-debate modes)
  argument_strength_score int,
  logical_flow_score int,
  evidence_use_score int,
  counterargument_score int,
  conviction_score int,
  rhetorical_strength_score int,
  argument_feedback text,
  delivery_feedback text,
  language_feedback text,
  persuasive_phrases_json jsonb, -- [{ phrase, note }]

  created_at timestamptz default now()
);

-- ============================================================
-- SCRIPTS
-- ============================================================
create table scripts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  title text not null,
  content text not null,
  occasion text,               -- pitch, keynote, toast, etc.
  language text default 'en',
  is_favourite boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- DEBATE TOPICS (seed data, no RLS, publicly readable)
-- ============================================================
create table debate_topics (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text check (category in (
    'business','technology','leadership','ethics',
    'economics','society','innovation','philosophy','startups'
  )),
  difficulty text check (difficulty in ('beginner','intermediate','advanced')),
  for_position_summary text,
  against_position_summary text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ============================================================
-- INTERVIEW SESSIONS
-- ============================================================
create table interview_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  interview_type text check (interview_type in ('behavioural','competency','strength','mixed')),
  role_level text check (role_level in ('junior','mid','senior','executive','board')),
  industry text,
  focus_area text,
  question_count int,
  questions_json jsonb,        -- [{ question_text, what_interviewer_tests, suggested_duration_seconds, framework_hint }]
  overall_score int,
  strongest_answer_index int,
  weakest_answer_index int,
  aggregate_feedback text,
  top_improvements_json jsonb, -- ["improvement 1", "improvement 2", "improvement 3"]
  completed boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- INTERVIEW ANSWERS (one row per question per session)
-- ============================================================
create table interview_answers (
  id uuid primary key default gen_random_uuid(),
  interview_session_id uuid references interview_sessions(id) on delete cascade,
  question_index int not null,
  question_text text,
  transcript text,
  audio_url text,
  duration_seconds int,
  audio_metadata_json jsonb,
  overall_score int,
  star_structure_score int,
  answer_relevance_score int,
  specificity_score int,
  confidence_score int,
  conciseness_score int,
  filler_word_count int,
  filler_words_json jsonb,
  strengths_json jsonb,
  improvements_json jsonb,
  model_answer_guide text,
  created_at timestamptz default now()
);

-- ============================================================
-- VOCABULARY
-- ============================================================
create table vocabulary (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  word text not null,
  definition text,
  example text,
  source_session_id uuid references sessions(id),
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table users enable row level security;
alter table sessions enable row level security;
alter table analysis enable row level security;
alter table scripts enable row level security;
alter table vocabulary enable row level security;
alter table interview_sessions enable row level security;
alter table interview_answers enable row level security;

create policy "own users" on users
  for all using (auth.uid() = id);

create policy "own sessions" on sessions
  for all using (auth.uid() = user_id);

create policy "own analysis" on analysis
  for all using (
    session_id in (select id from sessions where user_id = auth.uid())
  );

create policy "own scripts" on scripts
  for all using (auth.uid() = user_id);

create policy "own vocabulary" on vocabulary
  for all using (auth.uid() = user_id);

create policy "own interview_sessions" on interview_sessions
  for all using (auth.uid() = user_id);

create policy "own interview_answers" on interview_answers
  for all using (
    interview_session_id in (
      select id from interview_sessions where user_id = auth.uid()
    )
  );

-- ============================================================
-- SEED: DEBATE TOPICS
-- ============================================================
insert into debate_topics (title, category, difficulty, for_position_summary, against_position_summary) values
('AI will eliminate more jobs than it creates', 'technology', 'intermediate',
 'Automation displaces workers faster than new roles emerge',
 'Technology historically creates more jobs than it destroys'),
('Remote work makes teams less effective', 'business', 'beginner',
 'Collaboration, culture, and innovation suffer without physical proximity',
 'Autonomy and reduced commuting improve productivity and retention'),
('Four-day work weeks should be standard', 'business', 'beginner',
 'Same output in less time improves wellbeing and attracts talent',
 'Many industries and roles cannot function on compressed schedules'),
('Social media does more harm than good', 'society', 'beginner',
 'Mental health damage and misinformation outweigh connectivity benefits',
 'Access to community, information, and economic opportunity is transformative'),
('Companies have a duty to prioritise ESG over profit', 'ethics', 'intermediate',
 'Long-term sustainability requires internalising social and environmental costs',
 'Profit maximisation within the law produces the best social outcomes'),
('Crypto will transform global finance', 'technology', 'advanced',
 'Decentralisation and programmable money will reshape financial systems',
 'Volatility, regulation risk, and energy costs prevent mainstream adoption'),
('Universities are no longer worth the investment', 'society', 'intermediate',
 'Alternatives like bootcamps deliver better ROI for most careers',
 'Network, signalling, and depth of university education cannot be replicated'),
('Leaders are born, not made', 'leadership', 'beginner',
 'Innate traits like charisma and vision cannot be fully taught',
 'Leadership is a skill set developed through experience and coaching'),
('Startups should prioritise growth over profitability', 'startups', 'intermediate',
 'Capturing market share early creates defensible moats',
 'Growth at all costs destroys value and exposes companies in downturns'),
('Open borders would benefit the global economy', 'economics', 'advanced',
 'Labour mobility reduces inequality and corrects demographic imbalances',
 'Social cohesion and public services face unsustainable pressure without controls');

-- ============================================================
-- STORAGE: Audio bucket (run via Supabase dashboard or CLI)
-- ============================================================
-- Create private bucket: gravi-audio
-- Enable RLS on storage.objects
-- Policy: authenticated users can upload/read their own files
-- Path convention: {user_id}/{session_id}.{ext} or {user_id}/interview/{session_id}/{question_index}.{ext}

-- ============================================================
-- SCHEDULED FUNCTION: 30-day audio cleanup
-- ============================================================
-- Supabase Edge Function: cleanup-audio
-- Schedule: daily at 02:00 UTC
-- Logic: SELECT audio_url FROM sessions WHERE created_at < now() - interval '30 days'
--        + SELECT audio_url FROM interview_answers WHERE created_at < now() - interval '30 days'
--        For each URL: delete from storage.objects
```
