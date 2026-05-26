# User Flows

> Note: The current codebase routes speech and teleprompter practice through `/studio/*` and debate practice through `/debate/*`. Interview Practice is not currently implemented.

## 1. Onboarding Flow

```
User lands on /login
  → Creates account (email/password or Google OAuth)
  → Supabase creates auth.users record
  → Client creates row in public.users table
  → Redirect to /app/onboarding

Onboarding Step 1 — Welcome
  → Full-screen panel, Gravi logo, headline, CTA
  → Tap "Let's get started →"

Onboarding Step 2 — Role Selection
  → 6 role cards (single select)
  → Select role → "Next →" enabled
  → Tap "Next →"

Onboarding Step 3 — Goals
  → 8 goal chips (multi-select, max 2)
  → Select 1–2 goals → "Get started →" enabled
  → Tap "Get started →"
  → Save role + goals_json to users table
  → Set onboarding_complete = true
  → Redirect to /app (Dashboard)
```

---

## 2. Record & Analyse — Upload Flow

```
User navigates to /app/record
  → Default tab: Upload Audio

User drags and drops audio file (or clicks Browse)
  → Accepted formats: .mp3 .wav .m4a .webm .ogg
  → If .mp4/.mov: inline error "Video support coming soon. Please upload an audio file."
  → File name + size + estimated duration shown
  → Optional: user fills in "What is this speech about?" topic field

User taps "Analyse Speech"
  → File uploaded to Supabase Storage (private bucket)
  → New row created in sessions table (mode = 'upload', audio_url set)
  → Processing overlay shown:
      Step 1: "Transcribing your speech..." → calls transcribe edge function
      Step 2: "Analysing delivery..." → calls analyse-speech edge function
      Step 3: "Generating feedback..." → writes to analysis table
  → Redirect to /app/session/:id
```

---

## 3. Record & Analyse — Live Record Flow

```
User taps "Record Live" tab
  → If microphone permission not granted:
      Show permission request UI ("Gravi needs microphone access")
      User grants → continue
      User denies → show error with instructions
  → Large circular record button shown (deep red)

User taps record button
  → 3-second countdown
  → Recording begins
      Animated gold waveform visible
      Timer counting up (00:00)
      Optional topic field expandable
  → User taps "Stop Recording"
  → Audio blob encoded and uploaded to Supabase Storage
  → Same processing pipeline as Upload flow
  → Redirect to /app/session/:id
```

---

## 4. Record & Analyse — Free Practice Flow

```
User taps "Free Practice" tab
  → Topic prompt card shown with hardcoded prompt (e.g. "Describe your leadership philosophy")
  → User can tap "Refresh ↺" to cycle through 20+ prompts (client-side, no API call)
  → Topic is stored and passed to analysis as context
  → Same recording UI as Live Record
  → Same processing pipeline
  → Redirect to /app/session/:id
```

---

## 5. Debate Arena Flow

```
User navigates to /app/debate
  → Entry screen: two cards — "Browse Topics" and "Suggest a Topic"

PATH A: Browse Topics
  → Topic library grid shown
  → User filters by category and/or difficulty
  → Free tier: topics 3–10 locked with Pro badge
  → User clicks "Start Debate →" on a topic card
  → Redirect to /app/debate/:topicId

PATH B: Suggest a Topic
  → Inline panel expands
  → User role pre-filled from profile
  → Optional subject area field
  → User taps "Generate Topics"
  → Loading (~3–5s): calls suggest-debate-topics edge function
  → 3 AI-generated topic cards shown
  → User selects one → Redirect to /app/debate/:topicId (AI topic stored in session)

Position Selection (/app/debate/:topicId)
  → Topic title displayed large
  → 3 position cards: FOR (blue) / AGAINST (red) / NEUTRAL (gold)
  → User selects position (card highlights)
  → Format chips: Impromptu 2min / Structured 5min / Extended 10min (Pro)
  → User selects format
  → "Begin Debate →" enabled
  → User taps "Begin Debate →"

Debate Recording Screen
  → Full-screen dark mode
  → 3-second countdown
  → Recording begins
      Topic shown in gold at top
      Position badge (FOR/AGAINST/NEUTRAL) in corner
      Argument structure prompts shown as ghost text (dismissible)
      Timer counting up toward target duration
      Gold waveform animated
  → User taps "Stop & Analyse"
  → Same processing pipeline (calls analyse-debate instead of analyse-speech)
  → Redirect to /app/session/:id with mode = 'debate'
```

---

## 6. Teleprompter Flow

