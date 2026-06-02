# Gravi — Living UX Flow Map

> Maintained by the MVP agent. Updated each session after audit.
> Status: ✅ Done | 🔶 Partial | ❌ Missing | ⚠️ Has Issues | 🔒 Future

---

## Critical Path (MVP Gate)

| Flow | Status | Notes |
|------|--------|-------|
| Landing → Sign Up | ✅ Done | Landing complete, CTA navigates to /signup |
| Sign Up → Onboarding | 🔶 Partial | Works, but if Supabase email confirmation is on, user must click link first |
| Onboarding → Dashboard | ✅ Done | 3-step flow saves profile, redirects correctly |
| Dashboard → Record | ✅ Done | Feature cards navigate to /studio |
| Record → Processing → Debrief | ⚠️ Has Issues | Claude model ID fixed. BUT: OpenAI key still looks corrupted (`ysk-`) → transcription will fail until user regenerates key |
| Debrief → Paywall (after 3rd session) | ✅ Done | Session count gate implemented in TeleprompterSession. Free users see paywall modal after 3 sessions |
| Upgrade → Stripe → Success | ✅ Done | Post-upgrade gold banner shown on Dashboard when `?upgraded=1` param present |

---

## Auth Flows

| Flow | Status | Notes |
|------|--------|-------|
| Email sign up | ✅ Done | Works with email confirmation or instant sign-up depending on Supabase config |
| Email sign in | ✅ Done | Race condition fixed: removed navigate() from submit handler; PublicGuard drives redirect |
| Google OAuth | ✅ Done | Implemented, redirects to /dashboard |
| Forgot password | ✅ Done | Form submits correctly; email link goes to `/reset-password` which now exists |
| Protected route redirect | ✅ Done | AuthGuard, OnboardingGuard, PublicGuard all correct |
| Post-login onboarding redirect | 🔶 Partial | OnboardingGuard catches unonboarded users, but SignIn race condition can cause brief flash of /dashboard |

---

## Onboarding Flows

| Flow | Status | Notes |
|------|--------|-------|
| Step 1: Welcome screen | ✅ Done | Animated, logo, CTA |
| Step 2: Role selection | ✅ Done | 8 roles |
| Step 3: Goals (multi-select, max 3) | ✅ Done | Max 3 enforced, 8 goals available |
| Step 4: Language selection | ✅ Done | 6 languages |
| Save to profiles table → redirect dashboard | ✅ Done | upsertProfile + fetchProfile + navigate('/dashboard') |

---

## Record & Analyse (Studio)

| Flow | Status | Notes |
|------|--------|-------|
| Upload Script tab | ✅ Done | Paste + .txt dropzone, word count, session estimate |
| Generate Script tab | ✅ Done | AI generation via generate-script edge function, edit mode |
| Library Prompts tab | ✅ Done | Prompts fetched, saved, filter/search, start session |
| Script → sessionStorage → TeleprompterSession | ✅ Done | All 3 paths set sessionStorage and navigate to /studio/session |
| Live Record (MediaRecorder) | ✅ Done | getUserMedia, MediaRecorder, pause/resume, countdown |
| Gold waveform | ✅ Done | Three.js waveform + CSS fallback for no-WebGL |
| Transcription edge function call | ⚠️ Has Issues | OpenAI key still corrupted (starts `ysk-`) — user must regenerate |
| Analysis edge function call | ✅ Done | Model ID fixed to `claude-sonnet-4-6` |
| Processing overlay (3 steps) | ✅ Done | Step-by-step status messages during processing |
| Redirect to debrief on completion | ✅ Done | Routes to `/debate/debrief/:id` for debate; `/studio/debrief/:id` for guided |
| Error handling (processing fails) | 🔶 Partial | Catches errors, navigates to /sessions, but no user-facing error message |
| Mic permission denied modal | ✅ Done | Shows modal with explanation |

---

## Session Debrief

| Flow | Status | Notes |
|------|--------|-------|
| Score gauge renders | ✅ Done | ScoreGauge with label |
| Overview tab (summary + strengths + improvements) | ✅ Done | |
| Delivery tab (4 metrics + filler words) | ✅ Done | |
| Content tab (conciseness + persuasion) | ✅ Done | |
| Voice tab (WPM + pace rating) | ✅ Done | |
| Debate tab (argument + logic + conviction) | ✅ Done | Only shown for debate mode sessions |
| Vocabulary upgrades panel | ✅ Done | Shows in Overview tab |
| Filler words panel | ✅ Done | Shows in Delivery tab |
| Transcript display | ✅ Done | Transcript tab added to Debrief; shows word count + full text |
| Audio playback | ❌ Missing | Audio blob not uploaded to storage; no player |
| PDF export (Pro) | ✅ Done | `window.print()` implemented, Pro-gated |
| Practice Again CTA | ✅ Done | Re-populates sessionStorage and navigates back to /studio/session |
| New Session / View All Sessions CTAs | ✅ Done | |
| Loading state | ✅ Done | Skeleton shown while fetching |
| Not found state | ✅ Done | "Session not found" message with back button |

