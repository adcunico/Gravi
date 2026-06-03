-- ══════════════════════════════════════════════════
-- GRAVI — Prompt Suggestions
-- ══════════════════════════════════════════════════

create table public.prompt_suggestions (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references public.profiles on delete cascade not null,
  title       text not null,
  description text,
  occasion    text,
  status      text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at  timestamptz default now()
);

alter table public.prompt_suggestions enable row level security;

create policy "Users can submit suggestions"
  on public.prompt_suggestions for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own suggestions"
  on public.prompt_suggestions for select
  using (auth.uid() = user_id);
