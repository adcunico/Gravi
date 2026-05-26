# Implementation Phases

Build in this order. Do not proceed to the next phase until the current phase is working end-to-end with real data in production (or staging). Each phase should be deployable.

---

## Phase 1 — Core Loop (MVP)

**Goal:** A user can sign up, record a speech, receive a real AI coaching debrief, and hit the paywall.

1. Project setup — Vite + React + TypeScript + Tailwind CSS configured, Supabase client connected, router configured
2. Supabase schema — all migrations run, debate topics seeded, storage bucket created
3. Auth — email/password login, signup form, Google OAuth, protected route HOC, redirect to onboarding on first login
4. Onboarding — 3-step flow (welcome, role, goals), saves to users table, sets onboarding_complete
5. Dashboard — sidebar layout (desktop), bottom tab bar (mobile), empty states for all sections
6. Record page — all 3 tabs: upload (drag/drop + file picker), live record (MediaRecorder API + waveform), free practice (prompt rotation)
7. `transcribe` edge function — Deepgram Nova-2 integration, returns transcript + audio metadata
8. `analyse-speech` edge function — Claude integration, structured JSON output, writes to analysis table
9. Speech session debrief — full layout wired to real Supabase data: gauge, DNA grid, filler words, transcript, coaching, vocabulary, playback, actions
10. Stripe — `create-checkout` + `stripe-webhook` edge functions, upgrade page, paywall session count gate

**Deliverable:** End-to-end working product. User can sign up → record → debrief → hit paywall.

---

## Phase 2 — Debate Arena

11. Debate entry screen — two-card layout, topic library grid, category/difficulty filters
12. `suggest-debate-topics` edge function
13. AI suggestion panel — inline expandable, calls edge function, shows 3 result cards
14. Position selection screen — FOR/AGAINST/NEUTRAL cards, format chips, Begin CTA
15. Debate recording screen — full-screen, argument prompts, position badge, countdown
16. `analyse-debate` edge function — debate-specific Claude prompt, extended JSON schema
17. Debate debrief — Argument Strength panel, 3-tab coaching, persuasive phrases panel, correct bottom actions

**Deliverable:** Full debate flow working end-to-end.

---

## Phase 3 — Teleprompter

18. Script library — CRUD (create, read, update, delete), search, filter, occasion tags, favourite
19. `generate-script` edge function — Claude scriptwriter
20. Teleprompter Step 1 — script selection tabs (Load / Paste / Generate), live word count
21. Teleprompter Step 2 — setup panel with font size, scroll speed, mode, read-through, mirror toggles
22. Teleprompter Step 3 — recording screen with text display (opacity layers), speed controls, auto/manual scroll, record indicator
23. `analyse-teleprompter` edge function — speech analysis + LCS diff algorithm
24. Teleprompter debrief — Script Adherence section injected between DNA grid and filler words

**Deliverable:** Full teleprompter flow working end-to-end, including script diff in debrief.

---

## Phase 4 — Interview Practice

25. Interview setup form — type, level, industry, focus, question count on one scrollable page
26. `generate-interview-questions` edge function
27. Interview session screen — sequential Q&A, think time, question display, transition screens, processing overlay
28. `analyse-interview-answer` edge function — per-answer STAR scoring
29. `generate-aggregate-interview-feedback` edge function
30. Interview debrief screen — overall gauge, per-answer collapsible cards, model answer guides, aggregate feedback

**Deliverable:** Full interview flow working end-to-end.

---

## Phase 5 — Analytics and Library

31. Speech DNA analytics page — Recharts RadialBarChart + LineChart, date filter, session type filter (All/Speech/Debate/Teleprompter/Interview), metric card grid (switches based on filter), session history table, summary stats strip
32. Vocabulary library — table view, filter by source mode, sort, delete. Flashcard mode with reveal + mark known/review

**Deliverable:** Analytics and vocabulary fully functional.

---

## Phase 6 — Polish and Public

33. Landing page — all 9 sections (Hero, Problem, Four pillars, Speech DNA callout, How it works, Testimonials, Pricing, FAQ, Footer)
34. Settings page — all fields (display name, photo, role, language, email prefs, Google OAuth, billing, delete account)
35. Empty states — every list view that can be empty has a designed empty state with CTA
36. Error states — every async operation has an error state with retry option
37. Loading states — skeleton loaders on every data-loading view
38. Mobile QA — test all 4 practice modes on iOS Safari and Android Chrome
39. Audio cleanup — `cleanup-audio` scheduled edge function (delete audio files >30 days old)
40. GDPR/Privacy — Privacy Policy page, Terms of Service page, cookie notice

**Deliverable:** Production-ready, publicly launchable product.
