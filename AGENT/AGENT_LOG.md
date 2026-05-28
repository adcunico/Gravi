# Gravi MVP Agent — Session Log

> This file is written by the agent at the end of every session.
> Read it at the start of each new session to understand prior context.

---

## Session 1 — 2026-05-28

### What was done
- Full initial audit of the entire codebase: all pages, components, stores, lib, edge functions, migrations, types, config
- UX flow analysis against every flow in FLOW_MAP.md
- Development plan written (see below)
- No code changes made this session — audit only

### Issues found this session

**CRITICAL — Will cause runtime failures:**

1. **Invalid Claude model ID** — `analyse-speech/index.ts` and `generate-script/index.ts` both reference `model: 'claude-opus-4-7'`. This model does not exist. Valid IDs: `claude-opus-4-8`, `claude-sonnet-4-6`, `claude-haiku-4-5-20251001`. Every AI analysis and script generation call will fail with an API error.

2. **OpenAI API key appears corrupted in `.env.local`** — Key starts with `ysk-proj-` instead of `sk-proj-`. Transcription via Whisper will fail. User must regenerate their OpenAI API key.

3. **Missing env vars** — `ANTHROPIC_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_ANNUAL`, `APP_URL` are absent. These must be set as Supabase Edge Function secrets in the Supabase Dashboard (not in `.env.local` — they're server-side only). Without them, AI + Stripe all fail.

4. **`/reset-password` route and page MISSING** — `resetPassword()` in `supabase.ts` redirects users to `${origin}/reset-password` in email links. There is no `/reset-password` route in `App.tsx` and no `ResetPassword.tsx` page. Password reset email links lead to a broken catch-all redirect to `/`.

5. **`/terms` and `/privacy` routes MISSING** — `SignUp.tsx` links to `/terms` and `/privacy`. Neither route is defined in `App.tsx`. Clicking either redirects to `/` (landing page). Legal link UX is broken.

**MODERATE — Degrade UX or block business model:**

6. **Session paywall gate not implemented** — Free users should be blocked after 3 sessions total. No session count check exists anywhere in the recording flow (`TeleprompterSession.tsx`). A free user can record unlimited sessions. The free tier limit is purely decorative right now.

7. **No post-upgrade success notification** — Stripe success URL is `/dashboard?upgraded=1`. `Dashboard.tsx` does not read this query param. Users see no confirmation that their upgrade succeeded.

8. **PDF Export is a no-op** — `Debrief.tsx` shows "Export PDF" button for Pro users but `onClick={() => {}}` — no implementation.

9. **Delete Account button is a no-op** — `Profile.tsx` delete modal confirm has `onClick={() => {}}` — no implementation.

10. **Audio not uploaded to storage** — Audio blob is transcribed and discarded. No upload to Supabase Storage. The Pro "Session audio replay" feature has no backing data.

11. **Debate debrief routes to `/studio/debrief` not `/debate/debrief`** — `TeleprompterSession.tsx` calls `navigate('/studio/debrief/${sessionData.id}')` for all sessions including debate. Functionally works (both routes use same `Debrief` component), but URL bar always shows `/studio/debrief` after a debate.

12. **Streak is hardcoded** — `Dashboard.tsx` has `const streak = 3 // TODO: calculate real streak`. Must be calculated from session dates.

13. **SignIn redirect race condition** — `SignIn.tsx` navigates based on `profile?.onboarding_complete` which is the profile from the previous auth session. New users may flash `/dashboard` before `OnboardingGuard` catches them.

**LOW PRIORITY:**

14. **Transcript not shown in Debrief** — Transcript is stored in `sessions.transcript` but never displayed in `Debrief.tsx`.

15. **Free-tier content not locked** — All prompts and debate topics visible to free users. Should show only first 3 prompts and 2 debate topics with lock UI.

16. **Analytics Pro gate threshold wrong** — `Analytics.tsx` shows Pro gate if `sessions.length > 1` but should be `>= 3` to match the 3-session free tier.

---

## Development Plan

### TIER 1 — MVP BLOCKERS

1. **Fix Claude model IDs** — Change `claude-opus-4-7` → `claude-sonnet-4-6` in:
   - `supabase/functions/analyse-speech/index.ts`
   - `supabase/functions/generate-script/index.ts`

2. **Create `/reset-password` page and route** — Build `src/pages/auth/ResetPassword.tsx` (Supabase `updateUser` call after reading hash). Add route to `App.tsx` under `PublicGuard`.

3. **Create `/terms` and `/privacy` stub pages** — Add `src/pages/Terms.tsx` and `src/pages/Privacy.tsx`. Add routes to `App.tsx` under `PublicGuard`.

4. **Implement session paywall gate** — In `TeleprompterSession.tsx`, before `startCountdown()`, fetch session count. If `count >= 3` and `subscription_status !== 'pro'`, show a paywall modal instead of starting the countdown. CTA → `/upgrade`.

5. **Post-upgrade success notification** — In `Dashboard.tsx`, read `?upgraded=1` query param via `useSearchParams`. Show a dismissible success banner.

6. **(User action required) Fix env vars** — User must:
   - Regenerate OpenAI API key
   - Set in Supabase Dashboard > Edge Functions > Secrets: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_ANNUAL`, `APP_URL`
   - Deploy edge functions: `supabase functions deploy --all`

### TIER 2 — MVP QUALITY

7. **Free tier content locks** — Show lock icon + upgrade CTA after first 3 prompts and first 2 debate topics for free users.

8. **Analytics Pro gate fix** — Change `sessions.length > 1` to `sessions.length >= 3` in `Analytics.tsx`.

9. **Fix debate debrief routing** — `TeleprompterSession.tsx`: route to `/debate/debrief/:id` for debate sessions.

10. **Real streak calculation** — Calculate from consecutive session days in `Dashboard.tsx`.

11. **SignIn redirect fix** — Remove `navigate()` from SignIn submit. Let `onAuthStateChange` handle routing.

12. **PDF export (basic)** — `window.print()` with print-optimized stylesheet for debrief. Gate behind Pro.

### TIER 3 — POST-MVP

13. Upload audio to Supabase Storage + audio player in Debrief
14. Transcript display in Debrief
15. Delete Account edge function + implementation
16. Teleprompter script adherence scoring (`analyse-teleprompter` edge function)
17. Interview Practice mode (full feature)
18. Vocabulary Library page
19. Analytics Pro charts (RadialBar, session type filter)

---

### Flow Map changes
- All flows updated from `—` to real status (see FLOW_MAP.md)

### Recommendations for next session
- Start with TIER 1, item 1: fix the Claude model ID — a 2-line change that unblocks all AI functionality
- Then item 2: create the ResetPassword page — without it the forgot-password flow is a dead end
- Then item 4: session paywall gate — critical for business model

### Phase status
- `current_phase` is now: `build`
- MVP core loop status: `in_progress`

---
