You are a senior UX designer and principal engineer acting as the sole technical lead on a product called **Gravi** — an AI-powered communication coaching platform for professionals.

Your task is to create a complete product documentation folder at the following path:

```
C:\Users\aline\Desktop\Gravi\DOCS\
```

Create the folder if it does not exist, then write every file listed below. Each file should be complete, professional, and ready to hand to a developer, designer, or investor. Do not summarise or truncate — write every section in full.

---

## FILES TO CREATE

```
C:\Users\aline\Desktop\Gravi\DOCS\
├── 00_README.md
├── 01_PRODUCT_OVERVIEW.md
├── 02_USER_PERSONAS.md
├── 03_USER_FLOWS.md
├── 04_SCREEN_SPECS.md
├── 05_DATABASE_SCHEMA.md
├── 06_TECH_STACK.md
├── 07_API_CONTRACTS.md
├── 08_DESIGN_SYSTEM.md
├── 09_SUBSCRIPTION_AND_PRICING.md
├── 10_IMPLEMENTATION_PHASES.md
└── 11_CONSTRAINTS_AND_DECISIONS.md
```

---

## FILE CONTENTS

Write each file exactly as specified below.

---

### 00_README.md

```markdown
# Gravi — Product Documentation

**Version:** 1.0  
**Last updated:** [today's date]  
**Status:** V1 specification — ready for development

---

## What is Gravi?

Gravi is a premium AI-powered communication coaching platform for professionals. It helps executives, presenters, sales professionals, legal practitioners, and media professionals practise and improve their spoken communication through four distinct practice modes, AI-powered analysis, and a rich coaching debrief.

**Tagline:** *Speak with authority. Think on your feet. Sound like yourself — only better.*

---

## How to use this documentation

| File | Purpose |
|---|---|
| 01_PRODUCT_OVERVIEW.md | Vision, modes, target users, positioning |
| 02_USER_PERSONAS.md | Detailed personas for each user type |
| 03_USER_FLOWS.md | Step-by-step user journeys for every mode |
| 04_SCREEN_SPECS.md | Detailed specification for every screen |
| 05_DATABASE_SCHEMA.md | Complete Supabase/PostgreSQL schema with SQL |
| 06_TECH_STACK.md | Full technology choices with rationale |
| 07_API_CONTRACTS.md | All edge function inputs, outputs, and Claude prompts |
| 08_DESIGN_SYSTEM.md | Colours, typography, components, principles |
| 09_SUBSCRIPTION_AND_PRICING.md | Free vs Pro tiers, Stripe setup, paywall logic |
| 10_IMPLEMENTATION_PHASES.md | Phased build order, 6 phases |
| 11_CONSTRAINTS_AND_DECISIONS.md | Critical constraints, V1 scope decisions, rationale |

---

## V1 Scope Statement

**V1 is audio only.** No video recording, no video upload, no camera access. Video is explicitly a future feature and must not be built in V1.

The four practice modes in V1 are:
1. Record & Analyse
2. Debate Arena
3. Teleprompter
4. Interview Practice

All four share the same backend pipeline: audio → Deepgram transcription → Claude analysis → debrief screen.
```

---

### 01_PRODUCT_OVERVIEW.md

```markdown
# Product Overview

## Vision

Gravi is an AI-powered communication coach built for professionals who need to speak with authority — in board rooms, media interviews, job interviews, investor pitches, and keynote stages. It gives users a private, judgment-free space to practise, receive detailed AI coaching, and track improvement over time.

The product ethos: clean, minimal, sophisticated. No gamification. No streaks. No cartoon mascots. The design and tone should feel like a premium executive coaching service, not a language-learning app.

**Comparable products:** Calm (tone), LinkedIn (professional context), a high-end SaaS tool (design standard).

---

## The Four Practice Modes

### 1. Record & Analyse
The core mode. Users record their voice or upload an audio file on any topic. The AI transcribes, scores, and delivers a comprehensive Speech DNA debrief covering six metrics: Clarity, Confidence, Persuasion, Vocal Variety, Pacing, and Conciseness.

Three sub-modes:
- **Upload Audio** — upload a pre-recorded file
- **Record Live** — record directly in the browser
- **Free Practice** — record against a rotating AI-generated topic prompt

### 2. Debate Arena
Users select a debate topic from a curated library (or request an AI-suggested topic), choose their position (FOR / AGAINST / NEUTRAL), and record their argument. The AI evaluates argument quality, logical structure, evidence use, counterargument anticipation, conviction, and rhetorical strength — with three tabs of coaching feedback (Argument, Delivery, Language).

Three formats:
- **Impromptu** — 2 minutes
- **Structured Argument** — 5 minutes
- **Extended Case** — 10 minutes (Pro only)

### 3. Teleprompter
Users load or generate a script, configure scroll speed and font size, then record themselves reading it. The AI analyses delivery and also performs a script adherence diff — showing what was read as written, what was ad-libbed, and what was skipped — with coaching on whether departures helped or hurt.

### 4. Interview Practice
Users configure an interview session (type, level, industry, focus area, question count). The AI generates a calibrated question set. Users record answers sequentially, with optional think time before each answer. The debrief includes per-answer scores (STAR structure, relevance, specificity, confidence, conciseness) and a model answer structural guide for each question, plus an aggregate session debrief.

---

## Target Users

**Primary:**
- Executives and senior leaders preparing for board presentations, media appearances, or stakeholder meetings
- Presenters and public speakers rehearsing keynotes or conference talks
- Sales and BD professionals refining pitches and client conversations

**Secondary:**
- Media professionals and journalists preparing for on-camera or on-air delivery
- Legal professionals preparing for advocacy, depositions, or tribunal appearances
- Professionals actively interviewing for senior roles

---

## Positioning

Gravi competes with Orai and Yoodli in the speech coaching category but differentiates on:

1. **Professional positioning** — designed for senior professionals, not general audiences
2. **Four distinct modes** — no competitor combines speech coaching, debate practice, teleprompter rehearsal, and interview prep in one product
3. **Deepgram audio metadata** — pacing, WPM, and filler word scores are real audio measurements, not text inference
4. **Script adherence analysis** — unique to the teleprompter mode; no competitor offers this
5. **Interview coaching with STAR scoring** — structured feedback on answer frameworks

---

## Business Model

- **Free tier:** 3 sessions total, limited features
- **Pro tier:** £9.99/month or £89/year — unlimited sessions, all modes, full history
- **Future:** Teams tier for corporate comms training
```

---

### 02_USER_PERSONAS.md

