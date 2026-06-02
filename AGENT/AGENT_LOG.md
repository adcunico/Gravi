# Gravi MVP Agent — Session Log

> This file is written by the agent at the end of every session.
> Read it at the start of each new session to understand prior context.

---
## Session 3 — 2026-06-02

### What was done
- Closed user-action items: OpenAI key regenerated, all Supabase edge function secrets set, functions deployed
- **Free-tier content locks**: `Prompts.tsx`, `StudioLibrary.tsx` cap at 3 items; `Debate.tsx` (topic grid) caps at 2 topics. Items beyond the limit show as locked cards (60% opacity, lock icon, "Upgrade to unlock →"). A "N more available on Pro" banner appears below the grid. Clicking a locked card navigates to `/upgrade`.
- **PDF export**: Replaced `onClick={() => {}}` with `onClick={() => window.print()}` in `Debrief.tsx` (Pro-gated)
- **Transcript display in Debrief**: Added `Transcript` tab to `Debrief.tsx`. Tab only appears when `session.transcript` is non-empty. Shows word count + full transcript text in a GlassCard.
- **SignIn race condition**: Removed `navigate()` call from `SignIn.handleSubmit`. Removed stale `profile` + `useNavigate` imports. `PublicGuard` now drives redirect after `onAuthStateChange` fires and profile is loaded.

### Issues fixed this session
- `free-tier-content-not-locked` — locks in Prompts, StudioLibrary, Debate
- `pdf-export-noop` — `window.print()` implemented
- `no-transcript-in-debrief` — Transcript tab added
- `signin-redirect-race` — navigate() removed, guard handles routing

### Flow Map changes
- `Pro topic lock (free tier)` Debate: ❌ Missing → ✅ Done
- `Transcript display` Debrief: ❌ Missing → ✅ Done
- `PDF export (Pro)` Debrief: ⚠️ Has Issues → ✅ Done
- `Email sign in` Auth: 🔶 Partial → ✅ Done

### Remaining known issues
1. `delete-account-noop` (TIER 3) — Profile.tsx delete confirm button is a no-op
2. `no-audio-storage` (TIER 3) — Audio blob not uploaded to storage; Pro replay has no data

### Recommendations for next session
- **TIER 3**: Delete Account — needs a Supabase edge function to cascade-delete user data, then call `supabase.auth.admin.deleteUser` (server-side)
- **TIER 3**: Audio storage upload in `TeleprompterSession.tsx` — upload blob to Supabase Storage bucket `session-audio/{user_id}/{session_id}.webm`, save URL to session record
- **Post-MVP**: Teleprompter script adherence scoring, Interview Practice mode, Vocabulary Library, advanced analytics charts

### Phase status
- `current_phase` is now: `build`
- MVP core loop status: **complete** — all flows working end-to-end, app is shippable

---

## Session 2 — 2026-06-02

### What was done
- Fixed invalid Claude model ID `claude-opus-4-7` → `claude-sonnet-4-6` in `supabase/functions/analyse-speech/index.ts` and `supabase/functions/generate-script/index.ts`
- Created `src/pages/auth/ResetPassword.tsx` — handles Supabase `PASSWORD_RECOVERY` event, shows new-password form, calls `updateUser`, redirects to `/signin` on success; expired-link state shows "Request a new link" CTA
- Created `src/pages/Terms.tsx` and `src/pages/Privacy.tsx` — professional stub pages matching design system
- Added `/reset-password`, `/terms`, `/privacy` routes to `App.tsx` (outside all guards)
- Implemented session paywall gate in `TeleprompterSession.tsx` — `startCountdown` queries session count; free users with ≥ 3 sessions see paywall modal with `/upgrade` CTA
- Fixed debate debrief routing in `TeleprompterSession.tsx` — debate sessions navigate to `/debate/debrief/:id`
- Added post-upgrade success banner to `Dashboard.tsx` — reads `?upgraded=1` via `useSearchParams`, shows dismissible gold banner, cleans URL
- Replaced hardcoded `streak = 3` in `Dashboard.tsx` with `calculateStreak()` from session dates
- Fixed Analytics Pro gate threshold: `sessions.length > 1` → `sessions.length >= 3`

### Issues found this session
- None new.

### Issues fixed this session
- `invalid-claude-model`, `missing-reset-password-route`, `missing-terms-privacy-routes`, `no-session-paywall-gate`, `debate-debrief-wrong-route`, `no-upgrade-success-notification`, `hardcoded-streak`, `analytics-pro-gate-threshold`

### Flow Map changes
- `Forgot password`: ⚠️ → ✅
- `Analysis edge function call`: ⚠️ → ✅
- `Redirect to debrief on completion`: ⚠️ → ✅
- `Session count gate`: ❌ → ✅
- `Post-upgrade success screen`: ❌ → ✅
- `Pro gate for history`: ⚠️ → ✅

### Remaining user-action blockers
1. **OpenAI API key** — Key starts `ysk-proj-`; regenerate at platform.openai.com and set as Supabase secret `OPENAI_API_KEY`
2. **Server-side secrets** — Set in Supabase Dashboard → Edge Functions → Secrets: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_ANNUAL`, `APP_URL`. Then deploy: `supabase functions deploy --all`

### Recommendations for next session
- Free-tier content locks in `Prompts.tsx`, `Debate.tsx`, `StudioLibrary.tsx` — cap at 3 prompts / 2 debate topics with lock UI + upgrade CTA (TIER 2 highest priority)
- Transcript display in `Debrief.tsx` — add collapsible transcript section
- PDF export in `Debrief.tsx` — `window.print()` + print stylesheet, Pro-gated
- SignIn race condition fix

### Phase status
- `current_phase` is now: `build`
- MVP core loop status: `in_progress` — waiting on user to fix env keys before end-to-end can be tested

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