---

## Debate Arena

| Flow | Status | Notes |
|------|--------|-------|
| Entry: Browse Topics / Surprise Me | ✅ Done | Two entry cards, both functional |
| Topic library grid + filters (category) | ✅ Done | Category chips filter the topic grid |
| Pro topic lock (free tier) | ✅ Done | First 2 topics free; rest locked with upgrade CTA |
| AI topic suggestion (generate-topics) | ✅ Done | Calls generate-topics edge function |
| Position selection (FOR/AGAINST/NEUTRAL) | ✅ Done | Color-coded selection |
| Format chips (2min / 5min / 10min) | ✅ Done | Labelled Impromptu/Structured/Extended |
| Argument hints accordion | ✅ Done | Collapsible hints panel |
| Debate recording screen | ✅ Done | Reuses TeleprompterSession, detects `isDebate` from sessionStorage |
| analyse-speech edge function (debate mode) | ⚠️ Has Issues | Code correct but invalid model ID |
| Debate debrief (Argument + 3 tabs) | ✅ Done | Debate tab shows argument/logic/conviction scores |

---

## Teleprompter

| Flow | Status | Notes |
|------|--------|-------|
| Script: Load from Library | ✅ Done | StudioLibrary → sessionStorage → TeleprompterSession |
| Script: Paste Text | ✅ Done | StudioUpload → sessionStorage → TeleprompterSession |
| Script: Generate (generate-script) | ✅ Done | StudioGenerate → edge function → sessionStorage |
| Setup: scroll speed (slow/medium/fast) | ✅ Done | Speed chips in idle state |
| Recording screen (scrolling text, focus line) | ✅ Done | Gold focus line, fade effect for surrounding lines |
| analyse-teleprompter + script diff | 🔒 Future | Not implemented; no edge function |
| Teleprompter debrief (script adherence section) | 🔒 Future | Not in Debrief.tsx yet |

---

## Analytics & Sessions

| Flow | Status | Notes |
|------|--------|-------|
| Session history list | ✅ Done | Filter by mode, sort by newest/score/duration |
| Session replay / debrief link | ✅ Done | Links to `/sessions/:sessionId` → Debrief.tsx |
| Analytics charts (LineChart) | ✅ Done | Recharts LineChart with per-metric selector |
| Filter by range (7d / 30d / all) | ✅ Done | |
| Score breakdown grid | ✅ Done | Per-metric glass cards with ScoreBar |
| Most improved / needs focus insight | ✅ Done | |
| Pro gate for history | ✅ Done | Fixed threshold to `sessions.length >= 3` |

---

## Subscription & Paywall

| Flow | Status | Notes |
|------|--------|-------|
| Session count gate (free = 3 total) | ✅ Done | Enforced in TeleprompterSession; paywall modal shown with upgrade CTA |
| Pro feature lock modals | 🔶 Partial | PDF export locked, audio replay locked, but no explicit lock modals with upgrade CTAs |
| Upgrade page (monthly/annual toggle) | ✅ Done | Toggle + comparison table + CTA |
| Stripe checkout redirect | ✅ Done | create-stripe-checkout edge function wired up |
| Stripe webhook → update subscription_status | ✅ Done | stripe-webhook edge function updates user record |
| Post-upgrade success screen | ✅ Done | Dashboard shows gold banner on `?upgraded=1` param |

---

## Navigation & Layout

| Flow | Status | Notes |
|------|--------|-------|
| Sidebar (desktop) | ✅ Done | Full sidebar with nav items, Pro badge, user info |
| Bottom tab bar (mobile) | ✅ Done | 5-item tab bar with active state |
| Empty states (all list views) | 🔶 Partial | Sessions + Analytics have empty states; others may not |
| Error states (all async ops) | 🔶 Partial | Some screens handle errors; no consistent pattern |
| Loading skeletons | ✅ Done | Skeleton component used across main views |

---

_Last updated by agent: 2026-06-02 (Session 3)_
