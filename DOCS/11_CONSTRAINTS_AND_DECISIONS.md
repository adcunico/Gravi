# Constraints and Architecture Decisions

## Hard Constraints (V1)

### Audio only — no video
V1 contains no video recording, no video upload, no camera access, and no video playback. If a user uploads a `.mp4` or `.mov` file anywhere in the app, show a friendly inline message: *"Video support is coming soon. Please upload an audio file."*

Video is explicitly a future feature. Do not build any video infrastructure, even as a stub.

### API keys never exposed client-side
All calls to OpenAI Whisper, Anthropic Claude, and Stripe are made server-side via Supabase edge functions. The Supabase `anon` key (client-safe) is the only key that may appear in client-side code.

### Audio auto-deletion at 30 days
User audio files are stored in a private Supabase Storage bucket with signed URL access. A scheduled edge function (`cleanup-audio`) runs daily and deletes any audio file older than 30 days. This is a privacy and storage cost control measure.

### Interview debrief is a separate route (future mode)
The interview debrief is planned as a separate component from the standard session debrief. If built later, it should not be merged with the standard `/sessions/:sessionId` debrief because interview review handles multiple answer objects while a normal session debrief handles a single analysis object.

### Interview recordings are individual files
Each answer in an interview session would be a separate audio file uploaded to Supabase Storage at: `{user_id}/interview/{interview_session_id}/{question_index}.{ext}`. Do not concatenate or merge audio files.
