-- ══════════════════════════════════════════════════
-- GRAVI — Initial Database Schema
-- ══════════════════════════════════════════════════

-- Enable extensions
create extension if not exists "uuid-ossp";

-- ── profiles ──────────────────────────────────────
create table public.profiles (
  id              uuid references auth.users on delete cascade primary key,
  full_name       text,
  role            text check (role in ('founder','executive','consultant','lawyer','sales','student','creator','other')),
  goals           text[] default '{}',
  language        text default 'en' check (language in ('en','pt','es','fr','de','zh')),
  theme           text default 'dark' check (theme in ('dark','light')),
  subscription_status  text default 'free' check (subscription_status in ('free','pro')),
  subscription_tier    text check (subscription_tier in ('monthly','annual')),
  stripe_customer_id   text,
  onboarding_complete  boolean default false,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── sessions ──────────────────────────────────────
create table public.sessions (
  id              uuid default uuid_generate_v4() primary key,
  user_id         uuid references public.profiles on delete cascade not null,
  mode            text not null check (mode in ('guided','debate','prompt')),
  path            text check (path in ('upload','generate','library')),
  title           text,
  script_used     text,
  transcript      text,
  duration_seconds integer default 0,
  language        text default 'en',
  occasion        text,
  topic           text,
  debate_position text check (debate_position in ('for','against','neutral')),
  created_at      timestamptz default now()
);

-- ── analysis ──────────────────────────────────────
create table public.analysis (
  id                      uuid default uuid_generate_v4() primary key,
  session_id              uuid references public.sessions on delete cascade not null unique,
  overall_score           integer check (overall_score between 0 and 100),
  clarity_score           integer check (clarity_score between 0 and 100),
  confidence_score        integer check (confidence_score between 0 and 100),
  persuasion_score        integer check (persuasion_score between 0 and 100),
  vocal_variety_score     integer check (vocal_variety_score between 0 and 100),
  pacing_score            integer check (pacing_score between 0 and 100),
  conciseness_score       integer check (conciseness_score between 0 and 100),
  pace_rating             text check (pace_rating in ('too slow','good','too fast')),
  wpm                     integer,
  filler_words            jsonb default '[]',
  strengths               jsonb default '[]',
  improvements            jsonb default '[]',
  vocabulary_upgrades     jsonb default '[]',
  overall_summary         text,
  debate_argument_score   integer,
  debate_logic_score      integer,
  debate_conviction_score integer,
  created_at              timestamptz default now()
);

-- ── prompts ───────────────────────────────────────
create table public.prompts (
  id               uuid default uuid_generate_v4() primary key,
  title            text not null,
  description      text,
  category         text,
  duration_minutes integer default 5,
  difficulty       text default 'intermediate' check (difficulty in ('beginner','intermediate','advanced')),
  language         text default 'en',
  is_featured      boolean default false,
  created_at       timestamptz default now()
);

-- ── saved_prompts ─────────────────────────────────
create table public.saved_prompts (
  id         uuid default uuid_generate_v4() primary key,
  user_id    uuid references public.profiles on delete cascade not null,
  prompt_id  uuid references public.prompts on delete cascade not null,
  created_at timestamptz default now(),
  unique (user_id, prompt_id)
);

-- ── debate_topics ─────────────────────────────────
create table public.debate_topics (
  id               uuid default uuid_generate_v4() primary key,
  title            text not null,
  description      text,
  category         text,
  difficulty       text default 'intermediate' check (difficulty in ('beginner','intermediate','advanced')),
  language         text default 'en',
  is_featured      boolean default false,
  created_at       timestamptz default now()
);

-- ══════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ══════════════════════════════════════════════════

alter table public.profiles enable row level security;
alter table public.sessions enable row level security;
alter table public.analysis enable row level security;
alter table public.prompts enable row level security;
alter table public.saved_prompts enable row level security;
alter table public.debate_topics enable row level security;

-- profiles: user can only read/write their own
create policy "profiles: own" on public.profiles
  for all using (auth.uid() = id);

-- sessions: user can only read/write their own
create policy "sessions: own" on public.sessions
  for all using (auth.uid() = user_id);

-- analysis: user can read their own session analysis
create policy "analysis: own via session" on public.analysis
  for all using (
    exists (select 1 from public.sessions where sessions.id = analysis.session_id and sessions.user_id = auth.uid())
  );

-- prompts: readable by all authenticated users
create policy "prompts: read authenticated" on public.prompts
  for select using (auth.role() = 'authenticated');

-- saved_prompts: own only
create policy "saved_prompts: own" on public.saved_prompts
  for all using (auth.uid() = user_id);

-- debate_topics: readable by all authenticated users
create policy "debate_topics: read authenticated" on public.debate_topics
  for select using (auth.role() = 'authenticated');

-- ══════════════════════════════════════════════════
-- AUTO-CREATE PROFILE ON SIGN UP
-- ══════════════════════════════════════════════════
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, created_at, updated_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    now(),
    now()
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ══════════════════════════════════════════════════
-- UPDATED_AT TRIGGER
-- ══════════════════════════════════════════════════
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();