```markdown
# User Personas

## Persona 1 — The Executive

**Name:** Marcus, 47  
**Role:** Chief Operating Officer, financial services firm  
**Location:** London  

**Goals:**
- Improve fluency and authority in board presentations
- Reduce reliance on notes and scripts
- Sound more natural in media interviews

**Pain points:**
- No time for formal coaching
- Self-conscious about filler words he knows he overuses
- Doesn't know how he sounds to others

**Behaviour:**
- Practises at 6am before work or on Sunday evenings
- Would pay for a premium tool if it felt serious and discreet
- Needs fast, specific feedback — not generic encouragement

**Modes used most:** Record & Analyse, Teleprompter  
**Subscription:** Pro

---

## Persona 2 — The Presenter

**Name:** Priya, 34  
**Role:** Head of Strategy & Comms, tech scale-up  
**Location:** Manchester  

**Goals:**
- Prepare for a TEDx talk she's been invited to give
- Reduce vocal filler and improve pacing
- Build confidence in large-room delivery

**Pain points:**
- Knows her content but feels her delivery lets her down
- Finds it hard to evaluate herself objectively
- Has tried recording herself on her phone but gets no useful feedback

**Behaviour:**
- Would practise daily in 15-minute sessions during lunch
- Values written feedback she can read back

**Modes used most:** Record & Analyse, Teleprompter, Debate Arena  
**Subscription:** Pro

---

## Persona 3 — The Job Seeker

**Name:** James, 29  
**Role:** Senior Manager, moving from consulting to tech  
**Location:** Edinburgh  

**Goals:**
- Prepare for C-suite level interviews at tech companies
- Improve STAR answer structure
- Sound confident and specific rather than vague

**Pain points:**
- Has had feedback that his answers are "too long" and "lack specifics"
- Doesn't know which questions to prepare for
- Hates role-playing with friends — wants a private space

**Behaviour:**
- Would do 3–5 interview practice sessions per week in the run-up to interviews
- Highly motivated by specific, actionable feedback

**Modes used most:** Interview Practice  
**Subscription:** Pro (short-term, high-intensity use)

---

## Persona 4 — The Debater

**Name:** Amara, 41  
**Role:** Policy Director, public sector  
**Location:** London  

**Goals:**
- Sharpen argumentation skills for parliamentary committees and media appearances
- Learn to anticipate counterarguments more effectively
- Build rhetorical confidence

**Pain points:**
- Strong thinker but sometimes struggles to land arguments concisely under pressure
- Wants to practise controversial topics without an audience

**Behaviour:**
- Would use Debate Arena 2–3 times per week
- Interested in practising both sides of contentious policy topics

**Modes used most:** Debate Arena  
**Subscription:** Pro
```

---

### 03_USER_FLOWS.md

```markdown
# User Flows

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

Interview Debrief (/app/interview/:sessionId/debrief)
  → Overall score gauge (purple)
  → Strongest and weakest answer callouts
  → Aggregate 3 strengths + 3 improvements + narrative paragraph
  → Per-answer collapsible cards (first expanded by default):
      Score breakdown: STAR / Relevance / Specificity / Confidence / Conciseness
      Filler words
      Transcript (collapsible)
      AI feedback: what worked / improve
      Model Answer Guide (gold left border card)
      Audio playback
  → Bottom actions:
      "Practice again — same questions"
      "Change settings — new questions"
      "Download full transcript (.txt)"
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
```

---

### 04_SCREEN_SPECS.md

