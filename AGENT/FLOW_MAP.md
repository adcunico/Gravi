# Gravi — Living UX Flow Map

> Maintained by the MVP agent. Updated each session after audit.  
> Status: ✅ Done | 🔶 Partial | ❌ Missing | ⚠️ Has Issues | 🔒 Future

---

## Critical Path (MVP Gate)

| Flow | Status | Notes |
|------|--------|-------|
| Landing → Sign Up | — | Not yet audited |
| Sign Up → Onboarding | — | Not yet audited |
| Onboarding → Dashboard | — | Not yet audited |
| Dashboard → Record | — | Not yet audited |
| Record → Processing → Debrief | — | Not yet audited |
| Debrief → Paywall (after 3rd session) | — | Not yet audited |
| Upgrade → Stripe → Success | — | Not yet audited |

---

## Auth Flows

| Flow | Status | Notes |
|------|--------|-------|
| Email sign up | — | — |
| Email sign in | — | — |
| Google OAuth | — | — |
| Forgot password | — | — |
| Protected route redirect | — | — |
| Post-login onboarding redirect | — | — |

---

## Onboarding Flows

| Flow | Status | Notes |
|------|--------|-------|
| Step 1: Welcome screen | — | — |
| Step 2: Role selection (6 roles) | — | — |
| Step 3: Goals (multi-select, max 2) | — | — |
| Save to users table → redirect dashboard | — | — |

---

## Record & Analyse (Studio)

| Flow | Status | Notes |
|------|--------|-------|
| Upload Audio tab | — | — |
| Live Record tab (MediaRecorder + waveform) | — | — |
| Free Practice tab (prompt rotation) | — | — |
| File upload → Supabase Storage | — | — |
| Transcription edge function call | — | — |
| Analysis edge function call | — | — |
| Processing overlay (3 steps) | — | — |
| Redirect to debrief on completion | — | — |

---

## Session Debrief

| Flow | Status | Notes |
|------|--------|-------|
| Score gauge renders | — | — |
| Speech DNA grid (6 metrics) | — | — |
| Filler words panel | — | — |
| Transcript (collapsible) | — | — |
| AI coaching feedback | — | — |
| Vocabulary upgrade (5 words) | — | — |
| Audio playback | — | — |
| Practice again / Download actions | — | — |

---

## Debate Arena

| Flow | Status | Notes |
|------|--------|-------|
| Entry: Browse Topics / Suggest a Topic | — | — |
| Topic library grid + filters | — | — |
| Pro topic lock (free tier) | — | — |
| AI topic suggestion (generate-topics) | — | — |
| Position selection (FOR/AGAINST/NEUTRAL) | — | — |
| Format chips (2min / 5min / 10min) | — | — |
| Debate recording screen (full-screen dark) | — | — |
| analyse-debate edge function | — | — |
| Debate debrief (Argument Strength + 3 tabs) | — | — |

---

## Teleprompter

| Flow | Status | Notes |
|------|--------|-------|
| Script: Load from Library | — | — |
| Script: Paste Text | — | — |
| Script: Generate (generate-script) | — | — |
| Setup: font size / scroll speed / modes | — | — |
| Recording screen (scrolling text, opacity) | — | — |
| analyse-teleprompter + script diff | — | — |
| Teleprompter debrief (script adherence section) | — | — |

---

## Analytics & Sessions

| Flow | Status | Notes |
|------|--------|-------|
| Session history list | — | — |
| Session replay / debrief link | — | — |
| Analytics charts (RadialBar, LineChart) | — | — |
| Filter by mode (All/Speech/Debate/Teleprompter) | — | — |

---

## Subscription & Paywall

| Flow | Status | Notes |
|------|--------|-------|
| Session count gate (free = 3 total) | — | — |
| Pro feature lock modals | — | — |
| Upgrade page (monthly/annual toggle) | — | — |
| Stripe checkout redirect | — | — |
| Stripe webhook → update subscription_status | — | — |
| Post-upgrade success screen | — | — |

---

## Navigation & Layout

| Flow | Status | Notes |
|------|--------|-------|
| Sidebar (desktop) | — | — |
| Bottom tab bar (mobile) | — | — |
| Empty states (all list views) | — | — |
| Error states (all async ops) | — | — |
| Loading skeletons | — | — |

---

_Last updated by agent: never_