```
User navigates to /app/teleprompter

Step 1 — Script Selection (3 tabs)

TAB A: Load from Library
  → Search/browse saved scripts
  → Select → script populates preview

TAB B: Paste Text
  → Paste into textarea
  → Word count + speaking time shown live

TAB C: Generate Script
  → Compact form: occasion, duration, key message, key points, tone
  → "Generate Script" → loading (~5–8s) → calls generate-script edge function
  → Script shown in editable textarea
  → User edits if needed
  → Option to save to library

User taps "Continue to Setup →"

Step 2 — Teleprompter Setup
  → Script preview shown (right/above)
  → Settings (left/below):
      Font size: Small / Medium / Large
      Scroll speed: Slow / Medium / Fast
      Scroll mode: Auto / Manual toggle
      Read-through mode: checkbox (show script for 30s before recording)
      Mirror text: toggle
  → User taps "Start Recording →"

Step 3 — Recording Screen
  → Full-screen dark mode
  → If read-through mode enabled:
      Script shown statically for 30 seconds
      Progress bar shown beneath
      After 30s: "Recording starts in 3... 2... 1..."
  → Recording begins
      Script text centred, large font
      Current section highlighted full white
      Previous text 60% opacity, scrolling up
      Upcoming text 70% opacity
      Speed ▲/▼ controls top-right corner
      Record indicator bottom-right (red dot + timer + waveform)
      "Stop & Analyse" button bottom-centre (appears after 3 seconds)
  → User taps "Stop & Analyse"
  → Audio uploaded + script_used saved in sessions row
  → Processing pipeline: transcribe + analyse-teleprompter (includes script diff)
  → Redirect to /app/session/:id with mode = 'teleprompter'
```

---

## 7. Interview Practice Flow

```
User navigates to /app/interview
  → Setup form on single scrollable page

User configures session:
  → Interview Type: Behavioural / Competency / Strength / Mixed
  → Role Level: Junior / Mid / Senior / Executive / Board
  → Industry (optional dropdown)
  → Focus Area (optional chips)
  → Number of Questions: 3 / 5 / 8

User taps "Generate Questions & Start →"
  → Calls generate-interview-questions edge function
  → Creates row in interview_sessions table with questions_json
  → Redirect to /app/interview/:sessionId

Interview Session (/app/interview/:sessionId)
  → For each question (loop):

      Question displayed:
        Question number shown ("Question 2 of 5")
        Question text large in Cormorant Garamond
        "What's being tested" expandable section
        Suggested duration shown ("Aim for 60–90 seconds")

      Optional think time:
        "Take 30 seconds to think" → countdown timer
        Or "Skip — record now"

      Recording:
        Purple record button
        Gold waveform when recording
        Live timer
        After 20 seconds: "Done — Next Question →" button appears
        (Last question: "Done — Finish Interview →")

      On tapping Done:
        Current recording saved
        3-second transition screen: "Answer saved ✓ · Next: Question N of N"
        Move to next question

  → After final answer:
      Processing overlay: "Analysing your interview..."
      All answers processed (parallel calls to analyse-interview-answer)
      Then calls generate-aggregate-interview-feedback
      Redirect to /app/interview/:sessionId/debrief
```

---

## 8. Session Debrief Flow (Speech / Debate / Teleprompter)

```
Arrives at /app/session/:id after processing completes

All modes:
  → Shared header: title, mode badge, date, duration
  → For debate: position badge also shown

Speech modes (upload / live / free):
  → Hero confidence score gauge (gold)
  → Trend vs last session
  → Speech DNA grid (6 metrics)
  → Filler words panel
  → Transcript (collapsible)
  → AI coaching feedback (2 columns + narrative)
  → Vocabulary upgrade (5 words)
  → Audio playback
  → Bottom actions: practice again, download transcript

Teleprompter mode (same as speech + Script Adherence section):
  → Script Adherence section between DNA grid and filler words:
      % match badge (gold/amber/red by threshold)
      Adherence coaching note
      Script diff panel (collapsible): green/amber/red/gold highlights
      Adherence insight from Claude

Debate mode:
  → Hero argument score gauge (gold) + position badge
  → Argument Strength panel (6 debate metrics, replaces DNA grid)
  → Delivery panel (collapsible secondary)
  → Filler words
  → Transcript (persuasive phrases highlighted gold)
  → Debate coaching 3 tabs: Argument / Delivery / Language
  → Persuasive Phrases panel
  → Vocabulary upgrade
  → Audio playback
  → Bottom actions: debate again opposite position, try new topic, download transcript
```

---

## 9. Upgrade / Paywall Flow

```
Trigger points:
  A. After 3rd session completes → debrief shows upgrade banner above CTAs
  B. Free user clicks Pro-only feature → modal appears
  C. Free user tries to access locked debate topic → lock icon + upgrade prompt

Upgrade modal / page (/app/upgrade):
  → Monthly / Annual toggle
  → Free vs Pro comparison table
  → "Upgrade Now →" CTA
  → Calls create-checkout edge function
  → Redirects to Stripe hosted checkout
  → On success: stripe-webhook fires → updates users.subscription_status = 'pro'
  → Success screen: "Welcome to Gravi Pro"
  → Redirect to dashboard with Pro badge
```

---

## 10. Vocabulary Library Flow

```
User saves word from any session debrief (taps ✦ Save button)
  → Row created in vocabulary table with source_session_id

User navigates to /app/vocabulary
  → Table view (default): word, definition, example, source mode badge, date
  → Filter: All / From Speech / From Debate / From Interview
  → Sort: Recently added / Alphabetical
  → Delete button per row

User toggles to Flashcard mode:
  → Word shown large
  → Tap card to reveal definition + example
  → "Got it ✓" → removes from active deck
  → "Review again" → keeps in deck
  → Progress counter: "12 of 32 mastered"
```