```markdown
# Screen Specifications

## Navigation Structure

### Desktop Sidebar (240px fixed)

**Practice group:**
- 🏠 Home → /app
- 🎙 Record & Analyse → /app/record
- ⚔️ Debate Arena → /app/debate
- 📜 Teleprompter → /app/teleprompter
- 🎯 Interview Practice → /app/interview

**Review group:**
- 📊 Speech DNA → /app/analytics
- 📚 Vocabulary Library → /app/vocabulary

**Tools group:**
- 📁 Script Library → /app/scripts
- ⚙️ Settings → /app/settings

### Mobile Bottom Tab Bar (5 tabs max)
Home · Record · Debate · Interview · More (reveals settings/vocabulary/scripts)

---

## Screen: Dashboard (/app)

**Purpose:** Home screen after login. Shows progress, quick actions, and recent sessions.

**Sections:**
1. Time-of-day greeting — "Good morning / afternoon / evening, [First Name]" (Cormorant Garamond, large)
2. Quick actions (2×2 grid on mobile, 4-card row on desktop):
   - "Record a Speech" → /app/record
   - "Enter Debate Arena" → /app/debate
   - "Practice Interview" → /app/interview
   - "Use Teleprompter" → /app/teleprompter
3. Overall Confidence Score — circular gold gauge, 0–100, label beneath, trend note
4. Recent Sessions — last 5: title, mode badge (colour-coded), date, score, replay icon
5. Stat strip — Total sessions · Total minutes · Best score · Current streak
6. Empty state (new users) — illustrated prompt + "Record now →" CTA

---

## Screen: Record & Analyse (/app/record)

**Purpose:** Entry point for speech recording. Three tabs.

**Tab 1 — Upload Audio:**
- Drag-and-drop zone (dashed border)
- "Browse files" link
- Format hint: "Accepts .mp3, .wav, .m4a, .webm, .ogg"
- After selection: filename, size, estimated duration
- Optional topic field: "What is this speech about?"
- "Analyse Speech" gold button

**Tab 2 — Record Live:**
- Microphone permission request (if needed)
- Large circular record button (red idle, gold pulsing when active)
- Full-width animated gold waveform when recording
- Timer (00:00 counting up)
- Optional expandable topic field
- "Stop Recording" button replaces record button

**Tab 3 — Free Practice:**
- Topic prompt card showing one prompt
- "Refresh ↺" link (cycles 20+ prompts, no API)
- Same record UI below prompt card

**Processing overlay (all tabs):**
- Gravi logo small at top
- Step labels cycling: Transcribing → Analysing → Generating feedback
- "This usually takes 15–30 seconds"
- Block navigation during processing (warn on back)

---

## Screen: Session Debrief (/app/session/:id)

**Purpose:** Primary output screen. Most important screen in the product.

**Shared header:**
- Back link
- Session title (Cormorant Garamond)
- Badges row: Mode · Date · Duration
- Debate: Position badge inline

**Speech/Free/Upload/Live mode sections (in order):**
1. Hero gauge — "Confidence Score", 0–100, gold, trend note
2. Speech DNA grid — 2×3 cards (Clarity, Confidence, Persuasion, Vocal Variety, Pacing, Conciseness). Each: score, gold bar, one-line Claude descriptor
3. Filler Words panel — count, severity badge, word breakdown, vs user average
4. Transcript (collapsible) — filler words amber, strong vocab gold
5. AI Coaching — 2-column (✅ What worked / 💛 Improve) + narrative paragraph
6. Vocabulary Upgrade — 5 word cards with save button
7. Audio Playback — scrubber, play/pause, 0.75×/1×/1.25×/1.5× speed
8. Actions — "Practice again with this topic" · "Download transcript (.txt)"

**Teleprompter mode adds Script Adherence section (between DNA grid and Filler Words):**
- % match badge (gold ≥80%, amber 60–79%, red <60%)
- Adherence coaching note from Claude
- Script diff panel (collapsible): green = match, amber = adlib, red = skip, gold = effective adlib
- Insight: note on whether departures helped or hurt

**Debate mode replaces DNA grid with Argument Strength panel:**
- 6 debate metrics: Argument Strength / Logical Flow / Evidence Use / Counterargument Anticipation / Conviction / Rhetorical Strength
- Each: score, gold bar, one-line descriptor
- Delivery panel (collapsible secondary): Clarity · Pacing · Confidence
- Transcript: persuasive phrases highlighted gold
- Debate Coaching tabs: Argument / Delivery / Language
- Persuasive Phrases panel: flagged quotes with rhetorical note
- Actions: "Debate Again — Opposite Position" · "Try a New Topic" · "Download transcript"

---

## Screen: Debate Arena — Entry (/app/debate)

**Purpose:** Entry point for debate mode. Two paths.

**Header:** "Debate Arena" (Cormorant Garamond) + subtitle
**Two entry cards (equal weight):**
- Browse Topics → scrolls to topic library grid
- Suggest a Topic → expands inline AI suggestion panel

**Topic library grid:**
- Search bar + category chips + difficulty filter
- Topic cards: title, category badge, difficulty badge (green/amber/red), FOR/AGAINST summaries, "Start Debate →"
- Free tier: topics 3–10 locked

**AI suggestion panel:**
- Role pre-filled
- Optional subject area field
- "Generate Topics" → 3 result cards with ✨ badge

---

## Screen: Position Selection (/app/debate/:topicId)

**Purpose:** Choose position and format before recording.

- Back link
- Topic title (Cormorant Garamond, large)
- 3 position cards (full width, stacked):
  - FOR (blue left border): badge + "Argue in favour" + FOR summary
  - AGAINST (red left border): badge + "Argue against" + AGAINST summary
  - NEUTRAL (gold left border): badge + "Present both sides" + description
- Format chips: Impromptu 2min / Structured 5min / Extended 10min (Pro)
- "Begin Debate →" CTA (disabled until both selected)

---

## Screen: Debate Recording

**Purpose:** Full-screen recording environment.

- No nav/sidebar
- Top bar: back arrow (with confirm modal) · topic (truncated) · position badge
- Argument prompts (ghost text panel, dismissible): 4 structural hints
- Timer: counts up / target shown muted
- Record button (centre, pulsing when active)
- Gold waveform (visible when recording)
- "Stop & Analyse" button (appears after recording starts)
- 3-second countdown before recording begins

---

## Screen: Teleprompter Setup (/app/teleprompter)

**Purpose:** Configure and load script before recording.

**Step 1 — Script Selection tabs:**
- Load from Library · Paste Text · Generate Script
- Live word count + estimated speaking time on paste/generate
- "Continue to Setup →" CTA

**Step 2 — Setup panel:**
- Script preview (right/above)
- Font size: Small / Medium / Large
- Scroll speed: Slow / Medium / Fast (labelled with WPM targets)
- Scroll mode: Auto / Manual
- Read-through mode checkbox
- Mirror text toggle
- "Start Recording →" CTA

---

## Screen: Teleprompter Recording

**Purpose:** Full-screen teleprompter with simultaneous audio recording.

- No nav/sidebar
- Status bar: elapsed / target time
- Speed controls (▲/▼) top-right
- Script area: current section = 100% white, previous = 60% opacity, upcoming = 70% opacity
- Record indicator: red dot + timer + mini waveform (bottom-right corner)
- "Stop & Analyse" button (bottom-centre, appears after 3 seconds)
- Auto-scroll: pauses on tap, resumes on tap
- Manual scroll: spacebar / arrows / tap half-screen

---

## Screen: Interview Setup (/app/interview)

**Purpose:** Configure interview session parameters.

- Header: "Interview Practice" (Cormorant Garamond) + purple badge
- Single scrollable form:
  - Interview Type chips: Behavioural / Competency / Strength / Mixed
  - Role Level chips: Junior / Mid / Senior / Executive / Board
  - Industry dropdown (optional)
  - Focus Area chips (optional)
  - Question count chips: 3 / 5 / 8
- "Generate Questions & Start →" gold CTA

---

## Screen: Interview Session (/app/interview/:sessionId)

**Purpose:** Sequential question-and-answer recording flow.

- No sidebar/nav — full focus
- Progress indicator: "Question N of N" pill (top)
- Question text (Cormorant Garamond, large)
- "What's being tested" expandable (muted)
- Suggested duration note
- Think time option: "Take 30 seconds to think" or "Skip — record now"
- Purple record button, gold waveform, live timer
- "Done — Next Question →" (appears after 20s) / "Done — Finish Interview →" (last)
- 3-second transition screen between questions: "Answer saved ✓ · Next: Q N of N"
- End: processing overlay → redirect to debrief

---

## Screen: Interview Debrief (/app/interview/:sessionId/debrief)

**Purpose:** Comprehensive multi-answer debrief.

- Header: "Interview Debrief" (Cormorant Garamond) + purple badge + date + total duration
- Overall score gauge (purple gradient) + strongest/weakest answer callouts
- Aggregate: 3 strengths + 3 improvements + narrative paragraph
- Per-answer cards (collapsible, first expanded):
  - Header: question text + score badge
  - Score mini-bars: STAR / Relevance / Specificity / Confidence / Conciseness
  - Filler words count + breakdown
  - Transcript (collapsible, filler in amber)
  - AI feedback: 2 columns
  - Model Answer Guide: gold left border card with structural coaching
  - Audio playback
- Bottom actions: practice same questions / change settings / download transcript
```

---

### 05_DATABASE_SCHEMA.md

```markdown
# Database Schema

Platform: Supabase (PostgreSQL)

## Tables Overview

| Table | Purpose |
|---|---|
| users | Extended user profile (linked to auth.users) |
| sessions | All practice sessions across all four modes |
| analysis | AI analysis results (mode-specific nullable fields) |
| scripts | User-saved scripts for teleprompter and script library |
| debate_topics | Seed library of debate topics (public read) |
| interview_sessions | One row per interview practice attempt |
| interview_answers | One row per question answered within an interview session |
| vocabulary | Words saved by users from session debriefs |

---

## Full SQL

```sql
-- ============================================================
-- USERS
-- ============================================================
create table users (
  id uuid primary key references auth.users(id),
  email text unique not null,
  full_name text,
  role text check (role in ('executive','presenter','media','sales','legal','other')),
  language text default 'en',
  subscription_status text default 'free' check (subscription_status in ('free','pro')),
  stripe_customer_id text,
  onboarding_complete boolean default false,
  goals_json jsonb,          -- array of selected goal strings from onboarding step 3
  created_at timestamptz default now()
);

