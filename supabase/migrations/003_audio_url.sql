-- Add audio storage path to sessions
alter table public.sessions
  add column if not exists audio_url text;

-- Storage RLS policies for session-audio bucket
create policy "users upload own audio"
  on storage.objects for insert
  with check (
    bucket_id = 'session-audio'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "users read own audio"
  on storage.objects for select
  using (
    bucket_id = 'session-audio'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "users delete own audio"
  on storage.objects for delete
  using (
    bucket_id = 'session-audio'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