-- ============================================================
-- SESSIONS
-- Covers all four modes: upload, live, free, teleprompter, debate, interview
-- ============================================================
create table sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  mode text check (mode in ('upload','live','free','teleprompter','debate','interview')),
  topic text,
  transcript text,
  script_used text,            -- teleprompter mode: the script text used
  duration_seconds int,
  audio_url text,              -- signed Supabase Storage URL, audio only
  language text default 'en',
  -- Deepgram audio metadata
  audio_metadata_json jsonb,   -- { wpm, pause_count, pause_durations_ms[], filler_words:{} }
  -- Debate-specific
  debate_position text check (debate_position in ('for','against','neutral') or debate_position is null),
  debate_topic_id uuid,        -- FK to debate_topics (or null if AI-generated)
  -- Teleprompter-specific
  script_adherence_pct int,    -- 0–100, null for non-teleprompter
  -- Interview-specific
  interview_session_id uuid,   -- FK to interview_sessions, null for non-interview
  created_at timestamptz default now()
);

-- ============================================================
-- ANALYSIS
-- Shared table for all modes. Mode-specific fields are nullable.
-- ============================================================
create table analysis (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,

  -- Core metrics (all non-interview modes)
  clarity_score int,           -- 0–100
  confidence_score int,
  persuasion_score int,
  vocal_variety_score int,
  pacing_score int,
  conciseness_score int,
  overall_score int,
  filler_word_count int,
  filler_words_json jsonb,     -- { "um": 4, "uh": 2, "like": 6 }
  strengths_json jsonb,        -- ["strength 1", "strength 2", "strength 3"]
  improvements_json jsonb,
  suggested_words_json jsonb,  -- [{ word, pos, definition, example }]
  full_feedback text,          -- narrative coaching paragraph

  -- Teleprompter-specific (null for other modes)
  script_adherence_pct int,
  script_diff_json jsonb,      -- [{ word, status: "match"|"skip"|"adlib" }]
  adherence_feedback text,
  notable_adlibs_json jsonb,   -- [{ phrase, note }]

  -- Debate-specific (null for non-debate modes)
  argument_strength_score int,
  logical_flow_score int,
  evidence_use_score int,
  counterargument_score int,
  conviction_score int,
  rhetorical_strength_score int,
  argument_feedback text,
  delivery_feedback text,
  language_feedback text,
  persuasive_phrases_json jsonb, -- [{ phrase, note }]

  created_at timestamptz default now()
);

-- ============================================================
-- SCRIPTS
-- ============================================================
create table scripts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  title text not null,
  content text not null,
  occasion text,               -- pitch, keynote, toast, etc.
  language text default 'en',
  is_favourite boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- DEBATE TOPICS (seed data, no RLS, publicly readable)
-- ============================================================
create table debate_topics (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text check (category in (
    'business','technology','leadership','ethics',
    'economics','society','innovation','philosophy','startups'
  )),
  difficulty text check (difficulty in ('beginner','intermediate','advanced')),
  for_position_summary text,
  against_position_summary text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ============================================================
-- INTERVIEW SESSIONS
-- ============================================================
create table interview_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  interview_type text check (interview_type in ('behavioural','competency','strength','mixed')),
  role_level text check (role_level in ('junior','mid','senior','executive','board')),
  industry text,
  focus_area text,
  question_count int,
  questions_json jsonb,        -- [{ question_text, what_interviewer_tests, suggested_duration_seconds, framework_hint }]
  overall_score int,
  strongest_answer_index int,
  weakest_answer_index int,
  aggregate_feedback text,
  top_improvements_json jsonb, -- ["improvement 1", "improvement 2", "improvement 3"]
  completed boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- INTERVIEW ANSWERS (one row per question per session)
-- ============================================================
create table interview_answers (
  id uuid primary key default gen_random_uuid(),
  interview_session_id uuid references interview_sessions(id) on delete cascade,
  question_index int not null,
  question_text text,
  transcript text,
  audio_url text,
  duration_seconds int,
  audio_metadata_json jsonb,
  overall_score int,
  star_structure_score int,
  answer_relevance_score int,
  specificity_score int,
  confidence_score int,
  conciseness_score int,
  filler_word_count int,
  filler_words_json jsonb,
  strengths_json jsonb,
  improvements_json jsonb,
  model_answer_guide text,
  created_at timestamptz default now()
);

-- ============================================================
-- VOCABULARY
-- ============================================================
create table vocabulary (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  word text not null,
  definition text,
  example text,
  source_session_id uuid references sessions(id),
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table users enable row level security;
alter table sessions enable row level security;
alter table analysis enable row level security;
alter table scripts enable row level security;
alter table vocabulary enable row level security;
alter table interview_sessions enable row level security;
alter table interview_answers enable row level security;

create policy "own users" on users
  for all using (auth.uid() = id);

create policy "own sessions" on sessions
  for all using (auth.uid() = user_id);

create policy "own analysis" on analysis
  for all using (
    session_id in (select id from sessions where user_id = auth.uid())
  );

create policy "own scripts" on scripts
  for all using (auth.uid() = user_id);

create policy "own vocabulary" on vocabulary
  for all using (auth.uid() = user_id);

create policy "own interview_sessions" on interview_sessions
  for all using (auth.uid() = user_id);

create policy "own interview_answers" on interview_answers
  for all using (
    interview_session_id in (
      select id from interview_sessions where user_id = auth.uid()
    )
  );

-- ============================================================
-- SEED: DEBATE TOPICS
-- ============================================================
insert into debate_topics (title, category, difficulty, for_position_summary, against_position_summary) values
('AI will eliminate more jobs than it creates', 'technology', 'intermediate',
 'Automation displaces workers faster than new roles emerge',
 'Technology historically creates more jobs than it destroys'),
('Remote work makes teams less effective', 'business', 'beginner',
 'Collaboration, culture, and innovation suffer without physical proximity',
 'Autonomy and reduced commuting improve productivity and retention'),
('Four-day work weeks should be standard', 'business', 'beginner',
 'Same output in less time improves wellbeing and attracts talent',
 'Many industries and roles cannot function on compressed schedules'),
('Social media does more harm than good', 'society', 'beginner',
 'Mental health damage and misinformation outweigh connectivity benefits',
 'Access to community, information, and economic opportunity is transformative'),
('Companies have a duty to prioritise ESG over profit', 'ethics', 'intermediate',
 'Long-term sustainability requires internalising social and environmental costs',
 'Profit maximisation within the law produces the best social outcomes'),
('Crypto will transform global finance', 'technology', 'advanced',
 'Decentralisation and programmable money will reshape financial systems',
 'Volatility, regulation risk, and energy costs prevent mainstream adoption'),
('Universities are no longer worth the investment', 'society', 'intermediate',
 'Alternatives like bootcamps deliver better ROI for most careers',
 'Network, signalling, and depth of university education cannot be replicated'),
('Leaders are born, not made', 'leadership', 'beginner',
 'Innate traits like charisma and vision cannot be fully taught',
 'Leadership is a skill set developed through experience and coaching'),
('Startups should prioritise growth over profitability', 'startups', 'intermediate',
 'Capturing market share early creates defensible moats',
 'Growth at all costs destroys value and exposes companies in downturns'),
('Open borders would benefit the global economy', 'economics', 'advanced',
 'Labour mobility reduces inequality and corrects demographic imbalances',
 'Social cohesion and public services face unsustainable pressure without controls');

-- ============================================================
-- STORAGE: Audio bucket (run via Supabase dashboard or CLI)
-- ============================================================
-- Create private bucket: gravi-audio
-- Enable RLS on storage.objects
-- Policy: authenticated users can upload/read their own files
-- Path convention: {user_id}/{session_id}.{ext} or {user_id}/interview/{session_id}/{question_index}.{ext}

-- ============================================================
-- SCHEDULED FUNCTION: 30-day audio cleanup
-- ============================================================
-- Supabase Edge Function: cleanup-audio
-- Schedule: daily at 02:00 UTC
-- Logic: SELECT audio_url FROM sessions WHERE created_at < now() - interval '30 days'
--        + SELECT audio_url FROM interview_answers WHERE created_at < now() - interval '30 days'
--        For each URL: delete from storage.objects
```
```

---

### 06_TECH_STACK.md

```markdown
# Tech Stack

## Overview

| Layer | Technology | Rationale |
|---|---|---|
| Frontend | Vite + React 18 + TypeScript | Fast builds, excellent DX, strong typing |
| Styling | Tailwind CSS | Utility-first, consistent design tokens |
| Charts | Recharts | React-native charting, good Radial/Line chart support |
| Backend/DB | Supabase (PostgreSQL) | Auth + DB + Storage + Edge Functions in one platform |
| Auth | Supabase Auth | Email/password + Google OAuth, built-in RLS integration |
| Transcription | Deepgram Nova-2 | Returns real audio metadata (WPM, pauses, filler words) — not just text |
| AI Analysis | Anthropic Claude API (claude-sonnet-4-5 or latest) | Superior instruction following for structured JSON output |
| Payments | Stripe | Industry standard, excellent webhook support |
| Transactional Email | Resend | Clean API, good deliverability, works well with Supabase |
| Deployment | Vercel | Optimal for Vite/React, easy environment variable management |

---

## Frontend Details

**Framework:** Vite + React 18 + TypeScript
- Vite for fast hot module replacement during development
- React 18 for concurrent rendering
- TypeScript for type safety across the full codebase

**Styling:** Tailwind CSS
- CSS variables for design tokens (see 08_DESIGN_SYSTEM.md)
- No CSS-in-JS — Tailwind only

**Key packages:**
- `@supabase/supabase-js` — Supabase client
- `recharts` — analytics charts (RadialBarChart for score gauges, LineChart for trends)
- `react-hot-toast` — toast notifications
- `react-router-dom` v6 — client-side routing
- `wavesurfer.js` or `Web Audio API` — waveform visualisation during recording
- `diff` or custom LCS implementation — script adherence diff for teleprompter

**Audio recording:**
- Browser `MediaRecorder API` — captures audio in supported formats
- Fallback: check browser support, show graceful error if not supported
- Output format: `.webm` (Chrome/Firefox) or `.mp4` (Safari) — both accepted by Deepgram

---

## Backend Details

**Supabase Edge Functions (Deno runtime):**
All API calls to Deepgram, Claude, and Stripe are made server-side via edge functions. API keys are never exposed to the client.

| Edge Function | Trigger | Purpose |
|---|---|---|
| transcribe | HTTP POST | Deepgram transcription + metadata |
| analyse-speech | HTTP POST | Claude speech analysis → JSON |
| analyse-teleprompter | HTTP POST | Speech analysis + LCS script diff |
| analyse-debate | HTTP POST | Claude debate analysis → JSON |
| generate-interview-questions | HTTP POST | Claude question generation → JSON array |
| analyse-interview-answer | HTTP POST | Claude per-answer scoring → JSON |
| generate-aggregate-interview-feedback | HTTP POST | Claude aggregate interview feedback |
| generate-script | HTTP POST | Claude script writing |
| suggest-debate-topics | HTTP POST | Claude topic suggestions |
| create-checkout | HTTP POST | Stripe checkout session |
| stripe-webhook | HTTP POST (Stripe) | Handle payment events, update subscription |
| cleanup-audio | Scheduled (daily) | Delete audio files older than 30 days |

---

## Why Deepgram over OpenAI Whisper

Whisper is transcription only — it returns text from audio. Deepgram returns:
- Full transcript (same as Whisper)
- Word-level timestamps (allows WPM calculation per segment)
- Pause detection (duration and placement of silences)
- Automatic filler word detection (`um`, `uh`, `like`, `you know`) with counts
- Speaking rate in words per minute

This means Gravi's Pacing, Vocal Variety, and Filler Word scores are derived from actual audio measurements, not inferred from the transcript text. This is a meaningful quality difference in the coaching debrief.

**Deepgram model to use:** `nova-2` with params `filler_words=true&utterances=true&punctuate=true`

---

## Environment Variables Required

```
SUPABASE_URL=
SUPABASE_ANON_KEY=           # client-safe
SUPABASE_SERVICE_ROLE_KEY=   # server-only (edge functions)
DEEPGRAM_API_KEY=            # server-only (edge functions)
ANTHROPIC_API_KEY=           # server-only (edge functions)
STRIPE_SECRET_KEY=           # server-only (edge functions)
STRIPE_WEBHOOK_SECRET=       # server-only (edge functions)
STRIPE_PRO_MONTHLY_PRICE_ID=
STRIPE_PRO_ANNUAL_PRICE_ID=
RESEND_API_KEY=              # server-only (edge functions)
```

Never expose `SERVICE_ROLE_KEY`, `DEEPGRAM_API_KEY`, `ANTHROPIC_API_KEY`, or `STRIPE_SECRET_KEY` in client-side code.
```

---

### 07_API_CONTRACTS.md

```markdown
# API Contracts — Supabase Edge Functions

All edge functions are called via authenticated POST requests from the Gravi frontend. Every function validates the user's JWT before processing.

---

## `transcribe`

**Input:**
```json
{ "audioUrl": "string", "language": "en" }
```

**Deepgram call:**
```typescript
const response = await fetch(
  'https://api.deepgram.com/v1/listen?model=nova-2&filler_words=true&utterances=true&punctuate=true',
  {
    method: 'POST',
    headers: { 'Authorization': `Token ${DEEPGRAM_API_KEY}`, 'Content-Type': 'audio/wav' },
    body: audioBuffer
  }
);
```

**Output:**
```json
{
  "transcript": "string",
  "words": [{ "word": "string", "start": 0.0, "end": 0.0, "confidence": 0.0 }],
  "wpm": 145,
  "pause_count": 8,
  "pause_durations_ms": [320, 480, 210],
  "filler_words": { "um": 4, "uh": 2, "like": 6 },
  "duration_seconds": 187
}
```

---

## `analyse-speech`

**Input:**
```json
{
  "transcript": "string",
  "audioMetadata": { "wpm": 145, "pause_count": 8, "filler_words": {}, "duration_seconds": 187 },
  "sessionId": "uuid",
  "userRole": "executive",
  "mode": "live",
  "topic": "optional string"
}
```

**Claude system prompt:**
```
You are an expert communication coach for senior professionals.
Analyse this speech transcript alongside the audio metadata provided.
Use the audio metadata (WPM, pauses, filler word count from Deepgram) to inform your
pacing, vocal variety, and filler word scores — these are real measurements, not guesses.

Return ONLY valid JSON with no markdown, no preamble, no explanation:
{
  "clarity_score": 0-100,
  "confidence_score": 0-100,
  "persuasion_score": 0-100,
  "vocal_variety_score": 0-100,
  "pacing_score": 0-100,
  "conciseness_score": 0-100,
  "overall_score": 0-100,
  "filler_words": { "um": N, "uh": N, "like": N },
  "strengths": ["specific strength 1", "specific strength 2", "specific strength 3"],
  "improvements": ["specific improvement 1", "specific improvement 2", "specific improvement 3"],
  "suggested_words": [
    { "word": "...", "pos": "noun/verb/phrase", "definition": "...", "example": "..." }
  ],
  "full_feedback": "2-3 sentence narrative coaching paragraph"
}
Scores reflect executive-level standards. Reference actual content from the transcript in feedback.
```

**Output:** JSON as above, written to `analysis` table.

---

## `analyse-teleprompter`

**Input:** Same as `analyse-speech` plus:
```json
{ "script": "full script text as string" }
```

**Additional processing:** LCS/Levenshtein diff between `script` and `transcript`, word by word.

**Additional output fields:**
```json
{
  "script_adherence_pct": 84,
  "script_diff": [{ "word": "string", "status": "match|skip|adlib" }],
  "adherence_feedback": "string",
  "notable_adlibs": [{ "phrase": "string", "note": "why this was effective/ineffective" }]
}
```

---

## `analyse-debate`

**Input:**
```json
{
  "transcript": "string",
  "audioMetadata": {},
  "sessionId": "uuid",
  "userRole": "string",
  "position": "for|against|neutral",
  "topicTitle": "string",
  "forSummary": "string",
  "againstSummary": "string"
}
```

**Claude system prompt:**
```
You are an expert debate coach and rhetoric trainer for senior professionals.
The user argued the [position] position on: "[topicTitle]"
FOR position framing: [forSummary]
AGAINST position framing: [againstSummary]

Return ONLY valid JSON:
{
  "overall_score": 0-100,
  "argument_strength_score": 0-100,
  "logical_flow_score": 0-100,
  "evidence_use_score": 0-100,
  "counterargument_score": 0-100,
  "conviction_score": 0-100,
  "rhetorical_strength_score": 0-100,
  "clarity_score": 0-100,
  "pacing_score": 0-100,
  "confidence_score": 0-100,
  "argument_feedback": "string",
  "delivery_feedback": "string",
  "language_feedback": "string",
  "strengths": ["...", "...", "..."],
  "improvements": ["...", "...", "..."],
  "persuasive_phrases": [{ "phrase": "exact quote", "note": "rhetorical explanation" }],
  "suggested_words": [{ "word": "...", "pos": "...", "definition": "...", "example": "..." }]
}
```

---

## `generate-interview-questions`

**Input:**
```json
{
  "interviewType": "behavioural|competency|strength|mixed",
  "roleLevel": "junior|mid|senior|executive|board",
  "industry": "optional string",
  "focusArea": "optional string",
  "questionCount": 3,
  "userRole": "string"
}
```

**Claude system prompt:**
```
You are an expert executive recruiter and interview coach.
Generate [questionCount] interview questions tailored to the inputs.
Questions must be realistic, challenging, and calibrated to the role level.

Return ONLY a valid JSON array:
[
  {
    "question_text": "string",
    "what_interviewer_tests": "string",
    "suggested_duration_seconds": 90,
    "framework_hint": "STAR|CAR|direct"
  }
]
```

---

## `analyse-interview-answer`

**Input:**
```json
{
  "transcript": "string",
  "audioMetadata": {},
  "question": "string",
  "whatInterviewerTests": "string",
  "frameworkHint": "STAR",
  "sessionId": "uuid",
  "questionIndex": 0
}
```

**Claude system prompt:**
```
You are an expert executive recruiter and interview coach.
Question: "[question]"
What the interviewer is assessing: "[whatInterviewerTests]"
Expected framework: [frameworkHint]

Return ONLY valid JSON:
{
  "overall_score": 0-100,
  "star_structure_score": 0-100,
  "answer_relevance_score": 0-100,
  "specificity_score": 0-100,
  "confidence_score": 0-100,
  "conciseness_score": 0-100,
  "filler_words": { "um": N },
  "strengths": ["...", "...", "..."],
  "improvements": ["...", "...", "..."],
  "model_answer_guide": "A strong answer here would... [2-4 sentences of structural guidance, not a script]"
}
```

---

## `generate-aggregate-interview-feedback`

**Input:**
```json
{
  "answers": [ /* array of analyse-interview-answer outputs */ ],
  "interviewType": "string",
  "roleLevel": "string",
  "questions": [ /* array of question objects */ ]
}
```

**Output:**
```json
{
  "overall_score": 78,
  "strongest_answer_index": 2,
  "weakest_answer_index": 0,
  "aggregate_feedback": "string (2-3 sentences)",
  "top_improvements": ["improvement 1", "improvement 2", "improvement 3"]
}
```

---

## `generate-script`

**Input:**
```json
{
  "occasion": "pitch|keynote|toast|networking|board-update|conference|media-interview|other",
  "duration": "30s|1min|2min|3min|5min",
  "keyMessage": "string",
  "keyPoints": ["string"],
  "tone": "formal|professional|conversational|inspiring|authoritative",
  "language": "en|pt|es|fr"
}
```

**Word count targets:** 30s≈65w · 1min≈130w · 2min≈260w · 3min≈390w · 5min≈650w

**Output:** Speech text only. No title, no stage directions, no preamble.

---

## `suggest-debate-topics`

**Input:**
```json
{ "userRole": "string", "subjectArea": "optional string" }
```

**Output:**
```json
[
  { "title": "string", "category": "string", "for_summary": "string", "against_summary": "string" }
]
```
(Array of 3)

---

## `create-checkout`

**Input:**
```json
{ "priceId": "stripe_price_id", "successUrl": "string", "cancelUrl": "string" }
```

**Output:** `{ "checkoutUrl": "string" }`

---

## `stripe-webhook`

**Events handled:**
- `checkout.session.completed` → set `users.subscription_status = 'pro'`, store `stripe_customer_id`
- `customer.subscription.deleted` → set `users.subscription_status = 'free'`
```

---

### 08_DESIGN_SYSTEM.md

```markdown
# Design System

## Design Philosophy

Gravi looks and feels like a premium executive coaching service. The visual language is calm, authoritative, and focused. Nothing should distract from the content. The design earns trust before the user says a word.

**Tone:** Calm meets LinkedIn meets a high-end SaaS tool.  
**Anti-patterns:** No gamification badges. No confetti. No streaks. No cartoon mascots. No purple gradient on white (the default AI aesthetic). No generic fonts.

---

## Colour Palette

```css
:root {
  /* Backgrounds */
  --color-bg:              #0D0F14;   /* deep near-black — main background */
  --color-surface:         #141720;   /* card and panel surfaces */
  --color-border:          #1E2230;   /* subtle card borders */

  /* Brand accent */
  --color-gold:            #C9A84C;   /* primary accent — CTAs, scores, icons */
  --color-gold-light:      #E2C97E;   /* hover state of gold elements */

  /* Text */
  --color-text:            #F4F4F5;   /* primary text */
  --color-muted:           #8B8FA8;   /* secondary / helper text */

  /* Status */
  --color-success:         #4CAF7C;   /* positive indicators */
  --color-error:           #E05C5C;   /* errors and warnings */

  /* Mode accents (used exclusively for their respective modes) */
  --color-debate-for:      #4C8FC9;   /* Debate Arena — FOR position */
  --color-debate-against:  #C94C4C;   /* Debate Arena — AGAINST position */
  --color-interview:       #8B6FCB;   /* Interview Practice mode */
}
```

**Usage rules:**
- Gold is used only for CTAs, score values, key metrics, and active highlights
- Blue/red are used ONLY in the Debate Arena — never anywhere else
- Purple is used ONLY in the Interview Practice mode
- Never use white backgrounds — always `--color-bg` or `--color-surface`

---

## Typography

**Display / headings:** Cormorant Garamond (Google Fonts)
- Used for: page titles, session titles, score labels, hero copy
- Weight: 400 regular and 600 semibold
- Provides elegance and gravitas without being stuffy

**Body / UI:** DM Sans (Google Fonts)
- Used for: all body copy, labels, buttons, form fields, metadata
- Weight: 400 regular and 500 medium
- Clean and highly readable at small sizes

**Import:**
```html
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet">
```

**Type scale (approximate):**
- Page title: Cormorant Garamond 32–40px
- Section heading: Cormorant Garamond 22–28px
- Body: DM Sans 14–16px
- Label / badge: DM Sans 11–13px
- Stat numbers: Cormorant Garamond 48–64px (score gauges)

---

## Component Principles

**Cards:**
- Background: `--color-surface`
- Border: `1px solid var(--color-border)`
- Border radius: `12px`
- No heavy drop shadows — border contrast creates depth
- Hover: border becomes slightly lighter or gold-tinted on interactive cards

**Buttons:**
- Primary: gold background, dark text, `border-radius: 8px`
- Ghost / secondary: transparent background, gold border, gold text
- Destructive: error red
- Disabled: 40% opacity, no hover effect

**Progress bars / score bars:**
- Track: `--color-border`
- Fill: `--color-gold`
- Height: 4–6px, `border-radius: 999px`

**Badges / chips:**
- Small pill shape, `border-radius: 999px`
- Coloured by context (mode badge = gold, debate position = blue/red, interview = purple, difficulty = green/amber/red)

**Score gauge:**
- Recharts `RadialBarChart`
- Background arc: `--color-border`
- Filled arc: gold gradient
- Score number centred in Cormorant Garamond (large)
- Label text in DM Sans (muted) beneath

---

## Animation Principles

- Page transitions: 150ms fade (`opacity 0 → 1`)
- Waveform: animated SVG bars or Web Audio API visualiser, gold colour, shown only when recording
- Skeleton loaders: pulse animation on placeholder shapes — never use spinners alone
- Score reveal: gauge arc animates from 0 to value on debrief load (500ms ease-out)
- Processing steps: step labels fade in sequentially

---

## Spacing System

Tailwind default spacing scale. Key values:
- `gap-4` (16px) between cards
- `p-6` (24px) card internal padding
- `gap-6` (24px) between major sections
- `px-8` (32px) page horizontal padding (desktop)
- `px-4` (16px) page horizontal padding (mobile)

---

## Responsive Breakpoints

- Mobile: <768px — single column, bottom tab bar
- Tablet: 768–1024px — sidebar collapses or slides out
- Desktop: >1024px — fixed 240px sidebar + content area

---

## Recording UI Standards

When recording is active, the following apply across ALL four modes:
- Animated gold waveform visible (reinforces that audio is being captured)
- Timer counting up clearly visible
- "Stop" / "Stop & Analyse" button must be clearly visible and tappable
- No accidental-tap protection except in Interview mode (20-second delay on "Done")
```

---

### 09_SUBSCRIPTION_AND_PRICING.md

```markdown
# Subscription and Pricing

## Plans

| Feature | Free | Pro |
|---|---|---|
| Price | £0 | £9.99/month or £89/year |
| Total sessions | 3 | Unlimited |
| Record & Analyse | ✓ All sub-modes | ✓ All sub-modes |
| Debate topics | 2 only | All 10+ |
| Debate Extended format (10 min) | ✗ | ✓ |
| AI debate topic suggestions | ✗ | ✓ |
| Teleprompter | ✗ | ✓ |
| Interview Practice | 1 session only | Unlimited |
| Speech DNA history | Last session only | Full history |
| Audio replay in debrief | ✗ | ✓ |
| Vocabulary library | ✗ | ✓ |
| PDF export (future) | ✗ | ✓ |

Annual plan saves 26% vs monthly (£89 vs £119.88).

---

## Stripe Setup

**Products and prices to create in Stripe dashboard:**
1. Product: "Gravi Pro" — Monthly price: £9.99 GBP recurring monthly
2. Product: "Gravi Pro" — Annual price: £89.00 GBP recurring yearly

Store price IDs in environment variables:
- `STRIPE_PRO_MONTHLY_PRICE_ID`
- `STRIPE_PRO_ANNUAL_PRICE_ID`

---

## Edge Functions

### `create-checkout`
- Receives: `{ priceId, successUrl, cancelUrl }`
- Creates Stripe Checkout Session with `mode: 'subscription'`
- Returns: `{ checkoutUrl }`
- Frontend redirects user to Stripe hosted page

### `stripe-webhook`
- Receives Stripe webhook events
- Validate using `STRIPE_WEBHOOK_SECRET`
- Handle `checkout.session.completed`:
  - Get `customer_email` from session
  - Update `users.subscription_status = 'pro'`
  - Store `users.stripe_customer_id`
- Handle `customer.subscription.deleted`:
  - Update `users.subscription_status = 'free'`

---

## Paywall Trigger Logic

**Trigger A — Session limit:**
After a free user completes their 3rd session, the debrief screen shows an upgrade banner above the bottom action buttons.
- Check: `select count(*) from sessions where user_id = auth.uid()` before allowing new session
- If count ≥ 3 and subscription_status = 'free': redirect to /app/upgrade instead of allowing recording

**Trigger B — Feature gate:**
Free user attempts to access a Pro-only feature:
- Teleprompter: clicking nav item or quick action → redirect to /app/upgrade
- Locked debate topics (3–10): clicking "Start Debate →" on locked topic → upgrade modal
- Debate Extended format: clicking "Extended Case" chip → upgrade modal
- AI topic suggestion: clicking "Get Suggestions →" → upgrade modal
- Interview Practice (2nd+ session): attempting to start → upgrade modal
- Audio replay: playback controls shown as locked in debrief → upgrade modal

**Upgrade modal copy:**
> "This is a Pro feature."  
> "Upgrade to Gravi Pro to unlock unlimited sessions, all debate topics, teleprompter, interview practice, and full coaching history."  
> [Upgrade Now] [Maybe later]

---

## Upgrade Page (/app/upgrade)

- Header: "Gravi Pro" (Cormorant Garamond)
- Monthly / Annual toggle (Annual highlighted with "Save 26%")
- Two plan cards side by side: Free (left) vs Pro (right, highlighted gold border)
- Full feature comparison checklist
- "Upgrade Now →" CTA on Pro card → calls `create-checkout`
- After Stripe success: success screen → redirect to /app with Pro badge on user avatar

---

## Billing Management

- "Manage billing" link in /app/settings → Stripe Customer Portal
- Users can: view invoices, change payment method, cancel subscription
- On cancellation: subscription remains active until end of billing period, then webhook fires and status reverts to free
```

---

### 10_IMPLEMENTATION_PHASES.md

```markdown
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
```

---

### 11_CONSTRAINTS_AND_DECISIONS.md

```markdown
# Constraints and Architecture Decisions

## Hard Constraints (V1)

### Audio only — no video
V1 contains no video recording, no video upload, no camera access, and no video playback. If a user uploads a `.mp4` or `.mov` file anywhere in the app, show a friendly inline message: *"Video support is coming soon. Please upload an audio file."*

Video is explicitly a future feature. Do not build any video infrastructure, even as a stub.

### API keys never exposed client-side
All calls to Deepgram, Anthropic Claude, and Stripe are made server-side via Supabase edge functions. The Supabase `anon` key (client-safe) is the only key that may appear in client-side code.

### Audio auto-deletion at 30 days
User audio files are stored in a private Supabase Storage bucket with signed URL access. A scheduled edge function (`cleanup-audio`) runs daily and deletes any audio file older than 30 days. This is a privacy and storage cost control measure.

### Interview debrief is a separate route
The interview debrief (`/app/interview/:sessionId/debrief`) is a separate component from the standard session debrief (`/app/session/:id`). Do not try to merge them. The interview debrief handles multiple answer objects; the session debrief handles a single analysis object.

### Interview recordings are individual files
Each answer in an interview session is a separate audio file uploaded to Supabase Storage at: `{user_id}/interview/{interview_session_id}/{question_index}.{ext}`. Do not concatenate or merge audio files.

---

## Architecture Decisions

### Why Supabase over a custom backend
Supabase provides auth, PostgreSQL, storage, and edge functions in a single platform. For a solo build, this eliminates the need to manage a separate server, reduces operational overhead, and keeps infrastructure costs low until scale demands otherwise.

### Why Deepgram over OpenAI Whisper
Whisper provides text only. Deepgram provides text plus word timestamps, WPM, pause detection, and filler word counts — all derived from actual audio signals. This allows Gravi to provide genuinely accurate pacing and filler word scores rather than Claude-inferred approximations from text alone.

### Why a single `analysis` table with nullable mode-specific columns
The alternative is separate tables per mode (`speech_analysis`, `debate_analysis`, etc.). The single-table approach was chosen because:
1. All modes share a common set of core metrics (clarity, confidence, pacing, etc.)
2. The session history table and analytics page query analysis across all modes
3. Fewer joins, simpler queries, simpler RLS
Mode-specific fields are nullable and clearly documented in the schema.

### Why Cormorant Garamond + DM Sans
Cormorant Garamond provides editorial authority and visual distinction — it signals that Gravi is not another generic SaaS tool. DM Sans provides excellent readability at small sizes and a clean counterweight to the display font. The pairing communicates both sophistication and usability.

### Why a single debrief route for speech/debate/teleprompter
These three modes share the same general structure: one audio file, one transcript, one analysis object. The debrief renders different sections based on `session.mode`. This avoids duplicating layout code for three routes that are 70% identical.

### Why interview questions are generated dynamically (not from a static bank)
Static question banks become stale, feel repetitive, and require ongoing editorial maintenance. Dynamic generation via Claude means:
- Questions are always contextually appropriate to the user's role level and industry
- Each session feels fresh even if repeated
- No editorial overhead

### Free tier limits rationale
- 3 sessions total (not per week): creates immediate urgency to convert — users experience the full debrief once or twice and hit the wall
- 2 debate topics: gives a taste of the mode without unlocking the full library
- 1 interview session: allows a full experience before requiring Pro

---

## Known V1 Omissions (Planned for V2+)

| Feature | Reason deferred |
|---|---|
| Video recording/analysis | Significant complexity in WebRTC, storage costs, and analysis pipeline |
| PDF export of debrief | Requires server-side PDF rendering; valuable but not critical for V1 |
| Teams / corporate tier | Needs org management, team dashboard, billing complexity |
| Real-time session sharing | Requires WebSocket infrastructure |
| Custom debate topic upload | Edge case for V1; AI suggestion covers the need |
| Integrations (Zoom, Google Meet) | Significant scope; post-validation roadmap item |
| Multi-language analysis | Deepgram and Claude both support multiple languages; UI localisation deferred |
| Mobile app (iOS/Android) | PWA first, native wrapper (Capacitor) in V2 |
```

---

## INSTRUCTIONS FOR CLAUDE CODE

After generating all file contents above, execute the following:

1. Create the directory `C:\Users\aline\Desktop\Gravi\DOCS\` if it does not already exist
2. Write each of the 12 files listed at the top of this prompt to that directory
3. Use the exact filenames specified (00_README.md through 11_CONSTRAINTS_AND_DECISIONS.md)
4. Each file must be complete — do not truncate any section
5. After writing all files, print a summary:
   ```
   ✓ DOCS folder created at C:\Users\aline\Desktop\Gravi\DOCS\
   ✓ 12 files written:
     - 00_README.md
     - 01_PRODUCT_OVERVIEW.md
     - 02_USER_PERSONAS.md
     - 03_USER_FLOWS.md
     - 04_SCREEN_SPECS.md
     - 05_DATABASE_SCHEMA.md
     - 06_TECH_STACK.md
     - 07_API_CONTRACTS.md
     - 08_DESIGN_SYSTEM.md
     - 09_SUBSCRIPTION_AND_PRICING.md
     - 10_IMPLEMENTATION_PHASES.md
     - 11_CONSTRAINTS_AND_DECISIONS.md
   Total: ~[X] lines of documentation
   ```

Do not ask for confirmation. Write all files immediately.
